#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

console.log('🧪 Home Hub API Testing Suite\n');

// Test 1: Backend Health Check
async function testBackendHealth() {
    console.log('📊 Test 1: Backend Health Check');
    try {
        const response = await fetch(`${BASE_URL}/api/health`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Backend is healthy');
            console.log(`   Status: ${data.status}`);
            console.log(`   Message: ${data.message}`);
            console.log(`   OAuth Configured: ${data.oauthConfigured}`);
            console.log(`   Calendar ID: ${data.calendarId}`);
            return true;
        } else {
            console.log('❌ Backend health check failed');
            console.log(`   Status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Backend health check error:', error.message);
        return false;
    }
}

// Test 2: Frontend Accessibility
async function testFrontend() {
    console.log('\n🌐 Test 2: Frontend Accessibility');
    try {
        const response = await fetch(FRONTEND_URL);
        
        if (response.ok) {
            console.log('✅ Frontend is accessible');
            console.log(`   Status: ${response.status}`);
            console.log(`   Content-Type: ${response.headers.get('content-type')}`);
            return true;
        } else {
            console.log('❌ Frontend not accessible');
            console.log(`   Status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Frontend error:', error.message);
        return false;
    }
}

// Test 3: OAuth2 Configuration
async function testOAuth2Config() {
    console.log('\n🔐 Test 3: OAuth2 Configuration');
    try {
        const response = await fetch(`${BASE_URL}/auth/google`);
        const data = await response.json();
        
        if (response.ok && data.authUrl) {
            console.log('✅ OAuth2 is configured');
            console.log(`   Auth URL: ${data.authUrl.substring(0, 50)}...`);
            return true;
        } else {
            console.log('❌ OAuth2 configuration failed');
            console.log(`   Status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log('❌ OAuth2 test error:', error.message);
        return false;
    }
}

// Test 4: Calendar API Test
async function testCalendarAPI() {
    console.log('\n📅 Test 4: Calendar API Test');
    try {
        const response = await fetch(`${BASE_URL}/api/calendar/test`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Calendar API test successful');
            console.log(`   Message: ${data.message}`);
            if (data.tests) {
                console.log(`   Calendar List: ${data.tests.calendarList.status}`);
                console.log(`   Events: ${data.tests.events.status}`);
            }
            return true;
        } else if (response.status === 401) {
            console.log('⚠️  Calendar API authentication required (expected)');
            return true;
        } else {
            console.log('❌ Calendar API test failed');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${data.error || 'Unknown error'}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Calendar API error:', error.message);
        return false;
    }
}

// Test 5: Calendar List Endpoint
async function testCalendarList() {
    console.log('\n📋 Test 5: Calendar List Endpoint');
    try {
        const response = await fetch(`${BASE_URL}/api/calendar/list`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Calendar list retrieved');
            console.log(`   Calendars found: ${data.items?.length || 0}`);
            if (data.items && data.items.length > 0) {
                console.log(`   Primary calendar: ${data.items[0].summary}`);
            }
            return true;
        } else if (response.status === 400 || response.status === 401) {
            console.log('⚠️  Calendar list authentication required (expected)');
            return true;
        } else {
            console.log('❌ Calendar list failed');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${data.error || 'Unknown error'}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Calendar list error:', error.message);
        return false;
    }
}

// Test 6: Events Endpoint
async function testEventsEndpoint() {
    console.log('\n📅 Test 6: Events Endpoint');
    try {
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const url = `${BASE_URL}/api/calendar/events?timeMin=${now.toISOString()}&timeMax=${nextWeek.toISOString()}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Events endpoint working');
            console.log(`   Events found: ${data.items?.length || 0}`);
            return true;
        } else if (response.status === 400 || response.status === 401) {
            console.log('⚠️  Events endpoint authentication required (expected)');
            return true;
        } else {
            console.log('❌ Events endpoint failed');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${data.error || 'Unknown error'}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Events endpoint error:', error.message);
        return false;
    }
}

// Test 7: Whisper.cpp Endpoint
async function testWhisperEndpoint() {
    console.log('\n🎤 Test 7: Whisper.cpp Endpoint');
    try {
        const response = await fetch(`${BASE_URL}/api/whisper`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ test: true })
        });
        
        if (response.status === 400) {
            console.log('✅ Whisper endpoint exists (expected no audio file error)');
            return true;
        } else {
            console.log('❌ Whisper endpoint unexpected response');
            console.log(`   Status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Whisper endpoint error:', error.message);
        return false;
    }
}

// Test 8: Proxy Status
async function testProxyStatus() {
    console.log('\n🔄 Test 8: Proxy Status');
    try {
        const response = await fetch(`${BASE_URL}/api/health`);
        const data = await response.json();
        
        if (data.message && data.message.includes('Backend proxy')) {
            console.log('✅ Backend proxy is running');
            console.log(`   Message: ${data.message}`);
            return true;
        } else {
            console.log('❌ Backend proxy status unclear');
            return false;
        }
    } catch (error) {
        console.log('❌ Proxy status error:', error.message);
        return false;
    }
}

// Test 9: Authentication Status
async function testAuthStatus() {
    console.log('\n🔑 Test 9: Authentication Status');
    try {
        const response = await fetch(`${BASE_URL}/api/calendar/test`);
        const data = await response.json();
        
        if (response.status === 401) {
            console.log('⚠️  Authentication required (expected)');
            console.log('   This is normal - you need to authenticate first');
            return true;
        } else if (response.ok) {
            console.log('✅ Already authenticated');
            return true;
        } else {
            console.log('❌ Authentication status unclear');
            console.log(`   Status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Auth status error:', error.message);
        return false;
    }
}

// Test 10: Network Connectivity
async function testNetworkConnectivity() {
    console.log('\n🌐 Test 10: Network Connectivity');
    try {
        const tests = [
        { name: 'Backend (localhost:3001)', url: `${BASE_URL}/api/health` },
            { name: 'Frontend', url: FRONTEND_URL }
        ];
        
        for (const test of tests) {
            try {
                const response = await fetch(test.url, { timeout: 5000 });
                console.log(`✅ ${test.name} - Status: ${response.status}`);
            } catch (error) {
                console.log(`❌ ${test.name} - Error: ${error.message}`);
            }
        }
    } catch (error) {
        console.log('❌ Network test error:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting API Tests...\n');
    
    const results = {
        backendHealth: await testBackendHealth(),
        frontend: await testFrontend(),
        oauth2: await testOAuth2Config(),
        calendarAPI: await testCalendarAPI(),
        calendarList: await testCalendarList(),
        events: await testEventsEndpoint(),
        whisper: await testWhisperEndpoint(),
        proxy: await testProxyStatus(),
        auth: await testAuthStatus()
    };
    
    await testNetworkConnectivity();
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('================');
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    console.log('\n🎯 Next Steps:');
    if (!results.oauth2) {
        console.log('1. Configure Google OAuth2 in .env file');
    }
    if (!results.auth) {
        console.log('2. Authenticate with Google OAuth2');
    }
    if (!results.frontend) {
        console.log('3. Check frontend server is running');
    }
    
    console.log('\n🌐 Access URLs:');
    console.log(`   Frontend: ${FRONTEND_URL}`);
    console.log(`   Backend:  ${BASE_URL}/api/health`);
    console.log(`   OAuth:    ${BASE_URL}/auth/google`);
}

runAllTests().catch(console.error); 
