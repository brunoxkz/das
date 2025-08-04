# 🚀 INSTRUÇÕES DE INSTALAÇÃO - B2T EXCHANGE

## 📋 ARQUIVOS INCLUSOS
- `index.html` - Site principal B2T Exchange
- `.htaccess` - Configurações do servidor Apache
- `INSTRUCOES-INSTALACAO.md` - Este arquivo

## 🌐 INSTALAÇÃO NO GODADDY

### 1. ACESSE O CPANEL
- Entre no seu painel GoDaddy
- Clique em "File Manager" ou "Gerenciador de Arquivos"

### 2. NAVEGUE PARA A PASTA PÚBLICA
- Vá para `/public_html/` (pasta raiz do seu domínio)
- Se for subdomínio, vá para `/public_html/subdominio/`

### 3. FAÇA UPLOAD DOS ARQUIVOS
- Upload de todos os arquivos desta pasta
- Certifique-se que `index.html` está na raiz
- O `.htaccess` deve estar junto com o `index.html`

### 4. CONFIGURAÇÕES DE PERMISSÃO
- `index.html` → 644 (rw-r--r--)
- `.htaccess` → 644 (rw-r--r--)

## ✅ VERIFICAÇÃO

Acesse seu domínio:
- `https://seudominio.com` deve mostrar o site B2T Exchange
- Design responsivo funcionando
- Todas as seções carregando corretamente

## 🔧 SOLUÇÃO DE PROBLEMAS

### Site não carrega:
1. Verifique se `index.html` está na pasta correta
2. Confirme permissões 644
3. Teste desabilitando SSL temporariamente

### Layout quebrado:
1. Verifique se não há cache do navegador
2. Force refresh com Ctrl+F5
3. Aguarde alguns minutos para DNS propagar

### Erro 500:
1. Verifique sintaxe do `.htaccess`
2. Remova temporariamente o `.htaccess` e teste
3. Entre em contato com suporte GoDaddy se persistir

## 📞 SUPORTE
Se tiver problemas, entre em contato com o suporte técnico com estas informações:
- Versão: B2T Exchange Static v1.0
- Data: $(date)
- Arquivos: index.html + .htaccess + instruções

---
**Site 100% funcional para hospedagem compartilhada GoDaddy**