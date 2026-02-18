# How Payroll is Calculated - Technical Documentation

## 📊 Overview

Your payroll calculation system computes employee pay based on:
1. **Scheduled shifts** (start/end times)
2. **Employee hourly rates** (stored per employee)
3. **Weekly hours** (calculated from shifts)
4. **Overtime rules** (40+ hours = overtime at 1.5x rate)

---

## 🔢 Calculation Formula

### Step-by-Step Process

#### 1. **Calculate Weekly Hours**
```typescript
// From: server/services/scheduler/scheduler.service.ts
calculateWeeklyHours(employeeId, weekStartDate)
```

**Logic:**
- Finds all shifts for the employee in the week (Monday-Sunday)
- Only includes shifts with status: `SCHEDULED`, `CONFIRMED`, or `COMPLETED`
- Calculates hours per shift: `(endTime - startTime) / (1000 * 60 * 60)`
- Sums all shift hours for the week

**Example:**
```
Shift 1: 9 AM - 5 PM = 8 hours
Shift 2: 9 AM - 5 PM = 8 hours
Shift 3: 9 AM - 5 PM = 8 hours
Shift 4: 9 AM - 5 PM = 8 hours
Shift 5: 9 AM - 5 PM = 8 hours
Shift 6: 9 AM - 1 PM = 4 hours (overtime)
Total: 44 hours
```

#### 2. **Calculate Regular vs Overtime Hours**
```typescript
// From: app/api/export/payroll/route.ts (lines 41-42)
const regularHours = Math.min(weeklyHours, 40)
const overtimeHours = Math.max(0, weeklyHours - 40)
```

**Logic:**
- **Regular Hours**: Minimum of weekly hours and 40 (capped at 40)
- **Overtime Hours**: Any hours over 40 (minimum 0)

**Examples:**
```
35 hours → Regular: 35, Overtime: 0
40 hours → Regular: 40, Overtime: 0
44 hours → Regular: 40, Overtime: 4
50 hours → Regular: 40, Overtime: 10
```

#### 3. **Calculate Pay**
```typescript
// From: app/api/export/payroll/route.ts (lines 52-57)
regularPay = regularHours × hourlyRate
overtimePay = overtimeHours × hourlyRate × 1.5
totalPay = regularPay + overtimePay
```

**Overtime Rate:** 1.5x (standard US overtime rate)

**Example Calculation:**
```
Employee: John Doe
Hourly Rate: $20.00
Weekly Hours: 44 hours

Regular Hours: 40
Overtime Hours: 4

Regular Pay: 40 × $20.00 = $800.00
Overtime Pay: 4 × $20.00 × 1.5 = $120.00
Total Pay: $800.00 + $120.00 = $920.00
```

---

## 📋 Data Sources

### 1. **Employee Hourly Rate**
- **Source:** `Employee.hourlyRate` field in database
- **Type:** `Decimal(10, 2)` (allows up to $99,999,999.99)
- **Default:** `null` (treated as $0.00 if not set)
- **Location:** `prisma/schema.prisma` line 113

### 2. **Shift Data**
- **Source:** `Shift` table
- **Fields Used:**
  - `startTime` (DateTime)
  - `endTime` (DateTime)
  - `status` (SCHEDULED, CONFIRMED, COMPLETED)
  - `employeeId` (links to Employee)

### 3. **Week Definition**
- **Week Start:** Monday (using `startOfWeek` with `weekStartsOn: 1`)
- **Week End:** Sunday
- **Library:** `date-fns` (`startOfWeek`, `endOfWeek`)

---

## 🔍 Code Flow

### Payroll Export Endpoint
**File:** `app/api/export/payroll/route.ts`

```typescript
1. Get week start/end dates (defaults to current week)
2. Fetch all employees for organization
3. For each employee:
   a. Calculate weekly hours (SchedulerService.calculateWeeklyHours)
   b. Check overtime (SchedulerService.checkOvertime)
   c. Calculate regular hours (min of weekly hours, 40)
   d. Calculate overtime hours (max of 0, weekly hours - 40)
   e. Calculate regular pay (regular hours × hourly rate)
   f. Calculate overtime pay (overtime hours × hourly rate × 1.5)
   g. Calculate total pay (regular pay + overtime pay)
4. Generate CSV with all calculated data
5. Return CSV file for download
```

### Hours Calculation Service
**File:** `server/services/scheduler/scheduler.service.ts`

```typescript
calculateWeeklyHours(employeeId, weekStartDate):
  1. Calculate week boundaries (Monday to Sunday)
  2. Query shifts for employee in that week
  3. Filter by status: SCHEDULED, CONFIRMED, COMPLETED
  4. For each shift:
     - Calculate hours: (endTime - startTime) / milliseconds per hour
     - Add to total
  5. Return total hours

checkOvertime(employeeId, weekStartDate):
  1. Get weekly hours (using calculateWeeklyHours)
  2. Calculate overtime hours: max(0, weeklyHours - 40)
  3. Return {
       weeklyHours,
       overtimeHours,
       hasOvertime: overtimeHours > 0
     }
```

---

## ⚠️ Important Notes & Limitations

### Current Implementation Details

1. **Overtime Threshold: Fixed at 40 hours**
   - Hardcoded in `checkOvertime()` method
   - Standard US federal overtime rule
   - **Note:** Some states have different rules (e.g., daily overtime in CA)

2. **Overtime Rate: Fixed at 1.5x**
   - Standard US overtime rate
   - **Note:** Some contracts may have different rates

3. **Shift Status Filtering**
   - Only counts: `SCHEDULED`, `CONFIRMED`, `COMPLETED`
   - Excludes: `CANCELLED` shifts
   - **Note:** This is correct - cancelled shifts shouldn't count

4. **Hourly Rate Default**
   - If `hourlyRate` is `null`, defaults to `$0.00`
   - **Note:** Employees without hourly rates will show $0 pay

5. **Week Calculation**
   - Uses Monday as week start (ISO 8601 standard)
   - Week boundaries: Monday 00:00:00 to Sunday 23:59:59

6. **Time Calculation**
   - Uses JavaScript Date objects
   - Calculates difference in milliseconds, converts to hours
   - **Precision:** Decimal hours (e.g., 8.5 hours = 8 hours 30 minutes)

---

## 🧮 Example Calculations

### Example 1: No Overtime
```
Employee: Alice
Hourly Rate: $15.00
Shifts:
  Mon: 9 AM - 5 PM (8 hours)
  Tue: 9 AM - 5 PM (8 hours)
  Wed: 9 AM - 5 PM (8 hours)
  Thu: 9 AM - 5 PM (8 hours)
  Fri: 9 AM - 5 PM (8 hours)

Weekly Hours: 40
Regular Hours: 40
Overtime Hours: 0

Regular Pay: 40 × $15.00 = $600.00
Overtime Pay: 0 × $15.00 × 1.5 = $0.00
Total Pay: $600.00
```

### Example 2: With Overtime
```
Employee: Bob
Hourly Rate: $25.00
Shifts:
  Mon: 9 AM - 5 PM (8 hours)
  Tue: 9 AM - 5 PM (8 hours)
  Wed: 9 AM - 5 PM (8 hours)
  Thu: 9 AM - 5 PM (8 hours)
  Fri: 9 AM - 5 PM (8 hours)
  Sat: 9 AM - 5 PM (8 hours)

Weekly Hours: 48
Regular Hours: 40
Overtime Hours: 8

Regular Pay: 40 × $25.00 = $1,000.00
Overtime Pay: 8 × $25.00 × 1.5 = $300.00
Total Pay: $1,300.00
```

### Example 3: Partial Day
```
Employee: Carol
Hourly Rate: $18.50
Shifts:
  Mon: 9 AM - 1 PM (4 hours)
  Tue: 9 AM - 5 PM (8 hours)
  Wed: 9 AM - 5 PM (8 hours)
  Thu: 9 AM - 5 PM (8 hours)
  Fri: 9 AM - 5 PM (8 hours)
  Sat: 9 AM - 3 PM (6 hours)

Weekly Hours: 42
Regular Hours: 40
Overtime Hours: 2

Regular Pay: 40 × $18.50 = $740.00
Overtime Pay: 2 × $18.50 × 1.5 = $55.50
Total Pay: $795.50
```

---

## 🔧 Potential Enhancements

### 1. **Configurable Overtime Threshold**
```typescript
// Instead of hardcoded 40, allow per-organization settings
const overtimeThreshold = organization.settings.overtimeThreshold || 40
```

### 2. **Configurable Overtime Rate**
```typescript
// Instead of hardcoded 1.5, allow per-organization settings
const overtimeRate = organization.settings.overtimeRate || 1.5
```

### 3. **Daily Overtime (California Rules)**
```typescript
// Some states require overtime after 8 hours per day
// Would need to calculate daily hours, not just weekly
```

### 4. **Different Rates for Different Shifts**
```typescript
// Night shift premium, weekend premium, etc.
// Would need shift-level rate overrides
```

### 5. **Time Tracking Integration**
```typescript
// Currently uses scheduled shift times
// Could use actual clock in/out times from TimeTracking model
// More accurate for payroll
```

### 6. **Break Deductions**
```typescript
// Deduct unpaid break time (e.g., 30 min lunch)
// Would need break tracking in shifts
```

---

## 📊 CSV Export Format

The payroll export generates a CSV with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| Employee ID | Unique employee identifier | `clx123abc` |
| Employee Name | Employee's full name | `John Doe` |
| Email | Employee's email | `john@example.com` |
| Hourly Rate | Employee's hourly wage | `20.00` |
| Regular Hours | Hours up to 40 | `40.00` |
| Overtime Hours | Hours over 40 | `4.00` |
| Total Hours | Total hours worked | `44.00` |
| Regular Pay | Regular hours × rate | `800.00` |
| Overtime Pay | Overtime hours × rate × 1.5 | `120.00` |
| Total Pay | Regular pay + overtime pay | `920.00` |

---

## ✅ Validation & Edge Cases

### Handled:
- ✅ Employees without hourly rates (defaults to $0.00)
- ✅ Weeks with no shifts (0 hours, $0 pay)
- ✅ Exact 40 hours (no overtime)
- ✅ Less than 40 hours (no overtime)
- ✅ More than 40 hours (overtime calculated)

### Not Currently Handled:
- ⚠️ Negative hours (if endTime < startTime)
- ⚠️ Shifts spanning multiple days
- ⚠️ Time zone differences
- ⚠️ Employees with multiple hourly rates
- ⚠️ Shift-level rate overrides

---

## 🎯 Summary

**Your payroll calculation is:**
- ✅ Simple and straightforward
- ✅ Follows standard US overtime rules (40 hours, 1.5x rate)
- ✅ Based on scheduled shift times
- ✅ Calculates weekly totals
- ✅ Exports to CSV format

**Formula:**
```
Total Pay = (min(weeklyHours, 40) × hourlyRate) + (max(weeklyHours - 40, 0) × hourlyRate × 1.5)
```

**Key Files:**
- `app/api/export/payroll/route.ts` - Payroll export endpoint
- `server/services/scheduler/scheduler.service.ts` - Hours calculation logic
- `prisma/schema.prisma` - Employee hourly rate field
