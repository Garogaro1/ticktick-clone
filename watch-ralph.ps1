$plan = Get-Content "IMPLEMENTATION_PLAN.md" -Raw
if ($plan -match "\*\*Status:\*\* (.+)") { Write-Host "Status: $($matches[1])" -ForegroundColor Green }
if ($plan -match "\*\*Current Phase:\*\* (.+)") { Write-Host "Phase:  $($matches[1])" -ForegroundColor Yellow }
if ($plan -match "\*\*Completion:\*\* (.+)") { Write-Host "Done:   $($matches[1])" -ForegroundColor Cyan }
$lastCommit = git log -1 --oneline 2>$null
if ($lastCommit) { Write-Host "Last: $lastCommit" -ForegroundColor White }
Write-Host ""
