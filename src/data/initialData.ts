import { Customer, Worker, Order, MeasurementRecord, RecentActivity, NotificationLog } from '../types';

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'WORK-01',
    name: 'Master Rashid Sheikh',
    phone: '+1 (555) 111-2222',
    email: 'rashid.cutter@tailorshop.com',
    role: 'Master Cutter',
    rating: 4.9,
    baseSalary: 2800,
    perOrderBonus: 25,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'WORK-02',
    name: 'Aslam Khan',
    phone: '+1 (555) 333-4444',
    email: 'aslam.stitcher@tailorshop.com',
    role: 'Senior Stitcher',
    rating: 4.7,
    baseSalary: 2200,
    perOrderBonus: 15,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'WORK-03',
    name: 'Elena Rostova',
    phone: '+1 (555) 555-6666',
    email: 'elena.finisher@tailorshop.com',
    role: 'Finisher & Ironer',
    rating: 4.8,
    baseSalary: 1800,
    perOrderBonus: 10,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
  }
];

export const INITIAL_MEASUREMENTS: MeasurementRecord[] = [
  // Sarah's measurements
  {
    id: 'MSR-201',
    customerId: 'CUST-101',
    clothingType: 'Suit',
    date: '2026-05-10T10:15:00Z',
    fields: {
      Shoulder: '15.5"',
      Chest: '36"',
      Waist: '28"',
      Hips: '38"',
      Sleeve: '23"',
      Length: '27"',
      Collar: '14.5"',
      Inseam: '29.5"'
    },
    notes: 'Slightly loose waist required. Double vent jacket. Classic lining.'
  },
  {
    id: 'MSR-202',
    customerId: 'CUST-101',
    clothingType: 'Suit',
    date: '2026-06-02T16:00:00Z',
    fields: {
      Shoulder: '15.5"',
      Chest: '35.5"',
      Waist: '27.5"',
      Hips: '38"',
      Sleeve: '23.25"',
      Length: '27"',
      Collar: '14.5"',
      Inseam: '29.5"'
    },
    notes: 'Adjusted sleeves length by 0.25 inch. Tightened chest slightly.'
  },
  // Michael's measurements
  {
    id: 'MSR-203',
    customerId: 'CUST-102',
    clothingType: 'Shirt',
    date: '2026-05-15T11:45:00Z',
    fields: {
      Collar: '16"',
      Chest: '41"',
      Waist: '35"',
      Sleeve: '34"',
      Length: '30"',
      Cuff: '9.25"'
    },
    notes: 'Slim fit cut, French cuffs requested.'
  },
  // Amina's measurements
  {
    id: 'MSR-204',
    customerId: 'CUST-103',
    clothingType: 'Kurta',
    date: '2026-05-20T09:30:00Z',
    fields: {
      Shoulder: '16.5"',
      Chest: '42"',
      Waist: '38"',
      Seat: '44"',
      Sleeve: '24"',
      Length: '43"',
      Collar: '15.5"',
      BottomWidth: '26"'
    },
    notes: 'Mandarin collar style, side pockets needed.'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-9841',
    customerId: 'CUST-101',
    clothingType: 'Suit',
    quantity: 1,
    deliveryDate: '2026-06-08',
    status: 'Stitching',
    assignedWorkerId: 'WORK-02',
    notes: {
      instructions: 'Premium dark charcoal virgin wool suit. Italian cut style.',
      fabricDetails: 'VBC 110s Charcoal Wool Fabric - Ref #W402',
      urgentNotes: 'Customer requested delivery before the annual gala on June 9.',
      tailorNotes: 'Ensure 0.5-inch extra seam allowance at hips.',
      privateNotes: 'Very important repeat customer. Offer premium packaging and handwritten thank-you card.'
    },
    images: {
      reference: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=300'],
      fabric: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=300'],
      finished: []
    },
    price: 850,
    advancePayment: 400,
    remainingBalance: 450,
    paymentStatus: 'Partially Paid',
    createdAt: '2026-05-10T10:30:00Z'
  },
  {
    id: 'ORD-9842',
    customerId: 'CUST-102',
    clothingType: 'Shirt',
    quantity: 3,
    deliveryDate: '2026-06-12',
    status: 'Cutting',
    assignedWorkerId: 'WORK-01',
    notes: {
      instructions: '3 Premium white business shirts. Monogram letters "MC" inside collar.',
      fabricDetails: 'Italian Giza Egyptian Cotton - Pure White',
      urgentNotes: '',
      tailorNotes: 'Fit MUST match MSR-203 precisely.',
      privateNotes: 'Referred by Dr. Al-Mansoor.'
    },
    images: {
      reference: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=300'],
      fabric: ['https://images.unsplash.com/photo-1524388680868-377a2e6bbb1c?auto=format&fit=crop&q=80&w=300'],
      finished: []
    },
    price: 360,
    advancePayment: 360,
    remainingBalance: 0,
    paymentStatus: 'Fully Paid',
    createdAt: '2026-05-15T12:00:00Z'
  },
  {
    id: 'ORD-9843',
    customerId: 'CUST-103',
    clothingType: 'Kurta',
    quantity: 2,
    deliveryDate: '2026-06-05',
    status: 'Ready for Pickup',
    assignedWorkerId: 'WORK-03',
    notes: {
      instructions: 'Indigo dyed embroidery Kurta with straight-cut pajamas.',
      fabricDetails: 'Handloom Cotton-Silk blend - Indigo blue',
      urgentNotes: 'Delivery date is early-June, keep checked.',
      tailorNotes: 'Completed embroidery checks. Ironing completed by worker Elena.',
      privateNotes: 'Amina is a VIP clothing influencer.'
    },
    images: {
      reference: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300'],
      fabric: ['https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=300'],
      finished: ['https://images.unsplash.com/photo-1607513546755-17170ab9d4a4?auto=format&fit=crop&q=80&w=300']
    },
    price: 280,
    advancePayment: 150,
    remainingBalance: 130,
    paymentStatus: 'Partially Paid',
    createdAt: '2026-05-20T10:00:00Z'
  },
  {
    id: 'ORD-9844',
    customerId: 'CUST-104',
    clothingType: 'Pant',
    quantity: 2,
    deliveryDate: '2026-05-30',
    status: 'Delivered',
    assignedWorkerId: 'WORK-02',
    notes: {
      instructions: 'Grey wool trousers with watch pocket and cuffs.',
      fabricDetails: 'Super merino wool - light grey Tweed fabric',
      urgentNotes: '',
      tailorNotes: 'Hemmed manually with clean hand stitches.',
      privateNotes: ''
    },
    images: {
      reference: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=300'],
      fabric: ['https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=300'],
      finished: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=300']
    },
    price: 220,
    advancePayment: 220,
    remainingBalance: 0,
    paymentStatus: 'Fully Paid',
    createdAt: '2026-05-25T15:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'NOT-001',
    type: 'WhatsApp',
    recipient: '+15552345678',
    message: 'Hello Sarah, your Order #ORD-9841 of Suit was successfully registered. Adv paid: $400, bal: $450. Thank you for choosing Tailor Shop!',
    timestamp: '2026-05-10T10:31:00Z',
    status: 'Delivered'
  },
  {
    id: 'NOT-002',
    type: 'Email',
    recipient: 'sarah.r@example.com',
    message: 'Subject: Tailor Shop Order #ORD-9841 status updated. Your Suit order is now in Stitching stage.',
    timestamp: '2026-05-22T08:00:00Z',
    status: 'Sent'
  },
  {
    id: 'NOT-003',
    type: 'WhatsApp',
    recipient: '+15557654321',
    message: 'Hurray Amina Al-Mansoor! Your Order #ORD-9843 of Kurta has been finished and is ready for pickup! Remaining balance is $130.',
    timestamp: '2026-06-03T14:20:00Z',
    status: 'Delivered'
  }
];

export const INITIAL_ACTIVITIES: RecentActivity[] = [
  {
    id: 'ACT-001',
    action: 'Order Customization',
    details: 'Placed new Suit order #ORD-9841 for client Sarah Rahman.',
    timestamp: '2026-05-10T10:30:00Z',
    userRole: 'Owner',
    userName: 'Shop Owner'
  },
  {
    id: 'ACT-002',
    action: 'Task Assignment',
    details: 'Assigned Stitching of Order #ORD-9841 to Aslam Khan.',
    timestamp: '2026-05-10T10:35:00Z',
    userRole: 'Manager',
    userName: 'Manager Dashboard'
  },
  {
    id: 'ACT-003',
    action: 'Measurements Taken',
    details: 'Sarah updated suit sizing after minor change request.',
    timestamp: '2026-06-02T16:00:00Z',
    userRole: 'Owner',
    userName: 'Shop Owner'
  },
  {
    id: 'ACT-004',
    action: 'Status Tracking',
    details: 'Elena completed finishing on Amina\'s Kurta #ORD-9843.',
    timestamp: '2026-06-03T14:15:00Z',
    userRole: 'Worker',
    userName: 'Elena Rostova'
  }
];
