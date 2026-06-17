# GoURL API

REST API backend for the **GoURL** URL shortener project. Built with **Spring Boot 4** and **Java 17**, it provides all business logic for the GoURL web application.

## Tech Stack

| Component | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 4.1.0 |
| Build Tool | Gradle |
| Database | PostgreSQL _(planned)_ |
| Auth | Spring Security + OAuth2 _(planned)_ |

## Features

The API serves the core features of the project:

| Feature ID | Description |
|---|---|
| FA-SHORTEN | Create short link — validate URL, generate short code, store mapping |
| FA-REDIRECT | Redirect — lookup short code, 302 active / 410 expired / 404 missing |
| FA-SIGNIN | Google OAuth authentication |
| FA-HISTORY | List user's own links (auth required) |
| FA-MANAGE | Edit destination, disable/enable, delete own links (auth + owner) |
| FA-EXPIRY | Link expiration — anon: 30 days, user: permanent or custom date |
| FC-DASH / FC-LINKS / FC-USERS / FC-RBAC | CMS / Admin endpoints |

## Directory Structure

```
go_url_api/
├── src/
│   ├── main/
│   │   ├── java/it/thoson/GoURL/
│   │   │   ├── GoUrlApplication.java           # Application entry point
│   │   │   │
│   │   │   ├── config/                         # Application configuration
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── OpenApiConfig.java
│   │   │   │
│   │   │   ├── controller/                     # REST Controllers (HTTP layer)
│   │   │   │   ├── LinkController.java         # POST /api/links, GET /api/links
│   │   │   │   ├── RedirectController.java     # GET /{code}
│   │   │   │   ├── AuthController.java         # POST /api/auth/...
│   │   │   │   └── admin/
│   │   │   │       ├── AdminLinkController.java
│   │   │   │       └── AdminUserController.java
│   │   │   │
│   │   │   ├── service/                        # Business logic
│   │   │   │   ├── LinkService.java
│   │   │   │   ├── RedirectService.java
│   │   │   │   ├── CodeGeneratorService.java   # base62(id) logic
│   │   │   │   └── UserService.java
│   │   │   │
│   │   │   ├── repository/                     # Data access layer
│   │   │   │   ├── LinkRepository.java
│   │   │   │   └── UserRepository.java
│   │   │   │
│   │   │   ├── domain/                         # JPA Entities
│   │   │   │   ├── Link.java
│   │   │   │   └── User.java
│   │   │   │
│   │   │   ├── dto/                            # Request / Response DTOs
│   │   │   │   ├── request/
│   │   │   │   │   ├── CreateLinkRequest.java
│   │   │   │   │   └── UpdateLinkRequest.java
│   │   │   │   └── response/
│   │   │   │       ├── LinkResponse.java
│   │   │   │       └── ApiResponse.java        # { success, data, error, meta }
│   │   │   │
│   │   │   └── exception/                      # Exception handling
│   │   │       ├── GlobalExceptionHandler.java
│   │   │       ├── LinkNotFoundException.java
│   │   │       └── LinkExpiredException.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties          # Default config
│   │       ├── application-dev.properties      # Dev environment
│   │       └── application-prod.properties     # Production environment
│   │
│   └── test/
│       └── java/it/thoson/GoURL/
│           ├── controller/                     # Web layer tests (MockMvc)
│           ├── service/                        # Unit tests (Mockito)
│           ├── repository/                     # Integration tests (Testcontainers)
│           └── GoUrlApplicationTests.java
│
├── build.gradle
├── settings.gradle
├── gradlew
└── README.md
```

## Running Locally

**Requirements:** Java 17+

```bash
# Run the application
./gradlew bootRun

# Build JAR
./gradlew build

# Run tests
./gradlew test
```

API runs at `http://localhost:8080` by default.

## Environment Variables

Copy `.env.example` from the project root and fill in the values:

| Variable | Description |
|---|---|
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |

## API Endpoints

Full API reference: [`docs/api/api.md`](../../../../docs/api/api.md)

### Response envelope

```json
{ "success": true,  "data": {},   "error": null }
{ "success": false, "data": null, "error": { "code": "STRING_CODE", "message": "..." } }
```

List endpoints include `"meta": { "page": 1, "limit": 20, "total": 137 }`.

### Public

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/:code` | — | Resolve & redirect |

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/anonymous` | — | Issue anonymous JWT |
| `POST` | `/api/auth/login` | — | Email + password login (admin / super_admin) |
| `GET` | `/api/auth/google` | — | Begin Google OAuth |
| `GET` | `/api/auth/google/callback` | — | OAuth callback + anon-link claim |
| `POST` | `/api/auth/refresh` | — | Refresh access token |
| `POST` | `/api/auth/logout` | user | Invalidate refresh token |

### Links (user)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/links` | anon / user | Create a short link |
| `GET` | `/api/links` | user | List own links |
| `PATCH` | `/api/links/:id` | user (owner) | Edit destination or status |
| `DELETE` | `/api/links/:id` | user (owner) | Delete own link |

### Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | admin | KPI snapshot |
| `GET` | `/api/admin/links` | admin | Search / filter all links |
| `GET` | `/api/admin/links/:id` | admin | Link detail |
| `PATCH` | `/api/admin/links/:id` | admin | Disable / enable / force-expire |
| `GET` | `/api/admin/users` | admin | List / search users |
| `GET` | `/api/admin/users/:id` | admin | User detail |
| `GET` | `/api/admin/users/:id/links` | admin | Links owned by user |
| `PATCH` | `/api/admin/users/:id` | admin | Suspend / unsuspend |
| `PATCH` | `/api/admin/users/:id/role` | super_admin | Assign role |

---

## Development Plan

- [ ] Add dependencies to `build.gradle`: Spring Data JPA, PostgreSQL driver, Spring Security, OAuth2 Client, Flyway
- [ ] Set up `docker-compose.yml` for local PostgreSQL
- [ ] Configure `application-dev.properties` (datasource, JPA, logging)
- [ ] Create entities: `User`, `Link`, `Account` — see [`docs/database.md`](../../../../docs/database.md) for schema
- [ ] Create `LinkRepository`, `UserRepository` with required query methods
- [ ] Write Flyway migration for initial schema + seed (super_admin + sample links)
- [ ] `CodeGeneratorService` — `base62(id)` encode/decode
- [ ] URL validation — `http`/`https` only, reject self-referential URLs
- [ ] `POST /api/links` — validate → insert → `code = base62(id)` → return `{ code, shortUrl, expiresAt }`
- [ ] `GET /{code}` — **302** active · **410** expired · **404** missing/disabled + atomic `click_count + 1`
- [ ] `GlobalExceptionHandler` — map domain exceptions to HTTP responses
- [ ] `POST /api/auth/anonymous` — issue anonymous JWT; ties anonymous links to the client
- [ ] `POST /api/auth/login` — email + password login for admin / super_admin
- [ ] Google OAuth2 — `GET /api/auth/google` → `GET /api/auth/google/callback`; on callback upsert `Account` + `User` + claim anonymous links
- [ ] `POST /api/auth/refresh` / `POST /api/auth/logout` — token lifecycle
- [ ] Anonymous links expire in 30 days; authenticated links permanent or custom date
- [ ] `GET /api/links` — list own links (user JWT required)
- [ ] `PATCH /api/links/{id}` — edit URL or toggle disable/enable (owner only → 404 if not owned)
- [ ] `DELETE /api/links/{id}` — hard delete (owner only)
- [ ] RBAC guard on all `/api/admin/**` — role presets: `USER / ADMIN / SUPER_ADMIN`
- [ ] `GET /api/admin/stats` — total links, links today, active users (KPI snapshot)
- [ ] `GET /api/admin/links` + `GET /api/admin/links/{id}` — search/filter + pagination; `PATCH` disable / enable / force-expire
- [ ] `GET /api/admin/users` + `GET /api/admin/users/{id}` + `GET /api/admin/users/{id}/links` — list/detail/links per user
- [ ] `PATCH /api/admin/users/{id}` — suspend / unsuspend
- [ ] `PATCH /api/admin/users/{id}/role` — SUPER_ADMIN only; block self-demotion + last super-admin removal
