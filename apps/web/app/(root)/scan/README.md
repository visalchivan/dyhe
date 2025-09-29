# Package Scanner Feature

## Overview

This feature allows users to scan packages in bulk and assign them to drivers. It's designed for scenarios where drivers come to pickup locations and need to scan multiple packages at once.

## Features

### 1. Package Scanning

- **Camera Scanner**: Use device camera to scan QR codes on packages
- **Manual Entry**: Enter package numbers manually if QR codes are not readable
- **Duplicate Prevention**: Automatically prevents scanning the same package twice

### 2. Bulk Assignment

- **Driver Selection**: Choose which driver to assign scanned packages to
- **Bulk Assignment**: Assign all scanned packages to a driver at once
- **Status Update**: Automatically updates package status to "READY"

### 3. Real-time Management

- **Live Package List**: See all scanned packages in real-time
- **Remove Packages**: Remove packages from the list before assignment
- **Assignment Summary**: View total packages and assignment status

## Usage Flow

1. **Navigate to Scan Page**: Go to `/scan` in the application
2. **Start Scanning**: Use camera scanner or manual entry to scan packages
3. **Select Driver**: Choose which driver to assign packages to
4. **Assign Packages**: Click "Assign to Driver" to complete the assignment
5. **Confirmation**: Receive confirmation of successful assignment

## API Endpoints

### POST `/packages/bulk-assign`

Assigns multiple packages to a driver in bulk.

**Request Body:**

```json
{
  "driverId": "driver-uuid",
  "packageNumbers": ["DYHE123456ABC", "DYHE789012DEF"],
  "status": "READY"
}
```

**Response:**

```json
{
  "message": "Successfully assigned 2 packages to driver",
  "packages": [...],
  "count": 2
}
```

## Components

- `PackageScanForm`: Handles package scanning (camera + manual entry)
- `ScannedPackagesList`: Displays scanned packages and driver selection
- `ScanPackagePage`: Main page that orchestrates the scanning workflow

## Future Enhancements

- Real QR code scanning with camera integration
- Package validation against database
- Batch operations (assign to multiple drivers)
- Scan history and reporting
- Offline scanning capability
