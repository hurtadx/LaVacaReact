const http = require('http');

// Function to test the participants endpoint
function testEndpoint(vacaId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: `/api/participants/vaca/${vacaId}/details`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Raw response:', data);
        
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log('Parsed JSON:', json);
            resolve(json);
          } catch (e) {
            console.log('JSON parse error:', e.message);
            resolve(data);
          }
        } else {
          console.log('HTTP Error:', res.statusCode, data);
          resolve({ error: res.statusCode, message: data });
        }
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err.message);
      reject(err);
    });

    req.end();
  });
}

// Test with different vaca IDs
async function runTests() {
  console.log('🧪 Testing participants endpoint...');
  
  for (const vacaId of [1, 2, 3, 5]) {
    console.log(`\n📡 Testing vaca ID: ${vacaId}`);
    try {
      const result = await testEndpoint(vacaId);
      console.log(`✅ Vaca ${vacaId} result:`, result);
    } catch (error) {
      console.log(`❌ Vaca ${vacaId} error:`, error.message);
    }
  }
}

runTests().then(() => {
  console.log('\n🏁 Tests completed');
}).catch(err => {
  console.error('Test suite error:', err);
});
