# 🚀 Complete Setup Guide

This guide walks you through setting up the Smart University Exam System from scratch.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] pnpm package manager installed
- [ ] MySQL 8.0+ database server
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Modern web browser (Chrome/Firefox/Edge)

## ⚙️ Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-university-exam-system.git
cd smart-university-exam_system
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all required packages for both frontend and backend.

### 3. Configure Environment Variables

Copy the example configuration:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database - Change to your MySQL credentials
DATABASE_URL="mysql://your_username:your_password@localhost:3306/exam_system"

# Server Port
PORT=3000

# Security - Change these in production!
COOKIE_SECRET="super-secret-cookie-key-change-me"
JWT_SECRET="super-secret-jwt-key-change-me"

# Owner User
OWNER_OPEN_ID="admin"
```

### 4. Database Setup

#### Option A: Local MySQL Setup

1. Start MySQL service
2. Create database:
```sql
CREATE DATABASE exam_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Run migrations:
```bash
pnpm db:push
```

#### Option B: Using Existing Database

Update `DATABASE_URL` in `.env` to point to your existing MySQL instance.

### 5. Seed Initial Data

Run these scripts in order:

```bash
# Basic system data
node seed-database.js

# Sample exams and questions  
node seed-exams.js

# Administrative user
node insert-admin.js

# Test data (optional)
node seed-fraud-and-students.js
```

### 6. Start Development Server

```bash
pnpm dev
```

The server will start on `http://localhost:3000`

### 7. Access the Application

Open your browser and navigate to:
- **Student Portal**: http://localhost:3000
- **Login**: Use the admin account created by `insert-admin.js`
- **Default Credentials**: Check console output from seeding scripts

## 🔧 Configuration Options

### Database Configuration

For production, use a robust database setup:

```env
# Production MySQL
DATABASE_URL="mysql://user:pass@prod-db-host:3306/exam_system_prod"

# Connection pool settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### AI Detection Features

Enable/disable AI features based on your hardware:

```env
# Enable AI detection (requires good CPU/GPU)
ENABLE_AI_DETECTION=true

# Video recording (storage intensive)
ENABLE_VIDEO_RECORDING=true

# Audio monitoring (privacy considerations)
ENABLE_AUDIO_MONITORING=false
```

### Storage Configuration

For video evidence storage:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"  
AWS_REGION="us-east-1"
AWS_S3_BUCKET="exam-evidence-storage"

# Or use local storage for development
STORAGE_TYPE="local"
LOCAL_STORAGE_PATH="./uploads"
```

## 🧪 Testing the Setup

### 1. Verify Database Connection

Check that tables were created:
```bash
# Connect to MySQL and run:
SHOW TABLES;
SELECT COUNT(*) FROM users;
```

### 2. Test Authentication

- Navigate to http://localhost:3000/login
- Try logging in with seeded admin credentials
- Verify you can access admin dashboard

### 3. Test Exam Flow

- Create a sample exam through admin panel
- Take the exam as a student user
- Verify timer, question navigation, and submission work

### 4. Test Camera Features

- Grant camera permissions when prompted
- Verify face detection works
- Test video recording functionality

## 🛠️ Troubleshooting Common Issues

### Database Connection Errors

**Problem**: `ER_ACCESS_DENIED_ERROR`
**Solution**: 
- Verify MySQL username/password in `.env`
- Ensure MySQL service is running
- Check database exists and user has permissions

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`
**Solution**:
```bash
# Kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <process-id> /F

# Mac/Linux:
lsof -i :3000
kill -9 <process-id>
```

Or change the port in `.env`:
```env
PORT=3001
```

### Camera Permission Issues

**Problem**: Camera not working in browser
**Solution**:
- Use HTTPS in production (camera requires secure context)
- Check browser permissions
- Try incognito/private browsing mode
- Clear browser cache and cookies

### AI Model Loading Slow

**Problem**: TensorFlow.js models taking too long to load
**Solution**:
- First load caches models in browser storage
- Subsequent loads are faster
- Consider pre-loading models on app startup
- Reduce model complexity for lower-end devices

### Build Errors

**Problem**: TypeScript or build errors
**Solution**:
```bash
# Clean and rebuild
rm -rf node_modules/.vite
pnpm install
pnpm build
```

## 🌐 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=80
COOKIE_SECRET="very-long-random-secret-string"
JWT_SECRET="another-very-long-secret"

# Use production database
DATABASE_URL="mysql://prod_user:prod_pass@prod_host:3306/exam_system"

# Enable all security features
ENABLE_AI_DETECTION=true
ENABLE_VIDEO_RECORDING=true
ENABLE_AUDIO_MONITORING=true

# Configure proper storage
AWS_ACCESS_KEY_ID="production-access-key"
AWS_SECRET_ACCESS_KEY="production-secret-key"
AWS_S3_BUCKET="production-exam-evidence"
```

### Build for Production

```bash
# Create production build
pnpm build

# Start production server
pnpm start
```

### Reverse Proxy Setup (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Considerations

### Essential Security Measures

1. **Change all default passwords**
2. **Use HTTPS in production**
3. **Implement rate limiting**
4. **Regular security audits**
5. **Keep dependencies updated**
6. **Backup database regularly**
7. **Monitor logs for suspicious activity**

### Compliance Checklist

- [ ] GDPR compliance for student data
- [ ] Secure video storage and retention policies  
- [ ] Access logging and audit trails
- [ ] Regular security assessments
- [ ] Data breach response procedures

## 🆘 Getting Help

If you encounter issues:

1. Check the console for error messages
2. Review logs in terminal output
3. Verify all environment variables are set
4. Ensure database is accessible
5. Check browser developer tools
6. Review [GitHub Issues](https://github.com/yourusername/smart-university-exam-system/issues)

## 📚 Additional Resources

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/schema.md)  
- [Architecture Overview](./docs/architecture.md)
- [Security Guidelines](./docs/security.md)
- [Deployment Guide](./docs/deployment.md)

---

Need more help? Open an issue on GitHub or contact the development team.