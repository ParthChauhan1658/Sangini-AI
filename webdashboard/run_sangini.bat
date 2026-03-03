@echo off
echo Starting Sangini Dashboard...

start "Sangini Backend" cmd /k "call .venv\Scripts\activate && pip install -r backend/requirements.txt && cd backend && python app.py"
echo Backend started in new window...

timeout /t 5

start "Sangini Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo Frontend started in new window...

echo.
echo Application is running!
echo Access Dashboard at: http://localhost:5173
echo.
pause
