# Implementation Plan

- [x] 1. Set up project infrastructure and database
- [x] 1.1 Install and configure required dependencies

  - Install Prisma, NextAuth.js v5, next-intl, Zod, Vitest, fast-check
  - Configure TypeScript paths and aliases
  - Set up environment variables structure (.env.local, .env.example)
  - Add DATABASE_URL for Supabase connection string
  - _Requirements: All_

- [x] 1.2 Create Prisma schema with all models

  - Define User, Class, GradingPolicy, Enrollment, Assignment, Grade, FinalGrade models
  - Define Announcement, Notification models
  - Define Exam, Question, ExamSubmission, QuestionResponse models
  - Set up relationships and constraints (unique, foreign keys, cascades)
  - _Requirements: 1.1, 2.1, 3.2, 5.1, 7.1, 10.1, 12.1, 13.1_

- [x] 1.3 Initialize database and run migrations

  - Set up Supabase PostgreSQL database connection (obtain connection string from Supabase project)
  - Configure DATABASE_URL environment variable with Supabase connection string
  - Run initial Prisma migration
  - Create seed script for initial data (admin user, sample grading policies)
  - _Requirements: All_

- [x] 1.4 Configure NextAuth.js for authentication

  - Set up NextAuth.js v5 configuration with credentials provider
  - Configure JWT strategy with role-based claims
  - Create auth middleware for route protection
  - Set up session management
  - _Requirements: 10.1, 10.2, 10.4, 11.1_

- [x] 1.5 Set up internationalization with next-intl

  - Configure next-intl middleware
  - Create translation files for English and Bahasa Indonesia
  - Set up locale detection and routing
  - _Requirements: 16.1, 16.2, 16.3_

- [ ] 2. Implement authentication and user management
- [ ] 2.1 Create authentication service layer

  - Implement password hashing with bcrypt
  - Create login function with credential validation
  - Create session management functions
  - Implement password complexity validation
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [x]\* 2.2 Write property test for authentication

  - **Property 33: Valid credentials succeed, invalid fail**
  - **Validates: Requirements 10.1**

- [x]\* 2.3 Write property test for password complexity

  - **Property 37: Password complexity is enforced**
  - **Validates: Requirements 10.5**

- [x] 2.4 Create login page and form component

  - Build LoginForm component with email/password fields
  - Implement client-side validation with Zod
  - Add error message display
  - Implement redirect logic based on user role
  - _Requirements: 10.1, 10.3_

- [x] 2.5 Implement user management service layer

  - Create user CRUD operations (create, read, update, deactivate)
  - Implement email uniqueness validation
  - Add user listing with role filtering
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]\* 2.6 Write property tests for user management

  - **Property 1: User creation assigns correct role**
  - **Property 2: User updates persist correctly**
  - **Property 4: Email uniqueness is enforced**
  - **Validates: Requirements 1.1, 1.2, 1.5**

- [ ]\* 2.7 Write property test for deactivated users

  - **Property 3: Deactivated users cannot authenticate**
  - **Validates: Requirements 1.3**

- [ ] 2.8 Create user management UI components (Admin)

  - Build UserList component with table and filters
  - Create UserForm component for create/edit
  - Add user deactivation confirmation dialog
  - Implement Server Actions for user operations
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 3. Implement role-based access control and layouts
- [ ] 3.1 Create authorization middleware and utilities

  - Implement role checking functions
  - Create route protection middleware
  - Add resource ownership verification helpers
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]\* 3.2 Write property tests for authorization

  - **Property 38: Role-based access control**
  - **Property 39: Role hierarchy is enforced**
  - **Property 40: Admins have full access**
  - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**

- [ ] 3.3 Create role-specific layout components

  - Build AdminLayout with navigation for users, classes, reports
  - Build TeacherLayout with navigation for classes, gradebook, exams
  - Build StudentLayout with navigation for classes, grades, notifications
  - Add role-based route guards
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 3.4 Create dashboard pages for each role

  - Admin dashboard with system overview
  - Teacher dashboard with class list
  - Student dashboard with enrolled classes
  - _Requirements: 4.1, 6.1_

- [ ] 4. Implement grading policy management
- [ ] 4.1 Create grading policy service layer

  - Implement CRUD operations for grading policies
  - Create grade calculation function (numeric to letter)
  - Add GPA calculation logic
  - _Requirements: 5a.1, 5a.2, 5a.3, 5a.4_

- [ ]\* 4.2 Write property test for grading policy

  - **Property 17a: Grading policy consistency**
  - **Validates: Requirements 5a.3**

- [ ] 4.3 Create grading policy UI components (Admin)

  - Build GradingPolicyList component
  - Create GradingPolicyForm with scale editor
  - Add policy assignment to classes
  - _Requirements: 5a.1, 5a.2, 5a.3_

- [ ] 5. Implement class management
- [ ] 5.1 Create class service layer

  - Implement class CRUD operations
  - Add class code uniqueness validation
  - Create teacher assignment validation
  - Implement class deletion with enrollment cleanup
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ]\* 5.2 Write property tests for class management

  - **Property 5: Class creation requires all mandatory fields**
  - **Property 6: Only active teachers can be assigned to classes**
  - **Property 9: Class code uniqueness**
  - **Validates: Requirements 2.1, 2.2, 2.5**

- [ ]\* 5.3 Write property test for class deletion

  - **Property 8: Class deletion removes enrollments but preserves grades**
  - **Validates: Requirements 2.4**

- [ ] 5.4 Create class management UI components (Admin)

  - Build ClassList component with filters
  - Create ClassForm component with teacher dropdown
  - Add capacity and grading policy selection
  - Implement delete confirmation with warning
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ] 5.5 Create class roster component (Teacher)

  - Build ClassRoster component showing enrolled students
  - Display student name, enrollment date, current grade
  - Add real-time enrollment updates
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]\* 5.6 Write property tests for class roster

  - **Property 15: Teachers see only their assigned classes**
  - **Property 16: Roster completeness**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 6. Implement student enrollment
- [ ] 6.1 Create enrollment service layer

  - Implement enrollment creation with validation
  - Add duplicate enrollment prevention
  - Create withdrawal functionality
  - Implement capacity checking
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]\* 6.2 Write property tests for enrollment

  - **Property 10: Students see only open classes**
  - **Property 11: Enrollment creates correct associations**
  - **Property 12: Duplicate enrollment prevention**
  - **Property 13: Withdrawal updates enrollment status**
  - **Property 14: Capacity limits are enforced**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

- [ ] 6.3 Create enrollment UI components (Student)

  - Build AvailableClasses component with enrollment button
  - Create MyClasses component with withdrawal option
  - Add capacity display and enrollment confirmation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 7. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement gradebook and grade management
- [ ] 8.1 Create assignment service layer

  - Implement assignment CRUD operations
  - Add assignment type and weight validation
  - Create assignment listing by class
  - _Requirements: 5.1_

- [ ] 8.2 Create grade service layer

  - Implement grade entry with validation
  - Add grade update functionality
  - Create grade calculation using grading policy
  - Implement final grade calculation (weighted average)
  - Add authorization checks (teacher can only grade their students)
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ]\* 8.3 Write property tests for gradebook

  - **Property 17: Grade format validation**
  - **Property 18: Grade updates replace previous values**
  - **Property 19: Gradebook shows all enrolled students**
  - **Property 20: Teachers can only grade their own students**
  - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [ ]\* 8.4 Write property test for final grade calculation

  - **Property 53a: Final grade calculation**
  - **Validates: Requirements 5.2**

- [ ] 8.5 Create gradebook UI components (Teacher)

  - Build GradebookView component with student/assignment grid
  - Create GradeInput component with inline editing
  - Add assignment management (create, edit, delete)
  - Implement auto-save with debouncing
  - Display final grades with letter/GPA
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8.6 Create student grade view components

  - Build StudentGrades component showing all classes
  - Display grades by assignment with final grade
  - Show pending indicator for ungraded work
  - Add real-time grade updates
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]\* 8.7 Write property tests for student grade view

  - **Property 21: Students see only their own grades**
  - **Property 22: Grade updates are immediately visible**
  - **Property 23: Grade display completeness**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ] 9. Implement exam management
- [ ] 9.1 Create exam service layer

  - Implement exam CRUD operations
  - Add question management (add, edit, delete, reorder)
  - Create exam publishing logic
  - Implement published exam immutability check
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]\* 9.2 Write property tests for exam management

  - **Property 42: Exam creation requires mandatory fields**
  - **Property 43: Question data persistence**
  - **Property 44: Published exams are visible to enrolled students**
  - **Property 45: Unpublished exams are mutable**
  - **Property 46: Published exams with submissions are immutable**
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**

- [ ] 9.3 Create exam management UI components (Teacher)

  - Build ExamList component with create/edit/publish actions
  - Create ExamForm component with question builder
  - Add question reordering functionality
  - Implement publish confirmation dialog
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 10. Implement exam taking and submission
- [ ] 10.1 Create exam submission service layer

  - Implement exam submission creation
  - Add late submission detection
  - Create duplicate submission prevention
  - Add response saving functionality
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ]\* 10.2 Write property tests for exam taking

  - **Property 47: Students see only their class exams**
  - **Property 49: Submission finality**
  - **Property 50: Late submissions are marked**
  - **Property 12: Duplicate enrollment prevention (applies to exam submissions)**
  - **Validates: Requirements 13.1, 13.3, 13.4, 13.5**

- [ ] 10.3 Create exam taking UI components (Student)

  - Build ExamList component showing available exams
  - Create ExamTaking component with question display
  - Add response input fields with auto-save
  - Implement due date timer
  - Add submission confirmation dialog
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 11. Implement exam grading
- [ ] 11.1 Create exam grading service layer

  - Implement submission grading functionality
  - Add individual question scoring
  - Create total score calculation
  - Implement gradebook integration (create Grade for Assignment)
  - Add graded/ungraded filtering
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ]\* 11.2 Write property tests for exam grading

  - **Property 51: Teachers see only their class submissions**
  - **Property 52: Individual question grading**
  - **Property 53: Total score calculation and gradebook integration**
  - **Property 54: Graded and ungraded submissions are separated**
  - **Property 55: Partial credit support**
  - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**

- [ ] 11.3 Create exam grading UI components (Teacher)

  - Build ExamSubmissionList component with graded/ungraded tabs
  - Create ExamGrading component with question-by-question scoring
  - Add feedback textarea per question
  - Implement auto-calculate total score
  - Display submission metadata (student, timestamp, late status)
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 11.4 Create exam results UI components (Student)

  - Build ExamResults component showing graded submission
  - Display student responses with scores and feedback
  - Show total score, points possible, percentage
  - Add pending indicator for ungraded exams
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [ ]\* 11.5 Write property tests for exam results

  - **Property 56: Graded exam display completeness**
  - **Property 57: Score metrics display**
  - **Validates: Requirements 15.1, 15.3**

- [ ] 12. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement announcement and notification system
- [ ] 13.1 Create announcement service layer

  - Implement announcement CRUD operations
  - Add target audience validation
  - Create notification distribution logic
  - Implement teacher class restriction
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3_

- [ ]\* 13.2 Write property tests for announcements

  - **Property 24: Announcement creation requires mandatory fields**
  - **Property 25: Announcements reach all targeted users**
  - **Property 26: Announcement metadata is recorded**
  - **Property 27: Published announcements are mutable**
  - **Property 28: Teachers can only target their classes**
  - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.3**

- [ ] 13.2 Create notification service layer

  - Implement notification creation for announcements
  - Add read/unread status management
  - Create notification listing with ordering
  - Implement unread count calculation
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]\* 13.3 Write property tests for notifications

  - **Property 29: Notifications are added to recipient lists**
  - **Property 30: Notifications are ordered chronologically**
  - **Property 31: Read status updates persist**
  - **Property 32: Unread count accuracy**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [ ] 13.4 Create announcement UI components (Admin/Teacher)

  - Build AnnouncementForm component with target audience selector
  - Add role-based target restrictions
  - Implement announcement editing and deletion
  - Create announcement list view
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3_

- [ ] 13.5 Create notification UI components (Student)

  - Build NotificationList component with read/unread tabs
  - Add unread badge in navigation
  - Implement mark as read functionality
  - Display notifications in reverse chronological order
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 14. Implement reporting system
- [ ] 14.1 Create reporting service layer

  - Implement enrollment report generation
  - Create grade distribution calculation
  - Add report filtering logic (period, subject, teacher)
  - Implement CSV export functionality
  - Implement PDF export functionality
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [ ]\* 14.2 Write property tests for reporting

  - **Property 58: Enrollment report accuracy**
  - **Property 59: Grade distribution calculation**
  - **Property 60: Report filtering**
  - **Property 61: Export format correctness**
  - **Validates: Requirements 17.1, 17.2, 17.3, 17.4**

- [ ] 14.3 Create reporting UI components (Admin)

  - Build EnrollmentReport component with filters
  - Create GradeDistribution component with charts
  - Add export buttons (CSV, PDF)
  - Implement filter controls (date range, subject, teacher)
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [ ] 15. Implement internationalization features
- [ ] 15.1 Create translation files

  - Write English translations for all UI text
  - Write Bahasa Indonesia translations for all UI text
  - Organize translations by feature area
  - _Requirements: 16.2, 16.5_

- [ ] 15.2 Create language preference service layer

  - Implement user locale storage and retrieval
  - Add browser language detection
  - Create locale switching functionality
  - _Requirements: 16.1, 16.3, 16.4_

- [ ]\* 15.3 Write property tests for internationalization

  - **Property 62: Language preference persistence**
  - **Property 63: Supported languages availability**
  - **Property 64: Browser language default**
  - **Property 66: Complete translation coverage**
  - **Validates: Requirements 16.1, 16.2, 16.3, 16.5**

- [ ]\* 15.3a Write property test for immediate language switching

  - **Property 65: Immediate language switching**
  - **Validates: Requirements 16.4**

- [ ] 15.4 Create language switcher component

  - Build LanguageSwitcher component with dropdown
  - Add language selection persistence
  - Implement immediate UI update without refresh
  - _Requirements: 16.1, 16.4_

- [ ] 15.5 Apply translations to all components

  - Update all components to use translation hooks
  - Replace hardcoded text with translation keys
  - Test all UI text in both languages
  - _Requirements: 16.5_

- [ ] 16. Implement error handling and validation
- [ ] 16.1 Create error handling utilities

  - Implement error response formatting
  - Create error boundary components
  - Add database error mapping
  - Implement validation error formatting
  - _Requirements: All_

- [ ] 16.2 Add comprehensive validation

  - Create Zod schemas for all forms
  - Implement server-side validation for all inputs
  - Add field-level error display
  - Create validation error messages in both languages
  - _Requirements: All_

- [ ] 17. Final checkpoint and polish
- [ ] 17.1 Run all tests and fix any failures

  - Run unit tests
  - Run property-based tests
  - Fix any failing tests
  - Ensure all correctness properties pass
  - _Requirements: All_

- [ ] 17.2 Perform security audit

  - Verify authorization checks on all routes
  - Test role-based access control
  - Verify password hashing and session security
  - Check for SQL injection vulnerabilities
  - Test CSRF protection
  - _Requirements: 10.1, 10.5, 11.1, 11.2, 11.3_

- [ ] 17.3 Optimize performance

  - Add database indexes (Supabase supports standard PostgreSQL indexes)
  - Implement pagination where needed
  - Optimize queries with proper includes/selects
  - Test with realistic data volumes
  - Monitor Supabase dashboard for query performance
  - _Requirements: All_

- [ ] 17.4 Final integration testing
  - Test complete user flows for each role
  - Verify all features work end-to-end
  - Test error scenarios and edge cases
  - Verify internationalization works correctly
  - _Requirements: All_
