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
  REGISTERED_TAILORS: 'registered_tailors',
};

// Generic Sync setup function to sync Firestore collections to LocalStorage securely
const setupSync = <T extends { id: string }>(
  collectionName: string,
  localStorageKey: string,
  initialData: T[]
) => {
  const isRegisteredTailors = (collectionName === 'registered_tailors');
  const firestoreCollectionName = isRegisteredTailors ? 'workers' : collectionName;
  const colRef = collection(db, firestoreCollectionName);
  
  onSnapshot(colRef, (snapshot) => {
    const items: T[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as T;
      const custId = data.id;
      const customerId = (data as any).customerId;
      const email = (data as any).email;
      const customerEmail = (data as any).customerEmail;

      const isFake = 
        (firestoreCollectionName === 'customers' || firestoreCollectionName === 'workers' || firestoreCollectionName === 'measurements' || firestoreCollectionName === 'orders') && (
          ['CUST-101', 'CUST-102', 'CUST-103', 'CUST-104'].includes(custId) ||
          ['CUST-101', 'CUST-102', 'CUST-103', 'CUST-104'].includes(customerId) ||
          (typeof email === 'string' && (email.toLowerCase().includes('@example.com') || email.toLowerCase().includes('@tailorshop.com'))) ||
          (typeof customerEmail === 'string' && (customerEmail.toLowerCase().includes('@example.com') || customerEmail.toLowerCase().includes('@tailorshop.com')))
        );

      if (isFake) {
        deleteDoc(doc(db, firestoreCollectionName, docSnap.id)).catch((err) => {
          handleFirestoreError(err, OperationType.DELETE, `${firestoreCollectionName}/${docSnap.id}`);
        });
      } else {
        if (isRegisteredTailors) {
          if ((data as any).isRegisteredTailor === true) {
            items.push(data);
          }
        } else if (firestoreCollectionName === 'workers') {
          if ((data as any).isRegisteredTailor !== true) {
            items.push(data);
          }
        } else {
          items.push(data);
        }
      }
    });

    if (isRegisteredTailors) {
      const seenEmails = new Set<string>();
      const seenIds = new Set<string>();
      const deduplicated: T[] = [];
      
      // Sort to prioritize TAILOR-OWNER-MASTER and TLR-SAHAL
      items.sort((a: any, b: any) => {
        if (a.id === 'TAILOR-OWNER-MASTER') return -1;
        if (b.id === 'TAILOR-OWNER-MASTER') return 1;
        if (a.id === 'TLR-SAHAL') return -1;
        if (b.id === 'TLR-SAHAL') return 1;
        return 0;
      });

      for (const item of items) {
        if (!item) continue;
        const id = item.id;
        const email = (item as any).email ? (item as any).email.toLowerCase().trim() : '';

        // Auto-purge any old/obsolete TLR-OWNER ID
        if (id === 'TLR-OWNER') {
          deleteDoc(doc(db, firestoreCollectionName, id)).catch((err) => {});
          continue;
        }

        if (email) {
          if (seenEmails.has(email) || seenIds.has(id)) {
            // Found duplicate - delete the duplicate document from Firestore to clean up database!
            deleteDoc(doc(db, firestoreCollectionName, id)).catch((err) => {});
            continue;
          }
          seenEmails.add(email);
          seenIds.add(id);
        }
        deduplicated.push(item);
      }
      items.length = 0;
      items.push(...deduplicated);
    }

    if (items.length === 0) {
      const localDataStr = localStorage.getItem(localStorageKey);
      let localData: T[] = [];
      if (localDataStr) {
        try {
          localData = JSON.parse(localDataStr);
        } catch (e) {
          localData = [];
        }
      }

      const dataToSeed = (Array.isArray(localData) && localData.length > 0) ? localData : initialData;
      console.log(`Seeding empty ${collectionName} in Firestore (mapped to ${firestoreCollectionName}) using data from ${dataToSeed === localData ? 'localStorage' : 'initialData'}...`);
      
      const batch = writeBatch(db);
      dataToSeed.forEach((item) => {
        const docRef = doc(db, firestoreCollectionName, item.id);
        const seededItem = isRegisteredTailors ? { ...item, isRegisteredTailor: true, role: 'Tailor' } : item;
        batch.set(docRef, seededItem);
        items.push(seededItem as T);
      });
      batch.commit().catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, firestoreCollectionName);
      });
    }

    const prev = localStorage.getItem(localStorageKey);
    const str = JSON.stringify(items);
    if (prev !== str) {
      localStorage.setItem(localStorageKey, str);
      window.dispatchEvent(new CustomEvent('db-sync-update'));
    }
  }, (err) => {
    try {
      handleFirestoreError(err, OperationType.LIST, firestoreCollectionName);
    } catch (e) {
      console.warn(`Firestore sync for ${collectionName} (mapped to ${firestoreCollectionName}) is offline/waiting.`);
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
  setupSync('registered_tailors', KEYS.REGISTERED_TAILORS, []);
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
  const isRegisteredTailors = (collectionName === 'registered_tailors');
  const firestoreCollectionName = isRegisteredTailors ? 'workers' : collectionName;
  const ids = new Set(items.map(item => item.id));

  // Write new or updated docs
  for (const item of items) {
    try {
      let cleaned = cleanUndefined(item);
      if (isRegisteredTailors) {
        cleaned = { ...cleaned, isRegisteredTailor: true, role: 'Tailor' };
      }
      await setDoc(doc(db, firestoreCollectionName, item.id), cleaned);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${firestoreCollectionName}/${item.id}`);
    }
  }

  // Query database in background to clean up deleted records (skip append-only logs)
  if (collectionName !== 'activities' && collectionName !== 'notifications') {
    try {
      const colRef = collection(db, firestoreCollectionName);
      const snapshot = await getDocs(colRef);
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        if (isRegisteredTailors) {
          if (data.isRegisteredTailor === true && !ids.has(docSnap.id)) {
            try {
              await deleteDoc(docSnap.ref);
            } catch (err) {
              handleFirestoreError(err, OperationType.DELETE, `${firestoreCollectionName}/${docSnap.id}`);
            }
          }
        } else if (firestoreCollectionName === 'workers') {
          if (data.isRegisteredTailor !== true && !ids.has(docSnap.id)) {
            try {
              await deleteDoc(docSnap.ref);
            } catch (err) {
              handleFirestoreError(err, OperationType.DELETE, `${firestoreCollectionName}/${docSnap.id}`);
            }
          }
        } else {
          if (!ids.has(docSnap.id)) {
            try {
              await deleteDoc(docSnap.ref);
            } catch (err) {
              handleFirestoreError(err, OperationType.DELETE, `${firestoreCollectionName}/${docSnap.id}`);
            }
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, firestoreCollectionName);
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

export const getRegisteredTailors = (): any[] => {
  const data = localStorage.getItem(KEYS.REGISTERED_TAILORS);
  const isFirstTime = data === null;
  let list = data ? JSON.parse(data) : [];
  if (!Array.isArray(list)) {
    list = [];
  }
  
  let changed = false;

  // De-duplicate list by email and ID, prioritizing critical profiles
  const initialLength = list.length;
  const seenEmails = new Set<string>();
  const seenIds = new Set<string>();

  // Sort list to prioritize TAILOR-OWNER-MASTER and TLR-SAHAL
  list.sort((a: any, b: any) => {
    if (a && a.id === 'TAILOR-OWNER-MASTER') return -1;
    if (b && b.id === 'TAILOR-OWNER-MASTER') return 1;
    if (a && a.id === 'TLR-SAHAL') return -1;
    if (b && b.id === 'TLR-SAHAL') return 1;
    return 0;
  });

  list = list.filter((t: any) => {
    if (!t || !t.email) return false;
    const email = t.email.toLowerCase().trim();
    const id = t.id;

    if (id === 'TLR-OWNER') {
      return false; // clean up migrated profile
    }

    if (seenEmails.has(email) || seenIds.has(id)) {
      return false;
    }

    seenEmails.add(email);
    seenIds.add(id);
    return true;
  });

  if (list.length !== initialLength) {
    changed = true;
  }
  
  const hasSahal = list.some((t: any) => t && t.email && t.email.toLowerCase().trim() === 'sahalshihabudheen@gmail.com');
  if (!hasSahal && isFirstTime) {
    const sahalTailor = {
      id: 'TLR-SAHAL',
      name: 'Sahal Shihabudheen',
      email: 'sahalshihabudheen@gmail.com',
      phone: '+91 94460 12345',
      location: 'Kerala, India',
      password: 'password123',
      hasRegisteredShop: true,
      shopName: 'TAILORSHOP ERP',
      logoUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop',
      createdAt: new Date().toISOString()
    };
    list.push(sahalTailor);
    changed = true;
  }

  const ownerIndex = list.findIndex((t: any) => t && t.email && t.email.toLowerCase().trim() === 'owner@gmail.com');
  if (ownerIndex >= 0) {
    let subChanged = false;
    if (list[ownerIndex].id !== 'TAILOR-OWNER-MASTER') {
      list[ownerIndex].id = 'TAILOR-OWNER-MASTER';
      list[ownerIndex].name = 'Sartorial Design ERP (Master Admin)';
      subChanged = true;
    }
    if (list[ownerIndex].hasRegisteredShop !== false) {
      list[ownerIndex].hasRegisteredShop = false;
      delete list[ownerIndex].shopName;
      delete list[ownerIndex].logoUrl;
      subChanged = true;
    }
    if (subChanged) {
      changed = true;
    }
  } else {
    const ownerTailor = {
      id: 'TAILOR-OWNER-MASTER',
      name: 'Sartorial Design ERP (Master Admin)',
      email: 'owner@gmail.com',
      phone: '+91 94460 12345',
      location: 'Kerala, India',
      password: 'TAILORSHOP_ERPOwner2026!',
      hasRegisteredShop: false,
      createdAt: new Date().toISOString()
    };
    list.push(ownerTailor);
    changed = true;
  }

  if (changed) {
    localStorage.setItem(KEYS.REGISTERED_TAILORS, JSON.stringify(list));
    syncListToFirestore('registered_tailors', list);
  }
  return list;
};

export const saveRegisteredTailors = (list: any[]) => {
  localStorage.setItem(KEYS.REGISTERED_TAILORS, JSON.stringify(list));
  syncListToFirestore('registered_tailors', list);
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

  // Also remove custom user/branding preferences so everything starts completely fresh
  const extraKeys = [
    'tailor_logged_in_user',
    'tailorshop_name',
    'logo_url',
    'landing_title',
    'landing_description',
    'tailor_title',
    'tailor_description',
    'tailor_image',
    'customer_title',
    'customer_description',
    'customer_image',
    'custom_clothing_emojis',
    'custom_clothing_prices',
    'voucher_main_title'
  ];
  extraKeys.forEach((k) => {
    localStorage.removeItem(k);
  });

  // Dispatch custom update
  window.dispatchEvent(new CustomEvent('db-sync-update'));
};

