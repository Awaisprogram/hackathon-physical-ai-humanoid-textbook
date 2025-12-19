# Authentication API Contract

## User Registration

### POST /api/auth/signup
**Description**: Register a new user account

**Request**:
- Method: POST
- Path: /api/auth/signup
- Content-Type: application/json
- Headers:
  - Content-Type: application/json
- Body:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "softwareExperience": "string",
    "hardwareExperience": "string"
  }
  ```

**Response**:
- 201: User successfully registered
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "softwareExperience": "string",
      "hardwareExperience": "string",
      "createdAt": "string",
      "initials": "string"
    },
    "token": "string",
    "success": true,
    "message": "User registered successfully"
  }
  ```
- 400: Validation error
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": {
      "email": "Email already exists",
      "password": "Password must be at least 8 characters"
    }
  }
  ```
- 409: Email already exists
  ```json
  {
    "success": false,
    "message": "Email already registered"
  }
  ```
- 500: Server error
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```

## User Login

### POST /api/auth/login
**Description**: Authenticate user and return token

**Request**:
- Method: POST
- Path: /api/auth/login
- Content-Type: application/json
- Headers:
  - Content-Type: application/json
- Body:
  ```json
  {
    "email": "string",
    "password": "string",
    "rememberMe": "boolean"
  }
  ```

**Response**:
- 200: User successfully authenticated
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "softwareExperience": "string",
      "hardwareExperience": "string",
      "lastLoginAt": "string",
      "initials": "string"
    },
    "token": "string",
    "success": true,
    "message": "Login successful"
  }
  ```
- 400: Validation error
  ```json
  {
    "success": false,
    "message": "Invalid email or password format"
  }
  ```
- 401: Invalid credentials
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```
- 500: Server error
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```

## Session Check

### GET /api/auth/session
**Description**: Check current user session status

**Request**:
- Method: GET
- Path: /api/auth/session
- Headers:
  - Authorization: Bearer {token} (required)

**Response**:
- 200: Valid session
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "softwareExperience": "string",
      "hardwareExperience": "string",
      "initials": "string"
    },
    "authenticated": true,
    "expiresAt": "string"
  }
  ```
- 401: Invalid or expired token
  ```json
  {
    "authenticated": false,
    "message": "Invalid or expired token"
  }
  ```
- 500: Server error
  ```json
  {
    "authenticated": false,
    "message": "Internal server error"
  }
  ```

## User Logout

### POST /api/auth/logout
**Description**: Logout user and invalidate session

**Request**:
- Method: POST
- Path: /api/auth/logout
- Headers:
  - Authorization: Bearer {token} (required)

**Response**:
- 200: Successfully logged out
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- 401: Invalid token
  ```json
  {
    "success": false,
    "message": "Invalid token"
  }
  ```
- 500: Server error
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```

## Get User Profile

### GET /api/auth/user
**Description**: Get current user profile information

**Request**:
- Method: GET
- Path: /api/auth/user
- Headers:
  - Authorization: Bearer {token} (required)

**Response**:
- 200: User profile retrieved
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "softwareExperience": "string",
      "hardwareExperience": "string",
      "avatar": "string",
      "createdAt": "string",
      "lastLoginAt": "string",
      "initials": "string"
    }
  }
  ```
- 401: Invalid token
  ```json
  {
    "message": "Invalid or expired token"
  }
  ```
- 500: Server error
  ```json
  {
    "message": "Internal server error"
  }
  ```

## Update User Profile

### PUT /api/auth/user
**Description**: Update user profile information

**Request**:
- Method: PUT
- Path: /api/auth/user
- Content-Type: application/json
- Headers:
  - Authorization: Bearer {token} (required)
- Body:
  ```json
  {
    "name": "string",
    "email": "string",
    "softwareExperience": "string",
    "hardwareExperience": "string"
  }
  ```

**Response**:
- 200: User profile updated
  ```json
  {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "softwareExperience": "string",
      "hardwareExperience": "string",
      "avatar": "string",
      "initials": "string"
    },
    "success": true,
    "message": "Profile updated successfully"
  }
  ```
- 400: Validation error
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": {
      "email": "Email already in use"
    }
  }
  ```
- 401: Invalid token
  ```json
  {
    "success": false,
    "message": "Invalid or expired token"
  }
  ```
- 500: Server error
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```

## Password Reset Request

### POST /api/auth/forgot-password
**Description**: Request password reset link

**Request**:
- Method: POST
- Path: /api/auth/forgot-password
- Content-Type: application/json
- Headers:
  - Content-Type: application/json
- Body:
  ```json
  {
    "email": "string"
  }
  ```

**Response**:
- 200: Password reset email sent
  ```json
  {
    "success": true,
    "message": "Password reset link sent to email"
  }
  ```
- 400: Validation error
  ```json
  {
    "success": false,
    "message": "Invalid email format"
  }
  ```
- 404: User not found
  ```json
  {
    "success": false,
    "message": "No account found with this email"
  }
  ```
- 500: Server error
  ```json
  {
    "success": false,
    "message": "Internal server error"
  }
  ```