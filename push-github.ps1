<#
.SYNOPSIS
  push-github.ps1 — Automatiza la subida de cambios y respaldo del repositorio a GitHub.
  🥑 by aoxilus · CC BY-NC-SA 4.0

.DESCRIPTION
  Agrega todos los cambios locales, realiza el commit con un mensaje personalizado o
  con marca de tiempo automática y realiza el push a origin en la rama actual.

.EXAMPLE
  .\push-github.ps1
  .\push-github.ps1 -Message "docs: actualizar documentacion bilingue"
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

# Estilos visuales
function Write-Header {
    param([string]$Text)
    Write-Host "`n  ========================================================" -ForegroundColor DarkGreen
    Write-Host "   🥑 $Text" -ForegroundColor Green -BackgroundColor Black
    Write-Host "  ========================================================`n" -ForegroundColor DarkGreen
}

function Write-Step {
    param([string]$Emoji, [string]$Text)
    Write-Host "  $Emoji $Text" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "  ✅ $Text" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Text)
    Write-Host "  ⚠️ $Text" -ForegroundColor Yellow
}

function Write-Failure {
    param([string]$Text)
    Write-Host "  ❌ $Text" -ForegroundColor Red
}

Set-Location $PSScriptRoot
Write-Header "atmosfera — GitHub Sync & Backup"

# 1. Verificar Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Failure "Git no está instalado o no se encuentra en el PATH."
    exit 1
}

# 2. Detectar rama actual
try {
    $currentBranch = (git branch --show-current).Trim()
    if (-not $currentBranch) {
        $currentBranch = "master"
    }
    Write-Step "🌿" "Rama actual: $currentBranch"
} catch {
    Write-Failure "No se pudo determinar la rama actual de Git."
    exit 1
}

# 3. Revisar estado de cambios
$status = (git status --porcelain)

if (-not $status) {
    Write-Warn "No hay cambios locales pendientes por commitear."
    
    # Verificar si hay commits locales sin subir
    $unpushed = (git log origin/$currentBranch..HEAD --oneline 2>$null)
    if ($unpushed) {
        Write-Step "🚀" "Subiendo commits locales pendientes a origin/$currentBranch..."
        git push origin $currentBranch
        Write-Success "¡Repositorio sincronizado y al día con GitHub!"
    } else {
        Write-Success "El repositorio ya está 100% al día con GitHub."
    }
    exit 0
}

# 4. Mostrar archivos modificados
Write-Step "📁" "Archivos modificados detectados:"
git status -s | ForEach-Object { Write-Host "     $_" -ForegroundColor DarkYellow }

# 5. Determinar mensaje de commit
if ([string]::IsNullOrWhiteSpace($Message)) {
    $defaultMsg = "🥑 update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $userInput = Read-Host "`n  💬 Mensaje de commit (Presiona Enter para usar: '$defaultMsg')"
    if ([string]::IsNullOrWhiteSpace($userInput)) {
        $Message = $defaultMsg
    } else {
        $Message = $userInput
    }
}

# 6. Ejecutar Git Add, Commit y Push
try {
    Write-Step "📦" "Añadiendo archivos..."
    git add -A

    Write-Step "✍️" "Creando commit: '$Message'..."
    git commit -m "$Message"

    Write-Step "🚀" "Subiendo a origin/$currentBranch..."
    git push origin $currentBranch

    Write-Success "¡Cambios subidos exitosamente a GitHub!"
    Write-Host "`n  🌐 Repositorio: https://github.com/aoxilus/atmosfera`n" -ForegroundColor DarkCyan
} catch {
    Write-Failure "Ocurrió un error al subir a GitHub: $_"
    exit 1
}
