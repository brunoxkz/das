/**
 * CORREÇÃO URGENTE - TOKEN DE AUTENTICAÇÃO
 * Script para corrigir o token no localStorage e resolver sidebar sumida
 */

const newToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsImVtYWlsIjoiYWRtaW5AdmVuZHp6LmNvbSIsInJvbGUiOiJhZG1pbiIsInBsYW4iOiJlbnRlcnByaXNlIiwiaWF0IjoxNzUyMjgyNzgwLCJub25jZSI6InA4OWJiIiwiZXhwIjoxNzUyMjgzNjgwfQ.FTiVLiS_NQFC5Z07iuwoT6hNOK0CXGg9m6kUrzEEIi8";
const newRefreshToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFFYVk2dkUwcllBa1RYdjV2SENsbSIsInR5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNzUyMjgyNzgwLCJ0aW1lc3RhbXAiOjE3NTIyODI3ODA0MDgsIm5vbmNlIjoicDg5YmIiLCJleHAiOjE3NTI4ODc1ODB9.ydQDeaLcp_EQxC1ulnC4w8L_irWJlkSmqR3PXUwSN0Q";

console.log("🔧 CORRIGINDO TOKEN DE AUTENTICAÇÃO");
console.log("📋 INSTRUÇÕES PARA CORRIGIR A SIDEBAR:");
console.log("1. Abra o DevTools (F12)");
console.log("2. Vá em Application > Local Storage");
console.log("3. Localize o domínio do seu projeto");
console.log("4. Atualize as seguintes chaves:");
console.log("");
console.log("accessToken:", newToken);
console.log("");
console.log("refreshToken:", newRefreshToken);
console.log("");
console.log("5. Recarregue a página");
console.log("");
console.log("✅ A sidebar deve reaparecer após essas atualizações!");