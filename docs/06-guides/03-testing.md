---
title: Testing Guide
description: Testing strategies, manual procedures, and quality assurance for the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Testing Guide

## Overview

This guide outlines comprehensive testing strategies and procedures for the Brain Log App. Since the application currently relies on manual testing (no automated testing framework is installed), this document focuses on systematic manual testing procedures while providing recommendations for future test automation implementation.

## Current Testing Approach

The Brain Log App currently uses **manual testing** with systematic procedures to ensure quality and reliability. This approach includes:

- **Manual API Testing** - Using curl, Postman, or browser dev tools
- **Manual UI Testing** - Systematic browser testing across features
- **Integration Testing** - End-to-end workflow validation
- **Database Testing** - Data integrity and migration validation
- **Security Testing** - Authentication and authorization validation

## Manual Testing Framework

### Testing Levels

#### 1. Unit-Level Testing
Manual verification of individual components and functions.

#### 2. Integration Testing
Testing component interactions and API integrations.

#### 3. System Testing
End-to-end testing of complete user workflows.

#### 4. Security Testing
Authentication, authorization, and data security validation.

## API Testing Procedures

### Authentication Testing

#### Session Management Testing
```bash
# Test 1: Valid session access
curl -X GET "http://localhost:3000/api/daily-logs" \
  -H "Cookie: next-auth.session-token=VALID_SESSION_TOKEN" \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 OK with user's daily logs

# Test 2: No session access
curl -X GET "http://localhost:3000/api/daily-logs" \
  -w "\nStatus: %{http_code}\n"

# Expected: 401 Unauthorized

# Test 3: Expired session access
curl -X GET "http://localhost:3000/api/daily-logs" \
  -H "Cookie: next-auth.session-token=EXPIRED_SESSION_TOKEN" \
  -w "\nStatus: %{http_code}\n"

# Expected: 401 Unauthorized

# Test 4: Invalid session format
curl -X GET "http://localhost:3000/api/daily-logs" \
  -H "Cookie: next-auth.session-token=invalid-token-format" \
  -w "\nStatus: %{http_code}\n"

# Expected: 401 Unauthorized
```

#### Login Flow Testing
```bash
# Test 1: Valid credentials
curl -X POST "http://localhost:3000/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=validpassword" \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 OK with redirect or session creation

# Test 2: Invalid username
curl -X POST "http://localhost:3000/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=nonexistent&password=anypassword" \
  -w "\nStatus: %{http_code}\n"

# Expected: Authentication failure

# Test 3: Invalid password
curl -X POST "http://localhost:3000/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=wrongpassword" \
  -w "\nStatus: %{http_code}\n"

# Expected: Authentication failure

# Test 4: Missing credentials
curl -X POST "http://localhost:3000/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=&password=" \
  -w "\nStatus: %{http_code}\n"

# Expected: 400 Bad Request
```

### CRUD Operations Testing

#### Daily Logs API Testing
```bash
# Setup: Get valid session token first
SESSION_TOKEN="your-valid-session-token"

# Test 1: Create daily log with valid data
curl -X POST "http://localhost:3000/api/daily-logs" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "date": "2025-01-15",
    "sleepHours": 8,
    "sleepQuality": 7,
    "morningMood": 6,
    "physicalStatus": "Rested"
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 201 Created with log data

# Test 2: Create daily log with missing required fields
curl -X POST "http://localhost:3000/api/daily-logs" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "sleepHours": 8
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 400 Bad Request with error message

# Test 3: Create duplicate daily log (same date)
curl -X POST "http://localhost:3000/api/daily-logs" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "date": "2025-01-15",
    "sleepHours": 7,
    "sleepQuality": 6
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 400 Bad Request (duplicate date)

# Test 4: Retrieve daily logs
curl -X GET "http://localhost:3000/api/daily-logs" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 OK with array of daily logs

# Test 5: Retrieve daily logs with date filter
curl -X GET "http://localhost:3000/api/daily-logs?date=2025-01-15" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 OK with specific date logs

# Test 6: Update existing daily log
curl -X PUT "http://localhost:3000/api/daily-logs" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "id": 1,
    "sleepHours": 9,
    "sleepQuality": 8
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 OK with updated log

# Test 7: Update non-existent daily log
curl -X PUT "http://localhost:3000/api/daily-logs" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "id": 99999,
    "sleepHours": 9
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 404 Not Found

# Test 8: Delete daily log
curl -X DELETE "http://localhost:3000/api/daily-logs?id=1" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 OK with success confirmation
```

#### Data Validation Testing
```bash
# Test 1: Invalid data types
curl -X POST "http://localhost:3000/api/daily-logs" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "date": "invalid-date-format",
    "sleepHours": "not-a-number",
    "sleepQuality": 15
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 400 Bad Request with validation errors

# Test 2: Boundary value testing
curl -X POST "http://localhost:3000/api/daily-logs" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "date": "2025-01-16",
    "sleepHours": -1,
    "sleepQuality": 0,
    "morningMood": 11
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 400 Bad Request for invalid ranges

# Test 3: SQL injection attempt
curl -X POST "http://localhost:3000/api/daily-logs" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "date": "2025-01-17",
    "dreams": "'; DROP TABLE User; --"
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: Safe handling, no database corruption
```

### Weekly Reflections API Testing
```bash
# Test 1: Create weekly reflection
curl -X POST "http://localhost:3000/api/weekly-reflections" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "weekStartDate": "2025-01-13",
    "weekEndDate": "2025-01-19",
    "overallMood": 7,
    "stressLevel": 5,
    "accomplishments": "Completed project milestone",
    "challenges": "Time management",
    "goalsForNextWeek": "Better sleep schedule"
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 201 Created

# Test 2: Retrieve weekly reflections
curl -X GET "http://localhost:3000/api/weekly-reflections" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 OK with reflections array

# Test 3: Create overlapping weekly reflection
curl -X POST "http://localhost:3000/api/weekly-reflections" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "weekStartDate": "2025-01-15",
    "weekEndDate": "2025-01-21",
    "overallMood": 6
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: Check business logic for overlapping weeks
```

### Insights API Testing
```bash
# Test 1: Generate daily insights
curl -X POST "http://localhost:3000/api/insights" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "type": "daily",
    "startDate": "2025-01-15",
    "endDate": "2025-01-15"
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 OK with insights data

# Test 2: Generate weekly insights
curl -X POST "http://localhost:3000/api/insights" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "type": "weekly",
    "startDate": "2025-01-13",
    "endDate": "2025-01-19"
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 OK with weekly insights

# Test 3: Generate insights with insufficient data
curl -X POST "http://localhost:3000/api/insights" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "type": "weekly",
    "startDate": "2025-12-01",
    "endDate": "2025-12-07"
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 200 OK with message about insufficient data
```

## Frontend Testing Procedures

### Component Testing

#### Authentication Components
**Test Checklist for Login Form**:

- [ ] **Form Rendering**
  - Form displays correctly on different screen sizes
  - All input fields are present and labeled
  - Submit button is visible and clickable
  - Loading states display correctly

- [ ] **Input Validation**
  - Required field validation works
  - Email format validation (if applicable)
  - Password minimum length validation
  - Error messages display clearly

- [ ] **Form Submission**
  - Valid credentials result in successful login
  - Invalid credentials show appropriate error
  - Network errors are handled gracefully
  - Loading indicator shows during submission

- [ ] **Edge Cases**
  - Form behaves correctly when JavaScript is disabled
  - Copy/paste functionality works in input fields
  - Tab navigation through form elements
  - Form remembers input on refresh (if applicable)

**Manual Testing Steps**:
```
1. Navigate to /login
2. Verify form renders correctly
3. Test each validation rule:
   - Submit empty form → Should show validation errors
   - Enter invalid username → Should show error
   - Enter valid username, invalid password → Should show authentication error
   - Enter valid credentials → Should redirect to dashboard
4. Test edge cases:
   - Very long username/password
   - Special characters in username/password
   - Copy/paste credentials
   - Back button after successful login
```

#### Daily Log Forms Testing
**Test Checklist for Morning Check-In Form**:

- [ ] **Form Components**
  - Sleep hours input accepts decimal values
  - Sleep quality slider works (1-10 range)
  - Morning mood slider updates value display
  - Physical status dropdown populates correctly
  - Dreams textarea accepts multiline input

- [ ] **Data Validation**
  - Sleep hours validation (0-24 range)
  - Quality sliders stay within bounds
  - Required fields are enforced
  - Date picker works correctly

- [ ] **Form Submission**
  - Valid data submits successfully
  - Success message displays
  - Form resets or advances to next step
  - Network errors are handled

**Manual Testing Steps**:
```
1. Navigate to daily log page
2. Test Morning Check-In form:
   - Set sleep hours to 7.5 → Should accept decimal
   - Move sleep quality slider → Value should update
   - Select physical status → Dropdown should work
   - Enter dreams text → Multiline should work
   - Submit form → Should save and proceed
3. Test validation:
   - Enter -1 sleep hours → Should show error
   - Enter 25 sleep hours → Should show error
   - Leave required fields empty → Should show validation
4. Test edge cases:
   - Very long text in dreams field
   - Special characters in text fields
   - Form submission with slow network
```

#### List Components Testing
**Test Checklist for Daily Logs List**:

- [ ] **Data Display**
  - Logs load correctly on page load
  - Date formatting is consistent
  - Data values display properly
  - Empty state shows when no logs

- [ ] **Interactions**
  - Edit buttons work correctly
  - Delete buttons work with confirmation
  - Pagination works (if implemented)
  - Sorting works (if implemented)

- [ ] **Error Handling**
  - Network errors display user-friendly messages
  - Retry mechanism works
  - Loading states are clear

**Manual Testing Steps**:
```
1. Navigate to logs list page
2. Verify data display:
   - Logs appear in correct order
   - All data fields show properly
   - Dates are formatted correctly
3. Test interactions:
   - Click edit button → Should open edit form
   - Click delete button → Should show confirmation
   - Confirm delete → Should remove log and refresh list
4. Test error conditions:
   - Disconnect network → Should show error message
   - Click retry → Should attempt to reload
```

### Navigation Testing

#### Main Navigation Testing
**Test Checklist**:

- [ ] **Navigation Links**
  - All menu items navigate correctly
  - Active page is highlighted
  - Mobile menu works on small screens
  - User menu (profile/logout) functions

- [ ] **Authentication State**
  - Logged-in users see appropriate menu items
  - Logged-out users see login/register links
  - Protected routes redirect to login

- [ ] **Responsive Behavior**
  - Menu collapses on mobile
  - Hamburger menu opens/closes correctly
  - Touch interactions work on mobile

**Manual Testing Steps**:
```
1. Test desktop navigation:
   - Click each menu item → Should navigate correctly
   - Verify active page highlighting
   - Test user menu dropdown
2. Test mobile navigation:
   - Resize browser to mobile width
   - Click hamburger menu → Should open
   - Click menu items → Should navigate and close menu
3. Test authentication states:
   - Logout → Should update menu items
   - Try accessing protected page → Should redirect to login
   - Login → Should update menu and redirect
```

### Theme and Styling Testing

#### Dark/Light Mode Testing
**Test Checklist**:

- [ ] **Theme Toggle**
  - Theme toggle button works
  - Theme persists across page refreshes
  - Theme applies immediately when changed

- [ ] **Component Theming**
  - All components support both themes
  - Text remains readable in both themes
  - Form elements style correctly
  - Charts/graphs update colors

**Manual Testing Steps**:
```
1. Start in light mode:
   - Verify all components display correctly
   - Check text contrast and readability
   - Test form inputs and buttons
2. Switch to dark mode:
   - Click theme toggle
   - Verify smooth transition
   - Check all components in dark theme
   - Test that charts update colors
3. Test persistence:
   - Refresh page → Theme should persist
   - Navigate between pages → Theme should persist
   - Open new tab → Should use saved theme
```

## Database Testing Procedures

### Migration Testing

#### Schema Migration Testing
**Test Checklist**:

- [ ] **Migration Execution**
  - Migration runs without errors
  - All tables created correctly
  - Indexes are applied properly
  - Relationships are established

- [ ] **Data Integrity**
  - Existing data is preserved
  - Foreign key constraints work
  - Data types are correct
  - Default values are applied

**Manual Testing Steps**:
```bash
# 1. Backup current database
npx prisma db push --preview-feature

# 2. Run migration
npx prisma migrate dev --name test_migration

# 3. Verify schema
npx prisma studio
# Check that all tables and relationships appear correctly

# 4. Test data operations
# Create test records to verify constraints work

# 5. Rollback test (if needed)
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

#### Data Integrity Testing
**Test Checklist**:

- [ ] **Relationship Constraints**
  - Foreign keys prevent orphaned records
  - Cascade deletes work correctly
  - Unique constraints are enforced

- [ ] **Data Validation**
  - Database-level constraints work
  - Data types are enforced
  - Length limits are respected

**Manual Testing with Prisma Studio**:
```
1. Open Prisma Studio: npx prisma studio
2. Test relationships:
   - Try to create user without required fields
   - Try to create daily log with invalid user ID
   - Delete user and verify cascade behavior
3. Test constraints:
   - Try to create duplicate usernames
   - Try to insert invalid data types
   - Verify date constraints work
```

### Performance Testing

#### Query Performance Testing
**Test Checklist**:

- [ ] **Query Efficiency**
  - Large dataset queries complete quickly
  - Indexes are being used
  - N+1 query problems are avoided

- [ ] **Database Connections**
  - Connection pooling works correctly
  - Connections are released properly
  - No memory leaks in database layer

**Manual Testing Steps**:
```bash
# 1. Check query performance
# Add console.time to API routes to measure query time

# 2. Test with larger datasets
# Create multiple users and logs to test performance

# 3. Monitor database connections
# Check Neon dashboard for connection usage

# 4. Test concurrent access
# Use multiple browser tabs to test concurrent operations
```

## Integration Testing

### End-to-End User Workflows

#### Complete Daily Log Workflow
**Test Scenario**: User completes full daily log entry

**Steps**:
```
1. User logs in
   - Navigate to /login
   - Enter credentials and submit
   - Verify redirect to dashboard

2. User starts new daily log
   - Click "New Daily Log" button
   - Verify form loads correctly
   - Check that current date is pre-selected

3. User completes morning check-in
   - Fill in sleep hours: 8
   - Set sleep quality: 7
   - Set morning mood: 6
   - Select physical status: "Rested"
   - Add breakfast: "Oatmeal and coffee"
   - Click "Next" → Should advance to next section

4. User completes medication log
   - Mark medication taken: Yes
   - Set time taken: 8:00 AM
   - Set dose: 18mg
   - Mark ate within hour: Yes
   - Describe first hour feeling: "Alert and focused"
   - Click "Next" → Should advance to mid-day section

5. User completes mid-day check-in
   - Add lunch details
   - Set focus level: 8
   - Set energy level: 7
   - Set rumination level: 3
   - Describe current activity
   - Click "Next" → Continue workflow

6. User saves and reviews
   - Complete all sections
   - Click "Save Daily Log"
   - Verify success message
   - Check that log appears in list

7. User edits existing log
   - Click "Edit" on saved log
   - Modify sleep hours to 7.5
   - Save changes
   - Verify changes are reflected
```

#### Weekly Reflection Workflow
**Test Scenario**: User creates and reviews weekly reflection

**Steps**:
```
1. User navigates to weekly reflections
   - Click "Weekly Insights" in navigation
   - Verify page loads with existing reflections

2. User creates new reflection
   - Click "New Weekly Reflection"
   - Select week date range
   - Fill in all reflection fields
   - Submit reflection

3. User views reflection
   - Verify reflection appears in list
   - Click to view details
   - Check all data is displayed correctly

4. User generates insights
   - Click "Generate Insights" button
   - Wait for AI processing
   - Verify insights are generated and displayed
```

#### User Registration and Setup Workflow
**Test Scenario**: New user registration and initial setup

**Steps**:
```
1. User registration
   - Navigate to /register
   - Fill in registration form
   - Submit and verify account creation
   - Verify automatic login

2. Initial setup
   - User is prompted for timezone
   - User sets preferences
   - User sees onboarding tour

3. First daily log
   - User creates first daily log entry
   - System guides through process
   - User completes entry successfully
```

## Security Testing

### Authentication Security Testing

#### Session Security Testing
**Test Checklist**:

- [ ] **Session Management**
  - Sessions expire correctly
  - Session tokens are secure
  - No session fixation vulnerabilities
  - Logout invalidates sessions

- [ ] **Password Security**
  - Passwords are hashed properly
  - Password reset works securely
  - No password leakage in logs
  - Rate limiting on login attempts

**Manual Testing Steps**:
```
1. Test session expiration:
   - Login and note session token
   - Wait for session to expire (or manipulate)
   - Try to access protected resource
   - Should redirect to login

2. Test logout:
   - Login and access protected resource
   - Logout
   - Try to access same resource with old token
   - Should require re-authentication

3. Test password security:
   - Check network requests for password exposure
   - Verify passwords are never logged
   - Test password complexity requirements
```

#### Authorization Testing
**Test Checklist**:

- [ ] **Resource Access**
  - Users can only access own data
  - No horizontal privilege escalation
  - No vertical privilege escalation
  - Proper error messages for unauthorized access

**Manual Testing Steps**:
```
1. Create two user accounts
2. Login as User A and note their data IDs
3. Login as User B and attempt to access User A's data:
   - Try to edit User A's daily logs
   - Try to view User A's reflections
   - Try to generate insights for User A
   - All should fail with 403 Forbidden

4. Test API endpoints directly:
   - Use User B's session token
   - Make requests for User A's resources
   - Verify all requests are rejected
```

### Input Security Testing

#### Cross-Site Scripting (XSS) Testing
**Test Checklist**:

- [ ] **Input Sanitization**
  - HTML tags are escaped in user input
  - JavaScript execution is prevented
  - URL parameters are sanitized
  - File uploads are secured (if applicable)

**Manual Testing Steps**:
```
1. Test text inputs:
   - Enter: <script>alert('XSS')</script>
   - Verify script doesn't execute
   - Check that it displays as text

2. Test text areas:
   - Enter: <img src=x onerror=alert('XSS')>
   - Verify no script execution
   - Check proper escaping

3. Test URL parameters:
   - Navigate to: /daily-log?date=<script>alert('XSS')</script>
   - Verify no script execution
```

#### SQL Injection Testing
**Test Checklist**:

- [ ] **Query Protection**
  - Parameterized queries are used
  - No dynamic SQL construction
  - Input validation prevents injection
  - Error messages don't reveal database info

**Manual Testing Steps**:
```bash
# Test through API endpoints
curl -X POST "http://localhost:3000/api/daily-logs" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d '{
    "date": "2025-01-15",
    "dreams": "Normal dream'; DROP TABLE \"User\"; --"
  }'

# Verify:
# 1. Database table still exists
# 2. Malicious input is stored as text
# 3. No database errors in logs
```

## Performance Testing

### Load Testing

#### API Endpoint Load Testing
**Test Checklist**:

- [ ] **Response Times**
  - API responses under 200ms for simple queries
  - Database queries optimized
  - No memory leaks during extended use

- [ ] **Concurrent Users**
  - Multiple users can access simultaneously
  - No race conditions in data updates
  - Session management scales properly

**Manual Testing Steps**:
```bash
# Test concurrent API requests
for i in {1..10}; do
  curl -X GET "http://localhost:3000/api/daily-logs" \
    -H "Cookie: next-auth.session-token=$SESSION_TOKEN" &
done
wait

# Check all requests succeeded and response times
```

#### Frontend Performance Testing
**Test Checklist**:

- [ ] **Page Load Times**
  - Initial page load under 3 seconds
  - Subsequent navigation is fast
  - Images and assets are optimized

- [ ] **Memory Usage**
  - No memory leaks in JavaScript
  - Efficient component rendering
  - Proper cleanup of event listeners

**Manual Testing with Browser DevTools**:
```
1. Open Chrome DevTools
2. Navigate to Performance tab
3. Record page interactions:
   - Page load
   - Form submissions
   - Navigation between pages
4. Analyze results:
   - Look for memory leaks
   - Check paint and layout times
   - Verify no long-running scripts
```

## Error Handling Testing

### API Error Handling
**Test Checklist**:

- [ ] **HTTP Status Codes**
  - Correct status codes for different errors
  - Consistent error response format
  - Helpful error messages for clients

- [ ] **Network Errors**
  - Timeout handling
  - Connection error handling
  - Rate limiting responses

**Manual Testing Steps**:
```bash
# Test various error conditions
# 1. Test with invalid JSON
curl -X POST "http://localhost:3000/api/daily-logs" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d 'invalid json'

# 2. Test with oversized request
curl -X POST "http://localhost:3000/api/daily-logs" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" \
  -d "$(printf '{"dreams":"%*s"}' 100000 "")"

# 3. Test network timeout
curl -X GET "http://localhost:3000/api/daily-logs" \
  --max-time 1 \
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

### Frontend Error Handling
**Test Checklist**:

- [ ] **User-Friendly Messages**
  - Network errors show helpful messages
  - Validation errors are clear
  - Retry mechanisms are available

- [ ] **Graceful Degradation**
  - App works with slow network
  - Partial functionality available offline
  - No crashes from API errors

**Manual Testing Steps**:
```
1. Test network errors:
   - Disconnect internet
   - Try to submit form
   - Verify error message appears
   - Reconnect and test retry

2. Test validation errors:
   - Submit invalid form data
   - Verify clear error messages
   - Fix errors and resubmit

3. Test edge cases:
   - Very slow network responses
   - Partial form completion
   - Browser back/forward buttons
```

## Browser Compatibility Testing

### Cross-Browser Testing
**Test Matrix**:

| Browser | Version | Desktop | Mobile |
|---------|---------|---------|--------|
| Chrome | Latest | ✓ | ✓ |
| Firefox | Latest | ✓ | ✓ |
| Safari | Latest | ✓ | ✓ |
| Edge | Latest | ✓ | ✓ |

**Test Checklist for Each Browser**:

- [ ] **Core Functionality**
  - Login/logout works
  - Forms submit correctly
  - Navigation functions
  - Data displays properly

- [ ] **Styling and Layout**
  - CSS renders correctly
  - Responsive design works
  - Animations function smoothly
  - Fonts load properly

- [ ] **JavaScript Functionality**
  - Interactive components work
  - Event handlers function
  - AJAX requests succeed
  - Error handling works

### Mobile Testing
**Test Checklist**:

- [ ] **Touch Interactions**
  - Buttons are easily tappable
  - Form inputs work with virtual keyboard
  - Swipe gestures work (if implemented)
  - Scroll behavior is smooth

- [ ] **Responsive Design**
  - Layout adapts to screen size
  - Text remains readable
  - Navigation works on small screens
  - Images scale appropriately

**Manual Testing Steps**:
```
1. Test on actual devices:
   - iPhone (iOS Safari)
   - Android (Chrome)
   - Tablet (both orientations)

2. Test responsive design:
   - Use browser dev tools
   - Test various screen sizes
   - Rotate device (portrait/landscape)

3. Test performance:
   - Page load on 3G/4G
   - Battery usage during extended use
   - Memory usage on mobile
