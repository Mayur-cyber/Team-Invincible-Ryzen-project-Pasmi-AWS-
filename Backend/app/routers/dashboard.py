from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.mysql_database import get_db
from app.models.integration import Integration
from app.routers.auth import get_current_user
from app.models.user import User
from app.schemas.dashboard_schemas import (
    DashboardDataResponse, 
    StatsItem, 
    PlatformDistribution, 
    RecentPost,
    IntegrationCreate,
    IntegrationResponse
)
from app.services.youtube_service import fetch_channel_stats, fetch_recent_videos, refresh_youtube_token, fetch_video_stats, fetch_video_detailed_analytics
from app.services.linkedin_service import fetch_linkedin_stats, fetch_linkedin_recent_posts
from app.services.twitter_service import fetch_twitter_stats, fetch_twitter_recent_posts

router = APIRouter()

# --- Integrations ---

@router.get("/integrations", response_model=List[IntegrationResponse])
def get_integrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch all connected platforms for the current user."""
    integrations = db.query(Integration).filter(Integration.user_id == current_user.id).all()
    results = []
    for i in integrations:
        # Use access_token for masking as api_key no longer exists in DB
        token = i.access_token or ""
        masked_token = f"••••••••{token[-4:]}" if len(token) > 4 else "••••••••"
        results.append({
            "platform": i.platform,
            "access_token": masked_token,
            "created_at": i.created_at,
            "updated_at": i.updated_at
        })
    return results

@router.post("/integrations", response_model=IntegrationResponse)
def add_or_update_integration(
    integration_data: IntegrationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add or update an access token for a specific platform."""
    platform = integration_data.platform
    if platform == "x":
        platform = "twitter"
        
    integration = db.query(Integration).filter(
        Integration.user_id == current_user.id,
        Integration.platform == platform
    ).first()

    if integration:
        integration.access_token = integration_data.api_key
        db.commit()
        db.refresh(integration)
    else:
        integration = Integration(
            user_id=current_user.id,
            platform=integration_data.platform,
            access_token=integration_data.api_key
        )
        db.add(integration)
        db.commit()
        db.refresh(integration)

    token = integration.access_token or ""
    masked_token = f"••••••••{token[-4:]}" if len(token) > 4 else "••••••••"
    return {
        "platform": integration.platform,
        "access_token": masked_token,
        "created_at": integration.created_at,
        "updated_at": integration.updated_at,
    }

@router.delete("/integrations/{platform}")
def delete_integration(
    platform: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a connected platform."""
    if platform == "x":
        platform = "twitter"
        
    integration = db.query(Integration).filter(
        Integration.user_id == current_user.id,
        Integration.platform == platform
    ).first()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    db.delete(integration)
    db.commit()

    return {"message": f"Successfully unlinked {platform}"}

@router.get("/data", response_model=DashboardDataResponse)
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch all data needed for the dashboard overview.
    Calculates metrics dynamically based on active integrations.
    """
    integrations = db.query(Integration).filter(Integration.user_id == current_user.id).all()
    platforms = [i.platform for i in integrations]

    if not platforms:
        # Zero-state if nothing connected
        return DashboardDataResponse(
            stats=[
                StatsItem(title="Total Followers", value="0", iconType="Users", trend="+0%", trendUp=True, delay=0.0),
                StatsItem(title="Avg. Engagement", value="0.0%", iconType="ThumbsUp", trend="+0.0%", trendUp=True, delay=0.1),
                StatsItem(title="Total Views", value="0", iconType="TrendingUp", trend="+0%", trendUp=True, delay=0.2),
                StatsItem(title="Posts Created", value="0", iconType="Video", trend="+0", trendUp=True, delay=0.3),
            ],
            platformDistribution=[],
            recentPosts=[]
        )

    # Simulated Live Data for connected platforms
    stats_items = [
        StatsItem(title="Total Followers", value="0", iconType="Users", trend="+0%", trendUp=True, delay=0.0),
        StatsItem(title="Avg. Engagement", value="0.0%", iconType="ThumbsUp", trend="+0.0%", trendUp=True, delay=0.1),
        StatsItem(title="Total Views", value="0", iconType="TrendingUp", trend="+0%", trendUp=True, delay=0.2),
        StatsItem(title="Posts Created", value="0", iconType="Video", trend="+0", trendUp=True, delay=0.3),
    ]
    
    recent_posts = []
    
    for integration in integrations:
        if integration.platform == "youtube":
            # Attempt to fetch real YouTube data
            yt_stats = fetch_channel_stats(integration.access_token)
            
            # If fetch fails, try refresh
            if yt_stats is None and integration.refresh_token:
                new_token, _ = refresh_youtube_token(integration.refresh_token)
                if new_token:
                    integration.access_token = new_token
                    db.commit()
                    yt_stats = fetch_channel_stats(new_token)
            
            if yt_stats:
                # Update stats with real data
                # Total Followers = Subscribers
                stats_items[0].value = yt_stats["subscribers"]
                # Total Views = Views
                stats_items[2].value = yt_stats["views"]
                # Posts Created = Video Count
                stats_items[3].value = yt_stats["videoCount"]
                
                # Fetch recent videos for content list
                yt_videos = fetch_recent_videos(integration.access_token, max_results=3)
                for v in yt_videos:
                    recent_posts.append(RecentPost(
                        name=v["title"],
                        status="Published",
                        time=v["publishedAt"].split('T')[0] # Simple date
                    ))
        elif integration.platform == "linkedin":
            li_stats = fetch_linkedin_stats(integration.access_token)
            if li_stats:
                # Add LinkedIn followers to aggregate
                try:
                    current_followers = int(stats_items[0].value.replace(',', ''))
                    li_followers = int(li_stats["stats"].get("followers", "0").replace(',', ''))
                    stats_items[0].value = f"{current_followers + li_followers:,}"
                except (ValueError, AttributeError):
                    pass
                
                # Add recent LinkedIn posts
                li_posts = fetch_linkedin_recent_posts(integration.access_token)
                for p in li_posts:
                    recent_posts.append(RecentPost(
                        name=p["title"],
                        status="Published",
                        time=p["date"]
                    ))
        elif integration.platform in ["twitter", "x"]:
            tw_stats = fetch_twitter_stats(integration.access_token)
            if tw_stats:
                try:
                    current_followers = int(stats_items[0].value.replace(',', ''))
                    tw_followers = int(tw_stats["stats"].get("followers", "0").replace(',', ''))
                    stats_items[0].value = f"{current_followers + tw_followers:,}"
                    
                    tweets_count = int(tw_stats["stats"].get("posts", "0").replace(',', ''))
                    current_posts = int(stats_items[3].value.replace(',', ''))
                    stats_items[3].value = f"{current_posts + tweets_count:,}"
                except (ValueError, AttributeError):
                    pass
                
                # Add recent Twitter posts
                tw_posts = fetch_twitter_recent_posts(integration.access_token)
                for p in tw_posts:
                    recent_posts.append(RecentPost(
                        name=p["title"],
                        status="Published",
                        time=p["date"] # Keep it simple
                    ))
        else:
            # Fallback for other platforms (simulated for now)
            p = integration.platform
            recent_posts.append(RecentPost(name=f"Automated post for {p.capitalize()}", status="Published", time="2 hours ago"))

    # Update platform distribution
    platform_dist = [
        PlatformDistribution(
            name=p.capitalize(), 
            value=400, 
            color={"youtube": "#FF0000", "instagram": "#E1306C", "facebook": "#1877F2", "twitter": "#000000"}.get(p, "#8b5cf6")
        ) for p in platforms
    ]

    return DashboardDataResponse(
        stats=stats_items,
        platformDistribution=platform_dist,
        recentPosts=recent_posts
    )

@router.get("/analytics")
def get_analytics_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns weekly chart timelines and detailed stats for the Analytics page.
    """
    integrations = db.query(Integration).filter(Integration.user_id == current_user.id).all()
    platforms = [i.platform for i in integrations]

    # If no platforms are connected, return exactly 0 for all properties
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    weekly_data = {day: {"day": day, "youtube": 0, "linkedin": 0, "instagram": 0, "facebook": 0, "twitter": 0} for day in days}
    
    if not platforms:
        return {"weeklyData": list(weekly_data.values()), "platformData": {}}

    # Base platform templates
    simulated_platform_data = {
        "instagram": {
            "name": "Instagram", "color": "#E1306C", "bgColor": "bg-pink-50", "textColor": "text-pink-600",
            "stats": {"followers": "45.2K", "reach": "342K", "engagement": "12.5%", "avgLikes": "2.1K"},
            "recentContent": [{"title": "New AI features! 🚀", "views": "2.8K", "likes": "3.2K", "date": "1 day ago"}]
        },
        "facebook": {
            "name": "Facebook", "color": "#1877F2", "bgColor": "bg-blue-50", "textColor": "text-blue-600",
            "stats": {"followers": "32.8K", "reach": "289K", "engagement": "6.8%", "shares": "1.2K"},
            "recentContent": [{"title": "Automate your workflow", "views": "1.5K", "likes": "1.2K", "date": "2 days ago"}]
        },
        "twitter": {
            "name": "X (Twitter)", "color": "#000000", "bgColor": "bg-gray-50", "textColor": "text-gray-900",
            "stats": {"followers": "12.8K", "impressions": "456K", "engagement": "4.2%", "retweets": "892"},
            "recentContent": [{"title": "Just shipped AI generator 🔥", "views": "342", "likes": "89", "date": "1 day ago"}]
        }
    }

    # Filter down to strictly the ones they actually linked
    filtered_platform_data = {}
    total_followers = 0
    total_views = 0
    content_posted = 0

    for p in platforms:
        if p == "youtube":
            integration = next((i for i in integrations if i.platform == "youtube"), None)
            if integration:
                yt_stats = fetch_channel_stats(integration.access_token)
                # Retry with refresh if needed
                if yt_stats is None and integration.refresh_token:
                    new_token, _ = refresh_youtube_token(integration.refresh_token)
                    if new_token:
                        integration.access_token = new_token
                        db.commit()
                        yt_stats = fetch_channel_stats(new_token)
                
                if yt_stats:
                    total_followers += int(yt_stats["subscribers"])
                    total_views += int(yt_stats["views"])
                    content_posted += int(yt_stats["videoCount"])
                    
                    yt_videos = fetch_recent_videos(integration.access_token, max_results=5)
                    filtered_platform_data["youtube"] = {
                        "name": "YouTube", "color": "#FF0000", "bgColor": "bg-red-50", "textColor": "text-red-600",
                        "stats": {
                            "subscribers": yt_stats["subscribers"],
                            "views": yt_stats["views"],
                            "engagement": "N/A",
                            "videoCount": yt_stats["videoCount"]
                        },
                        "recentContent": [
                            {"title": v["title"], "views": v["views"], "likes": v["likes"], "date": v["publishedAt"].split('T')[0], "id": v.get("id")}
                            for v in yt_videos
                        ]
                    }
                    
                    # Distribute total YouTube views evenly across all 7 days of the week
                    # so the chart always shows a non-flat line rather than a spike on one day.
                    total_yt_views = sum(int(v.get("views", 0)) for v in yt_videos)
                    daily_yt_views = total_yt_views // 7 if total_yt_views else 0
                    for day in days:
                        weekly_data[day]["youtube"] += daily_yt_views
        elif p == "linkedin":
            integration = next((i for i in integrations if i.platform == "linkedin"), None)
            if integration:
                li_stats = fetch_linkedin_stats(integration.access_token)
                li_posts = fetch_linkedin_recent_posts(integration.access_token)
                
                if li_stats:
                    total_followers += int(li_stats["stats"].get("followers", "0").replace(',', ''))
                    # Real-time views might be N/A if MDP is not fully enabled, fallback to 0
                    views_str = li_stats["stats"].get("reach", "0").replace(',', '').replace('N/A', '0').replace('K', '000')
                    total_views += int(float(views_str))
                    
                content_posted += len(li_posts)
                
                filtered_platform_data["linkedin"] = {
                    "name": "LinkedIn", "color": "#0A66C2", "bgColor": "bg-blue-50", "textColor": "text-blue-700",
                    "stats": li_stats["stats"] if li_stats else {},
                    "recentContent": li_posts
                }
                
                # Update weekly data for LinkedIn based on recent posts
                for post in li_posts:
                    try:
                        p_date = datetime.strptime(post["date"], "%Y-%m-%d")
                        day_name = p_date.strftime('%a')
                        if day_name in weekly_data:
                            # Use actual views if available
                            v_count = int(post.get("views", "0").replace(',', ''))
                            weekly_data[day_name]["linkedin"] += v_count
                    except:
                        continue
        elif p in ["twitter", "x"]:
            integration = next((i for i in integrations if i.platform in ["twitter", "x"]), None)
            if integration:
                tw_stats = fetch_twitter_stats(integration.access_token)
                tw_posts = fetch_twitter_recent_posts(integration.access_token)
                
                if tw_stats:
                    try:
                        total_followers += int(tw_stats["stats"].get("followers", "0").replace(',', ''))
                    except (ValueError, AttributeError):
                        pass
                    # Impression proxy if we get one
                    try:
                        views_str = tw_stats["stats"].get("impressions", "0").replace(',', '').replace('N/A', '0').replace('K', '000')
                        total_views += int(float(views_str))
                    except (ValueError, AttributeError):
                        pass
                    
                content_posted += len(tw_posts)
                
                # Always add twitter entry even if API returns None so the tab is visible
                tw_stats_payload = tw_stats["stats"] if tw_stats else {"info": "Data unavailable — please reconnect your X account"}
                filtered_platform_data["twitter"] = {
                    "name": "X (Twitter)", "color": "#000000", "bgColor": "bg-gray-50", "textColor": "text-gray-900",
                    "stats": tw_stats_payload,
                    "recentContent": tw_posts
                }
                
                # Update weekly data for Twitter based on recent posts
                for post in tw_posts:
                    try:
                        p_date = datetime.strptime(post["date"], "%Y-%m-%d")
                        day_name = p_date.strftime('%a')
                        if day_name in weekly_data:
                            v_count = int(post.get("views", "0").replace(',', ''))
                            # Fallback using likes/retweets to scale a simulated dimension if impressions are missing
                            if v_count == 0:
                                v_count = (int(post.get("likes", "0")) + int(post.get("retweets", "0"))) * 10
                            weekly_data[day_name]["twitter"] += v_count
                    except:
                        continue
        elif p in simulated_platform_data:
            filtered_platform_data[p] = simulated_platform_data[p]
            # Add simulated data to totals
            total_followers += 45000
            total_views += 1100000
            content_posted += 12

    # Simulated data for other platforms IF connected
    for p in platforms:
        if p != "youtube" and p in simulated_platform_data:
            for day in days:
                weekly_data[day][p] = 500 + (len(day) * 100) # Simple deterministic simulation

    return {
        "weeklyData": list(weekly_data.values()),
        "platformData": filtered_platform_data,
        "aggregateMetrics": {
            "totalFollowers": f"{total_followers:,}",
            "totalViews": f"{total_views:,}",
            "avgEngagement": "2.1%", # Placeholder for overall engagement
            "contentPosted": str(content_posted)
        }
    }

@router.get("/analytics/{platform}/{id}")
def get_video_analytics(
    platform: str,
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch real-time analytics for a specific video/post."""
    if platform == "x":
        platform = "twitter"
        
    integration = db.query(Integration).filter(
        Integration.user_id == current_user.id,
        Integration.platform == platform
    ).first()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    if platform == "youtube":
        stats = fetch_video_stats(integration.access_token, id)
        detailed = fetch_video_detailed_analytics(integration.access_token, id)
        
        # Retry with refresh if needed
        if stats is None and integration.refresh_token:
            new_token, _ = refresh_youtube_token(integration.refresh_token)
            if new_token:
                integration.access_token = new_token
                db.commit()
                stats = fetch_video_stats(new_token, id)
                detailed = fetch_video_detailed_analytics(new_token, id)
        
        if stats:
            if detailed:
                # Merge basic stats with detailed analytics
                stats.update(detailed.get("stats", {}))
                stats["viewsOverTime"] = detailed.get("viewsOverTime", [])
            return stats
        else:
            raise HTTPException(status_code=404, detail="Video stats not available")

    elif platform == "linkedin":
        # Check if the ID matches recent posts
        li_posts = fetch_linkedin_recent_posts(integration.access_token)
        post = next((p for p in li_posts if p.get("id") == id), None)
        if post:
            return {
                "title": post.get("title"),
                "views": post.get("views", "0"),
                "likes": post.get("likes", "0"),
                "comments": "N/A", # Needs a deeper comments API call usually
                "publishedAt": post.get("date"),
                "id": id,
                "stats": {
                    "retention": "N/A",
                    "ctr": "N/A"
                }
            }
        else:
             return {
                "title": f"LinkedIn Post Analytics",
                "views": "0", "likes": "0", "comments": "0",
                "publishedAt": datetime.utcnow().isoformat(), "id": id
              }

    elif platform in ["twitter", "x"]:
        tw_posts = fetch_twitter_recent_posts(integration.access_token)
        post = next((p for p in tw_posts if p.get("id") == id), None)
        if post:
            return {
                "title": post.get("title"),
                "views": post.get("views", "0"),
                "likes": post.get("likes", "0"),
                "comments": post.get("replies", "0"),
                "retweets": post.get("retweets", "0"),
                "publishedAt": post.get("date"),
                "id": id,
                "stats": {
                     "retention": "N/A",
                     "ctr": "N/A"
                 }
            }
        else:
              return {
                "title": f"Twitter Post Analytics",
                "views": "0", "likes": "0", "comments": "0",
                "publishedAt": datetime.utcnow().isoformat(), "id": id
              }

    # For other platforms, return mock data for now
    return {
        "title": f"Mock Content for {platform}",
        "views": "0",
        "likes": "0",
        "comments": "0",
        "publishedAt": datetime.utcnow().isoformat(),
        "id": id
    }
