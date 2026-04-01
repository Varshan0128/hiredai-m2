$ErrorActionPreference = "Stop"
$repoRoot = "C:\Users\SIVA BALAJI\OneDrive\Desktop\duplicate\hired.ai"
$envFile = Join-Path $repoRoot ".env"
Set-Location "C:\Users\SIVA BALAJI\OneDrive\Desktop\duplicate\hired.ai\Backend\Spring_Boot\heiredAi\heiredAi"

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

if (-not $env:SPRING_DATASOURCE_URL -and $env:HEIREDAI_JDBC_URL) { $env:SPRING_DATASOURCE_URL = $env:HEIREDAI_JDBC_URL }
if (-not $env:SPRING_DATASOURCE_USERNAME -and $env:HEIREDAI_JDBC_USERNAME) { $env:SPRING_DATASOURCE_USERNAME = $env:HEIREDAI_JDBC_USERNAME }
if (-not $env:SPRING_DATASOURCE_PASSWORD -and $env:HEIREDAI_JDBC_PASSWORD) { $env:SPRING_DATASOURCE_PASSWORD = $env:HEIREDAI_JDBC_PASSWORD }
if (-not $env:SPRING_JPA_DATABASE_PLATFORM) { $env:SPRING_JPA_DATABASE_PLATFORM = "org.hibernate.dialect.PostgreSQLDialect" }
if (-not $env:SPRING_JPA_HIBERNATE_DDL_AUTO) { $env:SPRING_JPA_HIBERNATE_DDL_AUTO = "update" }
if (-not $env:SPRING_JPA_SHOW_SQL) { $env:SPRING_JPA_SHOW_SQL = "true" }

.\mvnw.cmd spring-boot:run *>> "heiredAi_run.log"
