# Reports Module Setup & Testing Guide

## ✅ What's Been Completed

### 1. Reports Module Analysis
- **Backend**: Comprehensive reports service with Excel/CSV export functionality
- **Frontend**: Reports page with filtering, analytics, and export capabilities
- **API Integration**: Proper connection between frontend and backend

### 2. Export Functionality
- **Excel Export**: Professional Excel files with multiple sheets
  - Pick up sheet with package details
  - Delivery report sheet with financial summaries
  - Proper formatting and styling
- **CSV Export**: Simple CSV format for basic data export
- **Frontend Integration**: Export buttons properly connected to API

### 3. Seed Data Creation
- **43 packages** with realistic data across different statuses
- **8 merchants** with varied business types
- **8 drivers** with proper user accounts
- **1 admin user** for testing
- **Realistic distribution** of package statuses and dates

## 🚀 How to Test the Reports

### Step 1: Start the Services
```bash
# Terminal 1 - Start API
cd /home/visal/dyhe/apps/api
pnpm dev

# Terminal 2 - Start Web App
cd /home/visal/dyhe/apps/web
pnpm dev
```

### Step 2: Login and Test
1. **Open**: http://localhost:3000
2. **Login**: 
   - Email: `admin@dyhe.test`
   - Password: `password`
3. **Navigate**: Go to Reports page
4. **Test Features**:
   - View statistics cards
   - Filter by driver/merchant/date range
   - Switch between Driver Reports and Merchant Reports tabs
   - Export to Excel/CSV

### Step 3: Test Export Functionality
1. **Excel Export**: Click "Export Excel" button
   - Downloads professional Excel file with multiple sheets
   - Includes pickup sheet and delivery report
   - Proper formatting and financial summaries
2. **CSV Export**: Available via API endpoint `/reports/export/csv`

## 📊 Test Data Overview

### Package Distribution
- **RECEIVED**: 8 packages (newly received)
- **PREPARING**: 6 packages (being prepared)
- **READY**: 5 packages (ready for pickup)
- **DELIVERING**: 4 packages (out for delivery)
- **DELIVERED**: 15 packages (successfully delivered)
- **CANCELLED**: 3 packages (cancelled orders)
- **RETURNED**: 2 packages (returned to sender)

### Financial Data
- **Total COD Amount**: $3,416.00
- **Average COD**: $79.44
- **Range**: $7.00 - $150.00
- **Driver Assignment**: 35 packages assigned, 8 unassigned

### Merchants
- Pink Please Store
- Tech Hub Cambodia
- Fashion Forward
- Home & Garden
- Electronics Plus
- Beauty Corner
- Sports Zone
- Book World

### Drivers
- Sophea Chan, Sokha Kim, Sophat Ly, Srey Meas
- Sokun Nguon, Sopheap Ouk, Sophat Pich, Srey Rith

## 🔧 API Endpoints

### Reports Endpoints
- `GET /reports` - Get all reports with filtering
- `GET /reports/drivers` - Get driver-specific reports
- `GET /reports/merchants` - Get merchant-specific reports
- `GET /reports/export/excel` - Export to Excel
- `GET /reports/export/csv` - Export to CSV
- `GET /reports/driver-performance` - Driver performance analytics
- `GET /reports/merchant-performance` - Merchant performance analytics

### Query Parameters
- `driverId` - Filter by specific driver
- `merchantId` - Filter by specific merchant
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)
- `search` - Search in package numbers, customer names, etc.
- `type` - Report type (driver, merchant, package)
- `page` - Pagination page number
- `limit` - Items per page

## 🎯 Key Features

### Frontend Features
- **Real-time Statistics**: Total packages, COD amounts, delivery rates
- **Advanced Filtering**: By driver, merchant, date range
- **Tabbed Interface**: Separate views for driver and merchant reports
- **Export Integration**: One-click Excel/CSV export
- **Responsive Design**: Works on desktop and mobile

### Backend Features
- **Comprehensive Analytics**: Package status distribution, financial summaries
- **Professional Excel Export**: Multi-sheet workbooks with proper formatting
- **Performance Metrics**: Driver and merchant performance tracking
- **Flexible Filtering**: Support for complex queries
- **Data Validation**: Proper input validation and error handling

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dyhe.test | password |
| Driver | driver1@dyhe.test | password |
| Driver | driver2@dyhe.test | password |
| Driver | driver3@dyhe.test | password |
| ... | ... | ... |

## 📝 Notes

- All seed data uses realistic Cambodian names and addresses
- Package numbers follow the format: `PKG{timestamp}{random}`
- COD amounts range from $5 to $155
- Delivery fees range from $1 to $5
- Dates are distributed over the last 30 days
- All drivers have corresponding user accounts for login

## 🐛 Troubleshooting

If you encounter issues:
1. **Database Connection**: Ensure PostgreSQL is running
2. **API Server**: Check if port 3001 is available
3. **Web Server**: Check if port 3000 is available
4. **Authentication**: Use the provided test credentials
5. **Export Issues**: Check browser download settings

## 📈 Next Steps

1. **Test the complete workflow** from login to export
2. **Verify Excel file formatting** meets your requirements
3. **Test filtering functionality** with different combinations
4. **Check mobile responsiveness** on different devices
5. **Customize Excel templates** if needed for your specific requirements

The reports module is now fully functional with comprehensive test data ready for evaluation!
