@echo off
chcp 65001 > nul
echo ====================================================
echo   Iniciando Ambiente de Desenvolvimento Local
echo ====================================================
echo.

echo [1/3] Garantindo que o Banco de Dados (PostgreSQL) e MinIO estão rodando...
docker compose up -d db minio traefik
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao iniciar containers do banco/minio. Certifique-se de que o Docker Desktop está aberto.
    pause
    exit /b %errorlevel%
)
echo Banco de Dados e MinIO estão prontos!
echo.

echo [2/3] Iniciando o Servidor do Backend em uma nova janela...
start "Backend Dev Server" cmd /k "cd Plataforma-Redacao && npm run dev"

echo [3/3] Iniciando o Servidor do Frontend em uma nova janela...
start "Frontend Dev Server" cmd /k "cd Plataforma-Redacao-front && npm run dev"

echo.
echo ====================================================
echo   Sucesso! Backend (porta 3000) e Frontend (porta 5173) iniciados.
echo ====================================================
echo.
