#!/bin/bash

echo "🔐 Starting Google OAuth2 Authentication..."
echo ""

# Get the auth URL
AUTH_RESPONSE=$(curl -s http://localhost:3001/auth/google)
AUTH_URL=$(echo $AUTH_RESPONSE | grep -o '"authUrl":"[^"]*"' | cut -d'"' -f4)

if [ -z "$AUTH_URL" ]; then
    echo "❌ Failed to get authentication URL"
    exit 1
fi

echo "📋 Authentication URL:"
echo "$AUTH_URL"
echo ""
echo "🔗 Please:"
echo "1. Click the URL above (or copy/paste into your browser)"
echo "2. Complete the Google OAuth2 authentication"
echo "3. Copy the 'code' parameter from the redirect URL"
echo "4. Paste it here when prompted"
echo ""

read -p "Enter the authorization code: " AUTH_CODE

if [ -z "$AUTH_CODE" ]; then
    echo "❌ No authorization code provided"
    exit 1
fi

echo "🔄 Exchanging code for tokens..."
TOKEN_RESPONSE=$(curl -s "http://localhost:3001/auth/google/callback?code=$AUTH_CODE")

if echo "$TOKEN_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Authentication successful!"
    echo "🔐 Tokens have been saved and will persist between server restarts"
    echo ""
    echo "🎉 You can now access your calendar at: http://localhost:5173/"
else
    echo "❌ Authentication failed:"
    echo "$TOKEN_RESPONSE"
fi 