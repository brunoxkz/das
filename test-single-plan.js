import fetch from 'node-fetch';

const API_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';

async function testPlanEndpoint() {
  try {
    console.log('🔍 Testando endpoint sem auth...');
    const response = await fetch(`${API_URL}/api/stripe/plans/YeIVDpw7yDSfftA6bxRG8`);
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.get('content-type'));
    const result = await response.text();
    console.log('Response:', result);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testPlanEndpoint();