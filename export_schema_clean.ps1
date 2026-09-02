# export_schema_clean.ps1
# Script para exportar solo el schema limpio de Neon (sin datos ni referencias de Neon)

Write-Host "========================================" -ForegroundColor Green
Write-Host "DB: Exportando Schema Limpio de Neon" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Variables de conexión
$DB_HOST = "ep-crimson-glade-ac1lc5r7.sa-east-1.aws.neon.tech"
$DB_PORT = "5432"
$DB_USER = "neondb_owner"
$DB_PASS = "npg_9LcaOsopVu8U"
$DB_NAME = "neondb"

# Archivo temporal
$temp_file = "db_schema_temp.sql"
$output_file = "db_schema_latest.sql"

Write-Host "`nPaso 1: Exportando schema desde Neon..." -ForegroundColor Cyan

# Exportar schema only
$env:PGPASSWORD = $DB_PASS
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" `
    --schema-only `
    --no-owner `
    --no-privileges `
    -U $DB_USER `
    -h $DB_HOST `
    -d $DB_NAME `
    -f $temp_file

if ($?) {
    Write-Host "[OK] Export exitoso" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Error en export" -ForegroundColor Red
    exit 1
}

Write-Host "`nPaso 2: Limpiando referencias de Neon..." -ForegroundColor Cyan

# Leer contenido
$content = Get-Content $temp_file -Raw

# Eliminar secciones completas de playing_with_neon (desde el comentario hasta la siguiente tabla)
$content = $content -replace "(?s)--.*?playing_with_neon.*?(?=--|$)", ""

# Eliminar línea de restrict
$content = $content -replace "\\restrict.*?\n", ""

# Eliminar todas las líneas "OWNER TO" y "GRANTED"
$lines = $content -split "`n"
$lines = $lines | Where-Object { 
    $_ -notmatch 'OWNER TO' -and `
    $_ -notmatch 'ALTER TABLE.*OWNER' -and `
    $_ -notmatch 'ALTER SEQUENCE.*OWNER' -and `
    $_ -notmatch 'GRANT ' -and `
    $_ -notmatch 'playing_with_neon'
}
$content = $lines -join "`n"

# Eliminar líneas vacías múltiples
$content = $content -replace "(?m)^\s*`n{2,}", "`n`n"

# Guardar archivo limpio
$content | Set-Content $output_file

# Eliminar temporal
Remove-Item $temp_file -Force

Write-Host "[OK] Schema limpiado" -ForegroundColor Green

Write-Host "`nPaso 3: Resumen..." -ForegroundColor Cyan

# Contar tablas
$tables = (Select-String -Path $output_file -Pattern "CREATE TABLE" | Measure-Object).Count
Write-Host "[INFO] Tablas encontradas: $tables" -ForegroundColor Yellow

# Listar tablas
Write-Host "`nTablas en el backup:" -ForegroundColor Cyan
Select-String -Path $output_file -Pattern "CREATE TABLE public\.(\w+)" | ForEach-Object {
    $table = $_.Matches.Groups[1].Value
    Write-Host "   - $table" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "[EXITO] Archivo listo: $output_file" -ForegroundColor Green
Write-Host "[INFO] Puedes compartirlo con tu colega" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
