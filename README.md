# FHIR Pediatric Care Platform Demo

A modern, scalable healthcare platform built with Node.js/TypeScript, implementing FHIR R4 standards for pediatric care management. This demo showcases enterprise-grade healthcare software development best practices and modern FHIR implementation patterns.

## 🏥 Features

### Core Healthcare Functionality
- **FHIR R4 Compliance**: Full implementation of FHIR resources for Patient, Observation, and Appointment
- **Pediatric-Focused**: Specialized data models and workflows for children with complex medical needs
- **Care Complexity Tracking**: Built-in support for care complexity levels (low, moderate, high, critical)
- **Vital Signs Management**: Age-appropriate reference ranges for pediatric patients
- **Appointment Scheduling**: Comprehensive appointment management with telehealth support

### Technical Excellence
- **TypeScript**: Full type safety across the entire codebase
- **Scalable Architecture**: Microservices-ready design with clean separation of concerns
- **AWS Native**: Designed for AWS cloud deployment with Terraform IaC
- **Production Ready**: Comprehensive logging, monitoring, and error handling
- **Security First**: HIPAA-compliant design patterns and security best practices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- AWS CLI (for deployment)
- Terraform (for infrastructure)

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd fhir-demo-node
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **With Docker Compose**
   ```bash
   docker-compose up -d
   ```

The API will be available at `http://localhost:3000/api/v1`

## 📊 API Endpoints

### Health & Status
- `GET /api/v1/health` - Service health check
- `GET /api/v1/health/ready` - Readiness probe
- `GET /api/v1/health/live` - Liveness probe

### Patient Management
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients` - List patients (with pagination and search)
- `GET /api/v1/patients/:id` - Get patient details
- `PUT /api/v1/patients/:id` - Update patient
- `DELETE /api/v1/patients/:id` - Delete patient
- `GET /api/v1/patients/:id/fhir` - Get raw FHIR Patient resource

### Observations & Vital Signs
- `POST /api/v1/observations` - Create observation
- `GET /api/v1/observations/:id` - Get observation
- `PUT /api/v1/observations/:id` - Update observation
- `GET /api/v1/observations/patient/:patientId` - Get patient observations
- `GET /api/v1/observations/patient/:patientId/vital-signs` - Get vital signs
- `GET /api/v1/observations/patient/:patientId/vital-signs/latest` - Latest vital signs

### Appointment Management
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments/:id` - Get appointment
- `PUT /api/v1/appointments/:id` - Update appointment
- `POST /api/v1/appointments/:id/cancel` - Cancel appointment
- `POST /api/v1/appointments/:id/check-in` - Check-in patient
- `POST /api/v1/appointments/:id/complete` - Complete appointment
- `GET /api/v1/appointments/patient/:patientId` - Patient appointments
- `GET /api/v1/appointments/upcoming` - Upcoming appointments

## 🏗️ Architecture

### Johns Hopkins Health Informatics Stack Mapping

This platform is architected according to the Johns Hopkins Health Informatics Stack framework, demonstrating enterprise-grade healthcare system design:

#### **Layer 7: User Interface & Experience**
- **Frontend (Planned)**: React-based clinical dashboards and patient portals
- **API Documentation**: Comprehensive API docs for developer experience
- **Health Endpoints**: Real-time system monitoring and status interfaces

#### **Layer 6: Applications & Workflows**
- **Clinical Applications**: 
  - Patient management system with pediatric specialization
  - Appointment scheduling with telehealth support
  - Vital signs tracking with age-appropriate ranges
- **Care Coordination**: Emergency contact management and care team workflows
- **Workflow Engine**: Appointment state management (booked → checked-in → fulfilled)

#### **Layer 5: Analytics & Decision Support**
- **Clinical Decision Support**: 
  - Pediatric vital signs reference ranges with automated interpretation
  - Care complexity scoring (low/moderate/high/critical)
  - Age-based health metrics analysis
- **Population Health**: Patient cohort management and search capabilities
- **Quality Metrics**: Comprehensive audit logging for quality improvement

#### **Layer 4: Integration & Interoperability**
- **FHIR R4 Implementation**: Full compliance with HL7 FHIR standards
  - Patient resources with US Core profiles
  - Observation resources with LOINC coding
  - Appointment resources with SNOMED specialty codes
- **API Gateway**: RESTful APIs with standardized response formats
- **External Integration Ready**: Designed for integration with existing EHR systems

#### **Layer 3: Data Management & Governance**
- **Data Storage**: 
  - DynamoDB with optimized healthcare data models
  - Global Secondary Indexes for efficient patient queries
  - FHIR-compliant resource storage
- **Data Governance**: 
  - HIPAA-ready security patterns
  - Data minimization for privacy protection
  - Comprehensive audit trails with correlation IDs
- **Master Data Management**: Unified patient identity with medical record numbers

#### **Layer 2: Infrastructure & Platform Services**
- **Cloud Infrastructure**: 
  - AWS ECS Fargate for serverless container orchestration
  - Application Load Balancer with health checks
  - Auto-scaling based on clinical demand
- **Security Services**: 
  - API rate limiting and request validation
  - Security headers and CORS policies
  - Input sanitization and error handling
- **Monitoring & Observability**: 
  - CloudWatch metrics and alarms
  - Structured logging with healthcare-specific correlation

#### **Layer 1: Network & Connectivity**
- **Network Security**: 
  - VPC with public/private subnet architecture
  - Security groups with least-privilege access
  - HTTPS-ready with security best practices
- **Connectivity**: 
  - Internet Gateway for public access
  - Private networking for secure database access
  - Load balancer for high availability

### Technology Stack
- **Backend**: Node.js 18+, TypeScript, Express.js
- **Validation**: Joi for request validation with healthcare-specific rules
- **Logging**: Winston with structured logging and audit trails
- **Security**: Helmet, CORS, rate limiting, HIPAA compliance patterns
- **Infrastructure**: AWS (ECS Fargate, DynamoDB, ALB, CloudWatch)
- **IaC**: Terraform for complete infrastructure management
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Standards**: FHIR R4, LOINC, SNOMED CT, US Core profiles

### FHIR Implementation
- **FHIR Version**: R4 (4.0.1)
- **Resources**: Patient, Observation, Appointment
- **Extensions**: Custom pediatric care complexity extensions
- **Profiles**: US Core Patient profiles where applicable
- **Standards**: LOINC codes for observations, SNOMED for specialties

### AWS Architecture
#### **AWS Infrastructure Architecture**

```mermaid
graph TB
    subgraph "Internet & CDN"
        INTERNET[Internet Traffic]
        ROUTE53[Route 53 DNS]
    end
    
    subgraph "Load Balancing & Security"
        ALB[Application Load Balancer]
        WAF[Web Application Firewall]
        CERT[SSL/TLS Certificates]
    end
    
    subgraph "VPC: Healthcare Network"
        subgraph "Public Subnets (Multi-AZ)"
            ALB_PUB[ALB Endpoints]
            NAT[NAT Gateway]
        end
        
        subgraph "Private Subnets (Multi-AZ)"
            ECS["ECS Fargate Tasks<br/>FHIR API Containers"]
            LAMBDA["Lambda Functions<br/>Clinical Processing"]
        end
    end
    
    subgraph "Data Layer"
        DYNAMO["DynamoDB Tables<br/>- Patients<br/>- Observations<br/>- Appointments"]
        S3["S3 Buckets<br/>Clinical Documents"]
        RDS["RDS Future<br/>Relational Clinical Data"]
    end
    
    subgraph "Monitoring & Security"
        CLOUDWATCH["CloudWatch<br/>Metrics & Logs"]
        SECRETS["Secrets Manager<br/>API Keys & Certificates"]
        IAM["IAM Roles<br/>Least Privilege Access"]
    end
    
    subgraph "Development & Deployment"
        ECR["ECR Container Registry"]
        CODEBUILD["CodeBuild<br/>CI/CD Pipeline"]
        TERRAFORM["Terraform State<br/>Infrastructure as Code"]
    end

    %% Traffic Flow
    INTERNET --> ROUTE53
    ROUTE53 --> ALB
    ALB --> WAF
    WAF --> ALB_PUB
    ALB_PUB --> ECS
    ECS --> DYNAMO
    ECS --> S3
    ECS --> CLOUDWATCH
    
    %% Security & Access
    ECS --> SECRETS
    ECS --> IAM
    LAMBDA --> DYNAMO
    
    %% Deployment Flow
    CODEBUILD --> ECR
    ECR --> ECS
    TERRAFORM --> ECS
    
    %% Monitoring
    ALB --> CLOUDWATCH
    DYNAMO --> CLOUDWATCH
    
    %% Styling
    classDef internet fill:#1565C0,stroke:#0D47A1,stroke-width:2px,color:#FFFFFF
    classDef security fill:#D32F2F,stroke:#B71C1C,stroke-width:2px,color:#FFFFFF
    classDef compute fill:#388E3C,stroke:#1B5E20,stroke-width:2px,color:#FFFFFF
    classDef data fill:#F57C00,stroke:#E65100,stroke-width:2px,color:#FFFFFF
    classDef monitor fill:#7B1FA2,stroke:#4A148C,stroke-width:2px,color:#FFFFFF
    classDef deploy fill:#455A64,stroke:#263238,stroke-width:2px,color:#FFFFFF

    class INTERNET,ROUTE53 internet
    class ALB,WAF,CERT,IAM,SECRETS security
    class ECS,LAMBDA compute
    class DYNAMO,S3,RDS data
    class CLOUDWATCH monitor
    class ECR,CODEBUILD,TERRAFORM deploy
```

- **Compute**: ECS Fargate for serverless containers
- **Database**: DynamoDB with GSI for efficient queries
- **Load Balancing**: Application Load Balancer with health checks
- **Monitoring**: CloudWatch with custom metrics and alarms
- **Scaling**: Auto-scaling based on CPU and memory utilization

### **Data Architecture Strategy**

#### **Current: DynamoDB for Operational FHIR Data**
The platform currently uses **DynamoDB** as the primary database, optimized for:
- **Real-time FHIR operations**: Sub-millisecond response times for clinical workflows
- **Flexible schema**: Perfect for FHIR's JSON-based resource structure
- **High throughput**: Handles concurrent clinical users without performance degradation
- **Global Secondary Indexes**: Efficient patient and observation queries

#### **Future: Hybrid Architecture with RDS**
The architecture includes **RDS (Amazon Relational Database Service)** for future enhancement:

**Why RDS for Healthcare Analytics?**
```sql
-- Example: Complex pediatric care analytics requiring SQL
SELECT p.patient_id, p.age, p.care_complexity,
       COUNT(o.observation_id) as vital_count,
       AVG(CASE WHEN o.code = '8867-4' THEN o.value END) as avg_heart_rate,
       COUNT(a.appointment_id) as appointment_count
FROM patients p 
LEFT JOIN observations o ON p.patient_id = o.patient_id
LEFT JOIN appointments a ON p.patient_id = a.patient_id
WHERE p.care_complexity IN ('high', 'critical')
  AND o.effective_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY p.patient_id, p.age, p.care_complexity
HAVING COUNT(o.observation_id) > 10;
```

**Enterprise Healthcare Use Cases:**
- **Clinical Quality Metrics**: Hospital scorecard calculations requiring complex joins
- **Population Health Analytics**: Multi-dimensional patient cohort analysis
- **Research Capabilities**: Longitudinal studies across thousands of patients
- **Regulatory Reporting**: CMS quality measures and public health reporting
- **Financial Analytics**: Cost-per-episode and value-based care calculations
- **Clinical Decision Support**: Complex rule engines with multi-table dependencies

**Hybrid Architecture Benefits:**
```
┌─────────────────────┐    ┌─────────────────────┐
│   DynamoDB          │    │   RDS PostgreSQL    │
│                     │    │                     │
│ • FHIR Resources    │◄──►│ • Clinical Analytics│
│ • Real-time Access  │    │ • Complex Reporting │
│ • Flexible Schema   │    │ • Data Relationships│
│ • High Performance  │    │ • SQL Capabilities  │
└─────────────────────┘    └─────────────────────┘
```

**Industry Standard Pattern:**
This hybrid approach reflects real-world enterprise healthcare architecture:
- **Epic, Cerner, AllScripts**: Use both NoSQL and relational databases
- **FHIR + SQL**: Common pattern in modern healthcare data platforms
- **Data Lake Architecture**: Separates operational and analytical workloads
- **Regulatory Compliance**: Often requires SQL for complex audit queries

#### **Global Secondary Indexes (GSI) - Already Implemented**

The platform includes sophisticated **Global Secondary Indexes** for efficient healthcare queries:

**1. Medical Record Number Index** (Patients Table):
```terraform
global_secondary_index {
  name            = "medical-record-number-index"
  hash_key        = "medical_record_number"
  projection_type = "ALL"
}
```
```javascript
// Enables instant patient lookup by MRN:
const patient = await dynamodb.query({
  IndexName: 'medical-record-number-index',
  KeyConditionExpression: 'medical_record_number = :mrn',
  ExpressionAttributeValues: { ':mrn': 'MRN-12345' }
});
// Result: Sub-millisecond clinical workflows
```

**2. Patient-DateTime Index** (Observations & Appointments):
```javascript
// Efficient time-series queries for vital signs:
const vitalSigns = await dynamodb.query({
  IndexName: 'patient-id-datetime-index',
  KeyConditionExpression: 'patient_id = :pid AND effective_date_time BETWEEN :start AND :end',
  ExpressionAttributeValues: {
    ':pid': 'patient-123',
    ':start': '2024-01-01T00:00:00Z',
    ':end': '2024-12-31T23:59:59Z'
  }
});
// Result: Instant clinical trend analysis
```

**Healthcare Query Benefits:**
- **Clinical Efficiency**: Instant patient lookup during emergencies
- **Trend Analysis**: Real-time vital signs monitoring over time periods
- **Appointment Management**: Efficient scheduling and calendar queries
- **Performance**: Sub-millisecond response times for critical care workflows

#### **Event Sourcing for Healthcare Compliance** 

**Future Enhancement: Complete Clinical Audit Trail**

Healthcare requires comprehensive audit trails for regulatory compliance. Event sourcing provides:

**Current State Storage** (what we have now):
```json
{
  "patientId": "123",
  "name": "Emma Johnson", 
  "condition": "stable",
  "lastUpdated": "2024-01-15T10:00:00Z"
}
```

**Event Sourcing Approach** (future enhancement):
```json
[
  {
    "eventType": "PatientAdmitted",
    "patientId": "123",
    "data": { "name": "Emma Johnson", "age": 5 },
    "timestamp": "2024-01-15T08:00:00Z",
    "userId": "dr-smith"
  },
  {
    "eventType": "VitalSignsRecorded", 
    "patientId": "123",
    "data": { "heartRate": 95, "temperature": 98.6 },
    "timestamp": "2024-01-15T09:30:00Z",
    "userId": "nurse-jones"
  },
  {
    "eventType": "ConditionAssessed",
    "patientId": "123", 
    "data": { "condition": "stable", "notes": "Normal pediatric parameters" },
    "timestamp": "2024-01-15T10:00:00Z",
    "userId": "dr-smith"
  }
]
```

**Healthcare Benefits of Event Sourcing:**
- **HIPAA Compliance**: Complete audit trail of all patient data changes
- **Legal Protection**: Immutable record of clinical decisions and timing
- **Clinical Research**: Historical analysis for treatment effectiveness
- **Quality Assurance**: Track care quality metrics over time
- **Time Travel**: Reconstruct patient state at any point in history
- **Blame-Free Analysis**: Understand what happened without changing history

**Implementation Strategy:**
- **Phase 1 (Current)**: DynamoDB for operational FHIR data and real-time clinical workflows
- **Phase 2 (Future)**: Add RDS for clinical data warehouse, advanced analytics, and research capabilities  
- **Phase 3 (Event Sourcing)**: Implement event streams for complete clinical audit trails and compliance
- **Phase 4 (Advanced)**: Data lake with automated ETL pipelines for population health insights

This design demonstrates **enterprise healthcare architecture thinking** - recognizing that different data access patterns require different database technologies, which is essential for scalable pediatric care platforms in modern healthcare environments.

## 🔐 Security Features

- **Input Validation**: Comprehensive request validation with Joi
- **Rate Limiting**: Configurable rate limiting to prevent abuse
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable CORS policies
- **Health Checks**: Multiple health check endpoints
- **Audit Logging**: Structured logging for all operations
- **Error Handling**: Secure error responses without information leakage

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Type checking
npm run typecheck
```

## 🚀 Deployment

### Infrastructure Deployment

1. **Configure AWS Credentials**
   ```bash
   aws configure
   ```

2. **Deploy Infrastructure**
   ```bash
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

3. **Build and Push Docker Image**
   ```bash
   # This is automated via GitHub Actions
   docker build -t fhir-pediatric-care .
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `DYNAMODB_TABLE_PREFIX` | DynamoDB table prefix | `fhir-pediatric` |
| `FHIR_BASE_URL` | External FHIR server | `https://hapi.fhir.org/baseR4` |
| `LOG_LEVEL` | Logging level | `info` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:3000` |

## 📈 Monitoring

- **Health Checks**: Built-in health endpoints for load balancer checks
- **Metrics**: CloudWatch metrics for performance monitoring
- **Logs**: Structured JSON logging with correlation IDs
- **Alarms**: CPU and memory utilization alarms
- **Auto-scaling**: Automatic scaling based on load

## 🏥 Healthcare Informatics & Compliance

### Johns Hopkins Health Informatics Stack Implementation

This platform demonstrates comprehensive coverage of the Johns Hopkins Health Informatics Stack layers:

#### **Health Informatics Stack Architecture**

```mermaid
graph TB
    subgraph "Layer 7: User Interface & Experience"
        UI[React Clinical Dashboards]
        API_DOCS[API Documentation]
        HEALTH[Health Status Interfaces]
    end
    
    subgraph "Layer 6: Applications & Workflows"
        PATIENT[Patient Management System]
        APPT[Appointment Scheduling]
        VITALS[Vital Signs Tracking]
        CARE[Care Coordination Workflows]
    end
    
    subgraph "Layer 5: Analytics & Decision Support"
        CDS[Clinical Decision Support]
        ANALYTICS[Pediatric Analytics Engine]
        QUALITY[Quality Metrics & Reporting]
        POPULATION[Population Health Management]
    end
    
    subgraph "Layer 4: Integration & Interoperability"
        FHIR[FHIR R4 APIs]
        REST[RESTful Interfaces]
        HL7[HL7 Integration Layer]
        EHR[EHR Integration Ready]
    end
    
    subgraph "Layer 3: Data Management & Governance"
        DYNAMO[DynamoDB Healthcare Storage]
        AUDIT[Audit & Compliance Logging]
        MDM[Master Data Management]
        GOVERN[Data Governance Policies]
    end
    
    subgraph "Layer 2: Infrastructure & Platform Services"
        ECS[ECS Fargate Containers]
        MONITOR[CloudWatch Monitoring]
        SECURITY[Security Services]
        SCALING[Auto-Scaling Platform]
    end
    
    subgraph "Layer 1: Network & Connectivity"
        VPC[VPC Network Architecture]
        ALB[Application Load Balancer]
        IGW[Internet Gateway]
        SUBNET[Private/Public Subnets]
    end

    %% Connections between layers
    UI --> PATIENT
    API_DOCS --> FHIR
    PATIENT --> CDS
    APPT --> ANALYTICS
    VITALS --> CDS
    CDS --> FHIR
    ANALYTICS --> REST
    FHIR --> DYNAMO
    REST --> AUDIT
    DYNAMO --> ECS
    AUDIT --> MONITOR
    ECS --> VPC
    MONITOR --> ALB
    ALB --> IGW

    %% Styling
    classDef layer7 fill:#0D47A1,stroke:#01579B,stroke-width:2px,color:#FFFFFF
    classDef layer6 fill:#4A148C,stroke:#6A1B9A,stroke-width:2px,color:#FFFFFF
    classDef layer5 fill:#1B5E20,stroke:#2E7D32,stroke-width:2px,color:#FFFFFF
    classDef layer4 fill:#E65100,stroke:#F57C00,stroke-width:2px,color:#FFFFFF
    classDef layer3 fill:#B71C1C,stroke:#C62828,stroke-width:2px,color:#FFFFFF
    classDef layer2 fill:#1565C0,stroke:#1976D2,stroke-width:2px,color:#FFFFFF
    classDef layer1 fill:#455A64,stroke:#546E7A,stroke-width:2px,color:#FFFFFF

    class UI,API_DOCS,HEALTH layer7
    class PATIENT,APPT,VITALS,CARE layer6
    class CDS,ANALYTICS,QUALITY,POPULATION layer5
    class FHIR,REST,HL7,EHR layer4
    class DYNAMO,AUDIT,MDM,GOVERN layer3
    class ECS,MONITOR,SECURITY,SCALING layer2
    class VPC,ALB,IGW,SUBNET layer1
```

#### **FHIR Resource Flow Architecture**

```mermaid
graph LR
    subgraph "Clinical Data Sources"
        CLINICIAN[Clinician Input]
        DEVICES[Medical Devices]
        EXTERNAL[External EHR Systems]
    end
    
    subgraph "FHIR Processing Layer"
        VALIDATE[Input Validation]
        TRANSFORM[Data Transformation]
        ENRICH[Clinical Enrichment]
    end
    
    subgraph "FHIR Resources"
        PATIENT_R["Patient Resource<br/>US Core Profile"]
        OBS_R["Observation Resource<br/>LOINC Codes"]
        APPT_R["Appointment Resource<br/>SNOMED Specialties"]
    end
    
    subgraph "Clinical Decision Support"
        PEDIATRIC[Pediatric Rules Engine]
        COMPLEXITY[Care Complexity Scoring]
        ALERTS[Clinical Alerts]
    end
    
    subgraph "Data Persistence"
        DYNAMO_P[DynamoDB Patient Table]
        DYNAMO_O[DynamoDB Observations]
        DYNAMO_A[DynamoDB Appointments]
    end
    
    subgraph "API Consumers"
        DASHBOARD[Clinical Dashboards]
        MOBILE[Mobile Applications]
        INTEGRATION[EHR Integrations]
    end

    %% Flow connections
    CLINICIAN --> VALIDATE
    DEVICES --> VALIDATE
    EXTERNAL --> VALIDATE
    
    VALIDATE --> TRANSFORM
    TRANSFORM --> ENRICH
    
    ENRICH --> PATIENT_R
    ENRICH --> OBS_R
    ENRICH --> APPT_R
    
    PATIENT_R --> PEDIATRIC
    OBS_R --> COMPLEXITY
    APPT_R --> ALERTS
    
    PATIENT_R --> DYNAMO_P
    OBS_R --> DYNAMO_O
    APPT_R --> DYNAMO_A
    
    DYNAMO_P --> DASHBOARD
    DYNAMO_O --> MOBILE
    DYNAMO_A --> INTEGRATION
    
    PEDIATRIC --> DASHBOARD
    COMPLEXITY --> MOBILE
    ALERTS --> INTEGRATION

    %% Styling
    classDef source fill:#1565C0,stroke:#0D47A1,stroke-width:2px,color:#FFFFFF
    classDef processing fill:#2E7D32,stroke:#1B5E20,stroke-width:2px,color:#FFFFFF
    classDef resource fill:#E65100,stroke:#D84315,stroke-width:2px,color:#FFFFFF
    classDef decision fill:#7B1FA2,stroke:#4A148C,stroke-width:2px,color:#FFFFFF
    classDef storage fill:#455A64,stroke:#263238,stroke-width:2px,color:#FFFFFF
    classDef consumer fill:#1976D2,stroke:#1565C0,stroke-width:2px,color:#FFFFFF

    class CLINICIAN,DEVICES,EXTERNAL source
    class VALIDATE,TRANSFORM,ENRICH processing
    class PATIENT_R,OBS_R,APPT_R resource
    class PEDIATRIC,COMPLEXITY,ALERTS decision
    class DYNAMO_P,DYNAMO_O,DYNAMO_A storage
    class DASHBOARD,MOBILE,INTEGRATION consumer
```

#### **Pediatric Care Workflow Diagram**

```mermaid
sequenceDiagram
    participant C as Clinician
    participant API as FHIR API
    participant CDS as Clinical Decision Support
    participant DB as DynamoDB
    participant ALERT as Alert System

    Note over C,ALERT: Pediatric Patient Visit Workflow

    C->>API: Create Patient (age 5, care complexity: moderate)
    API->>DB: Store Patient Resource
    API->>CDS: Evaluate pediatric rules
    CDS-->>API: Care recommendations
    API-->>C: Patient created + care guidance

    C->>API: Record vital signs (HR: 120 bpm)
    API->>CDS: Check pediatric reference ranges
    CDS->>CDS: Age 5: Normal range 80-130 bpm
    CDS-->>API: Normal interpretation
    API->>DB: Store Observation with interpretation
    API-->>C: Vital signs recorded (Normal)

    C->>API: Schedule follow-up appointment
    API->>CDS: Check care complexity requirements
    CDS->>CDS: Moderate complexity = 3 month follow-up
    CDS-->>API: Recommended timing
    API->>DB: Store Appointment
    API-->>C: Appointment scheduled

    Note over C,ALERT: Critical Value Scenario
    C->>API: Record high fever (39.5°C)
    API->>CDS: Evaluate critical threshold
    CDS->>ALERT: Trigger pediatric fever alert
    ALERT-->>C: Immediate clinical alert
    CDS-->>API: Critical interpretation
    API->>DB: Store with critical flag
    API-->>C: Critical value recorded + alert
```

#### **Component Mapping to Stack Layers:**

| **Platform Component** | **Stack Layer** | **Johns Hopkins Category** | **Implementation** |
|------------------------|-----------------|----------------------------|-------------------|
| **React Frontend** | Layer 7 | User Interface & Experience | Clinical dashboards, patient portals |
| **API Documentation** | Layer 7 | User Interface & Experience | Developer-friendly API docs |
| **Patient Management** | Layer 6 | Applications & Workflows | Pediatric care workflows |
| **Appointment System** | Layer 6 | Applications & Workflows | Clinical scheduling & telehealth |
| **Vital Signs Analytics** | Layer 5 | Analytics & Decision Support | Age-based reference ranges |
| **Care Complexity Scoring** | Layer 5 | Analytics & Decision Support | Clinical decision support |
| **FHIR R4 APIs** | Layer 4 | Integration & Interoperability | HL7 FHIR compliance |
| **RESTful Interfaces** | Layer 4 | Integration & Interoperability | Standardized data exchange |
| **DynamoDB Storage** | Layer 3 | Data Management & Governance | Healthcare data persistence |
| **Audit Logging** | Layer 3 | Data Management & Governance | Compliance and governance |
| **ECS Fargate** | Layer 2 | Infrastructure & Platform | Scalable container platform |
| **CloudWatch Monitoring** | Layer 2 | Infrastructure & Platform | Observability and alerting |
| **VPC Networking** | Layer 1 | Network & Connectivity | Secure network architecture |
| **Load Balancer** | Layer 1 | Network & Connectivity | High availability networking |

#### **Healthcare Informatics Standards Compliance:**

**Clinical Standards:**
- **HL7 FHIR R4**: Complete implementation with Patient, Observation, and Appointment resources
- **LOINC Codes**: Standardized observation codes (e.g., 8867-4 for Heart Rate)
- **SNOMED CT**: Medical terminology for specialties and procedures
- **US Core Profiles**: Adherence to US healthcare implementation guides

**Data Governance:**
- **HIPAA Ready**: Security patterns for protected health information
- **Data Minimization**: Limited exposure of sensitive patient data
- **Audit Trails**: Comprehensive logging with correlation IDs for compliance
- **Access Controls**: Role-based security patterns (ready for implementation)

**Interoperability:**
- **FHIR Bundle Support**: Ready for bulk data operations
- **RESTful CRUD**: Standard healthcare data operations
- **JSON Format**: Modern data exchange format
- **API Versioning**: Backward-compatible API evolution

**Quality & Safety:**
- **Clinical Decision Support**: Automated pediatric vital signs interpretation
- **Error Handling**: Safe error responses protecting patient information
- **Input Validation**: Healthcare-specific data validation rules
- **Monitoring**: Real-time system health and performance metrics

#### **Enterprise Healthcare Architecture Patterns:**

**Microservices Design:**
- **Service Separation**: Patient, Observation, and Appointment services
- **API Gateway Pattern**: Centralized API management and security
- **Event-Driven Architecture**: Ready for clinical workflow automation
- **Scalable Infrastructure**: Auto-scaling based on clinical demand

**Security & Privacy:**
- **Defense in Depth**: Multiple security layers from network to application
- **Encryption Ready**: HTTPS/TLS configuration for data in transit
- **Audit Logging**: Healthcare-specific audit trail requirements
- **Data Classification**: Structured approach to sensitive health data

**Clinical Workflow Support:**
- **Care Coordination**: Emergency contact and care team management
- **Appointment Lifecycle**: Complete workflow from booking to completion
- **Clinical Documentation**: Structured data for clinical decision-making
- **Population Health**: Patient cohort management and analytics

This implementation demonstrates deep understanding of health informatics principles and provides a foundation for enterprise healthcare system development.

## 🎯 Demo Highlights for Healthcare Organizations

This demo specifically showcases capabilities relevant to modern pediatric healthcare organizations:

1. **Pediatric Focus**: Age-appropriate vital sign ranges and care complexity tracking
2. **Scalable Design**: Built for high-volume, multi-tenant healthcare environments
3. **Modern Stack**: Uses technologies mentioned in the job description (Node.js, TypeScript, AWS, Terraform)
4. **Healthcare Standards**: Demonstrates deep understanding of FHIR and healthcare interoperability
5. **Production Ready**: Includes monitoring, logging, security, and deployment automation
6. **Team Collaboration**: Clean code, comprehensive documentation, and maintainable architecture

## 🤝 Contributing

This is a demonstration project, but it follows enterprise development practices:

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request
5. CI/CD pipeline will validate changes

## 📄 License

MIT License - This is a demonstration project showcasing modern healthcare software development practices.

---

**Note**: This is a portfolio demonstration project showcasing enterprise-grade healthcare software development skills and FHIR implementation expertise for pediatric care platforms.