@echo off
echo.    
echo Starting backend    
echo.    
call python -m quart run --port 50505 --reload
if "%errorlevel%" neq "0" (    
    echo Failed to start backend    
    exit /B %errorlevel%    
) 
