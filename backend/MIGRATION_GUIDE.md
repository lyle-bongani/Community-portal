# User Migration Guide

This guide explains how to migrate users from your localhost backend to the Render production server.

## Step 1: Export Users from Localhost

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the export script:
   ```bash
   npm run export-users
   ```

   This will create a file at `backend/data/users-export.json` containing all your users with their password hashes.

## Step 2: Import Users to Render Server

You have two options:

### Option A: Using cURL (Command Line)

1. Copy the contents of `backend/data/users-export.json`
2. Get your admin JWT token by logging in to the Render server:
   ```bash
   curl -X POST https://community-portal-9uek.onrender.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@gmail.com", "password": "admin123"}'
   ```

3. Copy the `token` from the response, then import users:
   ```bash
   curl -X POST https://community-portal-9uek.onrender.com/api/v1/admin/users/import \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d @data/users-export.json
   ```

   Or if you want to send the data directly:
   ```bash
   curl -X POST https://community-portal-9uek.onrender.com/api/v1/admin/users/import \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"users": [PASTE_USERS_ARRAY_HERE]}'
   ```

### Option B: Using a REST Client (Postman, Insomnia, etc.)

1. **Login to get token:**
   - Method: `POST`
   - URL: `https://community-portal-9uek.onrender.com/api/v1/auth/login`
   - Headers: `Content-Type: application/json`
   - Body:
     ```json
     {
       "email": "admin@gmail.com",
       "password": "admin123"
     }
     ```
   - Copy the `token` from the response

2. **Import users:**
   - Method: `POST`
   - URL: `https://community-portal-9uek.onrender.com/api/v1/admin/users/import`
   - Headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer YOUR_TOKEN_HERE`
   - Body:
     ```json
     {
       "users": [PASTE_USERS_ARRAY_FROM_EXPORT_FILE]
     }
     ```

## Important Notes

- **Password hashes are preserved**: Users will be able to log in with their original passwords
- **Admin users are skipped**: The designated admin accounts (`lylechadya72@gmail.com` and `admin@gmail.com`) are managed by the system and won't be imported
- **Existing users are updated**: If a user with the same email already exists, their data will be updated (except password if not provided)
- **New users are created**: Users that don't exist will be added with new IDs

## Response Format

The import endpoint returns:
```json
{
  "success": true,
  "message": "Users imported successfully",
  "data": {
    "imported": 5,    // New users created
    "updated": 2,     // Existing users updated
    "skipped": 1,     // Users skipped (admins or invalid)
    "total": 7        // Total users in database
  }
}
```

## Troubleshooting

- **"Unauthorized"**: Make sure you're using a valid admin token
- **"Users must be an array"**: Ensure the request body has `{"users": [...]}` format
- **Users can't log in**: Verify that password hashes start with `$2a$` (bcrypt format)
