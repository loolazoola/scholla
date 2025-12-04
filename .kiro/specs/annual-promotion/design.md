# Annual Class Promotion System - Design

## Overview

The Annual Class Promotion System is a critical administrative tool that manages the transition of students between academic years. The system maintains fixed class cohort structures while creating new enrollment records for each academic year, handling retention cases, and resolving capacity conflicts through manual admin intervention.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Interface                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Preview    │  │   Conflict   │  │   Execute    │      │
│  │   Report     │  │  Resolution  │  │  Promotion   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Server Actions Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  processAnnualPromotionAction                        │   │
│  │  - Authorization check                               │   │
│  │  - Input validation                                  │   │
│  │  - Call service layer                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PromotionService                                    │   │
│  │  - generatePromotionPreview()                        │   │
│  │  - detectCapacityConflicts()                         │   │
│  │  - executePromotion()                                │   │
│  │  - generateReport()                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer (Prisma)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  User    │  │  Class   │  │Enrollment│  │Promotion │   │
│  │          │  │  Cohort  │  │          │  │  Report  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Promotion Service (`lib/services/promotion-service.ts`)

```typescript
interface PromotionPreview {
  sourceYear: string;
  targetYear: string;
  totalStudents: number;
  retainedStudents: number;
  promotions: StudentPromotion[];
  conflicts: CapacityConflict[];
  warnings: string[];
}

interface StudentPromotion {
  studentId: string;
  studentName: string;
  currentClass: string;
  currentGrade: number;
  targetClass: string | null;
  targetGrade: number;
  isRetained: boolean;
  status: "ready" | "conflict" | "error";
  message?: string;
}

interface CapacityConflict {
  classId: string;
  className: string;
  capacity: number;
  currentEnrollments: number;
  incomingPromoted: number;
  incomingRetained: number;
  totalIncoming: number;
  overflow: number;
  affectedStudents: string[];
}

interface PromotionResult {
  success: boolean;
  processedCount: number;
  successCount: number;
  failureCount: number;
  errors: PromotionError[];
  reportId: string;
}

interface PromotionError {
  studentId: string;
  studentName: string;
  error: string;
}
```

### 2. Server Action (`app/actions/promotions.ts`)

```typescript
export async function generatePromotionPreviewAction(
  sourceYear: string,
  targetYear: string
): Promise<{ success: boolean; preview?: PromotionPreview; error?: string }>;

export async function processAnnualPromotionAction(
  sourceYear: string,
  targetYear: string,
  retainedStudentIds: string[],
  conflictResolutions: ConflictResolution[]
): Promise<{ success: boolean; result?: PromotionResult; error?: string }>;
```

### 3. UI Components

- **`PromotionWizard`**: Multi-step wizard for the promotion process
- **`PromotionPreview`**: Display preview report with conflicts
- **`ConflictResolver`**: Interface for resolving capacity conflicts
- **`PromotionReport`**: Display completion report

## Data Models

### Existing Models (No Changes)

```prisma
model Class {
  id                 String        @id @default(cuid())
  name               String        // Fixed: "X-1", "XI-1", etc.
  level              SchoolLevel
  grade              Int
  capacity           Int?
  academicYear       String        // Current year for this class
  // ... other fields
}

model Enrollment {
  id           String           @id @default(cuid())
  studentId    String
  classId      String
  academicYear String           // Links student to class for specific year
  status       EnrollmentStatus // ACTIVE or WITHDRAWN
  enrolledAt   DateTime
  // ... other fields
}
```

### New Model

```prisma
model PromotionReport {
  id                String   @id @default(cuid())
  sourceYear        String
  targetYear        String
  executedBy        String   // Admin user ID
  executedAt        DateTime @default(now())
  totalStudents     Int
  successCount      Int
  failureCount      Int
  retainedCount     Int
  errors            Json     // Array of error objects
  metadata          Json     // Additional data

  @@index([sourceYear])
  @@index([targetYear])
  @@index([executedAt])
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Enrollment Uniqueness Per Year

_For any_ student and academic year, after promotion completes, the student SHALL have exactly one ACTIVE enrollment for that academic year.
**Validates: Requirements 2.1, 2.3**

### Property 2: Previous Enrollment Withdrawal

_For any_ student being promoted, their enrollment from the source academic year SHALL have status WITHDRAWN after promotion completes.
**Validates: Requirements 2.2**

### Property 3: Capacity Constraint Enforcement

_For any_ class cohort, after promotion completes, the number of ACTIVE enrollments for the target academic year SHALL NOT exceed the class capacity.
**Validates: Requirements 4.2, 5.4**

### Property 4: Transaction Atomicity

_For any_ promotion execution, either ALL student promotions succeed and are committed, or ALL changes are rolled back and no enrollments are modified.
**Validates: Requirements 3.1, 3.2**

### Property 5: Grade Progression Correctness

_For any_ promoted student (not retained), their target class grade SHALL equal their source class grade plus one.
**Validates: Requirements 10.1, 10.2**

### Property 6: Retention Grade Consistency

_For any_ retained student, their target class grade SHALL equal their source class grade.
**Validates: Requirements 6.2**

### Property 7: Conflict Detection Completeness

_For any_ target class where (promoted students + retained students) exceeds capacity, the system SHALL include that class in the conflict report.
**Validates: Requirements 4.1, 4.2**

### Property 8: Historical Data Preservation

_For any_ enrollment record from a previous academic year, its academicYear field SHALL remain unchanged after promotion.
**Validates: Requirements 2.4**

## Error Handling

### Validation Errors

- Invalid academic year format
- Source and target years are the same
- Target year already has promotions processed
- User lacks admin permissions

### Capacity Errors

- Unresolved capacity conflicts
- Invalid conflict resolutions
- Target class does not exist

### Transaction Errors

- Database connection failure
- Concurrent modification detected
- Referential integrity violation

### Recovery Strategy

- All operations within Prisma transaction
- Automatic rollback on any error
- Detailed error logging
- User-friendly error messages

## Testing Strategy

### Unit Tests

- Test promotion preview generation
- Test capacity conflict detection
- Test grade progression logic
- Test retention handling
- Test error scenarios

### Property-Based Tests

- **Property 1 Test**: Generate random students and academic years, execute promotion, verify each student has exactly one ACTIVE enrollment
- **Property 2 Test**: Generate random promotions, verify all source enrollments are WITHDRAWN
- **Property 3 Test**: Generate random class capacities and student counts, verify no capacity violations
- **Property 4 Test**: Inject random failures, verify complete rollback
- **Property 5 Test**: Generate random grade levels, verify correct grade progression
- **Property 6 Test**: Generate random retained students, verify grade consistency
- **Property 7 Test**: Generate scenarios with capacity conflicts, verify all are detected
- **Property 8 Test**: Generate historical enrollments, verify academicYear fields unchanged

### Integration Tests

- Test complete promotion workflow
- Test conflict resolution flow
- Test report generation
- Test concurrent promotion attempts

### Manual Testing

- Test with realistic school data
- Test edge cases (graduating class, empty classes)
- Test UI workflow
- Test error recovery

## Implementation Notes

### Transaction Management

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Withdraw all source enrollments
  // 2. Create all target enrollments
  // 3. Create promotion report
  // All or nothing
});
```

### Conflict Resolution Strategy

1. Admin reviews conflict report
2. Admin manually reassigns overflow students
3. System validates all assignments
4. System proceeds with promotion only if all conflicts resolved

### Performance Optimization

- Batch database operations
- Use database transactions efficiently
- Index academic year fields
- Cache class capacity data

### Security Considerations

- Admin-only access
- Audit logging
- Confirmation dialogs
- Rate limiting on promotion execution
