// Test the participants endpoint directly
console.log('🧪 Testing participants endpoint...');

const testEndpoint = async () => {
  try {
    // Test with a sample vaca ID
    const vacaId = 1; // Change this to an actual vaca ID from your database
    const url = `${API_BASE_URL}/api/participants/vaca/${vacaId}/details`;
    
    console.log('📡 Testing URL:', url);
    
    const response = await fetch(url);
    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response data:', JSON.stringify(data, null, 2));
      
      if (Array.isArray(data)) {
        console.log(`📊 Found ${data.length} participants`);
        data.forEach((participant, index) => {
          console.log(`👤 Participant ${index + 1}:`, {
            id: participant.id,
            name: participant.name,
            email: participant.email,
            status: participant.status
          });
        });
      } else {
        console.log('📊 Response is not an array:', typeof data);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    }
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
};

testEndpoint();
