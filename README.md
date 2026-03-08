# PASMI - YouTube Connected Full Stack App

A powerful social media management and AI-powered content generation platform. Connect your YouTube, X (Twitter), and LinkedIn accounts and use AWS Bedrock (Claude 3 & Titan) to generate viral content metadata and thumbnails.

## 🚀 Quick Start (Running on a new PC)

If you have just unzipped this project on a new Windows computer, follow these simple steps to get started:

1.  **Prerequisites**:
    *   **Python 3.10+**: [Download here](https://www.python.org/downloads/)
    *   **Node.js 18+**: [Download here](https://nodejs.org/)

2.  **Run One-Time Setup**:
    Double-click the **`setup_pc.bat`** file in the root directory. This will:
    *   Install frontend dependencies (`npm install`).
    *   Verify or recreate the Backend virtual environment (`venv`).
    *   Create a `start_project.bat` shortcut for you.

3.  **Start the Project**:
    Double-click the newly created **`start_project.bat`**. This will launch both:
    *   **Backend Server**: http://localhost:8000
    *   **Frontend Dashboard**: http://localhost:5173

---

## 🛠️ Configuration (AWS & AI)

To use the AI transcription and content generation features, you **must** have valid AWS credentials in your `Backend/.env` file:

```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=YOUR_VALID_KEY
AWS_SECRET_ACCESS_KEY=YOUR_VALID_SECRET
```

Ensure your IAM user has permissions for:
*   Amazon S3 (for transcription staging)
*   Amazon Transcribe
*   Amazon Bedrock (Claude 3 Haiku and Titan Image Generator)

---

## 📂 Project Structure

*   **/Backend**: FastAPI server, database helpers (MySQL/Aurora), and AI service logic.
*   **/frontend**: Vite + React + Tailwind CSS dashboard and content management UI.
*   **setup_pc.bat**: Automated environment initialization script.
*   **.env**: (Important) Review both `Backend/.env` and `frontend/.env` for local configuration.

---

## 🤝 Support
If you encounter any "Path not found" errors, try rerunning `setup_pc.bat` to refresh the environment.
