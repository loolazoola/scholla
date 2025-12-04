# Bulk Enrollment User Guide

## Quick Start Guide for Administrators

### Method 1: Enroll Multiple Students Manually

**When to use:** You want to enroll specific students into a class cohort.

**Steps:**

1. **Navigate to Enrollments**

   - Log in as Admin
   - Go to Admin > Enrollments

2. **Open Enrollment Form**

   - Click the "Enroll Students" button (top right)

3. **Select Students**

   - Use the search box to find students by name or email
   - Check the boxes next to students you want to enroll
   - Or click "Select All" to select all visible students
   - The badge shows how many students are selected

4. **Choose Class Cohort**

   - Select the target class from the dropdown
   - You'll see capacity information (e.g., "25/30 students")
   - If class is full, you cannot proceed

5. **Enter Academic Year**

   - Type the academic year in format: YYYY/YYYY
   - Example: 2024/2025

6. **Submit**
   - Click "Enroll X Students" button
   - Wait for the process to complete
   - Review the results showing successful and failed enrollments

**Example Result:**

```
✓ Successfully enrolled 25 students
✗ 2 failed
  - John Doe: Student is already enrolled in Class 7A for 2024/2025
  - Jane Smith: Class is at full capacity
```

---

### Method 2: Copy Enrollments from Previous Year

**When to use:** Start of new academic year, you want to automatically enroll all students from last year into the same classes.

**Steps:**

1. **Navigate to Bulk Operations**

   - Log in as Admin
   - Go to Admin > Enrollments
   - Click on "Bulk Operations" tab

2. **Enter Academic Years**

   - **From Academic Year:** Enter the previous year (e.g., 2023/2024)
   - **To Academic Year:** Enter the new year (e.g., 2024/2025)

3. **Copy Enrollments**

   - Click "Copy Enrollments" button
   - Wait for the process to complete (may take a few seconds for large numbers)

4. **Review Results**
   - See summary statistics:
     - ✓ Successful enrollments
     - ✗ Failed enrollments
     - ⚠ Skipped (inactive students)
   - Scroll through detailed results for each student

**Example Result:**

```
Copy Complete
✓ 150 students enrolled successfully
✗ 5 enrollments failed
⚠ 3 students skipped (inactive)

Detailed Results:
✓ Ahmad Rizki - Class 7A
✓ Siti Nurhaliza - Class 7A
⚠ Budi Santoso - Class 7B (inactive)
✗ Dewi Lestari - Class 7C (already enrolled in Class 8A for 2024/2025)
...
```

---

## Common Scenarios

### Scenario 1: New Academic Year Setup

**Goal:** Enroll all students from 2023/2024 into 2024/2025

**Solution:** Use Method 2 (Copy from Previous Year)

- This automatically enrolls all active students
- Maintains their class cohort assignments
- Skips inactive students

### Scenario 2: Mid-Year Transfer Students

**Goal:** Enroll 5 new transfer students into Class 7A

**Solution:** Use Method 1 (Manual Multi-Select)

- Search for the new students
- Select all 5 students
- Choose Class 7A
- Enter current academic year

### Scenario 3: Class Reorganization

**Goal:** Move 15 students from Class 7A to Class 7B

**Solution:**

1. First, withdraw the 15 students from Class 7A (use Enrollment List)
2. Then use Method 1 to enroll them into Class 7B

### Scenario 4: Grade Promotion

**Goal:** Promote all Grade 7 students to Grade 8 classes

**Solution:** Use Method 2 with careful planning

- Ensure Grade 8 class cohorts are created first
- Copy enrollments from previous year
- Note: Students will be enrolled in same class names (e.g., 7A → 7A)
- If you need different class assignments, use Method 1 instead

---

## Tips and Best Practices

### ✅ Do's

1. **Verify class capacity** before bulk enrollment
2. **Check academic year format** (YYYY/YYYY)
3. **Review results carefully** after bulk operations
4. **Use search** to find specific students quickly
5. **Test with small groups** first before large bulk operations
6. **Keep students active** if they should be enrolled

### ❌ Don'ts

1. **Don't enroll inactive students** - they'll be automatically skipped
2. **Don't exceed class capacity** - system will prevent this
3. **Don't enroll same student twice** - system will prevent duplicate enrollments
4. **Don't use wrong year format** - must be YYYY/YYYY
5. **Don't enroll students in multiple classes** - one class per academic year only

---

## Troubleshooting

### Problem: "Student is already enrolled in another class"

**Cause:** Student can only be in one class cohort per academic year
**Solution:** Withdraw student from current class first, then enroll in new class

### Problem: "Class is at full capacity"

**Cause:** Class has reached maximum capacity
**Solution:**

- Increase class capacity in Class Cohort settings
- Or enroll students in a different class

### Problem: "Student is inactive"

**Cause:** Student account is deactivated
**Solution:** Activate the student account in User Management first

### Problem: "No enrollments found for [year]"

**Cause:** No active enrollments exist in the source year
**Solution:** Verify the academic year format and that enrollments exist

### Problem: Some students failed during bulk copy

**Cause:** Various reasons (inactive, already enrolled, capacity)
**Solution:** Review the detailed results to see specific error for each student

---

## Validation Rules Reference

### Student Requirements

- Must have STUDENT role
- Must be active (not deactivated)
- Cannot be enrolled in multiple classes for same academic year
- Cannot have duplicate enrollment

### Class Requirements

- Must exist in the system
- Cannot exceed capacity limit
- Must have valid academic year

### Academic Year Format

- Must be: YYYY/YYYY
- Example: 2024/2025
- Source and target years must be different (for copy operation)

---

## Support

If you encounter issues not covered in this guide:

1. Check the error message for specific details
2. Verify all validation rules are met
3. Contact system administrator
4. Check system logs for technical details
