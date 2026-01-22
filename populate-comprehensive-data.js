import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'haytam20040707',
  database: 'MYSQL'
});

try {
  console.log('🚀 Adding comprehensive data for dashboards...\n');

  // 1. Add more departments and exams
  const moreExams = [
    { title: 'Advanced Algorithms', courseCode: 'CS401', department: 'Computer Science', duration: 150, questions: 60, maxScore: 100 },
    { title: 'Database Design', courseCode: 'CS301', department: 'Computer Science', duration: 120, questions: 50, maxScore: 90 },
    { title: 'Network Security', courseCode: 'CS451', department: 'Computer Science', duration: 100, questions: 40, maxScore: 80 },
    { title: 'Software Engineering', courseCode: 'CS301', department: 'Computer Science', duration: 110, questions: 45, maxScore: 85 },
    { title: 'Machine Learning', courseCode: 'CS481', department: 'Computer Science', duration: 140, questions: 55, maxScore: 100 },
    { title: 'Calculus I', courseCode: 'MATH101', department: 'Mathematics', duration: 120, questions: 50, maxScore: 100 },
    { title: 'Linear Algebra', courseCode: 'MATH201', department: 'Mathematics', duration: 110, questions: 45, maxScore: 95 },
    { title: 'Physics I', courseCode: 'PHYS101', department: 'Physics', duration: 130, questions: 50, maxScore: 100 },
    { title: 'Chemistry Lab', courseCode: 'CHEM102', department: 'Chemistry', duration: 150, questions: 40, maxScore: 100 },
    { title: 'Biology Exam', courseCode: 'BIO101', department: 'Biology', duration: 120, questions: 48, maxScore: 96 },
  ];

  console.log('📚 Adding more exams...\n');
  const [adminResult] = await connection.execute('SELECT id FROM users WHERE role = "admin" LIMIT 1');
  const adminId = adminResult[0].id;

  for (const exam of moreExams) {
    await connection.execute(
      `INSERT INTO exams (title, courseCode, department, description, duration, totalQuestions, maxScore, scheduledAt, status, detectionSensitivity, requiresBiometric, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [
        exam.title,
        exam.courseCode,
        exam.department,
        `Exam for ${exam.title}`,
        exam.duration,
        exam.questions,
        exam.maxScore,
        'active',
        Math.random() > 0.3 ? 'high' : 'medium',
        Math.random() > 0.2,
        adminId,
      ]
    );
    console.log(`✅ Added: ${exam.title}`);
  }

  // 2. Get all students and create many more exam sessions
  console.log('\n📝 Creating comprehensive exam sessions with fraud patterns...\n');

  const [students] = await connection.execute('SELECT id FROM users WHERE role = "student"');
  const [allExams] = await connection.execute('SELECT id FROM exams');

  let sessionCount = 0;
  let alertCount = 0;
  let incidentCount = 0;

  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
  const alertTypes = ['phone_detected', 'multiple_faces', 'off_screen_gaze', 'suspicious_audio', 'unauthorized_person', 'unusual_behavior', 'network_anomaly'];

  // Create 5-8 sessions per student
  for (const student of students) {
    const numSessions = Math.floor(Math.random() * 4) + 5;

    for (let i = 0; i < numSessions; i++) {
      const exam = allExams[Math.floor(Math.random() * allExams.length)];
      const daysAgo = Math.floor(Math.random() * 60);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const fraudProbability = Math.random();
      const hasFraud = fraudProbability > 0.75; // 25% chance of fraud
      const status = hasFraud ? 'flagged' : 'submitted';

      const score = hasFraud 
        ? Math.floor(Math.random() * 30) + 40  // Low scores (40-70) for fraudulent
        : Math.floor(Math.random() * 35) + 65; // High scores (65-100) for clean

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 60 + Math.floor(Math.random() * 120));

      const [sessionResult] = await connection.execute(
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
          !hasFraud && Math.random() > 0.1 ? 1 : 0,
          startDate,
          score,
          '192.168.' + Math.floor(Math.random() * 256) + '.' + Math.floor(Math.random() * 256),
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          hasFraud ? Math.floor(Math.random() * 8) + 2 : Math.floor(Math.random() * 2),
        ]
      );

      sessionCount++;

      // Add alerts for suspicious sessions
      if (hasFraud) {
        const numAlerts = Math.floor(Math.random() * 3) + 2;

        for (let j = 0; j < numAlerts; j++) {
          const severity = ['high', 'critical'][Math.floor(Math.random() * 2)];
          const confidence = Math.floor(Math.random() * 25) + 75;

          await connection.execute(
            `INSERT INTO alerts (sessionId, alertType, severity, confidenceScore, description, acknowledged)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              sessionResult.insertId,
              alertTypes[Math.floor(Math.random() * alertTypes.length)],
              severity,
              confidence,
              'High-confidence fraud indicator detected',
              Math.random() > 0.4
            ]
          );
          alertCount++;
        }

        // Create incidents for severe cases
        if (Math.random() > 0.5) {
          const [proctors] = await connection.execute('SELECT id FROM users WHERE role = "proctor" LIMIT 1');
          
          if (proctors.length > 0) {
            await connection.execute(
              `INSERT INTO incidents (sessionId, incidentType, severity, description, status, reportedBy, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                sessionResult.insertId,
                ['cheating_confirmed', 'unauthorized_assistance'][Math.floor(Math.random() * 2)],
                ['major', 'critical'][Math.floor(Math.random() * 2)],
                'Confirmed fraud incident during exam session',
                ['pending', 'investigating'][Math.floor(Math.random() * 2)],
                proctors[0].id
              ]
            );
            incidentCount++;
          }
        }
      }
    }
  }

  // 3. Add fraud analytics data
  console.log('\n📊 Generating fraud analytics...\n');

  const departments_list = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
  const periods = ['2024-12', '2024-11', '2024-10'];

  for (const period of periods) {
    for (const dept of departments_list) {
      const totalSessions = Math.floor(Math.random() * 50) + 20;
      const flaggedSessions = Math.floor(totalSessions * (Math.random() * 0.3));
      const confirmedIncidents = Math.floor(flaggedSessions * (Math.random() * 0.6));
      const fraudRate = ((confirmedIncidents / totalSessions) * 100).toFixed(2);
      const avgConfidence = Math.floor(Math.random() * 25) + 75;

      await connection.execute(
        `INSERT INTO fraudAnalytics (department, period, totalExamSessions, flaggedSessions, confirmedIncidents, fraudRate, averageConfidenceScore, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          dept,
          period,
          totalSessions,
          flaggedSessions,
          confirmedIncidents,
          fraudRate,
          avgConfidence
        ]
      );
    }
  }

  console.log('='.repeat(60));
  console.log('✅ COMPREHENSIVE DATA SEEDING COMPLETE!');
  console.log('='.repeat(60) + '\n');

  console.log('📊 Summary:');
  console.log(`  • Additional exams created: ${moreExams.length}`);
  console.log(`  • Total exam sessions: ${sessionCount}`);
  console.log(`  • Suspicious alerts: ${alertCount}`);
  console.log(`  • Fraud incidents: ${incidentCount}`);
  console.log(`  • Fraud analytics records: ${periods.length * departments_list.length}\n`);

  console.log('🎯 Now you can see:');
  console.log('  ✓ ProctorDashboard → Live monitoring with real fraud data');
  console.log('  ✓ IncidentManagement → Multiple confirmed incidents');
  console.log('  ✓ AnalyticsDashboard → Fraud trends by department and period');
  console.log('  ✓ StudentDashboard → Exam history with scores\n');

  console.log('📈 Dashboard Features:');
  console.log('  • Real-time alert tracking');
  console.log('  • Fraud trend analysis');
  console.log('  • Incident status tracking');
  console.log('  • Department-wide statistics');
  console.log('  • Student performance metrics\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
} finally {
  await connection.end();
}
