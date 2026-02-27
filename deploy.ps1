<#
PowerShell deployment helper for Windows -> VPS 103.139.154.65
Usage from local machine:
  .\deploy.ps1 -User ubuntu -Target "/var/www/myapp"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$User,

    [Parameter(Mandatory=$true)]
    [string]$Target
)

$VpsIp = "103.139.154.65"
$RepoUrl = "https://github.com/your/repo.git"   # update with your repo

function Exec-Remote([string]$cmd) {
    ssh $User@$VpsIp $cmd
}

Write-Host "Creating directory $Target on VPS" -ForegroundColor Cyan
Exec-Remote "mkdir -p $Target; chown $User:$User $Target"

Write-Host "Syncing files via rsync (requires Git Bash/WSL)" -ForegroundColor Cyan
# if rsync not available, fallback to scp
if (Get-Command rsync -ErrorAction SilentlyContinue) {
    rsync -avz --exclude='.git' --exclude='node_modules' --exclude='frontend/build' --exclude='*.pyc' --exclude='__pycache__' ./ $User@$VpsIp:`"$Target/`"
} else {
    Write-Warning "rsync not found; using scp (slower)"
    scp -r -p -q ./* $User@$VpsIp:`"$Target/`"
}

Write-Host "Running setup on VPS" -ForegroundColor Green
$remoteScript = @'
set -e
cd $Target

if [ -d .git ]; then
  git pull
else
  git clone $RepoUrl .
fi

if [ -f backend/package.json ]; then
  cd backend
  npm ci
  cd ..
fi

if [ -f frontend/package.json ]; then
  cd frontend
  npm ci
  npm run build
  cd ..
fi

if command -v python3 >/dev/null 2>&1; then
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -r celery/requirements.txt || true
  deactivate
fi

# optionally restart services
# pm2 reload all
# sudo systemctl restart myapp.service
'@

# Use SSH to run the multi-line script
ssh $User@$VpsIp $remoteScript

Write-Host "Deployment to $VpsIp completed." -ForegroundColor Yellow
