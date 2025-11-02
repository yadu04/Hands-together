# Error Handling Implementation Guide for Hand Together

## Overview

This guide shows how to implement robust error handling across your Hand Together project using centralized error handling middleware.

## What We've Implemented

### 1. Centralized Error Handler (`backend/middleware/errorHandler.js`)

- **Custom Error Classes**: `AppError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`
- **Error Handler Middleware**: Catches all errors and returns consistent JSON responses
- **Async Handler**: Wraps async functions to catch promise rejections
- **Helper Functions**: `validateRequired`, `checkResourceExists`, `checkResourceAccess`

### 2. Updated Controllers

- **userController.js**: Registration, login, profile management with proper validation
- **chatController.js**: Chat operations with access control
- **neighborhoodController.js**: Neighborhood CRUD with validation
- **pointsOfInterestController.js**: POI management with coordinate validation

### 3. Server Integration

- Added error handler middleware to `server.js` (must be last middleware)

## How to Use in Your Controllers

### Basic Pattern

```javascript
import {
  asyncHandler,
  validateRequired,
  checkResourceExists,
} from "../middleware/errorHandler.js";

export const someController = asyncHandler(async (req, res) => {
  // Validate input
  validateRequired(req.body, ["field1", "field2"]);

  // Check if resource exists
  const resource = await checkResourceExists(Model, req.params.id);

  // Your business logic here

  res.status(200).json({
    success: true,
    data: result,
  });
});
```

### Error Types You Can Throw

#### 1. Validation Errors (400)

```javascript
import { ValidationError } from "../middleware/errorHandler.js";

// Missing required fields
validateRequired(req.body, ["name", "email"]);

// Custom validation
if (!email.includes("@")) {
  throw new ValidationError("Invalid email format");
}
```

#### 2. Not Found Errors (404)

```javascript
import {
  NotFoundError,
  checkResourceExists,
} from "../middleware/errorHandler.js";

// Check if resource exists
const user = await checkResourceExists(UserModel, userId);

// Custom not found
if (!user) {
  throw new NotFoundError("User");
}
```

#### 3. Unauthorized Errors (401)

```javascript
import { UnauthorizedError } from "../middleware/errorHandler.js";

if (!isPasswordValid) {
  throw new UnauthorizedError("Invalid credentials");
}
```

#### 4. Forbidden Errors (403)

```javascript
import {
  ForbiddenError,
  checkResourceAccess,
} from "../middleware/errorHandler.js";

// Check if user owns resource
checkResourceAccess(post, userId, "createdBy");

// Custom forbidden
if (user.role !== "admin") {
  throw new ForbiddenError("Admin access required");
}
```

#### 5. Conflict Errors (409)

```javascript
import { ConflictError } from "../middleware/errorHandler.js";

const existingUser = await UserModel.findOne({ email });
if (existingUser) {
  throw new ConflictError("User with this email already exists");
}
```

## Response Format

All errors now return consistent JSON:

```json
{
  "success": false,
  "message": "Error description",
  "stack": "..." // Only in development
}
```

All success responses:

```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... }
}
```

## Automatic Error Handling

The error handler automatically catches:

### 1. Mongoose Errors

- **CastError**: Invalid ObjectId format → 400 ValidationError
- **ValidationError**: Schema validation failures → 400 ValidationError
- **Duplicate Key (11000)**: Unique constraint violations → 409 ConflictError

### 2. JWT Errors

- **JsonWebTokenError**: Invalid token → 401 UnauthorizedError
- **TokenExpiredError**: Expired token → 401 UnauthorizedError

### 3. Custom Errors

- Any error extending `AppError` gets proper status code
- Unknown errors default to 500 Internal Server Error

## Best Practices

### 1. Always Use asyncHandler

```javascript
// ❌ Don't do this
export const controller = async (req, res) => {
  // Error won't be caught by error handler
};

// ✅ Do this
export const controller = asyncHandler(async (req, res) => {
  // Errors automatically caught
});
```

### 2. Validate Input Early

```javascript
export const createPost = asyncHandler(async (req, res) => {
  // Validate required fields first
  validateRequired(req.body, ["title", "content", "category"]);

  // Then do business logic
  const post = await PostModel.create(req.body);

  res.status(201).json({ success: true, post });
});
```

### 3. Check Resource Existence

```javascript
export const updatePost = asyncHandler(async (req, res) => {
  const post = await checkResourceExists(PostModel, req.params.id);

  // Check if user can modify this post
  checkResourceAccess(post, req.user._id, "createdBy");

  // Update logic here
});
```

### 4. Use Specific Error Types

```javascript
// ❌ Generic error
throw new Error("Something went wrong");

// ✅ Specific error
throw new ValidationError("Email is required");
throw new NotFoundError("Post");
throw new UnauthorizedError("Invalid password");
```

## Frontend Error Handling

Update your frontend API client to handle the new error format:

```javascript
// In your api.js
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    // Error response format: { success: false, message: "..." }
    throw new Error(data.message || "Something went wrong");
  }

  // Success response format: { success: true, data: {...} }
  return data.data || data;
};
```

## Testing Error Handling

### 1. Test Validation Errors

```javascript
// Test missing required fields
const response = await request(app)
  .post("/api/users/register")
  .send({ name: "Test" }); // Missing email, password

expect(response.status).toBe(400);
expect(response.body.success).toBe(false);
expect(response.body.message).toContain("Missing required fields");
```

### 2. Test Not Found Errors

```javascript
// Test non-existent resource
const response = await request(app).get("/api/users/invalid-id");

expect(response.status).toBe(404);
expect(response.body.success).toBe(false);
expect(response.body.message).toBe("User not found");
```

## Monitoring and Logging

The error handler logs all errors with:

- Error message and stack trace
- Request URL and method
- Timestamp

Consider adding:

- Error tracking service (Sentry, Bugsnag)
- Request correlation IDs
- Performance monitoring

## Next Steps

1. **Update remaining controllers** (if any) to use the new error handling
2. **Add input validation** for all endpoints
3. **Update frontend** to handle new error format
4. **Add error monitoring** in production
5. **Write tests** for error scenarios

This error handling system makes your API more robust, user-friendly, and easier to debug!
