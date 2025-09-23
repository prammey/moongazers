# MoonGazers Admin Panel

This document explains how to use the admin panel to manage the landing page content for the MoonGazers application.

## Features

- **Dynamic Landing Page Management**: Update title, description, button text, and preview image
- **Cloudinary Integration**: Upload and manage images with automatic optimization
- **Database Storage**: All content is stored in PostgreSQL database using Prisma
- **Admin Authentication**: Secure login with username/password
- **Multiple Landing Pages**: Create and manage multiple versions (only one active at a time)

## Accessing the Admin Panel

### Method 1: Keyboard Shortcut
1. On the main landing page, press `Ctrl + Shift + A`
2. This will open the admin login screen

### Method 2: Direct URL (if implemented)
Navigate to `/admin` (requires additional route setup)

## Admin Credentials

**Default Admin User:**
- Username: `admin`
- Password: `admin123`

> **Important**: Change these credentials in production!

## Using the Admin Panel

### 1. Login
1. Enter your admin username and password
2. Click "Login" to authenticate

### 2. Managing Landing Pages

#### Creating a New Landing Page
1. Click "Create New Landing Page"
2. Fill in the form:
   - **Title**: Main heading text
   - **Description**: Paragraph text below the title
   - **Button Text**: Text displayed on the launch button
   - **Image**: Upload a new preview image (optional)
   - **Image Alt Text**: Accessibility description for the image

3. Click "Create" to save

#### Editing an Existing Landing Page
1. Find the landing page in the list
2. Click "Edit" next to the page you want to modify
3. Update the fields as needed
4. Click "Update" to save changes

#### Deleting a Landing Page
1. Click "Delete" next to the page you want to remove
2. Confirm the deletion in the popup

### 3. Image Management

- **Supported Formats**: JPG, PNG, GIF, WebP, SVG
- **Automatic Optimization**: Images are automatically optimized by Cloudinary
- **Maximum Dimensions**: 1200x900 pixels (larger images are resized)
- **Storage**: Images are stored in Cloudinary under the `moongazers/landing` folder

## Technical Details

### Database Schema

The landing page content is stored in the `landing_pages` table with the following fields:

```sql
- id: Unique identifier
- title: Page title
- description: Page description
- imageUrl: Cloudinary URL or local path
- imageAlt: Image alt text
- buttonText: Launch button text
- isActive: Boolean (only one page can be active)
- createdAt: Creation timestamp
- updatedAt: Last update timestamp
```

### API Endpoints

- `GET /api/landing-page` - Get active landing page content
- `GET /api/admin/landing-page` - Get all landing pages (admin only)
- `POST /api/admin/landing-page` - Create new landing page (admin only)
- `PUT /api/admin/landing-page` - Update landing page (admin only)
- `DELETE /api/admin/landing-page` - Delete landing page (admin only)
- `POST /api/admin/auth` - Admin authentication

### Environment Variables

Required environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_SECRET=your_admin_secret_key
```

## Security Notes

1. **Admin Authentication**: Uses bcrypt for password hashing
2. **API Security**: All admin endpoints require authentication
3. **Image Validation**: Only image files are accepted for upload
4. **Environment Variables**: Sensitive data is stored in environment variables

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Create admin user
npx tsx scripts/create-admin.ts

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## Troubleshooting

### Admin Panel Not Loading
- Check that the keyboard shortcut `Ctrl + Shift + A` is working
- Verify the admin user exists in the database
- Check browser console for JavaScript errors

### Image Upload Issues
- Verify Cloudinary credentials in `.env` file
- Check file size (should be reasonable for web use)
- Ensure file is a valid image format

### Database Connection Issues
- Verify `DATABASE_URL` in `.env` file
- Check that the database is running and accessible
- Run `npx prisma db push` to ensure schema is up to date

### Authentication Problems
- Verify admin credentials
- Check that the `ADMIN_SECRET` environment variable is set
- Clear browser cache and cookies

## Production Deployment

1. **Change Default Credentials**: Update admin username/password
2. **Secure Environment Variables**: Use secure random values
3. **Database Migrations**: Use `prisma migrate` instead of `db push`
4. **Image Optimization**: Configure Cloudinary settings for production
5. **Rate Limiting**: Implement rate limiting on admin endpoints

## Support

For technical support or questions about the admin panel, please refer to the main project documentation or contact the development team.