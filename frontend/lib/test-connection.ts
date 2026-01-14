// Utility to test backend connection
// This can be called from browser console: testBackendConnection()

export async function testBackendConnection() {
  // Use environment variable or default to production Render URL
  // For local development, set NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1 in .env.local
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://community-portal-9uek.onrender.com/api/v1';
  const BASE_URL = API_URL.replace('/api/v1', '');
  
  try {
    console.log('Testing backend connection...');
    console.log('API URL:', API_URL);
    
    // Test health endpoint
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test API info endpoint
    const apiResponse = await fetch(`${API_URL}`);
    const apiData = await apiResponse.json();
    console.log('✅ API info:', apiData);
    
    return { success: true, health: healthData, api: apiData };
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.error(`Make sure the backend server is accessible at ${BASE_URL}`);
    return { success: false, error: error.message };
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testBackendConnection = testBackendConnection;
}
