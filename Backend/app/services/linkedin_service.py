import requests
import logging
from datetime import datetime, timedelta

def fetch_linkedin_profile(access_token: str):
    """
    Fetches basic LinkedIn profile information using OpenID Connect userinfo endpoint.
    Includes 'sub' (the member URN identifier).
    """
    try:
        resp = requests.get(
            "https://api.linkedin.com/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if resp.status_code == 200:
            return resp.json()
        else:
            logging.error(f"LinkedIn profile fetch failed: {resp.text}")
            return None
    except Exception as e:
        logging.error(f"Error fetching LinkedIn profile: {e}")
        return None

def fetch_linkedin_stats(access_token: str):
    """
    Fetches real-time LinkedIn follower count using Network Sizes API.
    Requires 'r_member_profileAnalytics' or similar.
    """
    profile = fetch_linkedin_profile(access_token)
    if not profile:
        return None

    name = profile.get("name", "LinkedIn User")
    sub = profile.get("sub") # This is the encrypted ID/URN part
    
    # Member URN format for Network Sizes API is typically urn:li:person:ID
    # OpenID Connect 'sub' is often just the ID or the full URN.
    person_urn = sub if sub.startswith("urn:li:person:") else f"urn:li:person:{sub}"

    followers = "0"
    try:
        # Fetch follower count
        # Ref: https://learn.microsoft.com/en-us/linkedin/shared/integrations/communications/network-sizes
        size_url = f"https://api.linkedin.com/v2/networkSizes/{person_urn}?edgeType=COMPANY_FOLLOWED_BY_MEMBER"
        # Actually for personal profile followers it might be MEMBER_FOLLOWED_BY_MEMBER
        # but often 'networkSizes' is for companies. 
        # For personal, 'memberFollowersCount' is the newer 2024/2025 endpoint.
        
        # Fallback to a safe call if the new one fails
        stats_resp = requests.get(
            f"https://api.linkedin.com/v2/memberFollowersCount?q=owner&owner={person_urn}",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if stats_resp.status_code == 200:
            data = stats_resp.json()
            # Parse follower count from the collection
            if "elements" in data and len(data["elements"]) > 0:
                followers = str(data["elements"][0].get("followerCount", "0"))
        else:
            logging.warning(f"Failed to fetch real LinkedIn followers (Status {stats_resp.status_code}). Check product enablement.")
    except Exception as e:
        logging.error(f"Error calling LinkedIn Analytics API: {e}")

    return {
        "name": name,
        "platform": "LinkedIn",
        "stats": {
            "followers": followers,
            "reach": "N/A", # Reach usually requires MDP or specific ad-account access
            "engagement": "N/A",
            "shares": "N/A"
        }
    }

def fetch_linkedin_recent_posts(access_token: str, person_urn: str = None):
    """
    Fetches actual recent shares/posts for the LinkedIn member.
    """
    if not person_urn:
        profile = fetch_linkedin_profile(access_token)
        if not profile: return []
        sub = profile.get("sub")
        person_urn = sub if sub.startswith("urn:li:person:") else f"urn:li:person:{sub}"

    try:
        # Get recent shares
        shares_url = f"https://api.linkedin.com/v2/shares?q=owners&owners={person_urn}&count=5&sortBy=CREATED"
        resp = requests.get(shares_url, headers={"Authorization": f"Bearer {access_token}"})
        
        if resp.status_code == 200:
            elements = resp.json().get("elements", [])
            posts = []
            for item in elements:
                share_urn = item.get("id")
                
                # Fetch stats for this specific share
                # Note: This might hit rate limits if too many shares are fetched
                stats_url = f"https://api.linkedin.com/v2/shareStatistics?q=share&shares={share_urn}"
                s_resp = requests.get(stats_url, headers={"Authorization": f"Bearer {access_token}"})
                
                likes = "0"
                views = "0"
                if s_resp.status_code == 200:
                    s_data = s_resp.json().get("elements", [{}])[0]
                    stats = s_data.get("totalShareStatistics", {})
                    likes = str(stats.get("likeCount", "0"))
                    views = str(stats.get("viewCount", "0"))

                # Extract text
                text = item.get("text", {}).get("text", "Untitled Post")
                date_ts = item.get("created", {}).get("time", 0)
                date_str = datetime.fromtimestamp(date_ts/1000).strftime('%Y-%m-%d') if date_ts else "Recent"

                posts.append({
                    "title": text[:60] + ("..." if len(text) > 60 else ""),
                    "views": views,
                    "likes": likes,
                    "date": date_str,
                    "id": share_urn
                })
            return posts
        else:
            logging.error(f"Failed to fetch LinkedIn shares: {resp.text}")
    except Exception as e:
        logging.error(f"Error fetching real LinkedIn posts: {e}")
    
    return []
