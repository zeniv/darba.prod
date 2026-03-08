@echo off
echo [Darba] Starting development environment...
docker-compose down && docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
echo.
echo [Darba] Services started:
echo   Frontend:  http://localhost:3000
echo   API:       http://localhost:8000
echo   Keycloak:  http://localhost:8080
echo   PgAdmin:   connect to localhost:5432
echo   Redis:     localhost:6379
echo.
echo [Darba] Logs: docker-compose logs -f
pause
