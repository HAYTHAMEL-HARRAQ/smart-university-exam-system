import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'haytam20040707',
  database: 'MYSQL'
});

try {
  console.log('👥 Adding more users with realistic emails and visual updates...\n');

  // Get admin user
  const [adminResult] = await connection.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
  const adminId = adminResult[0].id;

  // More realistic students
  const moreStudents = [
    { name: 'Emma Watson', email: 'emma.watson@university.edu', role: 'student' },
    { name: 'Liam Chen', email: 'liam.chen@university.edu', role: 'student' },
    { name: 'Sarah Johnson', email: 'sarah.johnson@university.edu', role: 'student' },
    { name: 'Marcus Brown', email: 'marcus.brown@university.edu', role: 'student' },
    { name: 'Olivia Martinez', email: 'olivia.martinez@university.edu', role: 'student' },
    { name: 'James Wilson', email: 'james.wilson@university.edu', role: 'student' },
    { name: 'Sophia Garcia', email: 'sophia.garcia@university.edu', role: 'student' },
    { name: 'Benjamin Lee', email: 'benjamin.lee@university.edu', role: 'student' },
    { name: 'Isabella Taylor', email: 'isabella.taylor@university.edu', role: 'student' },
    { name: 'Noah Anderson', email: 'noah.anderson@university.edu', role: 'student' },
    { name: 'Ava Thomas', email: 'ava.thomas@university.edu', role: 'student' },
    { name: 'Ethan Jackson', email: 'ethan.jackson@university.edu', role: 'student' },
    { name: 'Mia White', email: 'mia.white@university.edu', role: 'student' },
    { name: 'Lucas Harris', email: 'lucas.harris@university.edu', role: 'student' },
    { name: 'Harper Martin', email: 'harper.martin@university.edu', role: 'student' },
  ];

  // More proctors
  const moreProctors = [
    { name: 'Dr. Amanda Foster', email: 'amanda.foster@university.edu', role: 'proctor' },
    { name: 'Dr. Michael Torres', email: 'michael.torres@university.edu', role: 'proctor' },
    { name: 'Dr. Patricia Cohen', email: 'patricia.cohen@university.edu', role: 'proctor' },
    { name: 'Dr. Robert Davis', email: 'robert.davis@university.edu', role: 'proctor' },
    { name: 'Dr. Jennifer Miller', email: 'jennifer.miller@university.edu', role: 'proctor' },
  ];

  // More admins
  const moreAdmins = [
    { name: 'Dr. Steven Zhang', email: 'steven.zhang@university.edu', role: 'admin' },
    { name: 'Dr. Rachel Green', email: 'rachel.green@university.edu', role: 'admin' },
  ];

  console.log('📚 Adding 15 more students...\n');
  let studentCount = 0;
  for (const student of moreStudents) {
    const openId = student.email.toLowerCase();
    try {
      await connection.execute(
        `INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [openId, student.name, student.email, 'simple', student.role]
      );
      console.log(`✅ Added student: ${student.name} (${student.email})`);
      studentCount++;
    } catch (e) {
      if (e.code !== 'ER_DUP_ENTRY') {
        console.log(`⚠️  ${student.name} already exists`);
      }
    }
  }

  console.log('\n👨‍🏫 Adding 5 more proctors...\n');
  let proctorCount = 0;
  for (const proctor of moreProctors) {
    const openId = proctor.email.toLowerCase();
    try {
      await connection.execute(
        `INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [openId, proctor.name, proctor.email, 'simple', proctor.role]
      );
      console.log(`✅ Added proctor: ${proctor.name} (${proctor.email})`);
      proctorCount++;
    } catch (e) {
      if (e.code !== 'ER_DUP_ENTRY') {
        console.log(`⚠️  ${proctor.name} already exists`);
      }
    }
  }

  console.log('\n🔐 Adding 2 more admins...\n');
  let adminCount = 0;
  for (const admin of moreAdmins) {
    const openId = admin.email.toLowerCase();
    try {
      await connection.execute(
        `INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [openId, admin.name, admin.email, 'simple', admin.role]
      );
      console.log(`✅ Added admin: ${admin.name} (${admin.email})`);
      adminCount++;
    } catch (e) {
      if (e.code !== 'ER_DUP_ENTRY') {
        console.log(`⚠️  ${admin.name} already exists`);
      }
    }
  }

  // Create exam sessions for new students
  console.log('\n📝 Creating exam sessions for new students...\n');

  const [newStudents] = await connection.execute(
    `SELECT id FROM users WHERE role = "student" AND email LIKE '%watson@%' OR email LIKE '%chen@%' OR email LIKE '%johnson@%' OR email LIKE '%brown@%' OR email LIKE '%martinez@%' OR email LIKE '%wilson@%' OR email LIKE '%garcia@%' OR email LIKE '%lee@%' OR email LIKE '%taylor@%' OR email LIKE '%anderson@%' OR email LIKE '%thomas@%' OR email LIKE '%jackson@%' OR email LIKE '%white@%' OR email LIKE '%harris@%' OR email LIKE '%martin@%' LIMIT 15`
  );

  const [allExams] = await connection.execute('SELECT id FROM exams');
  let sessionCount = 0;

  for (const student of newStudents) {
    const numSessions = Math.floor(Math.random() * 3) + 2; // 2-4 sessions per student

    for (let i = 0; i < numSessions; i++) {
      const exam = allExams[Math.floor(Math.random() * allExams.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const isFraud = Math.random() > 0.7; // 30% fraud rate
      const score = isFraud 
        ? Math.floor(Math.random() * 30) + 40 
        : Math.floor(Math.random() * 35) + 65;
      const status = isFraud ? 'flagged' : 'submitted';

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 90 + Math.floor(Math.random() * 60));

      await connection.execute(
        `INSERT INTO examSessions (
          examId, studentId, startedAt, endedAt, status, biometricVerified, 
          biometricVerifiedAt, score, ipAddress, userAgent, suspiciousActivityCount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exam.id,
          student.id,
          startDate,
          endDate,
          status,
          isFraud ? 0 : 1,
          startDate,
          score,
          '192.168.' + Math.floor(Math.random() * 256) + '.' + Math.floor(Math.random() * 256),
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          isFraud ? Math.floor(Math.random() * 8) + 2 : Math.floor(Math.random() * 2)
        ]
      );

      sessionCount++;

      // Add alerts for fraudulent sessions
      if (isFraud) {
        const alertTypes = ['phone_detected', 'multiple_faces', 'off_screen_gaze', 'suspicious_audio'];
        const numAlerts = Math.floor(Math.random() * 3) + 2;

        for (let j = 0; j < numAlerts; j++) {
          await connection.execute(
            `INSERT INTO alerts (sessionId, alertType, severity, confidenceScore, description, acknowledged)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              (await connection.execute('SELECT LAST_INSERT_ID() as id'))[0][0].id,
              alertTypes[Math.floor(Math.random() * alertTypes.length)],
              ['high', 'critical'][Math.floor(Math.random() * 2)],
              Math.floor(Math.random() * 25) + 75,
              'Suspicious activity detected',
              0
            ]
          );
        }
      }
    }
  }

  console.log('='.repeat(60));
  console.log('✅ USER AND DATA ADDITION COMPLETE!');
  console.log('='.repeat(60) + '\n');

  console.log('📊 Summary:');
  console.log(`  • New students added: ${studentCount}`);
  console.log(`  • New proctors added: ${proctorCount}`);
  console.log(`  • New admins added: ${adminCount}`);
  console.log(`  • New exam sessions: ${sessionCount}\n`);

  console.log('🎯 Test Accounts Available:');
  console.log('\n📚 Students (with emails):');
  moreStudents.slice(0, 5).forEach(s => console.log(`  • ${s.name}: ${s.email}`));
  console.log(`  ... and ${moreStudents.length - 5} more students\n`);

  console.log('👨‍🏫 Proctors (with emails):');
  moreProctors.forEach(p => console.log(`  • ${p.name}: ${p.email}`));

  console.log('\n🔐 Additional Admins (with emails):');
  moreAdmins.forEach(a => console.log(`  • ${a.name}: ${a.email}`));

  console.log('\n💡 Dashboard Enhancements:');
  console.log('  ✓ More user accounts for testing different scenarios');
  console.log('  ✓ Realistic university email addresses');
  console.log('  ✓ Additional exam sessions for comprehensive data');
  console.log('  ✓ Ready for multi-user testing and demonstrations\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
} finally {
  await connection.end();
}
