# FHIR Pediatric Care Platform API Documentation

## Overview

This API provides FHIR R4-compliant endpoints for managing pediatric healthcare data, including patients, observations, and appointments. The system is designed specifically for children with complex medical needs and implements healthcare industry best practices.

## Base URL

- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

## Authentication

Currently using API key authentication (to be implemented in production):

```http
Authorization: Bearer YOUR_API_KEY
```

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "error": {
    "message": "Error description",
    "statusCode": 400
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/patients"
}
```

## Health Endpoints

### GET /health

Check service health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "memory": {
      "used": "256MB",
      "total": "512MB",
      "percentage": 50
    }
  }
}
```

### GET /health/ready

Readiness probe for Kubernetes/ECS.

### GET /health/live

Liveness probe for Kubernetes/ECS.

## Patient Management

### POST /patients

Create a new patient.

**Request Body:**
```json
{
  "firstName": "Emma",
  "lastName": "Johnson",
  "dateOfBirth": "2018-05-15",
  "gender": "female",
  "email": "parent@example.com",
  "phone": "+1-555-0123",
  "address": {
    "line1": "123 Pediatric Lane",
    "line2": "Apt 4B",
    "city": "Healthcare City",
    "state": "CA",
    "postalCode": "90210",
    "country": "US"
  },
  "emergencyContact": {
    "name": "Sarah Johnson",
    "relationship": "Mother",
    "phone": "+1-555-0123"
  },
  "careComplexity": "moderate",
  "medicalRecordNumber": "MRN-001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "firstName": "Emma",
    "lastName": "Johnson",
    "dateOfBirth": "2018-05-15",
    "age": 5,
    "gender": "female",
    "email": "parent@example.com",
    "phone": "+1-555-0123",
    "address": {
      "line1": "123 Pediatric Lane",
      "line2": "Apt 4B",
      "city": "Healthcare City",
      "state": "CA",
      "postalCode": "90210",
      "country": "US"
    },
    "emergencyContact": {
      "name": "Sarah Johnson",
      "relationship": "Mother",
      "phone": "+1-555-0123"
    },
    "careComplexity": "moderate",
    "medicalRecordNumber": "MRN-001",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Patient created successfully"
}
```

### GET /patients

List all patients with pagination and search.

**Query Parameters:**
- `limit` (number): Maximum number of results (default: 50, max: 100)
- `offset` (number): Number of results to skip (default: 0)
- `search` (string): Search by name or medical record number

**Response:**
```json
{
  "success": true,
  "data": {
    "patients": [...],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### GET /patients/:id

Get patient details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "firstName": "Emma",
    "lastName": "Johnson",
    ...
  }
}
```

### PUT /patients/:id

Update patient information.

**Request Body:** (partial update supported)
```json
{
  "firstName": "Emily",
  "careComplexity": "high"
}
```

### DELETE /patients/:id

Delete a patient.

**Response:** `204 No Content`

### GET /patients/:id/fhir

Get raw FHIR Patient resource.

**Response:** Raw FHIR R4 Patient resource

## Observations & Vital Signs

### POST /observations

Create a new observation.

**Request Body:**
```json
{
  "patientId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "vital-signs",
  "code": "8867-4",
  "display": "Heart rate",
  "value": 120,
  "unit": "/min",
  "status": "final",
  "effectiveDateTime": "2024-01-01T10:00:00.000Z",
  "performerId": "practitioner-123",
  "notes": "Patient was calm during measurement",
  "interpretation": "normal"
}
```

**Vital Signs Codes:**
- `8867-4`: Heart rate (/min)
- `9279-1`: Respiratory rate (/min)
- `8310-5`: Body temperature (Cel)
- `8480-6`: Systolic blood pressure (mm[Hg])
- `8462-4`: Diastolic blood pressure (mm[Hg])
- `2708-6`: Oxygen saturation (%)
- `29463-7`: Body weight (kg)
- `8302-2`: Body height (cm)
- `9843-4`: Head circumference (cm)

### GET /observations/:id

Get observation by ID.

### PUT /observations/:id

Update observation.

### DELETE /observations/:id

Delete observation.

### GET /observations/patient/:patientId

Get all observations for a patient.

**Query Parameters:**
- `type` (string): Filter by observation type (vital-signs, laboratory, assessment, care-plan)

### GET /observations/patient/:patientId/vital-signs

Get vital signs for a patient.

### GET /observations/patient/:patientId/vital-signs/latest

Get latest vital signs by code for a patient.

**Response:**
```json
{
  "success": true,
  "data": {
    "latestVitalSigns": {
      "8867-4": {
        "id": "obs-123",
        "code": "8867-4",
        "display": "Heart rate",
        "value": 120,
        "unit": "/min",
        "effectiveDateTime": "2024-01-01T10:00:00.000Z",
        "interpretation": "normal"
      }
    },
    "patientId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

## Appointment Management

### POST /appointments

Create a new appointment.

**Request Body:**
```json
{
  "patientId": "123e4567-e89b-12d3-a456-426614174000",
  "providerId": "provider-123",
  "appointmentType": "routine-checkup",
  "specialty": "pediatrics",
  "startDateTime": "2024-01-15T10:00:00.000Z",
  "endDateTime": "2024-01-15T10:30:00.000Z",
  "priority": "routine",
  "description": "6-month wellness check",
  "reasonForVisit": "Routine pediatric checkup",
  "location": "Clinic Room 3",
  "telehealth": false,
  "notes": "Patient prefers morning appointments"
}
```

**Appointment Types:**
- `routine-checkup`: Routine Pediatric Checkup (30 min)
- `follow-up`: Follow-up Visit (20 min)
- `emergency`: Emergency Visit (60 min)
- `consultation`: Specialist Consultation (45 min)
- `therapy`: Therapy Session (60 min)
- `vaccination`: Vaccination Appointment (15 min)

**Specialties:**
- `pediatrics`: General Pediatrics
- `pediatric-cardiology`: Pediatric Cardiology
- `pediatric-neurology`: Pediatric Neurology
- `pediatric-pulmonology`: Pediatric Pulmonology
- `child-psychiatry`: Child and Adolescent Psychiatry
- `pediatric-pt`: Pediatric Physical Therapy

### GET /appointments/:id

Get appointment by ID.

### PUT /appointments/:id

Update appointment.

### DELETE /appointments/:id

Delete appointment.

### POST /appointments/:id/cancel

Cancel an appointment.

**Request Body:**
```json
{
  "reason": "Patient illness"
}
```

### POST /appointments/:id/check-in

Check in a patient for their appointment.

### POST /appointments/:id/complete

Mark an appointment as completed.

**Request Body:**
```json
{
  "notes": "Patient responded well to treatment"
}
```

### GET /appointments/patient/:patientId

Get appointments for a patient.

**Query Parameters:**
- `status` (string): Filter by status (proposed, pending, booked, arrived, fulfilled, cancelled, noshow, checked-in)

### GET /appointments/upcoming

Get upcoming appointments.

**Query Parameters:**
- `patientId` (string): Filter by patient ID

### GET /appointments/date-range

Get appointments within a date range.

**Query Parameters:**
- `startDate` (ISO date): Start date (required)
- `endDate` (ISO date): End date (required)
- `patientId` (string): Filter by patient ID (optional)

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 409 | Conflict - Resource already exists |
| 413 | Payload Too Large - Request size exceeds limit |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 502 | Bad Gateway - Upstream service error |
| 503 | Service Unavailable - Service temporarily down |

## Security Headers

All responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: no-referrer`
- `Cache-Control: no-store, no-cache, must-revalidate, private`
- `Strict-Transport-Security` (production only)

## Compliance

This API implements healthcare industry best practices:
- **FHIR R4 Compliance**: All resources follow FHIR standards
- **HIPAA Ready**: Security patterns for protected health information
- **Audit Logging**: Comprehensive audit trails for all operations
- **Data Minimization**: Limited data exposure in responses
- **Secure Headers**: Security headers for web application security

## SDKs and Libraries

### JavaScript/TypeScript
```javascript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.example.com/api/v1',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Create patient
const patient = await client.post('/patients', patientData);

// Get vital signs
const vitalSigns = await client.get(`/observations/patient/${patientId}/vital-signs`);
```

### curl Examples
```bash
# Health check
curl -X GET https://api.example.com/api/v1/health

# Create patient
curl -X POST https://api.example.com/api/v1/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"firstName":"Emma","lastName":"Johnson",...}'

# Get upcoming appointments
curl -X GET "https://api.example.com/api/v1/appointments/upcoming?patientId=123" \
  -H "Authorization: Bearer YOUR_API_KEY"
```