# Bulk Enrollment Features

This document describes the bulk enrollment functionality available in the school management system.

## Features Implemented

### 1. Multi-Student Enrollment

**Location:** Admin > Enrollments > "Enroll Students" button

**Features:**

- Select multiple students at once using checkboxes
- Search functionality to filter students by name or email
- "Select All" option to quickly select all visible students
- Shows count of selected students
- Displays capacity information for classes
- Prevents enrollment if class is at full capacity
- Validates that students can only be in one class cohort per academic year
- Shows detailed results after enrollment (successful, failed counts)

**How to use:**

1. Navigate to Admin > Enrollments
2. Click "Enroll Students" button
3. Search and select multiple students using checkboxes
4. Select the target class cohort
5. Enter the academic year (format: YYYY/YYYY)
6. Click "Enroll X Students" button
7. Review the results showing successful and failed enrollments

### 2. Copy Enrollments from Previous Year

**Location:** Admin > Enrollments > "Bulk Operations" tab

**Features:**

- Automatically copy all active enrollments from one academic year to another
- Students are enrolled in the same class cohorts
- Skips inactive students automatically
- Shows detailed results for each student:
  - ✓ Successfully enrolled
  - ⚠ Skipped (inactive student)
  - ✗ Failed (with error reason)
- Summary statistics (total, successful, failed, skipped)

**How to use:**

1. Navigate to Admin > Enrollments
2. Click on "Bulk Operations" tab
3. Enter the source academic year (e.g., 2023/2024)
4. Enter the target academic year (e.g., 2024/2025)
5. Click "Copy Enrollments" button
6. Review the detailed results for each student

**Use Cases:**

- Start of new academic year: Copy all students from previous year
- Promote students to next grade while keeping them in same class cohorts
- Bulk re-enrollment after system migration

## Technical Implementation

### Service Layer Functions

**`bulkCreateEnrollments(studentIds, classId, academicYear)`**

- Processes multiple student enrollments in a single operation
- Returns detailed results for each student
- Validates capacity, duplicate enrollments, and student status
- Enforces one-class-per-year rule

**`copyEnrollmentsFromPreviousYear(fromAcademicYear, toAcademicYear)`**

- Copies all active enrollments from source year to target year
- Automatically skips inactive students
- Maintains class cohort assignments
- Returns detailed results with success/failure/skip status

### Server Actions

**`bulkCreateEnrollmentsAction(studentIds, classId, academicYear)`**

- Admin-only authorization
- Calls service layer function
- Returns results with summary statistics

**`copyEnrollmentsFromPreviousYearAction(fromAcademicYear, toAcademicYear)`**

- Admin-only authorization
- Calls service layer function
- Returns detailed results for each student

## Validation Rules

1. **Student Validation:**

   - Must be an active student account
   - Cannot be enrolled in multiple classes for same academic year
   - Cannot have duplicate enrollment (same student, class, year)

2. **Class Validation:**

   - Class must exist
   - Cannot exceed class capacity
   - Must have valid academic year format (YYYY/YYYY)

3. **Academic Year Validation:**
   - Must follow format YYYY/YYYY (e.g., 2024/2025)
   - Source and target years must be different (for copy operation)

## Error Handling

The system provides clear error messages for:

- Invalid student (not found or not a student role)
- Inactive student account
- Class not found
- Class at full capacity
- Duplicate enrollment
- Student already enrolled in another class for same year
- Invalid academic year format
- No students selected
- No enrollments found in source year

## UI Components

### EnrollmentForm

- Multi-select student list with search
- Class cohort dropdown
- Academic year input
- Real-time validation
- Success/error messaging
- Progress indicator during enrollment

### BulkEnrollmentCopy

- Source and target academic year inputs
- Copy operation with progress indicator
- Detailed results display with icons
- Summary statistics
- Individual student status (success/failed/skipped)

### EnrollmentList

- Tabbed interface:
  - "Enrollment List" tab: View and manage existing enrollments
  - "Bulk Operations" tab: Access bulk enrollment tools
- Filtering by class and status
- Individual enrollment management (withdraw, delete)

## Benefits

1. **Time Savings:** Enroll dozens or hundreds of students in seconds instead of one-by-one
2. **Accuracy:** Automated validation prevents common enrollment errors
3. **Transparency:** Detailed results show exactly what happened with each student
4. **Flexibility:** Choose between manual multi-select or automatic year-to-year copy
5. **Safety:** Inactive students are automatically skipped, preventing invalid enrollments
6. **Audit Trail:** All enrollments are tracked with timestamps and status

## Future Enhancements (Optional)

- CSV import for bulk enrollment
- Excel file upload support
- Bulk enrollment by grade level
- Scheduled automatic enrollment copying
- Email notifications for enrollment confirmations
- Bulk enrollment templates
