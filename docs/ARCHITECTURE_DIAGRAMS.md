# FHIR Pediatric Care Platform - Architecture Diagrams

This document provides comprehensive visual documentation of the system architecture using Mermaid diagrams.

## System Overview

### Complete System Architecture

```mermaid
graph TB
    subgraph "External Systems"
        EHR[External EHR Systems]
        DEVICES[Medical Devices]
        HAPI[HAPI FHIR Server]
    end
    
    subgraph "Presentation Layer"
        WEB[React Web Application]
        MOBILE[Mobile Apps]
        API_DOCS[API Documentation]
    end
    
    subgraph "API Gateway & Security"
        ALB[Application Load Balancer]
        RATE[Rate Limiting]
        AUTH[Authentication Layer]
        CORS[CORS Security]
    end
    
    subgraph "Application Services"
        PATIENT_SVC[Patient Service]
        OBS_SVC[Observation Service]
        APPT_SVC[Appointment Service]
        HEALTH_SVC[Health Check Service]
    end
    
    subgraph "Business Logic"
        VALIDATOR[Input Validation]
        CDS[Clinical Decision Support]
        WORKFLOW[Workflow Engine]
        ANALYTICS[Analytics Engine]
    end
    
    subgraph "Data Access Layer"
        PATIENT_REPO[Patient Repository]
        OBS_REPO[Observation Repository]
        APPT_REPO[Appointment Repository]
    end
    
    subgraph "Data Storage"
        DYNAMO_P[(DynamoDB<br/>Patients)]
        DYNAMO_O[(DynamoDB<br/>Observations)]
        DYNAMO_A[(DynamoDB<br/>Appointments)]
        S3[(S3<br/>Documents)]
    end
    
    subgraph "Infrastructure Services"
        LOGS[CloudWatch Logs]
        METRICS[CloudWatch Metrics]
        ALERTS[CloudWatch Alarms]
        ECR[ECR Container Registry]
    end

    %% External connections
    EHR --> ALB
    DEVICES --> ALB
    HAPI <--> ALB
    
    %% User interfaces
    WEB --> ALB
    MOBILE --> ALB
    API_DOCS --> ALB
    
    %% Security layer
    ALB --> RATE
    RATE --> AUTH
    AUTH --> CORS
    
    %% Service routing
    CORS --> PATIENT_SVC
    CORS --> OBS_SVC
    CORS --> APPT_SVC
    CORS --> HEALTH_SVC
    
    %% Business logic
    PATIENT_SVC --> VALIDATOR
    OBS_SVC --> VALIDATOR
    APPT_SVC --> VALIDATOR
    
    VALIDATOR --> CDS
    CDS --> WORKFLOW
    WORKFLOW --> ANALYTICS
    
    %% Data access
    PATIENT_SVC --> PATIENT_REPO
    OBS_SVC --> OBS_REPO
    APPT_SVC --> APPT_REPO
    
    %% Data storage
    PATIENT_REPO --> DYNAMO_P
    OBS_REPO --> DYNAMO_O
    APPT_REPO --> DYNAMO_A
    PATIENT_REPO --> S3
    
    %% Infrastructure
    PATIENT_SVC --> LOGS
    OBS_SVC --> LOGS
    APPT_SVC --> LOGS
    
    LOGS --> METRICS
    METRICS --> ALERTS
    
    %% Deployment
    ECR --> PATIENT_SVC
    ECR --> OBS_SVC
    ECR --> APPT_SVC

    %% Styling
    classDef external fill:#ffecb3
    classDef presentation fill:#e1f5fe
    classDef security fill:#ffcdd2
    classDef service fill:#c8e6c9
    classDef logic fill:#f3e5f5
    classDef data fill:#fff3e0
    classDef infra fill:#e0f2f1

    class EHR,DEVICES,HAPI external
    class WEB,MOBILE,API_DOCS presentation
    class ALB,RATE,AUTH,CORS security
    class PATIENT_SVC,OBS_SVC,APPT_SVC,HEALTH_SVC service
    class VALIDATOR,CDS,WORKFLOW,ANALYTICS logic
    class PATIENT_REPO,OBS_REPO,APPT_REPO,DYNAMO_P,DYNAMO_O,DYNAMO_A,S3 data
    class LOGS,METRICS,ALERTS,ECR infra
```

## Data Flow Diagrams

### FHIR Resource Creation Flow

```mermaid
sequenceDiagram
    participant Client as Clinical Client
    participant API as FHIR API Gateway
    participant Validator as Input Validator
    participant Service as Clinical Service
    participant CDS as Decision Support
    participant Repo as Data Repository
    participant DB as DynamoDB
    participant Log as Audit Logger

    Client->>API: POST /patients (FHIR Patient)
    API->>Validator: Validate input structure
    Validator->>Validator: Check FHIR R4 compliance
    Validator->>Validator: Validate pediatric data
    
    alt Validation Success
        Validator->>Service: Process patient creation
        Service->>CDS: Evaluate care complexity
        CDS->>CDS: Calculate risk scores
        CDS->>Service: Return care recommendations
        
        Service->>Repo: Create patient record
        Repo->>DB: Store FHIR resource
        DB-->>Repo: Confirm storage
        Repo-->>Service: Return patient ID
        
        Service->>Log: Log patient creation
        Log->>Log: Record audit trail
        
        Service-->>API: Return created patient
        API-->>Client: 201 Created + Patient data
    else Validation Failure
        Validator-->>API: Return validation errors
        API-->>Client: 400 Bad Request + errors
    end
```

### Clinical Decision Support Flow

```mermaid
graph LR
    subgraph "Data Input"
        VITAL[Vital Signs Input]
        AGE[Patient Age]
        COMPLEXITY[Care Complexity]
    end
    
    subgraph "Reference Data"
        PEDIATRIC_REF[Pediatric Reference Ranges]
        CLINICAL_RULES[Clinical Rules Engine]
        ALERT_THRESHOLDS[Alert Thresholds]
    end
    
    subgraph "Decision Engine"
        COMPARE[Compare Values]
        RISK_CALC[Risk Calculation]
        ALERT_EVAL[Alert Evaluation]
    end
    
    subgraph "Clinical Output"
        INTERPRETATION[Clinical Interpretation]
        RECOMMENDATIONS[Care Recommendations]
        ALERTS[Clinical Alerts]
    end
    
    subgraph "Actions"
        NOTIFY[Notify Clinician]
        DOCUMENT[Update Records]
        ESCALATE[Escalate if Critical]
    end

    %% Data flow
    VITAL --> COMPARE
    AGE --> PEDIATRIC_REF
    COMPLEXITY --> CLINICAL_RULES
    
    PEDIATRIC_REF --> COMPARE
    CLINICAL_RULES --> RISK_CALC
    ALERT_THRESHOLDS --> ALERT_EVAL
    
    COMPARE --> INTERPRETATION
    RISK_CALC --> RECOMMENDATIONS
    ALERT_EVAL --> ALERTS
    
    INTERPRETATION --> DOCUMENT
    RECOMMENDATIONS --> NOTIFY
    ALERTS --> ESCALATE
    
    %% Styling
    classDef input fill:#e3f2fd
    classDef reference fill:#f3e5f5
    classDef engine fill:#e8f5e8
    classDef output fill:#fff3e0
    classDef action fill:#ffebee

    class VITAL,AGE,COMPLEXITY input
    class PEDIATRIC_REF,CLINICAL_RULES,ALERT_THRESHOLDS reference
    class COMPARE,RISK_CALC,ALERT_EVAL engine
    class INTERPRETATION,RECOMMENDATIONS,ALERTS output
    class NOTIFY,DOCUMENT,ESCALATE action
```

## Security Architecture

### Security Layers Diagram

```mermaid
graph TB
    subgraph "External Threats"
        DDOS[DDoS Attacks]
        INJECTION[SQL Injection]
        XSS[Cross-Site Scripting]
        UNAUTHORIZED[Unauthorized Access]
    end
    
    subgraph "Layer 1: Network Security"
        WAF[Web Application Firewall]
        VPC[Private VPC Network]
        NACL[Network Access Control Lists]
        SG[Security Groups]
    end
    
    subgraph "Layer 2: Application Security"
        RATE_LIMIT[Rate Limiting]
        CORS_POLICY[CORS Policies]
        HELMET[Security Headers]
        INPUT_VAL[Input Validation]
    end
    
    subgraph "Layer 3: Authentication & Authorization"
        JWT[JWT Token Validation]
        RBAC[Role-Based Access Control]
        API_KEYS[API Key Management]
        SESSION[Session Management]
    end
    
    subgraph "Layer 4: Data Security"
        ENCRYPTION[Data Encryption]
        MASKING[Data Masking]
        MINIMIZE[Data Minimization]
        RETENTION[Data Retention Policies]
    end
    
    subgraph "Layer 5: Monitoring & Compliance"
        AUDIT_LOG[Audit Logging]
        MONITORING[Security Monitoring]
        ALERTS_SEC[Security Alerts]
        COMPLIANCE[HIPAA Compliance]
    end
    
    subgraph "Protected Resources"
        PATIENT_DATA[Patient Data]
        CLINICAL_RECORDS[Clinical Records]
        SYSTEM_CONFIG[System Configuration]
    end

    %% Threat mitigation flow
    DDOS -.->|Blocked by| WAF
    INJECTION -.->|Prevented by| INPUT_VAL
    XSS -.->|Mitigated by| HELMET
    UNAUTHORIZED -.->|Stopped by| JWT
    
    %% Security layer flow
    WAF --> VPC
    VPC --> NACL
    NACL --> SG
    
    SG --> RATE_LIMIT
    RATE_LIMIT --> CORS_POLICY
    CORS_POLICY --> HELMET
    HELMET --> INPUT_VAL
    
    INPUT_VAL --> JWT
    JWT --> RBAC
    RBAC --> API_KEYS
    API_KEYS --> SESSION
    
    SESSION --> ENCRYPTION
    ENCRYPTION --> MASKING
    MASKING --> MINIMIZE
    MINIMIZE --> RETENTION
    
    RETENTION --> AUDIT_LOG
    AUDIT_LOG --> MONITORING
    MONITORING --> ALERTS_SEC
    ALERTS_SEC --> COMPLIANCE
    
    COMPLIANCE --> PATIENT_DATA
    COMPLIANCE --> CLINICAL_RECORDS
    COMPLIANCE --> SYSTEM_CONFIG

    %% Styling
    classDef threat fill:#ffcdd2
    classDef network fill:#e8eaf6
    classDef app fill:#e0f2f1
    classDef auth fill:#fff3e0
    classDef data fill:#f3e5f5
    classDef monitor fill:#e1f5fe
    classDef resource fill:#c8e6c9

    class DDOS,INJECTION,XSS,UNAUTHORIZED threat
    class WAF,VPC,NACL,SG network
    class RATE_LIMIT,CORS_POLICY,HELMET,INPUT_VAL app
    class JWT,RBAC,API_KEYS,SESSION auth
    class ENCRYPTION,MASKING,MINIMIZE,RETENTION data
    class AUDIT_LOG,MONITORING,ALERTS_SEC,COMPLIANCE monitor
    class PATIENT_DATA,CLINICAL_RECORDS,SYSTEM_CONFIG resource
```

## Deployment Architecture

### CI/CD Pipeline

```mermaid
graph LR
    subgraph "Development"
        DEV[Developer]
        GIT[Git Repository]
        PR[Pull Request]
    end
    
    subgraph "CI Pipeline"
        TRIGGER[GitHub Actions Trigger]
        BUILD[Build & Test]
        SECURITY[Security Scan]
        QUALITY[Code Quality]
    end
    
    subgraph "Artifact Management"
        ECR_BUILD[ECR Image Build]
        ECR_PUSH[ECR Image Push]
        TERRAFORM[Terraform Plan]
    end
    
    subgraph "Deployment Stages"
        DEV_DEPLOY[Development Deploy]
        STAGING[Staging Environment]
        PROD_DEPLOY[Production Deploy]
    end
    
    subgraph "Production Infrastructure"
        ECS_UPDATE[ECS Service Update]
        HEALTH_CHECK[Health Checks]
        ROLLBACK[Rollback Capability]
    end
    
    subgraph "Monitoring"
        DEPLOY_METRICS[Deployment Metrics]
        ALERTS_DEPLOY[Deployment Alerts]
        VALIDATION[Post-Deploy Validation]
    end

    %% Development flow
    DEV --> GIT
    GIT --> PR
    PR --> TRIGGER
    
    %% CI pipeline
    TRIGGER --> BUILD
    BUILD --> SECURITY
    SECURITY --> QUALITY
    
    %% Artifact creation
    QUALITY --> ECR_BUILD
    ECR_BUILD --> ECR_PUSH
    QUALITY --> TERRAFORM
    
    %% Deployment stages
    ECR_PUSH --> DEV_DEPLOY
    DEV_DEPLOY --> STAGING
    STAGING --> PROD_DEPLOY
    
    %% Production deployment
    PROD_DEPLOY --> ECS_UPDATE
    ECS_UPDATE --> HEALTH_CHECK
    HEALTH_CHECK --> ROLLBACK
    
    %% Monitoring
    ECS_UPDATE --> DEPLOY_METRICS
    DEPLOY_METRICS --> ALERTS_DEPLOY
    ALERTS_DEPLOY --> VALIDATION
    
    %% Feedback loops
    ROLLBACK -.->|If Failed| STAGING
    VALIDATION -.->|Success| DEV

    %% Styling
    classDef dev fill:#e3f2fd
    classDef ci fill:#e8f5e8
    classDef artifact fill:#fff3e0
    classDef deploy fill:#f3e5f5
    classDef prod fill:#ffebee
    classDef monitor fill:#e0f2f1

    class DEV,GIT,PR dev
    class TRIGGER,BUILD,SECURITY,QUALITY ci
    class ECR_BUILD,ECR_PUSH,TERRAFORM artifact
    class DEV_DEPLOY,STAGING,PROD_DEPLOY deploy
    class ECS_UPDATE,HEALTH_CHECK,ROLLBACK prod
    class DEPLOY_METRICS,ALERTS_DEPLOY,VALIDATION monitor
```

This comprehensive architectural documentation provides visual representation of all major system components, data flows, security layers, and deployment processes, making it easier for healthcare technology teams to understand and evaluate the platform's design.