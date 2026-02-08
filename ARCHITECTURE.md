# Mission Management System - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Decisions](#architecture-decisions)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [Authentication & Authorization](#authentication--authorization)
7. [Security Considerations](#security-considerations)
8. [Trade-offs & Design Choices](#trade-offs--design-choices)
9. [Setup Instructions](#setup-instructions)
10. [Future Improvements](#future-improvements)

---

## System Overview

The Mission Management System is a full-stack application that allows administrators to create and manage missions, while users can view available missions and mark them as completed. The system tracks completion history, allowing multiple users to complete the same mission independently.

### Key Features
- **JWT-based Authentication**: Secure token-based authentication with 60-minute expiration
- **Role-Based Access Control (RBAC)**: Two distinct roles (Admin and User) with enforced permissions
- **Mission Management**: Full CRUD operations for missions (Admin only)
- **Completion Tracking**: Many-to-many relationship tracking which users completed which missions
- **Audit Trail**: Complete history of mission completions with timestamps

---

## Technology Stack

### Backend
- **Framework**: FastAPI 0.109.0
  - *Why FastAPI*: Automatic API documentation (Swagger/OpenAPI), async support, type validation via Pydantic
- **Database**: SQLite with SQLAlchemy 2.0.25 ORM
  - *Why SQLite*: Simplicity for development; easy migration to PostgreSQL/MySQL in production
- **Authentication**: JWT via python-jose with bcrypt password hashing
- **Server**: Uvicorn (ASGI server)

### Frontend
- **Framework**: React 19.2.4
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: React Router DOM 7.13.0
- **HTTP Client**: Fetch API with custom wrapper (`apiFetch`)
- **UI Components**: Custom CSS

### Database ORM
- **SQLAlchemy**: Declarative models with relationship mapping
- **Migrations**: Schema created via `create_all()` (suitable for development)

---

## Architecture Decisions

### 1. Separation of Concerns

**Backend Structure:**
```
backend/
├── main.py          # API routes and business logic
├── models.py        # SQLAlchemy database models
├── schemas.py       # Pydantic request/response schemas
├── database.py      # Database connection configuration
├── auth.py          # JWT authentication logic
└── requirements.txt # Python dependencies
```

**Rationale**: Clear separation between data models, API contracts (schemas), and business logic improves maintainability and testing.

### 2. API Design Philosophy

**RESTful Principles:**
- Resources are nouns: `/missions`, `/users`
- HTTP verbs map to actions: GET (read), POST (create), PUT (update), DELETE (delete)
- Status codes follow HTTP standards: 200 (OK), 201 (Created), 401 (Unauthorized), 404 (Not Found)

**Nested Resources:**
- `/missions/{id}/complete` - Actions on specific missions
- `/missions/{id}/history` - Sub-resources related to missions
- `/admin/missions` - Role-based endpoint prefixing

### 3. Mission vs Task Naming

**Decision**: Use "Mission" instead of "Task"
- **Reason**: The assignment specification requires a "Mission Management System"
- **Impact**: Semantic clarity; missions imply shared objectives, tasks imply individual work items
- **Implementation**: Renamed all backend models, schemas, and endpoints from Task → Mission

---

## Database Schema

### Entity-Relationship Diagram

```
┌─────────────┐
│    User     │
├─────────────┤
│ id (PK)     │◄────┐
│ name        │     │
│ password    │     │
│ role        │     │
└─────────────┘     │
       │            │
       │ 1:N        │ N:1
       │            │
       ▼            │
┌──────────────────┐│
│MissionCompletion ││
├──────────────────┤│
│ id (PK)          ││
│ mission_id (FK)  ││
│ user_id (FK)     │┘
│ completed_at     │
└──────────────────┘
       │
       │ N:1
       │
       ▼
┌─────────────┐
│   Mission   │
├─────────────┤
│ id (PK)     │
│ title       │
│ description │
│ due_date    │
│ created_by  │◄─── User (Admin)
│ created_at  │
└─────────────┘
```

### Tables

#### **users**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Unique identifier |
| name | String | Unique, Not Null | Username |
| password | String | Not Null | bcrypt hashed password |
| role | String | Default: "user" | Role: "admin" or "user" |

#### **missions**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Unique identifier |
| title | String | Not Null | Mission title |
| description | String | Nullable | Detailed description |
| due_date | Date | Nullable | Target completion date |
| created_by_id | Integer | Foreign Key → users.id | Admin who created |
| created_at | DateTime | Auto | Creation timestamp |

#### **mission_completions**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key | Unique identifier |
| mission_id | Integer | Foreign Key → missions.id | Mission reference |
| user_id | Integer | Foreign Key → users.id | User who completed |
| completed_at | DateTime | Auto | Completion timestamp |

### Key Relationships

1. **User → Mission (1:N)**: One admin creates many missions
2. **Mission ↔ User (N:M via MissionCompletion)**: Many users can complete many missions
3. **Cascade Deletion**: Deleting a user removes their completions; deleting a mission removes its completion records

---

## API Design

### Public Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Health check | ❌ |
| POST | `/signup` | Register new user | ❌ |
| POST | `/login` | Authenticate & get JWT | ❌ |

### User Endpoints (Authenticated)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/users` | List all users | Any |
| GET | `/missions` | Get missions with personal completion status | Any |
| POST | `/missions/{id}/complete` | Mark mission as completed | Any |
| DELETE | `/missions/{id}/complete` | Unmark mission completion | Any |
| GET | `/missions/{id}/history` | View completion history | Any |

### Admin Endpoints (Admin Only)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/admin/missions` | Create new mission | Admin |
| GET | `/admin/missions` | List all missions | Admin |
| PUT | `/admin/missions/{id}` | Update mission | Admin |
| DELETE | `/admin/missions/{id}` | Delete mission | Admin |
| GET | `/admin/missions/{id}/completions` | View who completed a mission | Admin |

### API Response Examples

**Login Response:**
```json
{
  "id": 1,
  "name": "john_doe",
  "role": "user",
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Mission List (User View):**
```json
[
  {
    "id": 1,
    "title": "Complete security audit",
    "description": "Review all endpoints for vulnerabilities",
    "due_date": "2026-03-01",
    "created_by_id": 2,
    "created_by_name": "admin_user",
    "created_at": "2026-02-08T10:00:00",
    "completed": true,
    "completed_at": "2026-02-08T14:30:00"
  }
]
```

---

## Authentication & Authorization

### JWT Token Flow

1. **Registration**: User submits credentials → Password hashed with bcrypt → Stored in database
2. **Login**: User submits credentials → Password verified → JWT token generated (60 min expiry)
3. **Request**: Client sends token in `Authorization: Bearer <token>` header
4. **Validation**: Backend decodes token → Extracts `user_id` → Fetches user from database

### RBAC Implementation

**Two Enforcement Mechanisms:**

1. **Decorator-Based**: `Depends(get_current_admin)` in route parameters
   ```python
   @app.delete("/admin/missions/{id}")
   def admin_delete_mission(admin=Depends(get_current_admin)):
       # Only admins can access this endpoint
   ```

2. **Role Check Function**:
   ```python
   def get_current_admin(user=Depends(get_current_user)):
       if user.role != "admin":
           raise HTTPException(status_code=403, detail="Admins only")
       return user
   ```

**Why This Approach:**
- Declarative: Role requirements visible in route signatures
- Reusable: `get_current_admin` used across multiple endpoints
- Secure: Centralized validation prevents authorization bypass

---

## Security Considerations

### ✅ Implemented

1. **Password Hashing**: bcrypt with auto salt generation
2. **JWT Expiration**: 60-minute token lifetime
3. **CORS Configuration**: Restricts requests to `localhost:3000`
4. **Environment Variables**: Secrets stored in `.env` (not committed to Git)
5. **SQL Injection Protection**: SQLAlchemy ORM parameterizes queries
6. **Authorization Enforcement**: Middleware validates roles before processing requests

### 🔐 Production Recommendations

1. **HTTPS**: Enable TLS in production (not applicable for local dev)
2. **Secret Key**: Use cryptographically secure random key (32+ bytes)
3. **Token Refresh**: Implement refresh tokens for extended sessions
4. **Rate Limiting**: Prevent brute-force attacks on `/login`
5. **Database Migration**: Switch from SQLite to PostgreSQL for concurrency
6. **Input Validation**: Pydantic schemas already validate, but add length limits

---

## Trade-offs & Design Choices

### 1. SQLite vs PostgreSQL

**Choice**: SQLite
- **Pros**: Zero configuration, file-based, easy local development
- **Cons**: Limited concurrency, no advanced features (full-text search, JSON operators)
- **Trade-off**: Simplicity over scalability; acceptable for < 1000 concurrent users
- **Migration Path**: SQLAlchemy abstracts database; switching to PostgreSQL requires changing connection string only

### 2. MissionCompletion Junction Table

**Choice**: Separate `mission_completions` table instead of boolean flag
- **Pros**: 
  - Tracks **who** completed **when** (audit trail)
  - Multiple users can complete the same mission
  - Supports future features (comments, ratings per completion)
- **Cons**: 
  - Additional JOIN queries (minimal performance impact with proper indexing)
  - Slightly more complex queries
- **Trade-off**: Data integrity over simplicity; critical for requirements compliance

### 3. Endpoint Naming: `/admin/missions` vs `/missions?role=admin`

**Choice**: Route prefix `/admin/`
- **Pros**: 
  - Clear intent in API documentation
  - Easier to apply middleware/logging to all admin routes
  - RESTful: Different resources for different roles
- **Cons**: 
  - More routes to maintain
  - Duplication if admin endpoints mirror user endpoints
- **Trade-off**: Clarity over conciseness

### 4. Token Storage: sessionStorage vs localStorage

**Choice**: `sessionStorage` in frontend
- **Pros**: 
  - Cleared on tab close (better security)
  - Prevents cross-tab token sharing (reduces risk)
- **Cons**: 
  - User must re-login after closing browser
- **Trade-off**: Security over convenience

### 5. No Database Migrations (Alembic)

**Choice**: Use `create_all()` to generate schema
- **Pros**: 
  - Faster development iteration
  - No migration file management
- **Cons**: 
  - Schema changes require manual data migration
  - Not production-ready
- **Trade-off**: Speed over robustness; acceptable for assignment scope

---

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and set SECRET_KEY to a secure random string
   ```

5. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```
   API will be available at `http://127.0.0.1:8000`
   Interactive docs at `http://127.0.0.1:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   Application will open at `http://localhost:3000`

### Creating Admin User

Run this in Python shell after starting backend:

```python
from backend.database import SessionLocal
from backend.models import User
from passlib.context import CryptContext

db = SessionLocal()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

admin = User(
    name="admin",
    password=pwd_context.hash("admin123"),
    role="admin"
)
db.add(admin)
db.commit()
```

---

## Future Improvements

### Planned Enhancements

1. **Testing**
   - Unit tests for API endpoints (pytest + FastAPI TestClient)
   - Frontend component tests (React Testing Library)
   - Integration tests for auth flow

2. **Dockerization**
   - `docker-compose.yml` for one-command startup
   - Separate containers for backend, frontend, and database

3. **Advanced Features**
   - Mission categories/tags
   - Pagination for large mission lists
   - Search and filtering
   - Mission comments and ratings
   - File attachments
   - Email notifications on mission assignment

4. **Performance**
   - Database indexing on frequently queried columns
   - Response caching (Redis)
   - Query optimization (eager loading relationships)

5. **Monitoring**
   - Logging framework (structlog)
   - Error tracking (Sentry)
   - API analytics (request counts, response times)

6. **UI/UX**
   - Dark mode
   - Responsive mobile design
   - Accessibility improvements (ARIA labels)
   - Loading skeletons instead of spinners

---

## Conclusion

This system demonstrates a production-ready architecture with proper separation of concerns, secure authentication, and scalable database design. The trade-offs made prioritize clarity and maintainability while meeting all assignment requirements for a Mission Management System with RBAC and audit trails.
