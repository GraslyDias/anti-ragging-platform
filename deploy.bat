@echo off
echo Starting deployment process for Anti-Ragging Platform...

echo Building optimized production version...
call npm run build

echo Creating deployment folder...
if not exist deployment mkdir deployment

echo Copying standalone server...
xcopy /E /I /Y .next\standalone deployment\app

echo Copying static assets...
xcopy /E /I /Y .next\static deployment\app\.next\static

echo Copying public files...
xcopy /E /I /Y public deployment\app\public

echo Deployment package created successfully!
echo You can find it in the 'deployment' folder.
echo.
echo To run the application:
echo 1. Copy the 'deployment\app' folder to your server
echo 2. Run 'node server.js' from that directory
echo.
echo For more detailed instructions, see HOSTING.md
echo.
pause 