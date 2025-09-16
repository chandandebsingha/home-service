import { apiService } from '../services/api';

// Test connection to backend
export const testBackendConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('Testing backend connection...');
    
    // Test health check endpoint
    const healthResponse = await apiService.healthCheck();
    
    if (healthResponse.success) {
      console.log('✅ Backend connection successful');
      return {
        success: true,
        message: 'Backend connection successful',
        details: healthResponse.data,
      };
    } else {
      console.log('❌ Backend connection failed:', healthResponse.error);
      return {
        success: false,
        message: `Backend connection failed: ${healthResponse.error}`,
      };
    }
  } catch (error) {
    console.log('❌ Backend connection error:', error);
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

// Test authentication endpoints
export const testAuthEndpoints = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('Testing authentication endpoints...');
    
    // Test with invalid credentials to check if endpoint is reachable
    const loginResponse = await apiService.login({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    
    // We expect this to fail, but we want to check if the endpoint is reachable
    if (loginResponse.success) {
      return {
        success: true,
        message: 'Auth endpoints are reachable (unexpected success)',
        details: loginResponse,
      };
    } else if (loginResponse.error?.includes('Invalid credentials') || 
               loginResponse.error?.includes('User not found') ||
               loginResponse.error?.includes('Invalid email or password')) {
      return {
        success: true,
        message: 'Auth endpoints are reachable and responding correctly',
        details: { error: loginResponse.error },
      };
    } else {
      return {
        success: false,
        message: `Auth endpoint error: ${loginResponse.error}`,
      };
    }
  } catch (error) {
    console.log('❌ Auth endpoint test error:', error);
    return {
      success: false,
      message: `Auth endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

// Run all connection tests
export const runConnectionTests = async (): Promise<void> => {
  console.log('🚀 Starting connection tests...');
  
  const healthTest = await testBackendConnection();
  console.log('Health check:', healthTest);
  
  const authTest = await testAuthEndpoints();
  console.log('Auth test:', authTest);
  
  if (healthTest.success && authTest.success) {
    console.log('✅ All connection tests passed!');
  } else {
    console.log('❌ Some connection tests failed');
  }
};
