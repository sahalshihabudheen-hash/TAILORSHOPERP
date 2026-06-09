import { Customer, Worker, Order, MeasurementRecord, RecentActivity, NotificationLog } from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_WORKERS,
  INITIAL_MEASUREMENTS,
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITIES
} from '../data/initialData';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const KEYS = {
  CUSTOMERS: 'tailor_customers',
  WORKERS: 'tailor_workers',
  MEASUREMENTS: 'tailor_measurements',
  ORDERS: 'tailor_orders',
  NOTIFICATIONS: 'tailor_notifications',
  ACTIVITIES: 'tailor_activities',
};

// Initialize Firebase only if the user has completed setup
let db: any = null;
const isFirebaseConfigured = firebaseConfig && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'place_your_firebase_api_key_here';

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
}

// Low-level sync helpers
const syncToFirestore = async (collectionName: string, docId: string, data: any) => {
  if (!db) return;
  try {
    // Avoid saving undefined fields to firestore
    const cleanData = JSON.parse(JSON.stringify(data));
    await setDoc(doc(db, collectionName, docId), cleanData);
  } catch (err) {
    console.warn(`Firestore sync write error for ${collectionName}/${docId}:`, err);
  }
};

const deleteFromFirestore = async (collectionName: string, docId: string) => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (err) {
    console.warn(`Firestore sync delete error for ${collectionName}/${docId}:`, err);
  }
};

export const fetchAllFromFirestore = async () => {
  if (!db) return;
  try {
    // 1. Customers
    const customersSnap = await getDocs(collection(db, 'customers'));
    if (!customersSnap.empty) {
      const list: Customer[] = [];
      customersSnap.forEach(d => list.push(d.data() as Customer));
      localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(list));
    }

    // 2. Workers
    const workersSnap = await getDocs(collection(db, 'workers'));
    if (!workersSnap.empty) {
      const list: Worker[] = [];
      workersSnap.forEach(d => list.push(d.data() as Worker));
      localStorage.setItem(KEYS.WORKERS, JSON.stringify(list));
    }

    // 3. Measurements
    const measurementsSnap = await getDocs(collection(db, 'measurements'));
    if (!measurementsSnap.empty) {
      const list: MeasurementRecord[] = [];
      measurementsSnap.forEach(d => list.push(d.data() as MeasurementRecord));
      localStorage.setItem(KEYS.MEASUREMENTS, JSON.stringify(list));
    }

    // 4. Orders
    const ordersSnap = await getDocs(collection(db, 'orders'));
    if (!ordersSnap.empty) {
      const list: Order[] = [];
      ordersSnap.forEach(d => list.push(d.data() as Order));
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(list));
    }

    // 5. Notifications
    const notificationsSnap = await getDocs(collection(db, 'notifications'));
    if (!notificationsSnap.empty) {
      const list: NotificationLog[] = [];
      notificationsSnap.forEach(d => list.push(d.data() as NotificationLog));
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    }

    // 6. Activities
    const activitiesSnap = await getDocs(collection(db, 'activities'));
    if (!activitiesSnap.empty) {
      const list: RecentActivity[] = [];
      activitiesSnap.forEach(d => list.push(d.data() as RecentActivity));
      localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(list));
    }

    // Notify listeners to update view states
    window.dispatchEvent(new Event('firestore-sync-completed'));
  } catch (err) {
    console.error("Failed to fetch from Firestore:", err);
  }
};

// Auto boot async load if connected
if (isFirebaseConfigured) {
  fetchAllFromFirestore();
}

// 1. Customers
export const getCustomers = (): Customer[] => {
  const data = localStorage.getItem(KEYS.CUSTOMERS);
  if (!data) {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    if (db) {
      INITIAL_CUSTOMERS.forEach(cust => syncToFirestore('customers', cust.id, cust));
    }
    return INITIAL_CUSTOMERS;
  }
  return JSON.parse(data);
};

export const saveCustomers = (customers: Customer[]) => {
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  if (db) {
    // Save current items
    customers.forEach(cust => {
      syncToFirestore('customers', cust.id, cust);
    });
    // Async cleanup deleted profiles
    const localIds = new Set(customers.map(c => c.id));
    getDocs(collection(db, 'customers')).then(snap => {
      snap.forEach(docRef => {
        if (!localIds.has(docRef.id)) {
          deleteFromFirestore('customers', docRef.id);
        }
      });
    }).catch(err => console.warn(err));
  }
};

// 2. Workers
export const getWorkers = (): Worker[] => {
  const data = localStorage.getItem(KEYS.WORKERS);
  if (!data) {
    localStorage.setItem(KEYS.WORKERS, JSON.stringify(INITIAL_WORKERS));
    if (db) {
      INITIAL_WORKERS.forEach(w => syncToFirestore('workers', w.id, w));
    }
    return INITIAL_WORKERS;
  }
  return JSON.parse(data);
};

export const saveWorkers = (workers: Worker[]) => {
  localStorage.setItem(KEYS.WORKERS, JSON.stringify(workers));
  if (db) {
    workers.forEach(w => {
      syncToFirestore('workers', w.id, w);
    });
    const localIds = new Set(workers.map(w => w.id));
    getDocs(collection(db, 'workers')).then(snap => {
      snap.forEach(docRef => {
        if (!localIds.has(docRef.id)) {
          deleteFromFirestore('workers', docRef.id);
        }
      });
    }).catch(err => console.warn(err));
  }
};

// 3. Measurements
export const getMeasurements = (): MeasurementRecord[] => {
  const data = localStorage.getItem(KEYS.MEASUREMENTS);
  if (!data) {
    localStorage.setItem(KEYS.MEASUREMENTS, JSON.stringify(INITIAL_MEASUREMENTS));
    if (db) {
      INITIAL_MEASUREMENTS.forEach(m => syncToFirestore('measurements', m.id, m));
    }
    return INITIAL_MEASUREMENTS;
  }
  return JSON.parse(data);
};

export const saveMeasurements = (records: MeasurementRecord[]) => {
  localStorage.setItem(KEYS.MEASUREMENTS, JSON.stringify(records));
  if (db) {
    records.forEach(r => {
      syncToFirestore('measurements', r.id, r);
    });
    const localIds = new Set(records.map(r => r.id));
    getDocs(collection(db, 'measurements')).then(snap => {
      snap.forEach(docRef => {
        if (!localIds.has(docRef.id)) {
          deleteFromFirestore('measurements', docRef.id);
        }
      });
    }).catch(err => console.warn(err));
  }
};

// 4. Orders
export const getOrders = (): Order[] => {
  const data = localStorage.getItem(KEYS.ORDERS);
  if (!data) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    if (db) {
      INITIAL_ORDERS.forEach(o => syncToFirestore('orders', o.id, o));
    }
    return INITIAL_ORDERS;
  }
  return JSON.parse(data);
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  if (db) {
    orders.forEach(o => {
      syncToFirestore('orders', o.id, o);
    });
    const localIds = new Set(orders.map(o => o.id));
    getDocs(collection(db, 'orders')).then(snap => {
      snap.forEach(docRef => {
        if (!localIds.has(docRef.id)) {
          deleteFromFirestore('orders', docRef.id);
        }
      });
    }).catch(err => console.warn(err));
  }
};

// 5. Notifications
export const getNotifications = (): NotificationLog[] => {
  const data = localStorage.getItem(KEYS.NOTIFICATIONS);
  if (!data) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    if (db) {
      INITIAL_NOTIFICATIONS.forEach(n => syncToFirestore('notifications', n.id, n));
    }
    return INITIAL_NOTIFICATIONS;
  }
  return JSON.parse(data);
};

export const saveNotifications = (logs: NotificationLog[]) => {
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(logs));
  if (db) {
    logs.forEach(l => {
      syncToFirestore('notifications', l.id, l);
    });
    const localIds = new Set(logs.map(l => l.id));
    getDocs(collection(db, 'notifications')).then(snap => {
      snap.forEach(docRef => {
        if (!localIds.has(docRef.id)) {
          deleteFromFirestore('notifications', docRef.id);
        }
      });
    }).catch(err => console.warn(err));
  }
};

// 6. Activities
export const getActivities = (): RecentActivity[] => {
  const data = localStorage.getItem(KEYS.ACTIVITIES);
  if (!data) {
    localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    if (db) {
      INITIAL_ACTIVITIES.forEach(a => syncToFirestore('activities', a.id, a));
    }
    return INITIAL_ACTIVITIES;
  }
  return JSON.parse(data);
};

export const saveActivities = (activities: RecentActivity[]) => {
  localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(activities));
  if (db) {
    activities.forEach(a => {
      syncToFirestore('activities', a.id, a);
    });
    const localIds = new Set(activities.map(a => a.id));
    getDocs(collection(db, 'activities')).then(snap => {
      snap.forEach(docRef => {
        if (!localIds.has(docRef.id)) {
          deleteFromFirestore('activities', docRef.id);
        }
      });
    }).catch(err => console.warn(err));
  }
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
  saveActivities([newItem, ...list]);
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
  saveNotifications([newLog, ...list]);
};
