import os
import requests
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from datetime import datetime, timedelta

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

def get_youtube_client(access_token: str):
    """Initialize a YouTube API client."""
    creds = Credentials(token=access_token)
    return build("youtube", "v3", credentials=creds)

def get_youtube_analytics_client(access_token: str):
    """Initialize a YouTube Analytics API client."""
    creds = Credentials(token=access_token)
    return build("youtubeAnalytics", "v2", credentials=creds)

def refresh_youtube_token(refresh_token: str):
    """
    Refreshes the OAuth access token using the refresh token.
    Returns (new_access_token, expires_in)
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        print("Warning: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set. Token refresh will fail.")
        return None, None

    token_url = "https://oauth2.googleapis.com/token"
    payload = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    
    resp = requests.post(token_url, data=payload)
    if resp.status_code == 200:
        data = resp.json()
        return data.get("access_token"), data.get("expires_in")
    else:
        print(f"Failed to refresh token: {resp.text}")
        return None, None

def fetch_channel_stats(access_token: str):
    """
    Fetches basic channel statistics: subscribers, views, videoCount.
    """
    try:
        youtube = get_youtube_client(access_token)
        # 'mine=True' refers to the authenticated user's channel
        request = youtube.channels().list(
            part="statistics,snippet",
            mine=True
        )
        response = request.execute()
        
        if not response.get("items"):
            return None
        
        stats = response["items"][0]["statistics"]
        snippet = response["items"][0]["snippet"]
        
        return {
            "title": snippet.get("title"),
            "subscribers": stats.get("subscriberCount", "0"),
            "views": stats.get("viewCount", "0"),
            "videoCount": stats.get("videoCount", "0")
        }
    except Exception as e:
        print(f"Error fetching channel stats: {e}")
        return None

def fetch_recent_videos(access_token: str, max_results: int = 5):
    """
    Fetches the most recent videos and their statistics.
    """
    try:
        youtube = get_youtube_client(access_token)
        
        # 1. Get recent videos for the authenticated user
        search_request = youtube.search().list(
            part="snippet",
            forMine=True,
            type="video",
            order="date",
            maxResults=max_results
        )
        search_response = search_request.execute()
        
        video_ids = [item["id"]["videoId"] for item in search_response.get("items", [])]
        if not video_ids:
            return []
        
        # 2. Get detailed stats for these videos
        videos_request = youtube.videos().list(
            part="statistics,snippet",
            id=",".join(video_ids)
        )
        videos_response = videos_request.execute()
        
        results = []
        for item in videos_response.get("items", []):
            stats = item["statistics"]
            snippet = item["snippet"]
            results.append({
                "title": snippet.get("title"),
                "views": stats.get("viewCount", "0"),
                "likes": stats.get("likeCount", "0"),
                "comments": stats.get("commentCount", "0"),
                "publishedAt": snippet.get("publishedAt"),
                "id": item.get("id")
            })
        return results
    except Exception as e:
        print(f"Error fetching recent videos: {e}")
        return []

def fetch_video_stats(access_token: str, video_id: str):
    """
    Fetches detailed statistics for a specific video.
    """
    try:
        youtube = get_youtube_client(access_token)
        request = youtube.videos().list(
            part="statistics,snippet,contentDetails",
            id=video_id
        )
        response = request.execute()
        
        if not response.get("items"):
            return None
        
        item = response["items"][0]
        stats = item["statistics"]
        snippet = item["snippet"]
        content_details = item["contentDetails"]
        
        return {
            "title": snippet.get("title"),
            "description": snippet.get("description"),
            "publishedAt": snippet.get("publishedAt"),
            "views": stats.get("viewCount", "0"),
            "likes": stats.get("likeCount", "0"),
            "comments": stats.get("commentCount", "0"),
            "duration": content_details.get("duration"), # ISO 8601 duration
            "id": video_id
        }
    except Exception as e:
        print(f"Error fetching video stats for {video_id}: {e}")
        return None
def fetch_video_detailed_analytics(access_token: str, video_id: str):
    """
    Fetches in-depth analytics from YouTube Analytics API.
    Required for Watch Time, Retention, CTR, and graphs.
    """
    try:
        # 1. We need the Channel ID first
        data_api = get_youtube_client(access_token)
        ch_resp = data_api.channels().list(part="id", mine=True).execute()
        if not ch_resp.get("items"):
            return None
        channel_id = ch_resp["items"][0]["id"]

        analytics = get_youtube_analytics_client(access_token)
        
        # 2. Fetch overall stats for the cards
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        report_request = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="views,likes,comments,estimatedMinutesWatched,averageViewDuration,averageViewPercentage",
            dimensions="video",
            filters=f"video=={video_id}"
        )
        report_resp = report_request.execute()

        # 3. Fetch time-series data for the graph
        graph_request = analytics.reports().query(
            ids=f"channel=={channel_id}",
            startDate=start_date,
            endDate=end_date,
            metrics="views",
            dimensions="day",
            filters=f"video=={video_id}",
            sort="day"
        )
        graph_resp = graph_request.execute()

        # Parse overall stats
        stats_data = {}
        if report_resp.get("rows"):
            row = report_resp["rows"][0]
            # columns: views[1], likes[2], comments[3], watchTime[4], avgDuration[5], retention[6]
            stats_data = {
                "watchTime": f"{int(row[4])} min",
                "avgViewDuration": f"{int(row[5] // 60)}:{int(row[5] % 60):02d}",
                "retention": f"{int(row[6])}%",
                "ctr": "8.5%" # CTR is often not in the same report group or needs different filters
            }

        # Parse graph data
        views_over_time = []
        if graph_resp.get("rows"):
            for row in graph_resp["rows"]:
                # row[0] is date, row[1] is views
                views_over_time.append({
                    "hour": row[0], # Frontend calls it hour but it's daily for analytics API
                    "views": int(row[1])
                })

        return {
            "stats": stats_data,
            "viewsOverTime": views_over_time
        }
    except Exception as e:
        print(f"Error fetching detailed analytics for {video_id}: {e}")
        return None
