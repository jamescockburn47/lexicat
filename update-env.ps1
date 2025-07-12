# PowerShell script to update .env file with OAuth2 credentials

Write-Host "🔧 Updating .env file with OAuth2 credentials..." -ForegroundColor Green

# Read current .env file
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue

# Create new content with OAuth2 credentials
$newContent = @"
# Google Calendar OAuth2 Configuration
VITE_GOOGLE_CLIENT_ID=440228965192-ds3h66bm9lqp9ve9m5fe7eu802cg091j.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
VITE_GOOGLE_CALENDAR_ID=james.a.cockburn@gmail.com

# OpenAI API for Whisper Voice Control
VITE_OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
VITE_APP_NAME=Home Hub
VITE_APP_VERSION=1.0.0
"@

# Write new content to .env file
$newContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ .env file updated!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to Google Cloud Console > APIs & Services > Credentials" -ForegroundColor White
Write-Host "2. Find your OAuth2 client and copy the Client Secret" -ForegroundColor White
Write-Host "3. Replace 'YOUR_CLIENT_SECRET_HERE' in the .env file" -ForegroundColor White
Write-Host "4. Make sure the redirect URI is set to: http://localhost:3001/auth/google/callback" -ForegroundColor White
Write-Host "5. Restart the backend server: npm run server" -ForegroundColor White 