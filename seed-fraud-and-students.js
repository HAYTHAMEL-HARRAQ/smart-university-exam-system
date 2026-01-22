import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'haytam20040707',
  database: 'MYSQL'
});

try {
  console.log('🌱 Seeding more students, fraud data, and incidents...\n');

  // Add more students
  const moreStudents = [
    { name: 'Michael Chen', email: 'michael.chen@university.edu' },
    { name: 'Jessica Lee', email: 'jessica.lee@university.edu' },
    { name: 'David Rodriguez', email: 'david.rodriguez@university.edu' },
    { name: 'Sarah Martinez', email: 'sarah.martinez@university.edu' },
    { name: 'James Anderson', email: 'james.anderson@university.edu' },
    { name: 'Emily Taylor', email: 'emily.taylor@university.edu' },
    { name: 'Robert Thompson', email: 'robert.thompson@university.edu' },
    { name: 'Amanda White', email: 'amanda.white@university.edu' },
    { name: 'Christopher Hall', email: 'christopher.hall@university.edu' },
    { name: 'Michelle King', email: 'michelle.king@university.edu' },
  ];

  console.log('📚 Adding more students...\n');
  const studentIds = [];

  for (const student of moreStudents) {
    const [result] = await connection.execute(
      `INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [student.email, student.name, student.email, 'simple', 'student']
    );
    studentIds.push(result.insertId);
    console.log(`✅ Added student: ${student.name}`);
  }

  // Get exam and proctor info
  const [exams] = await connection.execute('SELECT id FROM exams LIMIT 5');
  const [proctors] = await connection.execute('SELECT id FROM users WHERE role = "proctor" LIMIT 3');
  
  if (exams.length === 0) {
    console.error('❌ No exams found. Run seed-exams.js first!');
    process.exit(1);
  }

  console.log(`\n📝 Creating exam sessions for new students with fraud...\n`);

  const alertTypes = [
    'phone_detected',
    'multiple_faces',
    'off_screen_gaze',
    'suspicious_audio',
    'unauthorized_person',
    'unusual_behavior',
    'network_anomaly',
  ];
  const severities = ['low', 'medium', 'high', 'critical'];
  const incidentTypes = [
    'cheating_confirmed',
    'unauthorized_assistance',
    'technical_violation',
    'false_positive',
  ];

  let sessionCount = 0;
  let alertCount = 0;
  let incidentCount = 0;

  // Create sessions for new students with fraud scenarios
  for (let i = 0; i < studentIds.length; i++) {
    const studentId = studentIds[i];
    const examId = exams[i % exams.length].id;

    // Create exam session
    const [sessionResult] = await connection.execute(
      `INSERT INTO examSessions (examId, studentId, startedAt, status, biometricVerified, biometricVerifiedAt, ipAddress, userAgent, suspiciousActivityCount) 
       VALUES (?, ?, NOW(), ?, ?, NOW(), ?, ?, ?)`,
      [
        examId,
        studentId,
        Math.random() > 0.3 ? 'in_progress' : 'submitted',
        Math.random() > 0.2,
        '192.168.1.' + Math.floor(Math.random() * 255),
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        Math.floor(Math.random() * 8),
      ]
    );

    sessionCount++;
    const sessionId = sessionResult.insertId;

    // 60% of sessions get alerts
    if (Math.random() > 0.4) {
      const numAlerts = Math.floor(Math.random() * 4) + 1;

      for (let j = 0; j < numAlerts; j++) {
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const confidenceScore = Math.floor(Math.random() * 40) + 60;

        const [alertResult] = await connection.execute(
          `INSERT INTO alerts (sessionId, alertType, severity, confidenceScore, description, acknowledged, acknowledgedBy) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            sessionId,
            alertType,
            severity,
            confidenceScore,
            `Detected ${alertType.replace(/_/g, ' ')} during exam - confidence: ${confidenceScore}%`,
            Math.random() > 0.4,
            proctors.length > 0 && Math.random() > 0.5 ? proctors[0].id : null,
          ]
        );
        alertCount++;
      }

      console.log(`  ✅ Session ${sessionId}: ${numAlerts} alert(s) created`);

      // 40% of alerted sessions get incidents
      if (Math.random() > 0.6 && proctors.length > 0) {
        const incidentType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
        const severity = ['minor', 'moderate', 'major', 'critical'][
          Math.floor(Math.random() * 4)
        ];

        const [incidentResult] = await connection.execute(
          `INSERT INTO incidents (sessionId, incidentType, severity, description, status, reportedBy, createdAt, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            sessionId,
            incidentType,
            severity,
            `Incident: ${incidentType.replace(/_/g, ' ')} detected during exam`,
            Math.random() > 0.5 ? 'pending' : 'investigating',
            proctors[0].id,
          ]
        );
        incidentCount++;
        console.log(`    🚨 Incident created: ${incidentType}`);
      }
    }
  }

  // Get all sessions and add more fraud data
  console.log(`\n🔧 Adding additional fraud patterns...\n`);

  const [allSessions] = await connection.execute(
    'SELECT id FROM examSessions ORDER BY RAND() LIMIT 10'
  );

  for (const session of allSessions) {
    // Add suspicious activity counts
    await connection.execute(
      'UPDATE examSessions SET suspiciousActivityCount = ? WHERE id = ?',
      [Math.floor(Math.random() * 10) + 2, session.id]
    );

    // Add high-severity alerts
    if (Math.random() > 0.5) {
      await connection.execute(
        `INSERT INTO alerts (sessionId, alertType, severity, confidenceScore, description, acknowledged) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          session.id,
          'phone_detected',
          'critical',
          95 + Math.floor(Math.random() * 5),
          'Critical: Phone detected with 95%+ confidence',
          false,
        ]
      );
      alertCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ FRAUD & STUDENT DATA SEEDING COMPLETE!');
  console.log('='.repeat(60) + '\n');

  console.log('📊 Summary:');
  console.log(`  • New students added: ${moreStudents.length}`);
  console.log(`  • Exam sessions created: ${sessionCount}`);
  console.log(`  • Suspicious alerts added: ${alertCount}`);
  console.log(`  • Fraud incidents created: ${incidentCount}\n`);

  console.log('🎯 What you can now see:');
  console.log('  ✓ ProctorDashboard → Live monitoring with fraud alerts');
  console.log('  ✓ IncidentManagement → Review all detected incidents');
  console.log('  ✓ AdminPanel → Analytics with fraud trends');
  console.log('  ✓ StudentDashboard → Their exam history (login as student)\n');

  console.log('🔗 Test as different roles:');
  console.log('  • Student: michael.chen@university.edu');
  console.log('  • Proctor: proctor1@university.edu (see dashboard)');
  console.log('  • Admin: admin1@university.edu (see analytics)\n');

  console.log('💡 Pro Tips:');
  console.log('  • Proctors can acknowledge alerts');
  console.log('  • Admins can see fraud trends by period/course');
  console.log('  • High-confidence alerts appear in red\n');

} catch (error) {
  console.error('❌ Error seeding fraud data:', error.message);
  console.error(error.stack);
} finally {
  await connection.end();
}
