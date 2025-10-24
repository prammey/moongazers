# Moongazers - Stargazing Forecast App

## Architecture Overview
**Next.js 15 App Router** with Prisma + PostgreSQL (Neon). Two-part system: (1) **Public stargazing forecast** with astronomical calculations, (2) **Admin CMS** at `/admin` for managing landing page and documentation.

Core forecast flow: ZIP → Geocode → Weather/astronomy data → Score viewing windows → Return top 3 recommendations.

## Application Structure

### Public App (`src/app/page.tsx`)
- **Landing page first**: Shows `LandingPage` component with launch button (fetches from `/api/landing-page`)
- **Main app**: ZIP input, toggles (°F/°C, 12hr/24hr), results display with `InlineResults`
- **WeatherContext** (`src/contexts/WeatherContext.tsx`): localStorage-persisted user preferences (defaults to Fahrenheit)
- **Admin shortcut**: `Ctrl+Shift+A` redirects to `/admin` (via `useRouter`)

### Admin Dashboard (`/admin`, `src/app/admin/page.tsx`)
- **Authentication**: Database-driven via `/api/admin/auth` (Prisma `User` model)
  - Login returns `ADMIN_SECRET` token (stored in client state)
  - All admin API calls validate token against `process.env.ADMIN_SECRET`
- **Landing Page Editor**: WYSIWYG with Cloudinary image uploads (`/api/admin/landing-page`)
- **Documentation Editor**: Markdown editor (`@uiw/react-md-editor`) for public docs (`/api/admin/documentation`)
- **Dynamic imports**: MDEditor uses `dynamic(() => import(...), { ssr: false })` to avoid SSR issues

### Database Layer (Prisma + Neon PostgreSQL)
**Schema models** (`prisma/schema.prisma`):
- `User`: Admin authentication (username/password, supports both plain text and bcrypt hashed)
- `LandingPage`: Landing page content (title, description, imageUrl, buttonText, optional footerText)
- `Documentation`: Markdown documentation (title, content)
- `Research`, `NewsSource`, `NewsItem`, `About`, `SocialLink`: Content models (future features)

**Admin creation**: Direct SQL via Neon dashboard (no programmatic scripts):
```sql
INSERT INTO users (id, username, password, name)
VALUES ('unique-id', 'your-username', 'your-password', 'Your Name');
```

## API Routes

### Public APIs
- **`/api/best-windows`**: Main forecast API
  - Pipeline: Geocoding → Weather → Sky data → Time window scoring
  - Caching: `unstable_cache` (Geocoding 30d, Weather 6h, Sky 12h)
  - Failover: Astrospheric → Open-Meteo + Astronomy Engine
- **`/api/landing-page`**: GET landing page data (public, no auth)

### Admin APIs (all require `ADMIN_SECRET` token)
- **`/api/admin/auth`**: POST login (returns token if credentials valid)
- **`/api/admin/landing-page`**: GET/PUT landing page content
- **`/api/admin/documentation`**: GET/PUT documentation content

## Development Patterns

### Styling
- **Tailwind CSS 4**: Minimal white theme (#ffffff), Helvetica Neue font
- **Icons**: Unicode symbols (⚠, ✕, ☽, ✦) instead of emojis
- **Shadows**: `textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'` for headings

### TypeScript
- **Strict typing** via `src/types/index.ts`
- **Type guards**: `hasHourlyData`, `hasNestedData` for API validation
- **Moon illumination clamping**: `Math.max(0, Math.min(100, value))`

### Error Handling
```typescript
// ZIP code validation
if (errorMessage.includes('location not found') || errorMessage.includes('zip')) {
  setError('Please check the provided ZIP code. Valid US ZIP code (e.g., 10001).');
}
```

## Critical Workflows

### Development
```bash
npm run dev          # Turbopack development server
npm run build        # Production build (Turbopack)
npx prisma studio    # Database GUI
npx prisma migrate dev  # Run migrations locally
```

### Deployment (Vercel)
1. **Database setup**: Run `npx prisma migrate deploy` in Neon to create tables
2. **Create admin user**: SQL insert in Neon dashboard (see schema above)
3. **Environment variables** (set in Vercel):
   - `DATABASE_URL` (Neon pooled connection)
   - `ADMIN_SECRET` (auth token, e.g., `moongazers-admin-secret-2024`)
   - `CLOUDINARY_*` (image uploads)
   - `ASTROSPHERIC_KEY`, `TIMEZONEDB_KEY` (forecast APIs)
4. **Build command**: `npx prisma migrate deploy && npm run build`

### Admin User Management
**NO programmatic scripts** (all deprecated). Use Neon SQL editor:
```sql
-- Check users
SELECT * FROM users;

-- Create admin
INSERT INTO users (id, username, password, name)
VALUES ('admin-id', 'admin', 'password123', 'Admin Name');

-- Delete admin
DELETE FROM users WHERE username = 'admin';
```

## Key Files
- `src/app/api/best-windows/route.ts`: Forecast pipeline with caching/fallbacks
- `src/app/admin/page.tsx`: Admin dashboard route
- `src/components/AdminDashboard.tsx`: Admin UI with markdown editor (674 lines)
- `src/components/LandingPage.tsx`: Landing page with default data + API fetch
- `prisma/schema.prisma`: Database schema (all models)
- `data/bright_stars.csv`: Star catalog for visibility calculations

## External APIs
- **Astrospheric**: Primary weather + sky data (requires key)
- **Open-Meteo**: Free weather fallback
- **Cloudinary**: Image uploads (cloud_name, api_key, api_secret)
- **US Census**: ZIP geocoding (US only, no auth)
- **TimeZoneDB**: Timezone lookup (requires key)
- **Astronomy Engine**: Client-side celestial calculations

## Security Notes
- **No hardcoded credentials**: All removed from codebase
- **Token-based admin auth**: `ADMIN_SECRET` env var validates all admin API calls
- **Password flexibility**: Database supports both plain text and bcrypt (for migration)
