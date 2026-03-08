import requests
import logging
from datetime import datetime

def fetch_twitter_profile(access_token: str):
    """
    Fetches the authenticated user's profile from X (Twitter) API v2.
    """
    try:
        resp = requests.get(
            "https://api.twitter.com/2/users/me?user.fields=public_metrics",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if resp.status_code == 200:
            return resp.json().get("data")
        else:
            logging.error(f"X profile fetch failed: {resp.text}")
            return None
    except Exception as e:
        logging.error(f"Error fetching X profile: {e}")
        return None

def fetch_twitter_stats(access_token: str):
    """
    Fetches actual follower count and public metrics from X (Twitter).
    """
    profile = fetch_twitter_profile(access_token)
    if not profile:
        return None

    name = profile.get("name", "X User")
    
    # Public metrics available on free/basic v2 tiers
    metrics = profile.get("public_metrics", {})
    followers = str(metrics.get("followers_count", "0"))
    following = str(metrics.get("following_count", "0"))
    tweet_count = str(metrics.get("tweet_count", "0"))
    
    return {
        "name": name,
        "platform": "Twitter",
        "stats": {
            "followers": followers,
            "following": following,
            "impressions": "N/A", # Requires Enterprise/Premium advanced tier or per-tweet rollup
            "engagement": "N/A",
            "posts": tweet_count
        }
    }

def fetch_twitter_recent_posts(access_token: str, user_id: str = None):
    """
    Fetches the authenticated user's recent tweets via X (Twitter) API v2.
    """
    if not user_id:
        profile = fetch_twitter_profile(access_token)
        if not profile: return []
        user_id = profile.get("id")

    try:
        # Max results 5, order by ID descending (most recent first)
        tweets_url = f"https://api.twitter.com/2/users/{user_id}/tweets?max_results=5&tweet.fields=created_at,public_metrics,text"
        resp = requests.get(tweets_url, headers={"Authorization": f"Bearer {access_token}"})
        
        if resp.status_code == 200:
            tweets = resp.json().get("data", [])
            posts = []
            for item in tweets:
                metrics = item.get("public_metrics", {})
                likes = str(metrics.get("like_count", "0"))
                retweets = str(metrics.get("retweet_count", "0"))
                replies = str(metrics.get("reply_count", "0"))
                views = str(metrics.get("impression_count", "0")) # If available
                
                # Format to short string
                text = item.get("text", "Untitled Tweet")
                
                # Ensure the text is nicely truncated
                title = text[:60] + ("..." if len(text) > 60 else "")
                
                date_str = item.get("created_at")
                if date_str:
                    try:
                        date_obj = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                        date_str = date_obj.strftime("%Y-%m-%d")
                    except ValueError:
                        pass
                else:
                    date_str = "Recent"

                posts.append({
                    "title": title,
                    "views": views,
                    "likes": likes,
                    "replies": replies,
                    "retweets": retweets,
                    "date": date_str,
                    "id": item.get("id")
                })
            return posts
        else:
            logging.error(f"Failed to fetch X tweets: {resp.text}")
    except Exception as e:
        logging.error(f"Error fetching real X tweets: {e}")
    
    return []
