# 📡 API Documentation

## Overview

All API endpoints are exposed through tRPC with full TypeScript type safety. The API follows REST-like conventions wrapped in RPC calls for better type inference and developer experience.

## Base URL

```
Development: http://localhost:3000/trpc
Production: https://your-domain.com/trpc
```

## Authentication

Most endpoints require authentication via secure HTTP-only cookies set during login.

### Login Endpoint
```typescript
mutation.login({
  email: string,
  password: string
})
```

Response:
```typescript
{
  success: boolean,
  user: {
    id: string,
    email: string,
    role: 'student' | 'proctor' | 'admin',
    name: string
  }
}
```

## API Endpoints

### Authentication Routes

#### `auth.login`
User authentication
```typescript
// Request
{
  email: "student@example.com",
  password: "password123"
}

// Response
{
  success: true,
  user: {
    id: "user_123",
    email: "student@example.com",
    role: "student",
    name: "John Doe"
  }
}
```

#### `auth.logout`
End user session
```typescript
// No parameters required
mutation.logout()
```

#### `auth.getCurrentUser`
Get currently authenticated user
```typescript
query.getCurrentUser()

// Response
{
  id: "user_123",
  email: "student@example.com",
  role: "student",
  name: "John Doe",
  createdAt: "2026-01-22T10:00:00Z"
}
```

### Exam Routes

#### `exams.list`
Get available exams for student
```typescript
query.exams.list({
  courseId?: string,
  status?: 'upcoming' | 'active' | 'completed'
})

// Response
Exam[] // Array of exam objects
```

#### `exams.getById`
Get specific exam details
```typescript
query.exams.getById({
  id: "exam_123"
})

// Response
{
  id: "exam_123",
  title: "Mathematics Final Exam",
  duration: 120, // minutes
  startDate: "2026-01-22T10:00:00Z",
  endDate: "2026-01-22T12:00:00Z",
  questions: Question[],
  course: {
    id: "course_123",
    name: "Mathematics 101"
  }
}
```

#### `exams.startSession`
Initialize exam session
```typescript
mutation.exams.startSession({
  examId: "exam_123"
})

// Response
{
  sessionId: "session_456",
  startTime: "2026-01-22T10:00:00Z",
  endTime: "2026-01-22T12:00:00Z"
}
```

#### `exams.submitAnswer`
Submit answer for a question
```typescript
mutation.exams.submitAnswer({
  sessionId: "session_456",
  questionId: "question_789",
  answer: "Option A" // or array for multiple choice
})
```

#### `exams.completeExam`
Finish exam session
```typescript
mutation.exams.completeExam({
  sessionId: "session_456"
})
```

### Session Monitoring Routes

#### `sessions.getActive`
Get active monitoring sessions
```typescript
query.sessions.getActive({
  proctorId?: string
})
```

#### `sessions.getById`
Get session details
```typescript
query.sessions.getById({
  id: "session_456"
})
```

#### `sessions.updateStatus`
Update session monitoring status
```typescript
mutation.sessions.updateStatus({
  sessionId: "session_456",
  status: 'active' | 'paused' | 'terminated',
  reason?: string
})
```

### Detection Routes

#### `detection.analyzeFrame`
Process video frame for AI detection
```typescript
mutation.detection.analyzeFrame({
  sessionId: "session_456",
  imageData: base64ImageString,
  timestamp: Date.now()
})

// Response
{
  detections: [
    {
      type: 'face' | 'phone' | 'multiple_faces' | 'off_screen',
      confidence: 0.95,
      boundingBox: { x: 100, y: 100, width: 200, height: 200 }
    }
  ],
  riskLevel: 'low' | 'medium' | 'high'
}
```

#### `detection.getHistory`
Get detection history for session
```typescript
query.detection.getHistory({
  sessionId: "session_456",
  startTime?: Date,
  endTime?: Date
})
```

### Incident Routes

#### `incidents.create`
Create new incident report
```typescript
mutation.incidents.create({
  sessionId: "session_456",
  type: 'suspicious_behavior' | 'technical_issue' | 'other',
  description: "Student looked away from screen multiple times",
  severity: 'low' | 'medium' | 'high',
  evidence: {
    screenshot?: base64String,
    timestamp: Date.now(),
    detections: Detection[]
  }
})
```

#### `incidents.list`
Get incidents for review
```typescript
query.incidents.list({
  status?: 'pending' | 'investigated' | 'resolved',
  proctorId?: string,
  dateRange?: { start: Date, end: Date }
})
```

#### `incidents.update`
Update incident status
```typescript
mutation.incidents.update({
  id: "incident_123",
  status: 'investigated',
  resolution: "Reviewed - no action needed",
  resolvedBy: "proctor_456"
})
```

### User Management Routes

#### `users.list`
Get users (admin only)
```typescript
query.users.list({
  role?: 'student' | 'proctor' | 'admin',
  status?: 'active' | 'inactive'
})
```

#### `users.create`
Create new user (admin only)
```typescript
mutation.users.create({
  email: "new.student@example.com",
  name: "Jane Smith",
  role: "student",
  password: "securePassword123"
})
```

#### `users.update`
Update user information
```typescript
mutation.users.update({
  id: "user_123",
  updates: {
    name?: string,
    email?: string,
    status?: 'active' | 'inactive'
  }
})
```

### Analytics Routes

#### `analytics.getFraudStats`
Get fraud statistics
```typescript
query.analytics.getFraudStats({
  courseId?: string,
  dateRange?: { start: Date, end: Date }
})

// Response
{
  totalIncidents: 45,
  resolvedIncidents: 32,
  pendingIncidents: 13,
  fraudRate: 0.15, // 15%
  commonPatterns: [
    { type: 'off_screen_gaze', count: 25 },
    { type: 'phone_detected', count: 15 }
  ]
}
```

#### `analytics.getSessionMetrics`
Get session performance metrics
```typescript
query.analytics.getSessionMetrics({
  sessionId: "session_456"
})
```

## Error Handling

All API responses follow a consistent error format:

```typescript
{
  success: false,
  error: {
    code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR',
    message: 'Human readable error message',
    details?: any // Additional error context
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Invalid input data
- `INTERNAL_ERROR`: Server-side error

## Rate Limiting

API endpoints implement rate limiting:
- **Authentication**: 10 requests/minute
- **General API**: 100 requests/minute
- **AI Detection**: 30 requests/minute
- **File Uploads**: 5 requests/minute

## WebSocket Events

Real-time monitoring uses WebSocket connections:

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
```

### Events

#### `session-update`
```javascript
{
  type: 'session-update',
  sessionId: 'session_123',
  data: {
    status: 'active',
    currentTime: Date.now(),
    remainingTime: 3600 // seconds
  }
}
```

#### `alert-triggered`
```javascript
{
  type: 'alert-triggered',
  sessionId: 'session_123',
  alert: {
    id: 'alert_456',
    type: 'suspicious_behavior',
    severity: 'high',
    message: 'Multiple faces detected',
    timestamp: Date.now()
  }
}
```

#### `incident-created`
```javascript
{
  type: 'incident-created',
  incident: {
    id: 'incident_789',
    sessionId: 'session_123',
    type: 'cheating_attempt',
    severity: 'high',
    createdAt: Date.now()
  }
}
```

## File Upload Endpoints

### Video Evidence Upload
```typescript
POST /api/upload/video
Content-Type: multipart/form-data

Fields:
- sessionId: string
- file: video file
- timestamp: number

Response:
{
  success: true,
  url: "https://s3.amazonaws.com/bucket/session_123_video.mp4"
}
```

### Screenshot Upload
```typescript
POST /api/upload/screenshot
Content-Type: multipart/form-data

Fields:
- sessionId: string
- file: image file
- timestamp: number

Response:
{
  success: true,
  url: "https://s3.amazonaws.com/bucket/session_123_screenshot.jpg"
}
```

## Pagination

List endpoints support pagination:

```typescript
query.exams.list({
  limit: 20,
  offset: 0,
  sortBy: 'createdAt',
  sortOrder: 'desc'
})
```

Response includes pagination info:
```typescript
{
  data: [...],
  pagination: {
    total: 150,
    limit: 20,
    offset: 0,
    hasNext: true,
    hasPrevious: false
  }
}
```

## Filtering and Sorting

Most list endpoints support filtering and sorting:

```typescript
query.incidents.list({
  filters: {
    status: 'pending',
    severity: ['high', 'medium'],
    dateRange: {
      start: '2026-01-01',
      end: '2026-01-31'
    }
  },
  sort: {
    field: 'createdAt',
    order: 'desc'
  }
})
```

## Versioning

API version is included in the endpoint URL:
```
/trpc/v1/endpoint-name
```

Current version: v1

## Example Usage

### JavaScript/TypeScript Client
```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

// Usage
try {
  const user = await client.auth.getCurrentUser.query();
  const exams = await client.exams.list.query({ status: 'active' });
  console.log('Active exams:', exams);
} catch (error) {
  console.error('API Error:', error);
}
```

### Python Client Example
```python
import requests

# Login
response = requests.post('http://localhost:3000/trpc/auth.login', json={
    'email': 'student@example.com',
    'password': 'password123'
})

# Get exams
headers = {'Authorization': f'Bearer {response.json()["token"]}'}
exams = requests.get('http://localhost:3000/trpc/exams.list', headers=headers)
```

---

*Last updated: January 2026*