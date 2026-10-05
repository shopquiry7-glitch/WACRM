@echo off
echo ========================================================
echo Starting WACRM Local Server + Ngrok Webhook Tunnel
echo ========================================================
echo.

:: Start Next.js in a new window
echo [1/2] Starting Next.js Dev Server on http://localhost:3000 ...
start "WACRM Next.js Dev Server" cmd /k "npm run dev"

:: Wait 3 seconds
timeout /t 3 /nobreak >nul

:: Start Ngrok Tunnel in a new window
echo [2/2] Starting Ngrok Webhook Tunnel (awoke-alright-congrats.ngrok-free.dev) ...
start "WACRM Ngrok Tunnel" cmd /k "ngrok http 3000 --url=awoke-alright-congrats.ngrok-free.dev"

echo.
echo ========================================================
echo SUCCESS! WACRM IS RUNNING:
echo - CRM Dashboard: http://localhost:3000
echo - Webhook URL:   https://awoke-alright-congrats.ngrok-free.dev/api/whatsapp/webhook
echo - Verify Token:  wacrm_verify_secret
echo.
echo NOTE: Do NOT close the two command windows (Next.js and Ngrok).
echo If Ngrok is closed, WhatsApp incoming messages will NOT be received!
echo ========================================================
pause
