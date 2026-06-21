import { Customer, Worker, Order, MeasurementRecord, RecentActivity, NotificationLog } from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_WORKERS,
  INITIAL_MEASUREMENTS,
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITIES
} from '../data/initialData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';

const KEYS = {
  CUSTOMERS: 'tailor_customers',
  WORKERS: 'tailor_workers',
  MEASUREMENTS: 'tailor_measurements',
  ORDERS: 'tailor_orders',
  NOTIFICATIONS: 'tailor_notifications',
  ACTIVITIES: 'tailor_activities',
};

// Generic Sync setup function to sync Firestore collections to LocalStorage securely
const setupSync = <T extends { id: string }>(
  collectionName: string,
  localStorageKey: string,
  initialData: T[]
) => {
  const colRef = collection(db, collectionName);
  
  onSnapshot(colRef, (snapshot) => {
    if (snapshot.empty) {
      console.log(`Seeding ${collectionName} in Firestore...`);
      const batch = writeBatch(db);
      initialData.forEach((item) => {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, item);
      });
      batch.commit().catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, collectionName);
      });

      const prev = localStorage.getItem(localStorageKey);
      const str = JSON.stringify(initialData);
      if (prev !== str) {
        localStorage.setItem(localStorageKey, str);
        window.dispatchEvent(new CustomEvent('db-sync-update'));
      }
    } else {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as T;
        const custId = data.id;
        const customerId = (data as any).customerId;
        const email = (data as any).email;
        const customerEmail = (data as any).customerEmail;

        const isFake = 
          (collectionName === 'customers' || collectionName === 'workers' || collectionName === 'measurements' || collectionName === 'orders') && (
            ['CUST-101', 'CUST-102', 'CUST-103', 'CUST-104'].includes(custId) ||
            ['CUST-101', 'CUST-102', 'CUST-103', 'CUST-104'].includes(customerId) ||
            (typeof email === 'string' && (email.toLowerCase().includes('@example.com') || email.toLowerCase().includes('@tailorshop.com'))) ||
            (typeof customerEmail === 'string' && (customerEmail.toLowerCase().includes('@example.com') || customerEmail.toLowerCase().includes('@tailorshop.com')))
          );

        if (isFake) {
          deleteDoc(doc(db, collectionName, docSnap.id)).catch((err) => {
            handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docSnap.id}`);
          });
        } else {
          items.push(data);
        }
      });

      const prev = localStorage.getItem(localStorageKey);
      const str = JSON.stringify(items);
      if (prev !== str) {
        localStorage.setItem(localStorageKey, str);
        window.dispatchEvent(new CustomEvent('db-sync-update'));
      }
    }
  }, (err) => {
    try {
      handleFirestoreError(err, OperationType.LIST, collectionName);
    } catch (e) {
      console.warn(`Firestore sync for ${collectionName} is currently offline or waiting for permissions. Sync will retry automatically.`);
    }
  });
};

// Start the real-time syncing client-side
if (typeof window !== 'undefined') {
  setupSync('customers', KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  setupSync('workers', KEYS.WORKERS, INITIAL_WORKERS);
  setupSync('measurements', KEYS.MEASUREMENTS, INITIAL_MEASUREMENTS);
  setupSync('orders', KEYS.ORDERS, INITIAL_ORDERS);
  setupSync('notifications', KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  setupSync('activities', KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
}

// Helper to recursively strip any properties with 'undefined' status because Firestore rejects undefined
const cleanUndefined = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== undefined) {
          cleaned[key] = cleanUndefined(obj[key]);
        }
      }
    }
    return cleaned;
  }
  return obj;
};

// Helper to update elements in Firestore and clean up any deleted items safely
const syncListToFirestore = async <T extends { id: string }>(
  collectionName: string,
  items: T[]
) => {
  const ids = new Set(items.map(item => item.id));

  // Write new or updated docs
  for (const item of items) {
    try {
      const cleaned = cleanUndefined(item);
      await setDoc(doc(db, collectionName, item.id), cleaned);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
    }
  }

  // Query database in background to clean up deleted records (skip append-only logs)
  if (collectionName !== 'activities' && collectionName !== 'notifications') {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      for (const docSnap of snapshot.docs) {
        if (!ids.has(docSnap.id)) {
          try {
            await deleteDoc(docSnap.ref);
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docSnap.id}`);
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, collectionName);
    }
  }
};

export const getCustomers = (): Customer[] => {
  const data = localStorage.getItem(KEYS.CUSTOMERS);
  return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
};

export const saveCustomers = (customers: Customer[]) => {
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  syncListToFirestore('customers', customers);
};

export const getWorkers = (): Worker[] => {
  const data = localStorage.getItem(KEYS.WORKERS);
  return data ? JSON.parse(data) : INITIAL_WORKERS;
};

export const saveWorkers = (workers: Worker[]) => {
  localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers));
  syncListToFirestore('workers', workers);
};

export const getMeasurements = (): MeasurementRecord[] => {
  const data = localStorage.getItem(KEYS.MEASUREMENTS);
  return data ? JSON.parse(data) : INITIAL_MEASUREMENTS;
};

export const saveMeasurements = (records: MeasurementRecord[]) => {
  localStorage.setItem(KEYS.MEASUREMENTS, JSON.stringify(records));
  syncListToFirestore('measurements', records);
};

export const getOrders = (): Order[] => {
  const data = localStorage.getItem(KEYS.ORDERS);
  return data ? JSON.parse(data) : INITIAL_ORDERS;
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  syncListToFirestore('orders', orders);
};

export const getNotifications = (): NotificationLog[] => {
  const data = localStorage.getItem(KEYS.NOTIFICATIONS);
  return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
};

export const saveNotifications = (logs: NotificationLog[]) => {
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(logs));
  syncListToFirestore('notifications', logs);
};

export const getActivities = (): RecentActivity[] => {
  const data = localStorage.getItem(KEYS.ACTIVITIES);
  return data ? JSON.parse(data) : INITIAL_ACTIVITIES;
};

export const saveActivities = (activities: RecentActivity[]) => {
  localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities));
  syncListToFirestore('activities', activities);
};

export const addActivity = (action: string, details: string, userRole: string, userName: string) => {
  const list = getActivities();
  const newItem: RecentActivity = {
    id: `ACT-${Date.now()}`,
    action,
    details,
    timestamp: new Date().toISOString(),
    userRole: userRole as any,
    userName
  };
  const updated = [newItem, ...list];
  saveActivities(updated);
};

export const triggerSystemNotification = (type: 'WhatsApp' | 'Email', recipient: string, message: string) => {
  const list = getNotifications();
  const newLog: NotificationLog = {
    id: `NOT-${Date.now()}`,
    type,
    recipient,
    message,
    timestamp: new Date().toISOString(),
    status: 'Delivered'
  };
  const updated = [newLog, ...list];
  saveNotifications(updated);
};

export const purgeAllDatabaseRecords = async () => {
  const collections = ['customers', 'workers', 'measurements', 'orders', 'notifications', 'activities'];
  const batch = writeBatch(db);
  for (const colName of collections) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, colName);
    }
  }
  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'purge_batch');
  }

  // Clear local storage keys
  Object.values(KEYS).forEach((k) => {
    localStorage.removeItem(k);
  });

  // Dispatch custom update
  window.dispatchEvent(new CustomEvent('db-sync-update'));
};

