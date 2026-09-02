# Buscar pg_dump en la máquina
Write-Host "Buscando pg_dump..." -ForegroundColor Cyan

$pgPaths = @(
    "C:\Program Files\PostgreSQL\*\bin\pg_dump.exe",
    "C:\Program Files (x86)\PostgreSQL\*\bin\pg_dump.exe",
    "C:\PostgreSQL\*\bin\pg_dump.exe"
)

$found = $false

foreach ($pattern in $pgPaths) {
    $result = Get-Item $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($result) {
        Write-Host "`n[ENCONTRADO]" -ForegroundColor Green
        Write-Host "Ruta: $($result.FullName)" -ForegroundColor Yellow
        Write-Host "`nCopia esta ruta y actualiza el script export_schema_clean.ps1" -ForegroundColor Cyan
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host "`n[NO ENCONTRADO]" -ForegroundColor Red
    Write-Host "PostgreSQL no está en las rutas comunes" -ForegroundColor Red
    Write-Host "`nIntenta instalarlo:" -ForegroundColor Yellow
    Write-Host "  1. Descargar: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    Write-Host "  2. Instalar normalmente" -ForegroundColor Gray
    Write-Host "  3. Reiniciar PowerShell y ejecutar este script nuevamente" -ForegroundColor Gray
}
