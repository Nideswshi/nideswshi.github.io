@echo off
setlocal

cd /d "%~dp0"

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo This script must be run inside the blog git repository.
  exit /b 1
)

for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
if not defined CURRENT_BRANCH (
  echo Could not determine the current git branch.
  exit /b 1
)

set "COMMIT_MESSAGE=%~1"
if "%COMMIT_MESSAGE%"=="" (
  set "COMMIT_MESSAGE=Update blog content"
)

echo Repository: %CD%
echo Branch: %CURRENT_BRANCH%
echo Commit message: %COMMIT_MESSAGE%
echo.
echo This will stage and push all current changes in this repository.
echo.

git status --short
if errorlevel 1 (
  echo Failed to read git status.
  exit /b 1
)

for /f %%i in ('git status --porcelain') do set "HAS_CHANGES=1"
if not defined HAS_CHANGES (
  echo No changes to commit.
  exit /b 0
)

git add -A
if errorlevel 1 (
  echo git add failed.
  exit /b 1
)

git commit -m "%COMMIT_MESSAGE%"
if errorlevel 1 (
  echo git commit failed.
  exit /b 1
)

git push origin %CURRENT_BRANCH%
if errorlevel 1 (
  echo git push failed.
  exit /b 1
)

echo.
echo Done. GitHub Actions should now deploy the site automatically.
exit /b 0
