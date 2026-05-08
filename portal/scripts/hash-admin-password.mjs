import { randomBytes, scryptSync } from 'node:crypto';

const password = process.argv[2] ?? process.env.ADMIN_PASSWORD ?? '';

if (!password) {
  console.error('Usage: npm -w portal run hash:admin-password -- "password"');
  process.exit(1);
}

const salt = randomBytes(16);
const key = scryptSync(password, salt, 64);

console.log(`scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`);
