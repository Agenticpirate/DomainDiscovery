/**
 * Test script to verify domain availability accuracy
 * 
 * Tests:
 * 1. Available domain (should show as available)
 * 2. Taken domain (should show as taken)
 * 3. Premium domain (should show as premium)
 */

const testDomains = [
  { domain: 'youruniquetest12345.com', expected: 'available', description: 'Unique test domain' },
  { domain: 'google.com', expected: 'taken', description: 'Well-known taken domain' },
  { domain: 'raviteja.com', expected: 'premium', description: 'Premium domain listed on GoDaddy' },
  { domain: 'microsoft.com', expected: 'taken', description: 'Major company domain' },
  { domain: 'premium.com', expected: 'premium', description: 'Premium keyword domain' },
];

async function testDomainCheck() {
  console.log('🧪 Testing Domain Availability Accuracy\n');
  console.log('=' .repeat(60));
  
  for (const test of testDomains) {
    console.log(`\n📍 Testing: ${test.domain}`);
    console.log(`   Description: ${test.description}`);
    console.log(`   Expected: ${test.expected.toUpperCase()}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/domains/instant-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: test.domain }),
      });
      
      if (!response.ok) {
        console.log(`   ❌ API Error: ${response.status}`);
        continue;
      }
      
      const result = await response.json();
      console.log(`   Result:`, result);
      
      // Determine actual status
      let actualStatus = 'taken';
      if (result.available && !result.premium) {
        actualStatus = 'available';
      } else if (result.premium) {
        actualStatus = 'premium';
      } else if (!result.available) {
        actualStatus = 'taken';
      }
      
      // Check if matches expected
      const matches = actualStatus === test.expected;
      console.log(`   Actual: ${actualStatus.toUpperCase()}`);
      console.log(`   ${matches ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!matches) {
        console.log(`   ⚠️  Expected ${test.expected} but got ${actualStatus}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Test complete!\n');
}

// Run the test
testDomainCheck().catch(console.error);
