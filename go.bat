@echo off
echo [Darba] Starting development environment...
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

echo [Darba] Waiting for containers to start...
timeout /t 5 /nobreak >nul

echo [Darba] Reloading nginx (re-resolve upstream DNS)...
docker exec darba-nginx-1 nginx -s reload 2>nul

echo.
echo [Darba] Services started:
echo   App:       http://127.0.0.1
echo   API:       http://127.0.0.1/api/health
echo   Swagger:   http://127.0.0.1/api/docs
echo   Keycloak:  http://127.0.0.1:8080
echo   pgAdmin:   http://127.0.0.1:5050
echo.
echo [Darba] Logs: docker-compose logs -f
pause
