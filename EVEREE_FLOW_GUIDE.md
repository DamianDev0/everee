# Everee Integration - Complete Flow Guide

## 📋 Overview

This guide explains the complete Everee integration flow for the staffing industry. The implementation follows Everee's official API patterns and includes all necessary steps for processing payroll for both W-2 employees and 1099 contractors.

## 🎯 Key Concepts

### Workers Types
- **W-2 Employees (Hourly)**: Paid based on shifts/timesheets
- **1099 Contractors**: Paid via payables only

### Payment Models
- **Employees**: Automatic payroll on pay cycle OR off-cycle immediate
- **Contractors**: Manual payment processing (REQUIRED)

### Critical Components
1. **Work Locations**: MUST be created before shifts (determines tax jurisdiction)
2. **Shifts**: Time tracking for employees
3. **Payables**: Additional payments (bonuses, reimbursements) OR contractor payments
4. **Webhooks**: Notifications for status changes

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: CREATE WORKER                                      │
│  ├─ Option A: Onboarding (minimal data, worker completes)   │
│  ├─ Option B: Complete (all data, ready immediately)        │
│  └─ Option C: Embedded (UI component in your app)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: CREATE WORK LOCATION (if needed)                   │
│  CRITICAL: Must be done before assigning shifts             │
│  Determines: Tax jurisdiction, timezone                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
              ┌─────────────┴─────────────┐
              ↓                           ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│  STEP 3A: EMPLOYEES      │  │  STEP 3B: CONTRACTORS    │
│  Create Shifts           │  │  Create Payables         │
│  (Timesheet)             │  │  (All payments)          │
└──────────────────────────┘  └──────────────────────────┘
              ↓                           ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│  STEP 4: ADDITIONAL      │  │  STEP 4: ADDITIONAL      │
│  PAYABLES (optional)     │  │  PAYABLES (optional)     │
│  - Bonuses               │  │  - Multiple jobs         │
│  - Reimbursements        │  │  - Expenses              │
│  - Commissions           │  │  - Bonuses               │
└──────────────────────────┘  └──────────────────────────┘
              ↓                           ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│  STEP 5A: EMPLOYEES      │  │  STEP 5B: CONTRACTORS    │
│  Wait for Auto Payroll   │  │  MUST Call:              │
│  (or process off-cycle)  │  │  processPayablesForPayout│
└──────────────────────────┘  └──────────────────────────┘
              ↓                           ↓
              └─────────────┬─────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: RECEIVE WEBHOOKS                                   │
│  - payment.paid (payment completed)                         │
│  - payment-payables.status-changed (status updates)         │
│  - worker.onboarding-completed (worker ready)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Implementation Examples

### Example 1: Weekly Employee Flow

```typescript
// Week of work for an employee
const result = await evereeFlowService.processWeekForEmployee({
  workerId: 'uuid-123',
  externalWorkerId: 'EMP-001',
  workLocationId: 'location-uuid',
  shifts: [
    {
      shiftStartTime: new Date('2025-01-13T09:00:00'),
      shiftEndTime: new Date('2025-01-13T17:00:00'),
      breaks: [
        {
          startTime: new Date('2025-01-13T12:00:00'),
          endTime: new Date('2025-01-13T13:00:00'),
        },
      ],
      effectiveHourlyPayRate: 25.0,
    },
    // ... more shifts for the week
  ],
  additionalPayables: [
    {
      type: PayableType.BONUS,
      earningType: 'BONUS',
      description: 'Weekly performance bonus',
      amount: 100.0,
    },
  ],
});

// Everee will automatically process payment on the pay cycle
// No need to call processPayablesForPayout
```

### Example 2: Contractor Job Completion

```typescript
// Contractor completed a job
const result = await evereeFlowService.processContractorWorkCompletion({
  workerId: 'uuid-456',
  externalWorkerId: 'CONTRACTOR-001',
  payables: [
    {
      type: PayableType.CONTRACTOR_PAYMENT,
      description: 'Web development project - Phase 1',
      amount: 5000.0,
      projectId: 'PROJ-123',
      projectName: 'Client Website Redesign',
    },
    {
      type: PayableType.REIMBURSEMENT,
      description: 'Software licenses',
      amount: 200.0,
    },
  ],
  processImmediately: true, // Will call processPayablesForPayout automatically
});

// Payment will be processed immediately
```

### Example 3: Off-Cycle Employee Bonus

```typescript
// Employee needs immediate bonus payment
const payable = await evereeFlowService.createAdditionalPayable({
  workerId: 'uuid-123',
  externalWorkerId: 'EMP-001',
  type: PayableType.BONUS,
  earningType: 'BONUS',
  description: 'Q1 Sales Performance Bonus',
  amount: 2500.0,
  verified: true,
});

// Process payment immediately (off-cycle)
await evereeFlowService.processOffCycleEmployeePayment(['EMP-001']);
```

---

## 📊 Database Schema Updates

### Shift Entity - New Fields

```typescript
// Timezone and verification
legalWorkTimeZone: string;
verifiedAt: Date;
verifiedByUserId: number;

// Durations (ISO 8601 format)
shiftDurationISO: string;
paidBreakDurationISO: string;
unpaidBreakDurationISO: string;
regularTimeWorkedISO: string;
overtimeWorkedISO: string;
doubleTimeWorkedISO: string;

// Pay rates and amounts
displayHourlyPayRate: number;
payRateOverridden: boolean;
totalPayableAmount: number;
paid: boolean;
regularTimePayableAmount: number;
overtimePayableAmount: number;
doubleTimePayableAmount: number;

// Tax configuration
taxCalculationConfigCode: string;

// Dimensions (cost tracking)
departmentId: string;
costCenterId: string;
```

### Payable Entity - New Fields

```typescript
// Everee integration
evereeCompanyId: number;
evereePayableModel: string;
evereeEarningType: string;
earningTimestamp: number;
verified: boolean;
evereePaymentStatus: string;
evereePaymentId: number;
evereePayablePaymentRequestId: number;

// Unit-based payables
unitRateAmount: number;
unitRateCurrency: string;
unitCount: number;

// Work location
evereeWorkLocationId: number;
```

### WorkLocation Entity - New Fields

```typescript
// Address details
addressLine2: string;
phoneNumber: string;

// Critical fields
timeZone: string; // CRITICAL for shift calculations
effectiveDate: Date;
```

---

## 🔔 Webhook Handlers

### payment.paid

```typescript
// Triggered when payment is completed
// Updates shifts and payables to mark as paid
// Automatically syncs from Everee to get latest status
```

### payment-payables.status-changed

```typescript
// Triggered when payable status changes
// Updates local payables with new status
// Handles: PENDING_APPROVAL → APPROVED → PAID
```

### worker.onboarding-completed

```typescript
// Triggered when worker completes onboarding
// Worker is now ready to receive payments
// Can start creating shifts/payables
```

---

## ✅ Best Practices

### 1. Work Location Creation
```typescript
// ALWAYS create work location BEFORE creating shifts
const location = await evereeFlowService.createWorkLocation({
  name: 'Main Office',
  address: '123 Main St',
  city: 'New York',
  state: 'New York',
  stateAbbreviation: 'NY',
  zipCode: '10001',
});

// Use location ID when creating shifts
await evereeFlowService.createShiftForEmployee({
  workLocationId: location.id,
  // ... other fields
});
```

### 2. External ID Pattern
```typescript
// Use deterministic external IDs for idempotency
const externalId = `shift-${externalWorkerId}-${shiftStartTime.getTime()}`;

// Everee will reject duplicates, preventing double payments
```

### 3. Contractor Payment
```typescript
// ALWAYS process contractor payables
// They will NOT be paid automatically
await evereeFlowService.processContractorPayment([externalWorkerId]);
```

### 4. Employee Regular Payroll
```typescript
// DON'T call processPayablesForPayout for regular employee payroll
// Everee automatically includes:
// - All shifts in pay period
// - All approved payables
// - Processes on configured pay schedule
```

### 5. Off-Cycle Employee Payment
```typescript
// Only use when employee needs immediate payment
// Set includeWorkersOnRegularPayCycle: true
await payableService.processPayablesForPayout({
  externalWorkerIds: ['EMP-001'],
  includeWorkersOnRegularPayCycle: true, // CRITICAL
});
```

---

## 🚨 Common Pitfalls

### ❌ DON'T: Create shifts without work location
```typescript
// This will fail or cause tax calculation issues
await shiftService.createShift({
  workLocationId: null, // ❌ BAD
  // ...
});
```

### ✅ DO: Create work location first
```typescript
const location = await workLocationService.createWorkLocation({...});
await shiftService.createShift({
  workLocationId: location.id, // ✅ GOOD
  // ...
});
```

### ❌ DON'T: Forget to process contractor payables
```typescript
// Payable created but never processed
await payableService.createPayable({...}); // ❌ Contractor won't get paid
```

### ✅ DO: Always process contractor payables
```typescript
await payableService.createPayable({...});
await payableService.processPayablesForPayout({
  externalWorkerIds: ['CONTRACTOR-001'],
}); // ✅ GOOD
```

### ❌ DON'T: Process employee regular payroll manually
```typescript
// Everee handles this automatically
await payableService.processPayablesForPayout({
  externalWorkerIds: ['EMP-001'],
  includeWorkersOnRegularPayCycle: false, // ❌ Wrong flag
});
```

### ✅ DO: Let Everee auto-process OR use off-cycle correctly
```typescript
// Option 1: Do nothing, let Everee auto-process (RECOMMENDED)

// Option 2: Off-cycle payment (when needed)
await payableService.processPayablesForPayout({
  externalWorkerIds: ['EMP-001'],
  includeWorkersOnRegularPayCycle: true, // ✅ Correct flag
});
```

---

## 📱 Service Architecture

```
EvereeFlowService (Orchestrator)
    ├── WorkLocationService (Manages locations)
    ├── ShiftService (Employee time tracking)
    ├── PayableService (Additional payments)
    └── WorkerService (Worker management)
            ↓
    EvereeShiftService (API client)
    EvereePayableService (API client)
    EvereeWorkLocationService (API client)
    EvereeWorkerService (API client)
            ↓
        Everee API
```

---

## 🎓 Key Takeaways

1. **Work Locations**: Create BEFORE shifts (tax jurisdiction)
2. **Contractors**: ALWAYS process payables manually
3. **Employees**: Let Everee auto-process (or off-cycle with correct flag)
4. **Webhooks**: Listen for status changes and payment confirmations
5. **Idempotency**: Use deterministic external IDs
6. **Onboarding**: Workers can't be paid until onboarding is complete

---

## 🆘 Support

For implementation questions:
- Review entity fields: [shift.entity.ts](src/modules/payroll/shift/entities/shift.entity.ts)
- Review interfaces: [src/integrations/everee/interfaces](src/integrations/everee/interfaces)
- Check webhook handlers: [everee-webhook-handler.service.ts](src/integrations/everee/webhooks/everee-webhook-handler.service.ts)
- Flow orchestrator: [everee-flow.service.ts](src/modules/payroll/everee-flow.service.ts)
