# UIDAI Data Verification Dashboard

## Overview

This is a full-stack web application for UIDAI (Unique Identification Authority of India) data verification and analytics. Users can upload Excel/CSV files containing Aadhaar-related demographic data, which gets cross-checked against government datasets. The application displays verification results through an interactive dashboard with charts and data tables.

The core functionality includes:
- File upload for CSV/Excel files with Aadhaar demographic data
- Data verification against simulated government datasets (biometric, enrollment, demographic)
- Interactive dashboard with statistics and visualizations
- Paginated data records table with filtering and search
- Analytics charts showing regional distribution, age breakdowns, and trends

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Charts**: Recharts for data visualization (bar charts, pie charts, line charts)
- **Tables**: TanStack React Table for complex data tables with pagination
- **File Upload**: react-dropzone for drag-and-drop file handling

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with tsx for development
- **File Processing**: Multer for file uploads, xlsx and papaparse for parsing Excel/CSV files
- **API Design**: RESTful endpoints defined in shared routes file with Zod validation

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Two main tables - `uploads` (file metadata and verification stats) and `records` (individual data rows with verification status)
- **Migrations**: Drizzle Kit for database schema management

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including shadcn/ui
    hooks/        # Custom React hooks for data fetching
    pages/        # Route pages (Dashboard, Upload, Records, Analytics)
    lib/          # Utilities and query client setup
server/           # Express backend
  routes.ts       # API endpoints
  storage.ts      # Database operations
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
  routes.ts       # API route definitions with Zod schemas
```

### Build System
- **Development**: Vite for frontend hot module replacement
- **Production**: Custom build script using esbuild for server and Vite for client
- **Output**: Combined into `dist/` folder with server bundle and static assets

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage for Express (available but sessions not currently implemented)

### Key NPM Packages
- **drizzle-orm / drizzle-kit**: Database ORM and migration tooling
- **xlsx**: Excel file parsing for .xlsx and .xls formats
- **papaparse**: CSV file parsing
- **multer**: Multipart form data handling for file uploads
- **zod**: Runtime type validation for API requests/responses

### UI Component Libraries
- **@radix-ui/***: Headless UI primitives for accessible components
- **recharts**: React charting library for data visualization
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Tailwind class merging utility

### Development Tools
- **@replit/vite-plugin-***: Replit-specific development plugins for error overlay and dev banner