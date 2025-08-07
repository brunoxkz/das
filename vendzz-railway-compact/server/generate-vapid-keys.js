import webpush from 'web-push';

// Gerar chaves VAPID para push notifications
const vapidKeys = webpush.generateVAPIDKeys();

console.log('🔑 CHAVES VAPID GERADAS:');
console.log('');
console.log('PUBLIC KEY:');
console.log(vapidKeys.publicKey);
console.log('');
console.log('PRIVATE KEY:');
console.log(vapidKeys.privateKey);
console.log('');
console.log('📝 Adicione essas chaves ao seu .env:');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('');
console.log('✅ Chaves geradas com sucesso!');