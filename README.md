# 🎓 Smart University Exam System

A comprehensive online examination platform with AI-powered cheating detection, real-time monitoring, and advanced analytics for academic institutions.

## ✨ Features

### 📝 Core Functionality
- **Online Examinations**: Secure exam delivery with timer and auto-submission
- **Multi-question Types**: Multiple choice, true/false, essay questions
- **Real-time Proctoring**: Live monitoring of student sessions
- **Session Recording**: Automatic video/audio capture during exams

### 🤖 AI-Powered Detection
- **Facial Recognition**: Continuous identity verification
- **Phone/Object Detection**: Identifies unauthorized devices
- **Multiple Face Detection**: Flags additional people in frame
- **Gaze Tracking**: Detects off-screen looking behavior
- **Audio Analysis**: Monitors for suspicious conversations
- **YOLO Integration**: Advanced computer vision models

### 👮‍♂️ Proctor Dashboard
- **Live Video Grid**: Monitor multiple students simultaneously
- **Real-time Alerts**: Instant notifications for suspicious activity
- **Incident Management**: Log, review, and resolve cheating attempts
- **Manual Intervention**: Proctors can pause/terminate sessions

### 📊 Analytics & Reporting
- **Fraud Heatmaps**: Visualize cheating patterns
- **Statistical Dashboards**: Course and department analytics
- **Incident Reports**: Detailed evidence and timeline
- **Compliance Tools**: Audit-ready reporting

### 🔐 Security & Compliance
- **Role-Based Access**: Students, Proctors, Admins
- **Secure Authentication**: JWT-based session management
- **Data Encryption**: Protected sensitive information
- **GDPR Compliant**: Privacy-focused design
- **Audit Logging**: Complete activity trail

## 🏗️ Architecture

```
Client (React + TypeScript + TailwindCSS)
    ↓ HTTP/WebSocket
Server (Node.js + Express + tRPC)
    ↓
Database (MySQL/Oracle)
    ↓
AI Services (TensorFlow.js + OCI Vision)
```

### Tech Stack
- **Frontend**: React 19, TypeScript, TailwindCSS, Radix UI
- **Backend**: Node.js, Express, tRPC, Drizzle ORM
- **Database**: MySQL (primary), Oracle (secondary)
- **AI/ML**: TensorFlow.js, COCO-SSD, Pose Detection
- **Cloud**: AWS S3 (video storage), OCI AI Vision
- **Build**: Vite, esbuild, pnpm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- MySQL 8.0+ (or Oracle database)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smart-university-exam-system.git
cd smart-university-exam-system
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# Server
PORT=3000
COOKIE_SECRET="your-super-secret-key-here"

# Oracle (optional)
ORACLE_USER="exam_system"
ORACLE_PASSWORD="password"
ORACLE_CONNECTION_STRING="localhost:1521/XEPDB1"

# AWS S3 (for video storage)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="exam-videos-bucket"
```

4. **Setup database**
```bash
# Generate and run migrations
pnpm db:push

# Seed initial data
node seed-database.js
node seed-exams.js
node insert-admin.js
```

5. **Start development server**
```bash
pnpm dev
```

6. **Access the application**
- Student Portal: http://localhost:3000
- Proctor Dashboard: http://localhost:3000/proctor
- Admin Panel: http://localhost:3000/admin

## 📁 Project Structure

```
smart_university_exam_system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configs
├── server/                # Node.js backend
│   ├── _core/            # Core server logic
│   ├── services/         # Business logic services
│   └── routers/          # API route handlers
├── shared/               # Shared types and constants
├── drizzle/              # Database schema and migrations
└── train5_weights/       # AI model weights
```

## 🎯 Key Components

### Authentication System
- JWT-based session management
- Role-based access control (Student/Proctor/Admin)
- Secure cookie handling
- OAuth integration ready

### Exam Engine
- Configurable exam settings
- Timer and auto-submission
- Question randomization
- Answer validation

### AI Detection Services
- **Face Detection**: Continuously verifies student identity
- **Object Detection**: Identifies phones, notes, other people
- **Pose Estimation**: Tracks head movement and gaze direction
- **Audio Analysis**: Detects suspicious sounds and conversations

### Monitoring Dashboard
- Real-time student session feeds
- Alert system with severity levels
- Incident logging and management
- Evidence collection and review

## 🛠️ Development

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm check        # Type checking
pnpm format       # Code formatting
```

### Database Management
```bash
pnpm db:push      # Generate and run migrations
```

### Seeding Data
```bash
node seed-database.js           # Basic data
node seed-exams.js             # Sample exams
node seed-fraud-and-students.js # Test scenarios
```

## 🔧 Configuration

### Camera Permissions
The system requires camera access for:
- Student identity verification
- Real-time monitoring
- Evidence collection

Users will be prompted to grant permissions when needed.

### Browser Support
- Chrome 80+ (recommended)
- Firefox 75+
- Edge 80+
- Safari 14+

WebRTC and MediaDevices APIs are required.

## 🧪 Testing

Run the test suite:
```bash
pnpm test
```

Tests cover:
- Authentication flows
- Exam logic
- Database operations
- API endpoints
- Component rendering

## 🚢 Deployment

### Production Build
```bash
pnpm build
pnpm start
```

### Docker Deployment (Coming Soon)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN pnpm install --prod
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Environment for Production
Ensure these variables are set:
- `NODE_ENV=production`
- `DATABASE_URL` (production database)
- `COOKIE_SECRET` (secure random string)
- `AWS_*` credentials for video storage

## 📈 Monitoring & Maintenance

### Health Checks
- `/api/health` endpoint for service status
- Database connection monitoring
- AI service availability checks

### Log Management
Logs are written to console by default. Configure your deployment platform's logging solution for production.

### Backup Strategy
- Database backups daily
- Video evidence stored in S3 with lifecycle policies
- Configuration exported regularly

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow TypeScript best practices
- Use Prettier for formatting (`pnpm format`)
- Write meaningful commit messages
- Add tests for new functionality

## 🐛 Known Issues & Limitations

### Current Limitations
- Browser compatibility varies for WebRTC features
- High CPU usage during AI processing
- Video quality affects detection accuracy
- Mobile browser support limited

### Roadmap
See [todo.md](./todo.md) for planned features and improvements.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TensorFlow.js](https://www.tensorflow.org/js) for machine learning capabilities
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Drizzle ORM](https://orm.drizzle.team/) for database management
- [tRPC](https://trpc.io/) for type-safe APIs
- Oracle Cloud Infrastructure for AI services

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation in `/docs`

---

⭐ If you find this project helpful, please star the repository!

Built with ❤️ for educational institutions worldwide.