# PASMI Backend Setup

This directory contains the FastAPI backend for the PASMI project. The project
no longer requires PostgreSQL; database access is provided via the
MySQL/Aurora helpers in `app.core.mysql_database`. The backend also uses OpenAI
for transcription, captioning, and thumbnail prompt generation.

## Environment Variables

Copy `.env.example` to `.env` and populate the values before running the server.
Required variables include:

- If you are using a synchronous DB URL for Alembic/Celery tasks, set the
  corresponding environment variable for your deployment system. Production
  deployment with MySQL/Aurora is supported via `app.core.mysql_database`.
- `NEON_AUTH_URL` – the auth endpoint provided by Neon Auth (used for login redirects)
  or leave blank if you are not using Neon Auth.

  **Proxying in single-URL mode:** when you build the frontend and serve it from
  the FastAPI backend, the app still needs to communicate with the Neon Auth
  service for login/session management.  For convenience the backend includes a
  simple reverse-proxy under `/api/auth/*` which forwards all requests to the
  URL configured by this variable.  During development the Vite dev server
  handles this proxy, so you only need the setting for production or when using
  `uvicorn` to serve the static files.  The test suite (`test_database.py`)
  includes a check that this proxy is registered correctly.

### AWS Aurora MySQL configuration

If you intend to connect the backend to an Aurora MySQL cluster, the following
additional variables are used by the `app.core.mysql_database` module.  They can
all be defined in `.env` or injected via your deployment system.

```
# AWS credentials (only required if running outside of an EC2/ECS role)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=        # optional temporary token

# Aurora cluster endpoints
RDS_WRITER_ENDPOINT=database-1.cluster-c38sm4me6k7y.ap-south-1.rds.amazonaws.com
RDS_READER_ENDPOINT=database-1.cluster-ro-c38sm4me6k7y.ap-south-1.rds.amazonaws.com
RDS_PORT=3306
RDS_DB_NAME=pasmi

# ARN of the Secrets Manager entry containing the database username/password
RDS_SECRET_ARN=arn:aws:secretsmanager:ap-south-1:307436091387:secret:rds!cluster-8db6120b-8c6f-4a38-89c1-574d16174d74-tzhtZY
```

The secret must store a JSON object with at least `username` and `password` keys
(see AWS docs for "Credentials for RDS database" template).  The code will
fetch this on demand and cache it; if the secret is rotated you can explicitly
refresh it:

```python
from app.core.aws_secrets import get_secret

creds = get_secret()  # returns dict with username/password
# ... build connection URL or hand credentials to SQLAlchemy ...

# when rotation occurs:
creds = get_secret(force_refresh=True)
```

The AWS client is configured using the normal environment variables
(`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`,
`AWS_REGION`) so you can run the service in an EC2 instance with an IAM role,
from a container with task role, or with explicit credentials stored in
`.env` as a last resort.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – credentials for Google OAuth.
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` – credentials for Facebook OAuth.
- `OPENAI_API_KEY` – API key for OpenAI (used by the AI service).

### Database / OAuth Notes

For MySQL/Aurora deployments use the `app.core.mysql_database` settings in
`.env` (e.g. `DB_WRITER_ENDPOINT`, `DB_READER_ENDPOINT`, `DB_PORT`, `DB_NAME`).
See the `app.core.mysql_database` module for details about constructing the
SQLAlchemy URL and retrieving credentials from AWS Secrets Manager.

If you're using Neon Auth keep `NEON_AUTH_URL` set, otherwise you can leave it empty
or use another authentication mechanism.  Redirect URLs for social logins should
still point to your backend's `/api/auth/callback` endpoint.

## AI Integration

The backend uses Amazon Bedrock (Claude 3 Haiku) and AWS Transcribe for AI features.

### AWS Transcribe & S3 Setup (Required)

For video transcription, the app automatically creates and manages an S3 bucket for staging uploaded files.

**Required IAM Permissions:**
Your AWS user needs these permissions for automatic bucket creation:
- `s3:CreateBucket`
- `s3:PutLifecycleConfiguration`
- `s3:PutBucketPublicAccessBlock`
- `s3:PutObject`, `s3:GetObject`, `s3:ListBucket`
- `transcribe:StartTranscriptionJob`, `transcribe:GetTranscriptionJob`

See [S3_SETUP.md](./S3_SETUP.md) for the complete IAM policy and setup instructions.

**Environment Variables:**
```bash
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=pasmi-transcribe-ap-south-1  # optional, defaults to pasmi-transcribe-{region}
```

**How it works:**
1. On first video upload, the app automatically creates the S3 bucket
2. Sets a lifecycle policy to delete files after 7 days (cost optimization)
3. Blocks all public access for security
4. Uploads video, starts transcription job, and returns results

### Amazon Bedrock Setup (Optional - Thumbnails & Enhanced Titles)

For AI-generated thumbnails and enhanced content generation, add Bedrock permissions:

**Additional IAM Permissions (Optional):**
```json
{
  "Effect": "Allow",
  "Action": [
    "bedrock:InvokeModel"
  ],
  "Resource": [
    "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
    "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-image-generator-v1"
  ]
}
```

**Fallback Behavior:**
- If Bedrock is not configured or fails, the app generates placeholder thumbnails with gradient backgrounds
- Basic title generation still works using fallback logic
- The app will log warnings but continue functioning

If you prefer another AI provider, you can modify `app/services/ai_service.py` to
speak to your chosen API.

## Running Locally

There are two modes for running the full stack:

1. **Development mode** – frontend and backend run separately on two ports.

   - Backend:
     ```powershell
     cd Backend
     pip install -r requirements.txt
     uvicorn main:app --reload
     ```
   - Frontend:
     ```powershell
     cd frontend
     npm install    # once
     npm run dev     # serves on http://localhost:5175
     ```

   The React app proxies `/api` requests to the backend; open
   `http://localhost:5175` in your browser.

2. **Single‑URL mode** – build the frontend and serve it from the same
   FastAPI process.  This produces a single link you can give to testers:

   ```powershell
   cd frontend
   npm run build          # outputs `frontend/dist`

   cd ../Backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

   Once the server is running, the app is available at **http://localhost:8000/**
   (all API routes are still under `/api/*`).  This is convenient for demo or
   staging deployments where you don’t want to run two servers.

   The backend automatically detects the presence of `frontend/dist` and
   mounts it as static files; no additional configuration is required.

## ... (rest of README remains unchanged)

## Testing Aurora MySQL Connection

### Database Initialization Endpoint

A new endpoint `/api/mysql/init` is available which will automatically
create the configured database on the writer node if it does not yet exist.
This can be called from the frontend immediately after a user logs in or
registers; the operation is idempotent and safe to invoke repeatedly.

```bash
curl -X POST http://localhost:8000/api/mysql/init
```

The frontend login flow should simply hit this endpoint (optionally passing a
`db_name` in the body if you want dynamic database names), then proceed with
normal operation.


Before running the full backend, test your Aurora MySQL setup using:

```powershell
python test_database.py
```

This validates configuration, AWS Secrets Manager access, writer/reader connectivity,
and CRUD operations. Once the backend is running, test endpoints:

```bash
# Health check
curl http://localhost:8000/api/mysql/health

# Test read-only endpoint
curl http://localhost:8000/api/mysql/db-test?write=false

# CRUD operations
curl -X POST "http://localhost:8000/api/mysql/items?name=example"
curl http://localhost:8000/api/mysql/items/1
curl -X PUT "http://localhost:8000/api/mysql/items/1?name=updated"
curl -X DELETE http://localhost:8000/api/mysql/items/1
```

## Future Work

- Persist transcripts/captions in the database.
- Wire Neon Auth session validation into `get_current_user` helpers.
- Add additional AI features (hashtags, scheduled publishing, etc.).

## Production Considerations

- **Connection pooling:** Aurora performs best with moderate pool sizes (5–20)
  and `pool_pre_ping` enabled to avoid stale connections.  `pool_recycle` of
  30 minutes guards against dropped AWS connections.
- **Read/write splitting:** use the writer endpoint for INSERT/UPDATE/DELETE and
  the reader endpoint for read‑only traffic.  The `get_db(write=False)` helper
  in `mysql_database` demonstrates one way to do this; you can extend it with a
  routing session if you have complex logic.
- **Credential rotation:** Secrets Manager can rotate credentials automatically.
  Call `get_secret(force_refresh=True)` or restart your service after rotation.
- **Graceful shutdown:** call `app.add_event_handler("shutdown", close_engines)`
  if using the MySQL module to dispose of pool connections cleanly.
- **Environment-specific config:** keep `.env` values secret in production;
  consider using ECS/EKS task definitions, Lambda environment or Vault.
