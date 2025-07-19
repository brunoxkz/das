const fs = require('fs');

// Ler o arquivo routes-sqlite.ts
let content = fs.readFileSync('server/routes-sqlite.ts', 'utf8');

// Procurar por qualquer implementação de login existente e substituit
const loginEndpointRegex = /app\.post\(['"]\/api\/auth\/login['"][^}]*}[\s]*\);/gs;

const newLoginEndpoint = `
  // ✅ LOGIN ENDPOINT CORRIGIDO
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Buscar usuário
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verificar senha
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Gerar tokens
      const jwt = require('jsonwebtoken');
      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { id: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
        { expiresIn: '7d' }
      );

      // Atualizar refresh token no usuário
      await storage.updateUser(user.id, { refreshToken });

      // Remover senha da resposta
      const { password: _, ...userSafeData } = user;

      res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: userSafeData
      });

    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });`;

// Remover qualquer endpoint de login existente
content = content.replace(loginEndpointRegex, '');

// Procurar um local adequado para inserir (antes do último export ou no final)
const insertionPoint = content.lastIndexOf('export');
if (insertionPoint > -1) {
  content = content.slice(0, insertionPoint) + newLoginEndpoint + '\n\n' + content.slice(insertionPoint);
} else {
  content += newLoginEndpoint;
}

// Salvar o arquivo
fs.writeFileSync('server/routes-sqlite.ts', content);
console.log('✅ Endpoint de login corrigido e inserido no routes-sqlite.ts');
