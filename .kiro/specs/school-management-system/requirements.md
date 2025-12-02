# Requirements Document

## Introduction

The School Management System is a full-stack web application designed to facilitate the administration and operation of educational institutions. The system enables role-based access control for administrators, teachers, and students, providing functionality for class enrollment, grade management, and institutional communications. The system aims to streamline academic operations by centralizing student enrollment, grade tracking, and announcement distribution in a single platform.

## Glossary

- **System**: The School Management System web application
- **Admin**: A user with administrative privileges who can manage users, classes, and system-wide settings
- **Teacher**: A user who can manage assigned classes, record grades, and view enrolled students
- **Student**: A user who can enroll in classes, view grades, and receive notifications
- **Class**: An academic course offering with an assigned teacher and enrolled students
- **Class Code**: A unique identifier for a class (e.g., "MATH101-FALL24")
- **Subject**: An academic discipline or area of study associated with a class
- **Gradebook**: A record-keeping component where teachers enter and manage student scores for assignments
- **Assignment**: A graded component of a class (exam, homework, project, etc.) with a point value and weight
- **Enrollment**: The association between a student and a class
- **Notification**: A system-generated or user-created announcement distributed to specified user groups
- **Score**: A numeric or letter grade value assigned to a student for an assignment
- **Final Grade**: The calculated overall grade for a student in a class based on all assignment scores
- **Grading Policy**: A configuration defining how numeric scores map to letter grades and GPA values
- **Exam**: An assessment created by a teacher with questions and point values
- **Exam Submission**: A student's completed responses to an exam
- **Question**: An individual assessment item within an exam with an associated point value
- **Locale**: A language and region setting (e.g., "en" for English, "id" for Bahasa Indonesia)
- **User Preference**: A user-specific setting including language preference

## Requirements

### Requirement 1

**User Story:** As an admin, I want to manage user accounts for all roles, so that I can control access to the system and maintain accurate user records.

#### Acceptance Criteria

1. WHEN an admin creates a new user account, THE System SHALL validate the required fields and assign the specified role
2. WHEN an admin updates user information, THE System SHALL persist the changes and maintain data integrity
3. WHEN an admin deactivates a user account, THE System SHALL prevent that user from accessing the system while preserving historical data
4. WHEN an admin views the user list, THE System SHALL display all users with their roles and status
5. THE System SHALL enforce unique email addresses across all user accounts

### Requirement 2

**User Story:** As an admin, I want to create and manage classes with assigned subjects and teachers, so that the academic structure is properly organized.

#### Acceptance Criteria

1. WHEN an admin creates a class, THE System SHALL require a unique class code, name, subject, teacher assignment, and grading policy
2. WHEN an admin assigns a teacher to a class, THE System SHALL verify the user has a teacher role and active status
3. WHEN an admin updates class information, THE System SHALL notify affected teachers and enrolled students
4. WHEN an admin deletes a class, THE System SHALL remove all associated enrollments and preserve grade history
5. THE System SHALL prevent duplicate class codes system-wide

### Requirement 3

**User Story:** As a student, I want to enroll in available classes, so that I can participate in courses and receive grades.

#### Acceptance Criteria

1. WHEN a student views available classes, THE System SHALL display classes that are open for enrollment
2. WHEN a student enrolls in a class, THE System SHALL create an enrollment record and associate the student with that class
3. WHEN a student attempts to enroll in a class they are already enrolled in, THE System SHALL prevent duplicate enrollment
4. WHEN a student withdraws from a class, THE System SHALL remove the enrollment and mark grades as withdrawn
5. THE System SHALL enforce enrollment capacity limits when specified for a class

### Requirement 4

**User Story:** As a teacher, I want to view students enrolled in my classes, so that I can manage my class roster and record grades.

#### Acceptance Criteria

1. WHEN a teacher views their assigned classes, THE System SHALL display only classes where they are the assigned teacher
2. WHEN a teacher selects a class, THE System SHALL display all currently enrolled students
3. WHEN a student enrolls in or withdraws from a class, THE System SHALL update the class roster immediately
4. THE System SHALL display student information including name and enrollment date for each enrolled student

### Requirement 5

**User Story:** As a teacher, I want to create assignments and record grades for students in my classes, so that I can track student performance across multiple assessments.

#### Acceptance Criteria

1. WHEN a teacher creates an assignment, THE System SHALL require a title, type, max points, and weight percentage
2. WHEN a teacher enters a grade for a student on an assignment, THE System SHALL validate the numeric score against the max points and compute the letter grade using the class grading policy
3. WHEN a teacher updates an existing grade, THE System SHALL replace the previous value and record the modification timestamp
4. WHEN a teacher views the gradebook, THE System SHALL display all enrolled students with grades for each assignment and calculated final grades
5. THE System SHALL prevent teachers from entering grades for students not enrolled in their classes

### Requirement 5a

**User Story:** As an admin, I want to configure grading policies, so that classes can use consistent grade scales for converting numeric scores to letter grades.

#### Acceptance Criteria

1. WHEN an admin creates a grading policy, THE System SHALL require a name, type, and grade scale mappings
2. WHEN a grade scale is defined, THE System SHALL include letter grades with minimum/maximum numeric values and GPA equivalents
3. WHEN a class is assigned a grading policy, THE System SHALL use that policy to compute letter grades from numeric scores
4. THE System SHALL support multiple grading policies for different class types or departments

### Requirement 6

**User Story:** As a student, I want to view my grades for all enrolled classes, so that I can track my academic progress.

#### Acceptance Criteria

1. WHEN a student views their grades, THE System SHALL display grades only for classes in which they are enrolled
2. WHEN a teacher updates a grade, THE System SHALL reflect the change in the student's grade view immediately
3. THE System SHALL display the class name, subject, teacher name, and grade for each enrollment
4. WHEN a student has no recorded grade for a class, THE System SHALL indicate the grade as pending

### Requirement 7

**User Story:** As an admin, I want to create and distribute announcements to specific user groups, so that I can communicate important information effectively.

#### Acceptance Criteria

1. WHEN an admin creates an announcement, THE System SHALL require a title, message content, and target audience selection
2. WHEN an admin publishes an announcement, THE System SHALL deliver it to all users in the specified target groups
3. THE System SHALL support targeting announcements to all users, specific roles, or specific classes
4. WHEN an announcement is created, THE System SHALL record the creation timestamp and author
5. THE System SHALL allow admins to edit or delete announcements after publication

### Requirement 8

**User Story:** As a teacher, I want to send announcements to students in my classes, so that I can communicate class-specific information.

#### Acceptance Criteria

1. WHEN a teacher creates an announcement, THE System SHALL restrict the target audience to classes they teach
2. WHEN a teacher publishes a class announcement, THE System SHALL deliver it to all students enrolled in the selected class
3. THE System SHALL prevent teachers from sending announcements to classes they do not teach

### Requirement 9

**User Story:** As a student, I want to receive and view notifications relevant to me, so that I stay informed about important updates.

#### Acceptance Criteria

1. WHEN a notification is sent to a student, THE System SHALL add it to their notification list
2. WHEN a student views their notifications, THE System SHALL display all announcements targeted to them in reverse chronological order
3. WHEN a student marks a notification as read, THE System SHALL update the read status
4. THE System SHALL display unread notification count to the student

### Requirement 10

**User Story:** As a user, I want to authenticate securely with my credentials, so that my account and data are protected.

#### Acceptance Criteria

1. WHEN a user submits login credentials, THE System SHALL verify the email and password combination
2. WHEN authentication succeeds, THE System SHALL create a session and grant access based on the user role
3. WHEN authentication fails, THE System SHALL reject access and provide appropriate feedback without revealing whether the email exists
4. WHEN a user logs out, THE System SHALL terminate the session and require re-authentication for subsequent access
5. THE System SHALL enforce password complexity requirements including minimum length and character variety

### Requirement 11

**User Story:** As a user, I want role-based access control, so that I can only access features appropriate to my role.

#### Acceptance Criteria

1. WHEN a user accesses a protected resource, THE System SHALL verify the user has the required role
2. WHEN a student attempts to access admin or teacher features, THE System SHALL deny access
3. WHEN a teacher attempts to access admin features, THE System SHALL deny access
4. WHEN an admin accesses any feature, THE System SHALL grant access to all system functionality
5. THE System SHALL redirect unauthorized access attempts to an appropriate error page

### Requirement 12

**User Story:** As a teacher, I want to create and manage exams for my classes, so that I can assess student knowledge and performance.

#### Acceptance Criteria

1. WHEN a teacher creates an exam, THE System SHALL require a title, class association, due date, and total points
2. WHEN a teacher adds questions to an exam, THE System SHALL store the question text, point value, and question type
3. WHEN a teacher publishes an exam, THE System SHALL make it available to all enrolled students in the associated class
4. WHEN a teacher updates an unpublished exam, THE System SHALL save the changes without affecting student access
5. THE System SHALL prevent teachers from modifying published exams that have student submissions

### Requirement 13

**User Story:** As a student, I want to take exams assigned to my classes, so that I can demonstrate my understanding and receive grades.

#### Acceptance Criteria

1. WHEN a student views available exams, THE System SHALL display only exams for classes in which they are enrolled
2. WHEN a student starts an exam, THE System SHALL display all questions and allow response entry
3. WHEN a student submits an exam, THE System SHALL record the submission timestamp and prevent further modifications
4. WHEN a student attempts to submit an exam after the due date, THE System SHALL mark the submission as late
5. THE System SHALL prevent students from submitting the same exam multiple times

### Requirement 14

**User Story:** As a teacher, I want to grade student exam submissions, so that I can provide scores and feedback.

#### Acceptance Criteria

1. WHEN a teacher views exam submissions, THE System SHALL display all student submissions for exams in their classes
2. WHEN a teacher grades a submission, THE System SHALL allow scoring individual questions and adding feedback comments
3. WHEN a teacher completes grading, THE System SHALL calculate the total score and update the gradebook automatically
4. WHEN a teacher views ungraded submissions, THE System SHALL display them separately from graded submissions
5. THE System SHALL support partial credit scoring for individual questions

### Requirement 15

**User Story:** As a student, I want to view my graded exam results, so that I can review my performance and learn from feedback.

#### Acceptance Criteria

1. WHEN a student views a graded exam, THE System SHALL display their responses, scores, and teacher feedback
2. WHEN an exam is not yet graded, THE System SHALL indicate the submission is pending review
3. THE System SHALL display the total score, points possible, and percentage for graded exams
4. WHEN a teacher updates exam grades, THE System SHALL reflect the changes in the student's view immediately

### Requirement 16

**User Story:** As a user, I want to use the system in my preferred language, so that I can understand and interact with the interface effectively.

#### Acceptance Criteria

1. WHEN a user selects a language preference, THE System SHALL store the preference and display all interface text in that language
2. THE System SHALL support English and Bahasa Indonesia as available languages
3. WHEN a user has not set a language preference, THE System SHALL use the browser's language setting as default
4. WHEN a user changes their language preference, THE System SHALL update all displayed text immediately without requiring a page refresh
5. THE System SHALL translate all UI elements, form labels, buttons, error messages, and system notifications

### Requirement 17

**User Story:** As an admin, I want to view system-wide reports on enrollment and grades, so that I can monitor institutional performance.

#### Acceptance Criteria

1. WHEN an admin requests an enrollment report, THE System SHALL display total enrollments per class
2. WHEN an admin requests a grade distribution report, THE System SHALL calculate and display grade statistics per class
3. THE System SHALL allow admins to filter reports by academic period, subject, or teacher
4. THE System SHALL export report data in common formats including CSV and PDF
