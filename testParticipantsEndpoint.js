/**
 * Test script for participants endpoint
 */

const testParticipantsEndpoint = async () => {
  console.log("🧪 Testing participants endpoint...");
  
  const vacaId = 1; // Test with vaca ID 1
  const url = `${API_BASE_URL}/api/participants/vaca/${vacaId}/details`;
  
  try {
    console.log(`📡 Fetching: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log("📊 Response status:", response.status);
    console.log("📊 Response ok:", response.ok);
    console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Success! Response data:", data);
      console.log("👥 Participants count:", data?.participants?.length || 0);
      
      if (data.participants && Array.isArray(data.participants)) {
        console.log("👤 Participants details:");
        data.participants.forEach((p, index) => {
          console.log(`  ${index + 1}. ${p.name} (${p.email}) - Status: ${p.status || 'active'}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.error("❌ Error response:", errorText);
    }
    
  } catch (error) {
    console.error("💥 Fetch error:", error.message);
  }
};

// Execute the test if running in Node.js
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testParticipantsEndpoint();
} else {
  // Browser environment
  window.testParticipantsEndpoint = testParticipantsEndpoint;
  console.log("Test function available as window.testParticipantsEndpoint()");
}

export default testParticipantsEndpoint;
