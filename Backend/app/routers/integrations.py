from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from urllib.parse import urlencode
import os
import requests
import secrets
import hashlib
import base64
import logging

from app.core.mysql_database import get_db
from app.models.integration import Integration
from app.models.user import User

# This lets us verify a user via query parameters during the OAuth redirect
from app.core.auth import verify_token

router = APIRouter(prefix="/api/integrations", tags=["Integrations (OAuth)"])

from app.core.config import settings

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
# No more global constants here, use settings directly to avoid stale values

def get_user_from_token(token: str, db: Session) -> User:
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


from app.core.auth import get_current_user, create_access_token

@router.get("/{platform}/auth")
def oauth_login(
    platform: str, 
    request: Request,
    token: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Step 1 of OAuth. Redirect the user to the third-party authorization page.
    The user JWT is passed as `?token=` query parameter (browser redirect cannot set headers).
    The same token is forwarded as the OAuth `state` parameter so we can identify the user on callback.
    """
    # Validate the token before starting the OAuth flow
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if platform == "youtube":
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            raise HTTPException(status_code=500, detail="Google OAuth credentials missing in backend")

        # Scopes required to read YouTube analytics & data
        scopes = "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly"
        
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": scopes,
            "access_type": "offline",
            "prompt": "consent",
            "state": token
        }
        auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        return RedirectResponse(auth_url)
    
    elif platform == "linkedin":
        if not settings.LINKEDIN_CLIENT_ID or not settings.LINKEDIN_CLIENT_SECRET:
            raise HTTPException(status_code=500, detail="LinkedIn OAuth credentials missing in backend")

        # Minimal scopes for stability (Analytics requires manual portal enablement)
        scopes = "openid profile email w_member_social"
        
        params = {
            "response_type": "code",
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
            "state": token,
            "scope": scopes
        }
        
        auth_url = f"https://www.linkedin.com/oauth/v2/authorization?{urlencode(params)}"
        return RedirectResponse(auth_url)

    elif platform in ["twitter", "x"]:
        # Normalize to twitter for consistent logic/storage
        platform = "twitter"
        
        if not settings.TWITTER_CLIENT_ID or not settings.TWITTER_CLIENT_SECRET:
            raise HTTPException(status_code=500, detail="X (Twitter) OAuth credentials missing")

        # 1. Generate PKCE code_verifier (standard recommends 43-128 chars)
        code_verifier = secrets.token_urlsafe(96)
        
        # 2. Derive code_challenge (S256)
        hashed = hashlib.sha256(code_verifier.encode('ascii')).digest()
        code_challenge = base64.urlsafe_b64encode(hashed).decode('ascii').rstrip('=')
        
        # 3. Encode both user token AND code_verifier into the state parameter.
        # This is stateless and survives cross-domain redirects (no session needed).
        # Format: "<user_jwt>|<code_verifier>"
        state_param = f"{token}|{code_verifier}"
        logging.error(f"DEBUG: X Auth - Generated verifier, embedding in state.")
        
        scopes = "tweet.read users.read offline.access"
        params = {
            "response_type": "code",
            "client_id": settings.TWITTER_CLIENT_ID,
            "redirect_uri": settings.TWITTER_REDIRECT_URI,
            "state": state_param,
            "scope": scopes,
            "code_challenge": code_challenge,
            "code_challenge_method": "S256"
        }
        
        auth_url = f"https://twitter.com/i/oauth2/authorize?{urlencode(params)}"
        return RedirectResponse(auth_url)

    # Mock fallback for un-configured platforms (Meta)
    elif platform in ["facebook", "instagram"]:
        # Mock fallback for un-configured platforms (Meta)
        mock_auth_url = f"http://localhost:8000/api/integrations/{platform}/callback?code=mock_auth_code_123&state={token}"
        return RedirectResponse(mock_auth_url)
        
    raise HTTPException(status_code=400, detail="Unsupported platform")


@router.get("/{platform}/callback")
def oauth_callback(
    platform: str, 
    request: Request,
    code: str = Query(None), 
    state: str = Query(None), 
    error: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Step 2 of OAuth. Exchange the `code` for an `access_token` and save to DB.
    """
    # --- DEBUG MARKER ---
    with open("callback_hit.txt", "a") as f:
        f.write(f"{datetime.now()}: Hit for platform {platform}\n")
    # ------------------
    
    logging.error(f"DEBUG: oauth_callback platform={platform}, code={'yes' if code else 'no'}, state={'yes' if state else 'no'}, error={error}")
    if error:
        logging.error(f"DEBUG: callback error param: {error}")
        return RedirectResponse(f"{FRONTEND_URL}/dashboard/connected-accounts?error={error}")
    if not code or not state:
        logging.error(f"DEBUG: callback missing code or state")
        return RedirectResponse(f"{FRONTEND_URL}/dashboard/connected-accounts?error=missing_parameters")

    # 1. Parse the state parameter.
    # For Twitter/X, state is "<user_jwt>|<code_verifier>" (stateless PKCE).
    # For other platforms, state is just the user JWT.
    twitter_code_verifier = None
    if platform in ["twitter", "x"]:
        if "|" in state:
            user_token, twitter_code_verifier = state.split("|", 1)
        else:
            # Old format fallback — no verifier, will fail below
            user_token = state
    else:
        user_token = state

    try:
        user = get_user_from_token(token=user_token, db=db)
        logging.error(f"DEBUG: callback user identified: {user.id}")
    except Exception as e:
        logging.error(f"DEBUG: callback user verification failed: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/dashboard/connected-accounts?error=invalid_session")

    access_token = None
    refresh_token = None
    expires_at = None
    account_id = None

    # 2. Exchange code for tokens
    if platform == "youtube":
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.GOOGLE_REDIRECT_URI
        }
        resp = requests.post(token_url, data=data)
        if resp.status_code != 200:
            return RedirectResponse(f"{FRONTEND_URL}/dashboard/connected-accounts?error=token_exchange_failed")
        
        token_data = resp.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        
        # Optionally, hit the Google UserInfo API to get the specific Google Account ID
        userinfo_resp = requests.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={"Authorization": f"Bearer {access_token}"})
        if userinfo_resp.status_code == 200:
            account_id = userinfo_resp.json().get("id")

    elif platform == "linkedin":
        token_url = "https://www.linkedin.com/oauth/v2/accessToken"
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "client_secret": settings.LINKEDIN_CLIENT_SECRET,
        }
        resp = requests.post(token_url, data=data)
        if resp.status_code != 200:
            logging.error(f"LinkedIn token exchange failed: {resp.text}")
            return RedirectResponse(f"{FRONTEND_URL}/dashboard/connected-accounts?error=token_exchange_failed")
        
        token_data = resp.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        
        # Calculate expiration time if expires_in is provided
        expires_in = token_data.get("expires_in")
        if expires_in:
            expires_at = datetime.utcnow() + timedelta(seconds=int(expires_in))
        
        # Get user profile to get account ID
        profile_resp = requests.get(
            "https://api.linkedin.com/v2/userinfo", 
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if profile_resp.status_code == 200:
            account_id = profile_resp.json().get("sub") # LinkedIn userinfo 'sub' is the ID

    elif platform in ["twitter", "x"]:
        # Normalize to twitter for consistent logic/storage
        platform = "twitter"
        
        logging.error("DEBUG: X Callback - Starting token exchange.")
        token_url = "https://api.twitter.com/2/oauth2/token"
        
        # 1. Retrieve the code_verifier that was embedded in the state parameter
        code_verifier = twitter_code_verifier
        logging.error(f"DEBUG: X Callback - Verifier from state: {'found' if code_verifier else 'NOT FOUND'}")
        
        if not code_verifier:
            # No verifier means the state was malformed
            return RedirectResponse(f"{FRONTEND_URL}/dashboard/connected-accounts?error=invalid_state")

        # 2. Prepare the exchange request
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.TWITTER_REDIRECT_URI,
            "client_id": settings.TWITTER_CLIENT_ID,
            "code_verifier": code_verifier,
        }

        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        # 3. Perform exchange
        # Twitter requires a Basic auth header when the client secret is present.
        # PKCE apps still send the client_id in the body, but some apps are
        # registered as confidential and will reject requests without the
        # Authorization header.  Add it conditionally so the flow works for
        # both public and confidential clients.
        auth = None
        if settings.TWITTER_CLIENT_SECRET:
            auth = (settings.TWITTER_CLIENT_ID, settings.TWITTER_CLIENT_SECRET)

        resp = requests.post(token_url, data=data, headers=headers, auth=auth)

        # dump to logs regardless so we can diagnose problems in the future
        logging.error(f"DEBUG: X Token Exchange status={resp.status_code} body={resp.text}")

        if resp.status_code != 200:
            logging.error(f"X Token Exchange Error: {resp.status_code} - {resp.text}")
            # persist for post‑mortem debugging
            with open("twitter_final_error.txt", "w") as f:
                f.write(resp.text)
            return RedirectResponse(f"{FRONTEND_URL}/dashboard/connected-accounts?error=token_exchange_failed")
            
        token_data = resp.json()
        access_token = token_data.get("access_token")
        refresh_token = token_data.get("refresh_token")
        expires_in = token_data.get("expires_in")
        
        if expires_in:
            expires_at = datetime.utcnow() + timedelta(seconds=int(expires_in))
            
        # 4. Get User Profile (id)
        user_resp = requests.get(
            "https://api.twitter.com/2/users/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_resp.status_code == 200:
            account_id = user_resp.json().get("data", {}).get("id")
            account_name = user_resp.json().get("data", {}).get("username")

    # 3. Handle mocked platforms
    elif platform in ["facebook", "instagram"]:
        access_token = f"mock_access_token_for_{platform}"
        refresh_token = "mock_refresh_token"
        account_id = f"mock_{platform}_account"

    else:
        return RedirectResponse(f"{FRONTEND_URL}/dashboard/connected-accounts?error=unsupported_platform")

    # 4. Save or update the Integrations table
    integration = db.query(Integration).filter(
        Integration.user_id == user.id,
        Integration.platform == platform
    ).first()

    if integration:
        integration.access_token = access_token
        # Only overwrite refresh token if provider actually provided a new one
        if refresh_token:
            integration.refresh_token = refresh_token
        if expires_at:
            integration.expires_at = expires_at
        integration.account_id = account_id
    else:
        integration = Integration(
            user_id=user.id,
            platform=platform,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at,
            account_id=account_id
        )
        db.add(integration)
    
    db.commit()

    # Redirect physical browser back to frontend dashboard with success flag
    return RedirectResponse(f"{FRONTEND_URL}/dashboard/connected-accounts?success={platform}")
