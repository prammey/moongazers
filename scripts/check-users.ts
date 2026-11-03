// Deprecated: the admin login now comes from ADMIN_USERNAME / ADMIN_PASSWORD_HASH.

console.log('This script is deprecated.');
console.log('');
console.log('The admin login is set by ADMIN_USERNAME / ADMIN_PASSWORD_HASH in Vercel.');
console.log('To check or change it, run:  node scripts/set-admin-password.mjs');
console.log('(If those are unset, the login falls back to the users table, and only');
console.log('bcrypt-hashed passwords there work; plain-text ones are rejected.)');
