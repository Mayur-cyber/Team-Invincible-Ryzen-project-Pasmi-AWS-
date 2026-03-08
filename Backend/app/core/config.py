from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # JWT authentication secret
    JWT_SECRET: str
    
    # Secret key for sessions and cryptographic signatures
    SECRET_KEY: str = "your-secret-key-change-me"

    # OpenAI key for AI features; can be None in development.
    OPENAI_API_KEY: str | None = None

    # Google Cloud Configuration
    GOOGLE_CLOUD_API_KEY: str | None = None  # For Imagen 3 only
    GOOGLE_CLOUD_PROJECT_ID: str | None = None
    GOOGLE_APPLICATION_CREDENTIALS: str | None = None  # Path to service account JSON file

    # LinkedIn OAuth credentials
    LINKEDIN_CLIENT_ID: str | None = None
    LINKEDIN_CLIENT_SECRET: str | None = None
    LINKEDIN_REDIRECT_URI: str = "http://127.0.0.1:8000/api/integrations/linkedin/callback"

    # Google OAuth credentials
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_REDIRECT_URI: str = "http://127.0.0.1:8000/api/integrations/youtube/callback"

    # X (Twitter) OAuth credentials
    TWITTER_CLIENT_ID: str | None = None
    TWITTER_CLIENT_SECRET: str | None = None
    TWITTER_REDIRECT_URI: str = "http://127.0.0.1:8000/api/integrations/twitter/callback"

    # Application environment (development/production) and logging.
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    # MySQL connection details
    DB_HOST: str
    DB_PORT: int = 3306
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str

    # Optional SSL settings
    DB_SSL_CA: str | None = None  # path to CA bundle file
    DB_SSL_REQUIRE: bool = False  # set true to require SSL

    # Connection pool configuration (for PyMySQL)
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800  # 30 minutes

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
