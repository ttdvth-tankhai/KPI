@echo off
chcp 65001 >nul
title DONG GOI PHAN MEM V-KPI HD02 THANH FILE .EXE (WINDOWS)
echo ============================================================================
echo   HE THONG DONG GOI TU DONG V-KPI HD02 RA FILE CAI DAT .EXE TREN WINDOWS
echo   (Ap dung cho: Khoi Dang - Hanh chinh Nha nuoc - Trung tam Dich vu tong hop)
echo ============================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] May tinh chua cai dat Node.js!
    echo Vui long tai va cai dat Node.js ban LTS tai: https://nodejs.org/
    pause
    exit /b 1
)

echo [BUOC 1/4] Dang cai dat cac thu vien can thiet (npm install)...
call npm install

echo.
echo [BUOC 2/4] Dang cai dat cong cu dong goi Electron ^& Electron-Builder...
call npm install --save-dev electron electron-builder

echo.
echo [BUOC 3/4] Dang bien dich giao dien V-KPI HD02 (che do Offline Desktop)...
set ELECTRON_BUILD=true
call npm run build

echo.
echo [BUOC 4/4] Dang xuat file cai dat Windows (.EXE) vao thu muc release/...
call npx electron-builder --win --x64

echo.
echo ============================================================================
echo   HOAN TAT! File cai dat .EXE da duoc tao trong thu muc "release\"
echo ============================================================================
if exist "release" explorer "release"
pause
