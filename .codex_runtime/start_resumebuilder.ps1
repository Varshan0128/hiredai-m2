$ErrorActionPreference = "Stop"
$repoRoot = "C:\Users\SIVA BALAJI\OneDrive\Desktop\duplicate\hired.ai"
$envFile = Join-Path $repoRoot ".env"
Set-Location "C:\Users\SIVA BALAJI\OneDrive\Desktop\duplicate\hired.ai\Backend\Spring_Boot\RESUMEBUILDER\RESUMEBUILDER"

if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) { return }
    if ($line -match "^\s*([^=]+)=(.*)$") {
      $name = $matches[1].Trim()
      $value = $matches[2]
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

.\mvnw.cmd spring-boot:run *>> "resumebuilder_run.log"
