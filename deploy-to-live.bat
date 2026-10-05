@echo off
cd /d "F:\wacrm-main\wacrm-main"
set "PATH=C:\Users\asph4\AppData\Local\MinGit\cmd;C:\Users\asph4\AppData\Local\MinGit\mingw64\bin;%PATH%"
echo ========================================================
echo Deploying WACRM to Live Production (https://jeosecrm.site)
echo ========================================================
echo.
echo Pushing latest features to GitHub (shopquiry7-glitch/WACRM) ...
git.exe push origin main
if %errorlevel% neq 0 (
    echo.
    echo PUSH FAILED or needs GitHub Login.
    echo If prompted, please complete GitHub sign-in above.
) else (
    echo.
    echo ========================================================
    echo SUCCESS! Pushed to GitHub.
    echo Vercel is now building and deploying to https://jeosecrm.site
    echo It will be live in 1-2 minutes!
    echo ========================================================
)
echo.
pause
