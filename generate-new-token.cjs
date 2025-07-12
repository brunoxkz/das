/**
 * SCRIPT PARA GERAR NOVO TOKEN DE ACESSO
 * Gera um novo token JWT para o usuário admin
 */

const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');

function generateNewToken() {
  const db = new Database('db.sqlite');
  
  try {
    // Obter dados do usuário admin
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get('admin@vendzz.com');
    
    if (!user) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }
    
    console.log('✅ Usuário admin encontrado:', user.email);
    
    // Gerar novo token de acesso
    const jwtSecret = process.env.JWT_SECRET || 'vendzz-jwt-secret-key-2024-super-secure';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'vendzz-refresh-secret-key-2024-ultra-secure';
    
    const accessToken = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        plan: user.plan,
        role: user.role,
        type: 'access'
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    const refreshToken = jwt.sign(
      { 
        id: user.id,
        type: 'refresh',
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(2, 7)
      },
      refreshSecret,
      { expiresIn: '7d' }
    );
    
    // Atualizar refresh token no banco
    db.prepare("UPDATE users SET refreshToken = ? WHERE id = ?").run(refreshToken, user.id);
    
    console.log('\n🔑 NOVOS TOKENS GERADOS:');
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    
    console.log('\n📋 INSTRUÇÕES:');
    console.log('1. Copie o Access Token acima');
    console.log('2. Abra o DevTools do navegador (F12)');
    console.log('3. Vá na aba Application > Local Storage');
    console.log('4. Procure por "vendzz_token" e substitua o valor');
    console.log('5. Faça o mesmo com "vendzz_refresh_token"');
    console.log('6. Recarregue a página');
    
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error);
  } finally {
    db.close();
  }
}

generateNewToken();