from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class StatsItem(BaseModel):
    title: str
    value: str
    iconType: str  # e.g. "Users", "ThumbsUp", "TrendingUp", "Video"
    trend: str
    trendUp: bool
    delay: float

class PlatformDistribution(BaseModel):
    name: str
    value: int
    color: str

class RecentPost(BaseModel):
    name: str
    status: str
    time: str

class DashboardDataResponse(BaseModel):
    stats: List[StatsItem]
    platformDistribution: List[PlatformDistribution]
    recentPosts: List[RecentPost]

class IntegrationCreate(BaseModel):
    platform: str
    api_key: str

class IntegrationResponse(BaseModel):
    platform: str
    access_token: str  # Masked version of the token
    created_at: datetime
    updated_at: datetime


# used when the frontend uploads a video for AI processing
default_caption = "Generate a short social media caption based on the transcript."
default_prompt = "Write a prompt describing the video for a thumbnail generator."

class AIProcessResponse(BaseModel):
    transcript: str
    titles: List[str]
    thumbnails: List[str]  # List of base64 encoded images or URLs
    hashtags: str


