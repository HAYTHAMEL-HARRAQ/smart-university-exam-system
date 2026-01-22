import mysql from 'mysql2/promise';

async function insertAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'haytam20040707',
    database: 'MYSQL'
  });

  try {
    const query = `
      INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW()) 
      ON DUPLICATE KEY UPDATE role=?, lastSignedIn=NOW()
    `;
    
    const result = await connection.execute(query, [
      'elharraqhaytham@gmail.com',
      'HAITAM ELHARRAQ',
      'elharraqhaytham@gmail.com',
      'simple',
      'admin',
      'admin'
    ]);

    console.log('✅ Admin user created successfully!');
    console.log('Email: elharraqhaytham@gmail.com');
    console.log('Name: HAITAM ELHARRAQ');
    console.log('Role: admin');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await connection.end();
  }
}

insertAdmin();
