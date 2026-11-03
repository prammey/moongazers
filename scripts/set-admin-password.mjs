// Prints ADMIN_USERNAME / ADMIN_PASSWORD_HASH lines to paste into Vercel.
// The password is typed hidden and is never written or printed.
// Usage: node scripts/set-admin-password.mjs
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import bcryptjs from 'bcryptjs';

// Readline echoes keystrokes through this stream; muting it hides the password
let muted = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!muted) process.stdout.write(chunk, encoding);
    callback();
  },
});
const rl = createInterface({ input: process.stdin, output, terminal: true });
const lines = rl[Symbol.asyncIterator]();

async function ask(question) {
  rl.setPrompt(question);
  rl.prompt();
  const { value = '' } = await lines.next();
  return value;
}

async function askHidden(question) {
  process.stdout.write(question);
  muted = true;
  const { value = '' } = await lines.next();
  muted = false;
  process.stdout.write('\n');
  return value;
}

const username = (await ask('Admin username: ')).trim();
const password = await askHidden('Password (hidden): ');
const confirm = await askHidden('Type it again: ');
rl.close();

if (!username || !password) {
  console.error('Username and password are both required.');
  process.exit(1);
}
if (password !== confirm) {
  console.error('Passwords did not match. Nothing was generated.');
  process.exit(1);
}

const hash = await bcryptjs.hash(password, 12);

console.log('\nAdd these two environment variables in Vercel, then redeploy:\n');
console.log(`ADMIN_USERNAME=${username}`);
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
// Next.js expands $VARS inside .env files, which would mangle the hash
console.log('\n(For a local .env file, write every $ in the hash as \\$.)');
