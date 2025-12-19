# Quickstart Guide: Docusaurus Authentication Frontend

## Prerequisites

- Node.js 18+
- npm or yarn package manager
- Docusaurus project already set up

## Setup

1. **Install Dependencies**
   ```bash
   npm install axios react-hot-toast framer-motion lucide-react canvas-confetti
   ```

2. **Project Structure Setup**
   Create the following directory structure in your Docusaurus project:
   ```
   src/
   ├── components/
   │   ├── Auth/
   │   ├── UI/
   │   └── Layout/
   ├── pages/
   ├── services/
   ├── contexts/
   ├── hooks/
   ├── styles/
   └── theme/
   ```

3. **Environment Configuration**
   Add authentication API endpoint to your Docusaurus config:
   ```js
   // docusaurus.config.js
   module.exports = {
     // ... other config
     themeConfig: {
       // ... other theme config
     },
     customFields: {
       authApiUrl: process.env.AUTH_API_URL || 'http://localhost:3000/api/auth'
     }
   };
   ```

## Core Implementation

1. **Initialize Auth Context**
   Create `src/contexts/AuthContext.js` with user state management, login, logout, and registration methods.

2. **Create Root Wrapper**
   Update `src/theme/Root.js` to wrap the entire app with AuthProvider and ToastContainer.

3. **Custom Navbar Integration**
   Create `src/theme/Navbar/index.js` to integrate auth state with Docusaurus navbar (show Login/Signup for guests, avatar dropdown for authenticated users).

4. **Build UI Components**
   - Input component with floating labels and validation states
   - Button component with loading states and variants
   - Dropdown with search/filter capability
   - LoadingSkeleton for async operations

5. **Create Authentication Pages**
   - `/login` - Email/password form with remember me
   - `/register` - Multi-step wizard with experience levels
   - `/dashboard` - User stats and quick actions
   - `/profile` - Editable user information

## Running the Application

1. **Start Docusaurus Development Server**
   ```bash
   npm run start
   ```

2. **Verify Installation**
   Navigate to `http://localhost:3000` to see the Docusaurus site with authentication features.

## Key Features Configuration

1. **Green Theme Setup**
   Add custom CSS variables to `src/styles/auth.css`:
   ```css
   :root {
     --auth-green-start: #4ade80;
     --auth-green-end: #22c55e;
     --auth-card-bg-light: rgba(255, 255, 255, 0.9);
     --auth-card-bg-dark: rgba(0, 0, 0, 0.7);
   }
   ```

2. **Animation Configuration**
   All auth pages use Framer Motion for fade + slide up animations (400ms ease-out)

3. **Form Validation**
   Real-time validation on blur with inline error messages and green/red borders

4. **Loading States**
   Skeleton screens for navbar, dashboard cards, and forms during async operations

## Testing
Run the test suite:
```bash
npm test
```

## File Structure Reference
```
src/
├── components/
│   ├── Auth/            # Authentication-related components
│   │   ├── AuthProvider.jsx
│   │   ├── AuthGuard.jsx
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProfileCard.jsx
│   ├── UI/              # Reusable UI components
│   │   ├── Input.jsx
│   │   ├── Button.jsx
│   │   ├── Dropdown.jsx
│   │   ├── Modal.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   └── Toast.jsx
│   └── Layout/          # Layout components
│       └── DashboardLayout.jsx
├── pages/
│   ├── login.jsx
│   ├── register.jsx
│   ├── dashboard.jsx
│   ├── profile.jsx
│   └── forgot-password.jsx
├── services/
│   ├── api.js           # Axios configuration and interceptors
│   └── auth.js          # Authentication service functions
├── contexts/
│   └── AuthContext.js   # Authentication state management
├── hooks/
│   └── useAuth.js       # Custom auth hook
├── styles/
│   └── auth.css         # Custom CSS variables and auth-specific styles
├── theme/
│   └── Navbar/
│       └── index.js     # Custom Docusaurus navbar with auth state
└── theme/
    └── Root.js          # Root component wrapping app with AuthProvider
```