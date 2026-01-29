@echo off
echo ========================================
echo   StudyApp - Production Build Script
echo ========================================
echo.

echo [1/3] Cleaning previous builds...
if exist "src-tauri\target\release\bundle" (
    echo Removing old bundle directory...
    rmdir /s /q "src-tauri\target\release\bundle"
)
echo.

echo [2/3] Building application...
echo This may take 2-5 minutes...
echo.
call npm run tauri build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo   BUILD FAILED!
    echo ========================================
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo [3/3] Build complete!
echo.
echo ========================================
echo   BUILD SUCCESSFUL!
echo ========================================
echo.
echo Your installer is ready at:
echo src-tauri\target\release\bundle\nsis\
echo.
echo Opening installer location...
start "" "src-tauri\target\release\bundle\nsis"
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo 1. Test the installer on your machine
echo 2. Share the .exe file with users
echo 3. Or upload to GitHub Releases
echo.
echo See SHIPPING_GUIDE.md for more details
echo ========================================
pause
