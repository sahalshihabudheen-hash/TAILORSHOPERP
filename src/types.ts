export type UserRole = 'Owner' | 'Manager' | 'Worker' | 'Customer';

export interface Customer {
  id: string; // Unique, e.g. CUST-101
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  qrCodeData: string;
  avatar: string;
  createdAt: string;
  passwordChanged: boolean;
  password?: string;
}

export interface MeasurementRecord {
  id: string;
  customerId: string;
  clothingType: string;
  date: string;
  fields: Record<string, string>; // Length, Chest, Waist, Collar, Sleeve, Inseam, Hips, Shoulder, etc.
  notes?: string;
}

export interface OrderNotes {
  instructions: string;       // Special Customer Instructions
  fabricDetails: string;      // Fabric Details
  urgentNotes: string;        // Urgent Delivery Notes
  tailorNotes: string;        // Internal Tailor Notes
  privateNotes: string;       // Private Notes Visible Only to Owner
}

export interface OrderImages {
  reference: string[];  // Uploaded Reference Images
  fabric: string[];     // Uploaded Fabric Images
  finished: string[];   // Uploaded Finished Product Images
}

export type OrderStatus =
  | 'Order Received'
  | 'Measurement Taken'
  | 'Cutting'
  | 'Stitching'
  | 'Finishing'
  | 'Ready for Pickup'
  | 'Delivered';

export interface Order {
  id: string; // Unique, e.g. ORD-1002
  customerId: string;
  clothingType: string;
  quantity: number;
  deliveryDate: string;
  status: OrderStatus;
  assignedWorkerId?: string;
  notes: OrderNotes;
  images: OrderImages;
  price: number;
  advancePayment: number;
  remainingBalance: number;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Fully Paid';
  createdAt: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'Master Cutter' | 'Senior Stitcher' | 'Finisher & Ironer' | 'Apprentice';
  rating: number;
  baseSalary: number;
  perOrderBonus: number;
  avatar: string;
  location?: string;
}

export interface PaymentInvoice {
  id: string;
  orderId: string;
  customerId: string;
  date: string;
  amountPaid: number;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'UPI';
}

export interface NotificationLog {
  id: string;
  type: 'WhatsApp' | 'Email';
  recipient: string;
  message: string;
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Pending';
}

export interface RecentActivity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
}
