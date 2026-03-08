@echo off
SETLOCAL EnableDelayedExpansion

echo ====================================================
echo   PASMI Project Setup - New PC
echo ====================================================

:: 1. Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.10+.
    pause
    exit /b 1
)

:: 2. Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)

:: 3. Setup Frontend
echo.
echo [1/3] Setting up Frontend (installing dependencies)...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)
cd ..

:: 4. Verify/Recreate Backend Venv
echo.
echo [2/3] Verifying Backend Environment...
if exist "Backend\venv" (
    echo [INFO] Found existing venv. Checking if it works...
    Backend\venv\Scripts\python.exe --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARNING] Existing venv is broken (common when moving folders). 
        echo Recreating venv...
        rmdir /s /q Backend\venv
        python -m venv Backend\venv
        Backend\venv\Scripts\pip install -r Backend\requirements.txt
    ) else (
        echo [SUCCESS] Existing venv is functional.
    )
) else (
    echo [INFO] Creating new venv...
    python -m venv Backend\venv
    Backend\venv\Scripts\pip install -r Backend\requirements.txt
)

:: 5. Create Start Script
echo.
echo [3/3] Creating unified start script...
(
echo @echo off
echo echo Starting Backend...
echo start cmd /k "cd Backend && venv\Scripts\activate && uvicorn main:app --reload"
echo echo Starting Frontend...
echo start cmd /k "cd frontend && npm run dev -- --port 5173"
echo echo.
echo echo Project is starting! 
echo echo Backend: http://localhost:8000
echo echo Frontend: http://localhost:5173
) > start_project.bat

echo.
echo ====================================================
echo   SETUP COMPLETE!
echo   Double-click 'start_project.bat' to run the app.
echo ====================================================
pause
