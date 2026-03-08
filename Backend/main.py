from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
import os
import logging
from dotenv import load_dotenv

# Suppress TensorFlow oneDNN warnings before any TensorFlow imports
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Load environment variables from .env file
load_dotenv()

# PostgreSQL init/close removed; database functionality moved to MySQL helpers
from app.routers import dashboard

# basic logging; libraries will inherit this configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    handlers=[
        logging.FileHandler("backend_errors.log"),
        logging.StreamHandler()
    ]
)

app = FastAPI(title="PASMI Backend API", version="2.0.0")

# Add SessionMiddleware for OAuth PKCE code_verifier storage
from app.core.config import settings
app.add_middleware(
    SessionMiddleware, 
    secret_key=settings.SECRET_KEY,
    session_cookie="pasmi_session",
    same_site="lax"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5175", 
        "http://127.0.0.1:5175",
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware to set security headers for Google Auth success
@app.middleware("http")
async def request_logger(request, call_next):
    import time
    with open("request_log.txt", "a") as f:
        f.write(f"{time.ctime()}: {request.method} {request.url}\n")
    return await call_next(request)

# (static mount is deferred until after routers are included so that the
# APIs always take precedence; this is particularly important when the
# backend is tested via TestClient and a `frontend/dist` directory happens
# to exist.)
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))


# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database tables and necessary setup."""
    try:
        from app.core.db_init import init_db
        init_db()
    except Exception as e:
        logging.warning(f"Failed to initialize database: {e}")


# Postgres startup/shutdown hooks removed. Close MySQL engines on shutdown
@app.on_event("shutdown")
async def shutdown_event():
    try:
        from app.core.mysql_database import close_engines
        close_engines()
    except Exception:
        pass


@app.get("/")
def read_root():
    return {"message": "PASMI API is running", "version": "2.0.0"}


from app.routers import auth
app.include_router(auth.router, prefix="/api", tags=["auth"])

app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

# AI processing endpoints (video transcription, caption/thumbnail generation)
from app.routers import ai
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

# MySQL/Aurora examples and health checks
from app.routers import mysql_example
app.include_router(mysql_example.router, prefix="/api/mysql", tags=["mysql"])

# OAuth 2.0 Integrations logic
from app.routers import integrations
app.include_router(integrations.router)

# once all API routers are registered we can serve the frontend build if one
# exists.  Mounting after routers ensures that path like /api/auth are handled
# by the proxy instead of StaticFiles attempting to look up a file on disk.
if os.path.isdir(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
