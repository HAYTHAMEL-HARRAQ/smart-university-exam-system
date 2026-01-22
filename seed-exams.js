import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'haytam20040707',
  database: 'MYSQL'
});

try {
  console.log('🌱 Seeding exams and sessions...\n');

  // First, get admin and student IDs
  const [admins] = await connection.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
  const [students] = await connection.execute('SELECT id FROM users WHERE role = "student"');
  
  if (admins.length === 0 || students.length === 0) {
    console.error('❌ No admin or students found. Please run seed-database.js first!');
    process.exit(1);
  }

  const adminId = admins[0].id;
  const studentIds = students.map(s => s.id);

  console.log(`✅ Found ${adminId} as admin and ${studentIds.length} students\n`);

  // Create exams
  const exams = [
    {
      title: 'Data Structures Final Exam',
      courseCode: 'CS101',
      department: 'Computer Science',
      description: 'Comprehensive exam on data structures and algorithms',
      duration: 120,
      totalQuestions: 50,
      maxScore: 100,
      detectionSensitivity: 'high',
      requiresBiometric: true,
    },
    {
      title: 'Web Development Midterm',
      courseCode: 'CS201',
      department: 'Computer Science',
      description: 'HTML, CSS, JavaScript, and React fundamentals',
      duration: 90,
      totalQuestions: 40,
      maxScore: 80,
      detectionSensitivity: 'medium',
      requiresBiometric: true,
    },
    {
      title: 'Database Systems Quiz',
      courseCode: 'CS301',
      department: 'Computer Science',
      description: 'SQL, Database Design, and Optimization',
      duration: 60,
      totalQuestions: 30,
      maxScore: 75,
      detectionSensitivity: 'medium',
      requiresBiometric: false,
    },
  ];

  const examIds = [];
  for (const exam of exams) {
    const [result] = await connection.execute(
      `INSERT INTO exams (title, courseCode, department, description, duration, totalQuestions, maxScore, scheduledAt, status, detectionSensitivity, requiresBiometric, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [
        exam.title,
        exam.courseCode,
        exam.department,
        exam.description,
        exam.duration,
        exam.totalQuestions,
        exam.maxScore,
        'active',
        exam.detectionSensitivity,
        exam.requiresBiometric,
        adminId,
      ]
    );
    examIds.push(result.insertId);
    console.log(`✅ Created exam: ${exam.title}`);
  }

  console.log('\n📝 Creating exam sessions for students...\n');

  // Create exam sessions for students
  let sessionCount = 0;
  const alertTypes = [
    'phone_detected',
    'multiple_faces',
    'off_screen_gaze',
    'suspicious_audio',
    'unauthorized_person',
  ];
  const severities = ['low', 'medium', 'high', 'critical'];

  for (let i = 0; i < examIds.length; i++) {
    const examId = examIds[i];
    
    // Assign 2-3 students to each exam
    const studentsForExam = studentIds.slice(i * 2, (i + 1) * 2 + 1);
    
    for (const studentId of studentsForExam) {
      // Create exam session
      const [sessionResult] = await connection.execute(
        `INSERT INTO examSessions (examId, studentId, startedAt, status, biometricVerified, biometricVerifiedAt, ipAddress, userAgent, suspiciousActivityCount) 
         VALUES (?, ?, NOW(), ?, ?, NOW(), ?, ?, ?)`,
        [
          examId,
          studentId,
          Math.random() > 0.2 ? 'in_progress' : 'submitted',
          Math.random() > 0.3,
          '192.168.1.' + Math.floor(Math.random() * 255),
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0,
        ]
      );
      
      sessionCount++;
      console.log(`  ✅ Created session for student ${studentId} on exam ${examId}`);

      // Create some alerts for sessions (30% of sessions get alerts)
      if (Math.random() > 0.7) {
        const sessionId = sessionResult.insertId;
        const numAlerts = Math.floor(Math.random() * 3) + 1;
        
        for (let j = 0; j < numAlerts; j++) {
          const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
          const severity = severities[Math.floor(Math.random() * severities.length)];
          const confidenceScore = Math.floor(Math.random() * 40) + 60; // 60-100

          await connection.execute(
            `INSERT INTO alerts (sessionId, alertType, severity, confidenceScore, description, acknowledged) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              sessionId,
              alertType,
              severity,
              confidenceScore,
              `Detected ${alertType.replace(/_/g, ' ')} during exam`,
              Math.random() > 0.5,
            ]
          );
        }
        console.log(`    🚨 Added ${numAlerts} alert(s) to session`);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ SEEDING COMPLETE!');
  console.log('='.repeat(50) + '\n');

  console.log('📊 Summary:');
  console.log(`  • Exams created: ${examIds.length}`);
  console.log(`  • Exam sessions created: ${sessionCount}`);
  console.log(`  • With random alerts and suspicious activities\n`);

  console.log('🎯 What you can now see:');
  console.log('  ✓ Admin Dashboard → Analytics with fraud trends');
  console.log('  ✓ Proctor Dashboard → Live monitoring of sessions');
  console.log('  ✓ Incidents page → Flagged suspicious activities\n');

  console.log('🔗 Test URLs:');
  console.log('  • Admin: http://localhost:3307 (login as admin)');
  console.log('  • Proctor: http://localhost:3307/proctor (login as proctor)');
  console.log('  • View incidents: http://localhost:3307/proctor/incidents\n');

} catch (error) {
  console.error('❌ Error seeding exams:', error.message);
} finally {
  await connection.end();
}
