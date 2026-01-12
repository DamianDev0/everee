# Everee Sandbox – Test Data (Quick Reference Guide)

This document contains **all recommended fictitious values** to complete **Everee in the Sandbox environment** without errors.

**Never use real data.** Everything here is for testing purposes only.

---

## 1. Identity Verification

### Selected option: ITIN (Individual Taxpayer Identification Number)

### Valid ITIN format

An ITIN must follow this pattern:

```
9XX-7X-XXXX
```

### Example ITIN (Sandbox)

```
900-70-1234
```

* Use the same value in **Confirm ITIN**
* Sandbox validates **format only**
* Never use real ITINs

---

## 2. Address (California)

```
1234 Elm Street
Los Angeles, CA 90001
United States
```

---

## 3. W-9 Form

### Name (as shown on your income tax return)

```
John Michael Doe
```

### Business name / disregarded entity name

* Leave blank (individual)

### Federal tax classification

Select:

```
Individual / Sole proprietor or Single-member LLC
```

### Exempt from backup withholding / FATCA

```
No
```

---

## 4. Taxpayer Identification Number (TIN)

### Recommended option (individual)

**Social Security Number (SSN):**

```
123-45-6789
```

### Alternative option (company / LLC)

**Employer Identification Number (EIN):**

```
12-3456789
```

Use **only one**: SSN **or** EIN, never both.

---

## 5. Part II – Certification (W-9)

* Accept / Sign
* Do not modify the text
* Do not mark backup withholding

In sandbox, there is **no legal validation**, only flow validation.

---

## 6. Direct Deposit / Payment Method

### Account nickname

```
Primary Checking
```

### Financial institution

```
Bank of America
```

(or any bank)

### Account number

```
1234567890
```

### Confirm account number

```
1234567890
```

### Routing number (9 digits)

Valid examples:

```
026009593  (Bank of America)
021000021  (Chase)
```

### Account type

```
Checking
```

---

## 7. Expected Events (for development)

Persist these states in your backend:

* `ONBOARDING_COMPLETED`
* `PAYMENT_METHOD_ADDED`

Example:

```ts
onboardingCompleted = true;
paymentMethodReady = true;
```

---

## Final Recommendations

* Always use **externalWorkerId**
* Never store SSN / ITIN / EIN in your backend
* Everee handles compliance
* Sandbox validates format only

---

With this guide, you can complete **the entire Everee Sandbox flow** without repeatedly c
