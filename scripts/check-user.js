const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

async function checkUser() {
  try {
    console.log('🔍 Checking user account status...');
    const users = await sql`
      SELECT id, username, role, "isActive", "failedLoginAttempts", "lockedUntil"
      FROM "User" 
      WHERE username = 'Hisma'
    `;
    
    if (users.length > 0) {
      const user = users[0];
      console.log('👤 User found:', {
        id: user.id,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        failedLoginAttempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil
      });
      
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        console.log('🔒 Account is currently LOCKED until:', user.lockedUntil);
        console.log('⏰ Current time:', new Date().toISOString());
        
        // Unlock the account
        console.log('🔓 Unlocking account...');
        await sql`
          UPDATE "User" 
          SET "failedLoginAttempts" = 0, "lockedUntil" = NULL
          WHERE id = ${user.id}
        `;
        console.log('✅ Account unlocked successfully');
      } else {
        console.log('✅ Account is not locked');
      }
    } else {
      console.log('❌ User not found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

checkUser();
