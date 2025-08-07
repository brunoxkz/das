import fetch from 'node-fetch';

async function testarAuth() {
  try {
    // Login
    const loginResponse = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@vendzz.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login data:', loginData);
    
    if (!loginData.accessToken) {
      console.error('No access token received');
      return;
    }
    
    const token = loginData.accessToken;
    console.log('Token:', token.substring(0, 50) + '...');
    
    // Testar endpoint de verificação de auth
    const authResponse = await fetch('https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Auth verify status:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('Auth data:', authData);
    } else {
      console.error('Auth verify failed:', authResponse.statusText);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testarAuth();