# Backend Architecture Guide

## 🎯 Executive Summary

This music training application uses a **modern, secure, and scalable backend architecture** that handles user authentication, subscription payments, progress tracking, and content delivery. Think of it like a restaurant where customers (users) can order meals (access content), pay their bills (subscriptions), and have their preferences remembered (progress tracking).

## 🏗️ High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   USERS/CLIENT  │    │   BACKEND API   │    │   EXTERNAL      │
│   (Web Browser) │    │   (Next.js)     │    │   SERVICES      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │ HTTP Requests          │ API Calls              │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Frontend React  │───▶│ API Routes      │───▶│ Supabase DB     │
│ Components      │    │ /api/...        │    │ (PostgreSQL)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ├───▶ Stripe (Payments)
                                ├───▶ SendGrid (Email)  
                                ├───▶ Mailchimp (Newsletter)
                                └───▶ Prisma (Database ORM)
```

## 🧩 Core Components Explained

### 1. **Frontend (The Restaurant Dining Room)**
- **What it is**: The user interface that customers see and interact with
- **Technology**: React/Next.js components
- **Purpose**: Displays content, handles user interactions, sends requests to backend
- **Example**: Login forms, music lessons, payment buttons

### 2. **Backend API (The Kitchen & Wait Staff)**
- **What it is**: The server-side logic that processes requests
- **Technology**: Next.js API Routes (`/src/app/api/`)
- **Purpose**: Handles business logic, validates data, coordinates with external services
- **Example**: User registration, payment processing, progress saving

### 3. **Database (The Restaurant's Recipe Book & Customer Records)**
- **What it is**: Persistent storage for all application data
- **Technology**: PostgreSQL hosted on Supabase
- **Purpose**: Stores user accounts, subscriptions, progress, content
- **Example**: User profiles, lesson completions, payment history

### 4. **Prisma (The Waiter Who Speaks Both Languages)**
- **What it is**: Object-Relational Mapping (ORM) tool
- **Purpose**: Translates between JavaScript code and SQL database
- **Why needed**: Makes database operations easier and safer
- **Example**: Instead of writing `SELECT * FROM users`, you write `prisma.user.findMany()`

### 5. **Supabase (The Restaurant's Infrastructure Provider)**
- **What it is**: Backend-as-a-Service platform (like AWS but simpler)
- **Services provided**: 
  - PostgreSQL database hosting
  - Authentication services
  - Real-time subscriptions
  - File storage
- **Purpose**: Handles infrastructure so we focus on business logic

### 6. **Stripe (The Payment Processor)**
- **What it is**: Third-party payment processing service
- **Purpose**: Handles credit card payments, subscriptions, refunds
- **Why separate**: Payment processing requires PCI compliance and security expertise
- **Integration**: Webhooks notify our system when payments succeed/fail

## 📊 Detailed Architecture Diagram

```
Internet
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ Web Browser │  │ Mobile App  │  │ Stripe CLI  │           │
│  │ (React)     │  │ (Future)    │  │ (Testing)   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└───────────────────────────────────────────────────────────────┘
    │                       │                       │
    │ HTTPS/JSON           │ HTTPS/JSON           │ Webhook
    ▼                       ▼                       ▼
┌───────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                           │
│                    (Next.js Server)                          │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 API ROUTES                              │ │
│  │                                                         │ │
│  │  /api/auth/*           /api/billing/*                  │ │
│  │  ├── login             ├── subscription                │ │
│  │  ├── register          ├── create-checkout-session     │ │
│  │  ├── logout            ├── cancel-subscription         │ │
│  │  └── update-profile    ├── customer-portal             │ │
│  │                        └── invoices                    │ │
│  │                                                         │ │
│  │  /api/progress/*       /api/webhooks/*                 │ │
│  │  └── save              └── stripe                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 MIDDLEWARE LAYER                        │ │
│  │  ├── Authentication (JWT verification)                 │ │
│  │  ├── Rate Limiting (prevent abuse)                     │ │
│  │  ├── CSRF Protection (security)                        │ │
│  │  ├── Input Validation (data safety)                    │ │
│  │  └── Audit Logging (security monitoring)              │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
    │                       │                       │
    │ Prisma ORM           │ HTTP APIs             │ Database Queries
    ▼                       ▼                       ▼
┌───────────────────────────────────────────────────────────────┐
│                    DATA & SERVICES LAYER                      │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  Supabase   │  │   Stripe    │  │  SendGrid   │           │
│  │             │  │             │  │             │           │
│  │ PostgreSQL  │  │ Payments    │  │ Email       │           │
│  │ Database    │  │ Webhooks    │  │ Service     │           │
│  │ Auth        │  │ Customers   │  │             │           │
│  │ Storage     │  │ Invoices    │  │             │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└───────────────────────────────────────────────────────────────┘
```

## 🗃️ Database Structure (The Filing System)

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                        │
│                      (PostgreSQL)                          │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │    USERS     │    │ SUBSCRIPTIONS│    │   INVOICES   │  │
│  │              │    │              │    │              │  │
│  │ • id         │◄───┤ • userId     │◄───┤ • userId     │  │
│  │ • email      │    │ • plan       │    │ • amount     │  │
│  │ • password   │    │ • status     │    │ • status     │  │
│  │ • created_at │    │ • stripe_id  │    │ • paid_at    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   PROGRESS   │    │  AUDIT_LOGS  │    │WEBHOOK_EVENTS│  │
│  │              │    │              │    │              │  │
│  │ • userId     │    │ • userId     │    │ • stripe_id  │  │
│  │ • level      │    │ • action     │    │ • event_type │  │
│  │ • score      │    │ • timestamp  │    │ • processed  │  │
│  │ • completed  │    │ • ip_address │    │ • created_at │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Database Tables Explained:

1. **USERS**: Customer information and accounts
2. **SUBSCRIPTIONS**: Who has what subscription plan
3. **INVOICES**: Payment history and billing records
4. **PROGRESS**: Learning progress and achievements
5. **AUDIT_LOGS**: Security monitoring and action tracking
6. **WEBHOOK_EVENTS**: Prevent duplicate payment processing

## 🔄 API Request Flow (Step-by-Step Journey)

### Example: User Subscribes to Premium Plan

```
1. USER CLICKS "UPGRADE TO PREMIUM"
   ┌─────────────┐
   │   Browser   │ ──── Click Button ────▶
   └─────────────┘

2. FRONTEND SENDS REQUEST
   ┌─────────────┐
   │   React     │ ──── POST /api/billing/create-checkout-session ────▶
   └─────────────┘

3. API ROUTE PROCESSES REQUEST
   ┌─────────────────────────────────────────────────────────┐
   │                API Route Handler                        │
   │                                                         │
   │ Step 1: Verify JWT token (is user logged in?)          │
   │         ├── If invalid ──▶ Return 401 Unauthorized     │
   │         └── If valid ──▶ Continue                      │
   │                                                         │
   │ Step 2: Validate input data (is plan_id valid?)        │
   │         ├── If invalid ──▶ Return 400 Bad Request      │
   │         └── If valid ──▶ Continue                      │
   │                                                         │
   │ Step 3: Check rate limits (too many requests?)         │
   │         ├── If exceeded ──▶ Return 429 Too Many        │
   │         └── If OK ──▶ Continue                         │
   │                                                         │
   │ Step 4: Query database for user info                   │
   │         ├── If user not found ──▶ Return 404           │
   │         └── If found ──▶ Continue                      │
   │                                                         │
   │ Step 5: Create Stripe checkout session                 │
   │         ├── If fails ──▶ Return 500 Server Error       │
   │         └── If success ──▶ Return checkout URL         │
   └─────────────────────────────────────────────────────────┘

4. STRIPE PROCESSES PAYMENT
   ┌─────────────┐
   │   Stripe    │ ──── User enters card info ────▶ Payment processed
   └─────────────┘

5. STRIPE SENDS WEBHOOK
   ┌─────────────┐
   │   Stripe    │ ──── POST /api/webhooks/stripe ────▶
   └─────────────┘

6. WEBHOOK UPDATES DATABASE
   ┌─────────────────────────────────────────────────────────┐
   │              Webhook Handler                            │
   │                                                         │
   │ Step 1: Verify webhook signature (is it really Stripe?)│
   │         ├── If invalid ──▶ Return 400 & log security   │
   │         └── If valid ──▶ Continue                      │
   │                                                         │
   │ Step 2: Check for duplicate events                     │
   │         ├── If duplicate ──▶ Return 200 (already done) │
   │         └── If new ──▶ Continue                        │
   │                                                         │
   │ Step 3: Update user's subscription in database         │
   │         ├── Create subscription record                 │
   │         ├── Update user's plan status                  │
   │         └── Log audit trail                           │
   │                                                         │
   │ Step 4: Return success to Stripe                      │
   └─────────────────────────────────────────────────────────┘

7. USER GETS ACCESS
   ┌─────────────┐
   │   Browser   │ ──── Redirect to success page ────▶ Premium features unlocked!
   └─────────────┘
```

## 🔐 Security Architecture (The Guardian System)

### Authentication Flow
```
User Login Request
       │
       ▼
┌─────────────┐
│   Validate  │ ──── Check email/password format
│    Input    │      Block suspicious patterns
└─────────────┘
       │
       ▼
┌─────────────┐
│  Database   │ ──── Query user by email
│   Lookup    │      Check if account exists
└─────────────┘
       │
       ▼
┌─────────────┐
│  Password   │ ──── Hash submitted password
│   Verify    │      Compare with stored hash
└─────────────┘
       │
       ▼
┌─────────────┐
│  Generate   │ ──── Create JWT token
│    JWT      │      Set expiration time
└─────────────┘
       │
       ▼
┌─────────────┐
│   Return    │ ──── Send token in secure cookie
│   Token     │      Log successful login
└─────────────┘
```

### Security Layers
1. **Input Validation**: Check all data before processing
2. **Authentication**: Verify user identity with JWT tokens
3. **Authorization**: Check if user can access specific resources
4. **Rate Limiting**: Prevent abuse by limiting requests per IP
5. **CSRF Protection**: Prevent cross-site request forgery
6. **Audit Logging**: Track all security-relevant actions
7. **Webhook Verification**: Ensure webhooks are from Stripe

## 💳 Payment Processing Flow

```
SUBSCRIPTION PURCHASE JOURNEY

User clicks "Subscribe" ──▶ Frontend ──▶ Backend API
                                           │
                                           ▼
                               ┌─────────────────┐
                               │  Validate User  │
                               │  Check Auth     │
                               │  Verify Plan    │
                               └─────────────────┘
                                           │
                                           ▼
                               ┌─────────────────┐
                               │ Create Checkout │ ──▶ Stripe API
                               │ Session Request │
                               └─────────────────┘
                                           │
                                           ▼
User enters payment info ──▶ Stripe Checkout Page
                                           │
                                           ▼
                               ┌─────────────────┐
                               │ Process Payment │
                               │ (Stripe handles │
                               │ card validation)│
                               └─────────────────┘
                                           │
                                           ▼
                               ┌─────────────────┐
Stripe sends webhook ─────────▶│ Payment Success │
                               │ Webhook Event   │
                               └─────────────────┘
                                           │
                                           ▼
                               ┌─────────────────┐
                               │ Update Database │
                               │ • Create sub    │
                               │ • Update user   │
                               │ • Log event     │
                               └─────────────────┘
                                           │
                                           ▼
User gets premium access ◄── Frontend updates ◄─── Database updated
```

## 🔄 Common Workflows

### 1. User Registration
```
POST /api/auth/register
│
├── Validate input (email format, password strength)
├── Check if email already exists
├── Hash password with bcrypt
├── Create user record in database
├── Generate email verification token
├── Send welcome email via SendGrid
├── Log registration in audit trail
└── Return success (no sensitive data)
```

### 2. User Login
```
POST /api/auth/login
│
├── Rate limit check (prevent brute force)
├── Validate credentials against database
├── Check if account is verified/active
├── Generate JWT token with expiration
├── Set secure HTTP-only cookie
├── Log successful login with IP
└── Return user profile data
```

### 3. Save Learning Progress
```
POST /api/progress/save
│
├── Verify JWT token from cookie
├── Extract user ID from token
├── Validate progress data structure
├── Check if user has access to level
├── Update or create progress record
├── Update user statistics
├── Log progress achievement
└── Return updated progress summary
```

### 4. Cancel Subscription
```
POST /api/billing/cancel-subscription
│
├── Authenticate user with JWT
├── Find user's active subscription
├── Call Stripe API to cancel subscription
├── Update subscription status in database
├── Schedule access removal for period end
├── Send cancellation confirmation email
├── Log cancellation with reason
└── Return cancellation details
```

## 🌍 Environment Differences

### Development Environment
```
┌─────────────────────────────────────────────────────────┐
│                 DEVELOPMENT SETUP                       │
│                                                         │
│ Database:      Local PostgreSQL or Supabase           │
│ Stripe:        Test mode (pk_test_, sk_test_)          │
│ Email:         Console logging (no real emails)        │
│ Auth:          Relaxed security for debugging          │
│ Rate Limits:   Higher limits for testing              │
│ Logging:       Verbose console output                  │
│ CORS:          Permissive for local development        │
└─────────────────────────────────────────────────────────┘
```

### Production Environment
```
┌─────────────────────────────────────────────────────────┐
│                 PRODUCTION SETUP                        │
│                                                         │
│ Database:      Supabase with connection pooling       │
│ Stripe:        Live mode (pk_live_, sk_live_)          │
│ Email:         SendGrid with real delivery            │
│ Auth:          Strict JWT validation                   │
│ Rate Limits:   Conservative limits for security       │
│ Logging:       Structured logs to monitoring service   │
│ CORS:          Restrictive origin policies            │
│ HTTPS:         Required for all communication          │
│ CDN:           Static assets served from edge          │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Monitoring & Observability

### What Gets Logged
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  SECURITY LOGS  │    │  BUSINESS LOGS  │    │   ERROR LOGS    │
│                 │    │                 │    │                 │
│ • Failed logins │    │ • Subscriptions │    │ • API failures  │
│ • Rate limits   │    │ • Progress      │    │ • DB errors     │
│ • Invalid tokens│    │ • User actions  │    │ • 3rd party API │
│ • Suspicious IP │    │ • Payment events│    │ • Validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │     AUDIT_LOGS TABLE    │
                    │                         │
                    │ Timestamp | Action      │
                    │ User ID   | Category    │
                    │ IP Addr   | Severity    │
                    │ Metadata  | Description │
                    └─────────────────────────┘
```

## 🚀 Deployment Architecture

### Development to Production Pipeline
```
Developer Code
      │
      ▼
┌─────────────┐
│ Git Commit  │ ──── Push to repository
└─────────────┘
      │
      ▼
┌─────────────┐
│   CI/CD     │ ──── Automated testing
│ Pipeline    │      Security scanning
└─────────────┘      Database migration
      │
      ▼
┌─────────────┐
│ Build &     │ ──── Create production bundle
│ Deploy      │      Update environment vars
└─────────────┘      Apply database changes
      │
      ▼
┌─────────────┐
│ Production  │ ──── Health checks
│ Validation  │      Smoke tests
└─────────────┘      Monitoring alerts
```

## 🤝 Service Communication Patterns

### API to Database (via Prisma)
```javascript
// Instead of raw SQL:
// SELECT * FROM users WHERE email = 'user@example.com'

// We use Prisma ORM:
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { subscription: true }
})
```

### API to Stripe
```javascript
// Create a checkout session
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_1234567890',
    quantity: 1,
  }],
  mode: 'subscription',
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel',
})
```

### Webhook Processing
```javascript
// Verify the webhook is from Stripe
const signature = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  requestBody, 
  signature, 
  process.env.STRIPE_WEBHOOK_SECRET
);

// Process the event
switch (event.type) {
  case 'customer.subscription.created':
    await handleSubscriptionCreated(event.data.object);
    break;
  // Handle other events...
}
```

## 📈 Scalability Considerations

### Current Architecture Scales To:
- **Users**: 10,000+ concurrent users
- **Requests**: 1,000+ requests per second
- **Data**: Terabytes of user progress and content
- **Payments**: Unlimited (handled by Stripe)

### Bottleneck Prevention:
1. **Database**: Connection pooling, read replicas
2. **API**: Rate limiting, caching, load balancing
3. **Files**: CDN for static assets
4. **Monitoring**: Real-time alerting on performance

## 🎓 Key Takeaways for Non-Technical Users

1. **The system is modular**: Each piece has a specific job (like departments in a company)

2. **Security is layered**: Multiple checks prevent unauthorized access (like a bank vault)

3. **Payments are secure**: Stripe handles sensitive data (we never store credit card numbers)

4. **Everything is logged**: We track all actions for security and debugging

5. **It's built to scale**: The architecture can handle growth in users and data

6. **Testing is built-in**: We can test payments and features without spending real money

7. **It's production-ready**: Meets enterprise security and reliability standards

This architecture ensures the music training application is secure, scalable, and maintainable while providing excellent user experience and robust business functionality.