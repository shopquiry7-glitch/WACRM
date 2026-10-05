@echo off
:: Batch script to map jeose-crm.local to 127.0.0.1 in Windows hosts file
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

echo Adding entries to Windows hosts file...
findstr /C:"jeose-crm.local" %WINDIR%\System32\drivers\etc\hosts >nul
if %errorlevel% neq 0 (
    echo. >> %WINDIR%\System32\drivers\etc\hosts
    echo 127.0.0.1  jeose-crm.local >> %WINDIR%\System32\drivers\etc\hosts
    echo 127.0.0.1  jeose-crm.test >> %WINDIR%\System32\drivers\etc\hosts
    echo 127.0.0.1  jeose-crm.app >> %WINDIR%\System32\drivers\etc\hosts
    echo Successfully added domains to hosts file!
) else (
    echo Domain entries already exist in hosts file.
)

ipconfig /flushdns >nul
echo.
echo ========================================================
echo SUCCESS!
echo You can now open your CRM in your browser using:
echo   http://jeose-crm.local:3000
echo ========================================================
pause
