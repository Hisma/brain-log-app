import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function deleteUser() {
  try {
    console.log('🗑️  Deleting existing admin user...');
    
    // Delete the user
    const result = await sql`
      DELETE FROM "User" 
      WHERE username = 'Hisma' OR email = 'richard.meyer596@gmail.com'
      RETURNING username, email
    `;
    
    if (result.length > 0) {
      console.log('✅ Deleted user:', result[0]);
    } else {
      console.log('ℹ️  No user found to delete');
    }
    
    console.log('✅ Ready to create fresh admin user');
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

deleteUser();
