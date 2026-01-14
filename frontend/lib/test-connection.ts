// Utility to test backend connection
// This can be called from browser console: testBackendConnection()

export async function testBackendConnection() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  
  try {
    console.log('Testing backend connection...');
    console.log('API URL:', API_URL);
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test API info endpoint
    const apiResponse = await fetch(`${API_URL}`);
    const apiData = await apiResponse.json();
    console.log('✅ API info:', apiData);
    
    return { success: true, health: healthData, api: apiData };
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.error('Make sure the backend server is running on http://localhost:5000');
    return { success: false, error: error.message };
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testBackendConnection = testBackendConnection;
}
