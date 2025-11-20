/**
 * Test script to diagnose galaxy generation issues
 * Run with: node test-generation.mjs
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/trpc';

async function testGalaxyGeneration() {
  console.log('🚀 Testing Galaxy Generation...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣  Checking server connectivity...');
    const healthCheck = await fetch('http://localhost:3000', { timeout: 5000 });
    if (!healthCheck.ok) {
      console.error('❌ Server not responding');
      process.exit(1);
    }
    console.log('✅ Server is running\n');

    // Test 2: Test the galaxy.generate endpoint
    console.log('2️⃣  Testing galaxy.generate endpoint...');
    
    const testPayload = {
      galaxyName: 'Test Galaxy',
      speciesCount: 3,
      totalYears: 10000,
    };

    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(`${API_URL}/galaxy.generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: testPayload,
      }),
      timeout: 60000,
    });

    const responseText = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers));
    console.log('Response Body:', responseText);

    if (!response.ok) {
      console.error('❌ API returned error');
      try {
        const errorData = JSON.parse(responseText);
        console.error('Error Details:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.error('Raw error:', responseText);
      }
      process.exit(1);
    }

    const data = JSON.parse(responseText);
    console.log('✅ Galaxy generation response received');
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.result?.data?.galaxyId) {
      console.log(`\n✅ SUCCESS! Galaxy created with ID: ${data.result.data.galaxyId}`);
    } else {
      console.log('\n⚠️  Response received but no galaxyId found');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testGalaxyGeneration();
