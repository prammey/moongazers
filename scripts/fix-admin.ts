// This script is deprecated - Admin users should be managed directly via SQL
// Example SQL queries:

console.log('⚠️  This script is deprecated.');
console.log('📝 Manage admin users directly in your database using SQL:');
console.log('');
console.log('🗑️  Delete existing admin:');
console.log('   DELETE FROM users WHERE username = \'<your-username>\';');
console.log('');
console.log('➕ Create new admin:');
console.log('   INSERT INTO users (id, username, password, name)');
console.log('   VALUES (\'<unique-id>\', \'<your-username>\', \'<your-password>\', \'<your-name>\');');
console.log('');
console.log('✅ The authentication system will read from the database automatically.');