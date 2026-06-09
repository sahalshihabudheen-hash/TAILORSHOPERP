# Firebase Security Rule Specifications

This document defines the security rules, invariants, and threat vectors for the Tailor Shop ERP Firestore database.

## 1. Data Invariants and Integrity Rules

The system structures data under 6 core entities: `customers`, `measurements`, `workers`, `orders`, `notifications`, and `activities`.

### Critical Security Policies:
- **No Orphaned Records**: A measurement record cannot be created without checking that the associated `customerId` exists in the database.
- **Role Isolation**: Only authenticated staff and admins can view `activities`, `notifications`, and `workers` collections.
- **Identity Integrity**: Customers can only view, read, or manage their own profile and their own measurement/orders books. They are strictly forbidden from reading other customers' details.
- **Terminal State Locking**: Once an order reaches `Delivered` status, its amount metrics, assignee, and delivery history are frozen.
- **Value Constraints**: Sizing parameters and numerical price details must have positive range limits to block Integer Overflow/Underflow and resource poisoning.

---

## 2. The "Dirty Dozen" Attack Payloads

These 12 scenarios test the bounds of our security rules:

1. **Self-Elevated Privilege Attack**: An unauthenticated user attempts to create a document in the `workers` or `admins` directory, assigning themselves a `role = 'Owner'` or `isAdmin = true`.
2. **Customer Cross-Read Poisoning**: A logged-in customer attempts to fetch another customer's complete profile document.
3. **Ghost Identifier Mutation**: A customer attempts to mutate `originalOwnerId` or `customerId` fields in an active order during a patch update.
4. **Infinity Sizing Resource Denial**: A malicious client writes a 5MB sizing record or empty space values to `measurements` to cause browser memory crashes.
5. **Negative Pricing Theft**: An attacker creates an Order with `price = -100` and `advancePayment = -100` to manipulate billing.
6. **Shadow Field Injection**: A custom update payload wraps an unlisted field `isVerifiedStaff = true` inside a worker profile.
7. **Direct Audit Wipe**: A user attempts to run a `delete` command directly against `activities` (the system's central audit trail).
8. **Worker Base Salary Escalation**: A worker node attempts to self-update their `baseSalary` or `perOrderBonus` attributes.
9. **Fake Verification Claim**: A user tries to query list collections checking emails without ensuring `request.auth.token.email_verified == true`.
10. **Pre-Dated Order Injection**: Inserting orders where `deliveryDate` or `createdAt` is configured on the client to circumvent standard queues.
11. **Spoofed Sender ID**: Injecting notification logs with another tailor's ID to send malicious customer notifications.
12. **Double-Spend Status Shortcut**: Overwriting a fully completed, paid, and delivered order status to "Unpaid/Received" after pickup.

---

## 3. Test Runner Definition (`firestore.rules.test.ts`)

```typescript
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'gen-lang-client-0726527776',
    firestore: {
      rules: require('fs').readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Tailor Shop ERP Security Rules Integration', () => {
  it('forbids unauthenticated reads on systems audit activities', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, 'activities/ACT-1002');
    await expect(getDoc(docRef)).rejects.toThrow();
  });

  it('allows customers to read only their own documents', async () => {
    const aliceDb = testEnv.authenticatedContext('cust_alice').firestore();
    const bobDocRef = doc(aliceDb, 'customers/cust_bob');
    await expect(getDoc(bobDocRef)).rejects.toThrow();
  });
});
```
