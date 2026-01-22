import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'haytam20040707',
  database: 'MYSQL'
});

try {
  console.log('🌱 Seeding database with sample data...\n');

  // Sample users data
  const users = [
    // Admins
    { openId: 'admin1@university.edu', name: 'HAITAM ELHARRAQ', email: 'admin1@university.edu', role: 'admin' },
    { openId: 'admin2@university.edu', name: 'Dr. Sarah Johnson', email: 'admin2@university.edu', role: 'admin' },

    // Proctors
    { openId: 'proctor1@university.edu', name: 'Mark Wilson', email: 'proctor1@university.edu', role: 'proctor' },
    { openId: 'proctor2@university.edu', name: 'Emma Davis', email: 'proctor2@university.edu', role: 'proctor' },
    { openId: 'proctor3@university.edu', name: 'James Miller', email: 'proctor3@university.edu', role: 'proctor' },

    // Students
    { openId: 'student1@university.edu', name: 'Alice Johnson', email: 'student1@university.edu', role: 'student' },
    { openId: 'student2@university.edu', name: 'Bob Smith', email: 'student2@university.edu', role: 'student' },
    { openId: 'student3@university.edu', name: 'Charlie Brown', email: 'student3@university.edu', role: 'student' },
    { openId: 'student4@university.edu', name: 'Diana Prince', email: 'student4@university.edu', role: 'student' },
    { openId: 'student5@university.edu', name: 'Eve Wilson', email: 'student5@university.edu', role: 'student' },
    { openId: 'student6@university.edu', name: 'Frank Castle', email: 'student6@university.edu', role: 'student' },
  ];

  // Insert users
  for (const user of users) {
    const query = `
      INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW()) 
      ON DUPLICATE KEY UPDATE role=?, lastSignedIn=NOW()
    `;
    
    await connection.execute(query, [
      user.openId,
      user.name,
      user.email,
      'simple',
      user.role,
      user.role
    ]);
    console.log(`✅ Created ${user.role}: ${user.name}`);
  }

  console.log('\n📚 Sample Users Created:');
  console.log('========================\n');
  
  console.log('👨‍💼 ADMINS:');
  console.log('  • haitam1@university.edu (HAITAM ELHARRAQ)');
  console.log('  • admin2@university.edu (Dr. Sarah Johnson)\n');

  console.log('🔐 PROCTORS:');
  console.log('  • proctor1@university.edu (Mark Wilson)');
  console.log('  • proctor2@university.edu (Emma Davis)');
  console.log('  • proctor3@university.edu (James Miller)\n');

  console.log('👨‍🎓 STUDENTS:');
  console.log('  • student1@university.edu (Alice Johnson)');
  console.log('  • student2@university.edu (Bob Smith)');
  console.log('  • student3@university.edu (Charlie Brown)');
  console.log('  • student4@university.edu (Diana Prince)');
  console.log('  • student5@university.edu (Eve Wilson)');
  console.log('  • student6@university.edu (Frank Castle)\n');

  console.log('🎯 You can now login with any of these accounts!');
  console.log('All passwords are ignored - just use the email address.\n');

} catch (error) {
  console.error('❌ Error seeding database:', error.message);
} finally {
  await connection.end();
}
