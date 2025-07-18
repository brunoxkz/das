import fetch from 'node-fetch';

const API_URL = 'https://51f74588-7b5b-4e89-adab-b70610c96e0b-00-zr6ug9hu0yss.janeway.replit.dev';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyODEwMTY0LCJub25jZSI6IjlxMmFtbSIsImV4cCI6MTc1MjgxMTA2NH0.DnEDeLVfW-D24Fny2qSDjJpejuCSPU2fGkfDOMwWzh4';

async function getPlans() {
  try {
    const response = await fetch(`${API_URL}/api/stripe/plans`, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });
    
    if (!response.ok) {
      console.error('Erro:', response.status, response.statusText);
      return;
    }
    
    const plans = await response.json();
    console.log('Planos disponíveis:', JSON.stringify(plans, null, 2));
    
    if (plans.length > 0) {
      console.log('\nPrimeiro plano ID:', plans[0].id);
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

getPlans();