# Annual Class Promotion System - Requirements

## Introduction

The Annual Class Promotion System manages the transition of students between academic years in the Indonesian school system. The system handles the promotion of students from one grade level to the next while maintaining fixed class cohort structures (e.g., X-1, XI-1, XII-1) and managing capacity constraints.

## Glossary

- **Class Cohort**: A fixed organizational unit with a permanent name (e.g., X-1, XI-1) that persists across academic years
- **Academic Year**: A school year period in format YYYY/YYYY (e.g., 2024/2025)
- **Promotion**: The process of advancing students to the next grade level for a new academic year
- **Retention**: When a student repeats the same grade level in the new academic year
- **Enrollment**: A record linking a student to a specific class cohort for a specific academic year
- **Capacity Overflow**: When the number of students assigned to a class exceeds its maximum capacity
- **Promotion Transaction**: An atomic database operation that processes all student promotions
- **Admin**: An administrator user with permission to execute the promotion process

## Requirements

### Requirement 1: Fixed Class Structure

**User Story:** As a school administrator, I want class cohort names to remain constant across academic years, so that the organizational structure is predictable and manageable.

#### Acceptance Criteria

1. WHEN a new academic year begins THEN the system SHALL maintain existing class cohort entities without renaming them
2. WHEN students are promoted THEN the system SHALL create new enrollment records linking students to existing class cohorts
3. THE system SHALL NOT create, rename, or delete class cohort entities during the promotion process
4. WHEN viewing class cohorts THEN the system SHALL display the same class names (e.g., X-1, XI-1) across different academic years

### Requirement 2: Enrollment Record Management

**User Story:** As a school administrator, I want clear enrollment records for each academic year, so that I can track student progression and maintain accurate historical data.

#### Acceptance Criteria

1. WHEN a student is promoted THEN the system SHALL create a new enrollment record for the target class cohort and new academic year
2. WHEN a new enrollment is created THEN the system SHALL set the previous year's enrollment status to WITHDRAWN
3. WHEN a student is retained THEN the system SHALL create a new enrollment record for a class at the current grade level for the new academic year
4. THE system SHALL maintain all historical enrollment records with their original academic year values
5. WHEN querying enrollments THEN the system SHALL filter by academic year to show only relevant records

### Requirement 3: Promotion Transaction Integrity

**User Story:** As a school administrator, I want the promotion process to be atomic and reversible, so that data integrity is maintained and errors can be corrected.

#### Acceptance Criteria

1. WHEN the promotion process executes THEN the system SHALL perform all database operations within a single transaction
2. IF any operation fails during promotion THEN the system SHALL roll back all changes and return to the previous state
3. WHEN the promotion completes THEN the system SHALL provide a detailed report of all successful and failed operations
4. THE system SHALL log all promotion operations with timestamps and user information
5. WHEN a promotion fails THEN the system SHALL provide clear error messages indicating the cause

### Requirement 4: Capacity Conflict Detection

**User Story:** As a school administrator, I want to be notified of capacity conflicts before they occur, so that I can make informed decisions about student placement.

#### Acceptance Criteria

1. WHEN the promotion process analyzes target classes THEN the system SHALL calculate the total number of incoming students (promoted + retained)
2. WHEN a target class would exceed capacity THEN the system SHALL identify it as a capacity conflict
3. WHEN capacity conflicts exist THEN the system SHALL generate a detailed conflict report showing:
   - Class name and current capacity
   - Number of promoted students incoming
   - Number of retained students already enrolled
   - Total overflow count
4. THE system SHALL NOT proceed with promotion IF unresolved capacity conflicts exist
5. WHEN displaying conflict reports THEN the system SHALL sort classes by overflow severity (highest first)

### Requirement 5: Manual Conflict Resolution

**User Story:** As a school administrator, I want to manually resolve capacity conflicts, so that I can make strategic decisions about class composition and student placement.

#### Acceptance Criteria

1. WHEN capacity conflicts are detected THEN the system SHALL present a conflict resolution interface
2. WHEN resolving conflicts THEN the admin SHALL be able to:
   - View all students involved in the conflict
   - Manually reassign overflow students to alternative classes
   - Mark specific students for retention in their current grade
   - Adjust class capacities if needed
3. WHEN all conflicts are resolved THEN the system SHALL allow the promotion process to proceed
4. THE system SHALL validate that all reassignments result in classes within capacity limits
5. WHEN conflicts are unresolved THEN the system SHALL prevent the promotion transaction from executing

### Requirement 6: Retention Handling

**User Story:** As a school administrator, I want to mark students for retention before promotion, so that they are correctly enrolled in classes at their current grade level for the new academic year.

#### Acceptance Criteria

1. WHEN preparing for promotion THEN the admin SHALL be able to mark students as "retained"
2. WHEN a student is marked as retained THEN the system SHALL enroll them in a class at their current grade level for the new academic year
3. WHEN calculating capacity THEN the system SHALL count retained students as occupying space in their target classes
4. THE system SHALL allow admins to review and modify retention decisions before executing promotion
5. WHEN a retained student is enrolled THEN the system SHALL set their previous enrollment status to WITHDRAWN

### Requirement 7: Admin-Controlled Execution

**User Story:** As a school administrator, I want full control over when the promotion process executes, so that I can review all data and resolve issues before making permanent changes.

#### Acceptance Criteria

1. THE system SHALL provide a single "Start Annual Promotion" button accessible only to admin users
2. WHEN the button is clicked THEN the system SHALL display a confirmation dialog with:
   - Source academic year
   - Target academic year
   - Total students to be promoted
   - Number of retained students
   - Any detected capacity conflicts
3. WHEN the admin confirms THEN the system SHALL execute the promotion transaction
4. THE system SHALL NOT allow automatic or scheduled promotion execution
5. WHEN promotion is in progress THEN the system SHALL display a progress indicator

### Requirement 8: Promotion Preview and Validation

**User Story:** As a school administrator, I want to preview the promotion results before execution, so that I can verify correctness and identify potential issues.

#### Acceptance Criteria

1. WHEN the admin initiates promotion THEN the system SHALL generate a preview report showing:
   - Each student's current class and target class
   - Retention status for each student
   - Capacity status for each target class
   - Any conflicts or warnings
2. THE system SHALL allow the admin to download the preview report as CSV or PDF
3. WHEN reviewing the preview THEN the admin SHALL be able to cancel the operation without making changes
4. THE system SHALL validate all promotion rules before allowing execution
5. WHEN validation fails THEN the system SHALL display specific error messages and prevent execution

### Requirement 9: Promotion Reporting

**User Story:** As a school administrator, I want detailed reports after promotion execution, so that I can verify results and maintain records.

#### Acceptance Criteria

1. WHEN promotion completes THEN the system SHALL generate a completion report showing:
   - Total students processed
   - Successful promotions count
   - Failed operations count
   - List of any errors or warnings
   - Execution timestamp and admin user
2. THE system SHALL store promotion reports in the database for historical reference
3. WHEN viewing reports THEN the admin SHALL be able to filter by academic year
4. THE system SHALL allow exporting reports as CSV or PDF
5. WHEN errors occur THEN the report SHALL include student names and specific error messages

### Requirement 10: Grade Progression Rules

**User Story:** As a school administrator, I want the system to follow Indonesian school grade progression rules, so that students are promoted to the correct grade levels.

#### Acceptance Criteria

1. WHEN promoting from Grade 10 (X) THEN the system SHALL target Grade 11 (XI) classes
2. WHEN promoting from Grade 11 (XI) THEN the system SHALL target Grade 12 (XII) classes
3. WHEN promoting from Grade 12 (XII) THEN the system SHALL mark students as graduated and NOT create new enrollments
4. THE system SHALL validate that target classes match the next grade level
5. WHEN a student's current grade is invalid THEN the system SHALL flag them for manual review

## Non-Functional Requirements

### Performance

- The promotion process SHALL complete within 5 minutes for up to 1000 students
- The preview report SHALL generate within 10 seconds
- The conflict resolution interface SHALL respond within 2 seconds

### Security

- Only users with ADMIN role SHALL access the promotion functionality
- All promotion operations SHALL be logged with user identification
- The system SHALL require confirmation before executing irreversible operations

### Usability

- The promotion interface SHALL provide clear instructions at each step
- Error messages SHALL be specific and actionable
- The system SHALL prevent accidental execution through confirmation dialogs

### Data Integrity

- All promotion operations SHALL be atomic (all-or-nothing)
- The system SHALL maintain referential integrity across all tables
- Historical enrollment data SHALL remain unchanged during promotion
