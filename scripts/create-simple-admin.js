// Deprecated: the admin login now comes from ADMIN_USERNAME / ADMIN_PASSWORD_HASH.
// Use scripts/set-admin-password.mjs instead.

console.log('This script is deprecated. Plain-text passwords in the users table no longer work.');
console.log('');
console.log('To set or change the admin login, run:');
console.log('   node scripts/set-admin-password.mjs');
console.log('It prints ADMIN_USERNAME and ADMIN_PASSWORD_HASH to add in Vercel (then redeploy).');
