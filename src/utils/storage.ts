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

// Pure TS SHA-256 implementation for secure password hashing
export function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const lengthProperty = 'length';
  let i, j;
  
  const words: number[] = [];
  const asciiLength = ascii[lengthProperty];
  
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  
  const wordsLength = ((asciiLength + 8) >> 6) + 1;
  const totalWords = wordsLength * 16;
  for (i = 0; i < totalWords; i++) words[i] = 0;
  for (i = 0; i < asciiLength; i++) {
    words[i >> 2] |= ascii.charCodeAt(i) << (24 - (i & 3) * 8);
  }
  words[asciiLength >> 2] |= 0x80 << (24 - (asciiLength & 3) * 8);
  words[totalWords - 1] = asciiLength * 8;
  
  for (j = 0; j < totalWords; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = hash.slice(0);
    
    for (i = 0; i < 64; i++) {
      if (i >= 16) {
        const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const sigma0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const sigma1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      
      const temp1 = hash[7] + sigma1 + ch + k[i] + w[i];
      const temp2 = sigma0 + maj;
      
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  
  let hex = '';
  for (i = 0; i < 8; i++) {
    const h = hash[i];
    for (j = 3; j >= 0; j--) {
      const b = (h >>> (j * 8)) & 255;
      hex += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return hex;
}

export function hashPassword(plainText: string): string {
  if (!plainText) return '';
  if (/^[0-9a-f]{64}$/i.test(plainText)) return plainText; // already hashed
  return sha256(plainText);
}

export interface DbStatus {
  connected: boolean;
  error: string | null;
  lastSync: Date | null;
}

let dbStatus: DbStatus = {
  connected: true, // assume connected on start
  error: null,
  lastSync: null
};

const dbStatusListeners = new Set<(status: DbStatus) => void>();

export function getDbStatus(): DbStatus {
  return dbStatus;
}

export function subscribeDbStatus(listener: (status: DbStatus) => void) {
  dbStatusListeners.add(listener);
  listener(dbStatus);
  return () => {
    dbStatusListeners.delete(listener);
  };
}

export function updateDbStatus(status: Partial<DbStatus>) {
  dbStatus = { ...dbStatus, ...status };
  dbStatusListeners.forEach(l => l(dbStatus));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('db-status-update'));
  }
}

const isCollectionLoadedFromFirestore: Record<string, boolean> = {};

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
    isCollectionLoadedFromFirestore[collectionName] = true;
    updateDbStatus({ connected: true, error: null, lastSync: new Date() });
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
    updateDbStatus({ connected: false, error: err instanceof Error ? err.message : String(err) });
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

  // Guard: If we haven't loaded the real snapshot from Firestore yet, do NOT attempt background deletions.
  if (!isCollectionLoadedFromFirestore[collectionName]) {
    console.log(`Skipping sync-deletion for ${collectionName} since Firestore snapshot has not loaded yet.`);
    return;
  }

  // Query database in background to clean up deleted records (skip append-only logs)
  if (collectionName !== 'activities' && collectionName !== 'notifications') {
    try {
      const colRef = collection(db, firestoreCollectionName);
      const snapshot = await getDocs(colRef);
      const activeOwner = getActiveShopOwnerEmail().toLowerCase().trim();
      const isMasterAdmin = (activeOwner === 'owner@gmail.com' || activeOwner === 'sahalshihabudheen@gmail.com');

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        if (isRegisteredTailors) {
          // Only master admin is permitted to delete tailor profiles
          if (isMasterAdmin && data.isRegisteredTailor === true && !ids.has(docSnap.id)) {
            try {
              await deleteDoc(docSnap.ref);
            } catch (err) {
              handleFirestoreError(err, OperationType.DELETE, `${firestoreCollectionName}/${docSnap.id}`);
            }
          }
        } else if (firestoreCollectionName === 'workers') {
          // Normal workers have shopOwnerEmail; only delete if owned by active shop
          const itemOwner = (data.shopOwnerEmail || 'sahalshihabudheen@gmail.com').toLowerCase().trim();
          if (itemOwner === activeOwner && data.isRegisteredTailor !== true && !ids.has(docSnap.id)) {
            try {
              await deleteDoc(docSnap.ref);
            } catch (err) {
              handleFirestoreError(err, OperationType.DELETE, `${firestoreCollectionName}/${docSnap.id}`);
            }
          }
        } else {
          // Other collections like customers, measurements, orders, etc.
          // Only delete if owned by the active shop owner to prevent cross-shop wipes
          const itemOwner = (data.shopOwnerEmail || 'sahalshihabudheen@gmail.com').toLowerCase().trim();
          if (itemOwner === activeOwner && !ids.has(docSnap.id)) {
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

const isPhoneMatchLocal = (phone1: string, phone2: string): boolean => {
  const c1 = (phone1 || '').replace(/\D/g, '');
  const c2 = (phone2 || '').replace(/\D/g, '');
  if (!c1 || !c2) return false;
  if (c1 === c2) return true;
  if (c1.length >= 6 && c2.length >= 6) {
    if (c1.endsWith(c2) || c2.endsWith(c1)) {
      return true;
    }
  }
  return false;
};

export const getActiveShopOwnerEmail = (): string => {
  if (typeof window === 'undefined') return 'sahalshihabudheen@gmail.com';
  const saved = localStorage.getItem('tailor_logged_in_user');
  if (!saved) return 'sahalshihabudheen@gmail.com';
  try {
    const u = JSON.parse(saved);
    if (!u) return 'sahalshihabudheen@gmail.com';

    const userEmail = (u.email || '').toLowerCase().trim();
    const userPhone = (u.phone || '').trim();
    const userName = (u.name || '').toLowerCase().trim();

    if (u.role !== 'Owner' && u.role !== 'Manager') {
      const workersData = localStorage.getItem(KEYS.WORKERS);
      const workersList = workersData ? JSON.parse(workersData) : [];
      if (Array.isArray(workersList)) {
        const match = workersList.find((w: any) => {
          if (!w) return false;
          const wEmail = (w.email || '').toLowerCase().trim();
          const wPhone = (w.phone || '').trim();
          const wName = (w.name || '').toLowerCase().trim();
          return (userEmail && wEmail === userEmail) ||
                 (userPhone && isPhoneMatchLocal(userPhone, wPhone)) ||
                 (userName && wName === userName);
        });
        if (match && match.shopOwnerEmail) {
          return match.shopOwnerEmail.toLowerCase().trim();
        }
      }
    }

    if (u.email) {
      const email = u.email.toLowerCase().trim();
      if (email === 'owner@gmail.com') return 'sahalshihabudheen@gmail.com';
      return email;
    }
  } catch (e) {
    // ignore
  }
  return 'sahalshihabudheen@gmail.com';
};

const getFilteredCollection = <T>(localStorageKey: string, initialData: T[]): T[] => {
  const data = localStorage.getItem(localStorageKey);
  const list: T[] = data ? JSON.parse(data) : initialData;
  const ownerEmail = getActiveShopOwnerEmail();
  
  return list.filter((item: any) => {
    const itemOwner = (item.shopOwnerEmail || 'sahalshihabudheen@gmail.com').toLowerCase().trim();
    return itemOwner === ownerEmail;
  });
};

const saveFilteredCollection = <T extends { id: string }>(
  collectionName: string,
  localStorageKey: string,
  initialData: T[],
  activeShopItems: T[]
) => {
  const ownerEmail = getActiveShopOwnerEmail();
  
  let cleanedActiveShopItems = activeShopItems.map(item => ({
    ...item,
    shopOwnerEmail: ownerEmail
  }));

  // Automatically hash customer passwords on save if collectionName is customers
  if (collectionName === 'customers') {
    cleanedActiveShopItems = cleanedActiveShopItems.map((item: any) => {
      if (item.password) {
        return {
          ...item,
          password: hashPassword(item.password)
        };
      }
      return item;
    });
  }

  const rawData = localStorage.getItem(localStorageKey);
  const fullList: any[] = rawData ? JSON.parse(rawData) : initialData;

  let otherShopsItems = fullList.filter(item => {
    const itemOwner = (item.shopOwnerEmail || 'sahalshihabudheen@gmail.com').toLowerCase().trim();
    return itemOwner !== ownerEmail;
  });

  // Make sure other shops' customer passwords are also hashed if they are in customers list
  if (collectionName === 'customers') {
    otherShopsItems = otherShopsItems.map((item: any) => {
      if (item.password) {
        return {
          ...item,
          password: hashPassword(item.password)
        };
      }
      return item;
    });
  }

  const mergedList = [...otherShopsItems, ...cleanedActiveShopItems];

  localStorage.setItem(localStorageKey, JSON.stringify(mergedList));
  syncListToFirestore(collectionName, mergedList);
};

export const getCustomers = (): Customer[] => {
  return getFilteredCollection<Customer>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
};

export const saveCustomers = (customers: Customer[]) => {
  saveFilteredCollection<Customer>('customers', KEYS.CUSTOMERS, INITIAL_CUSTOMERS, customers);
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
      password: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', // password123 hashed
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
    if (list[ownerIndex].phone === '+91 94460 12345') {
      list[ownerIndex].phone = '+91 99999 99999';
      subChanged = true;
    }
    if (list[ownerIndex].hasRegisteredShop !== false) {
      list[ownerIndex].hasRegisteredShop = false;
      delete list[ownerIndex].shopName;
      delete list[ownerIndex].logoUrl;
      subChanged = true;
    }
    // Upgrade existing admin password to hash if it is in plain text
    if (list[ownerIndex].password && !/^[0-9a-f]{64}$/i.test(list[ownerIndex].password)) {
      list[ownerIndex].password = hashPassword(list[ownerIndex].password);
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
      phone: '+91 99999 99999',
      location: 'Kerala, India',
      password: 'd3b6fcf0b3589137824869e7108f66422f0d1da3a481fd2a746dfdb971f098ae', // TAILORSHOP_ERPOwner2026! hashed
      hasRegisteredShop: false,
      createdAt: new Date().toISOString()
    };
    list.push(ownerTailor);
    changed = true;
  }

  // Ensure ALL passwords in the list are securely hashed
  list = list.map((t: any) => {
    if (t && t.password && !/^[0-9a-f]{64}$/i.test(t.password)) {
      changed = true;
      return { ...t, password: hashPassword(t.password) };
    }
    return t;
  });

  if (changed) {
    localStorage.setItem(KEYS.REGISTERED_TAILORS, JSON.stringify(list));
    // To prevent async lag from a blank PC B blanking out the database:
    // Only write sync if this is NOT a completely new, uninitialized local storage instance!
    if (!isFirstTime) {
      syncListToFirestore('registered_tailors', list);
    }
  }
  return list;
};

export const saveRegisteredTailors = (list: any[]) => {
  const hashedList = list.map((t: any) => {
    if (t && t.password) {
      return { ...t, password: hashPassword(t.password) };
    }
    return t;
  });
  localStorage.setItem(KEYS.REGISTERED_TAILORS, JSON.stringify(hashedList));
  syncListToFirestore('registered_tailors', hashedList);
};

export const getWorkers = (): Worker[] => {
  return getFilteredCollection<Worker>(KEYS.WORKERS, INITIAL_WORKERS);
};

export const saveWorkers = (workers: Worker[]) => {
  saveFilteredCollection<Worker>('workers', KEYS.WORKERS, INITIAL_WORKERS, workers);
};

export const getMeasurements = (): MeasurementRecord[] => {
  return getFilteredCollection<MeasurementRecord>(KEYS.MEASUREMENTS, INITIAL_MEASUREMENTS);
};

export const saveMeasurements = (records: MeasurementRecord[]) => {
  saveFilteredCollection<MeasurementRecord>('measurements', KEYS.MEASUREMENTS, INITIAL_MEASUREMENTS, records);
};

export const getOrders = (): Order[] => {
  return getFilteredCollection<Order>(KEYS.ORDERS, INITIAL_ORDERS);
};

export const saveOrders = (orders: Order[]) => {
  saveFilteredCollection<Order>('orders', KEYS.ORDERS, INITIAL_ORDERS, orders);
};

export const getNotifications = (): NotificationLog[] => {
  return getFilteredCollection<NotificationLog>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
};

export const saveNotifications = (logs: NotificationLog[]) => {
  saveFilteredCollection<NotificationLog>('notifications', KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS, logs);
};

export const getActivities = (): RecentActivity[] => {
  return getFilteredCollection<RecentActivity>(KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
};

export const saveActivities = (activities: RecentActivity[]) => {
  saveFilteredCollection<RecentActivity>('activities', KEYS.ACTIVITIES, INITIAL_ACTIVITIES, activities);
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

