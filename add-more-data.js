import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'haytam20040707',
  database: 'MYSQL'
});

try {
  console.log('🚀 Adding comprehensive fraud data, exams, and test data...\n');

  // 1. Add more exams across different departments
  const moreExams = [
    { title: 'Organic Chemistry Final', courseCode: 'CHEM301', department: 'Chemistry', duration: 180, questions: 60, maxScore: 100 },
    { title: 'Molecular Biology', courseCode: 'BIO401', department: 'Biology', duration: 150, questions: 50, maxScore: 100 },
    { title: 'Advanced Calculus II', courseCode: 'MATH301', department: 'Mathematics', duration: 140, questions: 45, maxScore: 90 },
    { title: 'Modern Physics', courseCode: 'PHYS301', department: 'Physics', duration: 160, questions: 55, maxScore: 100 },
    { title: 'Data Structures Advanced', courseCode: 'CS202', department: 'Computer Science', duration: 130, questions: 50, maxScore: 100 },
    { title: 'Operating Systems', courseCode: 'CS301', department: 'Computer Science', duration: 140, questions: 48, maxScore: 95 },
    { title: 'Web Application Security', courseCode: 'CS451', department: 'Computer Science', duration: 120, questions: 45, maxScore: 85 },
    { title: 'Artificial Intelligence', courseCode: 'CS481', department: 'Computer Science', duration: 150, questions: 50, maxScore: 100 },
    { title: 'Quantum Physics', courseCode: 'PHYS451', department: 'Physics', duration: 170, questions: 60, maxScore: 100 },
    { title: 'Biochemistry Lab Final', courseCode: 'CHEM401', department: 'Chemistry', duration: 180, questions: 40, maxScore: 100 },
  ];

  console.log('📚 Adding 10 more exams...\n');
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

  // 2. Get data for creating fraudulent sessions
  console.log('\n🎭 Creating fraudulent exam sessions with high fraud rates...\n');

  const [students] = await connection.execute('SELECT id FROM users WHERE role = "student" LIMIT 25');
  const [allExams] = await connection.execute('SELECT id FROM exams');

  let fraudSessionCount = 0;
  let fraudIncidentCount = 0;
  let alertCount = 0;

  const fraudAlertTypes = [
    'phone_detected',
    'multiple_faces',
    'off_screen_gaze',
    'suspicious_audio',
    'unauthorized_person',
    'unusual_behavior',
    'network_anomaly'
  ];

  // Create highly fraudulent sessions (80-100% fraud rate)
  for (let i = 0; i < Math.min(students.length, 15); i++) {
    const student = students[i];
    const numFraudSessions = Math.floor(Math.random() * 3) + 2; // 2-4 fraudulent exams per student

    for (let j = 0; j < numFraudSessions; j++) {
      const exam = allExams[Math.floor(Math.random() * allExams.length)];
      const daysAgo = Math.floor(Math.random() * 45);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Ensure fraud
      const score = Math.floor(Math.random() * 25) + 35; // Very low scores (35-60)
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 45 + Math.floor(Math.random() * 30));

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
          'flagged',
          0, // Not biometrically verified
          null,
          score,
          '10.' + Math.floor(Math.random() * 256) + '.' + Math.floor(Math.random() * 256) + '.' + Math.floor(Math.random() * 256),
          'Mozilla/5.0 (Unknown Device)',
          Math.floor(Math.random() * 10) + 4, // 4-14 suspicious activities
        ]
      );

      fraudSessionCount++;

      // Add multiple fraud alerts
      const numAlerts = Math.floor(Math.random() * 4) + 3; // 3-6 alerts
      for (let k = 0; k < numAlerts; k++) {
        const severity = ['high', 'critical'][Math.floor(Math.random() * 2)];
        const confidence = Math.floor(Math.random() * 20) + 80; // 80-100 confidence

        await connection.execute(
          `INSERT INTO alerts (sessionId, alertType, severity, confidenceScore, description, acknowledged)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            sessionResult.insertId,
            fraudAlertTypes[Math.floor(Math.random() * fraudAlertTypes.length)],
            severity,
            confidence,
            'High-confidence cheating detected during exam',
            0
          ]
        );
        alertCount++;
      }

      // Create fraud incident
      const [proctors] = await connection.execute('SELECT id FROM users WHERE role = "proctor" LIMIT 1');
      if (proctors.length > 0) {
        await connection.execute(
          `INSERT INTO incidents (sessionId, incidentType, severity, description, status, reportedBy, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            sessionResult.insertId,
            ['cheating_confirmed', 'unauthorized_assistance'][Math.floor(Math.random() * 2)],
            ['major', 'critical'][Math.floor(Math.random() * 2)],
            'Confirmed cheating: ' + fraudAlertTypes[Math.floor(Math.random() * fraudAlertTypes.length)],
            'investigating',
            proctors[0].id
          ]
        );
        fraudIncidentCount++;
      }
    }
  }

  // 3. Create clean (non-fraudulent) sessions for contrast
  console.log('\n✅ Creating legitimate exam sessions...\n');

  let cleanSessionCount = 0;

  for (let i = 0; i < Math.min(students.length, 20); i++) {
    const student = students[i];
    const numCleanSessions = Math.floor(Math.random() * 2) + 2; // 2-3 clean exams

    for (let j = 0; j < numCleanSessions; j++) {
      const exam = allExams[Math.floor(Math.random() * allExams.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const score = Math.floor(Math.random() * 35) + 65; // Good scores (65-100)
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
          'submitted',
          1, // Biometrically verified
          startDate,
          score,
          '192.168.' + Math.floor(Math.random() * 256) + '.' + Math.floor(Math.random() * 256),
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          Math.floor(Math.random() * 2), // 0-1 suspicious activity
        ]
      );

      cleanSessionCount++;
    }
  }

  // 4. Update fraud analytics
  console.log('\n📊 Generating comprehensive fraud analytics...\n');

  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
  const periods = ['2025-01', '2025-02', '2025-03'];

  for (const period of periods) {
    for (const dept of departments) {
      const totalSessions = Math.floor(Math.random() * 80) + 40;
      const flaggedSessions = Math.floor(totalSessions * 0.35); // 35% fraud rate
      const confirmedIncidents = Math.floor(flaggedSessions * 0.85);
      const fraudRate = ((confirmedIncidents / totalSessions) * 100).toFixed(2);
      const avgConfidence = Math.floor(Math.random() * 15) + 80;

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
  console.log('✅ DATA ADDITION COMPLETE!');
  console.log('='.repeat(60) + '\n');

  console.log('📊 Summary:');
  console.log(`  • New exams added: ${moreExams.length}`);
  console.log(`  • Fraudulent exam sessions: ${fraudSessionCount}`);
  console.log(`  • Legitimate exam sessions: ${cleanSessionCount}`);
  console.log(`  • Fraud alerts created: ${alertCount}`);
  console.log(`  • Fraud incidents reported: ${fraudIncidentCount}`);
  console.log(`  • Fraud analytics records: ${periods.length * departments.length}\n`);

  console.log('🎯 Dashboard Insights:');
  console.log('  ✓ Admin Dashboard - View all exams and system stats');
  console.log('  ✓ Proctor Dashboard - Monitor active fraud alerts');
  console.log('  ✓ Incident Management - Review 30+ fraud incidents');
  console.log('  ✓ Analytics - Fraud trends across departments and time periods');
  console.log('  ✓ Student Dashboard - See clean and flagged exam history\n');

  console.log('📈 Fraud Statistics:');
  console.log(`  • Total fraudulent sessions: ${fraudSessionCount}`);
  console.log(`  • Average fraud confidence: 85-95%`);
  console.log(`  • Flagged sessions with biometric failure: 100%`);
  console.log(`  • Confirmed incidents: ${fraudIncidentCount}`);
  console.log(`  • Clean (legitimate) sessions: ${cleanSessionCount}\n`);

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
} finally {
  await connection.end();
}
