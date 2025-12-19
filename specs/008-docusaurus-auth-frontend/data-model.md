# Data Model: Docusaurus Authentication Frontend

## User Entity

### User
- **id**: String (unique identifier)
- **name**: String (user's full name)
- **email**: String (unique email address)
- **password**: String (hashed password, stored on backend only)
- **softwareExperience**: String (experience level: "Beginner (0-1 years)", "Intermediate (2-5 years)", "Expert (5+ years)")
- **hardwareExperience**: String (experience level: "Beginner (0-1 years)", "Intermediate (2-5 years)", "Expert (5+ years)")
- **avatar**: String (URL to profile image or null)
- **initials**: String (computed from name, e.g., "JD" from "John Doe")
- **createdAt**: Date (account creation timestamp)
- **lastLoginAt**: Date (last login timestamp)
- **rememberMe**: Boolean (whether to keep user logged in for 7 days)
- **sessionTimeout**: Date (session expiry timestamp)

## Authentication State

### AuthState
- **user**: User object (null if not authenticated)
- **isAuthenticated**: Boolean (authentication status)
- **isLoading**: Boolean (auth state loading status)
- **error**: String (error message if any)
- **token**: String (JWT token, stored in cookies)

## Form Data Structures

### RegistrationFormData
- **step1**: Object
  - name: String
  - email: String
  - password: String
  - confirmPassword: String
- **step2**: Object
  - softwareExperience: String
  - hardwareExperience: String
- **step3**: Object
  - reviewData: Object (summary of all previous steps)
- **currentStep**: Number (1, 2, or 3)

### LoginFormData
- **email**: String
- **password**: String
- **rememberMe**: Boolean

### ProfileFormData
- **name**: String
- **email**: String
- **softwareExperience**: String
- **hardwareExperience**: String
- **avatar**: File (optional)

## Dashboard Data

### DashboardStats
- **welcomeMessage**: String (e.g., "Hello John!")
- **accountCreated**: Date (formatted string)
- **lastLogin**: Date (formatted string)
- **contentProgress**: Number (percentage)
- **quickActions**: Array (DashboardAction objects)

### DashboardAction
- **id**: String (unique identifier)
- **title**: String (e.g., "Edit Profile", "Change Password")
- **icon**: String (icon name from Lucide React)
- **url**: String (navigation URL)

## Validation Rules

### Registration Validation
- Name: Required, min 2 characters, max 50 characters
- Email: Required, valid email format, max 100 characters
- Password: Required, min 8 characters, contains uppercase, lowercase, number, special character
- Confirm Password: Must match password field
- Software Experience: Required
- Hardware Experience: Required

### Login Validation
- Email: Required, valid email format
- Password: Required, min 1 character

### Profile Validation
- Name: Required, min 2 characters, max 50 characters
- Email: Required, valid email format, max 100 characters

## API Request/Response Models

### LoginRequest
- **email**: String
- **password**: String
- **rememberMe**: Boolean

### LoginResponse
- **user**: User object
- **token**: String
- **success**: Boolean
- **message**: String

### RegisterRequest
- **name**: String
- **email**: String
- **password**: String
- **softwareExperience**: String
- **hardwareExperience**: String

### RegisterResponse
- **user**: User object
- **token**: String
- **success**: Boolean
- **message**: String

### SessionCheckResponse
- **user**: User object (if authenticated)
- **authenticated**: Boolean
- **expiresAt**: Date (session expiry)

### PasswordStrength
- **score**: Number (0-4 scale)
- **message**: String (e.g., "Weak", "Medium", "Strong")
- **color**: String (CSS color for progress bar)
- **requirements**: Array (PasswordRequirement objects)

### PasswordRequirement
- **text**: String (e.g., "At least 8 characters")
- **met**: Boolean