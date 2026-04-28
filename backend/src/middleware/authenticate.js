// TODO: install jsonwebtoken — npm install jsonwebtoken
// TODO: read the Bearer token from req.headers.authorization
// TODO: verify the token using process.env.JWT_SECRET
// TODO: on success, attach decoded payload to req.user and call next()
// TODO: on failure (missing/expired/invalid token), respond 401

// Usage: import this middleware and add to any route that requires login
// Example: router.get('/me', authenticate, getMe);