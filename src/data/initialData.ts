import { Customer, Worker, Order, MeasurementRecord, RecentActivity, NotificationLog } from '../types';

// Helper to generate deterministic lists of data so we have highly realistic mock data for sahalshihabudheen@gmail.com
const maleFirstNames = [
  "Rahul", "Aditya", "Arjun", "Abhishek", "Vijay", "Anand", "Rohan", "Siddharth", "Gautam", 
  "Vikram", "Pranav", "Karthik", "Hari", "Deepak", "Sanjay", "Vivek", "Akash", "Manoj", "Kiran",
  "Dev", "Amit", "Sumit", "Raj", "Varun", "Abhay"
];

const femaleFirstNames = [
  "Anjali", "Priya", "Sneha", "Riya", "Nehal", "Divya", "Pooja", "Meera", "Swati", "Shruti", 
  "Kavya", "Aisha", "Zara", "Amina", "Nisha", "Aparna", "Geetha", "Lakshmi", "Parvathy", "Anupama",
  "Kirti", "Snehal", "Priyanka", "Ritu", "Neha"
];

const lastNames = [
  "Menon", "Nair", "Pillai", "Sharma", "Varma", "Shihab", "Das", "Roy", "Nambiar", "Iyer", 
  "Kumar", "Singh", "Patel", "Reddy", "Mehta", "Joshi", "Sen", "Rao", "Shetty", "Fernandez", 
  "D'Souza", "Thomas", "Mathew", "George", "Kurian", "Paul", "Varghese", "Abraham", "Joseph"
];

const cities = [
  "Kochi, Kerala", "Trivandrum, Kerala", "Calicut, Kerala", "Thrissur, Kerala", "Kottayam, Kerala",
  "Bangalore, Karnataka", "Chennai, Tamil Nadu", "Mumbai, Maharashtra", "Delhi, NCR", "Hyderabad, Telangana"
];

const clothingTypes = ["Shirt", "Suit", "Trousers", "Korta", "Sherwani", "Blouse", "Lehenga"];

// Generate 400 unique customers
const customersList: Customer[] = [];
for (let i = 1; i <= 400; i++) {
  const isMale = i % 2 === 0;
  const firstName = isMale 
    ? maleFirstNames[(i - 1) % maleFirstNames.length] 
    : femaleFirstNames[(i - 1) % femaleFirstNames.length];
  const lastName = lastNames[(i * 7) % lastNames.length];
  const name = `${firstName} ${lastName}`;
  const phone = `+91 9446${String(10000 + i * 179).slice(0, 6)}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`;
  const city = cities[(i * 3) % cities.length];
  
  customersList.push({
    id: `CUST-SH-${100 + i}`,
    name,
    phone,
    whatsapp: phone,
    email,
    address: `Bespoke Wardrobe #${200 + i}, MG Road, ${city}`,
    qrCodeData: `https://tailorshop-erp.com/customer/CUST-SH-${100 + i}`,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${firstName}${lastName}`,
    createdAt: new Date(2026, 4, 1 + (i % 25)).toISOString(),
    passwordChanged: false,
    password: `pass${100 + i}`
  });
}

// Generate 10 workers with diverse roles and skills
const workerConfigs = [
  { name: "Rajesh Kumar", role: "Master Cutter", skills: ["Suit Cutting", "Pattern Making", "Double-Breasted", "Canvas Drafting"], baseSalary: 28000, perOrderBonus: 350 },
  { name: "Mohammad Shafi", role: "Senior Stitcher", skills: ["Jacket Assembly", "Basting", "Lining Attachment", "Buttonholes"], baseSalary: 24000, perOrderBonus: 250 },
  { name: "Anwar Ali", role: "Master Cutter", skills: ["Trousers Cutting", "Waistcoat Design", "Sherwani Drafting"], baseSalary: 27000, perOrderBonus: 300 },
  { name: "Devassy John", role: "Senior Stitcher", skills: ["Trouser Stitching", "Piping", "Zipper fly drafting"], baseSalary: 22000, perOrderBonus: 200 },
  { name: "Ramesh Pillai", role: "Finisher & Ironer", skills: ["Steam Pressing", "Hand Hemming", "Quality Auditing", "Packaging"], baseSalary: 18000, perOrderBonus: 100 },
  { name: "Suresh Nair", role: "Tailor", skills: ["Casual Shirt Stitching", "Collar Attachment", "Cuff Stitching"], baseSalary: 20000, perOrderBonus: 150 },
  { name: "Sreedevi Amma", role: "Senior Stitcher", skills: ["Blouse Stitching", "Lehenga Embroidery", "Sari Pleating"], baseSalary: 25000, perOrderBonus: 250 },
  { name: "Arun George", role: "Apprentice", skills: ["Basting", "Marking", "Button Stitching"], baseSalary: 12000, perOrderBonus: 50 },
  { name: "Meera Nambiar", role: "Manager", skills: ["Order Tracking", "Customer Liaison", "Inventory Management"], baseSalary: 30000, perOrderBonus: 200 },
  { name: "Karan Singh", role: "Apprentice", skills: ["Fabric Cleaning", "Pattern Stamping", "Ironing Support"], baseSalary: 11500, perOrderBonus: 50 }
];

const workersList: Worker[] = workerConfigs.map((config, idx) => ({
  id: `WRK-SH-${100 + idx}`,
  name: config.name,
  phone: `+91 9895${String(20000 + idx * 347).slice(0, 6)}`,
  email: `${config.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
  role: config.role as any,
  rating: 4.2 + (idx % 3) * 0.3,
  baseSalary: config.baseSalary,
  perOrderBonus: config.perOrderBonus,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${config.name.replace(/\s+/g, '')}`,
  skills: config.skills,
  location: "Main Atelier Floor",
  hasRegisteredShop: true,
  shopName: "TAILORSHOP ERP",
  shopOwnerId: "TLR-SAHAL",
  shopOwnerEmail: "sahalshihabudheen@gmail.com",
  shopLogoUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop"
}));

// Generate measurements for customers
const measurementsList: MeasurementRecord[] = [];
customersList.forEach((cust, idx) => {
  // Each customer has 1 or 2 clothing types measured
  const mainType = clothingTypes[idx % clothingTypes.length];
  const secondaryType = clothingTypes[(idx + 3) % clothingTypes.length];
  
  const generateFields = (type: string) => {
    if (type === "Shirt" || type === "Korta") {
      return { Length: "28.5", Chest: "39.5", Waist: "35.0", Collar: "15.5", Sleeve: "24.5", Shoulder: "18.0" };
    } else if (type === "Trousers") {
      return { Length: "40.0", Waist: "32.5", Hips: "38.0", Inseam: "30.0", Bottom: "14.5" };
    } else if (type === "Suit" || type === "Sherwani") {
      return { "Jacket Length": "29.0", Chest: "40.0", Waist: "36.0", Shoulder: "18.5", Sleeve: "25.0", "Trouser Length": "40.5", "Trouser Waist": "33.0" };
    } else {
      return { Length: "14.5", Bust: "36.0", Waist: "29.5", Shoulder: "14.0", "Arm Hole": "16.0", "Sleeve Length": "10.0" };
    }
  };

  measurementsList.push({
    id: `MEAS-SH-${1000 + idx}`,
    customerId: cust.id,
    clothingType: mainType,
    date: new Date(2026, 4, 15 + (idx % 10)).toISOString(),
    fields: generateFields(mainType),
    notes: `Standard premium comfort fit. Client prefers breathable spacing.`,
    tailorId: "TLR-SAHAL",
    shopName: "TAILORSHOP ERP"
  });

  if (idx % 3 === 0) {
    measurementsList.push({
      id: `MEAS-SH-${2000 + idx}`,
      customerId: cust.id,
      clothingType: secondaryType,
      date: new Date(2026, 4, 18 + (idx % 10)).toISOString(),
      fields: generateFields(secondaryType),
      notes: `Special festive attire measurements. Perfect styling required.`,
      tailorId: "TLR-SAHAL",
      shopName: "TAILORSHOP ERP"
    });
  }
});

// Generate 120 active/delivered orders across customers
const ordersList: Order[] = [];
const orderStatuses: Array<any> = [
  'Order Received',
  'Measurement Taken',
  'Cutting',
  'Stitching',
  'Finishing',
  'Ready for Pickup',
  'Delivered'
];

for (let i = 1; i <= 400; i++) {
  const custIdx = (i * 13) % customersList.length;
  const customer = customersList[custIdx];
  const clothType = clothingTypes[i % clothingTypes.length];
  const workerIdx = (i * 3) % workersList.length;
  const assignedWorker = workersList[workerIdx];
  
  const price = 1200 + (i % 5) * 600 + (clothType === "Suit" || clothType === "Sherwani" ? 3500 : 0);
  const advance = Math.round(price * 0.4);
  const remaining = price - advance;
  const payStatus = i % 3 === 0 ? "Fully Paid" : i % 3 === 1 ? "Partially Paid" : "Unpaid";

  ordersList.push({
    id: `ORD-SH-${1000 + i}`,
    customerId: customer.id,
    clothingType: clothType,
    quantity: 1,
    deliveryDate: new Date(2026, 5, 10 + (i % 20)).toISOString(),
    status: orderStatuses[i % orderStatuses.length],
    assignedWorkerId: assignedWorker.id,
    notes: {
      instructions: `Please ensure double reinforced buttons. Extra margin of 1 inch on the side seams.`,
      fabricDetails: `Italian Premium Wool Blend, Deep Navy Blue Color`,
      urgentNotes: i % 7 === 0 ? "URGENT: Required for family wedding event." : "",
      tailorNotes: `Pattern designed by Rajesh Kumar. Check collar lining stiffener.`,
      privateNotes: `VVIP Customer. Regular client, ensure stellar finishing.`
    },
    images: {
      reference: [
        "https://images.unsplash.com/photo-1598808503742-dd34bd039275?w=500&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500&auto=format&fit=crop"
      ],
      fabric: [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop"
      ],
      finished: i % 4 === 0 ? [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop"
      ] : []
    },
    price,
    advancePayment: payStatus === "Fully Paid" ? price : payStatus === "Partially Paid" ? advance : 0,
    remainingBalance: payStatus === "Fully Paid" ? 0 : payStatus === "Partially Paid" ? remaining : price,
    paymentStatus: payStatus as any,
    createdAt: new Date(2026, 4, 10 + (i % 15)).toISOString(),
    shopName: "TAILORSHOP ERP"
  });
}

// Recent activities
const activitiesList: RecentActivity[] = [
  { id: "ACT-1", action: "Sign In", details: "Sahal Shihabudheen logged into Sahal's Bespoke Atelier workstation", timestamp: new Date(2026, 5, 22, 9, 15).toISOString(), userRole: "Owner", userName: "Sahal Shihabudheen" },
  { id: "ACT-2", action: "Order Received", details: "Booked Navy Blue Bespoke Suit commission for Rahul Nair", timestamp: new Date(2026, 5, 22, 10, 30).toISOString(), userRole: "Owner", userName: "Sahal Shihabudheen" },
  { id: "ACT-3", action: "Measurement Taken", details: "Logged fresh clothing metrics for Priya Pillai (Korta)", timestamp: new Date(2026, 5, 22, 11, 45).toISOString(), userRole: "Owner", userName: "Sahal Shihabudheen" },
  { id: "ACT-4", action: "Staff Added", details: "Registered Rajesh Kumar in workers roster with Master Cutter clearances", timestamp: new Date(2026, 5, 22, 12, 0).toISOString(), userRole: "Owner", userName: "Sahal Shihabudheen" }
];

export const INITIAL_CUSTOMERS: Customer[] = customersList;
export const INITIAL_WORKERS: Worker[] = workersList;
export const INITIAL_MEASUREMENTS: MeasurementRecord[] = measurementsList;
export const INITIAL_ORDERS: Order[] = ordersList;
export const INITIAL_NOTIFICATIONS: NotificationLog[] = [];
export const INITIAL_ACTIVITIES: RecentActivity[] = activitiesList;
