@echo off
echo ===============================================================================
echo   JEEVAN-DRISHTI (जीवन-दृष्टी)
echo   Multi-Hazard Climate-Health Disease Surveillance Platform
echo   Government of Maharashtra - Public Health Department
echo ===============================================================================
echo.

echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "Jeevan-Drishti Backend API" cmd /k "cd backend && ..\venv\Scripts\python.exe run.py"

echo [2/2] Starting React Vite Frontend on http://127.0.0.1:5173 ...
start "Jeevan-Drishti Frontend UI" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Both servers are launching!
echo Backend Docs: http://127.0.0.1:8000/docs
echo Frontend URL: http://127.0.0.1:5173/
echo.
pause
