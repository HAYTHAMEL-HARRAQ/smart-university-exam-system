# 🏗️ System Architecture

## Overview

The Smart University Exam System follows a modern microservices-inspired architecture with clear separation of concerns between frontend, backend, and AI services.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Node.js Server │────│   MySQL/Oracle  │
│   (Browser)     │    │   (Express)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Services   │    │   tRPC API      │    │   Drizzle ORM   │
│  (TensorFlow.js)│    │   (TypeSafe)    │    │   (Migrations)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Architecture

### Frontend Layer
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Primitive components (buttons, inputs, etc.)
│   └── business/       # Domain-specific components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── contexts/           # React context providers
```

### Backend Layer
```
server/
├── _core/              # Core server infrastructure
│   ├── index.ts        # Main server entry point
│   ├── trpc.ts         # tRPC router setup
│   └── context.ts      # Request context
├── services/           # Business logic services
│   ├── modelDetection.ts # AI detection logic
│   ├── realDetection.ts  # Real-time monitoring
│   └── yoloIntegration.ts # Computer vision
├── routers/            # API route handlers
└── database/           # Database adapters
```

### Shared Layer
```
shared/
├── types.ts            # Shared TypeScript types
├── const.ts            # Shared constants
└── errors.ts           # Error definitions
```

## Data Flow Patterns

### 1. Exam Session Flow
```
Student Login → Exam Selection → Session Init → 
Camera Setup → Exam Taking → Auto Submit → Results
     │              │              │            │
     ▼              ▼              ▼            ▼
  Auth Service   Exam Service   AI Monitor   Grade Service
```

### 2. Proctor Monitoring Flow
```
Student Session → Real-time Feed → AI Analysis → 
Alert Generation → Proctor Notification → Action Taken
```

### 3. Incident Management Flow
```
Suspicious Activity → Alert Created → Evidence Collected → 
Proctor Review → Incident Logged → Report Generated
```

## Technology Stack Details

### Frontend Technologies
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type safety throughout
- **TailwindCSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **tRPC**: End-to-end type safety
- **Vite**: Fast build tool and dev server

### Backend Technologies
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **tRPC**: Type-safe API layer
- **Drizzle ORM**: Modern SQL toolkit
- **MySQL/Oracle**: Primary databases

### AI/ML Technologies
- **TensorFlow.js**: Client-side ML inference
- **COCO-SSD**: Object detection model
- **Pose Detection**: Human pose estimation
- **Hand Pose**: Hand gesture recognition
- **YOLO**: Advanced object detection

### Infrastructure
- **AWS S3**: Video storage
- **OCI Vision**: Cloud AI services
- **Docker**: Containerization (planned)
- **CI/CD**: Automated deployment (planned)

## Scalability Considerations

### Horizontal Scaling
- Stateless frontend components
- Session affinity for real-time connections
- Load-balanced API servers
- CDN for static assets

### Database Scaling
- Read replicas for reporting
- Connection pooling
- Query optimization
- Caching layer (Redis planned)

### AI Processing Scaling
- Web Workers for background processing
- Model quantization for performance
- Edge computing for low latency
- Batch processing for non-real-time tasks

## Security Architecture

### Authentication Flow
```
Login Request → Validate Credentials → 
Generate JWT → Set Secure Cookie → 
Validate on Subsequent Requests
```

### Authorization Layers
1. **Route-level**: Page access control
2. **Component-level**: UI element visibility
3. **API-level**: Data access restrictions
4. **Database-level**: Row-level security

### Data Protection
- Encrypted data transmission (HTTPS)
- Secure cookie flags (HttpOnly, SameSite)
- Input sanitization and validation
- Regular security audits

## Monitoring and Observability

### Logging Strategy
- Structured logging with correlation IDs
- Different log levels (debug, info, warn, error)
- Centralized log aggregation (planned)
- Performance metrics collection

### Error Handling
- Comprehensive error boundaries
- User-friendly error messages
- Detailed error reporting for developers
- Graceful degradation

### Performance Monitoring
- API response time tracking
- Database query performance
- Frontend rendering metrics
- AI processing benchmarks

## Future Architecture Improvements

### Planned Enhancements
- **Microservices**: Split monolith into services
- **Event-driven**: Message queue architecture  
- **Serverless**: FaaS for background jobs
- **GraphQL**: Alternative API layer
- **WebRTC**: Peer-to-peer video streaming

### Technology Roadmap
- **Q1 2026**: Kubernetes deployment
- **Q2 2026**: Advanced AI models
- **Q3 2026**: Mobile application
- **Q4 2026**: Multi-cloud support

---

*Last updated: January 2026*