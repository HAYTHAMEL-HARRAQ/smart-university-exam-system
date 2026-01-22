import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'haytam20040707',
  database: 'MYSQL'
});

try {
  console.log('📚 Populating student exam history...\n');

  // Get all students and exams
  const [students] = await connection.execute('SELECT id FROM users WHERE role = "student"');
  const [exams] = await connection.execute('SELECT id FROM exams');

  if (students.length === 0 || exams.length === 0) {
    console.error('❌ No students or exams found!');
    process.exit(1);
  }

  console.log(`Found ${students.length} students and ${exams.length} exams\n`);

  let sessionCount = 0;

  // Create exam history for each student
  for (const student of students) {
    const studentId = student.id;
    
    // Each student takes 2-4 exams
    const numExams = Math.floor(Math.random() * 3) + 2;
    const examsToTake = exams.sort(() => 0.5 - Math.random()).slice(0, numExams);

    for (const exam of examsToTake) {
      // Random date in the past (last 30 days)
      const daysAgo = Math.floor(Math.random() * 30);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      startDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 60 + Math.floor(Math.random() * 60));

      const score = Math.floor(Math.random() * 40) + 50; // 50-90
      const status = Math.random() > 0.2 ? 'submitted' : 'flagged';
      const biometricVerified = Math.random() > 0.15;
      const suspiciousCount = status === 'flagged' ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 2);

      // Insert exam session
      const [result] = await connection.execute(
        `INSERT INTO examSessions (
          examId, studentId, startedAt, endedAt, status, biometricVerified, 
          biometricVerifiedAt, score, ipAddress, userAgent, suspiciousActivityCount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          exam.id,
          studentId,
          startDate,
          endDate,
          status,
          biometricVerified ? 1 : 0,
          biometricVerified ? startDate : null,
          score,
          '192.168.1.' + Math.floor(Math.random() * 255),
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          suspiciousCount,
        ]
      );

      sessionCount++;
      
      // Add some alerts to flagged sessions
      if (status === 'flagged') {
        const alertCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < alertCount; i++) {
          const alertTypes = ['phone_detected', 'multiple_faces', 'off_screen_gaze', 'suspicious_audio'];
          const severities = ['medium', 'high', 'critical'];
          
          await connection.execute(
            `INSERT INTO alerts (sessionId, alertType, severity, confidenceScore, description, acknowledged)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              result.insertId,
              alertTypes[Math.floor(Math.random() * alertTypes.length)],
              severities[Math.floor(Math.random() * severities.length)],
              Math.floor(Math.random() * 30) + 70,
              'Suspicious activity detected during exam',
              Math.random() > 0.5
            ]
          );
        }
      }
    }
  }

  console.log('='.repeat(50));
  console.log('✅ STUDENT EXAM HISTORY POPULATED!');
  console.log('='.repeat(50) + '\n');

  console.log('📊 Summary:');
  console.log(`  • Total exam sessions created: ${sessionCount}`);
  console.log(`  • Students with history: ${students.length}`);
  console.log(`  • Each student took 2-4 exams\n`);

  console.log('🎯 Now you can:');
  console.log('  ✓ Login as a student');
  console.log('  ✓ Click "View History" to see past exams');
  console.log('  ✓ See scores, dates, and suspicious activity flags\n');

  console.log('📝 Sample students to test:');
  console.log('  • michael.chen@university.edu');
  console.log('  • jessica.lee@university.edu');
  console.log('  • student1@university.edu\n');

} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await connection.end();
}
