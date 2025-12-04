# Annual Class Promotion System - Implementation Tasks

## Overview

This document outlines the implementation tasks for building the Annual Class Promotion System. The system allows administrators to promote students between academic years while managing fixed class structures, handling retention, and resolving capacity conflicts.

## Implementation Plan

- [ ] 1. Database schema updates and migrations

  - Add PromotionReport model to track promotion history
  - Add indexes for performance optimization
  - _Requirements: 3.4, 9.2_

- [ ] 2. Core promotion service layer

  - [ ] 2.1 Create promotion service file structure

    - Create `lib/services/promotion-service.ts`
    - Define TypeScript interfaces for promotion data structures
    - _Requirements: 2.1, 2.2_

  - [ ] 2.2 Implement promotion preview generation

    - Fetch all active enrollments for source year
    - Calculate target classes based on grade progression
    - Identify retained students
    - Generate preview report with student-by-student breakdown
    - _Requirements: 8.1, 8.2_

  - [ ] 2.3 Implement capacity conflict detection

    - Calculate incoming students per target class (promoted + retained)
    - Compare against class capacity limits
    - Generate conflict report with overflow details
    - Sort conflicts by severity
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ] 2.4 Implement grade progression logic

    - Map source grade to target grade (X→XI, XI→XII)
    - Handle Grade 12 graduation (no new enrollment)
    - Validate grade progression rules
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 2.5 Implement retention handling

    - Process retained student list
    - Assign retained students to same-grade classes
    - Count retained students in capacity calculations
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 2.6 Implement promotion transaction execution

    - Create Prisma transaction wrapper
    - Withdraw all source year enrollments (set status to WITHDRAWN)
    - Create new enrollments for target year
    - Handle errors and rollback
    - Generate promotion report
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

  - [ ]\* 2.7 Write property test for enrollment uniqueness

    - **Property 1: Enrollment Uniqueness Per Year**
    - **Validates: Requirements 2.1, 2.3**

  - [ ]\* 2.8 Write property test for previous enrollment withdrawal

    - **Property 2: Previous Enrollment Withdrawal**
    - **Validates: Requirements 2.2**

  - [ ]\* 2.9 Write property test for capacity constraint enforcement

    - **Property 3: Capacity Constraint Enforcement**
    - **Validates: Requirements 4.2, 5.4**

  - [ ]\* 2.10 Write property test for transaction atomicity

    - **Property 4: Transaction Atomicity**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]\* 2.11 Write property test for grade progression correctness

    - **Property 5: Grade Progression Correctness**
    - **Validates: Requirements 10.1, 10.2**

  - [ ]\* 2.12 Write property test for retention grade consistency

    - **Property 6: Retention Grade Consistency**
    - **Validates: Requirements 6.2**

  - [ ]\* 2.13 Write property test for conflict detection completeness

    - **Property 7: Conflict Detection Completeness**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]\* 2.14 Write property test for historical data preservation
    - **Property 8: Historical Data Preservation**
    - **Validates: Requirements 2.4**

- [ ] 3. Server actions layer

  - [ ] 3.1 Create promotion actions file

    - Create `app/actions/promotions.ts`
    - Add admin authorization checks
    - _Requirements: 7.1, 7.4_

  - [ ] 3.2 Implement generatePromotionPreviewAction

    - Validate input parameters (academic years)
    - Call promotion service preview function
    - Return preview data or error
    - _Requirements: 8.1, 8.3_

  - [ ] 3.3 Implement processAnnualPromotionAction

    - Validate admin permissions
    - Validate conflict resolutions
    - Call promotion service execution function
    - Return result with report ID
    - _Requirements: 3.1, 7.1, 7.3_

  - [ ]\* 3.4 Write unit tests for server actions
    - Test authorization checks
    - Test input validation
    - Test error handling
    - _Requirements: 7.1, 8.4_

- [ ] 4. UI Components - Promotion Wizard

  - [ ] 4.1 Create promotion wizard component

    - Create `components/admin/promotion-wizard.tsx`
    - Implement multi-step wizard UI
    - Add step navigation (Preview → Resolve Conflicts → Execute)
    - _Requirements: 7.2, 8.1_

  - [ ] 4.2 Implement Step 1: Configuration and Preview

    - Input fields for source and target academic years
    - "Generate Preview" button
    - Display loading state during preview generation
    - _Requirements: 7.2, 8.1_

  - [ ] 4.3 Implement Step 2: Preview Report Display

    - Table showing all students with current and target classes
    - Summary statistics (total students, retained, conflicts)
    - Highlight capacity conflicts in red
    - Download preview as CSV button
    - "Proceed" or "Cancel" buttons
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 4.4 Implement Step 3: Conflict Resolution Interface

    - Display list of classes with capacity conflicts
    - For each conflict, show:
      - Class name and capacity
      - Overflow count
      - List of affected students
    - Allow manual reassignment of overflow students to other classes
    - Validate that reassignments don't create new conflicts
    - "Resolve All Conflicts" validation
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 4.5 Implement Step 4: Confirmation and Execution

    - Display final summary before execution
    - Confirmation dialog with warnings
    - "Execute Promotion" button
    - Progress indicator during execution
    - _Requirements: 7.2, 7.3, 7.5_

  - [ ] 4.6 Implement Step 5: Results Display
    - Show promotion completion report
    - Display success/failure counts
    - List any errors with student names
    - Download report as PDF/CSV
    - "Close" button to exit wizard
    - _Requirements: 9.1, 9.4_

- [ ] 5. UI Components - Retention Management

  - [ ] 5.1 Create retention management component

    - Create `components/admin/retention-manager.tsx`
    - Display list of all students for source year
    - Checkbox to mark students as "retained"
    - Search and filter functionality
    - _Requirements: 6.1, 6.4_

  - [ ] 5.2 Integrate retention manager into promotion wizard
    - Add retention selection step before preview
    - Pass retained student IDs to preview generation
    - Display retained students differently in preview
    - _Requirements: 6.1, 6.3_

- [ ] 6. UI Components - Promotion Reports

  - [ ] 6.1 Create promotion reports list component

    - Create `components/admin/promotion-reports-list.tsx`
    - Display historical promotion reports
    - Filter by academic year
    - Show execution date, admin user, and summary stats
    - _Requirements: 9.2, 9.3_

  - [ ] 6.2 Create promotion report detail component
    - Create `components/admin/promotion-report-detail.tsx`
    - Display full report details
    - Show all errors and warnings
    - Export functionality (CSV/PDF)
    - _Requirements: 9.1, 9.4, 9.5_

- [ ] 7. Admin page integration

  - [ ] 7.1 Create promotion management page

    - Create `app/admin/promotions/page.tsx`
    - Add "Start Annual Promotion" button
    - Display promotion wizard when clicked
    - Show list of historical promotion reports
    - _Requirements: 7.1, 9.2_

  - [ ] 7.2 Add navigation menu item
    - Add "Annual Promotion" to admin sidebar
    - Add appropriate icon
    - _Requirements: 7.1_

- [ ] 8. Validation and error handling

  - [ ] 8.1 Implement input validation

    - Validate academic year format (YYYY/YYYY)
    - Ensure source and target years are different
    - Check that target year is one year after source
    - _Requirements: 8.4_

  - [ ] 8.2 Implement conflict validation

    - Verify all capacity conflicts are resolved
    - Validate reassignment targets exist and have capacity
    - Prevent circular reassignments
    - _Requirements: 5.4, 5.5_

  - [ ] 8.3 Implement error recovery
    - Handle database transaction failures
    - Provide clear error messages to users
    - Log all errors for debugging
    - _Requirements: 3.2, 3.5_

- [ ] 9. Testing and validation

  - [ ]\* 9.1 Write integration tests

    - Test complete promotion workflow
    - Test with realistic school data
    - Test edge cases (empty classes, graduating class)
    - _Requirements: All_

  - [ ]\* 9.2 Write unit tests for UI components

    - Test wizard navigation
    - Test conflict resolution logic
    - Test report display
    - _Requirements: 7.2, 8.1, 9.1_

  - [ ] 9.3 Manual testing checklist
    - Test with small dataset (10 students)
    - Test with large dataset (500+ students)
    - Test capacity conflict scenarios
    - Test retention scenarios
    - Test error scenarios
    - Test concurrent access
    - _Requirements: All_

- [ ] 10. Documentation

  - [ ] 10.1 Create user guide

    - Document step-by-step promotion process
    - Include screenshots
    - Explain conflict resolution strategies
    - _Requirements: All_

  - [ ] 10.2 Create admin training materials
    - Best practices for annual promotion
    - Common issues and solutions
    - Troubleshooting guide
    - _Requirements: All_

- [ ] 11. Final checkpoint
  - Ensure all tests pass
  - Verify all requirements are met
  - Review code for security issues
  - Ask user if questions arise

## Notes

- The promotion process is intentionally manual and admin-controlled to prevent accidental data changes
- All database operations must be within transactions to ensure data integrity
- The system prioritizes safety over automation - admins must explicitly resolve all conflicts
- Historical enrollment data is never modified, only new records are created
- The promotion wizard should guide admins through each step with clear instructions and warnings
