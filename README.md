# UIDAI Verify - Census 2021 Data Analytics Portal

A comprehensive data analytics and verification system designed to validate Aadhaar-related demographic data against official Census 2021 government records. This platform enables administrative authorities to identify discrepancies, verify biometric and demographic enrollments, and analyze data trends across different states and districts in India.

## 🚀 Features

### Interactive Dashboard
- **Real-time Statistics**: Total records, verified records, mismatches, and data not found
- **Age Distribution Breakdown**: Detailed demographic and biometric age group analysis
- **Latest Upload Summary**: Overview of the most recent data processing results

### Advanced Analytics
- **State-wise Distribution**: Verification status comparison across all Indian States and Union Territories
- **Processing Velocity**: Temporal trends showing data processing over time
- **AI Insights**: Automated detection of top-performing regions and data anomalies
- **District Analysis**: Performance metrics at the district level

### Secure Data Handling
- **Multi-format Support**: Seamless processing of CSV and Excel (.xlsx) files
- **File Upload Limits**: Up to 30MB file size support
- **Pagination & Search**: Efficient browsing through large datasets
- **Data Integrity**: Robust validation against Census 2021 benchmarks

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Recharts** for data visualizations
- **React Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** for data persistence
- **Multer** for file uploads
- **PapaParse** for CSV processing
- **XLSX** for Excel file handling

### Development Tools
- **tsx** for TypeScript execution
- **Drizzle Kit** for database migrations
- **Vite plugins** for development enhancements

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Assassin859/UIDAIverification.git
   cd UIDAIverification
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Create a PostgreSQL database
   - Update database connection in `drizzle.config.ts` if needed
   - Run database migrations:
     ```bash
     npm run db:push
     ```

4. **Environment variables**
   - Set `NODE_ENV=development` for development
   - Set `PORT=5000` (default) or your preferred port

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
This starts the development server with hot reloading. The application will be available at `http://localhost:5000`.

### Production Build
```bash
npm run build
npm start
```
This builds the application and starts the production server.

## 📖 Usage

### 1. Upload Data
- Navigate to the Upload page
- Select a CSV or Excel file containing demographic data
- The system supports three file types:
  - **Enrollment Data**: Contains age groups like `age_0_5`, `age_5_17`, `age_18_greater`
  - **Biometric Data**: Contains `bio_age_5_17`, `bio_age_17_`
  - **Demographic Data**: Contains `demo_age_5_17`, `demo_age_17_`

### 2. View Dashboard
- Access the main dashboard for an overview of verification statistics
- See total records processed, verification rates, and recent activity

### 3. Browse Records
- View detailed records from uploaded files
- Filter by verification status (Verified, Mismatch, Not Found)
- Paginated view for large datasets

### 4. Analyze Data
- Explore state-wise and district-wise performance
- View temporal trends and processing velocity
- Access AI-generated insights and anomaly detection

## 🔌 API Endpoints

### Upload Management
- `POST /api/upload` - Upload and process a file
- `GET /api/uploads` - List all uploads
- `GET /api/uploads/:id` - Get specific upload details
- `GET /api/uploads/:id/records` - Get records for an upload (paginated)

### Analytics
- `GET /api/analytics/stats` - Get verification statistics
- `GET /api/analytics/charts` - Get chart data (state distribution, district analysis, age distribution, temporal trends)
- `GET /api/analytics/insights` - Get AI-generated insights

## 📊 Data Verification Process

1. **File Parsing**: Automatically detects file type and parses CSV/Excel data
2. **Column Detection**: Identifies data type based on column names
3. **Census Validation**: Cross-references each record against Census 2021 database
4. **Status Assignment**:
   - **Verified**: Record matches Census 2021 data
   - **Mismatch**: Record exists but data conflicts
   - **Not Found**: Record missing from Census database
5. **Analytics Generation**: Processes data for charts and insights

## 🗂️ Project Structure

```
UIDAIverification/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Backend Express server
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   ├── schema.ts           # Database schema definitions
│   └── routes.ts           # API route specifications
├── script/                 # Build scripts
└── attached_assets/        # Documentation assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please open an issue on the GitHub repository.

---

*Built with ❤️ for India's digital infrastructure verification needs. As of January 2026.*
