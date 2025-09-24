// This script is deprecated - Admin users should be created directly via SQL
// Example SQL query:
// INSERT INTO users (id, username, password, name) 
// VALUES ('<unique-id>', '<your-username>', '<your-password>', '<your-name>');

console.log('⚠️  This script is deprecated.');
console.log('📝 Create admin users directly in your database using SQL:');
console.log('');
console.log('   INSERT INTO users (id, username, password, name)');
console.log('   VALUES (\'<unique-id>\', \'<your-username>\', \'<your-password>\', \'<your-name>\');');
console.log('');
console.log('✅ The authentication system will read from the database automatically.');