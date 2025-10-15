import { getApiUrl } from '../config/environment';

export const testApiConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(getApiUrl('/'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
};