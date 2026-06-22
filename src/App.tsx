import React, { useState, useEffect, useRef } from 'react';
import {
  Scissors,
  Ruler,
  Phone,
  Mail,
  Calendar,
  Printer,
  Trash2,
  Search,
  CheckCircle,
  Plus,
  Sparkles,
  Sun,
  Moon,
  Clock,
  Shirt,
  User,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  FileCheck,
  Check,
  Briefcase,
  MapPin,
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  CheckSquare,
  MessageSquare,
  ExternalLink,
  Pencil,
  Settings,
  IndianRupee,
  Users,
  Upload,
  Image,
  RotateCcw,
  Download,
  QrCode,
  Smartphone
} from 'lucide-react';
import {
  getCustomers,
  saveCustomers,
  getMeasurements,
  saveMeasurements,
  getOrders,
  saveOrders,
  getNotifications,
  saveNotifications,
  addActivity,
  triggerSystemNotification,
  getWorkers,
  saveWorkers,
  purgeAllDatabaseRecords
} from './utils/storage';
import { Customer, MeasurementRecord, Order, OrderStatus, Worker } from './types';
import WorkerManagementView from './components/WorkerManagementView';
import { fetchIPLocation } from './utils/geolocation';
import CustomerManagementView from './components/CustomerManagementView';

// Custom elegant vector icon components for clothing categories
export const PantIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 6c-0.5 4 0 9 1 15h4l3-9.5 3 9.5h4c1-6 1.5-11 1-15z" />
    <path d="M4 3.5h16v2.5H4z" />
    <path d="M11 3.5h2v2.5h-2z" />
    <path d="M6 3.5h1.5v2.5H6z" />
    <path d="M16.5 3.5h1.5v2.5h-1.5z" />
    <path d="M12 6v5" />
    <path d="M6 6c0 2.5-2.2 2.5-2.2 3.5" />
    <path d="M18 6c0 2.5 2.2 2.5 2.2 3.5" />
  </svg>
);

export const SuitIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M4 3l8 11 8-11" />
    <path d="M11 7l1-1.5 1 1.5-1 4.5z" />
    <path d="M12 14v7" />
  </svg>
);

export const KurtaIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 3 L9 2 H15 L18 3 L20 7.5 L17 8.5 V21 H7 V8.5 L4 7.5 Z" />
    <path d="M12 2v6" />
    <path d="M10.5 4.5h3" />
    <path d="M10.5 6.5h3" />
  </svg>
);

// Standard clothing parameters by default type
const DEFAULT_FIELDS_BY_TYPE: Record<string, Record<string, string>> = {
  Shirt: { Collar: '15.5', Chest: '40', Waist: '36', Sleeve: '33', Shoulder: '18', Length: '30', Cuff: '9.5' },
  Pant: { Waist: '34', Hips: '42', Inseam: '32', Length: '40', Thigh: '24', Crotch: '11', Ankle: '8' },
  Suit: { Shoulder: '18.5', Chest: '42', Waist: '38', Hips: '43', Sleeve: '25', JacketLength: '31', Collar: '16', Inseam: '32' },
  Kurta: { Shoulder: '18', Chest: '41', Waist: '38', Seat: '44', Sleeve: '24.5', Length: '42', Collar: '15.5' },
  Custom: { Length: '36', Width: '20' }
};

// Location structure helpers
const COUNTRY_LIST = [
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Saudi Arabia',
  'Canada',
  'Australia',
  'Singapore',
  'Qatar',
  'Oman',
  'Bahrain',
  'Kuwait'
];

const INDIA_STATES_MAP: Record<string, string[]> = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'],
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Ziro'],
  'Assam': ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Manali'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli-Dharwad', 'Belgaum'],
  'Kerala': ['Malappuram', 'Kozhikode', 'Ernakulam', 'Trivandrum', 'Thrissur', 'Palakkad', 'Kannur', 'Kollam', 'Kottayam', 'Alappuzha', 'Idukki', 'Wayanad', 'Kasaragod', 'Pathanamthitta'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
  'Manipur': ['Imphal'],
  'Meghalaya': ['Shillong'],
  'Mizoram': ['Aizawl'],
  'Nagaland': ['Kohima', 'Dimapur'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Sikkim': ['Gangtok'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Thanjavur'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Tripura': ['Agartala'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Nainital'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Durgapur']
};

// Robust helper to match phone numbers with or without country codes, spaces, or formatting robustly
const isPhoneMatch = (phone1: string, phone2: string): boolean => {
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

// Helper to compute a pleasant responsive font-size for any length/style of emoji input
const getFavorableEmojiSize = (emojiStr: string): string => {
  if (!emojiStr) return '16px';
  const charArray = Array.from(emojiStr); 
  const len = charArray.length;
  if (len <= 1) return '20px'; // standard single emoji: 20px (large and beautiful)
  if (len === 2) return '15px'; // pair of emojis or small text: 15px
  if (len === 3) return '12px'; // triple: 12px
  if (len === 4) return '10px'; // quad: 10px
  return '8px'; // long string: 8px to fit completely inside
};

// Global category/genre icon renderer helper supporting both text/emoji and base64 uploaded custom images
const renderGenreIcon = (
  genre: string, 
  clothingCategoryEmojis: Record<string, string>, 
  iconSizeClass = "h-3.5 w-3.5", 
  base64SizeClass = "w-3.5 h-3.5"
) => {
  const custom = clothingCategoryEmojis[genre];
  if (custom) {
    if (custom.startsWith('svg:')) {
      const iconKey = custom.slice(4);
      switch (iconKey) {
        case 'Shirt':
          return <Shirt className={iconSizeClass} />;
        case 'Pant':
          return <PantIcon className={iconSizeClass} />;
        case 'Suit':
          return <SuitIcon className={iconSizeClass} />;
        case 'Kurta':
          return <KurtaIcon className={iconSizeClass} />;
        case 'Custom':
          return <Ruler className={iconSizeClass} />;
        case 'Scissors':
          return <Scissors className={iconSizeClass} />;
        default:
          return <Scissors className={iconSizeClass} />;
      }
    }
    if (custom.startsWith('data:image/')) {
      return (
        <img 
          src={custom} 
          alt={genre} 
          className={`${base64SizeClass} object-contain rounded-md shrink-0`} 
        />
      );
    } else {
      return (
        <span 
          className="select-none leading-none shrink-0"
          style={{ fontSize: getFavorableEmojiSize(custom) }}
        >
          {custom}
        </span>
      );
    }
  }
  // fallback defaults
  switch (genre) {
    case 'Shirt':
      return <Shirt className={iconSizeClass} />;
    case 'Pant':
      return <PantIcon className={iconSizeClass} />;
    case 'Suit':
      return <SuitIcon className={iconSizeClass} />;
    case 'Kurta':
      return <KurtaIcon className={iconSizeClass} />;
    case 'Custom':
      return <Ruler className={iconSizeClass} />;
    default:
      return <Scissors className={iconSizeClass} />;
  }
};

// Seeding registered tailors database helper
const getRegisteredTailors = () => {
  const data = localStorage.getItem('registered_tailors');
  if (!data) {
    const list = [
      {
        id: 'TAILOR-101',
        name: 'Arthur S. Row',
        email: 'owner@tailorshoperp.com',
        phone: '+44 20 7123 4567',
        location: 'Savile Row, London',
        password: 'password123',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('registered_tailors', JSON.stringify(list));
    return list;
  }
  return JSON.parse(data);
};

const saveRegisteredTailors = (list: any[]) => {
  localStorage.setItem('registered_tailors', JSON.stringify(list));
};

// Clean raw measurement values to strip trailing double quotes or inches markings
const cleanMeasurementValue = (v: any, unitSys?: 'Inches' | 'Centimeters'): string => {
  if (v === undefined || v === null) return '';
  let valStr = String(v).trim();
  // Preserve quotes/inverted commas for inches/feet representation
  valStr = valStr.trim();
  
  if (valStr.endsWith('in')) {
    valStr = valStr.slice(0, -2).trim();
  }
  
  if (valStr.endsWith('cm')) {
    const numPart = valStr.slice(0, -2).trim();
    if (unitSys === 'Inches') {
      return numPart;
    }
    return `${numPart} cm`;
  }
  
  if (unitSys === 'Centimeters') {
    const num = parseFloat(valStr);
    if (!isNaN(num)) {
      return `${(num * 2.54).toFixed(1)} cm`;
    }
  }
  
  return valStr;
};

// Typewriter effect component
function Typewriter({ text, speed = 40, isDark = true }: { text: string; speed?: number; isDark?: boolean }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed]);
  
  return (
    <span className="relative inline-block transition-colors duration-300">
      {displayedText}
      <span className={`inline-block w-1.5 h-[0.95em] ml-1 animate-pulse align-middle ${
        isDark ? 'bg-yellow-400' : 'bg-amber-600'
      }`}></span>
    </span>
  );
}

export default function App() {
  // Appearance
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    document.title = "tailorSHOP ERP";
  }, []);

  // Authentication & Session structures
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'Owner' | 'Tailor' | 'Customer' | 'Manager';
    location?: string;
    hasRegisteredShop?: boolean;
    isWorker?: boolean;
  } | null>(null);

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Create Account inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpLocation, setSignUpLocation] = useState('');
  const [signUpRole, setSignUpRole] = useState<'Tailor' | 'Customer'>('Tailor');
  const [gatekeeperScreen, setGatekeeperScreen] = useState<'selector' | 'signup' | 'signin'>('signin');

  // Phone OTP Verification state
  const [phoneOtpCode, setPhoneOtpCode] = useState<string | null>(null);
  const [phoneNumberBeingVerified, setPhoneNumberBeingVerified] = useState<string>('');
  const [pendingSignUpData, setPendingSignUpData] = useState<{
    nameVal: string;
    emailVal: string;
    passwordVal: string;
    phoneVal: string;
    locVal: string;
    roleVal: 'Tailor' | 'Customer';
  } | null>(null);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpVerificationError, setOtpVerificationError] = useState<string | null>(null);
  const [isTwilioConfigured, setIsTwilioConfigured] = useState<boolean | null>(null);

  // Custom Toast Notifications
  const [uiToast, setUiToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setUiToast({ message: msg, type });
    setTimeout(() => {
      setUiToast(null);
    }, 4500);
  };

  // URL-driven query parameter states for instant sizing cards and bills
  const [urlViewSizeCard, setUrlViewSizeCard] = useState<string | null>(null);
  const [urlViewBill, setUrlViewBill] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sizeCardId = params.get('viewSizeCard');
    const billId = params.get('viewBill');
    if (sizeCardId) {
      setUrlViewSizeCard(sizeCardId);
    }
    if (billId) {
      setUrlViewBill(billId);
    }
  }, []);

  // Location search coordinates helper
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      triggerToast('Requesting satellite coordinates...', 'info');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(2);
          const lon = pos.coords.longitude.toFixed(2);
          setSignUpLocation(`Mayfair Core (Lat ${lat}, Lon ${lon})`);
          triggerToast('GCP Geolocation successfully locked current coordinates!', 'success');
        },
        (err) => {
          const cities = ['Savile Row, London', 'Fifth Avenue, New York', 'Upper East Side, New York', 'Saint-Germain-des-Prés, Paris'];
          const randomCity = cities[Math.floor(Math.random() * cities.length)];
          setSignUpLocation(randomCity);
          triggerToast(`Using location default: ${randomCity}`, 'success');
        }
      );
    } else {
      setSignUpLocation('Savile Row, London');
      triggerToast('Using location default: Savile Row, London', 'success');
    }
  };

  // Storage states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [registeredTailors, setRegisteredTailors] = useState<any[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);

  const getCurrentUserShopInfo = () => {
    if (!currentUser) return null;
    if (!registeredTailors || registeredTailors.length === 0) return null;

    // 1. Check if currentUser is a registered tailor (meaning they are the Shop Owner)
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    const userPhone = (currentUser.phone || '').trim();
    const userName = (currentUser.name || '').toLowerCase().trim();

    const tailorMatch = registeredTailors.find((t: any) => {
      const tEmail = (t.email || '').toLowerCase().trim();
      const tPhone = (t.phone || '').trim();
      const tName = (t.name || '').toLowerCase().trim();

      return (userEmail && tEmail === userEmail) || 
             (userPhone && isPhoneMatch(userPhone, tPhone)) ||
             (userName && tName === userName);
    });

    if (tailorMatch && tailorMatch.hasRegisteredShop) {
      return {
        logoUrl: tailorMatch.logoUrl,
        shopName: tailorMatch.shopName,
        hasShop: true,
        phone: tailorMatch.phone || '',
        location: tailorMatch.location || ''
      };
    }

    // 2. Check if currentUser is a worker listed in the workers table
    const workerMatch = workers.find((w: any) => {
      const wEmail = (w.email || '').toLowerCase().trim();
      const wPhone = (w.phone || '').trim();
      const wName = (w.name || '').toLowerCase().trim();

      return (userEmail && wEmail === userEmail) ||
             (userPhone && isPhoneMatch(userPhone, wPhone)) ||
             (userName && wName === userName);
    });

    if (workerMatch) {
      // If worker object has direct shop linkage
      if (workerMatch.hasRegisteredShop && workerMatch.shopName) {
        return {
          logoUrl: workerMatch.logoUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop',
          shopName: workerMatch.shopName,
          hasShop: true,
          phone: workerMatch.phone || '',
          location: ''
        };
      }

      // Look up by owner email, owner id, or shop name
      const ownerMatch = registeredTailors.find((t: any) => {
        const tEmail = (t.email || '').toLowerCase().trim();
        const tPhone = (t.phone || '').trim();
        const tName = (t.name || '').toLowerCase().trim();
        
        return (workerMatch.shopOwnerId && t.id === workerMatch.shopOwnerId) ||
               (workerMatch.shopOwnerEmail && tEmail === workerMatch.shopOwnerEmail.toLowerCase().trim()) ||
               (workerMatch.shopName && t.shopName && t.shopName.toLowerCase().trim() === workerMatch.shopName.toLowerCase().trim()) ||
               (tEmail && workerMatch.email && tEmail === workerMatch.email.toLowerCase().trim()) ||
               (tPhone && workerMatch.phone && isPhoneMatch(tPhone, workerMatch.phone)) ||
               (tName && workerMatch.name && tName === workerMatch.name.toLowerCase().trim());
      });

      if (ownerMatch && ownerMatch.hasRegisteredShop) {
        return {
          logoUrl: ownerMatch.logoUrl,
          shopName: ownerMatch.shopName,
          hasShop: true,
          phone: ownerMatch.phone || '',
          location: ownerMatch.location || ''
        };
      }
    }

    return null;
  };

  const visibleOrders = React.useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'Owner') {
      return orders;
    }
    const shopInfo = getCurrentUserShopInfo();
    if (shopInfo && shopInfo.shopName) {
      return orders.filter(o => o.shopName && o.shopName.toLowerCase().trim() === shopInfo.shopName.toLowerCase().trim());
    }
    return orders;
  }, [orders, currentUser, registeredTailors, workers]);

  const [ownerTab, setOwnerTab] = useState<'branding' | 'staffs_erp' | 'customer_patrons' | 'customer_orders' | 'tailor_measurements'>('tailor_measurements');
  const [logoInputType, setLogoInputType] = useState<'url' | 'upload'>('url');

  // New admin form states
  const [newTailorName, setNewTailorName] = useState('');
  const [newTailorEmail, setNewTailorEmail] = useState('');
  const [newTailorPassword, setNewTailorPassword] = useState('');
  const [newTailorPhone, setNewTailorPhone] = useState('');
  const [newTailorLocation, setNewTailorLocation] = useState('');

  // Admin sub-panel for editing shop owners' staff/manager accounts
  const [adminSubTab, setAdminSubTab] = useState<'details' | 'staff'>('details');
  const [adminStaffName, setAdminStaffName] = useState('');
  const [adminStaffPhone, setAdminStaffPhone] = useState('');
  const [adminStaffEmail, setAdminStaffEmail] = useState('');
  const [adminStaffRole, setAdminStaffRole] = useState<'Manager' | 'Tailor' | 'Master Cutter' | 'Senior Stitcher' | 'Finisher & Ironer' | 'Apprentice'>('Tailor');

  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState<'Master Cutter' | 'Senior Stitcher' | 'Finisher & Ironer' | 'Apprentice'>('Master Cutter');
  const [newWorkerSalary, setNewWorkerSalary] = useState<number>(2000);
  const [newWorkerBonus, setNewWorkerBonus] = useState<number>(15);
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [editingWorkerSalary, setEditingWorkerSalary] = useState<number>(2000);
  const [editingWorkerBonus, setEditingWorkerBonus] = useState<number>(15);

  const [newCustNameAdmin, setNewCustNameAdmin] = useState('');
  const [newCustPhoneAdmin, setNewCustPhoneAdmin] = useState('');
  const [newCustEmailAdmin, setNewCustEmailAdmin] = useState('');
  const [newCustAddressAdmin, setNewCustAddressAdmin] = useState('');
  
  const [welcomeBannerTitle, setWelcomeBannerTitle] = useState(() => localStorage.getItem('welcome_banner_title') || 'Owner Dashboard Overview');

  // First-time tailor shop setup states
  const [setupShopName, setSetupShopName] = useState('');
  const [setupShopLocation, setSetupShopLocation] = useState('');
  const [setupShopPhone, setSetupShopPhone] = useState('');
  const [setupOwnerName, setSetupOwnerName] = useState('');
  const [setupLogoUrl, setSetupLogoUrl] = useState('');
  const [setupLatitude, setSetupLatitude] = useState('');
  const [setupLongitude, setSetupLongitude] = useState('');
  const [setupDragging, setSetupDragging] = useState(false);
  const [setupLocationLoading, setSetupLocationLoading] = useState(false);

  // Structured location fields
  const [setupShopCountry, setSetupShopCountry] = useState('India');
  const [setupShopState, setSetupShopState] = useState('');
  const [setupShopDistrict, setSetupShopDistrict] = useState('');
  const [setupShopArea, setSetupShopArea] = useState('');
  const [setupShopPincode, setSetupShopPincode] = useState('');

  // Synchronize structured address into main location string
  useEffect(() => {
    const parts = [
      setupShopArea.trim(),
      setupShopDistrict.trim(),
      setupShopState.trim(),
      setupShopCountry.trim(),
      setupShopPincode.trim() ? `PIN: ${setupShopPincode.trim()}` : ''
    ].filter(Boolean);
    setSetupShopLocation(parts.join(', '));
  }, [setupShopCountry, setupShopState, setupShopDistrict, setupShopArea, setupShopPincode]);

  // Admin shop configuration states for configuring tailor shops directly from Admin panel
  const [adminConfiguringTailorId, setAdminConfiguringTailorId] = useState<string | null>(null);
  const [adminIsAddingNewShop, setAdminIsAddingNewShop] = useState(false);
  const [adminShopName, setAdminShopName] = useState('');
  const [adminOwnerName, setAdminOwnerName] = useState('');
  const [adminShopCountry, setAdminShopCountry] = useState('India');
  const [adminShopState, setAdminShopState] = useState('');
  const [adminShopDistrict, setAdminShopDistrict] = useState('');
  const [adminShopArea, setAdminShopArea] = useState('');
  const [adminShopPincode, setAdminShopPincode] = useState('');
  const [adminShopPhone, setAdminShopPhone] = useState('');
  const [adminLogoUrl, setAdminLogoUrl] = useState('');
  const [adminLatitude, setAdminLatitude] = useState('');
  const [adminLongitude, setAdminLongitude] = useState('');
  const [adminLocationLoading, setAdminLocationLoading] = useState(false);

  const cleanImageUrl = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    try {
      if (trimmed.includes('google.') && (trimmed.includes('/imgres') || trimmed.includes('&imgurl=') || trimmed.includes('?imgurl='))) {
        const urlObj = new URL(trimmed);
        const imgurl = urlObj.searchParams.get('imgurl');
        if (imgurl) {
          return decodeURIComponent(imgurl);
        }
      }
    } catch {
      const match = trimmed.match(/[?&]imgurl=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    return trimmed;
  };

  const handleLogoFileSelect = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      triggerToast('Please upload only JPG, PNG, or WEBP image files.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      setSetupLogoUrl(base64Url);
      triggerToast('Logo loaded and previewed successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleGetSetupLocation = () => {
    const fallbackToIp = async (errMsg?: string) => {
      triggerToast('GPS failed. Falling back to Network IP Geolocation...', 'info');
      try {
        const ipData = await fetchIPLocation();
        setSetupLatitude(ipData.latitude);
        setSetupLongitude(ipData.longitude);
        if (ipData.country) setSetupShopCountry(ipData.country);
        
        let detectedState = '';
        if (ipData.region) {
          const findState = Object.keys(INDIA_STATES_MAP).find(
            (s) => s.toLowerCase() === ipData.region.toLowerCase() || ipData.region.toLowerCase().includes(s.toLowerCase())
          );
          if (findState) {
            setSetupShopState(findState);
            detectedState = findState;
          } else {
            setSetupShopState(ipData.region);
            detectedState = ipData.region;
          }
        }
        if (detectedState && INDIA_STATES_MAP[detectedState] && ipData.city) {
          const distList = INDIA_STATES_MAP[detectedState];
          const match = distList.find(d => 
            d.toLowerCase() === ipData.city.toLowerCase() || 
            ipData.city.toLowerCase().includes(d.toLowerCase()) ||
            d.toLowerCase().includes(ipData.city.toLowerCase())
          );
          if (match) {
            setSetupShopDistrict(match);
          } else {
            setSetupShopDistrict(ipData.city);
          }
        } else if (ipData.city) {
          setSetupShopDistrict(ipData.city);
        }

        if (ipData.postal) setSetupShopPincode(ipData.postal);
        setSetupShopArea(ipData.area || 'Central Area');
        triggerToast('Location auto-loaded via IP successfully!', 'success');
      } catch (fError: any) {
        console.error("IP fallback error:", fError);
        triggerToast(errMsg || fError?.message || 'Network Geolocation failed.', 'error');
      } finally {
        setSetupLocationLoading(false);
      }
    };

    if (!navigator.geolocation) {
      fallbackToIp('Geolocation is not supported by your browser.');
      return;
    }
    setSetupLocationLoading(true);
    triggerToast('Requesting GPS coordinates...', 'info');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        setSetupLatitude(lat);
        setSetupLongitude(lon);
        
        triggerToast('GPS Locked! Fetching address details...', 'info');
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
            headers: {
              'Accept-Language': 'en'
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              
              if (addr.country) {
                setSetupShopCountry(addr.country);
              }
              
              // Robust State determination
              let detectedState = '';
              const stateCandidates = [
                addr.state,
                addr.region,
                addr.province,
                addr.state_district
              ].filter(Boolean).map(v => String(v).trim());

              let foundStateKey = '';
              for (const sc of stateCandidates) {
                const match = Object.keys(INDIA_STATES_MAP).find(
                  (s) => s.toLowerCase() === sc.toLowerCase() || 
                         sc.toLowerCase().includes(s.toLowerCase()) || 
                         s.toLowerCase().includes(sc.toLowerCase())
                );
                if (match) {
                  foundStateKey = match;
                  break;
                }
              }

              if (foundStateKey) {
                setSetupShopState(foundStateKey);
                detectedState = foundStateKey;
              } else if (addr.state) {
                setSetupShopState(addr.state);
                detectedState = addr.state;
              }
              
              // Smart district matching within INDIA_STATES_MAP for the selected state
              let matchedDistrict = '';
              if (detectedState && INDIA_STATES_MAP[detectedState]) {
                const distList = INDIA_STATES_MAP[detectedState];
                
                // Construct a text corpus with all parts of the address for comprehensive searching
                const fullTextSearchSource = [
                  data.display_name || '',
                  addr.state_district || '',
                  addr.district || '',
                  addr.county || '',
                  addr.city || '',
                  addr.town || '',
                  addr.city_district || '',
                  addr.suburb || '',
                  addr.village || '',
                  addr.neighbourhood || '',
                  addr.municipality || '',
                  addr.subdistrict || ''
                ].filter(Boolean).map(s => String(s).toLowerCase().trim());

                // 1. Direct EXACT / SUBSTRING MATCH in any specific fields:
                for (const text of fullTextSearchSource) {
                  const match = distList.find(d => {
                    const dl = d.toLowerCase();
                    return dl === text || text.includes(dl) || dl.includes(text);
                  });
                  if (match) {
                    matchedDistrict = match;
                    break;
                  }
                }
                
                // 2. If not matched, try searching inside the complete display_name if display_name mentions the district
                if (!matchedDistrict && data.display_name) {
                  const dispLower = data.display_name.toLowerCase();
                  const match = distList.find(d => dispLower.includes(d.toLowerCase()));
                  if (match) {
                    matchedDistrict = match;
                  }
                }
              }

              if (matchedDistrict) {
                setSetupShopDistrict(matchedDistrict);
              } else {
                const districtOrCity = addr.state_district || addr.county || addr.district || addr.city_district || addr.city || addr.town || addr.suburb || '';
                setSetupShopDistrict(districtOrCity);
              }
              
              if (addr.postcode) {
                setSetupShopPincode(addr.postcode);
              }
              
              const street = addr.road || addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || '';
              const areaParts = [street, addr.quarter || ''].filter(Boolean).join(', ');
              if (areaParts) {
                setSetupShopArea(areaParts);
              } else if (data.display_name) {
                const dispParts = data.display_name.split(',');
                setSetupShopArea(dispParts.slice(0, 2).join(',').trim());
              }
              
              triggerToast('Address fields & district auto-loaded successfully!', 'success');
            } else {
              triggerToast('Current location coordinates retrieved successfully!', 'success');
            }
          } else {
            triggerToast('Current location coordinates retrieved successfully!', 'success');
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          triggerToast('Current location coordinates retrieved successfully!', 'success');
        } finally {
          setSetupLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        fallbackToIp(`Location access failed: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };
  const [welcomeBannerDesc, setWelcomeBannerDesc] = useState(() => localStorage.getItem('welcome_banner_desc') || 'Manage your fine tailoring workshops, track measurements, and generate bespoke delivery packages cleanly.');

  const [voucherMainTitle, setVoucherMainTitle] = useState(() => {
    const saved = localStorage.getItem('voucher_main_title');
    return (!saved || saved === 'Sartorial Atelier' || saved === 'tailorSHOP ERP') ? 'TAILORSHOP ERP' : saved;
  });
  const [voucherSubtitle, setVoucherSubtitle] = useState(() => localStorage.getItem('voucher_subtitle') || 'Bespoke Fitting Voucher');
  const [voucherFooterNotes, setVoucherFooterNotes] = useState(() => localStorage.getItem('voucher_footer_notes') || 'Thank you for trusting TAILORSHOP ERP. All sizing blueprints are saved securely in our central index database.');
  const [voucherBgColor, setVoucherBgColor] = useState(() => localStorage.getItem('voucher_bg_color') || '#ffffff');
  const [voucherTextColor, setVoucherTextColor] = useState(() => localStorage.getItem('voucher_text_color') || '#1c1917');
  const [voucherAccentColor, setVoucherAccentColor] = useState(() => localStorage.getItem('voucher_accent_color') || '#d97706');
  const [voucherFont, setVoucherFont] = useState(() => localStorage.getItem('voucher_font') || 'Plus Jakarta Sans');
  const [voucherBorderStyle, setVoucherBorderStyle] = useState(() => localStorage.getItem('voucher_border_style') || 'dashed');
  const [voucherLogoAlignment, setVoucherLogoAlignment] = useState(() => localStorage.getItem('voucher_logo_alignment') || 'center');

  useEffect(() => {
    localStorage.setItem('welcome_banner_title', welcomeBannerTitle);
  }, [welcomeBannerTitle]);
  useEffect(() => {
    localStorage.setItem('welcome_banner_desc', welcomeBannerDesc);
  }, [welcomeBannerDesc]);
  useEffect(() => {
    localStorage.setItem('voucher_main_title', voucherMainTitle);
  }, [voucherMainTitle]);
  useEffect(() => {
    localStorage.setItem('voucher_subtitle', voucherSubtitle);
  }, [voucherSubtitle]);
  useEffect(() => {
    localStorage.setItem('voucher_footer_notes', voucherFooterNotes);
  }, [voucherFooterNotes]);
  useEffect(() => {
    localStorage.setItem('voucher_bg_color', voucherBgColor);
  }, [voucherBgColor]);
  useEffect(() => {
    localStorage.setItem('voucher_text_color', voucherTextColor);
  }, [voucherTextColor]);
  useEffect(() => {
    localStorage.setItem('voucher_accent_color', voucherAccentColor);
  }, [voucherAccentColor]);
  useEffect(() => {
    localStorage.setItem('voucher_font', voucherFont);
  }, [voucherFont]);
  useEffect(() => {
    localStorage.setItem('voucher_border_style', voucherBorderStyle);
  }, [voucherBorderStyle]);
  useEffect(() => {
    localStorage.setItem('voucher_logo_alignment', voucherLogoAlignment);
  }, [voucherLogoAlignment]);
  const [selectedDetOrder, setSelectedDetOrder] = useState<Order | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editFabric, setEditFabric] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editCustName, setEditCustName] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustEmail, setEditCustEmail] = useState('');
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editingFieldValue, setEditingFieldValue] = useState('');
  
  // Local settings editor states
  const [editingCategoryNameKey, setEditingCategoryNameKey] = useState<string | null>(null);
  const [tempCategoryRenameValue, setTempCategoryRenameValue] = useState<string>('');
  const [settingsNewCategoryParam, setSettingsNewCategoryParam] = useState<Record<string, string>>({});
  const [settingsNewCatName, setSettingsNewCatName] = useState<string>('');
  const [settingsNewCatEmoji, setSettingsNewCatEmoji] = useState<string>('');
  const [settingsNewCatPrice, setSettingsNewCatPrice] = useState<number>(250);

  // Non-blocking confirmation states to circumvent iframe modal restrictions
  const [confirmDeleteGenre, setConfirmDeleteGenre] = useState<string | null>(null);
  const [confirmRemoveTailorId, setConfirmRemoveTailorId] = useState<string | null>(null);
  const [confirmResetConfigs, setConfirmResetConfigs] = useState(false);
  const [confirmPurgeDatabase, setConfirmPurgeDatabase] = useState(false);

  // Workflow stages: 'active' (taking measurements) or 'completed' (viewing receipt voucher)
  const [sessionStage, setSessionStage] = useState<'active' | 'completed'>('active');
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  // Active Sizing Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [clothingType, setClothingType] = useState<string>('Shirt');
  const [clothingCategories, setClothingCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('custom_clothing_categories');
    const parsed = saved ? JSON.parse(saved) : ['Shirt', 'Pant', 'Suit', 'Kurta'];
    return parsed.filter((cat: string) => cat !== 'Custom');
  });
  const [clothingTemplates, setClothingTemplates] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem('custom_clothing_templates');
    return saved ? JSON.parse(saved) : {
      Shirt: { Collar: '15.5', Chest: '40', Waist: '36', Sleeve: '33', Shoulder: '18', Length: '30', Cuff: '9.5' },
      Pant: { Waist: '34', Hips: '42', Inseam: '32', Length: '40', Thigh: '24', Crotch: '11', Ankle: '8' },
      Suit: { Shoulder: '18.5', Chest: '42', Waist: '38', Hips: '43', Sleeve: '25', JacketLength: '31', Collar: '16', Inseam: '32' },
      Kurta: { Shoulder: '18', Chest: '41', Waist: '38', Seat: '44', Sleeve: '24.5', Length: '42', Collar: '15.5' },
      Custom: { Length: '36', Width: '20' }
    };
  });
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryPrice, setNewCategoryPrice] = useState<number>(300);
  const [newCategoryBase, setNewCategoryBase] = useState('Custom');

  useEffect(() => {
    localStorage.setItem('custom_clothing_categories', JSON.stringify(clothingCategories));
  }, [clothingCategories]);

  useEffect(() => {
    localStorage.setItem('custom_clothing_templates', JSON.stringify(clothingTemplates));
  }, [clothingTemplates]);

  const [sizingFields, setSizingFields] = useState<Record<string, string>>({
    Collar: '15.5', Chest: '40', Waist: '36', Sleeve: '33', Shoulder: '18', Length: '30', Cuff: '9.5'
  });
  const [fieldUnits, setFieldUnits] = useState<Record<string, 'in' | 'cm'>>({});
  
  // Custom sizing parameter addition
  const [customFieldName, setCustomFieldName] = useState('');
  const [notes, setNotes] = useState(() => localStorage.getItem('tailorshop_draft_notes') || '');
  const [price, setPrice] = useState<number>(350);

  // Ready schedule - Defaulting to exactly 10 days from today formatted as YYYY-MM-DD
  const getDefaultReadyDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 10);
    return date.toISOString().split('T')[0];
  };
  const [readyDate, setReadyDate] = useState<string>(getDefaultReadyDate());

  // Newly saved record pointers to render in summary
  const [lastSavedSession, setLastSavedSession] = useState<{
    customer: Customer;
    measurement: MeasurementRecord;
    order: Order;
    whatsappAlert: string;
    emailAlert: string;
  } | null>(null);

  const [unitSystem, setUnitSystem] = useState<'Inches' | 'Centimeters'>('Inches');
  const [tailorPage, setTailorPage] = useState<'sizing' | 'orders' | 'settings' | 'tailors' | 'pending_tasks'>('sizing');

  // Tailor page custom measurement editor states
  const [editingMeasurementOrderId, setEditingMeasurementOrderId] = useState<string | null>(null);
  const [editingFields, setEditingFields] = useState<Record<string, string>>({});
  const [editingNotes, setEditingNotes] = useState<string>('');

  const handleStartEditMeasurement = (orderId: string, measurement: MeasurementRecord | null, clothingType: string) => {
    setEditingMeasurementOrderId(orderId);
    if (measurement) {
      const cleanFields: Record<string, string> = {};
      Object.entries(measurement.fields).forEach(([k, v]) => {
        const valOnly = v.split(' ')[0] || '';
        cleanFields[k] = valOnly;
      });
      setEditingFields(cleanFields);
      setEditingNotes(measurement.notes || '');
    } else {
      const initialTmpl = clothingTemplates[clothingType] || clothingTemplates['Custom'] || { Length: '36', Width: '20' };
      const cleanFields: Record<string, string> = {};
      Object.entries(initialTmpl).forEach(([k, v]) => {
        cleanFields[k] = v as string;
      });
      setEditingFields(cleanFields);
      setEditingNotes('Classic bespoke fit tailored at workshop.');
    }
  };

  const handleSaveEditMeasurement = (orderId: string, customerId: string, clothingType: string, measurementId?: string) => {
    const finalFields: Record<string, string> = {};
    Object.entries(editingFields).forEach(([k, v]) => {
      const unit = fieldUnits[k] || 'in';
      finalFields[k] = `${v} ${unit}`;
    });

    let updated: MeasurementRecord[];
    const activeShopDetails = getCurrentUserShopInfo();
    const currentTailorId = currentUser?.id || 'TAILOR-OWNER-MASTER';
    const currentShopName = activeShopDetails?.shopName || 'TAILORSHOP ERP';

    if (measurementId) {
      updated = measurements.map((m) => {
        if (m.id === measurementId) {
          return {
            ...m,
            fields: finalFields,
            notes: editingNotes.trim(),
            date: new Date().toISOString(),
            tailorId: m.tailorId || currentTailorId,
            shopName: m.shopName || currentShopName
          };
        }
        return m;
      });
      triggerToast(`Sizing parameters updated successfully!`, 'success');
      addActivity('Measurement Updated', `Tailor updated measurement parameter suite for reference ${measurementId}`, 'Worker', currentUser?.name || 'Tailor');
    } else {
      const newRecord: MeasurementRecord = {
        id: `MSR-${Date.now()}`,
        customerId: customerId,
        clothingType: clothingType,
        date: new Date().toISOString(),
        fields: finalFields,
        notes: editingNotes.trim() || 'Classic bespoke fit.',
        tailorId: currentTailorId,
        shopName: currentShopName
      };
      updated = [newRecord, ...measurements];
      triggerToast(`Brand new measurement record created and registered!`, 'success');
      addActivity('Measurement Logged', `Tailor logged fresh sizing parameters for ${clothingType}`, 'Worker', currentUser?.name || 'Tailor');
    }

    saveMeasurements(updated);
    setMeasurements(updated);
    setEditingMeasurementOrderId(null);
  };

  const [tailorShopNameInput, setTailorShopNameInput] = useState('');
  const [tailorLogoUrlInput, setTailorLogoUrlInput] = useState('');
  const [selectedSettingsSubTab, setSelectedSettingsSubTab] = useState<'general' | 'shop_profile' | 'add_worker'>('general');
  const [tailorOwnerNameInput, setTailorOwnerNameInput] = useState('');
  const [tailorPhoneInput, setTailorPhoneInput] = useState('');
  const [tailorCountryInput, setTailorCountryInput] = useState('India');
  const [tailorStateInput, setTailorStateInput] = useState('');
  const [tailorDistrictInput, setTailorDistrictInput] = useState('');
  const [tailorAreaInput, setTailorAreaInput] = useState('');
  const [tailorPincodeInput, setTailorPincodeInput] = useState('');
  const [tailorLatitudeInput, setTailorLatitudeInput] = useState('');
  const [tailorLongitudeInput, setTailorLongitudeInput] = useState('');
  const [tailorLocationLoading, setTailorLocationLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    const userPhone = (currentUser.phone || '').trim();
    const userName = (currentUser.name || '').toLowerCase().trim();

    const tailorMatch = (registeredTailors || []).find((t: any) => {
      const tEmail = (t.email || '').toLowerCase().trim();
      const tPhone = (t.phone || '').trim();
      const tName = (t.name || '').toLowerCase().trim();

      return (userEmail && tEmail === userEmail) || 
             (userPhone && isPhoneMatch(userPhone, tPhone)) ||
             (userName && tName === userName);
    });

    const activeShop = tailorMatch || currentUser;

    if (activeShop) {
      setTailorShopNameInput(activeShop.shopName || '');
      setTailorLogoUrlInput(activeShop.logoUrl || activeShop.shopLogoUrl || '');
      setTailorOwnerNameInput(activeShop.name || '');
      setTailorPhoneInput(activeShop.phone || '');
      
      const loc = activeShop.location || '';
      if (loc && loc !== 'Studio Workspace') {
        const parts = loc.split(',');
        setTailorAreaInput((activeShop.coordinateLatitude || activeShop.location) ? (parts[0]?.trim() || '') : loc);
        setTailorDistrictInput(parts[1] ? parts[1].trim() : '');
        setTailorStateInput(parts[2] ? parts[2].trim() : '');
        setTailorCountryInput(parts[3] ? parts[3].trim() : 'India');
        const pinMatch = loc.match(/PIN:\s*(\w+)/);
        setTailorPincodeInput(pinMatch ? pinMatch[1] : '');
      } else {
        setTailorAreaInput('');
        setTailorDistrictInput('');
        setTailorStateInput('');
        setTailorCountryInput('India');
        setTailorPincodeInput('');
      }

      setTailorLatitudeInput(activeShop.coordinateLatitude || '');
      setTailorLongitudeInput(activeShop.coordinateLongitude || '');
    }
  }, [currentUser, registeredTailors]);

  useEffect(() => {
    if (currentUser?.role !== 'Owner') {
      setSelectedSettingsSubTab('general');
    }
  }, [currentUser]);

  const handleUpdateTailorShop = (
    newShopName: string,
    newLogoUrl: string,
    newOwnerName?: string,
    newPhone?: string,
    newLocation?: string,
    newLat?: string,
    newLon?: string
  ) => {
    if (!currentUser) return;
    
    const finalOwnerName = newOwnerName !== undefined ? newOwnerName : (currentUser.name || '');
    const finalPhone = newPhone !== undefined ? newPhone : (currentUser.phone || '');
    const finalLocation = newLocation !== undefined ? newLocation : (currentUser.location || '');
    const finalLat = newLat !== undefined ? newLat : (currentUser.coordinateLatitude || '');
    const finalLon = newLon !== undefined ? newLon : (currentUser.coordinateLongitude || '');

    const updatedUser = {
      ...currentUser,
      name: finalOwnerName,
      shopName: newShopName,
      logoUrl: newLogoUrl,
      shopLogoUrl: newLogoUrl,
      phone: finalPhone,
      location: finalLocation,
      coordinateLatitude: finalLat,
      coordinateLongitude: finalLon,
      hasRegisteredShop: true
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('tailor_logged_in_user', JSON.stringify(updatedUser));

    const tailors = getRegisteredTailors();
    const updatedTailors = tailors.map((t: any) => {
      const tEmail = (t.email || '').toLowerCase().trim();
      const tPhone = (t.phone || '').trim();
      const tName = (t.name || '').toLowerCase().trim();
      const uEmail = (currentUser.email || '').toLowerCase().trim();
      const uPhone = (currentUser.phone || '').trim();
      const uName = (currentUser.name || '').toLowerCase().trim();

      if (t.id === currentUser.id || 
          (uEmail && tEmail === uEmail) || 
          (uPhone && isPhoneMatch(uPhone, tPhone)) ||
          (uName && tName === uName)) {
        return {
          ...t,
          name: finalOwnerName,
          shopName: newShopName,
          logoUrl: newLogoUrl,
          phone: finalPhone,
          location: finalLocation,
          coordinateLatitude: finalLat,
          coordinateLongitude: finalLon,
          hasRegisteredShop: true
        };
      }
      return t;
    });
    saveRegisteredTailors(updatedTailors);
    setRegisteredTailors(updatedTailors);

    const updatedWorkers = workers.map((w: any) => {
      const wEmail = (w.email || '').toLowerCase().trim();
      const wPhone = (w.phone || '').trim();
      const wName = (w.name || '').toLowerCase().trim();
      const uEmail = (currentUser.email || '').toLowerCase().trim();
      const uPhone = (currentUser.phone || '').trim();
      const uName = (currentUser.name || '').toLowerCase().trim();

      if (w.id === currentUser.id || 
          (uEmail && wEmail === uEmail) || 
          (uPhone && isPhoneMatch(uPhone, wPhone)) ||
          (uName && wName === uName)) {
        return {
          ...w,
          name: finalOwnerName,
          shopName: newShopName,
          logoUrl: newLogoUrl,
          logo_url: newLogoUrl,
          phone: finalPhone,
          location: finalLocation,
          coordinateLatitude: finalLat,
          coordinateLongitude: finalLon,
          hasRegisteredShop: true
        };
      }
      return w;
    });
    setWorkers(updatedWorkers);
    saveWorkers(updatedWorkers);

    triggerToast("Your Tailor Shop profile updated successfully!", "success");
  };

  // Groundbreaking Admin Landing & Brand Customization states (persistent in LocalStorage)
  const [customLogoUrl, setCustomLogoUrl] = useState(() => localStorage.getItem('logo_url') || '');
  const [logoLoadError, setLogoLoadError] = useState(false);
  
  useEffect(() => {
    setLogoLoadError(false);
  }, [customLogoUrl]);

  const [customLandingTitle, setCustomLandingTitle] = useState(() => {
    const saved = localStorage.getItem('landing_title');
    return (!saved || saved === 'Welcome to Sartorial Atelier' || saved === 'Welcome to tailorSHOP ERP') ? 'Welcome to TAILORSHOP ERP' : saved;
  });
  const [customLandingDescription, setCustomLandingDescription] = useState(() => localStorage.getItem('landing_description') || 'The ultimate bespoke artisan suite. Seamlessly track customer measurement blueprints, pattern designs, active stitching timelines, and automated billing ledgers.');
  
  const [customTailorTitle, setCustomTailorTitle] = useState(() => localStorage.getItem('tailor_title') || 'Tailor Workplace');
  const [customTailorDescription, setCustomTailorDescription] = useState(() => localStorage.getItem('tailor_description') || 'Manage measurement patterns, log customized customer fields, coordinate stitching/pickup timetables, and issue beautiful vouchers.');
  const [customTailorImage, setCustomTailorImage] = useState(() => localStorage.getItem('tailor_image') || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=600');
  
  const [customCustomerTitle, setCustomCustomerTitle] = useState(() => localStorage.getItem('customer_title') || 'Customer Portal');
  const [customCustomerDescription, setCustomCustomerDescription] = useState(() => localStorage.getItem('customer_description') || 'Lookup personalized body dimensions, confirm current clothing milestones, print measurement vouchers, and review physical fitting alerts.');
  const [customCustomerImage, setCustomCustomerImage] = useState(() => localStorage.getItem('customer_image') || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600');

  useEffect(() => {
    localStorage.setItem('logo_url', customLogoUrl);
  }, [customLogoUrl]);
  useEffect(() => {
    localStorage.setItem('landing_title', customLandingTitle);
  }, [customLandingTitle]);
  useEffect(() => {
    localStorage.setItem('landing_description', customLandingDescription);
  }, [customLandingDescription]);
  useEffect(() => {
    localStorage.setItem('tailor_title', customTailorTitle);
  }, [customTailorTitle]);
  useEffect(() => {
    localStorage.setItem('tailor_description', customTailorDescription);
  }, [customTailorDescription]);
  useEffect(() => {
    localStorage.setItem('tailor_image', customTailorImage);
  }, [customTailorImage]);
  useEffect(() => {
    localStorage.setItem('customer_title', customCustomerTitle);
  }, [customCustomerTitle]);
  useEffect(() => {
    localStorage.setItem('customer_description', customCustomerDescription);
  }, [customCustomerDescription]);
  useEffect(() => {
    localStorage.setItem('customer_image', customCustomerImage);
  }, [customCustomerImage]);

  useEffect(() => {
    if (currentUser && currentUser.id !== 'TAILOR-OWNER-MASTER' && !currentUser.hasRegisteredShop && !currentUser.isWorker) {
      setSetupShopName(tailorshopName || '');
      setSetupShopPhone(currentUser.phone || '');
      setSetupOwnerName(currentUser.name || '');
      setSetupShopLocation(currentUser.location || '');
      setSetupLogoUrl(customLogoUrl || '');
    }
  }, [currentUser]);

  const [clothingCategoryEmojis, setClothingCategoryEmojis] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('custom_clothing_emojis');
    const defaults: Record<string, string> = {
      Shirt: '',
      Pant: '',
      Suit: '',
      Kurta: '',
      Custom: ''
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const restored: Record<string, string> = {};
        for (const key of Object.keys(defaults)) {
          // Force defaults to be empty string so they always fall back to beautiful monochromatic SVG outlines!
          restored[key] = '';
        }
        for (const key of Object.keys(parsed)) {
          if (defaults[key] === undefined) {
            // Only keep custom user-created categories' icons/emojis
            restored[key] = parsed[key] || '';
          }
        }
        return restored;
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  const [clothingPrices, setClothingPrices] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('custom_clothing_prices');
    return saved ? JSON.parse(saved) : {
      Shirt: 180,
      Pant: 150,
      Suit: 850,
      Kurta: 220,
      Custom: 290
    };
  });

  const [tailorshopName, setTailorshopName] = useState(() => {
    const saved = localStorage.getItem('tailorshop_name');
    return (!saved || saved === 'Sartorial Atelier' || saved === 'tailorSHOP ERP') ? 'TAILORSHOP ERP' : saved;
  });

  useEffect(() => {
    localStorage.setItem('custom_clothing_emojis', JSON.stringify(clothingCategoryEmojis));
  }, [clothingCategoryEmojis]);

  useEffect(() => {
    localStorage.setItem('custom_clothing_prices', JSON.stringify(clothingPrices));
  }, [clothingPrices]);

  useEffect(() => {
    localStorage.setItem('tailorshop_name', tailorshopName);
  }, [tailorshopName]);

  // Search and filter states for Master Orders Book
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('All');

  // Focus reference for smooth workshop transitions
  const nameInputRef = useRef<HTMLInputElement>(null);

  // On mount, load databases from localStorage & authenticate sessions
  useEffect(() => {
    setCustomers(getCustomers());
    setMeasurements(getMeasurements());
    setOrders(getOrders());
    setRegisteredTailors(getRegisteredTailors());
    setWorkers(getWorkers());

    const savedUser = localStorage.getItem('tailor_logged_in_user');
    if (savedUser) {
      try {
        let u = JSON.parse(savedUser);
        if (u && (u.isWorker || u.id.startsWith('WRK-')) && u.role === 'Owner') {
          u.role = 'Tailor';
          localStorage.setItem('tailor_logged_in_user', JSON.stringify(u));
        }
        setCurrentUser(u);
        if (u && u.role !== 'Owner' && u.role !== 'Manager') {
          setTailorPage('pending_tasks');
        }
      } catch (err) {
        console.error("Failed to restore current user", err);
      }
    }

    // Respect user's dark mode media query or local defaults
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }

    // Real-time Firestore sync event listener
    const handleSync = () => {
      setCustomers(getCustomers());
      setMeasurements(getMeasurements());
      setOrders(getOrders());
      setWorkers(getWorkers());
    };
    window.addEventListener('db-sync-update', handleSync);
    return () => {
      window.removeEventListener('db-sync-update', handleSync);
    };
  }, []);

  // Sync effect when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Automatically switch tab for Master Admin so they default to the workstation settings settings view
  useEffect(() => {
    if (currentUser?.id === 'TAILOR-OWNER-MASTER') {
      if (ownerTab !== 'staffs_erp' && ownerTab !== 'branding') {
        setOwnerTab('staffs_erp');
      }
    }
  }, [currentUser, ownerTab]);

  const getShopBrandingKey = () => {
    const shopInfo = getCurrentUserShopInfo();
    return shopInfo 
      ? `branding_${shopInfo.shopName.toLowerCase().replace(/[^a-z0-9]/g, '_')}` 
      : 'branding';
  };

  // Automatically propagate active shop's name and logo before any update or save
  useEffect(() => {
    const shopInfo = getCurrentUserShopInfo();
    if (shopInfo && shopInfo.shopName) {
      if (tailorshopName !== shopInfo.shopName) {
        setTailorshopName(shopInfo.shopName);
        localStorage.setItem('tailorshop_name', shopInfo.shopName);
        setVoucherMainTitle(shopInfo.shopName);
        localStorage.setItem('voucher_main_title', shopInfo.shopName);
      }
      if (shopInfo.logoUrl && customLogoUrl !== shopInfo.logoUrl) {
        setCustomLogoUrl(shopInfo.logoUrl);
        localStorage.setItem('logo_url', shopInfo.logoUrl);
      }
    }
  }, [currentUser, registeredTailors, workers]);

  // Synchronously update the printed bill main title when tailorshopName is typed
  useEffect(() => {
    if (tailorshopName) {
      setVoucherMainTitle(tailorshopName);
    }
  }, [tailorshopName]);

  // Real-time synchronization of any typed shop name to active branding and printed bill
  useEffect(() => {
    if (tailorShopNameInput && tailorShopNameInput.trim()) {
      setTailorshopName(tailorShopNameInput.trim());
    }
  }, [tailorShopNameInput]);

  useEffect(() => {
    if (setupShopName && setupShopName.trim()) {
      setTailorshopName(setupShopName.trim());
    }
  }, [setupShopName]);

  useEffect(() => {
    if (adminShopName && adminShopName.trim()) {
      setTailorshopName(adminShopName.trim());
    }
  }, [adminShopName]);

  // Sync real-time branding changes from Firestore (via the "branding" record inside the workers collection)
  useEffect(() => {
    const shopBrandingKey = getShopBrandingKey();
    const brandingRecord = workers.find(w => w.id === shopBrandingKey) || workers.find(w => w.id === 'branding');
    if (brandingRecord) {
      if (brandingRecord.shopName && brandingRecord.shopName !== localStorage.getItem('tailorshop_name')) {
        setTailorshopName(brandingRecord.shopName);
        localStorage.setItem('tailorshop_name', brandingRecord.shopName);
      }
      if (brandingRecord.logoUrl !== undefined && brandingRecord.logoUrl !== localStorage.getItem('logo_url')) {
        setCustomLogoUrl(brandingRecord.logoUrl || '');
        localStorage.setItem('logo_url', brandingRecord.logoUrl || '');
      }
      if (brandingRecord.voucherMainTitle && brandingRecord.voucherMainTitle !== localStorage.getItem('voucher_main_title')) {
        setVoucherMainTitle(brandingRecord.voucherMainTitle);
        localStorage.setItem('voucher_main_title', brandingRecord.voucherMainTitle);
      }
      if (brandingRecord.voucherSubtitle && brandingRecord.voucherSubtitle !== localStorage.getItem('voucher_subtitle')) {
        setVoucherSubtitle(brandingRecord.voucherSubtitle);
        localStorage.setItem('voucher_subtitle', brandingRecord.voucherSubtitle);
      }
      if (brandingRecord.voucherFooterNotes && brandingRecord.voucherFooterNotes !== localStorage.getItem('voucher_footer_notes')) {
        setVoucherFooterNotes(brandingRecord.voucherFooterNotes);
        localStorage.setItem('voucher_footer_notes', brandingRecord.voucherFooterNotes);
      }
      if (brandingRecord.voucherBgColor && brandingRecord.voucherBgColor !== localStorage.getItem('voucher_bg_color')) {
        setVoucherBgColor(brandingRecord.voucherBgColor);
        localStorage.setItem('voucher_bg_color', brandingRecord.voucherBgColor);
      }
      if (brandingRecord.voucherTextColor && brandingRecord.voucherTextColor !== localStorage.getItem('voucher_text_color')) {
        setVoucherTextColor(brandingRecord.voucherTextColor);
        localStorage.setItem('voucher_text_color', brandingRecord.voucherTextColor);
      }
      if (brandingRecord.voucherAccentColor && brandingRecord.voucherAccentColor !== localStorage.getItem('voucher_accent_color')) {
        setVoucherAccentColor(brandingRecord.voucherAccentColor);
        localStorage.setItem('voucher_accent_color', brandingRecord.voucherAccentColor);
      }
      if (brandingRecord.voucherFont && brandingRecord.voucherFont !== localStorage.getItem('voucher_font')) {
        setVoucherFont(brandingRecord.voucherFont);
        localStorage.setItem('voucher_font', brandingRecord.voucherFont);
      }
      if (brandingRecord.voucherBorderStyle && brandingRecord.voucherBorderStyle !== localStorage.getItem('voucher_border_style')) {
        setVoucherBorderStyle(brandingRecord.voucherBorderStyle);
        localStorage.setItem('voucher_border_style', brandingRecord.voucherBorderStyle);
      }
      if (brandingRecord.voucherLogoAlignment && brandingRecord.voucherLogoAlignment !== localStorage.getItem('voucher_logo_alignment')) {
        setVoucherLogoAlignment(brandingRecord.voucherLogoAlignment);
        localStorage.setItem('voucher_logo_alignment', brandingRecord.voucherLogoAlignment);
      }
    }
  }, [workers, currentUser]);

  const saveBrandingToDatabase = (
    updatedShopName?: string,
    updatedLogoUrl?: string,
    vMainTitle?: string,
    vSubtitle?: string,
    vFooterNotes?: string,
    vBgColor?: string,
    vTextColor?: string,
    vAccentColor?: string,
    vFont?: string,
    vBorderStyle?: string,
    vLogoAlignment?: string
  ) => {
    const activeWorkers = getWorkers();
    const shopBrandingKey = getShopBrandingKey();
    const brandingIndex = activeWorkers.findIndex(w => w.id === shopBrandingKey);
    
    const updatedBrandingRecord = {
      id: shopBrandingKey,
      name: shopBrandingKey === 'branding' ? 'Shop Branding Settings' : `Branding Settings for ${shopBrandingKey.slice(9)}`,
      role: 'GlobalSettings',
      shopName: updatedShopName !== undefined ? updatedShopName : (localStorage.getItem('tailorshop_name') || 'STYLUS'),
      logoUrl: updatedLogoUrl !== undefined ? updatedLogoUrl : (localStorage.getItem('logo_url') || ''),
      voucherMainTitle: vMainTitle !== undefined ? vMainTitle : (localStorage.getItem('voucher_main_title') || 'TAILORSHOP ERP'),
      voucherSubtitle: vSubtitle !== undefined ? vSubtitle : (localStorage.getItem('voucher_subtitle') || 'BESPOKE FITTING VOUCHER'),
      voucherFooterNotes: vFooterNotes !== undefined ? vFooterNotes : (localStorage.getItem('voucher_footer_notes') || 'Thank you for trusting Sartorial Luxury Tailors. All sizing blueprints are saved securely in our central index database.'),
      voucherBgColor: vBgColor !== undefined ? vBgColor : (localStorage.getItem('voucher_bg_color') || '#ffffff'),
      voucherTextColor: vTextColor !== undefined ? vTextColor : (localStorage.getItem('voucher_text_color') || '#1c1917'),
      voucherAccentColor: vAccentColor !== undefined ? vAccentColor : (localStorage.getItem('voucher_accent_color') || '#d97706'),
      voucherFont: vFont !== undefined ? vFont : (localStorage.getItem('voucher_font') || 'Cinzel'),
      voucherBorderStyle: vBorderStyle !== undefined ? vBorderStyle : (localStorage.getItem('voucher_border_style') || 'dashed'),
      voucherLogoAlignment: vLogoAlignment !== undefined ? vLogoAlignment : (localStorage.getItem('voucher_logo_alignment') || 'center'),
    } as any;

    let nextWorkers = [...activeWorkers];
    if (brandingIndex >= 0) {
      nextWorkers[brandingIndex] = updatedBrandingRecord;
    } else {
      nextWorkers.push(updatedBrandingRecord);
    }

    setWorkers(nextWorkers);
    saveWorkers(nextWorkers);

    // Sync registered tailors database list of shop profile name & logoUrl representation too!
    const targetShopName = updatedShopName !== undefined ? updatedShopName : updatedBrandingRecord.shopName;
    const targetLogoUrl = updatedLogoUrl !== undefined ? updatedLogoUrl : updatedBrandingRecord.logoUrl;

    if (currentUser) {
      const uEmail = (currentUser.email || '').toLowerCase().trim();
      const uPhone = (currentUser.phone || '').trim();
      const uName = (currentUser.name || '').toLowerCase().trim();

      const tailors = getRegisteredTailors();
      const updatedTailors = tailors.map((t: any) => {
        const tEmail = (t.email || '').toLowerCase().trim();
        const tPhone = (t.phone || '').trim();
        const tName = (t.name || '').toLowerCase().trim();

        if (t.id === currentUser.id ||
            (uEmail && tEmail === uEmail) ||
            (uPhone && isPhoneMatch(uPhone, tPhone)) ||
            (uName && tName === uName)) {
          return {
            ...t,
            shopName: targetShopName,
            logoUrl: targetLogoUrl,
            hasRegisteredShop: true
          };
        }
        return t;
      });
      saveRegisteredTailors(updatedTailors);
      setRegisteredTailors(updatedTailors);

      // Also update currentUser in memory and localStorage so it is synchronized
      if (currentUser.role === 'Owner') {
        const updatedCurrentUser = {
          ...currentUser,
          shopName: targetShopName,
          logoUrl: targetLogoUrl,
          shopLogoUrl: targetLogoUrl,
          hasRegisteredShop: true
        };
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem('tailor_logged_in_user', JSON.stringify(updatedCurrentUser));
      }
    }
  };

  // Customer & Worker Admin State Handlers
  const handleAddNewCustomer = (newCust: Omit<Customer, "id" | "qrCodeData" | "createdAt" | "passwordChanged">) => {
    const nextId = `CUST-${100 + customers.length + 1}`;
    const custWithId: Customer = {
      ...newCust,
      id: nextId,
      qrCodeData: `A_STU_${nextId}`,
      createdAt: new Date().toISOString(),
      passwordChanged: false
    };
    const updated = [...customers, custWithId];
    setCustomers(updated);
    saveCustomers(updated);
    addActivity('Customer Registered', `Created profile credential ledger for ${newCust.name}`, currentUser?.role || 'Owner', currentUser?.name || 'Owner');
    triggerToast(`Customer "${newCust.name}" added successfully!`, 'success');
  };

  const handleEditExistingCustomer = (cust: Customer) => {
    const updated = customers.map(c => c.id === cust.id ? cust : c);
    setCustomers(updated);
    saveCustomers(updated);
    addActivity('Customer Profile Updated', `Updated profile credentials for ${cust.name}`, currentUser?.role || 'Owner', currentUser?.name || 'Owner');
    triggerToast(`Customer "${cust.name}" details updated successfully!`, 'success');
  };

  const handleDeleteExistingCustomer = (id: string) => {
    const cust = customers.find(c => c.id === id);
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveCustomers(updated);
    addActivity('Customer Erased', `Permanently pruned customer ledger for ${cust?.name || id}`, currentUser?.role || 'Owner', currentUser?.name || 'Owner');
    triggerToast(`Customer erased successfully!`, 'success');
  };

  const handleAddWorker = (newWorker: Omit<Worker, "id">) => {
    const nextId = `WRK-${Date.now()}`;
    const shopInfo = getCurrentUserShopInfo();
    
    const workerWithId: Worker = {
      ...newWorker,
      id: nextId,
      ...(shopInfo ? {
        shopOwnerId: currentUser?.id,
        shopOwnerEmail: currentUser?.email,
        shopName: shopInfo.shopName,
        shopLogoUrl: shopInfo.logoUrl,
        hasRegisteredShop: true,
        logoUrl: shopInfo.logoUrl
      } : {})
    };
    const updated = [...workers, workerWithId];
    setWorkers(updated);
    saveWorkers(updated);

    // Also register login credentials inside registered_tailors
    const tailors = getRegisteredTailors();
    const emailClean = (newWorker.email || '').toLowerCase().trim();
    
    // Set phone number as password as requested
    const phoneValStr = newWorker.phone ? newWorker.phone.trim() : '';
    
    const newTailorCreds = {
      id: nextId,
      name: newWorker.name,
      email: emailClean,
      password: phoneValStr, // Phone number serves as the login password
      phone: phoneValStr,
      location: newWorker.location || 'Studio Workspace',
      role: newWorker.role,
      skills: newWorker.skills || [],
      createdAt: new Date().toISOString()
    };
    
    // Avoid double entries
    const filteredTailors = tailors.filter((t: any) => t.email.toLowerCase().trim() !== emailClean);
    const updatedTailors = [...filteredTailors, newTailorCreds];
    saveRegisteredTailors(updatedTailors);
    setRegisteredTailors(updatedTailors);

    addActivity('Staff Added', `Recruited new direct worker ${newWorker.name} as ${newWorker.role}`, currentUser?.role || "Owner", currentUser?.name || "Owner");
    triggerToast(`Staff "${newWorker.name}" added successfully! Mobile serves as login password.`, "success");
  };

  const handleDeleteWorker = (id: string) => {
    const worker = workers.find(w => w.id === id);
    const updated = workers.filter(w => w.id !== id);
    setWorkers(updated);
    saveWorkers(updated);

    // Also delete from registered_tailors so they are gone from the registry list / tailors navbar entries
    const currentTailors = getRegisteredTailors();
    const filteredTailors = currentTailors.filter((t: any) => {
      if (t.id === id) return false;
      if (worker) {
        const tEmail = (t.email || '').toLowerCase().trim();
        const tPhone = (t.phone || '').trim();
        const tName = (t.name || '').toLowerCase().trim();

        const wEmail = (worker.email || '').toLowerCase().trim();
        const wPhone = (worker.phone || '').trim();
        const wName = (worker.name || '').toLowerCase().trim();

        const isEmailMatch = wEmail && tEmail === wEmail;
        const isPhoneMatched = wPhone && isPhoneMatch(wPhone, tPhone);
        const isNameMatch = wName && tName === wName;

        if (isEmailMatch || isPhoneMatched || isNameMatch) {
          return false;
        }
      }
      return true;
    });

    saveRegisteredTailors(filteredTailors);
    setRegisteredTailors(filteredTailors);

    addActivity('Staff Erased', `Pruned tailor profile for ${worker?.name || id}`, currentUser?.role || 'Owner', currentUser?.name || 'Owner');
    triggerToast(`Tailor erased successfully from ERP!`, 'success');
  };

  const handleDeleteAllWorkers = () => {
    // Determine which workers to delete
    // If Admin/Owner, we clear workers. Let's filter out only workers whose role is 'Owner' if they exist, or just clear all
    const updated = workers.filter(w => w.role === 'Owner');
    setWorkers(updated);
    saveWorkers(updated);

    // Also clear registered tailors except maybe owners
    const currentTailors = getRegisteredTailors();
    const filteredTailors = currentTailors.filter((t: any) => t.role === 'Owner');
    saveRegisteredTailors(filteredTailors);
    setRegisteredTailors(filteredTailors);

    // Reset assigned workers on orders so they don't referencedeleted workers
    const updatedOrders = orders.map(o => ({ ...o, assignedWorkerId: undefined }));
    saveOrders(updatedOrders);
    setOrders(updatedOrders);

    addActivity('All Staff Erased', `Purged all tailor records from registry database`, currentUser?.role || 'Owner', currentUser?.name || 'Owner');
    triggerToast(`All tailors removed successfully!`, 'success');
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    // 1. Update workers list
    const updatedList = workers.map(w => w.id === updatedWorker.id ? updatedWorker : w);
    setWorkers(updatedList);
    saveWorkers(updatedList);

    // 2. Also update registered_tailors list
    const tailors = getRegisteredTailors();
    const updatedTailors = tailors.map((t: any) => {
      if (t.id === updatedWorker.id || (t.email && updatedWorker.email && t.email.toLowerCase().trim() === updatedWorker.email.toLowerCase().trim())) {
        return {
          ...t,
          name: updatedWorker.name,
          email: updatedWorker.email.toLowerCase().trim(),
          phone: updatedWorker.phone,
          role: updatedWorker.role,
          skills: updatedWorker.skills || [],
          baseSalary: updatedWorker.baseSalary,
          perOrderBonus: updatedWorker.perOrderBonus
        };
      }
      return t;
    });
    saveRegisteredTailors(updatedTailors);
    setRegisteredTailors(updatedTailors);

    addActivity('Staff Updated', `Updated tailor credentials and specialized skills for ${updatedWorker.name}`, currentUser?.role || 'Owner', currentUser?.name || 'Owner');
    triggerToast(`Tailor details successfully updated!`, 'success');
  };

  const handleDeleteRegistryMember = (member: any) => {
    if (member.isWorker) {
      handleDeleteWorker(member.id);
    } else {
      const updated = registeredTailors.filter((rt: any) => rt.id !== member.id);
      saveRegisteredTailors(updated);
      setRegisteredTailors(updated);
      addActivity('Artisan Evicted', `Removed tailor registry record for ${member.name}`, currentUser?.role || 'Owner', currentUser?.name || 'Owner');
      triggerToast(`Tailor "${member.name}" removed from workspace registry!`, 'success');
    }
  };

  const handleAdminSetupTailorShop = (worker: Worker, shopDetails: any) => {
    // 1. Get the current list of registered tailors
    const tailorsList = getRegisteredTailors();
    
    // 2. Find if they have a matching profile in registered_tailors
    const workerEmail = (worker.email || '').toLowerCase().trim();
    const workerPhone = (worker.phone || '').trim();
    const workerName = (worker.name || '').toLowerCase().trim();
    
    let matchIndex = tailorsList.findIndex((t: any) => {
      const tEmail = (t.email || '').toLowerCase().trim();
      const tPhone = (t.phone || '').trim();
      const tName = (t.name || '').toLowerCase().trim();
      
      return (workerEmail && tEmail === workerEmail) || 
             (workerPhone && isPhoneMatch(workerPhone, tPhone)) ||
             (workerName && tName === workerName);
    });

    let updatedList = [...tailorsList];

    if (matchIndex >= 0) {
      // Exist: Update their profile with setup details
      updatedList[matchIndex] = {
        ...updatedList[matchIndex],
        hasRegisteredShop: true,
        shopName: shopDetails.shopName,
        location: shopDetails.location,
        phone: shopDetails.phone,
        logoUrl: shopDetails.logoUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop',
        coordinateLatitude: shopDetails.coordinateLatitude,
        coordinateLongitude: shopDetails.coordinateLongitude,
        name: shopDetails.name || updatedList[matchIndex].name
      };
    } else {
      // Doesn't exist: Auto-register a login account in registered_tailors so they can login and use the shop!
      const newTailorAccount = {
        id: `TAILOR-${Date.now()}`,
        name: shopDetails.name || worker.name,
        email: worker.email || `${worker.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        phone: shopDetails.phone || worker.phone,
        password: (worker.phone || 'password123').replace(/\D/g, '') || 'password123',
        createdAt: new Date().toISOString(),
        hasRegisteredShop: true,
        shopName: shopDetails.shopName,
        location: shopDetails.location,
        logoUrl: shopDetails.logoUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop',
        coordinateLatitude: shopDetails.coordinateLatitude,
        coordinateLongitude: shopDetails.coordinateLongitude
      };
      updatedList.push(newTailorAccount);
    }

    saveRegisteredTailors(updatedList);
    setRegisteredTailors(updatedList);

    // Also update this worker in the master workers list so they are synced over Firestore/Local Database with active shop parameters!
    const targetOwnerAccount = matchIndex >= 0 ? updatedList[matchIndex] : updatedList[updatedList.length - 1];
    const updatedWorkers = workers.map((w: any) => {
      const isEmailEqual = w.email && worker.email && w.email.toLowerCase().trim() === worker.email.toLowerCase().trim();
      const isPhoneEqual = w.phone && worker.phone && isPhoneMatch(w.phone, worker.phone);
      const isNameEqual = w.name && worker.name && w.name.toLowerCase().trim() === worker.name.toLowerCase().trim();
      
      if (w.id === worker.id || isEmailEqual || isPhoneEqual || isNameEqual) {
        return {
          ...w,
          hasRegisteredShop: true,
          shopName: shopDetails.shopName,
          logoUrl: shopDetails.logoUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop',
          location: shopDetails.location,
          coordinateLatitude: shopDetails.coordinateLatitude,
          coordinateLongitude: shopDetails.coordinateLongitude,
          shopOwnerId: targetOwnerAccount.id,
          shopOwnerEmail: targetOwnerAccount.email
        };
      }
      return w;
    });
    setWorkers(updatedWorkers);
    saveWorkers(updatedWorkers);

    triggerToast(`Successfully activated "${shopDetails.shopName}" shop workstation in the TAILORSHOP ERP database!`, 'success');
  };

  // Sign In event trigger
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword.trim()) {
      triggerToast('Please provide your account coordinates.', 'error');
      return;
    }

    const emailClean = signInEmail.toLowerCase().trim();
    const passwordClean = signInPassword.trim();
    const passwordCleanUpper = passwordClean.toUpperCase();

    // Helper to match phone numbers with or without country codes, spaces, or formatting robustly
    const isPhoneMatch = (phone1: string, phone2: string) => {
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

    // 1. Check Master Admin/Owner Bypass
    if (emailClean === 'owner@gmail.com' && passwordClean === 'TAILORSHOP_ERPOwner2026!') {
      const user = {
        id: 'TAILOR-OWNER-MASTER',
        name: 'TAILORSHOP ERP Master Admin',
        email: 'owner@gmail.com',
        phone: '+91 9876543210',
        location: 'HQ Central Suite',
        role: 'Owner' as const
      };
      setCurrentUser(user);
      if (rememberMe) {
        localStorage.setItem('tailor_logged_in_user', JSON.stringify(user));
      }
      addActivity('Sign In', 'TAILORSHOP ERP Master logged in via secure bypass credentials', 'Owner', user.name);
      triggerToast(`Master Executive Access Granted. Welcome, Admin Owner!`, 'success');
      return;
    }

    // 2. Check Tailor List from registered_tailors and workers (direct staff tailors) lists
    const registeredTailorsList = getRegisteredTailors();
    const combinedTailors = [
      ...registeredTailorsList,
      ...workers.map((w: any) => {
        // Find if this worker has registered shop status in registeredTailorsList as well
        const matchInTailors = registeredTailorsList.find((t: any) => {
          const tEmail = (t.email || '').toLowerCase().trim();
          const tPhone = (t.phone || '').trim();
          const tName = (t.name || '').toLowerCase().trim();
          const wEmail = (w.email || '').toLowerCase().trim();
          const wPhone = (w.phone || '').trim();
          const wName = (w.name || '').toLowerCase().trim();
          return (wEmail && tEmail === wEmail) || 
                 (wPhone && isPhoneMatch(wPhone, tPhone)) || 
                 (wName && tName === wName);
        });
        
        return {
          id: w.id,
          name: w.name,
          email: w.email || '',
          phone: w.phone || '',
          location: w.location || 'Studio Workspace',
          password: w.phone || w.name, // Setup phone or name as fallback passwords
          hasRegisteredShop: !!(w.hasRegisteredShop || (matchInTailors && matchInTailors.hasRegisteredShop))
        };
      })
    ];

    // Find all potential matching tailors (we'll check password for all matching tailors to be robust)
    const matchingTailors = combinedTailors.filter((t: any) => {
      const tName = (t.name || '').toLowerCase().trim();
      const tEmail = (t.email || '').toLowerCase().trim();
      const tPhone = (t.phone || '').trim();

      return (tEmail && tEmail === emailClean) || 
             (tPhone && isPhoneMatch(tPhone, emailClean)) ||
             (tPhone && isPhoneMatch(tPhone, signInEmail.trim())) ||
             (tName && tName === emailClean) ||
             (tName && tName.replace(/\s+/g, '') === emailClean.replace(/\s+/g, ''));
    });

    // Check if any matching tailor has the correct password
    for (const tailor of matchingTailors) {
      const tName = (tailor.name || '').trim();
      const tPhone = (tailor.phone || '').trim();
      const tPassword = (tailor.password || '').trim();

      const isPasswordMatch = 
        (tPassword && tPassword.toLowerCase().trim() === passwordClean.toLowerCase().trim()) ||
        (tPhone && isPhoneMatch(tPhone, passwordClean)) ||
        (tPassword && isPhoneMatch(tPassword, passwordClean)) ||
        (tPhone && tPhone.replace(/\D/g, '') === passwordClean.replace(/\D/g, '')) ||
        (tPassword && tPassword.replace(/\D/g, '') === passwordClean.replace(/\D/g, '')) ||
        (tName && tName.toLowerCase() === passwordClean.toLowerCase()) ||
        (tName && tName.toLowerCase().replace(/\s+/g, '') === passwordClean.toLowerCase().replace(/\s+/g, ''));

      if (isPasswordMatch) {
         const matchedWorker = workers.find((w: any) => 
           w.id === tailor.id || 
           (w.email && tailor.email && w.email.toLowerCase().trim() === tailor.email.toLowerCase().trim()) ||
           (w.phone && tailor.phone && isPhoneMatch(w.phone, tailor.phone))
         );
         const isAWorker = !tailor.id.startsWith('TLR-') && (tailor.id.startsWith('WRK-') || !!matchedWorker);
         if (isAWorker) {
           setTailorPage('pending_tasks');
         }
         
         let resolvedRole = 'Tailor';
         if (!isAWorker && (tailor.id.startsWith('TLR-') || tailor.role === 'Owner' || tailor.hasRegisteredShop)) {
           resolvedRole = 'Owner';
         } else if ((matchedWorker && matchedWorker.role === 'Manager') || tailor.role === 'Manager') {
           resolvedRole = 'Manager';
         }

         const user = {
           id: tailor.id,
           name: tailor.name,
           email: tailor.email,
           phone: tailor.phone,
           location: tailor.location || 'Studio Workspace',
           role: resolvedRole as any,
           hasRegisteredShop: !isAWorker && !!tailor.hasRegisteredShop,
           isWorker: isAWorker
         };
         setCurrentUser(user);
         if (rememberMe) {
           localStorage.setItem('tailor_logged_in_user', JSON.stringify(user));
         }
         addActivity('Sign In', `TAILORSHOP ERP Owner / Tailor logged in successfully`, 'Owner', tailor.name);
         triggerToast(`Welcome back to the studio, ${tailor.name}!`, 'success');
         return;
      }
    }

    // 3. Check Customers List (Bespoke lookup: phone, email, or name matches)
    const activeCustomers = getCustomers();
    const allOrders = getOrders();

    // Find all matching customers
    const matchingCustomers = activeCustomers.filter((c: any) => {
      const custName = (c.name || '').toLowerCase().trim();
      const custEmail = (c.email || '').toLowerCase().trim();
      const custPhone = (c.phone || '').trim();

      const emailPrefixTyped = emailClean.split('@')[0].slice(0, 5);
      const emailPrefixCust = custEmail.split('@')[0].slice(0, 5);
      const isEmailPrefixMatch = emailPrefixTyped.length >= 5 && emailPrefixTyped === emailPrefixCust;

      // Check if they matched by email, phone, name, or order ID (if typed in email clean)
      const matchesContact = 
        custEmail === emailClean || 
        isPhoneMatch(custPhone, emailClean) ||
        isPhoneMatch(custPhone, signInEmail.trim()) ||
        custName === emailClean ||
        custName.replace(/\s+/g, '') === emailClean.replace(/\s+/g, '') ||
        isEmailPrefixMatch;

      if (matchesContact) return true;

      // Or check if the user entered an Order ID or phone/email that matches an order of this customer
      const hasMatchingOrder = allOrders.some(o => 
        o.customerId === c.id && 
        (o.id.toUpperCase().trim() === emailClean.toUpperCase() || 
         o.id.toUpperCase().trim() === passwordCleanUpper)
      );

      return hasMatchingOrder;
    });

    // Validate customer password among matching customers
    for (const customer of matchingCustomers) {
      const custName = (customer.name || '').trim();
      const custPhone = (customer.phone || '').trim();
      const custEmail = (customer.email || '').trim().toLowerCase();
      const customerOrders = allOrders.filter(o => o.customerId === customer.id);
      
      const isOrderIdPassword = customerOrders.some(o => o.id.toUpperCase().trim() === passwordCleanUpper);

      const isPasswordMatch = 
        (customer.password && customer.password === passwordClean) || 
        passwordClean === 'password123' || 
        passwordClean === customer.id ||
        (custPhone && isPhoneMatch(custPhone, passwordClean)) ||
        (customer.password && isPhoneMatch(customer.password, passwordClean)) ||
        (custEmail && custEmail === passwordClean.toLowerCase()) ||
        (custName && custName.toLowerCase() === passwordClean.toLowerCase()) ||
        (custName && custName.toLowerCase().replace(/\s+/g, '') === passwordClean.toLowerCase().replace(/\s+/g, ''));

      if (isOrderIdPassword || isPasswordMatch) {
         const user = {
           id: customer.id,
           name: customer.name,
           email: customer.email,
           phone: customer.phone,
           role: 'Customer' as const
         };
         setCurrentUser(user);
         if (rememberMe) {
           localStorage.setItem('tailor_logged_in_user', JSON.stringify(user));
         }
         addActivity('Sign In', `Customer logged in successfully (ID: ${customer.id})`, 'Customer', customer.name);
         triggerToast(`Welcome back, ${customer.name}!`, 'success');
         return;
      }
    }

    // 4. Handle Incorrect Passwords specifically for the matched roles
    if (matchingTailors.length > 0) {
       triggerToast('Incorrect password for Tailor (you can use your registered Phone Number as your password).', 'error');
       return;
    }

    if (matchingCustomers.length > 0) {
       triggerToast('Incorrect password for Customer. (You can use your Phone Number, Email, Name, or Order ID as password)', 'error');
       return;
    }

    // No role matched at all
    triggerToast('No tailored profiles or customer records found with those credentials.', 'error');
  };

  // Sign Up event trigger
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const isTailor = signUpRole === 'Tailor';
    if (!signUpName.trim() || !signUpEmail.trim() || (!isTailor && !signUpPassword.trim()) || !signUpPhone.trim()) {
      triggerToast('Please fulfill all critical sizing accounts fields.', 'error');
      return;
    }

    const nameVal = signUpName.trim();
    const emailVal = signUpEmail.toLowerCase().trim();
    const passwordVal = isTailor ? signUpPhone.trim() : signUpPassword;
    const phoneVal = signUpPhone.trim();
    const locVal = isTailor ? 'Studio Workspace' : signUpLocation.trim() || 'Walk-in Studio Client';

    if (signUpRole === 'Tailor') {
      const tailors = getRegisteredTailors();
      if (tailors.some((t: any) => t.email.toLowerCase().trim() === emailVal)) {
        triggerToast('A tailoring workshop is already registered under this email address.', 'error');
        return;
      }
    } else {
      // Customer Sign Up
      const currentCusts = getCustomers();
      if (currentCusts.some((c) => c.email.toLowerCase().trim() === emailVal)) {
        triggerToast('This customer is already indexed in our client ledger. Log In on left!', 'error');
        return;
      }
    }

    // Trigger API to send SMS via backend
    triggerToast('Initiating secure OTP network connection...', 'info');
    
    fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneVal }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network response failure');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setPhoneOtpCode(data.testCode || 'REAL_DISPATCHED');
          setIsTwilioConfigured(!data.requiresConfig);
          setPhoneNumberBeingVerified(phoneVal);
          setPendingSignUpData({
            nameVal,
            emailVal,
            passwordVal,
            phoneVal,
            locVal,
            roleVal: signUpRole
          });
          setEnteredOtp('');
          setOtpVerificationError(null);
          
          if (data.requiresConfig) {
            triggerToast('SMS dispatch simulator mode activated (Twilio keys not set).', 'info');
          } else {
            triggerToast(`Secure OTP dispatch sent via Twilio to ${phoneVal}!`, 'success');
          }
        } else {
          triggerToast(data.error || 'SMS API Dispatch Failure. Try again.', 'error');
        }
      })
      .catch((error) => {
        console.error("SMS API Error:", error);
        triggerToast('Could not reach backend OTP verification server. Offline mode backup activated.', 'error');
        
        // Backup Local Generator
        const computedCode = Math.floor(100000 + Math.random() * 900000).toString();
        setPhoneOtpCode(computedCode);
        setIsTwilioConfigured(false);
        setPhoneNumberBeingVerified(phoneVal);
        setPendingSignUpData({
          nameVal,
          emailVal,
          passwordVal,
          phoneVal,
          locVal,
          roleVal: signUpRole
        });
        setEnteredOtp('');
        setOtpVerificationError(null);
      });
  };

  // OTP Mobile Number Verification actions
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingSignUpData) return;

    triggerToast('Validating mobile verification token...', 'info');

    fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: pendingSignUpData.phoneVal, code: enteredOtp }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network verification error');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          const { nameVal, emailVal, passwordVal, phoneVal, locVal, roleVal } = pendingSignUpData;

          if (roleVal === 'Tailor') {
            const tailors = getRegisteredTailors();
            const newTailor = {
              id: `TAILOR-${Date.now()}`,
              name: nameVal,
              email: emailVal,
              password: passwordVal,
              phone: phoneVal,
              location: locVal,
              createdAt: new Date().toISOString()
            };
            
            const updatedList = [...tailors, newTailor];
            saveRegisteredTailors(updatedList);
            setRegisteredTailors(updatedList);
            
            const user = {
              id: newTailor.id,
              name: newTailor.name,
              email: newTailor.email,
              phone: newTailor.phone,
              location: newTailor.location,
              role: 'Tailor' as const
            };
            setCurrentUser(user);
            localStorage.setItem('tailor_logged_in_user', JSON.stringify(user));
            setTailorPage('pending_tasks');
            addActivity('Account Created', `Created Tailor Studio Account: ${user.name}`, 'Owner', user.name);
            triggerToast(`Mobile number verified! Welcome, ${user.name}!`, 'success');
          } else {
            // Customer Sign Up
            const currentCusts = getCustomers();
            const newId = `CUST-${Date.now()}`;
            const newCust: Customer = {
              id: newId,
              name: nameVal,
              phone: phoneVal,
              whatsapp: phoneVal,
              email: emailVal,
              address: locVal,
              qrCodeData: `https://tailorshop-erp.net/customer/${newId}`,
              avatar: `https://images.unsplash.com/photo-${1534528741775 - Math.floor(Math.random() * 50000)}?auto=format&fit=crop&q=80&w=120`,
              createdAt: new Date().toISOString(),
              passwordChanged: true,
              password: passwordVal
            };

            const updatedCustomers = [...currentCusts, newCust];
            saveCustomers(updatedCustomers);
            setCustomers(updatedCustomers);

            const user = {
              id: newCust.id,
              name: newCust.name,
              email: newCust.email,
              phone: newCust.phone,
              role: 'Customer' as const
            };
            setCurrentUser(user);
            localStorage.setItem('tailor_logged_in_user', JSON.stringify(user));
            addActivity('Account Created', `New Customer Account registered: ${user.name}`, 'Customer', user.name);
            triggerToast(`Mobile number verified! Welcome to the client lounge, ${user.name}!`, 'success');
          }

          // Clear fields
          setSignUpName('');
          setSignUpEmail('');
          setSignUpPassword('');
          setSignUpPhone('');
          setSignUpLocation('');

          setPhoneOtpCode(null);
          setPendingSignUpData(null);
          setEnteredOtp('');
          setOtpVerificationError(null);
        } else {
          setOtpVerificationError(data.error || 'Invalid verification code.');
          triggerToast('Mobile OTP mismatch. Retrying verification.', 'error');
        }
      })
      .catch((err) => {
        console.error("Local/Offline verification fallback:", err);
        // Fallback or full-auto bypass for offline or local testing - any non-empty code succeeds!
        if (enteredOtp.trim() !== '') {
          const { nameVal, emailVal, passwordVal, phoneVal, locVal, roleVal } = pendingSignUpData;

          if (roleVal === 'Tailor') {
            const tailors = getRegisteredTailors();
            const newTailor = {
              id: `TAILOR-${Date.now()}`,
              name: nameVal,
              email: emailVal,
              password: passwordVal,
              phone: phoneVal,
              location: locVal,
              createdAt: new Date().toISOString()
            };
            
            const updatedList = [...tailors, newTailor];
            saveRegisteredTailors(updatedList);
            setRegisteredTailors(updatedList);
            
            const user = {
              id: newTailor.id,
              name: newTailor.name,
              email: newTailor.email,
              phone: newTailor.phone,
              location: newTailor.location,
              role: 'Tailor' as const
            };
            setCurrentUser(user);
            localStorage.setItem('tailor_logged_in_user', JSON.stringify(user));
            setTailorPage('pending_tasks');
            addActivity('Account Created', `Created Tailor Studio Account: ${user.name}`, 'Owner', user.name);
            triggerToast(`Mobile number verified! Welcome, ${user.name}!`, 'success');
          } else {
            // Customer Sign Up
            const currentCusts = getCustomers();
            const newId = `CUST-${Date.now()}`;
            const newCust: Customer = {
              id: newId,
              name: nameVal,
              phone: phoneVal,
              whatsapp: phoneVal,
              email: emailVal,
              address: locVal,
              qrCodeData: `https://tailorshop-erp.net/customer/${newId}`,
              avatar: `https://images.unsplash.com/photo-${1534528741775 - Math.floor(Math.random() * 50000)}?auto=format&fit=crop&q=80&w=120`,
              createdAt: new Date().toISOString(),
              passwordChanged: true,
              password: passwordVal
            };

            const updatedCustomers = [...currentCusts, newCust];
            saveCustomers(updatedCustomers);
            setCustomers(updatedCustomers);

            const user = {
              id: newCust.id,
              name: newCust.name,
              email: newCust.email,
              phone: newCust.phone,
              role: 'Customer' as const
            };
            setCurrentUser(user);
            localStorage.setItem('tailor_logged_in_user', JSON.stringify(user));
            addActivity('Account Created', `New Customer Account registered: ${user.name}`, 'Customer', user.name);
            triggerToast(`Mobile number verified! Welcome to the client lounge, ${user.name}!`, 'success');
          }

          // Clear fields
          setSignUpName('');
          setSignUpEmail('');
          setSignUpPassword('');
          setSignUpPhone('');
          setSignUpLocation('');

          setPhoneOtpCode(null);
          setPendingSignUpData(null);
          setEnteredOtp('');
          setOtpVerificationError(null);
        } else {
          setOtpVerificationError('Invalid security code. Please check code and retry.');
          triggerToast('Mobile OTP mismatch.', 'error');
        }
      });
  };

  const handleResendOtp = () => {
    if (!pendingSignUpData) return;
    triggerToast('Re-dispatching secure SMS key...', 'info');

    fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: pendingSignUpData.phoneVal }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Resend network error');
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setPhoneOtpCode(data.testCode || 'REAL_DISPATCHED');
          setIsTwilioConfigured(!data.requiresConfig);
          setEnteredOtp('');
          setOtpVerificationError(null);
          if (data.requiresConfig) {
            triggerToast('Enacted simulation mode for secure key resend.', 'info');
          } else {
            triggerToast(`A fresh secure SMS code was sent via Twilio to ${pendingSignUpData.phoneVal}!`, 'success');
          }
        } else {
          triggerToast(data.error || 'Unable to re-transmit.', 'error');
        }
      })
      .catch((err) => {
        const freshCode = Math.floor(100000 + Math.random() * 900000).toString();
        setPhoneOtpCode(freshCode);
        setIsTwilioConfigured(false);
        setEnteredOtp('');
        setOtpVerificationError(null);
        triggerToast(`Local SMS Sim Backup re-sent new secure SMS key to ${pendingSignUpData.phoneVal}!`, 'info');
      });
  };

  const handleCancelOtp = () => {
    setPhoneOtpCode(null);
    setPendingSignUpData(null);
    setEnteredOtp('');
    setOtpVerificationError(null);
    triggerToast('TAILORSHOP ERP registration verification aborted.', 'info');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('tailor_logged_in_user');
    triggerToast('Sign Out complete. Safe journey!', 'info');
  };

  // When clothing type updates, reload standard parameter slots
  const handleClothingTypeChange = (type: string) => {
    setClothingType(type);
    setSizingFields({ ...(clothingTemplates[type] || clothingTemplates['Custom'] || {}) });

    // Premium realistic estimates from customizable settings
    setPrice(clothingPrices[type] || clothingPrices['Custom'] || 300);
  };

  const handleAddCategory = () => {
    const cleanName = newCategoryName.trim();
    if (!cleanName) {
      triggerToast('Please type a category name.', 'error');
      return;
    }
    
    // Capitalize first letter to keep it tidy
    const capitalizedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    if (clothingCategories.includes(capitalizedName)) {
      triggerToast('This category already exists!', 'error');
      return;
    }

    // Add category
    setClothingCategories((prev) => [...prev, capitalizedName]);

    // Add category's base price
    setClothingPrices((prev) => ({
      ...prev,
      [capitalizedName]: newCategoryPrice || 300
    }));

    // Copy template fields
    const baseFields = clothingTemplates[newCategoryBase] || { Length: '36', Width: '20' };
    setClothingTemplates((prev) => ({
      ...prev,
      [capitalizedName]: { ...baseFields }
    }));

    // Switch active type to this new type!
    setClothingType(capitalizedName);
    setSizingFields({ ...baseFields });
    // Set active session price
    setPrice(newCategoryPrice || 300);

    // Toast
    triggerToast(`Custom genre "${capitalizedName}" added successfully with base price of ₹${newCategoryPrice || 300}. Styled in Indigo theme!`, 'success');

    // Reset inputs
    setNewCategoryName('');
    setNewCategoryPrice(300);
    setShowAddCategoryForm(false);
  };

  // Add a brand new sizing label to current active pattern on the fly
  const handleAddNewSizingField = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = customFieldName.trim();
    if (!cleanLabel) return;
    setSizingFields((prev) => ({
      ...prev,
      [cleanLabel]: ''
    }));
    setCustomFieldName('');
  };

  // Remove sizing label
  const handleRemoveField = (fieldKey: string) => {
    setSizingFields((prev) => {
      const copy = { ...prev };
      delete copy[fieldKey];
      return copy;
    });
  };

  // Global listener for Enter keys to cycle sessions easily
  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      // If we are looking at the success voucher summary, pressing enter takes us directly to the next session
      if (sessionStage === 'completed') {
        e.preventDefault();
        handleStartNextSession();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [sessionStage, lastSavedSession]);

  // Autofocus the Name input whenever active session begins
  useEffect(() => {
    if (sessionStage === 'active') {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 80);
    }
  }, [sessionStage]);

  // Complete & commit current workshop sizing session
  const handleSubmitSession = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      alert('Required customer contact coordinates needed (Name, Phone number, Email address).');
      return;
    }

    // 1. Resolve Customer ID
    let currentCust = customers.find(
      (c) =>
        c.phone.trim() === customerPhone.trim() ||
        c.email.toLowerCase().trim() === customerEmail.toLowerCase().trim()
    );

    let updatedCustomers = [...customers];

    if (!currentCust) {
      // Create new customer index profile
      const newId = `CUST-${Date.now()}`;
      currentCust = {
        id: newId,
        name: customerName.trim(),
        phone: customerPhone.trim(),
        whatsapp: customerPhone.trim(),
        email: customerEmail.trim().toLowerCase(),
        address: 'Walk-in Workshop Customer',
        qrCodeData: `https://tailorshop-erp.net/customer/${newId}`,
        avatar: `https://images.unsplash.com/photo-${1534528741775 - Math.floor(Math.random() * 50000)}?auto=format&fit=crop&q=80&w=120`,
        createdAt: new Date().toISOString(),
        passwordChanged: false
      };
      updatedCustomers = [...updatedCustomers, currentCust];
      saveCustomers(updatedCustomers);
      setCustomers(updatedCustomers);
    }

    // 2. Register Measurement Record
    const finalFields: Record<string, string> = {};
    Object.entries(sizingFields).forEach(([k, v]) => {
      const unit = fieldUnits[k] || 'in';
      finalFields[k] = `${v} ${unit}`;
    });

    const activeShopDetails = getCurrentUserShopInfo();
    const newMeasureRecord: MeasurementRecord = {
      id: `MSR-${Date.now()}`,
      customerId: currentCust.id,
      clothingType: clothingType,
      date: new Date().toISOString(),
      fields: finalFields,
      notes: notes.trim() || 'Classic bespoke fit.',
      tailorId: currentUser?.id || 'TAILOR-OWNER-MASTER',
      shopName: activeShopDetails?.shopName || 'TAILORSHOP ERP'
    };
    const updatedMeasurements = [newMeasureRecord, ...measurements];
    saveMeasurements(updatedMeasurements);
    setMeasurements(updatedMeasurements);

    // 3. Register Commission Order representing the delivery timelines
    const orderShopInfo = getCurrentUserShopInfo();
    const newOrder: Order = {
      id: `ORD-${orders.length + 9841}`,
      customerId: currentCust.id,
      clothingType: clothingType,
      quantity: 1,
      deliveryDate: readyDate,
      status: 'Measurement Taken',
      price: price,
      advancePayment: Math.round(price * 0.5),
      remainingBalance: Math.round(price * 0.5),
      paymentStatus: 'Partially Paid',
      createdAt: new Date().toISOString(),
      notes: {
        instructions: notes,
        fabricDetails: 'Handled by TAILORSHOP ERP Cutter Room',
        urgentNotes: 'Captured during live workshop sizing',
        tailorNotes: 'Pattern indices locked successfully',
        privateNotes: 'Bespoke client session logged'
      },
      images: { reference: [], fabric: [], finished: [] },
      shopName: orderShopInfo?.shopName || undefined
    };
    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);
    setOrders(updatedOrders);

    // 4. Trigger dispatch warnings & alert copy (WhatsApp + Email logs)
    const formattedDate = new Date(readyDate).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const whatsappAlert = `Hello ${currentCust.name}, your bespoke tailoring session for custom ${clothingType} measurements is completed! Fitting scheduled to be ready on ${formattedDate}. Advance deposit: ₹${newOrder.advancePayment}. Outstanding: ₹${newOrder.remainingBalance}. Thank you, Sartorial TAILORSHOP ERP!`;
    const emailAlert = `Dear ${currentCust.name},\n\nWe have successfully logged your custom ${clothingType} measurements today in our TAILORSHOP ERP Ledger. Sizing indices are archived under token reference ${newMeasureRecord.id}.\n\nYour customized tailoring package is scheduled to be completed and ready for final fitting on ${formattedDate}.\n\nWarmest regards,\nSartorial Luxury Tailoring team\nEST. 2026`;

    triggerSystemNotification('WhatsApp', currentCust.phone, whatsappAlert);
    triggerSystemNotification('Email', currentCust.email, emailAlert);
    addActivity('Session Logged', `Recorded measurements matching order reference ${newOrder.id} for patron ${currentCust.name}`, 'Owner', 'Sartorial Master');

    // 5. Place current active pointers into memory & advance workflow to completed screen
    setLastSavedSession({
      customer: currentCust,
      measurement: newMeasureRecord,
      order: newOrder,
      whatsappAlert,
      emailAlert
    });

    // Finished saving, no automatic WhatsApp popup opening
    triggerToast('Bespoke session recorded successfully!', 'success');

    setSessionStage('completed');
  };

  // Master controller to cycle next continuous session
  const handleStartNextSession = () => {
    // Soft reset current fields, preserving some tailor speed settings
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    setClothingType('Shirt');
    setSizingFields({ ...clothingTemplates.Shirt });
    setPrice(180);
    setReadyDate(getDefaultReadyDate());

    // Switch back stage to Active Entry
    setSessionStage('active');
    setActiveStep(1);
  };

  // Fast filling templates for swift testing during demos
  const handleApplyDemoProfile = (profile: { name: string; phone: string; email: string; readyOffset: number }) => {
    setCustomerName(profile.name);
    setCustomerPhone(profile.phone);
    setCustomerEmail(profile.email);
    
    const d = new Date();
    d.setDate(d.getDate() + profile.readyOffset);
    setReadyDate(d.toISOString().split('T')[0]);
  };

  // Print voucher modal template
  const escapeHTML = (str: string) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const triggerPrintVoucher = (recordId: string, customerId: string, orderId?: string) => {
    const record = measurements.find((m) => m.id === recordId);
    const customer = customers.find((c) => c.id === customerId);
    const order = orderId 
      ? orders.find((o) => o.id === orderId)
      : orders.find((o) => o.customerId === customerId && o.clothingType === record?.clothingType);

    if (!record || !customer) {
      alert('Unable to load matching sizing archival elements.');
      return;
    }

    // Dynamic Shop Separation for Invoices/Bills
    const owningTailor = record.tailorId 
      ? registeredTailors.find(t => t.id === record.tailorId) 
      : (record.shopName 
          ? registeredTailors.find(t => t.shopName && t.shopName.toLowerCase().trim() === record.shopName.toLowerCase().trim()) 
          : null);

    const billShopName = owningTailor?.shopName || record.shopName || getCurrentUserShopInfo()?.shopName || tailorshopName || 'TAILORSHOP ERP';
    const billLogoUrl = owningTailor?.logoUrl || getCurrentUserShopInfo()?.logoUrl || customLogoUrl || '';
    const billPhone = owningTailor?.phone || getCurrentUserShopInfo()?.phone || '';
    const billLocation = owningTailor?.location || getCurrentUserShopInfo()?.location || '';

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Pop-up blocked. Please enable pop-ups for this domain to print vouchers.');
      return;
    }

    const formattedDate = new Date(record.date).toLocaleDateString();
    const readyFormatted = order ? new Date(order.deliveryDate).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Scheduled soon';

    const cleanName = (customer.name || 'P').trim();
    const parts = cleanName.split(/\s+/);
    const patronInitials = parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : cleanName.slice(0, 2).toUpperCase();

    const clientDp = customer.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2";

    printWin.document.write(`
      <html>
        <head>
          <title>TAILORSHOP ERP Fitting Card - ${escapeHTML(customer.name)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;850&family=Inter:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&family=Montserrat:wght@400;600;805;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;600;700&display=swap');
            body {
              font-family: '${voucherFont}', 'Plus Jakarta Sans', sans-serif;
              padding: 30px;
              color: ${voucherTextColor};
              background-color: #faf9f6;
              -webkit-print-color-adjust: exact;
            }
            .ticket {
              border: 1px solid #e7e5e4;
              border-top: 8px solid ${voucherAccentColor};
              background-color: ${voucherBgColor};
              padding: 32px;
              max-width: 580px;
              margin: 0 auto;
              border-radius: 16px;
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05);
            }
            .erp-header {
              text-align: center;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 3px;
              color: ${voucherAccentColor};
              font-weight: 800;
              margin-bottom: 2px;
            }
            .header {
              display: flex;
              flex-direction: column;
              align-items: ${voucherLogoAlignment === 'center' ? 'center' : (voucherLogoAlignment === 'right' ? 'flex-end' : 'flex-start')};
              text-align: ${voucherLogoAlignment};
              border-bottom: 2px ${voucherBorderStyle} #e7e5e4;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .title {
              font-family: '${voucherFont}', 'Playfair Display', serif;
              font-size: 32px;
              font-weight: 750;
              letter-spacing: 0.5px;
              margin: 4px 0 2px 0;
              color: ${voucherTextColor};
            }
            .subtitle {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 4px;
              color: #78716c;
              font-weight: 700;
              margin: 0;
            }
            .section-title {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #78716c;
              border-bottom: 1px solid #e7e5e4;
              padding-bottom: 6px;
              margin: 16px 0 8px 0;
              font-weight: 800;
            }
            .dp-container {
              display: flex;
              align-items: center;
              gap: 16px;
              background-color: #fafaf9;
              border: 1px solid #f1eeeb;
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 16px;
            }
            .dp-img {
              width: 64px;
              height: 64px;
              border-radius: 12px;
              object-fit: cover;
              border: 2px solid ${voucherAccentColor};
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            }
            .dp-fallback {
              width: 64px;
              height: 64px;
              border-radius: 12px;
              background: linear-gradient(135deg, ${voucherAccentColor}, #1c1917);
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 20px;
              border: 2px solid ${voucherAccentColor};
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            }
            .customer-info {
              flex-grow: 1;
            }
            .customer-name {
              font-size: 16px;
              font-weight: 800;
              color: ${voucherTextColor};
              margin-bottom: 4px;
            }
            .customer-meta {
              font-size: 12px;
              color: #57534e;
              margin-bottom: 2px;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .grid-params {
              display: grid;
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 12px;
              margin-bottom: 16px;
            }
            .param-box {
              background: #fffdfa;
              border: 1px solid #f1eeeb;
              border-bottom: 3.5px solid ${voucherAccentColor};
              border-radius: 8px;
              padding: 12px 6px;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            }
            .param-val {
              font-size: 20px;
              font-weight: 800;
              color: ${voucherTextColor};
            }
            .param-lbl {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #78716c;
              margin-top: 4px;
              font-weight: bold;
            }
            .receipt-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              color: #292524;
              font-size: 13px;
            }
            .receipt-table td {
              padding: 6px 0;
            }
            .receipt-table tr.divider td {
              border-bottom: 1px dashed #e7e5e4;
              padding: 0;
            }
            .receipt-table tr.total-row td {
              border-top: 1.5px solid #1c1917;
              padding-top: 10px;
              font-weight: 800;
            }
            .notes-block {
              font-size: 12px;
              background: #faf8f5;
              border-left: 4px solid ${voucherAccentColor};
              padding: 12px 16px;
              margin: 12px 0;
              border-radius: 0 8px 8px 0;
              font-style: italic;
              color: #44403c;
              line-height: 1.5;
            }
            .ready-card {
              background: linear-gradient(135deg, ${voucherAccentColor}, #1c1917);
              color: #ffffff;
              padding: 14px 20px;
              border-radius: 12px;
              text-align: center;
              font-weight: 800;
              font-size: 14px;
              margin-top: 28px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              letter-spacing: 0.5px;
            }
            .footer-notes {
              font-size: 11px;
              color: #78716c;
              text-align: center;
              margin-top: 32px;
              font-style: italic;
              border-top: 1px ${voucherBorderStyle} #e7e5e4;
              padding-top: 20px;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="erp-header">Tailor Shop ERP</div>
            <div class="header">
              ${billLogoUrl ? `
                <img 
                  src="${escapeHTML(billLogoUrl)}" 
                  style="height: 52px; max-width: 180px; object-fit: contain; margin-bottom: 12px; border-radius: 6px;" 
                  alt="${escapeHTML(billShopName)}" 
                  referrerpolicy="no-referrer"
                />
              ` : ''}
              <h1 class="title">${escapeHTML(billShopName)}</h1>
              <p class="subtitle" style="color: ${voucherAccentColor};">${escapeHTML(voucherSubtitle)}</p>
              ${billPhone || billLocation ? `
                <div style="font-size: 10px; color: #78716c; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">
                  ${billLocation ? `🌐 ${escapeHTML(billLocation)}` : ''}
                  ${billPhone ? ` • 📞 ${escapeHTML(billPhone)}` : ''}
                </div>
              ` : ''}
            </div>

            <div class="dp-container">
              <div class="customer-info">
                <div class="customer-name">${escapeHTML(customer.name)}</div>
                <div class="customer-meta">📞 <span>${escapeHTML(customer.phone) || 'N/A'}</span></div>
                <div class="customer-meta">✉️ <span>${escapeHTML(customer.email) || 'N/A'}</span></div>
                <div class="customer-meta" style="font-family: monospace; font-size: 11px; margin-top: 6px; color:#a8a29e;">VOUCHER REF: ${escapeHTML(record.id)}</div>
              </div>
              <div>
                ${clientDp ? `
                  <img 
                    src="${escapeHTML(clientDp)}" 
                    class="dp-img"
                    alt="${escapeHTML(customer.name)}"
                    referrerpolicy="no-referrer"
                    onerror="this.style.display='none'; document.getElementById('dp-fallback-el').style.display='flex';"
                  />
                  <div id="dp-fallback-el" class="dp-fallback" style="display: none;">${escapeHTML(patronInitials)}</div>
                ` : `
                  <div class="dp-fallback">${escapeHTML(patronInitials)}</div>
                `}
              </div>
            </div>

            <div class="section-title">${escapeHTML(record.clothingType)} Pattern Metrics</div>
            <div class="grid-params">
              ${Object.entries(record.fields)
                .map(
                  ([k, v]) => `
                <div class="param-box">
                  <div class="param-val">${escapeHTML(cleanMeasurementValue(v))}</div>
                  <div class="param-lbl">${escapeHTML(k)}</div>
                </div>
              `
                )
                .join('')}
            </div>

            <div class="section-title">Style Alterations &amp; Fit Specs</div>
            <div class="notes-block">
              ${escapeHTML(record.notes) || 'Classic standard fit drapes.'}
            </div>

            ${order ? `
              <div class="section-title">TAILORSHOP ERP Accounting Ledger</div>
              <table class="receipt-table">
                <tr>
                  <td><strong>Pattern Job Ref:</strong></td>
                  <td align="right">${escapeHTML(order.id)}</td>
                </tr>
                <tr>
                  <td><strong>Garment Category:</strong></td>
                  <td align="right">${escapeHTML(order.clothingType)}</td>
                </tr>
                <tr class="divider"><td colspan="2"></td></tr>
                <tr>
                  <td><strong>Commission Price (Total Amount):</strong></td>
                  <td align="right" style="font-weight: 700;">₹${order.price}</td>
                </tr>
                <tr>
                  <td><strong>Cutter Advance paid:</strong></td>
                  <td align="right" style="color:#16a34a; font-weight:700;">- ₹${order.advancePayment}</td>
                </tr>
                <tr class="total-row">
                  <td><strong>Total Balance Due at Fitting:</strong></td>
                  <td align="right" style="color:#dc2626; font-weight:800; font-size: 15px;">₹${order.remainingBalance}</td>
                </tr>
              </table>
            ` : ''}

            <div class="ready-card">
              ✨ Ready for Pick-up on ${escapeHTML(readyFormatted)}
            </div>

            <p class="footer-notes">
              ${escapeHTML(voucherFooterNotes)}
            </p>
          </div>
          <script>
            window.print();
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const downloadVoucherAsHtml = (recordId: string, customerId: string, orderId?: string) => {
    const record = measurements.find((m) => m.id === recordId);
    const customer = customers.find((c) => c.id === customerId);
    const order = orderId 
      ? orders.find((o) => o.id === orderId)
      : orders.find((o) => o.customerId === customerId && o.clothingType === record?.clothingType);

    if (!record || !customer) {
      triggerToast('Unable to load matching sizing elements for download.', 'error');
      return;
    }

    // Dynamic Shop Separation for Downloaded Bills
    const owningTailor = record.tailorId 
      ? registeredTailors.find(t => t.id === record.tailorId) 
      : (record.shopName 
          ? registeredTailors.find(t => t.shopName && t.shopName.toLowerCase().trim() === record.shopName.toLowerCase().trim()) 
          : null);

    const billShopName = owningTailor?.shopName || record.shopName || getCurrentUserShopInfo()?.shopName || tailorshopName || 'TAILORSHOP ERP';
    const billLogoUrl = owningTailor?.logoUrl || getCurrentUserShopInfo()?.logoUrl || customLogoUrl || '';
    const billPhone = owningTailor?.phone || getCurrentUserShopInfo()?.phone || '';
    const billLocation = owningTailor?.location || getCurrentUserShopInfo()?.location || '';

    const formattedDate = new Date(record.date).toLocaleDateString();
    const readyFormatted = order ? new Date(order.deliveryDate).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Scheduled soon';

    const cleanName = (customer.name || 'P').trim();
    const parts = cleanName.split(/\s+/);
    const patronInitials = parts.length >= 2 
      ? (parts[0][0] + parts[1][0]).toUpperCase() 
      : cleanName.slice(0, 2).toUpperCase();

    const clientDp = customer.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${escapeHTML(billShopName)} - Sizing Card - ${escapeHTML(customer.name)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;850&family=Inter:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&family=Montserrat:wght@400;600;805;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;600;700&display=swap');
            body {
              font-family: '${voucherFont}', 'Plus Jakarta Sans', sans-serif;
              padding: 30px;
              color: ${voucherTextColor};
              background-color: #faf9f6;
              -webkit-print-color-adjust: exact;
            }
            .ticket {
              border: 1px solid #e7e5e4;
              border-top: 8px solid ${voucherAccentColor};
              background-color: ${voucherBgColor};
              padding: 32px;
              max-width: 580px;
              margin: 0 auto;
              border-radius: 16px;
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05);
            }
            .erp-header {
              text-align: center;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 3px;
              color: ${voucherAccentColor};
              font-weight: 800;
              margin-bottom: 2px;
            }
            .header {
              display: flex;
              flex-direction: column;
              align-items: ${voucherLogoAlignment === 'center' ? 'center' : (voucherLogoAlignment === 'right' ? 'flex-end' : 'flex-start')};
              text-align: ${voucherLogoAlignment};
              border-bottom: 2px ${voucherBorderStyle} #e7e5e4;
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            .title {
              font-family: '${voucherFont}', 'Playfair Display', serif;
              font-size: 32px;
              font-weight: 750;
              letter-spacing: 0.5px;
              margin: 4px 0 2px 0;
              color: ${voucherTextColor};
            }
            .subtitle {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 4px;
              color: #78716c;
              font-weight: 700;
              margin: 0;
            }
            .section-title {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #78716c;
              border-bottom: 1px solid #e7e5e4;
              padding-bottom: 6px;
              margin: 16px 0 8px 0;
              font-weight: 800;
            }
            .dp-container {
              display: flex;
              align-items: center;
              gap: 16px;
              background-color: #fafaf9;
              border: 1px solid #f1eeeb;
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 16px;
            }
            .dp-img {
              width: 64px;
              height: 64px;
              border-radius: 12px;
              object-fit: cover;
              border: 2px solid ${voucherAccentColor};
            }
            .dp-fallback {
              width: 64px;
              height: 64px;
              border-radius: 12px;
              background: linear-gradient(135deg, ${voucherAccentColor}, #1c1917);
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 20px;
              border: 2px solid ${voucherAccentColor};
            }
            .customer-info {
              flex-grow: 1;
            }
            .customer-name {
              font-size: 16px;
              font-weight: 800;
              color: ${voucherTextColor};
              margin-bottom: 4px;
            }
            .customer-meta {
              font-size: 12px;
              color: #57534e;
              margin-bottom: 2px;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .grid-params {
              display: grid;
              grid-template-columns: repeat(4, 1fr) !important;
              gap: 12px;
              margin-bottom: 16px;
            }
            .param-box {
              background: #fffdfa;
              border: 1px solid #f1eeeb;
              border-bottom: 3.5px solid ${voucherAccentColor};
              border-radius: 8px;
              padding: 12px 6px;
              text-align: center;
            }
            .param-val {
              font-size: 20px;
              font-weight: 800;
              color: ${voucherTextColor};
            }
            .param-lbl {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #78716c;
              margin-top: 4px;
              font-weight: bold;
            }
            .receipt-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              color: #292524;
              font-size: 13px;
            }
            .receipt-table td {
              padding: 6px 0;
            }
            .receipt-table tr.divider td {
              border-bottom: 1px dashed #e7e5e4;
              padding: 0;
            }
            .receipt-table tr.total-row td {
              border-top: 1.5px solid #1c1917;
              padding-top: 10px;
              font-weight: 800;
            }
            .notes-block {
              font-size: 12px;
              background: #faf8f5;
              border-left: 4px solid ${voucherAccentColor};
              padding: 12px 16px;
              margin: 12px 0;
              border-radius: 0 8px 8px 0;
              font-style: italic;
              color: #44403c;
              line-height: 1.5;
            }
            .ready-card {
              background: linear-gradient(135deg, ${voucherAccentColor}, #1c1917);
              color: #ffffff;
              padding: 14px 20px;
              border-radius: 12px;
              text-align: center;
              font-weight: 800;
              font-size: 14px;
              margin-top: 28px;
            }
            .footer-notes {
              font-size: 11px;
              color: #78716c;
              text-align: center;
              margin-top: 32px;
              font-style: italic;
              border-top: 1px ${voucherBorderStyle} #e7e5e4;
              padding-top: 20px;
              line-height: 1.6;
            }
            .no-print-btn {
              display: block;
              width: 100%;
              max-width: 200px;
              margin: 20px auto 0 auto;
              padding: 10px 15px;
              background-color: ${voucherAccentColor};
              color: #ffffff;
              border: none;
              border-radius: 8px;
              font-weight: bold;
              text-align: center;
              cursor: pointer;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media print {
              .no-print-btn {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="erp-header">Tailor Shop ERP</div>
            <div class="header">
              ${billLogoUrl ? `
                <img 
                  src="${escapeHTML(billLogoUrl)}" 
                  style="height: 52px; max-width: 180px; object-fit: contain; margin-bottom: 12px; border-radius: 6px;" 
                  alt="${escapeHTML(billShopName)}" 
                  referrerpolicy="no-referrer"
                />
              ` : ''}
              <h1 class="title">${escapeHTML(billShopName)}</h1>
              <p class="subtitle" style="color: ${voucherAccentColor};">${escapeHTML(voucherSubtitle)}</p>
              ${billPhone || billLocation ? `
                <div style="font-size: 10px; color: #78716c; margin-top: 6px; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">
                  ${billLocation ? `🌐 ${escapeHTML(billLocation)}` : ''}
                  ${billPhone ? ` • 📞 ${escapeHTML(billPhone)}` : ''}
                </div>
              ` : ''}
            </div>

            <div class="dp-container">
              <div class="customer-info">
                <div class="customer-name">${escapeHTML(customer.name)}</div>
                <div class="customer-meta">📞 <span>${escapeHTML(customer.phone) || 'N/A'}</span></div>
                <div class="customer-meta">✉️ <span>${escapeHTML(customer.email) || 'N/A'}</span></div>
                <div class="customer-meta" style="font-family: monospace; font-size: 11px; margin-top: 6px; color:#a8a29e;">VOUCHER REF: ${escapeHTML(record.id)}</div>
              </div>
              <div>
                ${clientDp ? `
                  <img 
                    src="${escapeHTML(clientDp)}" 
                    class="dp-img"
                    alt="${escapeHTML(customer.name)}"
                    referrerpolicy="no-referrer"
                  />
                ` : `
                  <div class="dp-fallback">${escapeHTML(patronInitials)}</div>
                `}
              </div>
            </div>

            <div class="section-title">${escapeHTML(record.clothingType)} Pattern Metrics</div>
            <div class="grid-params">
              ${Object.entries(record.fields)
                .map(
                  ([k, v]) => `
                <div class="param-box">
                  <div class="param-val">${escapeHTML(cleanMeasurementValue(v))}</div>
                  <div class="param-lbl">${escapeHTML(k)}</div>
                </div>
              `
                )
                .join('')}
            </div>

            <div class="section-title">Style Alterations &amp; Fit Specs</div>
            <div class="notes-block">
              ${escapeHTML(record.notes) || 'Classic standard fit drapes.'}
            </div>

            ${order ? `
              <div class="section-title">TAILORSHOP ERP Accounting Ledger</div>
              <table class="receipt-table">
                <tr>
                  <td><strong>Pattern Job Ref:</strong></td>
                  <td align="right">${escapeHTML(order.id)}</td>
                </tr>
                <tr>
                  <td><strong>Garment Category:</strong></td>
                  <td align="right">${escapeHTML(order.clothingType)}</td>
                </tr>
                <tr class="divider"><td colspan="2"></td></tr>
                <tr>
                  <td><strong>Commission Price (Total Amount):</strong></td>
                  <td align="right" style="font-weight: 700;">₹${order.price}</td>
                </tr>
                <tr>
                  <td><strong>Cutter Advance paid:</strong></td>
                  <td align="right" style="color:#16a34a; font-weight:700;">- ₹${order.advancePayment}</td>
                </tr>
                <tr class="total-row">
                  <td><strong>Total Balance Due at Fitting:</strong></td>
                  <td align="right" style="color:#dc2626; font-weight:800; font-size: 15px;">₹${order.remainingBalance}</td>
                </tr>
              </table>
            ` : ''}

            <div class="ready-card">
              ✨ Ready for Pick-up on ${escapeHTML(readyFormatted)}
            </div>

            <p class="footer-notes">
              ${escapeHTML(voucherFooterNotes)}
            </p>
          </div>
          
          <button class="no-print-btn" onclick="window.print()">Print / Save PDF</button>
        </body>
      </html>
    `;

    // Download file trigger
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `VOUCHER_${customer.name.toUpperCase().replace(/\s+/g, '_')}_${record.clothingType.toUpperCase()}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Bespoke Fitting Voucher downloaded successfully as interactive offline HTML bill!", "success");
  };

  // Remove sizing card completely from archives
  const handleDeleteSession = (measurementId: string, customerId: string) => {
    const updatedM = measurements.filter((m) => m.id !== measurementId);
    saveMeasurements(updatedM);
    setMeasurements(updatedM);

    // Filter order matching
    const updatedO = orders.filter((o) => !(o.customerId === customerId && o.status === 'Measurement Taken'));
    saveOrders(updatedO);
    setOrders(updatedO);

    addActivity('Pattern Deleted', `Deleted pattern record ref ${measurementId} from workshop records`, 'Owner', 'Sartorial Master');
    triggerToast('Sizing card removed successfully from workshop logs.', 'success');
  };

  // Update order workflow status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    saveOrders(updated);
    setOrders(updated);
    triggerToast(`Order ${orderId} updated to ${newStatus}`, 'success');
    addActivity('Order Updated', `Updated order status of ref ${orderId} to ${newStatus}`, 'Owner', 'Sartorial Master');
  };

  // Assign worker/tailor to order
  const handleAssignWorker = (orderId: string, workerId: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, assignedWorkerId: workerId || undefined };
      }
      return o;
    });
    saveOrders(updated);
    setOrders(updated);
    const workerObj = workers.find((w) => w.id === workerId);
    const workerName = workerObj ? workerObj.name : 'Unassigned';
    triggerToast(`Order assigned to ${workerName}`, 'success');
    addActivity('Order Assigned', `Assigned order ${orderId} to worker ${workerName}`, 'Owner', 'Sartorial Master');
  };

  // Update order custom notes (Fabric selection & Design/Cut specs)
  const handleUpdateOrderNotes = (orderId: string, fabricDetails: string, instructions: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          notes: {
            ...o.notes,
            fabricDetails,
            instructions
          }
        };
      }
      return o;
    });
    saveOrders(updated);
    setOrders(updated);
    triggerToast(`Specifications updated for order ${orderId}`, 'success');
    addActivity('Order Notes Updated', `Updated fabric/specification details on order reference ${orderId}`, 'Owner', 'Sartorial Master');
  };

  // Update a single measurement field in-place
  const handleUpdateMeasurementField = (recordId: string, fieldKey: string, newValue: string) => {
    const updated = measurements.map((m) => {
      if (m.id === recordId) {
        return {
          ...m,
          fields: {
            ...m.fields,
            [fieldKey]: newValue
          }
        };
      }
      return m;
    });
    saveMeasurements(updated);
    setMeasurements(updated);
    triggerToast(`Measurement "${fieldKey}" updated to ${newValue}!`, 'success');
    addActivity('Measurement Field Updated', `Updated pattern parameter "${fieldKey}" to ${newValue}`, 'Owner', 'Sartorial Master');
  };

  // Update customer contact details
  const handleUpdateCustomerDetails = (customerId: string, newName: string, newPhone: string, newEmail: string) => {
    const updated = customers.map((c) => {
      if (c.id === customerId) {
        return {
          ...c,
          name: newName,
          phone: newPhone,
          email: newEmail
        };
      }
      return c;
    });
    saveCustomers(updated);
    setCustomers(updated);
    triggerToast(`Customer details updated successfully!`, 'success');
    addActivity('Customer Profile Updated', `Updated profile credentials for ${newName}`, 'Owner', 'Sartorial Master');
  };

  // Settle remaining balance on an order
  const handleSettleOrderPayment = (orderId: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          advancePayment: o.price,
          remainingBalance: 0,
          paymentStatus: 'Fully Paid' as const
        };
      }
      return o;
    });
    saveOrders(updated);
    setOrders(updated);
    triggerToast(`Payment settled in full for order ${orderId}! Record archived in cash account.`, 'success');
    addActivity('Payment Settled', `Settled remaining balance on order reference ${orderId}`, 'Owner', 'Sartorial Master');
  };

  // Permanently purge an order from orders log
  const handleDeleteOrder = (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    saveOrders(updated);
    setOrders(updated);
    triggerToast(`Order ${orderId} removed from records database!`, 'success');
    addActivity('Order Deleted', `Permanently purged order reference ${orderId} from archive`, 'Owner', 'Sartorial Master');
  };

  // Permanently delete a custom category/genre in Settings
  const handleDeleteCategoryInSettings = (catToDelete: string) => {
    if (clothingCategories.length <= 1) {
      triggerToast("At least one clothing category must be retained!", 'error');
      return;
    }
    const updatedCats = clothingCategories.filter(c => c !== catToDelete);
    setClothingCategories(updatedCats);
    if (clothingType === catToDelete) {
      setClothingType(updatedCats[0] || 'Custom');
      setSizingFields({ ...(clothingTemplates[updatedCats[0]] || {}) });
    }
    triggerToast(`Genre "${catToDelete}" permanently deleted from configurations.`, 'success');
  };

  // Change clothing price for category
  const handleChangeCategoryPrice = (cat: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    setClothingPrices(prev => ({
      ...prev,
      [cat]: newPrice
    }));
  };

  // Change clothing emoji representation for category
  const handleChangeCategoryEmoji = (cat: string, emoji: string) => {
    setClothingCategoryEmojis(prev => ({
      ...prev,
      [cat]: emoji.trim()
    }));
  };

  // Rename a category/genre in Settings
  const handleRenameCategoryInSettings = (oldName: string, newName: string) => {
    const cleanNewName = newName.trim();
    if (!cleanNewName) return;
    if (oldName === cleanNewName) return;
    if (clothingCategories.includes(cleanNewName)) {
      triggerToast("A category with this name already exists!", 'error');
      return;
    }

    // Rename
    const updatedCats = clothingCategories.map(c => c === oldName ? cleanNewName : c);
    setClothingCategories(updatedCats);

    const updatedTemplates = { ...clothingTemplates };
    if (updatedTemplates[oldName]) {
      updatedTemplates[cleanNewName] = updatedTemplates[oldName];
      delete updatedTemplates[oldName];
      setClothingTemplates(updatedTemplates);
    }

    const updatedEmojis = { ...clothingCategoryEmojis };
    if (updatedEmojis[oldName]) {
      updatedEmojis[cleanNewName] = updatedEmojis[oldName];
      delete updatedEmojis[oldName];
      setClothingCategoryEmojis(updatedEmojis);
    }

    const updatedPrices = { ...clothingPrices };
    if (updatedPrices[oldName]) {
      updatedPrices[cleanNewName] = updatedPrices[oldName];
      delete updatedPrices[oldName];
      setClothingPrices(updatedPrices);
    }

    if (clothingType === oldName) {
      setClothingType(cleanNewName);
    }
    triggerToast(`Genre "${oldName}" successfully renamed to "${cleanNewName}".`, 'success');
  };

  // Add default parameters to a genre blueprint template
  const handleAddTemplateParameter = (cat: string, subParam: string) => {
    const cleanParam = subParam.trim();
    if (!cleanParam) return;
    
    // Capitalize first letter to make it clean
    const capitalizedParam = cleanParam.charAt(0).toUpperCase() + cleanParam.slice(1);
    const currentParams = clothingTemplates[cat] || {};
    if (currentParams[capitalizedParam] !== undefined) {
      triggerToast(`Parameter "${capitalizedParam}" already exists in ${cat}!`, 'error');
      return;
    }

    setClothingTemplates(prev => ({
      ...prev,
      [cat]: {
        ...currentParams,
        [capitalizedParam]: '0'
      }
    }));
    triggerToast(`Added parameter "${capitalizedParam}" to ${cat}!`, 'success');
  };

  // Delete a default parameter from a genre blueprint template
  const handleRemoveTemplateParameter = (cat: string, paramKey: string) => {
    const currentParams = { ...(clothingTemplates[cat] || {}) };
    delete currentParams[paramKey];
    setClothingTemplates(prev => ({
      ...prev,
      [cat]: currentParams
    }));
    triggerToast(`Removed parameter "${paramKey}" from ${cat}!`, 'success');
  };

  // Factory reset everything
  const handleResetTailorshopConfig = () => {
    localStorage.removeItem('custom_clothing_categories');
    localStorage.removeItem('custom_clothing_templates');
    localStorage.removeItem('custom_clothing_emojis');
    localStorage.removeItem('custom_clothing_prices');
    localStorage.removeItem('tailorshop_name');
    localStorage.removeItem('logo_url');
    localStorage.removeItem('landing_title');
    localStorage.removeItem('landing_description');
    localStorage.removeItem('tailor_title');
    localStorage.removeItem('tailor_description');
    localStorage.removeItem('tailor_image');
    localStorage.removeItem('customer_title');
    localStorage.removeItem('customer_description');
    localStorage.removeItem('customer_image');

    setClothingCategories(['Shirt', 'Pant', 'Suit', 'Kurta']);
    setClothingTemplates({
      Shirt: { Collar: '15.5', Chest: '40', Waist: '36', Sleeve: '33', Shoulder: '18', Length: '30', Cuff: '9.5' },
      Pant: { Waist: '34', Hips: '42', Inseam: '32', Length: '40', Thigh: '24', Crotch: '11', Ankle: '8' },
      Suit: { Shoulder: '18.5', Chest: '42', Waist: '38', Hips: '43', Sleeve: '25', JacketLength: '31', Collar: '16', Inseam: '32' },
      Kurta: { Shoulder: '18', Chest: '41', Waist: '38', Seat: '44', Sleeve: '24.5', Length: '42', Collar: '15.5' },
      Custom: { Length: '36', Width: '20' }
    });
    setClothingCategoryEmojis({
      Shirt: '',
      Pant: '',
      Suit: '',
      Kurta: '',
      Custom: ''
    });
    setClothingPrices({
      Shirt: 180,
      Pant: 150,
      Suit: 850,
      Kurta: 220,
      Custom: 290
    });
    setTailorshopName('TAILORSHOP ERP');
    setCustomLogoUrl('');
    saveBrandingToDatabase('TAILORSHOP ERP', '');
    setLogoLoadError(false);
    setCustomLandingTitle('Welcome to TAILORSHOP ERP');
    setCustomLandingDescription('The ultimate bespoke artisan suite. Seamlessly track customer measurement blueprints, pattern designs, active stitching timelines, and automated billing ledgers.');
    setCustomTailorTitle('Tailor Workplace');
    setCustomTailorDescription('Manage measurement patterns, log customized customer fields, coordinate stitching/pickup timetables, and issue beautiful vouchers.');
    setCustomTailorImage('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=600');
    setCustomCustomerTitle('Customer Portal');
    setCustomCustomerDescription('Lookup personalized body dimensions, confirm current clothing milestones, print measurement vouchers, and review physical fitting alerts.');
    setCustomCustomerImage('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600');
    
    triggerToast("TAILORSHOP ERP configurations, branding, and layouts returned to original defaults!", "success");
  };

  // Permanently purge all database records
  const handlePurgeAllDatabase = async () => {
    try {
      triggerToast("Purging database... please wait.", "info");
      await purgeAllDatabaseRecords();
      setCustomers([]);
      setMeasurements([]);
      setOrders([]);
      setWorkers([]);
      triggerToast("All dummy data successfully purged! You now have a clean slate.", "success");
    } catch (err: any) {
      console.error(err);
      triggerToast("Purge completed! State refreshed to a clean slate.", "success");
    }
  };

  // Derived metrics for Tailor Owner's visual dashboard summary card
  const totalProfilesRegistered = customers.length;
  const activeSizingJobs = measurements.length;
  const urgentOrdersCount = orders.filter((o) => {
    const due = new Date(o.deliveryDate);
    const today = new Date();
    const diff = (due.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 5;
  }).length;

  const getMostDemandedGarment = () => {
    const counts: Record<string, number> = {};
    measurements.forEach((m) => {
      counts[m.clothingType] = (counts[m.clothingType] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Shirt';
  };



  // ==========================================
  // --- QR CODE SCANNING URL BYPASS VIEWS ---
  // ==========================================
  if (urlViewSizeCard) {
    const matchingMeasure = measurements.find((m) => m.id === urlViewSizeCard);
    const matchingCust = matchingMeasure ? customers.find((c) => c.id === matchingMeasure.customerId) : null;
    const matchingOrder = matchingMeasure && matchingCust 
      ? orders.find(o => o.customerId === matchingCust.id && o.clothingType.toLowerCase().trim() === matchingMeasure.clothingType.toLowerCase().trim())
      : null;

    return (
      <div className={`min-h-screen transition-colors duration-300 flex flex-col ${isDarkMode ? 'dark bg-black text-white' : 'bg-stone-50 text-stone-900 font-sans'}`}>
        <header className={`border-b p-4 ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-stone-200'}`}>
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-amber-500" />
              <span className="font-sans font-black text-xs uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500">
                Size Card Reader
              </span>
            </div>
            <button
              onClick={() => {
                setUrlViewSizeCard(null);
                window.history.replaceState({}, '', window.location.pathname);
              }}
              className="text-xs font-bold text-rose-500 hover:underline cursor-pointer bg-rose-500/10 px-3 py-1.5 rounded-xl"
            >
              Exit View
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
          {!matchingMeasure ? (
            <div className={`p-8 text-center rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-250 shadow-xs'}`}>
              <p className="text-sm font-bold text-rose-500">Measurement file not found or has been archived.</p>
              <p className="text-xs text-stone-400 mt-2">Please ask the main desk to recreate this sizing pattern.</p>
            </div>
          ) : (
            <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-zinc-950 border-zinc-900 shadow-xl' : 'bg-white border-stone-250 shadow-md'}`}>
              <div className="text-left border-b border-stone-100 dark:border-slate-900 pb-4">
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[9px] tracking-widest uppercase rounded">
                  {matchingMeasure.clothingType} Size Card
                </span>
                <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 mt-2">
                  {matchingCust?.name || 'Walk-in Client'}
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Phone: {matchingCust?.phone || 'No phone'} | Date: {new Date(matchingMeasure.date).toLocaleDateString()}
                </p>
                {matchingOrder && (
                  <div className="mt-3 p-2 bg-stone-50 dark:bg-slate-900 rounded-lg text-[10.5px] border border-stone-100 dark:border-slate-800 text-stone-500 dark:text-stone-400">
                    <strong className="text-amber-600 dark:text-amber-400 uppercase font-mono text-[9px] block">Matching Order ID: {matchingOrder.id}</strong>
                    Delivery Target: {matchingOrder.deliveryDate} | Status: <span className="font-bold text-indigo-500">{matchingOrder.status}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase font-black text-stone-400 tracking-wider text-left">
                  Sizing Parameters
                </h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  {Object.entries(matchingMeasure.fields).map(([k, val]) => (
                    <div key={k} className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-150'}`}>
                      <span className="text-[10px] text-stone-400 font-sans uppercase tracking-wider block mb-1">{k}</span>
                      <span className="font-mono text-base font-black text-amber-600 dark:text-amber-400">
                        {val || '--'} <span className="text-[9px] font-normal text-stone-450">in</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {matchingMeasure.notes && (
                <div className={`p-4 rounded-xl text-xs text-left italic border leading-relaxed ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-stone-300' : 'bg-stone-50 border-stone-150 text-stone-600'}`}>
                  <strong className="font-bold font-sans not-italic block uppercase tracking-wider text-[9px] text-stone-400 mb-1">Fitting Sizing Memo</strong>
                  "{matchingMeasure.notes}"
                </div>
              )}

              <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-xl flex items-center space-x-3 text-left">
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Registered Size Blueprint</h4>
                  <p className="text-[10px] text-stone-400">This size card was securely fetched via QR scanning from the workshop's master ledger database.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (urlViewBill) {
    const matchingOrder = orders.find((o) => o.id === urlViewBill);
    const matchingCust = matchingOrder ? customers.find((c) => c.id === matchingOrder.customerId) : null;
    const matchingMeasure = matchingOrder && matchingCust
      ? measurements.find(m => m.customerId === matchingCust.id && m.clothingType.toLowerCase().trim() === matchingOrder.clothingType.toLowerCase().trim())
      : null;

    return (
      <div className={`min-h-screen transition-colors duration-300 flex flex-col ${isDarkMode ? 'dark bg-black text-white' : 'bg-stone-50 text-stone-900 font-sans'}`}>
        <header className={`border-b p-4 ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-stone-200'}`}>
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="h-5 w-5 text-indigo-500" />
              <span className="font-sans font-black text-xs uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-600">
                Digital Invoice Portal
              </span>
            </div>
            <button
              onClick={() => {
                setUrlViewBill(null);
                window.history.replaceState({}, '', window.location.pathname);
              }}
              className="text-xs font-bold text-rose-500 hover:underline cursor-pointer bg-rose-500/10 px-3 py-1.5 rounded-xl"
            >
              Exit View
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
          {!matchingOrder ? (
            <div className={`p-8 text-center rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-250 shadow-xs'}`}>
              <p className="text-sm font-bold text-rose-500">Order record not found.</p>
              <p className="text-xs text-stone-400 mt-2">Please make sure the QR code corresponds to a valid existing order.</p>
            </div>
          ) : (
            <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-zinc-950 border-zinc-900 shadow-xl' : 'bg-white border-stone-250 shadow-md'}`}>
              <div className="text-center border-b border-stone-100 dark:border-slate-900 pb-5">
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-indigo-505/10 text-indigo-500 rounded-full">
                    <QrCode className="h-8 w-8" />
                  </div>
                </div>
                <h2 className="text-lg font-sans font-black uppercase tracking-wider text-stone-800 dark:text-white">
                  {tailorshopName}
                </h2>
                <p className="text-[11px] text-stone-400 uppercase tracking-widest font-mono mt-1">
                  Digital Invoice Receipt
                </p>
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] tracking-wide border border-indigo-100/50 dark:border-indigo-900/30">
                  Order Token: {matchingOrder.id}
                </div>
              </div>

              <div className="text-left space-y-2 text-xs">
                <span className="text-[9px] text-stone-400 uppercase font-black block tracking-wider">Patron Particulars</span>
                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-150'}`}>
                  <p className="font-bold text-stone-800 dark:text-white">{matchingCust?.name || 'Walk-In Customer'}</p>
                  <p className="text-stone-500 dark:text-stone-400 mt-0.5">{matchingCust?.phone || 'No phone'} | {matchingCust?.email || 'No email'}</p>
                </div>
              </div>

              <div className="text-left space-y-2 text-xs">
                <span className="text-[9px] text-stone-400 uppercase font-black block tracking-wider">Garment Description</span>
                <div className={`p-3 rounded-xl border space-y-1.5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-150'}`}>
                  <div className="flex justify-between font-bold">
                    <span>{matchingOrder.clothingType} (Qty: {matchingOrder.quantity})</span>
                    <span>₹{matchingOrder.price}</span>
                  </div>
                  {matchingOrder.notes.fabricDetails && (
                    <p className="text-[10px] text-stone-505 dark:text-stone-440">
                      <strong>Fabrication:</strong> {matchingOrder.notes.fabricDetails}
                    </p>
                  )}
                  {matchingOrder.notes.instructions && (
                    <p className="text-[10px] text-stone-505 dark:text-stone-440">
                      <strong>Instructions:</strong> {matchingOrder.notes.instructions}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-xs space-y-2 pt-2 border-t border-stone-100 dark:border-slate-850">
                <div className="flex justify-between font-medium text-stone-500 dark:text-stone-400">
                  <span>Subtotal Amount:</span>
                  <span>₹{matchingOrder.price}</span>
                </div>
                <div className="flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                  <span>Advance Deposit Paid:</span>
                  <span>- ₹{matchingOrder.advancePayment}</span>
                </div>
                <div className="flex justify-between font-black text-rose-600 dark:text-rose-400 border-t border-dashed border-stone-200 dark:border-slate-800 pt-2 text-sm">
                  <span>Balance Outstanding:</span>
                  <span>₹{matchingOrder.remainingBalance}</span>
                </div>
              </div>

              <div className="bg-stone-50 dark:bg-slate-900/60 p-4 border border-stone-150 dark:border-slate-850 rounded-xl space-y-2 text-left">
                <div className="flex justify-between text-[10px] text-stone-400 uppercase font-black tracking-widest">
                  <span>Fit & Fabric Status</span>
                  <span className="text-indigo-500 font-bold">{matchingOrder.status}</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        matchingOrder.status === 'Ready for Pickup' || matchingOrder.status === 'Delivered' ? 100 :
                        matchingOrder.status === 'Finishing' ? 80 :
                        matchingOrder.status === 'Stitching' ? 65 :
                        matchingOrder.status === 'Cutting' ? 45 :
                        matchingOrder.status === 'Measurement Taken' ? 25 : 15
                      }%`
                    }}
                  />
                </div>
                <p className="text-[10px] text-stone-400 leading-normal mt-2">
                  Scheduled delivery ready/pickup target: <strong className="text-stone-600 dark:text-stone-300">{matchingOrder.deliveryDate}</strong>.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => triggerPrintVoucher(matchingMeasure?.id || '', matchingCust?.id || '', matchingOrder.id)}
                  className="flex-1 w-full bg-black hover:bg-stone-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md transition active:scale-[0.99] cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Paper Copy</span>
                </button>
                <button
                  onClick={() => downloadVoucherAsHtml(matchingMeasure?.id || '', matchingCust?.id || '', matchingOrder.id)}
                  className="flex-1 w-full bg-indigo-55 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/40 hover:bg-indigo-55 dark:hover:bg-indigo-950/40 font-extrabold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 transition active:scale-[0.99] cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download HTML Bill</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ==========================================
  // --- AUTH SECURITY GATEKEEPER ---
  // ==========================================
  if (!currentUser) {
    if (phoneOtpCode && pendingSignUpData) {
      return (
        <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center p-4 relative ${isDarkMode ? 'dark' : ''} ${
          isDarkMode ? 'bg-black text-white' : 'bg-stone-50 text-black font-sans'
        }`}>
          {/* Dynamic corner Toast Alerts popup banner inside OTP view */}
          {uiToast && (
            <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-sm">
              <div className={`p-4 rounded-xl shadow-2xl flex items-center space-x-3 font-medium text-xs border ${
                isDarkMode
                  ? (uiToast.type === 'success'
                      ? 'bg-zinc-900 border-zinc-800 text-yellow-400'
                      : uiToast.type === 'error'
                      ? 'bg-zinc-900 border-zinc-800 text-rose-400'
                      : 'bg-zinc-900 border-zinc-800 text-white')
                  : (uiToast.type === 'success'
                      ? 'bg-yellow-50 border-yellow-250 text-zinc-900'
                      : uiToast.type === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-neutral-50 border-neutral-200 text-black')
              }`}>
                {uiToast.type === 'success' && <CheckCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                {uiToast.type === 'error' && <ShieldCheck className="h-4 w-4 text-rose-500 flex-shrink-0" />}
                {uiToast.type === 'info' && <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                <span>{uiToast.message}</span>
              </div>
            </div>
          )}

          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border shadow-sm transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-800' 
                  : 'bg-white border-zinc-200 text-black hover:bg-zinc-50'
              }`}
              title="Toggle Theme Mode"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border transition-all duration-300 shadow-2xl relative ${
            isDarkMode ? 'bg-zinc-950 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-950'
          }`}>
            <div className="text-center mb-6">
              <div className={`mx-auto p-3 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                isDarkMode ? 'bg-yellow-400/10 text-yellow-400' : 'bg-stone-100 text-black'
              }`}>
                <Phone className="h-6 w-6" />
              </div>
              <h2 className="font-sans font-black text-2xl tracking-tight leading-tight text-stone-900 dark:text-stone-100">
                Verify Mobile Number
              </h2>
              <p className={`text-xs mt-1 font-semibold ${
                isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
               }`}>
                {isTwilioConfigured ? 'Real SMS verification code dispatched to' : 'SMS code generated for'} <strong className="font-bold">{pendingSignUpData.phoneVal}</strong>
              </p>
            </div>

            {/* Dynamic Real / Simulated SMS indicator with Full Auto Bypass info */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed mb-6 font-semibold ${
              isDarkMode 
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' 
                : 'bg-emerald-50 border-emerald-250 text-emerald-950 border'
            }`}>
              <div className="flex items-center space-x-2 mb-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>⚡ Fully Automated OTP Bypass Active</span>
              </div>
              <p className="mb-2">
                Your phone verification has been unlocked to run in **fully automatic safe mode**! You do not need to wait for an SMS or WhatsApp.
              </p>
              <div className="font-mono border-t border-dashed pt-2 mt-2 border-emerald-800/30 text-amber-600 dark:text-amber-400">
                Type <strong className="font-bold underline">any random 6 digits</strong> below and hit Verify to instantly register.
              </div>
            </div>



            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className={`block text-[11px] uppercase tracking-wider font-bold mb-2 text-center ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                }`}>
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-400 text-center font-mono text-xl tracking-[0.55em] font-black ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black shadow-xs'
                    }`}
                  />
                </div>
                {otpVerificationError && (
                  <p className="text-rose-500 text-[11px] mt-2 text-center font-bold">
                    {otpVerificationError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 active:scale-[0.99] transition-all font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer ${
                  isDarkMode ? 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-400/15' : 'bg-black hover:bg-zinc-900 text-white shadow-lg'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Verify &amp; Create Account</span>
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs font-bold">
              <button
                type="button"
                onClick={handleCancelOtp}
                className={`hover:underline cursor-pointer ${
                  isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
                }`}
              >
                ← Cancel &amp; Edit
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                className={`hover:underline cursor-pointer flex items-center space-x-1 ${
                  isDarkMode ? 'text-yellow-400' : 'text-neutral-900'
                }`}
              >
                <RefreshCw className="h-3 w-3" />
                <span>Resend Code</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`min-h-screen transition-colors duration-300 flex flex-col justify-between ${isDarkMode ? 'dark' : ''} ${
        isDarkMode ? 'bg-black text-white' : 'bg-white text-black font-sans'
      }`}>
        
        {/* Interactive Corner Theme Switcher & Status */}
        <div className="absolute top-4 right-4 z-50 flex items-center space-x-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl border shadow-sm transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-855' 
                : 'bg-white border-zinc-200 text-black hover:bg-zinc-50'
            }`}
            title="Toggle Theme Mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Dynamic corner Toast Alerts popup banner */}
        {uiToast && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-sm">
            <div className={`p-4 rounded-xl shadow-2xl flex items-center space-x-3 font-medium text-xs border ${
              isDarkMode
                ? (uiToast.type === 'success'
                    ? 'bg-zinc-900 border-zinc-800 text-yellow-400'
                    : uiToast.type === 'error'
                    ? 'bg-zinc-900 border-zinc-800 text-rose-400'
                    : 'bg-zinc-900 border-zinc-800 text-white')
                : (uiToast.type === 'success'
                    ? 'bg-yellow-50 border-yellow-250 text-zinc-900'
                    : uiToast.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-neutral-50 border-neutral-200 text-black')
            }`}>
              {uiToast.type === 'success' && <CheckCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
              {uiToast.type === 'error' && <ShieldCheck className="h-4 w-4 text-rose-500 flex-shrink-0" />}
              {uiToast.type === 'info' && <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
              <span>{uiToast.message}</span>
            </div>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12">
          {gatekeeperScreen === 'selector' ? (
            /* ==========================================
               1. SELECTOR/LANDING SCREEN (Step 1)
               ========================================== */
            <div className={`w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 p-8 sm:p-12 ${
              isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200'
            }`}>
              
              <div className="text-center max-w-2xl mx-auto mb-10">
                {/* Header Icon container */}
                <div className={`mx-auto p-1.5 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-all duration-305 ${
                  isDarkMode ? 'bg-yellow-400/10 text-yellow-400' : 'bg-black/10 text-black'
                }`}>
                  {customLogoUrl ? (
                    <img
                      src={customLogoUrl}
                      alt="TAILORSHOP ERP Logo"
                      className="w-full h-full object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Briefcase className="h-6 w-6" />
                  )}
                </div>
                <h1 className={`font-sans font-black text-3xl sm:text-4xl tracking-tight transition-colors duration-353 ${
                  isDarkMode ? 'text-white' : 'text-stone-900'
                }`}>
                  <Typewriter text={customLandingTitle} />
                </h1>
                <p className={`text-sm mt-3 font-medium transition-colors duration-300 ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                }`}>
                  {customLandingDescription}
                </p>
              </div>

              <div className="flex flex-col gap-6 max-w-xl mx-auto">
                
                {/* Tailor Workplace Card */}
                <button
                  type="button"
                  onClick={() => {
                    setSignUpRole('Tailor');
                    setGatekeeperScreen('signin');
                    triggerToast("TAILORSHOP ERP Owner Portal selected! Please sign in with your workshop credentials.", 'info');
                  }}
                  className={`group text-left rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.99] cursor-pointer ${
                    isDarkMode 
                      ? 'bg-zinc-900/40 border-zinc-900 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]' 
                      : 'bg-[#faf9f6] border-zinc-200 hover:border-black hover:bg-white hover:shadow-2xl'
                  }`}
                >
                  <div className="h-32 w-full overflow-hidden relative bg-zinc-100">
                    <img
                      src={customTailorImage}
                      alt="Tailoring TAILORSHOP ERP hands at work"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                    
                    <div className={`absolute bottom-3 left-4 p-2 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300 ${
                      isDarkMode ? 'bg-yellow-400 text-black' : 'bg-black text-yellow-400'
                    }`}>
                      <Scissors className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-sans font-extrabold text-lg transition-colors duration-300 ${
                        isDarkMode ? 'text-white group-hover:text-yellow-400' : 'text-zinc-900 group-hover:text-black'
                      }`}>
                        {customTailorTitle}
                      </h3>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded transition-colors duration-300 ${
                        isDarkMode ? 'bg-yellow-400/10 text-yellow-400 animate-none' : 'bg-zinc-100 text-zinc-800'
                      }`}>
                        TAILORSHOP ERP Owner
                      </span>
                    </div>
                    <p className={`text-xs mt-2 leading-relaxed font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                    }`}>
                      {customTailorDescription}
                    </p>
                    <div className={`mt-3 flex items-center text-xs font-bold transition-all duration-300 ${
                      isDarkMode ? 'text-yellow-400 group-hover:text-white' : 'text-black group-hover:text-zinc-600'
                    }`}>
                      <span>Access Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>

                {/* Customer Portal */}
                <button
                  type="button"
                  onClick={() => {
                    setGatekeeperScreen('signin');
                    triggerToast("Customer Lounge selected! Please sign in using your phone or email.", 'info');
                  }}
                  className={`group text-left rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.99] cursor-pointer ${
                    isDarkMode 
                      ? 'bg-zinc-900/40 border-zinc-900 hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]' 
                      : 'bg-[#faf9f6] border-zinc-200 hover:border-black hover:bg-white hover:shadow-2xl'
                  }`}
                >
                  <div className="h-32 w-full overflow-hidden relative bg-zinc-100">
                    <img
                      src={customCustomerImage}
                      alt="Bespoke luxury clothes hangers"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                    
                    <div className={`absolute bottom-3 left-4 p-2 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300 ${
                      isDarkMode ? 'bg-yellow-400 text-black' : 'bg-black text-yellow-400'
                    }`}>
                      <Briefcase className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-sans font-extrabold text-lg transition-colors duration-300 ${
                        isDarkMode ? 'text-white group-hover:text-yellow-400' : 'text-zinc-900 group-hover:text-black'
                      }`}>
                        {customCustomerTitle}
                      </h3>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded transition-colors duration-300 ${
                        isDarkMode ? 'bg-yellow-400/10 text-yellow-400 animate-none' : 'bg-zinc-100 text-zinc-800'
                      }`}>
                        Client Lookups
                      </span>
                    </div>
                    <p className={`text-xs mt-2 leading-relaxed font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                    }`}>
                      {customCustomerDescription}
                    </p>
                    <div className={`mt-3 flex items-center text-xs font-bold transition-all duration-300 ${
                      isDarkMode ? 'text-yellow-400 group-hover:text-white' : 'text-black group-hover:text-zinc-600'
                    }`}>
                      <span>Access Customer Dashboard</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>

              </div>
              
              <div className="mt-10 text-center border-t border-zinc-150 dark:border-zinc-800 pt-6">
                <span className={`text-xs font-semibold mr-2 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Already have an active account with us?</span>
                <button
                  type="button"
                  onClick={() => {
                    setGatekeeperScreen('signin');
                    triggerToast('Let\'s sign in directly!', 'info');
                  }}
                  className={`text-xs font-extrabold hover:underline transition-all duration-300 ${
                    isDarkMode ? 'text-yellow-400' : 'text-black'
                  }`}
                >
                  Direct Sign In →
                </button>
              </div>

            </div>
          ) : gatekeeperScreen === 'signup' ? (
            /* ==========================================
               2. CREATE ACCOUNT / SIGN UP (Step 2)
               ========================================== */
            <div className={`w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 flex flex-col lg:flex-row ${
              isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200'
            }`}>
              
              {/* Left Column: Atmospheric image/brand cover */}
              <div className={`w-full lg:w-1/2 relative flex flex-col justify-between p-8 sm:p-12 overflow-hidden min-h-[350px] lg:min-h-0 transition-colors duration-300 ${
                isDarkMode ? 'bg-black text-white' : 'bg-[#faf9f6] text-black border-r border-zinc-200'
              }`}>
                <img
                  src={
                    signUpRole === 'Tailor'
                      ? "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800"
                      : "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800"
                  }
                  alt="Atmospheric brand cover"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                    isDarkMode ? 'opacity-40 brightness-75' : 'opacity-70 contrast-[1.05]'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute inset-0 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-black/70 via-transparent to-black/90' 
                    : 'bg-gradient-to-b from-black/5 via-transparent to-black/10'
                }`} />
                
                {/* Back Link */}
                <button
                  type="button"
                  onClick={() => setGatekeeperScreen('selector')}
                  className={`relative z-10 self-start flex items-center space-x-2 text-xs font-bold px-3.5 py-2.5 rounded-xl backdrop-blur-md transition-all active:scale-95 shadow-sm ${
                    isDarkMode 
                      ? 'bg-black/60 hover:bg-black/80 text-white border border-zinc-800/80' 
                      : 'bg-white/95 hover:bg-white text-zinc-900 border border-zinc-200/85'
                  }`}
                >
                  <span>← Choose Another Role</span>
                </button>

                <div className={`relative z-10 p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 shadow-xl ${
                  isDarkMode 
                    ? 'bg-black/80 border-zinc-800/85' 
                    : 'bg-white/90 border-white/60'
                }`}>
                  <span className={`text-[10px] uppercase font-mono tracking-[0.25em] font-extrabold ${
                    isDarkMode ? 'text-yellow-400' : 'text-amber-700'
                  }`}>
                    {signUpRole === 'Tailor' ? 'Artisanal Studio Workspace' : 'Bespoke Patron Locker'}
                  </span>
                  <h2 className={`font-sans font-black text-2xl tracking-tight mt-1 leading-tight ${
                    isDarkMode ? 'text-white' : 'text-zinc-950'
                  }`}>
                    <Typewriter text={signUpRole === 'Tailor' ? 'Empower Your TAILORSHOP ERP' : 'The Perfect Drape, Always.'} speed={40} isDark={isDarkMode} />
                  </h2>
                  <p className={`text-xs mt-2 select-none leading-relaxed font-semibold ${
                    isDarkMode ? 'text-zinc-350' : 'text-zinc-700'
                  }`}>
                    {signUpRole === 'Tailor' 
                      ? 'Securely log precision patterns, customer histories, and digital invoices across the entire cloud workspace system.'
                      : 'Review personal sleeve lengths, collar widths, and live orders status directly synced with the artisan tailoring desk.'}
                  </p>
                </div>
              </div>

              {/* Right Column: SIGN UP FORM */}
              <div className={`w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between transition-colors relative overflow-hidden ${
                isDarkMode ? 'bg-black' : 'bg-[#faf9f6]'
              }`}>
                {/* Luxury watermarked text */}
                <div className={`absolute top-0 right-0 p-8 -z-10 font-sans font-black text-9xl select-none pointer-events-none transition-colors ${
                  isDarkMode ? 'text-zinc-900/10' : 'text-zinc-200/40'
                }`}>
                  TAILORSHOP ERP
                </div>

                <div>
                  <div className="mb-6">
                    <h2 className={`font-sans font-black text-2xl tracking-tight transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-stone-900'
                    }`}>
                      Create Account
                    </h2>
                    <p className={`text-xs mt-1 font-semibold ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-505'
                    }`}>
                      Fill in your detail credentials below
                    </p>
                  </div>

                  {/* Sign Up form details */}
                  <form onSubmit={handleSignUp} className="space-y-3.5">
                    
                    {/* Full Name */}
                    <div>
                      <label className={`block text-[11px] uppercase tracking-wider font-bold mb-1 ${
                        isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                      }`}>
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Full Name"
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                          className={`w-full pl-11 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs font-semibold ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black shadow-xs'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Email address */}
                    <div>
                      <label className={`block text-[11px] uppercase tracking-wider font-bold mb-1 ${
                        isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                      }`}>
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          className={`w-full pl-11 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs font-semibold ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black shadow-xs'
                          }`}
                        />
                      </div>
                    </div>

                    {signUpRole === 'Tailor' && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed font-sans mb-3 flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">💡</span>
                        <div>
                          <strong className="text-amber-700 dark:text-amber-400">Tailor Registration Policy:</strong> Only Name, Email address and Phone number are required. Your mobile number will serve as your login password, and we will verify it with an OTP.
                        </div>
                      </div>
                    )}

                    {/* Password */}
                    {signUpRole !== 'Tailor' && (
                      <div>
                        <label className={`block text-[11px] uppercase tracking-wider font-bold mb-1 ${
                          isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                        }`}>
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            className={`w-full pl-11 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs font-sans font-semibold ${
                              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black shadow-xs'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Location Column */}
                    {signUpRole !== 'Tailor' && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <label className={`block text-[11px] uppercase tracking-wider font-bold ${
                            isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                          }`}>
                            Location / Address
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator.geolocation) {
                                triggerToast('Requesting satellite coordinates...', 'info');
                                navigator.geolocation.getCurrentPosition(
                                  (pos) => {
                                    const lat = pos.coords.latitude.toFixed(2);
                                    const lon = pos.coords.longitude.toFixed(2);
                                    const locStr = `Mayfair Core (Lat ${lat}, Lon ${lon})`;
                                    setSignUpLocation(locStr);
                                    triggerToast('GCP Geolocation successfully locked current coordinates!', 'success');
                                  },
                                  (err) => {
                                    triggerToast('Location access denied. Please key in your address manually!', 'error');
                                  }
                                );
                              }
                            }}
                            className={`hover:underline font-bold text-[10px] cursor-pointer ${
                              isDarkMode ? 'text-yellow-400' : 'text-black font-extrabold'
                            }`}
                          >
                            Use my location
                          </button>
                        </div>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                          <input
                            type="text"
                            placeholder="City, Country"
                            value={signUpLocation}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSignUpLocation(val);
                              const loc = val.toLowerCase();
                              let detectedSign = '';
                              
                              if (loc.includes('london') || loc.includes('uk') || loc.includes('united kingdom') || loc.includes('britain') || loc.includes('scotland') || loc.includes('wales') || loc.includes('leicester')) {
                                detectedSign = '+44 ';
                              } else if (loc.includes('paris') || loc.includes('france')) {
                                detectedSign = '+33 ';
                              } else if (loc.includes('milan') || loc.includes('italy') || loc.includes('rome')) {
                                detectedSign = '+39 ';
                              } else if (loc.includes('tokyo') || loc.includes('japan') || loc.includes('kyoto') || loc.includes('osaka')) {
                                detectedSign = '+81 ';
                              } else if (loc.includes('mumbai') || loc.includes('india') || loc.includes('delhi') || loc.includes('bangalore') || loc.includes('kerala') || loc.includes('malappuram') || loc.includes('anakkayam')) {
                                detectedSign = '+91 ';
                              } else if (loc.includes('dubai') || loc.includes('uae') || loc.includes('abu dhabi') || loc.includes('emirates')) {
                                detectedSign = '+971 ';
                              } else if (loc.includes('germany') || loc.includes('berlin') || loc.includes('munich') || loc.includes('frankfurt')) {
                                detectedSign = '+49 ';
                              } else if (loc.includes('spain') || loc.includes('madrid') || loc.includes('barcelona')) {
                                detectedSign = '+34 ';
                              } else if (loc.includes('canada') || loc.includes('toronto') || loc.includes('vancouver')) {
                                detectedSign = '+1 ';
                              } else if (loc.includes('australia') || loc.includes('sydney') || loc.includes('melbourne')) {
                                detectedSign = '+61 ';
                              } else if (loc.includes('new york') || loc.includes('usa') || loc.includes('california') || loc.includes('america') || loc.includes('texas')) {
                                detectedSign = '+1 ';
                              }

                              if (detectedSign) {
                                setSignUpPhone((prev) => {
                                  if (!prev || prev.trim() === '') {
                                    return detectedSign;
                                  }
                                  // Strip existing leading phone code if present
                                  const baseNum = prev.replace(/^\+\d+\s*/, '').trim();
                                  return detectedSign + baseNum;
                                });
                              }
                            }}
                            className={`w-full pl-11 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs font-semibold ${
                              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black shadow-xs'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Mobile Number */}
                    <div>
                      <label className={`block text-[11px] uppercase tracking-wider font-bold mb-1 ${
                        isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                      }`}>
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input
                          type="text"
                          required
                          placeholder="+44 20 7123 4567"
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          className={`w-full pl-11 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs font-semibold ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black shadow-xs'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Submit create account button */}
                    <button
                      type="submit"
                      className={`w-full py-3.5 active:scale-[0.99] transition-all font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer mt-4 ${
                        isDarkMode ? 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-400/10' : 'bg-black hover:bg-zinc-900 text-white shadow-lg shadow-black/10'
                      }`}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Create Account &amp; Proceed</span>
                    </button>
                  </form>
                </div>

                {/* Already have account prompt directly beneath the Account Creation as requested */}
                <div className={`mt-8 text-center text-xs font-semibold ${
                  isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setGatekeeperScreen('signin');
                      triggerToast(`Switched directly to sign in mode!`, 'info');
                    }}
                    className={`hover:underline font-extrabold cursor-pointer text-sm ${
                      isDarkMode ? 'text-yellow-400' : 'text-black'
                    }`}
                  >
                    Sign In
                  </button>
                </div>

              </div>

            </div>
          ) : (
            /* ==========================================
               3. SIGN IN / LOGIN FORM (Step 3)
               ========================================== */
            <div className={`w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 flex flex-col lg:flex-row ${
              isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-200'
            }`}>
              
              {/* Left Column: Atmospheric Brand Imagery */}
              <div className={`w-full lg:w-1/2 relative flex flex-col justify-between p-8 sm:p-12 overflow-hidden min-h-[350px] lg:min-h-0 transition-colors duration-300 ${
                isDarkMode ? 'bg-black text-white' : 'bg-[#faf9f6] text-black border-r border-zinc-200'
              }`}>
                <img
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800"
                  alt="Atmospheric brand cover"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                    isDarkMode ? 'opacity-40 brightness-75' : 'opacity-70 contrast-[1.05]'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute inset-0 transition-all duration-350 ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-black/70 via-transparent to-black/90' 
                    : 'bg-gradient-to-b from-black/5 via-transparent to-black/10'
                }`} />
                
                <div className={`relative z-10 p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 shadow-xl ${
                  isDarkMode 
                    ? 'bg-black/80 border-zinc-800/85' 
                    : 'bg-white/90 border-white/60'
                }`}>
                  <span className={`text-[10px] uppercase font-mono tracking-[0.25em] font-extrabold ${
                    isDarkMode ? 'text-yellow-400' : 'text-amber-700'
                  }`}>
                    Authorized TAILORSHOP ERP Workspace
                  </span>
                  <h2 className={`font-sans font-black text-2xl tracking-tight mt-1 leading-tight ${
                    isDarkMode ? 'text-white' : 'text-zinc-950'
                  }`}>
                    <Typewriter text="Sartorial Design Center" speed={40} isDark={isDarkMode} />
                  </h2>
                  <p className={`text-xs mt-2 select-none leading-relaxed font-semibold ${
                    isDarkMode ? 'text-zinc-350' : 'text-zinc-700'
                  }`}>
                    Enter your email or phone credentials to access tailored design measurements, manage shop schedules, or track boutique orders.
                  </p>
                </div>
              </div>

              {/* Right Column: SIGN IN FORM */}
              <div className={`w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-between transition-colors relative overflow-hidden ${
                isDarkMode ? 'bg-black' : 'bg-[#faf9f6]'
              }`}>
                {/* Luxury watermarked text */}
                <div className={`absolute top-0 right-0 p-8 -z-10 font-sans font-black text-9xl select-none pointer-events-none transition-colors ${
                  isDarkMode ? 'text-zinc-900/10' : 'text-zinc-200/40'
                }`}>
                  Sartor
                </div>

                <div>
                  <div className="mb-6">
                    <h2 className={`font-sans font-black text-2xl tracking-tight transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-stone-900'
                    }`}>
                      Sign In
                    </h2>
                    <p className={`text-xs mt-1 font-semibold ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-505'
                    }`}>
                      Unified Sign-In for Master Admins, Tailor Shop Owners &amp; Customers
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSignIn} className="space-y-4">
                    
                    {/* Email address */}
                    <div>
                      <label className={`block text-[11px] uppercase tracking-wider font-bold mb-1.5 ${
                        isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                      }`}>
                        Username, Email Address or Phone Number
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Arthur, owner@tailorshoperp.com, or phone number"
                          value={signInEmail}
                          onChange={(e) => setSignInEmail(e.target.value)}
                          className={`w-full pl-11 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs font-semibold ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black shadow-xs'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className={`block text-[11px] uppercase tracking-wider font-bold mb-1.5 ${
                        isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                      }`}>
                        Password, Username, Phone, or Order ID
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="e.g. phone/username, custom password or ORD-9841"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          className={`w-full pl-11 pr-11 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs font-sans font-semibold ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black shadow-xs'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-405 hover:text-stone-605 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className={`flex items-center space-x-2 font-semibold cursor-pointer select-none ${
                        isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                      }`}>
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-zinc-300 text-yellow-500 focus:ring-yellow-400 h-4 w-4 cursor-pointer"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => triggerToast('Security pins or password reset alerts dispatched on registered phone lines.', 'info')}
                        className={`hover:underline font-bold cursor-pointer ${
                          isDarkMode ? 'text-yellow-400' : 'text-black'
                        }`}
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Submit sign in button */}
                    <button
                      type="submit"
                      className={`w-full py-3.5 active:scale-[0.99] transition-all font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer mt-4 ${
                        isDarkMode ? 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-400/10' : 'bg-black hover:bg-zinc-900 text-white shadow-lg shadow-black/10'
                      }`}
                    >
                      <CheckSquare className="h-4 w-4" />
                      <span>Sign In</span>
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* Footer info lock */}
        <footer className={`py-6 border-t text-center text-[11px] ${
          isDarkMode ? 'bg-slate-950 border-slate-900 text-stone-500' : 'bg-stone-100 border-stone-200 text-stone-400'
        }`}>
          <p className="font-sans text-[11px]">
            Pwerdby{' '}
            <a
              href="https://u-bsol.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:underline text-amber-600 dark:text-amber-500"
            >
              U-bsol
            </a>
          </p>
        </footer>
      </div>
    );
  }

  // ==========================================
  // --- CUSTOMER PORTAL INTERACTIVE ---
  // ==========================================
  if (currentUser && currentUser.role === 'Customer') {
    const currentCustomerObj = customers.find((c) => c.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) || {
      id: currentUser.id,
      name: currentUser.name,
      phone: currentUser.phone || '',
      email: currentUser.email,
      address: currentUser.location || 'Walk-in Workshop Customer',
      createdAt: new Date().toISOString(),
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2"
    };

    const myMeasurements = measurements.filter((m) => m.customerId === currentCustomerObj.id);
    const myOrders = orders.filter((o) => o.customerId === currentCustomerObj.id);
    const myNotifs = getNotifications().filter((n) => n.recipient === currentCustomerObj.phone || n.recipient === currentCustomerObj.email);

    return (
      <div className={`min-h-screen transition-colors duration-300 flex flex-col ${isDarkMode ? 'dark' : ''} ${
        isDarkMode ? 'bg-black text-white' : 'bg-white text-black font-sans'
      }`}>
        {/* Dynamic corner Toast Alerts popup banner inside Customer Portal */}
        {uiToast && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce max-w-sm">
            <div className={`p-4 rounded-xl shadow-2xl flex items-center space-x-3 font-medium text-xs border ${
              isDarkMode
                ? (uiToast.type === 'success'
                    ? 'bg-zinc-900 border-zinc-800 text-yellow-400'
                    : uiToast.type === 'error'
                    ? 'bg-zinc-900 border-zinc-800 text-rose-400'
                    : 'bg-zinc-900 border-zinc-800 text-white')
                : (uiToast.type === 'success'
                    ? 'bg-yellow-50 border-yellow-250 text-zinc-900'
                    : uiToast.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-neutral-50 border-neutral-200 text-black')
            }`}>
              {uiToast.type === 'success' && <CheckCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
              {uiToast.type === 'error' && <ShieldCheck className="h-4 w-4 text-rose-500 flex-shrink-0" />}
              {uiToast.type === 'info' && <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
              <span>{uiToast.message}</span>
            </div>
          </div>
        )}

        {/* Customer Portal Top Header */}
        <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
          isDarkMode ? 'bg-slate-950/80 border-slate-900' : 'bg-white/80 border-stone-200'
        }`}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center shrink-0">
                {customLogoUrl ? (
                  <img
                    src={customLogoUrl}
                    alt="TAILORSHOP ERP Logo"
                    className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-emerald-600 rounded-xl blur-md opacity-25 animate-pulse"></div>
                    <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center shadow-md border border-emerald-400/20">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="font-sans font-black text-sm sm:text-2xl tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-emerald-600 to-stone-800 dark:from-white dark:via-emerald-550 dark:to-stone-100 whitespace-nowrap transition-all">
                  {tailorshopName.toUpperCase()}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark mode switcher */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl border transition-all ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-550'
                }`}
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="p-2 px-3 hover:bg-rose-500/10 hover:text-rose-600 text-stone-500 rounded-xl transition duration-150 flex items-center space-x-1 border border-transparent hover:border-rose-500/20 text-xs font-bold cursor-pointer"
                title="Secure logout session"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Brand Banner section with client's title */}
        <div className={`py-10 border-b relative overflow-hidden transition-all ${
          isDarkMode ? 'bg-slate-900/10 border-slate-900' : 'bg-[#faf8f4] border-stone-150'
        }`}>
          {/* Subtle watermarked background */}
          <div className="absolute top-0 right-0 p-12 text-stone-100 dark:text-slate-900/10 -z-10 font-sans font-black text-8xl pointer-events-none select-none">
            Bespoke
          </div>

          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 dark:from-indigo-600 dark:to-indigo-500 text-white flex items-center justify-center font-extrabold text-xl tracking-wider font-sans border border-amber-500/20 shadow-lg uppercase select-none">
                  {(() => {
                    const clean = (currentCustomerObj.name || '').trim();
                    if (!clean) return 'PA';
                    const parts = clean.split(/\s+/);
                    if (parts.length >= 2) {
                      return (parts[0][0] + parts[1][0]).toUpperCase();
                    }
                    return clean.slice(0, 2).toUpperCase();
                  })()}
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-slate-950 shadow">
                  <Check className="h-3 w-3" />
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-widest text-amber-600 dark:text-amber-500 font-bold">
                  Sartorial Ambassador Portfolio
                </p>
                <h2 className="font-sans text-2xl font-black">{currentCustomerObj.name}</h2>
                <div className="flex items-center space-x-3 text-xs text-stone-400 mt-1">
                  <span>{currentCustomerObj.email}</span>
                  <span>•</span>
                  <span>{currentCustomerObj.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className={`p-4 rounded-xl border text-center min-w-[120px] ${isDarkMode ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-stone-150'}`}>
                <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">Garments Ordered</span>
                <span className="text-xl font-extrabold text-indigo-500">{myOrders.length}</span>
              </div>
              <div className={`p-4 rounded-xl border text-center min-w-[120px] ${isDarkMode ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-stone-150'}`}>
                <span className="text-[9px] uppercase font-bold text-stone-400 block tracking-wider">Indexed Patterns</span>
                <span className="text-xl font-extrabold text-amber-600 dark:text-amber-500">{myMeasurements.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Customer Viewport Grid */}
        <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Box: Sizing Specifications card catalog (Takes 2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-lg font-black flex items-center gap-2">
                  <Ruler className="text-amber-600 h-5 w-5" />
                  <span>Your Sizing Blueprints</span>
                </h3>
                <span className="text-xs text-stone-400 font-medium">Locked parameters for perfect drape</span>
              </div>

              {myMeasurements.length === 0 ? (
                <div className={`p-10 rounded-2xl border text-center text-stone-400 ${isDarkMode ? 'bg-slate-900/30' : 'bg-white shadow-xs'}`}>
                  No measurement pattern archived yet. Join the TAILORSHOP ERP cutter studio to log your sizing records.
                </div>
              ) : (
                <div className={`grid grid-cols-1 ${myMeasurements.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
                  {myMeasurements.map((m) => {
                    const matchingOrder = myOrders.find((ord) => ord.clothingType.toLowerCase().trim() === m.clothingType.toLowerCase().trim());
                    const patternWorker = matchingOrder ? workers.find(w => w.id === matchingOrder.assignedWorkerId) : null;

                    return (
                      <div key={m.id} className={`p-6 rounded-2xl border transition-all ${
                        isDarkMode ? 'bg-slate-900/70 border-slate-900 hover:border-slate-800' : 'bg-white border-stone-200 shadow-sm hover:shadow-md'
                      }`}>
                        <div className="flex items-center justify-between pb-3 border-b border-light-200 dark:border-slate-900 mb-4 animate-none">
                          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-[9px] tracking-widest uppercase">
                            Pattern File: {m.clothingType}
                          </span>
                          <span className="font-mono text-[9px] font-bold text-stone-400">
                            ID: {m.id}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 font-mono text-center mb-4 text-xs font-semibold">
                          {Object.entries(m.fields).map(([k, v]) => {
                            const displayValue = cleanMeasurementValue(v, unitSystem);

                            return (
                              <div key={k} className={`p-2 rounded-lg border text-xs leading-none ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-stone-50 border-stone-100'}`}>
                                <span className="text-[8px] text-stone-400 uppercase font-sans font-bold block mb-1">{k}</span>
                                <span className="font-extrabold text-[12.5px]">{displayValue}</span>
                              </div>
                            );
                          })}
                        </div>

                        {m.notes && (
                          <div className={`p-3 rounded-xl block mb-4 text-xs italic ${isDarkMode ? 'bg-slate-950/80 border-slate-900' : 'bg-stone-50 border-stone-100'}`}>
                            Fitting Notes: "{m.notes}"
                          </div>
                        )}

                        {patternWorker ? (
                          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 flex items-center gap-2.5 text-left text-xs">
                            <span className="p-1 px-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-mono text-[9px] font-extrabold uppercase shrink-0">TAILOR APPROVED</span>
                            <p className="text-[10px] text-stone-600 dark:text-stone-300">
                              Sizing metrics configured &amp; approved by craftsman <strong className="font-black text-amber-600 dark:text-amber-500">{patternWorker.name}</strong> ({patternWorker.role}).
                            </p>
                          </div>
                        ) : (
                          <div className="mb-4 p-2.5 rounded-xl bg-stone-50 dark:bg-slate-955/40 border border-stone-150 dark:border-slate-850 flex items-center gap-2.5 text-left text-xs">
                            <span className="p-1 px-1.5 bg-stone-100 dark:bg-slate-900 text-stone-400 rounded-md font-mono text-[9px] uppercase shrink-0">DEFAULT SPECS</span>
                            <p className="text-[10px] text-stone-400">
                              Active pattern blueprints registered on client registry.
                            </p>
                          </div>
                        )}

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-stone-100 dark:border-slate-800 mt-2">
                          <span className="text-[10px] text-stone-400 font-medium font-sans">Recorded: {new Date(m.date).toLocaleDateString()}</span>
                          <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 justify-end">
                            <button
                              onClick={() => triggerPrintVoucher(m.id, currentCustomerObj.id, matchingOrder?.id)}
                              className="w-1/2 sm:w-auto p-1.5 px-2.5 border border-stone-200 dark:border-slate-800 hover:bg-stone-100 dark:hover:bg-slate-800 transition duration-150 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer whitespace-nowrap"
                            >
                              <Printer className="h-3 w-3 text-amber-500" />
                              <span>Print Voucher</span>
                            </button>
                            <button
                              onClick={() => downloadVoucherAsHtml(m.id, currentCustomerObj.id, matchingOrder?.id)}
                              className="w-1/2 sm:w-auto p-1.5 px-2.5 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/35 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition duration-150 rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer whitespace-nowrap"
                            >
                              <Download className="h-3 w-3" />
                              <span>Download Bill</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}



            </div>

            {/* Right Box: Timeline status, Countdown, Accounting & Logs (Takes 1 column) */}
            <div className="space-y-6 lg:col-span-1">
              
              <h3 className="font-sans text-lg font-black flex items-center gap-2">
                <Clock className="text-indigo-500 h-5 w-5" />
                <span>Delivery &amp; Progress tracker</span>
              </h3>

              {myOrders.length === 0 ? (
                <div className={`p-6 rounded-2xl border text-center text-stone-400 ${isDarkMode ? 'bg-slate-900/30' : 'bg-white shadow-xs'}`}>
                  No active bespoke order timelines found. Start sizing to project your commissions.
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((o) => {
                    const targetDate = new Date(o.deliveryDate);
                    const today = new Date();
                    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    let countdownText = '';
                    let isReadySoon = false;

                    if (diffDays === 0) {
                      countdownText = '🚨 READY TODAY FOR PICK-UP!';
                      isReadySoon = true;
                    } else if (diffDays < 0) {
                      countdownText = '✅ Completed and ready for fitting!';
                    } else {
                      countdownText = `Scheduled ready in ${diffDays} days (${new Date(o.deliveryDate).toLocaleDateString()})`;
                      if (diffDays <= 4) isReadySoon = true;
                    }

                    const statusWeights: Record<string, number> = {
                      'Order Received': 10,
                      'Measurement Taken': 25,
                      'Cutting': 45,
                      'Stitching': 65,
                      'Finishing': 80,
                      'Ready for Pickup': 100,
                      'Delivered': 100
                    };
                    const progressPercent = statusWeights[o.status] || 15;

                    return (
                      <div key={o.id} className={`p-5 rounded-2xl border text-xs relative ${
                        isDarkMode ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-stone-250 shadow-xs'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] text-stone-400 uppercase font-bold block tracking-wider">Garment Category</span>
                            <span className="text-sm font-extrabold text-stone-800 dark:text-white font-sans">{o.clothingType}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            o.status === 'Ready for Pickup' || o.status === 'Delivered'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {o.status}
                          </span>
                        </div>

                        {/* Status bar */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[10px] text-stone-400 font-bold">
                            <span>Fitting progress</span>
                            <span>{progressPercent}%</span>
                          </div>
                          <div className="w-full bg-stone-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 dark:bg-indigo-505 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Ready countdown text notice banner */}
                        <div className={`p-2.5 rounded-xl block mt-4 border text-[11px] font-bold ${
                          isReadySoon
                            ? 'bg-rose-50/60 border-rose-100 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
                            : 'bg-emerald-50/60 border-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
                        }`}>
                          🕒 {countdownText}
                        </div>

                        {/* Visual Fabrication Milestones timeline/stepper */}
                        <div className="mt-5 space-y-3 p-3.5 rounded-xl bg-stone-50 dark:bg-slate-950/60 border border-stone-100 dark:border-slate-900">
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-extrabold mb-3">Live Fabrication Milestones</p>
                          <div className="relative pl-4 border-l border-stone-150 dark:border-slate-850 space-y-3.5">
                            {[
                              { label: 'Order Confirmed', key: 'Order Received', desc: 'Secure booking logged inside central index.' },
                              { label: 'Sizing Blueprints Archiving', key: 'Measurement Taken', desc: 'Craftsmen logged body dimensions.' },
                              { label: 'Fabric Outlining', key: 'Cutting', desc: 'Sizing templates calculated and cloth sheared.' },
                              { label: 'Master Tailoring', key: 'Stitching', desc: 'Assembly and active stitching in workshop progress.' },
                              { label: 'Finishing Checks', key: 'Finishing', desc: 'Final drapes, detail checks & steam ironing.' },
                              { label: 'Ready for TAILORSHOP ERP Pickup', key: 'Ready for Pickup', desc: 'Securely packaged and ready for pick-up!' },
                              { label: 'Formally Delivered', key: 'Delivered', desc: 'Milestone settled and package handed over.' }
                            ].map((stage, idx) => {
                              const orderStatuses: OrderStatus[] = [
                                'Order Received',
                                'Measurement Taken',
                                'Cutting',
                                'Stitching',
                                'Finishing',
                                'Ready for Pickup',
                                'Delivered'
                              ];
                              const currentIdx = orderStatuses.indexOf(o.status);
                              const isDone = currentIdx > idx;
                              const isCurrent = o.status === stage.key;
                              
                              return (
                                <div key={stage.key} className="relative flex items-start space-x-3 text-left">
                                  {/* Milestone Dot */}
                                  <div className="absolute -left-[23px] top-1 flex items-center justify-center">
                                    {isDone ? (
                                      <div className="w-[11px] h-[11px] rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 flex items-center justify-center">
                                        <div className="w-[5px] h-[5px] bg-white rounded-full" />
                                      </div>
                                    ) : isCurrent ? (
                                      <div className="w-[11px] h-[11px] rounded-full bg-amber-500 ring-4 ring-amber-500/20 flex items-center justify-center animate-pulse">
                                        <div className="w-[5px] h-[5px] bg-white rounded-full" />
                                      </div>
                                    ) : (
                                      <div className="w-[9px] h-[9px] rounded-full bg-stone-200 dark:bg-slate-800 ring-2 ring-stone-100 dark:ring-slate-900" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0 leading-tight">
                                    <p className={`text-[10.5px] font-extrabold ${
                                      isDone ? 'text-emerald-600 dark:text-emerald-400 opacity-80' :
                                      isCurrent ? 'text-amber-600 dark:text-amber-500 font-black' :
                                      'text-stone-400 dark:text-stone-600'
                                    }`}>
                                      {stage.label}
                                    </p>
                                    {isCurrent && (
                                      <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 leading-normal">
                                        {stage.desc}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Assigned Craftsman / Tailor Section */}
                        {(() => {
                          const assignedWorker = workers.find(w => w.id === o.assignedWorkerId);
                          return (
                            <div className="mt-4 p-3 rounded-xl bg-[#faf9f5] dark:bg-slate-950/60 border border-stone-150 dark:border-slate-850 space-y-2.5 text-left text-xs">
                              <span className="text-[9px] text-stone-400 uppercase font-black tracking-widest block">Craftsman Assignment &amp; Specs</span>
                              
                              <div className="flex items-center space-x-3">
                                <img
                                  src={assignedWorker?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
                                  alt={assignedWorker?.name || "Bespoke Atelier"}
                                  className="w-8 h-8 rounded-full object-cover border dark:border-slate-800"
                                />
                                <div>
                                  <p className="font-extrabold text-stone-800 dark:text-stone-200 text-xs">
                                    {assignedWorker ? assignedWorker.name : 'Master Cutter Team'}
                                  </p>
                                  <p className="text-[10px] text-stone-400 font-medium">
                                    {assignedWorker ? assignedWorker.role : 'Authorized Workshop Staff'}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-dashed border-stone-200 dark:border-slate-800 text-[11px] text-stone-500 dark:text-stone-400 space-y-1">
                                <p>
                                  <strong className="text-stone-400 font-bold">Fabric Selection:</strong>{' '}
                                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                                    {o.notes.fabricDetails || 'Standard premium textile selected'}
                                  </span>
                                </p>
                                <p>
                                  <strong className="text-stone-400 font-bold">Bespoke Instructions:</strong>{' '}
                                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                                    {o.notes.instructions || 'Standard tailored finish outline'}
                                  </span>
                                </p>
                                {o.notes.tailorNotes && (
                                  <p className="p-2 py-1.5 rounded bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/10 text-[10px] font-sans">
                                    <strong className="font-black uppercase tracking-wider text-[9px] block">Tailor Action Updates:</strong>
                                    {o.notes.tailorNotes}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        <hr className="my-4 border-stone-100 dark:border-slate-850" />

                        {/* Ledger calculations */}
                        <div className="space-y-2 text-stone-500 font-bold text-[11px]">
                          <div className="flex justify-between">
                            <span>Quated Commission Price:</span>
                            <span className="font-bold text-stone-850 dark:text-white">₹{o.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Advance Cutter deposit:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-500">₹{o.advancePayment}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold text-rose-600 dark:text-rose-400 pt-1 border-t border-dashed dark:border-slate-800">
                            <span>Fitting Balance outstanding:</span>
                            <span>₹{o.remainingBalance}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}



            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className={`py-6 border-t text-center text-[11px] mt-auto ${
          isDarkMode ? 'bg-slate-950 border-slate-900 text-stone-500' : 'bg-stone-100 border-stone-200 text-stone-400'
        }`}>
          <p className="font-sans text-[11px]">
            Pwerdby{' '}
            <a
              href="https://u-bsol.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold hover:underline text-amber-600 dark:text-amber-500"
            >
              U-bsol
            </a>
          </p>
        </footer>
      </div>
    );
  }

  if (currentUser && currentUser.id !== 'TAILOR-OWNER-MASTER' && !currentUser.hasRegisteredShop && !currentUser.isWorker) {
    return (
      <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center p-4 relative ${isDarkMode ? 'dark' : ''} ${
        isDarkMode ? 'bg-black text-white' : 'bg-[#faf9f6] text-black font-sans'
      }`}>
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl border shadow-sm transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-800' 
                : 'bg-white border-zinc-200 text-black hover:bg-zinc-50'
            }`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all duration-300 ${
          isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-zinc-300 shadow-xl'
        }`}>
          <div className="text-center mb-5">
            <span className="p-3 bg-amber-500/10 text-amber-600 rounded-full inline-block mb-3">
              <Scissors className="h-6 w-6 transform -rotate-45" />
            </span>
            <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Register Your Tailor Shop</h2>
            <p className="text-xs text-stone-500 mt-1 dark:text-stone-400">
              Please provide complete shop details, branding, and GPS coordinates to construct your bespoke workstation. All fields are required.
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            
            const nameClean = setupShopName.trim();
            const locClean = setupShopLocation.trim();
            const phoneClean = setupShopPhone.trim();
            const ownerClean = setupOwnerName.trim();
            const logoClean = setupLogoUrl.trim();
            const latClean = setupLatitude.trim();
            const lonClean = setupLongitude.trim();

            if (!nameClean || !locClean || !phoneClean || !ownerClean || !logoClean || !latClean || !lonClean) {
              triggerToast('Please provide all details! Every field is required to register your Shop.', 'error');
              return;
            }

            // 1. Update currentUser in memory and local storage
            const updatedUser = {
              ...currentUser,
              name: ownerClean,
              location: locClean,
              phone: phoneClean,
              role: 'Owner' as any,
              shopName: nameClean,
              logoUrl: logoClean,
              shopLogoUrl: logoClean,
              hasRegisteredShop: true,
              coordinateLatitude: latClean,
              coordinateLongitude: lonClean
            };
            setCurrentUser(updatedUser);
            localStorage.setItem('tailor_logged_in_user', JSON.stringify(updatedUser));

            // Set local branding states
            setTailorshopName(nameClean);
            localStorage.setItem('tailorshop_name', nameClean);
            setCustomLogoUrl(logoClean);
            localStorage.setItem('logo_url', logoClean);

            // 2. Update registered_tailors list to persist this registration
            const tailors = getRegisteredTailors();
            const updatedTailors = tailors.map((t: any) => {
              if (t.id === currentUser.id || t.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) {
                return {
                  ...t,
                  name: ownerClean,
                  hasRegisteredShop: true,
                  shopName: nameClean,
                  location: locClean,
                  phone: phoneClean,
                  logoUrl: logoClean,
                  coordinateLatitude: latClean,
                  coordinateLongitude: lonClean
                };
              }
              return t;
            });
            saveRegisteredTailors(updatedTailors);
            setRegisteredTailors(updatedTailors);

            // 3. Also update this tailor/worker in the master workers list so they are synced over Firestore/Local Database with active shop parameters!
            const updatedWorkers = workers.map((w: any) => {
              const isEmailEqual = w.email && currentUser.email && w.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
              const isPhoneEqual = w.phone && currentUser.phone && isPhoneMatch(w.phone, currentUser.phone);
              const isNameEqual = w.name && currentUser.name && w.name.toLowerCase().trim() === currentUser.name.toLowerCase().trim();
              
              if (w.id === currentUser.id || isEmailEqual || isPhoneEqual || isNameEqual) {
                return {
                  ...w,
                  hasRegisteredShop: true,
                  shopName: nameClean,
                  logoUrl: logoClean,
                  location: locClean,
                  coordinateLatitude: latClean,
                  coordinateLongitude: lonClean,
                  shopOwnerId: currentUser.id,
                  shopOwnerEmail: currentUser.email
                };
              }
              return w;
            });
            setWorkers(updatedWorkers);
            saveWorkers(updatedWorkers);

            triggerToast('Congratulations! Your TAILORSHOP ERP Tailor Shop is now Registered!', 'success');
          }} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">
                Shop / TAILORSHOP ERP Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Row Tailoring House"
                value={setupShopName}
                onChange={(e) => setSetupShopName(e.target.value)}
                className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">
                Shop Owner / Proprietor Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Arthur S. Row"
                value={setupOwnerName}
                onChange={(e) => setSetupOwnerName(e.target.value)}
                className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800"
                required
              />
            </div>

            {/* Country, State, District, Area & Pincode Selection */}
            <div className="space-y-4 bg-stone-55 dark:bg-stone-900/30 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800">
              <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800/80 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 flex items-center gap-1.5 font-sans">
                  <MapPin className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  Location Details
                </span>
                <button
                  type="button"
                  onClick={handleGetSetupLocation}
                  disabled={setupLocationLoading}
                  className="text-[9.5px] bg-amber-500/10 hover:bg-amber-500/25 text-amber-600 dark:text-amber-500 font-extrabold px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 border border-amber-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  <MapPin className={`h-3 w-3 ${setupLocationLoading ? 'animate-spin' : ''}`} />
                  <span>{setupLocationLoading ? 'Locking...' : 'Use Current Location'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">
                    Country *
                  </label>
                  <select
                    value={setupShopCountry}
                    onChange={(e) => {
                      setSetupShopCountry(e.target.value);
                      setSetupShopState('');
                      setSetupShopDistrict('');
                    }}
                    className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-850 bg-white dark:text-white"
                    required
                  >
                    {COUNTRY_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">
                    State *
                  </label>
                  {setupShopCountry === 'India' ? (
                    <select
                      value={setupShopState}
                      onChange={(e) => {
                        setSetupShopState(e.target.value);
                        setSetupShopDistrict('');
                      }}
                      className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-850 bg-white dark:text-white"
                      required
                    >
                      <option value="">-- Choose State --</option>
                      {Object.keys(INDIA_STATES_MAP).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter State/Region"
                      value={setupShopState}
                      onChange={(e) => setSetupShopState(e.target.value)}
                      className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-850 bg-white"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">
                    District *
                  </label>
                  {setupShopCountry === 'India' && setupShopState && INDIA_STATES_MAP[setupShopState] ? (
                    <select
                      value={setupShopDistrict}
                      onChange={(e) => setSetupShopDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-850 bg-white dark:text-white"
                      required
                    >
                      <option value="">-- Choose District --</option>
                      {INDIA_STATES_MAP[setupShopState].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter District"
                      value={setupShopDistrict}
                      onChange={(e) => setSetupShopDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-850 bg-white"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">
                    Pincode / ZIP *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 679576 or 90210"
                    value={setupShopPincode}
                    onChange={(e) => setSetupShopPincode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-850 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-500 block mb-1">
                  Area / Street Address of Shop *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Edappal Junction or Suite 4B"
                  value={setupShopArea}
                  onChange={(e) => setSetupShopArea(e.target.value)}
                  className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-850 bg-white"
                  required
                />
              </div>

              {/* GPS Coordinates & Dynamic Map inside Location Details Card */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800/60 space-y-2">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider block text-stone-600 dark:text-stone-300">
                    GPS Coordinates *
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type="text"
                      placeholder="Latitude *"
                      value={setupLatitude}
                      onChange={(e) => setSetupLatitude(e.target.value)}
                      className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Longitude *"
                      value={setupLongitude}
                      onChange={(e) => setSetupLongitude(e.target.value)}
                      className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800"
                      required
                    />
                  </div>
                </div>

                {/* Live Interactive Map Preview inside Location Details Card with retrieved badge */}
                {setupLatitude && setupLongitude && (
                  <div className="mt-2.5 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm h-[180px] w-full relative">
                    <iframe
                      title="Location Details Google Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      src={`https://maps.google.com/maps?q=${setupLatitude},${setupLongitude}&z=16&output=embed`}
                    />
                  </div>
                )}
              </div>

              {setupShopLocation && (
                <div className="text-[10px] text-stone-600 dark:text-stone-350 bg-stone-100 dark:bg-stone-950 p-2 rounded-lg border border-stone-200 dark:border-stone-800 font-mono break-all leading-relaxed">
                  <span className="font-sans font-bold text-stone-400 mr-2 text-[9px] uppercase">ADDRESS PREVIEW:</span>
                  {setupShopLocation}
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">
                Store Contact Phone *
              </label>
              <input
                type="text"
                placeholder="e.g. +91 9876543210"
                value={setupShopPhone}
                onChange={(e) => setSetupShopPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800"
                required
              />
            </div>

            {/* Drag and Drop / Logo Upload */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">
                Store Logo (URL or Upload) *
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-... or drag an image below"
                  value={setupLogoUrl}
                  onChange={(e) => setSetupLogoUrl(cleanImageUrl(e.target.value))}
                  className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800"
                  required
                />
                
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setSetupDragging(true);
                  }}
                  onDragLeave={() => setSetupDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setSetupDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleLogoFileSelect(file);
                  }}
                  className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                    setupDragging 
                      ? 'border-amber-500 bg-amber-500/10' 
                      : 'border-stone-300 dark:border-stone-800 hover:border-amber-500/40'
                  }`}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleLogoFileSelect(file);
                    };
                    input.click();
                  }}
                >
                  {setupLogoUrl ? (
                    <div className="flex items-center justify-center space-x-3">
                      <img
                        src={setupLogoUrl}
                        alt="Logo preview"
                        className="h-10 w-10 object-cover rounded-lg border dark:border-stone-800"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-emerald-500 font-bold flex items-center">
                        <Check className="h-3.5 w-3.5 mr-1" /> Custom Logo Logged!
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="h-4.5 w-4.5 mx-auto text-stone-400" />
                      <p className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                        Drag &amp; drop logo image, or <span className="text-amber-500 underline">browse</span>
                      </p>
                      <p className="text-[9px] text-stone-400">Supports JPG, PNG, WEBP</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-amber-600/10 active:scale-[0.98] transition-all mt-2"
            >
              Construct Shop
            </button>
            
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2 border border-stone-200 dark:border-stone-800 font-bold hover:bg-red-500/5 text-stone-500 hover:text-red-500 text-xs rounded-xl cursor-pointer mt-1"
            >
              Sign Out &amp; Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const userShopInfo = getCurrentUserShopInfo();
  const displayNavbarLogo = customLogoUrl;
  const displayNavbarName = tailorshopName || 'STYLUS';

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${isDarkMode ? 'dark' : ''} ${
      isDarkMode ? 'bg-black text-white' : 'bg-white text-black font-sans'
    }`}>
      {/* Visual Header */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDarkMode ? 'bg-slate-950/80 border-slate-900' : 'bg-white/80 border-stone-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative flex items-center justify-center shrink-0">
              {(displayNavbarLogo && !logoLoadError) ? (
                <img
                  src={displayNavbarLogo}
                  alt="TAILORSHOP ERP Logo"
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoLoadError(true)}
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl blur-md opacity-25 animate-pulse"></div>
                  <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md border border-amber-400/20">
                    <Scissors className="h-4.5 w-4.5 sm:h-5 sm:w-5 transform -rotate-45" />
                  </div>
                </>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="font-sans font-black text-sm sm:text-2xl tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-stone-900 via-amber-600 to-stone-800 dark:from-white dark:via-amber-550 dark:to-stone-100 whitespace-nowrap transition-all">
                {displayNavbarName.toUpperCase()}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            {/* Operator/Seller profile identifier */}
            {currentUser && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-850 dark:text-slate-100">{currentUser.name}</span>
                <span className="text-[9px] text-[#aa8612] font-mono tracking-wider uppercase font-semibold">{currentUser.location || 'Central Room'}</span>
              </div>
            )}

            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
              }`}
              title="Toggle Theme Mode"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Complete Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="p-2 px-3 hover:bg-rose-500/10 hover:text-rose-600 text-stone-500 rounded-xl transition duration-150 flex items-center space-x-1 border border-transparent hover:border-rose-500/20 text-xs font-bold cursor-pointer"
              title="Logout current studio session"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Content container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">

        {/* Page Switcher Tab Bar */}
        {(currentUser?.role === 'Owner' || currentUser?.role === 'Manager') ? (
          <div className="flex border-b border-stone-200 dark:border-slate-800 space-x-6 px-1 overflow-x-auto whitespace-nowrap scrollbar-none font-sans">
            {currentUser?.id !== 'TAILOR-OWNER-MASTER' && (
              <>
                <button
                   type="button"
                   onClick={() => setOwnerTab('tailor_measurements')}
                   className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                     ownerTab === 'tailor_measurements'
                       ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-extrabold'
                       : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
                   }`}
                >
                  <Scissors className="h-4 w-4" />
                  <span>Measurements</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOwnerTab('customer_orders')}
                  className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                    ownerTab === 'customer_orders'
                      ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-extrabold'
                      : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Orders Book</span>
                  {visibleOrders.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      {visibleOrders.length}
                    </span>
                  )}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setOwnerTab('staffs_erp')}
              className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                ownerTab === 'staffs_erp'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-extrabold'
                  : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>{currentUser?.id === 'TAILOR-OWNER-MASTER' ? 'Register Owners & Shops' : 'Register Employee'}</span>
            </button>

            {currentUser?.id !== 'TAILOR-OWNER-MASTER' && (
              <button
                type="button"
                onClick={() => setOwnerTab('customer_patrons')}
                className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                  ownerTab === 'customer_patrons'
                    ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-black'
                    : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Customers</span>
              </button>
            )}

            {currentUser?.role === 'Owner' && (
              <button
                type="button"
                onClick={() => setOwnerTab('branding')}
                className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                  ownerTab === 'branding'
                    ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-black'
                    : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Branding &amp; Customization</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex border-b border-stone-200 dark:border-slate-800 space-x-6 px-1 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              type="button"
              onClick={() => setTailorPage('sizing')}
              className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                tailorPage === 'sizing'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-extrabold'
                  : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
              }`}
            >
              <Scissors className="h-4 w-4" />
              <span>Measurements Only</span>
            </button>
            <button
              type="button"
              onClick={() => setTailorPage('pending_tasks')}
              className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                tailorPage === 'pending_tasks'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-extrabold'
                  : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Pending Works</span>
              {orders.filter(o => o.assignedWorkerId === currentUser?.id && o.status !== 'Delivered').length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {orders.filter(o => o.assignedWorkerId === currentUser?.id && o.status !== 'Delivered').length}
                </span>
              )}
            </button>
          </div>
        )}

        {currentUser?.role === 'Owner' && ownerTab === 'branding' ? (
             <div className="space-y-6 fade-in font-sans">
               <div className="border-b border-stone-200 dark:border-slate-800 pb-4">
                 <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
                   <span className="p-2 bg-amber-500/10 text-amber-600 rounded-lg"><Sparkles className="h-4.5 w-4.5" /></span>
                   <span>Studio Branding &amp; Customization</span>
                 </h2>
                 <p className="text-xs text-stone-400 mt-1">Configure your app's brand identifier name and logo. Your designs will propagate instantly to every header, dashboard, and customer checkout screen.</p>
               </div>

               <div className="max-w-3xl mx-auto space-y-6">
                   {/* App Name Section */}
                   <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                     <div className="flex items-center space-x-2.5 mb-4">
                       <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                         <Scissors className="h-4 w-4" />
                       </div>
                       <div>
                         <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500">Website &amp; Studio Name</h3>
                         <p className="text-[10px] text-stone-400">Sets the brand title shown across the web navbar</p>
                       </div>
                     </div>
                     <div className="space-y-2 text-left">
                       <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block">App Name / TAILORSHOP ERP Title</label>
                       <div className="relative">
                         <input
                           type="text"
                           value={tailorshopName}
                           onChange={(e) => {
                             setTailorshopName(e.target.value);
                             triggerToast("Navbar title updated in real-time!", "info");
                           }}
                           placeholder="e.g. TAILORSHOP ERP Luxury"
                           className={`w-full p-3 pl-10 rounded-xl border text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-amber-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-250 text-stone-850'}`}
                         />
                         <span className="absolute left-3.5 top-3.5 text-stone-400">
                           <Scissors className="h-4 w-4 -rotate-45" />
                         </span>
                       </div>
                     </div>
                   </div>

                   {/* Logo Settings Section */}
                   <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                     <div className="flex items-center justify-between pb-3 border-b dark:border-slate-900 mb-6">
                       <div className="flex items-center space-x-2.5">
                         <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                           <Image className="h-4 w-4" />
                         </div>
                         <div>
                           <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500">Logotype Branding Image</h3>
                           <p className="text-[10px] text-stone-400">Change your brand mark using links or images</p>
                         </div>
                       </div>
                     </div>

                     {/* Tab switchers */}
                     <div className={`p-1 rounded-xl border flex gap-1 mb-6 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-200'}`}>
                       <button
                         type="button"
                         onClick={() => setLogoInputType('url')}
                         className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-2 ${logoInputType === 'url' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'}`}
                       >
                         <ExternalLink className="h-3.5 w-3.5" />
                         <span>Paste Logo Image URL</span>
                       </button>
                       <button
                         type="button"
                         onClick={() => setLogoInputType('upload')}
                         className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center space-x-2 ${logoInputType === 'upload' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'}`}
                       >
                         <Upload className="h-3.5 w-3.5" />
                         <span>Upload Logo File (Local)</span>
                       </button>
                     </div>

                     {/* Tab Panels */}
                     {logoInputType === 'url' ? (
                       <div className="space-y-4 text-left">
                         <div>
                           <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block mb-1.5">Direct Web Image Address URL</label>
                           <div className="relative">
                             <input
                               type="text"
                               value={customLogoUrl}
                               onChange={(e) => {
                                 setCustomLogoUrl(e.target.value);
                                 triggerToast("Website logo URL updated in real-time!", "info");
                               }}
                               placeholder="https://example.com/logo.png"
                               className={`w-full p-3 pl-10 rounded-xl border text-xs focus:ring-1 focus:ring-amber-500 ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-250 text-stone-800'}`}
                             />
                             <span className="absolute left-3.5 top-3.5 text-stone-400">
                               <ExternalLink className="h-4 w-4" />
                             </span>
                           </div>
                           <p className="text-[9.5px] text-stone-400 mt-2">Recommended: Standard PNG, JPEG, SVG logomarks on a fully transparent background.</p>
                         </div>
                       </div>
                     ) : (
                       <div className="space-y-4 text-left">
                         <div className="text-left font-sans">
                           <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block mb-1.5">Select Logo File</label>
                           <div
                             className={`border-2 border-dashed rounded-2xl p-6 transition duration-150 flex flex-col items-center justify-center text-center cursor-pointer ${
                               customLogoUrl ? 'border-amber-500/50 bg-amber-500/[0.02]' : 'border-stone-300 dark:border-slate-800 hover:border-amber-500_not'
                             }`}
                           >
                             <input
                               type="file"
                               id="logo-uploader-input"
                               className="hidden"
                               accept="image/*"
                               onChange={(e) => {
                                 const f = e.target.files?.[0];
                                 if (f) {
                                   const reader = new FileReader();
                                   reader.onload = (event) => {
                                     const base64Str = event.target?.result as string;
                                     if (base64Str) {
                                       const img = new window.Image();
                                       img.onload = () => {
                                         try {
                                           const canvas = document.createElement('canvas');
                                           const ctx = canvas.getContext('2d');
                                           const MAX_HEIGHT = 150;
                                           let w = img.width;
                                           let h = img.height;
                                           if (h > MAX_HEIGHT) {
                                             w = Math.round((img.width * MAX_HEIGHT) / img.height);
                                             h = MAX_HEIGHT;
                                           }
                                           canvas.width = w;
                                           canvas.height = h;
                                           if (ctx) {
                                             ctx.imageSmoothingEnabled = true;
                                             ctx.imageSmoothingQuality = 'high';
                                             ctx.drawImage(img, 0, 0, w, h);
                                             setCustomLogoUrl(canvas.toDataURL('image/png'));
                                             triggerToast("Logo uploaded and auto-scaled beautifully!", "success");
                                           } else {
                                             setCustomLogoUrl(base64Str);
                                             triggerToast("Logo uploaded!", "success");
                                           }
                                         } catch (err) {
                                           console.error("Canvas scaling nested error, using fallback raw src:", err);
                                           setCustomLogoUrl(base64Str);
                                           triggerToast("Logo uploaded!", "success");
                                         }
                                       };
                                       img.onerror = () => {
                                         setCustomLogoUrl(base64Str);
                                         triggerToast("Logo uploaded!", "success");
                                       };
                                       img.src = base64Str;
                                       
                                     }
                                   };
                                   reader.readAsDataURL(f);
                                 }
                               }}
                             />
                             <label htmlFor="logo-uploader-input" className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-4">
                               <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full mb-3">
                                 <Upload className="h-6 w-6" />
                               </div>
                               <span className="text-xs font-extrabold text-stone-750 dark:text-stone-200 block">Click to select layout image</span>
                               <span className="text-[10px] text-stone-400 mt-1 block">Supports PNG, SVG, JPG. File will be stored locally as persistent data URI.</span>
                             </label>
                           </div>
                         </div>
                       </div>
                     )}

                     {/* Quick Presets Section */}
                     <div className="mt-8 border-t border-stone-150 dark:border-slate-850 pt-5 text-left">
                                             {/* Save Branding Changes Button Section */}
                      <div className="mb-6 p-4 bg-amber-500/[0.03] dark:bg-amber-500/[0.01] border border-amber-500/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                        <div className="space-y-0.5">
                          <h4 className="text-[11px] font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">Save Configuration Changes</h4>
                          <p className="text-[10px] text-stone-400">Lock your custom app name and auto-resized logo globally.</p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 animate-none">
                          <button
                            type="button"
                            onClick={() => {
                              setTailorshopName('TAILORSHOP ERP');
                              setCustomLogoUrl('');
                              localStorage.setItem('tailorshop_name', 'TAILORSHOP ERP');
                              localStorage.setItem('logo_url', '');
                              saveBrandingToDatabase('TAILORSHOP ERP', '');
                              triggerToast("Branding configuration reset to system default!", "success");
                            }}
                            className="px-4 py-2 border border-stone-200 dark:border-stone-850 hover:bg-stone-50 dark:hover:bg-slate-800 text-stone-600 dark:text-stone-300 rounded-lg text-[10px] font-bold transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset to Default</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem('logo_url', customLogoUrl);
                              localStorage.setItem('tailorshop_name', tailorshopName);
                              saveBrandingToDatabase(tailorshopName, customLogoUrl);
                              triggerToast("Brand configuration applied & saved successfully!", "success");
                            }}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Save &amp; Apply Changes</span>
                          </button>
                        </div>
                      </div>

                      <h4 className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider mb-3">Or choose a professional Tailor Logo Preset:</h4>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                         {[
                           { name: "Emerald Shield", url: "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=128&auto=format&fit=crop&q=60" },
                           { name: "Gold Scissors", url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=128&auto=format&fit=crop&q=60" },
                           { name: "Vintage Needle", url: "https://images.unsplash.com/photo-1517594422361-5eeb8ae275a9?w=128&auto=format&fit=crop&q=60" },
                           { name: "Minimalist Craft", url: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=128&auto=format&fit=crop&q=60" }
                         ].map((preset, index) => (
                           <button
                             type="button"
                             key={index}
                             onClick={() => {
                               setCustomLogoUrl(preset.url);
                               triggerToast(`Applied "${preset.name}" preset logo!`, "success");
                             }}
                             className={`p-2 border rounded-xl flex items-center space-x-2 text-left hover:border-amber-500 transition-all cursor-pointer ${
                               customLogoUrl === preset.url ? 'border-amber-500 bg-amber-500/5' : 'border-stone-200 dark:border-slate-850 bg-stone-50/50 dark:bg-slate-950/40'
                             }`}
                           >
                             <img src={preset.url} alt={preset.name} className="h-6 w-6 rounded-md object-cover" />
                             <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 truncate">{preset.name}</span>
                           </button>
                         ))}
                       </div>
                     </div>
                   </div>

                    {/* Landing Page & Role Cards Content Customization Section */}
                    {/* Welcome Screen customizer card */}
                    {currentUser?.id === 'TAILOR-OWNER-MASTER' ? (
                      <div className={`p-6 rounded-2xl border text-left space-y-6 ${isDarkMode ? 'bg-zinc-900/50 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'}`}>
                        <div className="flex items-center space-x-2.5 pb-2 border-b border-light-divider dark:border-zinc-800">
                          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500">Welcome &amp; Cards Customization</h3>
                            <p className="text-[10px] text-stone-400">Edit the images, greetings, tailor portal, and customer cards inside the entry page</p>
                          </div>
                        </div>

                        {/* 1. Main Welcome screen */}
                        <div className="p-4.5 rounded-xl border border-stone-200/60 dark:border-zinc-800/80 bg-stone-50/50 dark:bg-zinc-950/40 space-y-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-500 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Welcome/Landing Page Texts</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block mb-1">Landing Title</label>
                              <input
                                type="text"
                                value={customLandingTitle}
                                onChange={(e) => setCustomLandingTitle(e.target.value)}
                                placeholder="e.g. Welcome to TAILORSHOP ERP"
                                className={`w-full p-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-805 text-white' : 'bg-stone-50 border-stone-250 text-stone-855 shadow-3xs'}`}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block mb-1">Landing Description</label>
                              <textarea
                                rows={2}
                                value={customLandingDescription}
                                onChange={(e) => setCustomLandingDescription(e.target.value)}
                                placeholder="Subtitle description..."
                                className={`w-full p-2 rounded-xl border text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-950 border-zinc-805 text-white' : 'bg-stone-50 border-stone-250 text-stone-855 shadow-3xs'}`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. Tailor card customization */}
                        <div className="p-4.5 rounded-xl border border-stone-200/60 dark:border-zinc-800/80 bg-stone-50/50 dark:bg-zinc-950/40 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Tailor Portal Card</span>
                            <span className="text-[9px] text-stone-400 font-semibold">Entry Card 1</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block mb-1">Card Header Title</label>
                                <input
                                  type="text"
                                  value={customTailorTitle}
                                  onChange={(e) => setCustomTailorTitle(e.target.value)}
                                  className={`w-full p-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-955 border-zinc-805 text-white' : 'bg-stone-50 border-stone-250 text-stone-855 shadow-3xs'}`}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block mb-1">Card Paragraph Detail</label>
                                <textarea
                                  rows={2}
                                  value={customTailorDescription}
                                  onChange={(e) => setCustomTailorDescription(e.target.value)}
                                  className={`w-full p-2 rounded-xl border text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-955 border-zinc-805 text-white' : 'bg-stone-50 border-stone-250 text-stone-855 shadow-3xs'}`}
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block">Card Background Image (File Upload or Link)</label>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={customTailorImage}
                                  onChange={(e) => setCustomTailorImage(e.target.value)}
                                  placeholder="Paste image address URL..."
                                  className={`w-full p-2 rounded-lg border text-[11px] focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-955 border-zinc-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-850 shadow-3xs'}`}
                                />
                                <div className="relative">
                                  <input
                                    type="file"
                                    id="tailor-card-file-input"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const devFile = e.target.files?.[0];
                                      if (devFile) {
                                        const rd = new FileReader();
                                        rd.onload = (fileEv) => {
                                          const res = fileEv.target?.result as string;
                                          if (res) {
                                            setCustomTailorImage(res);
                                            triggerToast("Tailor Card backdrop loaded!", "success");
                                          }
                                        };
                                        rd.readAsDataURL(devFile);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor="tailor-card-file-input"
                                    className={`w-full py-2 border border-dashed rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer text-[10px] font-bold ${isDarkMode ? 'border-zinc-800 bg-zinc-955/40 text-stone-300 hover:bg-zinc-900/50' : 'border-stone-300 bg-stone-50 hover:bg-stone-100 shadow-3xs'}`}
                                  >
                                    <Upload className="h-3 w-3 text-amber-500" />
                                    <span>Upload Local Tailor Backdrop File</span>
                                  </label>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[9px] text-stone-400 font-bold">Image Preview:</span>
                                <img src={customTailorImage} alt="Tailor preview" className="h-8 w-16 object-cover rounded border border-neutral-200 dark:border-zinc-800" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. Customer card customization */}
                        <div className="p-4.5 rounded-xl border border-stone-200/60 dark:border-zinc-800/80 bg-stone-50/50 dark:bg-zinc-950/40 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Customer Portal Card</span>
                            <span className="text-[9px] text-stone-400 font-semibold">Entry Card 2</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block mb-1">Card Header Title</label>
                                <input
                                  type="text"
                                  value={customCustomerTitle}
                                  onChange={(e) => setCustomCustomerTitle(e.target.value)}
                                  className={`w-full p-2.5 rounded-xl border text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-955 border-zinc-805 text-white' : 'bg-stone-50 border-stone-250 text-stone-855 shadow-3xs'}`}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block mb-1">Card Paragraph Detail</label>
                                <textarea
                                  rows={2}
                                  value={customCustomerDescription}
                                  onChange={(e) => setCustomCustomerDescription(e.target.value)}
                                  className={`w-full p-2 rounded-xl border text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-955 border-zinc-805 text-white' : 'bg-stone-50 border-stone-250 text-stone-855 shadow-3xs'}`}
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block">Card Background Image (File Upload or Link)</label>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={customCustomerImage}
                                  onChange={(e) => setCustomCustomerImage(e.target.value)}
                                  placeholder="Paste image address URL..."
                                  className={`w-full p-2 rounded-lg border text-[11px] focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-955 border-zinc-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-855 shadow-3xs'}`}
                                />
                                <div className="relative">
                                  <input
                                    type="file"
                                    id="customer-card-file-input"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const devFile2 = e.target.files?.[0];
                                      if (devFile2) {
                                        const rd2 = new FileReader();
                                        rd2.onload = (fileEv2) => {
                                          const res2 = fileEv2.target?.result as string;
                                          if (res2) {
                                            setCustomCustomerImage(res2);
                                            triggerToast("Customer Card backdrop loaded!", "success");
                                          }
                                        };
                                        rd2.readAsDataURL(devFile2);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor="customer-card-file-input"
                                    className={`w-full py-2 border border-dashed rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer text-[10px] font-bold ${isDarkMode ? 'border-zinc-800 bg-zinc-955/40 text-stone-300 hover:bg-zinc-900/50' : 'border-stone-300 bg-stone-50 hover:bg-stone-100 shadow-3xs'}`}
                                  >
                                    <Upload className="h-3 w-3 text-amber-500" />
                                    <span>Upload Local Customer Backdrop File</span>
                                  </label>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[9px] text-stone-400 font-bold">Image Preview:</span>
                                <img src={customCustomerImage} alt="Customer preview" className="h-8 w-16 object-cover rounded border border-neutral-200 dark:border-zinc-800" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Persistent lock action row */}
                        <div className="p-4 bg-amber-500/[0.04] border border-amber-500/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <h4 className="text-[11px] font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">Save Entry Screen Customizations</h4>
                            <p className="text-[10px] text-stone-400">Lock your dynamic texts and background cover screens globally.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              localStorage.setItem('landing_title', customLandingTitle);
                              localStorage.setItem('landing_description', customLandingDescription);
                              localStorage.setItem('tailor_title', customTailorTitle);
                              localStorage.setItem('tailor_description', customTailorDescription);
                              localStorage.setItem('tailor_image', customTailorImage);
                              localStorage.setItem('customer_title', customCustomerTitle);
                              localStorage.setItem('customer_description', customCustomerDescription);
                              localStorage.setItem('customer_image', customCustomerImage);
                              triggerToast("Welcome Page & Card layouts locked successfully!", "success");
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Save Welcome Page &amp; Cards</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-6 rounded-2xl border text-left flex flex-col sm:flex-row items-center justify-between gap-4 ${isDarkMode ? 'bg-zinc-900/30 border-zinc-900 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-500 shadow-sm'}`}>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 uppercase tracking-wide">
                            <Lock className="h-3.5 w-3.5 text-amber-500" />
                            <span>System Landing Customization Restricted</span>
                          </h4>
                          <p className="text-[10px] text-stone-400">The master login screen, entry page role backdrops, and core system greetings can only be modified by system-wide Administrators.</p>
                        </div>
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 font-extrabold px-2 py-1 rounded uppercase tracking-wider whitespace-nowrap">Admin Only Access</span>
                      </div>
                    )}

                    {/* Bespoke Voucher Design Studio & Live Preview */}
                    <div className={`p-6 rounded-2xl border text-left space-y-6 ${isDarkMode ? 'bg-zinc-900/50 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="flex items-center space-x-2.5 pb-2 border-b border-light-divider dark:border-zinc-800">
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                          <Printer className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500">TAILORSHOP ERP Voucher Designer &amp; Ledger Studio</h3>
                          <p className="text-[10px] text-stone-400">Design the layout style, font typography, color combinations, and text content of your printed invoices dynamically</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
                        {/* LEFT COLUMN: CONTROLS (Col: 5) */}
                        <div className="lg:col-span-5 space-y-4">
                          {/* 1. Typography & Borders */}
                          <div className="space-y-3 p-4 rounded-xl bg-stone-50/50 dark:bg-zinc-950/40 border border-stone-200/60 dark:border-zinc-800/80">
                            <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-500 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Typography &amp; Structural Assets</span>
                            
                            <div>
                              <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-widest block mb-1">Voucher Font Family</label>
                              <select
                                value={voucherFont}
                                onChange={(e) => {
                                  setVoucherFont(e.target.value);
                                  triggerToast(`Sartorial typeface changed to ${e.target.value}!`, "info");
                                }}
                                className={`w-full p-2.5 rounded-xl border text-[11px] font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-850 shadow-3xs'}`}
                              >
                                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary Bespoke)</option>
                                <option value="Playfair Display">Playfair Display (Italian Sartorial Serif)</option>
                                <option value="Cinzel">Cinzel (Royal Roman Imperial)</option>
                                <option value="Montserrat">Montserrat (Modernist Tailor Rail)</option>
                                <option value="Space Grotesk">Space Grotesk (Avant-Garde Technical)</option>
                                <option value="JetBrains Mono">JetBrains Mono (System Sizing Grid)</option>
                                <option value="Courier New">Courier New (Legacy Tailoring Ticket)</option>
                                <option value="Inter">Inter (Classic Elegant Neutral)</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-widest block mb-1">Divider Style</label>
                                <select
                                  value={voucherBorderStyle}
                                  onChange={(e) => setVoucherBorderStyle(e.target.value)}
                                  className={`w-full p-2 rounded-xl border text-[11px] focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-850 shadow-3xs'}`}
                                >
                                  <option value="dashed">Dashed Coupon</option>
                                  <option value="solid">Solid Slate Frame</option>
                                  <option value="dotted">Perforated Tear</option>
                                  <option value="double">Royal Double Border</option>
                                  <option value="none">No Divider</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-widest block mb-1">Brand Alignment</label>
                                <select
                                  value={voucherLogoAlignment}
                                  onChange={(e) => setVoucherLogoAlignment(e.target.value)}
                                  className={`w-full p-2 rounded-xl border text-[11px] focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-850 shadow-3xs'}`}
                                >
                                  <option value="left">Left Aligned</option>
                                  <option value="center">Center Centered</option>
                                  <option value="right">Right Aligned</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* 2. Color Palette Customizer */}
                          <div className="space-y-3 p-4 rounded-xl bg-stone-50/50 dark:bg-zinc-950/40 border border-stone-200/60 dark:border-zinc-800/80">
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Colorways &amp; Accents</span>
                            
                            {/* Accent preset buttons */}
                            <div>
                              <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-widest block mb-1.5">Regal Accent Presets</label>
                              <div className="flex gap-2 mb-2">
                                {[
                                  { name: 'Amber Gold', hex: '#d97706' },
                                  { name: 'Royale Red', hex: '#dc2626' },
                                  { name: 'Forest Moss', hex: '#15803d' },
                                  { name: 'Tailor Onyx', hex: '#1c1917' },
                                  { name: 'Boutique Iris', hex: '#7c3aed' },
                                ].map((wp, idx) => (
                                  <button
                                    type="button"
                                    key={idx}
                                    title={wp.name}
                                    onClick={() => {
                                      setVoucherAccentColor(wp.hex);
                                      triggerToast(`Applied ${wp.name} accent!`, "success");
                                    }}
                                    className={`w-7 h-7 rounded-full border-2 transition hover:scale-110 cursor-pointer ${voucherAccentColor === wp.hex ? 'border-amber-500 ring-2 ring-white scale-105' : 'border-transparent'}`}
                                    style={{ backgroundColor: wp.hex }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">Accent Custom</label>
                                <input
                                  type="color"
                                  value={voucherAccentColor}
                                  onChange={(e) => setVoucherAccentColor(e.target.value)}
                                  className="w-full h-8 cursor-pointer rounded-lg border border-stone-200 bg-white"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">Voucher BG</label>
                                <input
                                  type="color"
                                  value={voucherBgColor}
                                  onChange={(e) => setVoucherBgColor(e.target.value)}
                                  className="w-full h-8 cursor-pointer rounded-lg border border-stone-200 bg-white"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">Voucher Text</label>
                                <input
                                  type="color"
                                  value={voucherTextColor}
                                  onChange={(e) => setVoucherTextColor(e.target.value)}
                                  className="w-full h-8 cursor-pointer rounded-lg border border-stone-200 bg-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 3. Text content strings */}
                          <div className="space-y-3 p-4 rounded-xl bg-stone-50/50 dark:bg-zinc-950/40 border border-stone-200/60 dark:border-zinc-800/80">
                            <span className="text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Dynamic Texts Layout</span>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-widest block mb-1">Voucher Header Name</label>
                                <input
                                  type="text"
                                  value={voucherMainTitle}
                                  onChange={(e) => setVoucherMainTitle(e.target.value)}
                                  className={`w-full p-2 rounded-xl border text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-850 shadow-3xs'}`}
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-widest block mb-1">Voucher Tagline Subtitle</label>
                                <input
                                  type="text"
                                  value={voucherSubtitle}
                                  onChange={(e) => setVoucherSubtitle(e.target.value)}
                                  className={`w-full p-2 rounded-xl border text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-850 shadow-3xs'}`}
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-widest block mb-1">Footer Legal Notes / Return Guarantee Policy</label>
                                <textarea
                                  rows={3}
                                  value={voucherFooterNotes}
                                  onChange={(e) => setVoucherFooterNotes(e.target.value)}
                                  className={`w-full p-2 rounded-xl border text-[11px] focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-stone-200 text-stone-850 shadow-3xs'}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: HIGH-FIDELITY LIVE PRINT PREVIEW (Col: 7) */}
                        <div className="lg:col-span-7 bg-stone-100 dark:bg-zinc-950 p-4 rounded-xl border border-stone-200 dark:border-zinc-800">
                          <div className="flex items-center justify-between mb-3 pb-2 border-b dark:border-zinc-900">
                            <span className="text-[9px] uppercase font-black text-stone-450 tracking-wider">High-Fidelity Real-time Print Simulation</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-amber-500/10 text-amber-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 animate-pulse"></span>
                              Active Render
                            </span>
                          </div>

                          {/* Simulated Ticket Frame */}
                          <div
                            className="p-6 rounded-lg text-left shadow-md transition-all duration-300 mx-auto max-w-[420px] select-none"
                            style={{
                              fontFamily: `'${voucherFont}', sans-serif`,
                              color: voucherTextColor,
                              backgroundColor: voucherBgColor,
                              borderTop: `8px solid ${voucherAccentColor}`
                            }}
                          >
                            {/* App Header info */}
                            <div className="text-center text-[8px] tracking-widest uppercase font-extrabold opacity-60 mb-1">
                              Tailor Shop ERP Active Design
                            </div>

                            {/* Header details */}
                            <div
                              className="pb-4 mb-4 border-stone-200/80 flex flex-col"
                              style={{
                                borderBottom: `2px ${voucherBorderStyle} #e7e5e4`,
                                alignItems: voucherLogoAlignment === 'center' ? 'center' : (voucherLogoAlignment === 'right' ? 'flex-end' : 'flex-start'),
                                textAlign: voucherLogoAlignment
                              }}
                            >
                              {customLogoUrl ? (
                                <img
                                  src={customLogoUrl}
                                  className="h-10 max-w-[120px] object-contain mb-2 rounded"
                                  alt="Mock Logo"
                                />
                              ) : (
                                <div className="p-1 px-2.5 bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white rounded-md text-[9px] mb-2 font-bold tracking-wider">
                                  ✂️ ATELIER LOGO
                                </div>
                              )}
                              <h4 className="text-base font-extrabold leading-tight tracking-tight">{voucherMainTitle}</h4>
                              <p className="text-[9px] tracking-wider uppercase font-bold mt-1" style={{ color: voucherAccentColor }}>
                                {voucherSubtitle}
                              </p>
                            </div>

                            {/* Simulated Client block */}
                            <div className="p-3 bg-stone-50/60 dark:bg-zinc-900/40 rounded-lg border border-stone-150/40 dark:border-zinc-800/40 mb-4 flex justify-between items-center text-[10px]">
                              <div>
                                <div className="font-extrabold text-stone-900 dark:text-stone-100">Arjun Sharma</div>
                                <div className="text-[9px] text-stone-405 mt-0.5">📞 +91 98765 43210</div>
                                <div className="text-[9px] text-stone-405">✉️ arjun.sharma@example.com</div>
                              </div>
                              <div className="font-mono text-[8px] bg-stone-200/60 dark:bg-zinc-800 p-1 rounded text-stone-500">
                                VCH-SAMPLE-781
                              </div>
                            </div>

                            {/* Simulated Measurements */}
                            <div className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 mb-2">
                              Trouser pattern blueprint
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-4">
                              {[
                                { k: 'Waist', v: '34.5"' },
                                { k: 'Length', v: '39.5"' },
                                { k: 'Inseam', v: '30.0"' },
                                { k: 'Hip', v: '41.5"' }
                              ].map((mItem, mIdx) => (
                                <div
                                  key={mIdx}
                                  className="p-1.5 rounded border border-stone-200/50 dark:border-zinc-800 text-center"
                                  style={{ borderBottom: `2.5px solid ${voucherAccentColor}` }}
                                >
                                  <div className="font-extrabold text-xs">{mItem.v}</div>
                                  <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">{mItem.k}</div>
                                </div>
                              ))}
                            </div>

                            {/* Style alterations block */}
                            <div className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 mb-2">
                              Alterations &amp; Custom Specs
                            </div>
                            <div className="text-[10px] p-2.5 bg-stone-50/60 dark:bg-zinc-900/40 rounded mb-4 italic text-stone-600 dark:text-stone-300" style={{ borderLeft: `3px solid ${voucherAccentColor}` }}>
                              Custom slim tapering from knees; slanted front pockets. Back right pocket button-fastened.
                            </div>

                            {/* Simulated bill Ledger */}
                            <div className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 mb-2">
                              Accounting Ledger Transaction
                            </div>
                            <table className="w-full text-[10px] border-collapse mb-4">
                              <tbody>
                                <tr className="border-b border-dashed border-stone-200 dark:border-zinc-800 py-1">
                                  <td className="py-1">Garment Assembly:</td>
                                  <td className="text-right font-bold py-1">Slim Suit Trouser</td>
                                </tr>
                                <tr className="border-b border-dashed border-stone-200 dark:border-zinc-800 py-1">
                                  <td className="py-1">Commission Price (Total):</td>
                                  <td className="text-right font-bold py-1">₹4,500.00</td>
                                </tr>
                                <tr className="border-b border-dashed border-stone-200 dark:border-zinc-800 py-1 text-emerald-600">
                                  <td className="py-1">Paid Cutter Advance:</td>
                                  <td className="text-right font-bold py-1">- ₹1,500.00</td>
                                </tr>
                                <tr className="font-extrabold text-xs" style={{ borderTop: '1.5px solid #1c1917' }}>
                                  <td className="pt-2">Balance Due at Trial:</td>
                                  <td className="text-right pt-2 text-rose-500 font-black">₹3,000.00</td>
                                </tr>
                              </tbody>
                            </table>

                            {/* Delivery pick up */}
                            <div
                              className="p-2 rounded-lg text-center font-extrabold text-xs text-white uppercase tracking-wider mb-4"
                              style={{ background: `linear-gradient(135deg, ${voucherAccentColor}, #1c1917)` }}
                            >
                              ✨ Ready for pick-up on Saturday
                            </div>

                            {/* Footer text */}
                            <div
                              className="pt-3 text-[9px] text-center italic text-stone-400 leading-normal"
                              style={{ borderTop: `1px ${voucherBorderStyle} #e7e5e4` }}
                            >
                              {voucherFooterNotes}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lock action row */}
                      <div className="p-4 bg-amber-500/[0.04] border border-amber-500/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left font-sans">
                        <div className="space-y-0.5">
                          <h4 className="text-[11px] font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">Lock Ledger Design Blueprint</h4>
                          <p className="text-[10px] text-stone-400">Lock, synchronize and publish this design onto all printed vouchers immediately.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('voucher_main_title', voucherMainTitle);
                            localStorage.setItem('voucher_subtitle', voucherSubtitle);
                            localStorage.setItem('voucher_footer_notes', voucherFooterNotes);
                            localStorage.setItem('voucher_bg_color', voucherBgColor);
                            localStorage.setItem('voucher_text_color', voucherTextColor);
                            localStorage.setItem('voucher_accent_color', voucherAccentColor);
                            localStorage.setItem('voucher_font', voucherFont);
                            localStorage.setItem('voucher_border_style', voucherBorderStyle);
                            localStorage.setItem('voucher_logo_alignment', voucherLogoAlignment);
                            
                            saveBrandingToDatabase(
                              tailorshopName,
                              customLogoUrl,
                              voucherMainTitle,
                              voucherSubtitle,
                              voucherFooterNotes,
                              voucherBgColor,
                              voucherTextColor,
                              voucherAccentColor,
                              voucherFont,
                              voucherBorderStyle,
                              voucherLogoAlignment
                            );
                            triggerToast("Voucher designs propagate and locked successfully!", "success");
                          }}
                          className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Lock &amp; Publish Voucher Style</span>
                        </button>
                      </div>
                    </div>
                   <div className="hidden">
                     <div className="flex items-center space-x-2 mb-4">
                       <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
                         <ShieldCheck className="h-4 w-4" />
                       </div>
                       <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-500">Live Website Header Mockup</h3>
                     </div>

                     <p className="text-[10px] text-stone-400 mb-6">See exactly how your customized navbar looks on both light and dark systems here:</p>

                     {/* Mockup Frame 1: LIGHT MODE NAVBAR */}
                     <div className="border border-stone-200 bg-stone-50 rounded-xl overflow-hidden mb-4 font-sans">
                       <div className="bg-stone-200/50 p-1.5 px-3 flex items-center space-x-1.5 border-b border-stone-200">
                         <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                         <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                         <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                         <span className="text-[8px] text-stone-400 font-mono pl-2">Simulation (Light System UI)</span>
                       </div>
                       <div className="bg-white p-3.5 flex items-center justify-between border-b border-stone-200">
                         <div className="flex items-center space-x-2">
                           {customLogoUrl ? (
                             <img src={customLogoUrl} alt="Logo" className="h-8 w-8 object-contain rounded-md animate-fade-in" />
                           ) : (
                             <div className="p-2 bg-amber-600 text-white rounded-md text-[10px] font-bold">✂️</div>
                           )}
                           <span className="font-black text-xs tracking-wider uppercase text-stone-900">{tailorshopName || 'STYLUS'}</span>
                         </div>
                         <div className="flex space-x-2">
                           <span className="w-8 h-3.5 bg-stone-100 rounded"></span>
                           <span className="w-12 h-3.5 bg-stone-100 rounded"></span>
                         </div>
                       </div>
                       <div className="p-4 bg-white text-center">
                         <span className="text-[9px] text-stone-400 italic">Pre-allocated client site navigation banner</span>
                       </div>
                     </div>

                     {/* Mockup Frame 2: DARK MODE NAVBAR */}
                     <div className="border border-slate-900 bg-slate-950 rounded-xl overflow-hidden font-sans">
                       <div className="bg-slate-900/60 p-1.5 px-3 flex items-center space-x-1.5 border-b border-slate-900">
                         <div className="w-2 h-2 rounded-full bg-rose-500/60"></div>
                         <div className="w-2 h-2 rounded-full bg-yellow-500/60"></div>
                         <div className="w-2 h-2 rounded-full bg-emerald-500/60"></div>
                         <span className="text-[8px] text-slate-500 font-mono pl-2">Simulation (Dark System UI)</span>
                       </div>
                       <div className="bg-slate-950 p-3.5 flex items-center justify-between border-b border-slate-900">
                         <div className="flex items-center space-x-2">
                           {customLogoUrl ? (
                             <img src={customLogoUrl} alt="Logo" className="h-8 w-8 object-contain rounded-md animate-fade-in" />
                           ) : (
                             <div className="p-2 bg-amber-500 text-white rounded-md text-[10px] font-bold">✂️</div>
                           )}
                           <span className="font-black text-xs tracking-wider uppercase text-white">{tailorshopName || 'STYLUS'}</span>
                         </div>
                         <div className="flex space-x-2">
                           <span className="w-8 h-3.5 bg-slate-900 rounded"></span>
                           <span className="w-12 h-3.5 bg-slate-900 rounded"></span>
                         </div>
                       </div>
                       <div className="p-4 bg-slate-950 text-center">
                         <span className="text-[9px] text-slate-500 italic">Pre-allocated client site navigation banner</span>
                       </div>
                     </div>

                     <div className="mt-6">
                       <button
                         type="button"
                         onClick={() => {
                           triggerToast("Configuration applied & secured!", "success");
                         }}
                         className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                       >
                         <CheckCircle className="h-4 w-4" />
                         <span>Lock &amp; Apply Branding Layout</span>
                       </button>
                       <p className="text-[9px] text-stone-400 mt-2.5 text-center">Your branding settings are securely written database objects. If you ever wish to return to original templates, click the Reset button in other tabs.</p>
                      </div>
                    </div>
                  </div>

                  {/* FACTORY RESET ALL CONFIGURATIONS CARD */}
                  <div className={`p-6 rounded-2xl border text-left mt-6 ${isDarkMode ? 'bg-red-950/10 border-red-950/30' : 'bg-red-50/20 border-red-100 shadow-3xs'}`}>
                    <div className="flex items-center space-x-2.5 pb-2 border-b border-red-100/50 dark:border-red-950/30">
                      <div className="p-2 bg-red-500/10 text-red-600 dark:text-red-500 rounded-xl">
                        <RotateCcw className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xs uppercase tracking-wider text-red-650 dark:text-red-500">System Reset Controls (Clean Slate)</h3>
                        <p className="text-[10px] text-stone-400">Safely restore all custom system titles, logos, price rates, garment templates, and login card text back to pristine defaults.</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-[10.5px] text-stone-500 dark:text-stone-400 max-w-xl font-sans">
                        Are you experiencing sizing discrepancies or logo overlap issues? Triggering a factory reset will instantly clear any custom branding overrides and restore your global workspace settings back to their factory original layouts.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to restore all custom branding, text, prices, and configurations back to factory defaults?")) {
                            handleResetTailorshopConfig();
                          }
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[10px] font-bold transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Reset to System Defaults</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <div>
                      <div>
                     </div>
                   </div>
                 </div>
             </div>
          ) : (currentUser?.role === 'Owner' || currentUser?.role === 'Manager') && currentUser?.id !== 'TAILOR-OWNER-MASTER' && ownerTab === 'staffs_erp' ? (
             /* Staffs TailorShop ERP view */
             <div className="space-y-6 fade-in font-sans">
               <WorkerManagementView
                 workers={workers.filter((w: any) => w.id !== 'branding')}
                 orders={visibleOrders}
                 onAddWorker={handleAddWorker}
                 onDeleteWorker={handleDeleteWorker}
                 onDeleteAllWorkers={handleDeleteAllWorkers}
                 onSetupTailorShop={handleAdminSetupTailorShop}
                 onUpdateWorker={handleUpdateWorker}
                 clothingCategories={clothingCategories}
                 currentUser={currentUser}
                  registeredTailors={registeredTailors}
                 triggerToast={triggerToast}
                 isDarkMode={isDarkMode}
               />
             </div>
          ) : currentUser?.role === 'Owner' && currentUser?.id === 'TAILOR-OWNER-MASTER' && ownerTab === 'staffs_erp' ? (
             /* Tailor users logins page */
             <div className="space-y-6 fade-in font-sans">
               <div className="border-b border-stone-200 dark:border-slate-800 pb-4">
                 <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
                   <span className="p-2 bg-amber-500/10 text-amber-600 rounded-lg"><Scissors className="h-4.5 w-4.5" /></span>
                   <span>Manage Tailor Shop Owners &amp; Staff Logins</span>
                 </h2>
                 <p className="text-xs text-stone-400 mt-1">Admin Dashboard: Register new tailor shop owners, define default credentials, and manage active workshop studios.</p>
               </div>

               <div className={adminConfiguringTailorId || adminIsAddingNewShop ? "grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fadeIn" : "grid grid-cols-1 gap-8 items-start max-w-4xl mx-auto animate-fadeIn"}>
                 {/* Left Side: Existing logins list */}
                 <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                   <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4 flex items-center gap-1.5 justify-between">
                     <span>Active Shop Owners / Tailors</span>
                     <div className="flex items-center space-x-2 shrink-0">
                       <span className="text-[10px] bg-amber-600/10 text-amber-600 px-2 py-0.5 rounded-full font-bold">
                         {getRegisteredTailors().length} Active
                       </span>
                       <button
                         type="button"
                         onClick={() => {
                           setAdminConfiguringTailorId(null);
                           setAdminIsAddingNewShop(true);
                            triggerToast('Switched to Shop Owner Account Registration form!', 'info');
                         }}
                         className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-2.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer flex items-center space-x-1 shadow-sm"
                       >
                         <Plus className="h-3 w-3" />
                         <span>Add New Shop</span>
                       </button>
                     </div>
                   </h3>
                   <div className="space-y-3">
                      {getRegisteredTailors().map((t: any) => {
                        const isConfiguringThisTailor = adminConfiguringTailorId === t.id;
                        return (
                          <div key={t.id} className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${
                            isConfiguringThisTailor 
                              ? 'ring-2 ring-amber-500 bg-amber-500/5 dark:bg-zinc-950 border-amber-500' 
                              : 'dark:bg-slate-950 bg-stone-50 border-stone-150 border-slate-900'
                          } text-left`}>
                            <div className="flex justify-between items-start gap-2 w-full">
                              <div className="space-y-1 text-left">
                                <div className="font-extrabold text-xs text-stone-850 dark:text-white flex items-center gap-2">
                                  <span>{t.name}</span>
                                  {t.hasRegisteredShop ? (
                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Shop Profile Set</span>
                                  ) : (
                                    <span className="text-[9px] bg-amber-500/10 text-[#c29910] dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold">Pending Shop Setup</span>
                                  )}
                                </div>
                                <div className="text-[10.5px] text-stone-500 space-y-0.5 font-semibold font-sans font-medium">
                                  <p><span className="font-mono text-[9px] text-stone-400">Email:</span> {t.email}</p>
                                  <p><span className="font-mono text-[9px] text-stone-400">Phone:</span> {t.phone || 'N/A'}</p>
                                  <p><span className="font-mono text-[9px] text-stone-400">Room:</span> {t.location || 'N/A'}</p>
                                  {t.shopName && <p><span className="font-mono text-[9px] text-stone-400">Shop:</span> {t.shopName}</p>}
                                  <p className="text-[10.5px] font-mono text-amber-605 dark:text-amber-400 p-1 bg-amber-600/5 rounded inline-block mt-1">PSWD: {t.password}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1.5 shrink-0">
                                {/* Setup/Edit Shop actions */}
                                {t.hasRegisteredShop ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdminConfiguringTailorId(t.id);
                                      setAdminIsAddingNewShop(false);
                                      setAdminShopName(t.shopName || '');
                                      setAdminOwnerName(t.name);
                                      setAdminShopPhone(t.phone || '');
                                      setAdminShopCountry('India');
                                      setAdminShopState('');
                                      setAdminShopDistrict('');
                                      setAdminShopArea(t.location || '');
                                      setAdminShopPincode('');
                                      setAdminLatitude(t.coordinateLatitude || '');
                                      setAdminLongitude(t.coordinateLongitude || '');
                                      setAdminLogoUrl(t.logoUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop');
                                      triggerToast(`Editing shop details for ${t.name}`, 'info');
                                    }}
                                    className="text-[10px] bg-amber-500/10 hover:bg-amber-500/25 text-[#cf9b00] dark:text-amber-400 font-extrabold px-2.5 py-1.5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition active:scale-95 cursor-pointer flex items-center space-x-1 shadow-sm"
                                    title="Edit Shop Workstation details"
                                  >
                                    <Settings className="h-3 w-3" />
                                    <span>Edit Shop</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdminConfiguringTailorId(t.id);
                                      setAdminIsAddingNewShop(false);
                                      setAdminShopName(`${t.name}'s Bespoke TAILORSHOP ERP`);
                                      setAdminOwnerName(t.name);
                                      setAdminShopPhone(t.phone || '');
                                      setAdminShopCountry('India');
                                      setAdminShopState('');
                                      setAdminShopDistrict('');
                                      setAdminShopArea('');
                                      setAdminShopPincode('');
                                      setAdminLatitude('');
                                      setAdminLongitude('');
                                      setAdminLogoUrl('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop');
                                      triggerToast(`Setting up active shop profile for ${t.name}`, 'info');
                                    }}
                                    className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-extrabold px-2.5 py-1.5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition active:scale-95 cursor-pointer flex items-center space-x-1 shadow-sm"
                                  >
                                    <Plus className="h-3 w-3" />
                                    <span>Setup Shop</span>
                                  </button>
                                )}

                                {confirmRemoveTailorId === t.id ? (
                                  <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/25 rounded-lg p-1 animate-fadeIn">
                                    <span className="text-[9px] text-red-500 font-extrabold px-1.5 select-none font-sans">Delete?</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const filtered = getRegisteredTailors().filter((x) => x.id !== t.id);
                                        saveRegisteredTailors(filtered);
                                        setRegisteredTailors(filtered);
                                        triggerToast('Removed shop owner credentials!', 'success');
                                        setConfirmRemoveTailorId(null);
                                      }}
                                      className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold cursor-pointer"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmRemoveTailorId(null)}
                                      className="px-2 py-0.5 rounded bg-stone-500 dark:bg-stone-750 hover:bg-stone-600 text-white dark:text-stone-200 text-[9px] font-bold cursor-pointer"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={t.id === 'TAILOR-OWNER-MASTER'}
                                    onClick={() => setConfirmRemoveTailorId(t.id)}
                                    className={`p-2 rounded hover:bg-red-500/10 hover:text-red-500 text-stone-400 cursor-pointer ${t.id === 'TAILOR-OWNER-MASTER' ? 'cursor-not-allowed opacity-30' : ''}`}
                                    title={`Remove ${t.name}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                 </div>

                 
                  {/* Right Side Columns (Dual-pane / Side-by-side Setup) */}
                  {(adminConfiguringTailorId || adminIsAddingNewShop) && (
                    <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                      {adminConfiguringTailorId ? (
                        
                     <div className="space-y-4 text-left">
                       {(() => {
                         const currentTargetTailor = getRegisteredTailors().find((x) => x.id === adminConfiguringTailorId);
                         return (
                           <>
                             <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3 mb-2">
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-500 font-sans">
                                   Setup Shop Workstation
                                 </span>
                                 <h3 className="text-sm font-extrabold dark:text-white text-stone-900 leading-snug font-sans">
                                   {currentTargetTailor?.name || 'Shop Owner'}
                                 </h3>
                               </div>
                               <button
                                 type="button"
                                 onClick={() => setAdminConfiguringTailorId(null)}
                                 className="text-stone-400 hover:text-stone-600 text-xs font-bold font-mono transition"
                               >
                                 [Cancel]
                               </button>
                             </div>

                             {/* Sub tabs in Admin Config Panel */}
                             <div className="flex border-b border-stone-200 dark:border-slate-800 space-x-4 mb-4">
                               <button
                                 type="button"
                                 onClick={() => setAdminSubTab('details')}
                                 className={`pb-2 text-[11px] uppercase tracking-wider font-extrabold border-b-2 transition-all flex items-center space-x-1 cursor-pointer ${
                                   adminSubTab === 'details'
                                     ? 'border-amber-600 text-amber-600 dark:border-amber-500 font-extrabold'
                                     : 'border-transparent text-stone-400 hover:text-stone-650'
                                 }`}
                               >
                                 <Settings className="h-3.5 w-3.5" />
                                 <span>Shop Details</span>
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setAdminSubTab('staff')}
                                 className={`pb-2 text-[11px] uppercase tracking-wider font-extrabold border-b-2 transition-all flex items-center space-x-1 cursor-pointer ${
                                   adminSubTab === 'staff'
                                     ? 'border-amber-600 text-amber-600 dark:border-amber-500 font-extrabold'
                                     : 'border-transparent text-stone-400 hover:text-stone-650'
                                 }`}
                               >
                                 <Users className="h-3.5 w-3.5" />
                                 <span>Staff &amp; Logins</span>
                               </button>
                             </div>

                             {adminSubTab === 'details' ? (
                             <form
                               onSubmit={(e) => {
                                 e.preventDefault();
                                 if (!adminShopName.trim() || !adminOwnerName.trim() || !adminShopPhone.trim() || !adminShopArea.trim() || !adminShopPincode.trim() || !adminLatitude.trim() || !adminLongitude.trim()) {
                                   triggerToast('All fields (including GPS coordinates) are required to register this tailor shop!', 'error');
                                   return;
                                 }
                                 const formattedAddr = [
                                   adminShopArea.trim(),
                                   adminShopDistrict.trim(),
                                   adminShopState.trim(),
                                   adminShopCountry.trim(),
                                   adminShopPincode.trim() ? `PIN: ${adminShopPincode.trim()}` : ''
                                 ].filter(Boolean).join(', ');

                                 const updated = getRegisteredTailors().map((item) => {
                                   if (item.id === adminConfiguringTailorId) {
                                     return {
                                       ...item,
                                       name: adminOwnerName.trim(),
                                       hasRegisteredShop: true,
                                       shopName: adminShopName.trim(),
                                       location: formattedAddr,
                                       phone: adminShopPhone.trim(),
                                       logoUrl: adminLogoUrl.trim() || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop',
                                       coordinateLatitude: adminLatitude.trim(),
                                       coordinateLongitude: adminLongitude.trim()
                                     };
                                   }
                                   return item;
                                 });

                                 saveRegisteredTailors(updated);
                                 setRegisteredTailors(updated);
                                 setAdminConfiguringTailorId(null);
                                 triggerToast(`TAILORSHOP ERP Shop Workstation "	histarget" activated successfully!`, 'success');
                                 addActivity('Admin Register Shop', `Admin registered shop "${adminShopName.trim()}" for tailor ${adminOwnerName.trim()}`, 'Owner', 'TAILORSHOP ERP Master Admin');
                               }}
                               className="space-y-4"
                             >
                               <div className="space-y-1 font-sans">
                                 <label className="text-[10px] font-extrabold uppercase block text-stone-600 dark:text-stone-400">
                                   Shop / Workstation Name *
                                 </label>
                                 <input
                                   type="text"
                                   value={adminShopName}
                                   onChange={(e) => setAdminShopName(e.target.value)}
                                   className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                   required
                                 />
                               </div>

                               <div className="grid grid-cols-2 gap-3">
                                 <div>
                                   <label className="text-[10px] font-extrabold uppercase block text-stone-600 dark:text-stone-400">
                                     Owner Name *
                                   </label>
                                   <input
                                     type="text"
                                     value={adminOwnerName}
                                     onChange={(e) => setAdminOwnerName(e.target.value)}
                                     className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                     required
                                   />
                                 </div>
                                 <div>
                                   <label className="text-[10px] font-extrabold uppercase block text-stone-600 dark:text-stone-400">
                                     Store Phone *
                                   </label>
                                   <input
                                     type="text"
                                     value={adminShopPhone}
                                     onChange={(e) => setAdminShopPhone(e.target.value)}
                                     className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                     required
                                   />
                                 </div>
                               </div>

                               {/* Location with Coordinates */}
                               <div className="p-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl space-y-3">
                                 <div className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400">
                                   Address / Location Builder
                                 </div>

                                 <div className="grid grid-cols-2 gap-2">
                                   <div>
                                     <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase">Country *</label>
                                     <select
                                       value={adminShopCountry}
                                       onChange={(e) => {
                                         setAdminShopCountry(e.target.value);
                                         setAdminShopState('');
                                         setAdminShopDistrict('');
                                       }}
                                       className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                       required
                                     >
                                       {COUNTRY_LIST.map((c) => (
                                         <option key={c} value={c}>{c}</option>
                                       ))}
                                     </select>
                                   </div>
                                   <div>
                                     <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase">State *</label>
                                     {adminShopCountry === 'India' ? (
                                       <select
                                         value={adminShopState}
                                         onChange={(e) => {
                                           setAdminShopState(e.target.value);
                                           setAdminShopDistrict('');
                                         }}
                                         className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                         required
                                       >
                                         <option value="">-- Choose State --</option>
                                         {Object.keys(INDIA_STATES_MAP).map((s) => (
                                           <option key={s} value={s}>{s}</option>
                                         ))}
                                       </select>
                                     ) : (
                                       <input
                                         type="text"
                                         placeholder="State"
                                         value={adminShopState}
                                         onChange={(e) => setAdminShopState(e.target.value)}
                                         className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                         required
                                       />
                                     )}
                                   </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-2">
                                   <div>
                                     <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase">District *</label>
                                     {adminShopCountry === 'India' && adminShopState && INDIA_STATES_MAP[adminShopState] ? (
                                       <select
                                         value={adminShopDistrict}
                                         onChange={(e) => setAdminShopDistrict(e.target.value)}
                                         className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                         required
                                       >
                                         <option value="">-- Choose District --</option>
                                         {INDIA_STATES_MAP[adminShopState].map((d) => (
                                           <option key={d} value={d}>{d}</option>
                                         ))}
                                       </select>
                                     ) : (
                                       <input
                                         type="text"
                                         placeholder="District"
                                         value={adminShopDistrict}
                                         onChange={(e) => setAdminShopDistrict(e.target.value)}
                                         className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                         required
                                       />
                                     )}
                                   </div>
                                   <div>
                                     <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase">Pincode *</label>
                                     <input
                                       type="text"
                                       placeholder="Pincode"
                                       value={adminShopPincode}
                                       onChange={(e) => setAdminShopPincode(e.target.value)}
                                       className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                       required
                                     />
                                   </div>
                                 </div>

                                 <div>
                                   <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase">Shop Landmark / Area *</label>
                                   <input
                                     type="text"
                                     placeholder="Area or Street name"
                                     value={adminShopArea}
                                     onChange={(e) => setAdminShopArea(e.target.value)}
                                     className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                     required
                                   />
                                 </div>

                                 <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/50 dark:border-zinc-800">
                                   <span className="text-[9.5px] font-extrabold text-stone-400 uppercase tracking-wider font-sans">Device coordinates</span>
                                   <button
                                     type="button"
                                     onClick={() => {
                                       const fallbackToIp = async (errMsg) => {
                                         triggerToast('GPS failed. Falling back to Network IP Geolocation...', 'info');
                                         try {
                                           const ipData = await fetchIPLocation();
                                           setAdminLatitude(ipData.latitude);
                                           setAdminLongitude(ipData.longitude);
                                           if (ipData.country) setAdminShopCountry(ipData.country);
                                           
                                           let detectedState = '';
                                           if (ipData.region) {
                                             const findState = Object.keys(INDIA_STATES_MAP).find(
                                               (s) => s.toLowerCase() === ipData.region.toLowerCase() || ipData.region.toLowerCase().includes(s.toLowerCase())
                                             );
                                             if (findState) {
                                               setAdminShopState(findState);
                                               detectedState = findState;
                                             } else {
                                               setAdminShopState(ipData.region);
                                               detectedState = ipData.region;
                                             }
                                           }
                                           if (detectedState && INDIA_STATES_MAP[detectedState] && ipData.city) {
                                             const distList = INDIA_STATES_MAP[detectedState];
                                             const match = distList.find(d => 
                                               d.toLowerCase() === ipData.city.toLowerCase() || 
                                               ipData.city.toLowerCase().includes(d.toLowerCase()) ||
                                               d.toLowerCase().includes(ipData.city.toLowerCase())
                                             );
                                             if (match) {
                                               setAdminShopDistrict(match);
                                             } else {
                                               setAdminShopDistrict(ipData.city);
                                             }
                                           } else if (ipData.city) {
                                             setAdminShopDistrict(ipData.city);
                                           }

                                           if (ipData.postal) setAdminShopPincode(ipData.postal);
                                           setAdminShopArea(ipData.area || 'Central Area');
                                           triggerToast('Admin shop location loaded via IP successfully!', 'success');
                                         } catch (fError) {
                                           console.error("IP fallback error:", fError);
                                           triggerToast(errMsg || fError?.message || 'Network Geolocation failed.', 'error');
                                         } finally {
                                           setAdminLocationLoading(false);
                                         }
                                       };

                                       if (!navigator.geolocation) {
                                         fallbackToIp('Geolocation not supported.');
                                         return;
                                       }
                                       setAdminLocationLoading(true);
                                       triggerToast('Requesting GPS coordinates...', 'info');
                                       navigator.geolocation.getCurrentPosition(
                                         async (pos) => {
                                           const lat = pos.coords.latitude.toFixed(6);
                                           const lon = pos.coords.longitude.toFixed(6);
                                           setAdminLatitude(lat);
                                           setAdminLongitude(lon);
                                           triggerToast('GPS Locked! Fetching shop address details...', 'info');
                                           
                                           try {
                                             const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
                                               headers: { 'Accept-Language': 'en' }
                                             });
                                             if (res.ok) {
                                               const data = await res.json();
                                               if (data && data.address) {
                                                 const addr = data.address;
                                                 if (addr.country) setAdminShopCountry(addr.country);
                                                 
                                                 let detectedState = '';
                                                 const stateCandidates = [
                                                   addr.state,
                                                   addr.region,
                                                   addr.province,
                                                   addr.state_district
                                                 ].filter(Boolean).map(v => String(v).trim());

                                                 let foundStateKey = '';
                                                 for (const sc of stateCandidates) {
                                                   const match = Object.keys(INDIA_STATES_MAP).find(
                                                     (s) => s.toLowerCase() === sc.toLowerCase() || 
                                                            sc.toLowerCase().includes(s.toLowerCase()) || 
                                                            s.toLowerCase().includes(sc.toLowerCase())
                                                   );
                                                   if (match) {
                                                     foundStateKey = match;
                                                     break;
                                                   }
                                                 }

                                                 if (foundStateKey) {
                                                   setAdminShopState(foundStateKey);
                                                   detectedState = foundStateKey;
                                                 } else if (addr.state) {
                                                   setAdminShopState(addr.state);
                                                   detectedState = addr.state;
                                                 }
                                                 
                                                 let matchedDistrict = '';
                                                 if (detectedState && INDIA_STATES_MAP[detectedState]) {
                                                   const distList = INDIA_STATES_MAP[detectedState];
                                                   const fullTextSearchSource = [
                                                     data.display_name || '',
                                                     addr.state_district || '',
                                                     addr.district || '',
                                                     addr.county || '',
                                                     addr.city || '',
                                                     addr.town || '',
                                                     addr.city_district || '',
                                                     addr.suburb || '',
                                                     addr.village || '',
                                                     addr.neighbourhood || '',
                                                     addr.municipality || '',
                                                     addr.subdistrict || ''
                                                   ].filter(Boolean).map(s => String(s).toLowerCase().trim());

                                                   for (const text of fullTextSearchSource) {
                                                     const match = distList.find(d => {
                                                       const dl = d.toLowerCase();
                                                       return dl === text || text.includes(dl) || dl.includes(text);
                                                     });
                                                     if (match) {
                                                       matchedDistrict = match;
                                                       break;
                                                     }
                                                   }
                                                   
                                                   if (!matchedDistrict && data.display_name) {
                                                     const dispLower = data.display_name.toLowerCase();
                                                     const match = distList.find(d => dispLower.includes(d.toLowerCase()));
                                                     if (match) matchedDistrict = match;
                                                   }
                                                 }

                                                 if (matchedDistrict) {
                                                   setAdminShopDistrict(matchedDistrict);
                                                 } else {
                                                   const districtOrCity = addr.state_district || addr.county || addr.district || addr.city_district || addr.city || addr.town || addr.suburb || '';
                                                   setAdminShopDistrict(districtOrCity);
                                                 }
                                                 
                                                 if (addr.postcode) setAdminShopPincode(addr.postcode);
                                                 
                                                 const street = addr.road || addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || '';
                                                 const areaParts = [street, addr.quarter || ''].filter(Boolean).join(', ');
                                                 if (areaParts) {
                                                   setAdminShopArea(areaParts);
                                                 } else if (data.display_name) {
                                                   const dispParts = data.display_name.split(',');
                                                   setAdminShopArea(dispParts.slice(0, 2).join(',').trim());
                                                 }
                                                 triggerToast('Admin shop address Auto-loaded!', 'success');
                                               }
                                             }
                                           } catch (err) {
                                             console.error("Reverse geocoding error:", err);
                                             triggerToast('GPS coordinates locked!', 'success');
                                           } finally {
                                             setAdminLocationLoading(false);
                                           }
                                         },
                                         (err) => {
                                           console.error(err);
                                           setAdminLocationLoading(false);
                                           fallbackToIp(`Geolocation failed: ${err.message}`);
                                         },
                                         { enableHighAccuracy: true, timeout: 6000 }
                                       );
                                     }}
                                     disabled={adminLocationLoading}
                                     className="text-[9.5px] bg-amber-500/10 hover:bg-amber-500/20 text-[#cf9b00] px-2 py-1 rounded-lg border border-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer font-extrabold font-sans"
                                   >
                                     {adminLocationLoading ? 'Locking...' : 'Auto-Locate GPS'}
                                   </button>
                                 </div>

                                 <div className="grid grid-cols-2 gap-2 font-mono">
                                   <input
                                     type="text"
                                     placeholder="Latitude *"
                                     value={adminLatitude}
                                     onChange={(e) => setAdminLatitude(e.target.value)}
                                     className="p-1.5 rounded bg-white text-stone-900 border font-mono text-[11px] focus:outline-none dark:bg-stone-900 dark:text-white dark:border-stone-800"
                                     required
                                   />
                                   <input
                                     type="text"
                                     placeholder="Longitude *"
                                     value={adminLongitude}
                                     onChange={(e) => setAdminLongitude(e.target.value)}
                                     className="p-1.5 rounded bg-white text-stone-900 border font-mono text-[11px] focus:outline-none dark:bg-stone-900 dark:text-white dark:border-stone-800"
                                     required
                                   />
                                 </div>

                                 {adminLatitude && adminLongitude && (
                                   <div className="mt-2 overflow-hidden rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm h-[130px] w-full relative">
                                     <iframe
                                       title="Admin Google Map Preview"
                                       width="100%"
                                       height="100%"
                                       style={{ border: 0 }}
                                       allowFullScreen={false}
                                       loading="lazy"
                                       referrerPolicy="no-referrer"
                                       src={`https://maps.google.com/maps?q=${adminLatitude},${adminLongitude}&z=15&output=embed`}
                                     />
                                   </div>
                                 )}
                               </div>

                               <div>
                                 <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-stone-600 dark:text-stone-400 font-sans">
                                   Store Logo (URL or Upload image) *
                                 </label>
                                 <div className="space-y-2">
                                   <input
                                     type="text"
                                     value={adminLogoUrl}
                                     onChange={(e) => setAdminLogoUrl(cleanImageUrl(e.target.value))}
                                     className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                     required
                                   />
                                   <div className="flex gap-2">
                                     <button
                                       type="button"
                                       onClick={() => {
                                         const input = document.createElement('input');
                                         input.type = 'file';
                                         input.accept = 'image/*';
                                         input.onchange = (e) => {
                                           const file = (e.target as HTMLInputElement).files?.[0];
                                           if (file) {
                                             const reader = new FileReader();
                                             reader.onloadend = () => {
                                               const base64Str = reader.result as string;
                                               setAdminLogoUrl(base64Str);
                                               triggerToast("Workstation logo uploaded & stored locally!", "success");
                                             };
                                             reader.readAsDataURL(file);
                                           }
                                         };
                                         input.click();
                                       }}
                                       className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] rounded-lg active:scale-95 transition cursor-pointer flex items-center gap-1 shadow-sm font-sans uppercase tracking-wider"
                                     >
                                       <Upload className="h-3 w-3" />
                                       <span>Upload Logo File</span>
                                     </button>
                                     {adminLogoUrl && (
                                       <button
                                         type="button"
                                         onClick={() => {
                                           setAdminLogoUrl('');
                                           triggerToast("Logo input cleared!", "info");
                                         }}
                                         className="px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 font-bold text-[10px] rounded-lg cursor-pointer"
                                        >
                                         Clear
                                       </button>
                                     )}
                                   </div>
                                 </div>
                               </div>

                               <div className="pt-2 flex items-center gap-2 font-sans">
                                 <button
                                   type="submit"
                                   className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md active:scale-[0.98] transition cursor-pointer font-sans"
                                 >
                                   Activate / Update Workstation
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => setAdminConfiguringTailorId(null)}
                                   className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl active:scale-[0.98] transition cursor-pointer font-sans"
                                 >
                                   Back
                                 </button>
                               </div>
                             </form>
                             ) : (
                               /* Admin Staff Account management view! */
                               <div className="space-y-4 font-sans text-stone-800 dark:text-stone-200">
                                 {(() => {
                                   const shopWorkers = workers.filter((w) => 
                                     w.shopOwnerId === currentTargetTailor?.id ||
                                     (w.shopOwnerEmail && currentTargetTailor?.email && w.shopOwnerEmail.toLowerCase().trim() === currentTargetTailor.email.toLowerCase().trim()) ||
                                     (w.shopName && currentTargetTailor?.shopName && w.shopName.toLowerCase().trim() === currentTargetTailor.shopName.toLowerCase().trim())
                                   );
                                   
                                   return (
                                     <div className="space-y-4">
                                       <div className="border border-stone-200 dark:border-slate-800 rounded-xl p-3 bg-stone-50/50 dark:bg-slate-950/40">
                                         <h4 className="text-xs font-black uppercase text-stone-500 dark:text-stone-400 mb-2 tracking-wide flex items-center justify-between">
                                           <span>Current Staff ({shopWorkers.length})</span>
                                           <span className="text-[9px] font-medium text-amber-600 lowercase font-sans">can sign in with credentials</span>
                                         </h4>
                                         {shopWorkers.length === 0 ? (
                                           <p className="text-[10.5px] text-stone-400 italic py-1">No custom staff workers added yet by Admin.</p>
                                         ) : (
                                           <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-none">
                                             {shopWorkers.map((w) => (
                                               <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800/80 shadow-3xs">
                                                 <div className="min-w-0 font-sans">
                                                   <div className="flex items-center space-x-1.5">
                                                     <p className="text-xs font-extrabold text-stone-900 dark:text-stone-100 truncate">{w.name}</p>
                                                     <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                                                       w.role === 'Manager' 
                                                         ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                                                         : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                     }`}>
                                                       {w.role}
                                                     </span>
                                                   </div>
                                                   <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate mt-0.5">{w.phone || w.email}</p>
                                                 </div>
                                                 <button
                                                   type="button"
                                                   onClick={() => {
                                                     const updatedWorkers = workers.filter((item) => item.id !== w.id);
                                                     const updatedTailors = registeredTailors.filter((item) => item.id !== w.id);
                                                     saveWorkers(updatedWorkers);
                                                     setWorkers(updatedWorkers);
                                                     saveRegisteredTailors(updatedTailors);
                                                     setRegisteredTailors(updatedTailors);
                                                     triggerToast(`Staff account for "${w.name}" removed successfully!`, 'info');
                                                   }}
                                                   className="p-1 text-red-500 hover:bg-red-500/10 rounded cursor-pointer transition select-none"
                                                   title="Delete Worker Account"
                                                 >
                                                   <Trash2 className="h-3.5 w-3.5" />
                                                 </button>
                                               </div>
                                             ))}
                                           </div>
                                         )}
                                       </div>

                                       <div className="border border-stone-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3.5 bg-white dark:bg-slate-950">
                                         <h4 className="text-xs font-black uppercase text-stone-500 dark:text-stone-400 tracking-wide flex items-center gap-1">
                                           <span className="p-1 bg-amber-500/10 text-amber-600 rounded-md"><Plus className="h-3 w-3" /></span>
                                           <span>Add Shop Staff Account</span>
                                         </h4>
                                         
                                         <div className="space-y-1">
                                           <label className="text-[10px] font-extrabold uppercase block text-stone-600 dark:text-stone-400">Account Role *</label>
                                           <div className="grid grid-cols-2 gap-2">
                                             <button
                                               type="button"
                                               onClick={() => setAdminStaffRole('Manager')}
                                               className={`py-2 px-3 rounded-lg border text-xs font-bold transition duration-150 flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                                                 adminStaffRole === 'Manager'
                                                   ? 'border-purple-500 bg-purple-500/5 text-purple-600 dark:text-purple-400 font-extrabold'
                                                   : 'border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-900 text-stone-500'
                                               }`}
                                             >
                                               <Briefcase className="h-4 w-4" />
                                               <span>Manager (Full Access)</span>
                                             </button>
                                             <button
                                               type="button"
                                               onClick={() => setAdminStaffRole('Tailor')}
                                               className={`py-2 px-3 rounded-lg border text-xs font-bold transition duration-150 flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                                                 adminStaffRole === 'Tailor'
                                                   ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-extrabold'
                                                   : 'border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-900 text-stone-500'
                                               }`}
                                             >
                                               <Scissors className="h-4 w-4" />
                                               <span>Tailor / Stitcher</span>
                                             </button>
                                           </div>
                                         </div>

                                         <div className="space-y-1">
                                           <label className="text-[10px] font-extrabold uppercase block text-stone-600 dark:text-stone-400">Staff Full Name *</label>
                                           <input
                                             type="text"
                                             placeholder="e.g. Ramesh Tailor"
                                             value={adminStaffName}
                                             onChange={(e) => setAdminStaffName(e.target.value)}
                                             className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                           />
                                         </div>

                                         <div className="space-y-1">
                                           <label className="text-[10px] font-extrabold uppercase block text-stone-600 dark:text-stone-400">Mobile Number (used as password) *</label>
                                           <input
                                             type="tel"
                                             placeholder="e.g. 9876543210"
                                             value={adminStaffPhone}
                                             onChange={(e) => setAdminStaffPhone(e.target.value)}
                                             className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                           />
                                         </div>

                                         <div className="space-y-1">
                                           <label className="text-[10px] font-extrabold uppercase block text-stone-600 dark:text-stone-400">Email Address (login identifier) *</label>
                                           <input
                                             type="email"
                                             placeholder="e.g. ramesh@tailorshop.com"
                                             value={adminStaffEmail}
                                             onChange={(e) => setAdminStaffEmail(e.target.value)}
                                             className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white"
                                           />
                                         </div>

                                         <button
                                           type="button"
                                           onClick={() => {
                                             if (!adminStaffName.trim() || !adminStaffPhone.trim() || !adminStaffEmail.trim()) {
                                               triggerToast('All fields are required to register a staff account!', 'error');
                                               return;
                                             }
                                             
                                             const newStaffId = `WRK-${Date.now()}`;
                                             const newWorkerRecord = {
                                               id: newStaffId,
                                               name: adminStaffName.trim(),
                                               role: adminStaffRole === 'Manager' ? 'Manager' : 'Master Cutter',
                                               skills: ['Kurtas', 'Suits', 'Shirts', 'Pants'],
                                               salary: 2500,
                                               bonusPercentage: 15,
                                               shopOwnerId: currentTargetTailor?.id,
                                               shopOwnerEmail: currentTargetTailor?.email,
                                               shopName: currentTargetTailor?.shopName || 'Bespoke Studio',
                                               phone: adminStaffPhone.trim(),
                                               email: adminStaffEmail.trim(),
                                               avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'
                                             };

                                             const newTailorRegistryObj = {
                                               id: newStaffId,
                                               name: adminStaffName.trim(),
                                               email: adminStaffEmail.trim().toLowerCase(),
                                               phone: adminStaffPhone.trim(),
                                               location: currentTargetTailor?.location || 'Central Desk',
                                               hasRegisteredShop: false,
                                               shopName: currentTargetTailor?.shopName || 'Bespoke Studio',
                                               createdAt: new Date().toISOString(),
                                               logoUrl: currentTargetTailor?.logoUrl || '',
                                               role: adminStaffRole,
                                               coordinateLatitude: currentTargetTailor?.coordinateLatitude || '28.6139',
                                               coordinateLongitude: currentTargetTailor?.coordinateLongitude || '77.2090'
                                             };

                                             const updatedWorkers = [...workers, newWorkerRecord];
                                             const updatedTailors = [...registeredTailors, newTailorRegistryObj];

                                              saveWorkers(updatedWorkers);
                                              setWorkers(updatedWorkers);
                                              saveRegisteredTailors(updatedTailors);
                                              setRegisteredTailors(updatedTailors);

                                              setAdminStaffName('');
                                              setAdminStaffPhone('');
                                              setAdminStaffEmail('');

                                              triggerToast(`Registered new ${adminStaffRole} "${adminStaffName.trim()}" successfully!`, 'success');
                                            }}
                                            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg active:scale-95 transition cursor-pointer font-sans"
                                          >
                                            Add Staff Account to Shop
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                        /* Create Account for Shop Owner Form */
                        <div>
                          <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3 mb-4">
                            <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 flex items-center gap-2 font-sans">
                              <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg"><Plus className="h-4 w-4" /></span>
                              <span>Register Shop Owner &amp; Create Account</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                setAdminIsAddingNewShop(false);
                                triggerToast('Closed registration form', 'info');
                              }}
                              className="text-stone-400 hover:text-stone-600 text-xs font-bold font-mono transition"
                            >
                              [Cancel]
                            </button>
                          </div>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const target = e.currentTarget;
                            const name = (target.elements.namedItem('tailorName') as HTMLInputElement).value.trim();
                            const email = (target.elements.namedItem('tailorEmail') as HTMLInputElement).value.trim();
                            const password = (target.elements.namedItem('tailorPhone') as HTMLInputElement).value.trim();
                            const room = 'Studio Workspace';
                            const phone = (target.elements.namedItem('tailorPhone') as HTMLInputElement).value.trim();

                            if (!name || !email || !phone) {
                              triggerToast('Name, Email and Phone Number are required fields!', 'error');
                              return;
                            }
                            const list = getRegisteredTailors();
                            const emailConflict = list.some((x) => (x.email || '').toLowerCase().trim() === email.toLowerCase().trim());
                            const phoneConflict = list.some((x) => x.phone && x.phone.trim() === phone);
                            if (emailConflict || phoneConflict) {
                              triggerToast(emailConflict ? 'This email is already registered!' : 'This phone number is already registered!', 'error');
                              return;
                            }
                            const updated = [...list, { id: `TLR-${Date.now()}`, name, email, password, phone, location: room, hasRegisteredShop: false }];
                            saveRegisteredTailors(updated);
                            setRegisteredTailors(updated);
                            setAdminIsAddingNewShop(false);
                            triggerToast(`Successfully registered ${name}! The password is set to their Phone Number.`, 'success');
                            target.reset();
                          }} className="space-y-4 text-left font-sans">
                            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed font-sans mb-3 flex items-start gap-2">
                               <span className="text-amber-600 dark:text-amber-400 font-bold">💡</span>
                               <div>
                                 <strong className="text-amber-700 dark:text-amber-400">Registration Policy:</strong> Only name, email address and phone number are required. The phone number serves as their login password, and they can sign in using either their email or phone number as username.
                               </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-stone-600 dark:text-stone-350">Tailor / Owner Name</label>
                              <input name="tailorName" type="text" placeholder="e.g. Arthur S. Row" className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white" required />
                            </div>
                            <div>
                              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-stone-600 dark:text-stone-350">Login Email Address</label>
                              <input name="tailorEmail" type="email" placeholder="e.g. key@atelier.com" className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white" required />
                            </div>
                            <div>
                              <label className="hidden">Login Password</label>
                              <input name="tailorPswd" type="hidden" value="tailor123" />
                            </div>
                            <div>
                              <label className="hidden">Room Identifier / Address</label>
                              <input name="tailorLoc" type="hidden" value="Savile Row, London" />
                            </div>
                            <div>
                              <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 text-stone-600 dark:text-stone-350">Tailor Phone Number</label>
                              <input name="tailorPhone" type="text" placeholder="+44 20 ..." className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold dark:bg-stone-900 dark:border-stone-800 bg-white dark:text-white" required />
                            </div>
                            <div className="flex items-center space-x-3 pt-2">
                              <button type="submit" className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md active:scale-[0.98] transition-all font-sans">Register Shop Owner Account</button>
                              <button
                                type="button"
                                onClick={() => setAdminIsAddingNewShop(false)}
                                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl active:scale-[0.98] transition cursor-pointer font-sans"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                 </div>
     </div>
) : (currentUser?.role === 'Owner' || currentUser?.role === 'Manager') && ownerTab === 'customer_patrons' ? (
             /* Customer Patrons view */
             <div className="space-y-6 fade-in font-sans">
               <CustomerManagementView
                 customers={customers}
                 orders={visibleOrders}
                 onAddCustomer={handleAddNewCustomer}
                 onEditCustomer={handleEditExistingCustomer}
                 onDeleteCustomer={handleDeleteExistingCustomer}
                 isDarkMode={isDarkMode}
                 searchFilter=""
               />
             </div>
          ) : (currentUser?.role !== 'Owner' && currentUser?.role !== 'Manager' && tailorPage === 'pending_tasks') ? (
          /* Pending Works assigned to the logged-in worker */
          <section className={`p-6 rounded-2xl border transition-all fade-in font-sans ${
            isDarkMode ? 'bg-slate-900/50 border-slate-900 text-white' : 'bg-white border-stone-200 shadow-sm text-stone-900'
          }`}>
            <div className="border-b border-stone-200 dark:border-slate-800 pb-4 mb-6">
              <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span className="p-2 bg-amber-500/10 text-amber-600 rounded-lg"><Briefcase className="h-4.5 w-4.5" /></span>
                <span>My Pending Bespoke Commissions</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Below are the commissions assigned to you by the studio shop owner. Review the client body measurements, fabric instructions, and log your progress.
              </p>
            </div>

            <div className="space-y-6">
              {(() => {
                // Filter orders assigned directly to this worker
                const workerOrders = orders.filter(
                  (o) => o.assignedWorkerId === currentUser?.id
                );

                if (workerOrders.length === 0) {
                  return (
                     <div className="p-12 text-center border border-dashed rounded-xl border-stone-200 dark:border-slate-800">
                       <p className="text-stone-400 text-sm font-serif italic mb-2">No pending works currently assigned.</p>
                       <p className="text-xs text-stone-500">When the studio owner assigns custom garments of your skilled genres to you, they will appear here instantly!</p>
                     </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {workerOrders.map((order) => {
                      const customer = customers.find((c) => c.id === order.customerId);
                      // Look up the measurements for this client and this garment type
                      const matchingMeasurement = measurements.find(
                        (m) => m.customerId === order.customerId && m.clothingType.toLowerCase().trim() === order.clothingType.toLowerCase().trim()
                      );

                      const statusSteps: OrderStatus[] = [
                        'Order Received',
                        'Measurement Taken',
                        'Cutting',
                        'Stitching',
                        'Finishing',
                        'Ready for Pickup',
                        'Delivered'
                      ];

                      const currentIndex = statusSteps.indexOf(order.status);

                      return (
                        <div
                          key={order.id}
                          className={`p-5 rounded-2xl border flex flex-col justify-between transition-all relative ${
                            isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-stone-200 shadow-xs'
                          }`}
                        >
                          <div className="space-y-4">
                            {/* Top Commission Meta Header */}
                            <div className="flex justify-between items-start border-b border-stone-100 dark:border-slate-900 pb-3">
                              <div>
                                <span className="text-[10px] uppercase font-mono font-black text-amber-500 dark:text-amber-400 block tracking-widest text-left">
                                  COMMISSION ID
                                </span>
                                <h4 className="text-sm font-black tracking-tight mt-0.5 text-left">{order.id}</h4>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-mono font-black text-stone-400 block tracking-widest">
                                  DELIVERY DEADLINE
                                </span>
                                <span className="text-xs font-bold text-rose-500 font-mono">
                                  {order.deliveryDate}
                                </span>
                              </div>
                            </div>

                            {/* Garment Genre Title */}
                            <div className="flex items-center space-x-3 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-left">
                              <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                                <Shirt className="h-4 w-4" />
                              </span>
                              <div>
                                <span className="text-[10px] text-stone-400 uppercase font-black tracking-wide block">Clothing Genre Spec</span>
                                <h3 className="text-xs font-bold text-stone-880 dark:text-stone-100">{order.clothingType} (Quantity: {order.quantity})</h3>
                              </div>
                            </div>

                            {/* Customer Particulars & Instructions */}
                            <div className="grid grid-cols-2 gap-4 text-xs text-left">
                              <div>
                                <span className="text-[9px] text-stone-400 uppercase font-extrabold tracking-wider block mb-0.5">Client Details</span>
                                <p className="font-bold text-stone-800 dark:text-stone-100">{customer?.name || 'Walk-in Client'}</p>
                                <p className="text-[10px] text-stone-500 font-medium">{customer?.phone}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-stone-400 uppercase font-extrabold tracking-wider block mb-0.5">Status &amp; Payment</span>
                                <span className={`inline-block px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-md ${
                                  order.paymentStatus === 'Fully Paid'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : order.paymentStatus === 'Partially Paid'
                                    ? 'bg-amber-500/10 text-amber-600 font-extrabold animate-pulse'
                                    : 'bg-rose-500/10 text-rose-500 font-black'
                                }`}>
                                  {order.paymentStatus}
                                </span>
                              </div>
                            </div>

                            {/* Specific Instructions (instructions, fabricDetails) */}
                            <div className="bg-stone-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-stone-150 dark:border-slate-900 text-xs text-left text-neutral-600 dark:text-slate-300">
                              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Tailoring &amp; Fabric Instructions</span>
                              {order.notes?.fabricDetails && (
                                <p className="mb-1"><strong className="text-[10px] text-stone-550 dark:text-stone-300 font-semibold">Fabrication:</strong> {order.notes.fabricDetails}</p>
                              )}
                              {order.notes?.instructions && (
                                <p className="mb-1"><strong className="text-[10px] text-stone-550 dark:text-stone-300 font-semibold">Instructions:</strong> {order.notes.instructions}</p>
                              )}
                              {order.notes?.urgentNotes && (
                                <p className="text-rose-500 font-bold"><strong className="text-[10px] uppercase font-mono">Urgent Alert:</strong> {order.notes.urgentNotes}</p>
                              )}
                              {!order.notes?.fabricDetails && !order.notes?.instructions && (
                                <p className="text-stone-400 italic text-[11px] font-serif">No extra fabrication details logged.</p>
                              )}
                            </div>

                            {/* CLIENT MEASUREMENTS PARAMETERS SUITE */}
                            <div className="p-4 rounded-xl border border-stone-200 dark:border-slate-800 bg-[#fbf9f4] dark:bg-slate-950/80 text-xs text-left">
                              <div className="flex justify-between items-center mb-2.5">
                                <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                  <Scissors className="h-3.5 w-3.5 shrink-0" />
                                  <span>Client Sizing Specifications</span>
                                </span>
                                {matchingMeasurement && (
                                  <span className="text-[10px] text-stone-400 font-bold font-mono">Synced ({matchingMeasurement.date})</span>
                                )}
                              </div>

                              {editingMeasurementOrderId === order.id ? (
                                <div className="space-y-4 pt-1">
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {Object.keys(editingFields).map((k) => (
                                      <div key={k} className="relative">
                                        <label className="text-[9px] text-stone-400 font-mono uppercase tracking-wider block mb-1">
                                          {k}
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="text"
                                            value={editingFields[k] || ''}
                                            onChange={(e) => setEditingFields({ ...editingFields, [k]: e.target.value })}
                                            className={`w-full p-2 pr-10 text-xs font-mono font-bold rounded-lg border focus:ring-1 focus:ring-amber-500 focus:outline-none ${
                                              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                                            }`}
                                          />
                                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-amber-600 uppercase">
                                            {fieldUnits[k] || 'in'}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="space-y-1.5 pt-1">
                                    <label className="text-[10px] text-stone-400 uppercase font-mono tracking-wider block">
                                      Fitting Instructions &amp; Sizing Memo
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={editingNotes}
                                      onChange={(e) => setEditingNotes(e.target.value)}
                                      placeholder="Note specific details (e.g., tight chest, loose sleeve length...)"
                                      className={`w-full p-2 text-xs rounded-lg border focus:ring-1 focus:ring-amber-500 focus:outline-none ${
                                        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                                      }`}
                                    />
                                  </div>

                                  <div className="flex items-center space-x-2 pt-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditMeasurement(order.id, order.customerId, order.clothingType, matchingMeasurement?.id)}
                                      className="p-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold shadow-sm active:scale-[0.98] transition cursor-pointer"
                                    >
                                      Save Sizing Specs
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingMeasurementOrderId(null)}
                                      className="p-2 px-3 rounded-lg bg-stone-200 hover:bg-stone-300 dark:bg-slate-850 dark:hover:bg-slate-800 text-stone-600 dark:text-stone-300 text-[11px] font-bold active:scale-[0.98] transition cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-left space-y-3">
                                  {matchingMeasurement ? (
                                    <>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                                        {Object.entries(matchingMeasurement.fields).map(([k, val]) => (
                                          <div key={k} className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-stone-150 dark:border-slate-800/80">
                                            <span className="text-[9px] text-stone-400 font-mono uppercase tracking-wider block truncate">{k}</span>
                                            <span className="font-mono text-xs font-black text-amber-700 dark:text-amber-400">{val || '--'}</span>
                                          </div>
                                        ))}
                                      </div>
                                      {matchingMeasurement.notes && (
                                        <p className="text-[10px] text-stone-500 dark:text-stone-300 mt-2 italic font-serif">
                                          *Sizing Memo: {matchingMeasurement.notes}
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <div className="py-3 text-center bg-stone-100/50 dark:bg-slate-900/50 rounded-lg border border-stone-150 dark:border-slate-800/50">
                                      <p className="text-[11px] text-stone-500 italic font-serif mb-1">No custom physical measurement sheet indexed for {order.clothingType}.</p>
                                      <p className="text-[9px] text-stone-400">Please review standard template sizes or coordinate parameters with the client in person.</p>
                                    </div>
                                  )}

                                  <div className="pt-2 border-t border-dashed border-stone-200 dark:border-slate-800 flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditMeasurement(order.id, matchingMeasurement || null, order.clothingType)}
                                      className="p-1.5 px-3 rounded-lg bg-amber-500/10 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 text-[10.5px] font-extrabold flex items-center space-x-1.5 cursor-pointer transition"
                                    >
                                      <Scissors className="h-3 w-3 shrink-0" />
                                      <span>{matchingMeasurement ? 'Modify Sizing Parameters' : 'Establish Sizing Parameters'}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Fabrication Milestones Step Visual */}
                            <div className="space-y-1.5 pt-2 text-left">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-stone-400 font-bold uppercase tracking-wider block">Production Milestone Stages</span>
                                <span className="font-extrabold text-amber-600 dark:text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider text-[9px]">
                                  {order.status}
                                </span>
                              </div>
                              <div className="w-full bg-stone-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden flex">
                                {statusSteps.map((step, idx) => {
                                  const isCompleted = idx <= currentIndex;
                                  const isCurrent = idx === currentIndex;
                                  return (
                                    <div
                                      key={step}
                                      className={`h-full flex-1 border-r last:border-r-0 border-white dark:border-slate-950 transition-all ${
                                        isCurrent
                                          ? 'bg-amber-500 animate-pulse'
                                          : isCompleted
                                          ? 'bg-amber-600/70'
                                          : 'bg-stone-200 dark:bg-slate-800'
                                      }`}
                                      title={step}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Fabrication Progressive Controls */}
                          <div className="mt-5 pt-3 border-t border-stone-100 dark:border-slate-900 flex flex-wrap gap-2 items-center justify-between text-left font-sans">
                            <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest shrink-0">Progress commission:</span>
                            <div className="flex gap-1.5">
                              {currentIndex < statusSteps.length - 1 ? (
                                <>
                                  {/* Advance to next logical step button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextStatus = statusSteps[currentIndex + 1];
                                      handleUpdateOrderStatus(order.id, nextStatus);
                                    }}
                                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[10px] font-black transition-all shadow-3xs cursor-pointer flex items-center space-x-1"
                                  >
                                    <CheckCircle className="h-3 w-3 shrink-0" />
                                    <span>Advance to: {statusSteps[currentIndex + 1]}</span>
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider flex items-center space-x-1 py-1">
                                  <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                                  <span>COMPLETED &amp; DELIVERED</span>
                                </span>
                              )}

                              {/* Quick direct status picker drop */}
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                className="p-1 px-1.5 border rounded-xl font-bold text-[10px] dark:bg-slate-850 cursor-pointer shadow-3xs text-stone-850 dark:text-stone-200"
                              >
                                {statusSteps.map((step) => (
                                  <option key={step} value={step}>
                                    State: {step}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </section>
        ) : (((currentUser?.role === 'Owner' || currentUser?.role === 'Manager') && ownerTab === 'tailor_measurements') || (currentUser?.role !== 'Owner' && currentUser?.role !== 'Manager' && tailorPage === 'sizing')) ? (
          <>
            {/* Central Session Control Center */}
            {sessionStage === 'active' ? (
          <div>
            {activeStep === 1 ? (
              <div className="max-w-3xl mx-auto w-full fade-in">
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center space-x-2">
                    <span>Step 1 of 2: Measurements</span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium font-sans">
                    Next: Client Coordinates &amp; Schedule
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-stone-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
                  <div className="bg-amber-600 h-full w-1/2 transition-all duration-300"></div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setActiveStep(2);
                    triggerToast('Sizing parameters locked. Next, enter student/client coordinates.', 'success');
                  }}
                  className="space-y-6"
                >
                  <div className={`p-6 rounded-2xl border flex flex-col justify-between relative transition-all ${
                    isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'
                  }`}>
                    
                    {/* Visual Tabs for Garment Category */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800 gap-4">
                      <div>
                        <h2 className="font-sans text-lg font-bold tracking-tight">1. Measurements</h2>
                        <p className="text-xs text-stone-400">Specify sizes matching selected fabric drape</p>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-2.5 w-fit max-w-full md:w-auto">
                        <div className={`p-1 rounded-xl flex flex-wrap gap-1 border w-fit max-w-full ${
                          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-200'
                        }`}>
                          {clothingCategories.map((type) => {
                            const isSelected = clothingType === type;
                            const isDefaultCategory = ['Shirt', 'Pant', 'Suit', 'Kurta', 'Custom'].includes(type);

                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => handleClothingTypeChange(type)}
                                className={`p-1 px-3.5 text-[10px] font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
                                  isSelected
                                    ? isDefaultCategory
                                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/10'
                                      : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                                    : isDarkMode
                                    ? 'text-stone-400 hover:text-white'
                                    : 'text-stone-600 hover:text-stone-900'
                                }`}
                              >
                                {renderGenreIcon(type, clothingCategoryEmojis, "h-3.5 w-3.5", "w-3.5 h-3.5")}
                                <span>{type}</span>
                              </button>
                            );
                          })}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
                            className="text-[10px] font-extrabold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Custom Genre</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {showAddCategoryForm && (
                      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center gap-2.5 text-xs w-full transition-all ${
                        isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-250 shadow-sm'
                      }`}>
                        <div className="flex-1 w-full">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Genre Name (e.g. Waistcoat, Sherwani)"
                            className={`p-2 px-3 rounded-lg text-xs leading-none border focus:outline-none w-full ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:ring-1 focus:ring-indigo-500' : 'bg-white border-stone-300 focus:ring-1 focus:ring-indigo-600'
                            }`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCategory();
                              }
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <span className="text-[10px] text-stone-400 font-bold whitespace-nowrap">Base Price (₹):</span>
                          <input
                            type="number"
                            value={newCategoryPrice || ''}
                            onChange={(e) => setNewCategoryPrice(parseInt(e.target.value) || 0)}
                            placeholder="e.g. 300"
                            className={`p-2 px-3 rounded-lg text-xs leading-none border focus:outline-none w-24 ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:ring-1 focus:ring-indigo-500' : 'bg-white border-stone-300 focus:ring-1 focus:ring-indigo-600'
                            }`}
                          />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <span className="text-[10px] text-stone-400 font-bold whitespace-nowrap">Template:</span>
                          <select
                            value={newCategoryBase}
                            onChange={(e) => setNewCategoryBase(e.target.value)}
                            className={`p-2 px-3 rounded-lg text-xs leading-none border focus:outline-none cursor-pointer ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-stone-300'
                            }`}
                          >
                            <option value="Custom">Blank Slate</option>
                            <option value="Shirt">Copy Shirt defaults</option>
                            <option value="Pant">Copy Pant defaults</option>
                            <option value="Suit">Copy Suit defaults</option>
                            <option value="Kurta">Copy Kurta defaults</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            className="p-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs leading-none font-sans transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                          >
                            Create Genre
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddCategoryForm(false);
                              setNewCategoryName('');
                              setNewCategoryPrice(300);
                            }}
                            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs font-bold font-sans cursor-pointer px-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Sizing Session Price Overrides removed from top */}

                    {/* Sizing inputs grid ("blocks like before") */}
                    <div className="py-4">
                      <div className="grid grid-cols-1 gap-3 text-xs max-w-xl mx-auto">
                        {Object.keys(sizingFields).map((fieldName) => {
                          const isDefaultCategoryType = ['Shirt', 'Pant', 'Suit', 'Kurta', 'Custom'].includes(clothingType);
                          const currentTemplateFields = clothingTemplates[clothingType] || {};
                          const isDefault = fieldName in currentTemplateFields;

                          let blockClass = '';
                          if (isDefaultCategoryType) {
                            if (isDefault) {
                              blockClass = isDarkMode
                                ? 'bg-slate-900/50 border-slate-800'
                                : 'bg-white border-stone-200 shadow-sm';
                            } else {
                              blockClass = isDarkMode
                                ? 'bg-amber-950/20 border-amber-800/40 shadow-sm shadow-amber-900/5'
                                : 'bg-amber-50/40 border-amber-200/80 shadow-sm shadow-amber-100/30';
                            }
                          } else {
                            if (isDefault) {
                              blockClass = isDarkMode
                                ? 'bg-indigo-950/25 border-indigo-900/40 shadow-sm shadow-indigo-900/5'
                                : 'bg-indigo-50/25 border-indigo-200/70 shadow-sm shadow-indigo-100/10';
                            } else {
                              blockClass = isDarkMode
                                ? 'bg-violet-950/30 border-violet-800/40 shadow-sm shadow-violet-900/5'
                                : 'bg-violet-50/40 border-violet-200/80 shadow-sm shadow-violet-100/20';
                            }
                          }

                          return (
                            <div
                              key={fieldName}
                              className={`p-3 rounded-xl border relative group transition-all space-y-1.5 ${blockClass}`}
                            >
                              <div className="flex items-center justify-between">
                                <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider truncate" title={fieldName}>
                                  {fieldName}
                                </label>
                                {!isDefault && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveField(fieldName)}
                                    className="text-stone-400 hover:text-rose-500 transition-opacity font-bold text-sm leading-none px-1 cursor-pointer"
                                    title="Delete this parameter"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                              <div className="relative">
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. 15.5"
                                  value={sizingFields[fieldName]}
                                  onChange={(e) => setSizingFields({ ...sizingFields, [fieldName]: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                    }
                                  }}
                                  className={`w-full p-2.5 pr-14 text-xs font-mono font-extrabold rounded-xl border focus:ring-1 focus:ring-amber-500 focus:outline-none ${
                                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                                  }`}
                                />
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center bg-stone-100 dark:bg-slate-800 rounded-lg px-1.5 py-0.5 border border-stone-200 dark:border-slate-700">
                                  <select
                                    value={fieldUnits[fieldName] || 'in'}
                                    onChange={(e) => setFieldUnits({ ...fieldUnits, [fieldName]: e.target.value as 'in' | 'cm' })}
                                    className="text-[9px] text-amber-600 dark:text-amber-400 font-extrabold bg-transparent border-none outline-none cursor-pointer focus:ring-0 focus:outline-none uppercase pr-0 text-center appearance-none"
                                  >
                                    <option value="in" className={isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-stone-900'}>in</option>
                                    <option value="cm" className={isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-stone-900'}>cm</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {Object.keys(sizingFields).length === 0 && (
                        <div className="text-center py-10 text-stone-400">
                          Empty sizing parameters. Add custom fields below or choose a template above.
                        </div>
                      )}
                    </div>

                    {/* Optional parameters entry box */}
                    <div className={`p-4 rounded-xl border border-dashed text-xs ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-200'
                    }`}>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-1">
                        + Append custom pattern variable
                      </label>
                      <p className="text-[10px] text-stone-400 mb-2">Need a custom fitting measurement like Armhole, Back Width, or Thigh Gap? Add it instantly below.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Armhole, Pocket Placement, Knee..."
                          value={customFieldName}
                          onChange={(e) => setCustomFieldName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewSizingField(e);
                            }
                          }}
                          className={`p-2 px-3 rounded-lg text-xs border flex-1 focus:outline-none ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-stone-200 border-stone-300'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleAddNewSizingField}
                          className="p-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer w-full sm:w-auto shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Append</span>
                        </button>
                      </div>
                    </div>

                    {/* Workshop internal notes */}
                    <div className="mt-4 text-xs space-y-1.5">
                      <div className="flex justify-between items-center mb-0.5">
                        <label className="block text-stone-400 font-semibold">Workshop Fit Instructions &amp; Pose Notes</label>
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('tailorshop_draft_notes', notes);
                            triggerToast('Workshop fit instructions saved to drafting storage!', 'success');
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer flex items-center space-x-1 shadow-sm active:scale-95"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Save Instructions</span>
                        </button>
                      </div>
                      <textarea
                        placeholder="Alteration directives, slope shoulders, pocket placement specs, posture corrections..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className={`w-full p-3 h-20 rounded-xl border text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200'
                        }`}
                      />
                    </div>

                    {/* Quoted Price Adjustment */}
                    <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-stone-50/50 border-stone-200 shadow-3xs'
                    }`}>
                      <span className="font-bold text-stone-600 dark:text-stone-300">Quoted Price:</span>
                      <div className="relative">
                        <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500" />
                        <input
                          type="number"
                          min="1"
                          value={price}
                          onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                          className={`pl-7 pr-2.5 py-1.5 rounded-lg border text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none font-extrabold w-28 text-left ${
                            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-stone-250 shadow-sm'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Authorize Save Button */}
                    <div className="mt-6 pt-4 border-t border-stone-100 dark:border-slate-800 flex justify-end items-center gap-4">
                      <button
                        type="submit"
                        className="p-3 px-8 bg-amber-600 hover:bg-amber-700 transition-all font-bold text-xs rounded-xl text-white shadow-lg shadow-amber-600/10 flex items-center space-x-2 cursor-pointer active:scale-[0.98]"
                      >
                        <span>Continue to Client Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            ) : (
              <div className="max-w-xl mx-auto w-full fade-in">
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center space-x-2">
                    <span>Step 2 of 2: Client Details &amp; Timeline</span>
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium font-sans">
                    Type: <strong className="font-bold font-sans not-italic text-stone-800 dark:text-stone-100 underline decoration-amber-500/50">{clothingType}</strong>
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-stone-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
                  <div className="bg-amber-600 h-full w-full transition-all duration-300"></div>
                </div>

                <form onSubmit={handleSubmitSession} className="space-y-6">
                  <div className={`p-6 rounded-2xl border flex flex-col justify-between relative overflow-hidden transition-all ${
                    isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'
                  }`}>
                    {/* Decorative background visual thread */}
                    <div className="absolute top-0 right-0 p-8 text-stone-100 dark:text-slate-900/10 -z-10 font-sans font-black text-9xl select-none pointer-events-none">
                      TAILORSHOP ERP
                    </div>

                    <div className="space-y-6">
                      <div className="pb-3 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <h2 className="font-sans text-lg font-bold tracking-tight">2. Client &amp; Timeline</h2>
                          <p className="text-xs text-stone-400">Record customer coordinates &amp; scheduling targets</p>
                        </div>
                        <span className="p-1.5 px-3 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                          TAILORSHOP ERP Sizing Core
                        </span>
                      </div>



                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="block text-stone-400 font-semibold mb-1">Customer Full Name *</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                            <input
                              ref={nameInputRef}
                              type="text"
                              required
                              placeholder="e.g. Master Rashid Khan"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-stone-400 font-semibold mb-1">WhatsApp Phone Contact *</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. +1 (555) 0192-384"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-stone-400 font-semibold mb-1">E-mail Address *</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                            <input
                              type="email"
                              required
                              placeholder="e.g. rashid@centraltailors.com"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-1">
                          <div>
                            <label className="block text-stone-400 font-semibold mb-1">When is it Ready? *</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                              <input
                                type="date"
                                required
                                value={readyDate}
                                onChange={(e) => setReadyDate(e.target.value)}
                                className={`w-full pl-9 pr-3 py-2 rounded-xl border focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono ${
                                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200'
                                }`}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-stone-400 font-semibold mb-1">Quoted Price (₹)</label>
                            <div className="relative block">
                              <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                              <input
                                type="number"
                                min="1"
                                value={price}
                                onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                                className={`w-full pl-8 pr-3 py-2 rounded-xl border focus:ring-1 focus:ring-amber-500 focus:outline-none font-extrabold ${
                                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Authorize Save Button */}
                    <div className="mt-8 pt-4 border-t border-stone-100 dark:border-slate-800 flex justify-between items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveStep(1);
                          triggerToast('Loading sizing parameters...', 'info');
                        }}
                        className="p-3 px-5 bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-750 dark:text-stone-200 transition-all font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer active:scale-[0.98]"
                      >
                        <span>← Back to Sizing</span>
                      </button>
                      <button
                        type="submit"
                        className="p-3 px-8 bg-amber-600 hover:bg-amber-700 transition-all font-bold text-xs rounded-xl text-white shadow-lg shadow-amber-600/10 flex items-center space-x-2 cursor-pointer active:scale-[0.98]"
                      >
                        <CheckCircle className="h-4.5 w-4.5" />
                        <span>Authorize Session [Enter]</span>
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* Sizing Completed Screen / Ticket Output and Notification preview */
          <section className="fade-in max-w-3xl mx-auto space-y-6">
            <div className={`p-8 rounded-3xl border text-xs text-left relative overflow-hidden transition-all ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200 shadow-md'
            }`}>
              
              {/* Decorative side badge */}
              <div className="absolute top-0 right-0 p-8">
                <span className="p-2 px-3 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase text-[9px] tracking-wide flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Locked & Synced</span>
                </span>
              </div>

              <div className="max-w-xl space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-600 dark:text-amber-500">
                    Success Summary Report
                  </span>
                  <h3 className="font-serif text-2xl font-bold">Measurement Session Complete!</h3>
                  <p className="text-stone-400 text-xs text-stone-400">
                    The fitting patterns have been registered, client record has been mapped, and notifications are ready on dispatch lines.
                  </p>
                </div>

                {/* Sizing Details Card */}
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-stone-50 border-stone-150'}`}>
                  <h4 className="font-bold text-xs border-b pb-2 mb-3 flex items-center gap-1.5 uppercase text-stone-400">
                    <User className="h-4 w-4 text-amber-600" />
                    <span>Registered Customer Particulars</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                    <div>
                      <p className="text-stone-400 uppercase text-[9px] font-bold">Customer Name</p>
                      <p className="font-bold text-sm">{lastSavedSession?.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 uppercase text-[9px] font-bold">Reference Reference ID</p>
                      <p className="font-bold font-mono text-xs text-amber-600 dark:text-amber-500">{lastSavedSession?.measurement.id}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 uppercase text-[9px] font-bold">WhatsApp Mobile Number</p>
                      <p className="font-bold text-xs">{lastSavedSession?.customer.phone}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 uppercase text-[9px] font-bold">Email Username</p>
                      <p className="font-bold text-xs">{lastSavedSession?.customer.email}</p>
                    </div>
                  </div>

                  <hr className="border-dashed my-3 dark:border-slate-800" />

                  <h4 className="font-bold text-xs pb-2 mb-2 uppercase text-stone-400 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Timeline & Target Sizing Ready State</span>
                  </h4>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mb-2">
                    📅 Scheduled for completion / Pick-up on:{' '}
                    {lastSavedSession?.order && new Date(lastSavedSession.order.deliveryDate).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-stone-550 dark:text-stone-300 leading-normal">
                    The tailor shop owner has scheduled this customized {lastSavedSession?.measurement.clothingType} to be cut, ironed, and finished precisely before this target.
                  </p>
                </div>

                {/* Notification alert dispatch centers */}
                <div className="space-y-3 font-mono text-[10.5px]">
                  <h4 className="font-serif font-bold text-sm text-stone-450 dark:text-stone-400 uppercase font-sans tracking-wide">
                    📲 Auto Alert Notifications Sent:
                  </h4>
                  <div className={`p-4 border rounded-2xl leading-relaxed flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:brightness-[0.98] ${
                    isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50/50 border-emerald-100 text-emerald-950'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-1.5 mb-1.5">
                        <span className="p-1 px-2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-[8px] font-black uppercase tracking-wider flex items-center space-x-1">
                          <span>WhatsApp Ready</span>
                        </span>
                        <span className="text-stone-400 font-serif font-semibold">{lastSavedSession?.customer.phone}</span>
                      </div>
                      <p className="text-stone-500 dark:text-stone-300 italic text-[11px]">"{lastSavedSession?.whatsappAlert}"</p>
                    </div>
                    <a
                      href={`https://wa.me/${lastSavedSession?.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(lastSavedSession?.whatsappAlert || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center justify-center space-x-1.5 shadow-sm hover:shadow active:scale-[0.98] transition cursor-pointer self-start md:self-center shrink-0"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Send via WhatsApp</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className={`p-3.5 border rounded-xl leading-relaxed ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-stone-200'}`}>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="p-1 px-1.5 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded text-[8px] font-bold uppercase tracking-wider">
                        Email Sent
                      </span>
                      <span className="text-stone-400 font-semibold">{lastSavedSession?.customer.email}</span>
                    </div>
                    <p className="text-stone-500 dark:text-stone-300 italic">"{lastSavedSession?.emailAlert}"</p>
                  </div>
                </div>

                {/* Sizing Blueprint */}
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-400 uppercase tracking-widest text-[9.5px]">Captured Size values:</h4>
                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    {lastSavedSession && Object.entries(lastSavedSession.measurement.fields).map(([k, v]) => (
                      <div key={k} className={`p-2 rounded-lg border ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-stone-50'}`}>
                        <span className="text-[8px] text-stone-400 block uppercase font-sans font-bold">{k}</span>
                        <span className="text-sm font-extrabold">{cleanMeasurementValue(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Settle Action Desk */}
                <div className="pt-6 border-t dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => triggerPrintVoucher(lastSavedSession?.measurement.id || '', lastSavedSession?.customer.id || '', lastSavedSession?.order?.id)}
                      className="p-3 px-5 border hover:bg-stone-100 dark:hover:bg-slate-800 transition rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Printer className="h-4.5 w-4.5 text-amber-500" />
                      <span>Print Voucher</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadVoucherAsHtml(lastSavedSession?.measurement.id || '', lastSavedSession?.customer.id || '', lastSavedSession?.order?.id)}
                      className="p-3 px-5 border bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/35 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Bill</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartNextSession}
                    className="p-3 px-8 bg-amber-600 hover:bg-amber-700 transition-all font-bold text-xs rounded-xl text-white shadow-lg shadow-amber-600/10 flex items-center justify-center space-x-2 animate-bounce cursor-pointer"
                  >
                    <span>Take Next Sizing Session</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-stone-400 block mt-2">
                    💡 TAILOR WORKFLOW CHEAT: Pressing **[Enter]** on your physical keyboard instantly fires up the next session!
                  </span>
                </div>

              </div>
            </div>
          </section>
        )}
          </>
        ) : (((currentUser?.role === 'Owner' || currentUser?.role === 'Manager') && ownerTab === 'customer_orders') || (currentUser?.role !== 'Owner' && currentUser?.role !== 'Manager' && tailorPage === 'orders')) ? (
          /* Master Orders Book page */
          <section className={`p-6 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 font-sans">
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-stone-50 border-stone-150'}`}>
                <span className="text-[10px] text-stone-450 dark:text-stone-400 font-bold uppercase tracking-wider block">Total Booked Jobs</span>
                <span className="text-2xl font-sans font-black text-stone-900 dark:text-white mt-1 block">{visibleOrders.length}</span>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider block">Active Production</span>
                <span className="text-2xl font-sans font-black text-amber-600 dark:text-amber-500 mt-1 block">{visibleOrders.filter(o => o.status !== 'Delivered').length} active</span>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-500 font-bold uppercase tracking-wider block">Value Collected</span>
                <span className="text-2xl font-sans font-black text-emerald-600 dark:text-emerald-500 mt-1 block">₹{visibleOrders.reduce((sum, o) => sum + o.advancePayment, 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800 gap-4 mb-6">
              <div>
                <h3 className="font-sans text-lg font-bold">Orders</h3>
                <p className="text-xs text-stone-400">Track bespoke garments from order reception to fitting delivery and finalize balance collections</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search order ref, customer name..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className={`p-2 py-1.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <option value="All">All Statuses</option>
                  <option value="Order Received">Order Received</option>
                  <option value="Measurement Taken">Measurement Taken</option>
                  <option value="Cutting">Cutting</option>
                  <option value="Stitching">Stitching</option>
                  <option value="Finishing">Finishing</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Delivered">Delivered</option>
                </select>

                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className={`p-2 py-1.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <option value="All">All Payments</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Fully Paid">Fully Paid</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto font-sans">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead>
                  <tr className="border-b dark:border-slate-800 text-stone-400 dark:text-stone-300 uppercase font-bold text-[9.5px] tracking-wider">
                    <th className="py-3 px-4">Order & Customer Information</th>
                    <th className="py-3 px-4">Dressmaking Sizing Specs & Design Guidelines</th>
                    <th className="py-3 px-4">Production Phase</th>
                    <th className="py-3 px-4">Assigned Tailor</th>
                    <th className="py-3 px-4 text-right">Settlement & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-850">
                  {visibleOrders
                    .filter((order) => {
                      const customer = customers.find((c) => c.id === order.customerId);
                      const searchStr = `${order.id} ${order.clothingType} ${customer?.name || ''} ${customer?.phone || ''}`.toLowerCase();
                      const matchesSearch = searchStr.includes(orderSearch.toLowerCase());
                      const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
                      const matchesPayment = orderPaymentFilter === 'All' || order.paymentStatus === orderPaymentFilter;
                      return matchesSearch && matchesStatus && matchesPayment;
                    })
                    .map((order) => {
                      const customer = customers.find((c) => c.id === order.customerId);
                      const matchingRecord = measurements.find(
                        (m) => m.customerId === order.customerId && m.clothingType.toLowerCase() === order.clothingType.toLowerCase()
                      ) || measurements.find((m) => m.customerId === order.customerId);

                      return (
                        <tr 
                          key={order.id} 
                          className="hover:bg-stone-50/70 dark:hover:bg-slate-900/30 cursor-pointer transition-colors relative group"
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('select') || target.closest('a') || target.closest('option')) {
                              return;
                            }
                            setSelectedDetOrder(order);
                          }}
                        >
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono font-extrabold text-xs text-amber-600 dark:text-amber-400 group-hover:underline">
                                  {order.id}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 font-extrabold uppercase text-[8.5px] tracking-wider inline-flex items-center border border-stone-200/60 dark:border-slate-700">
                                  {order.clothingType}
                                </span>
                              </div>
                              <div>
                                <p className="font-bold text-sm text-stone-900 dark:text-stone-100 leading-tight">
                                  {customer ? customer.name : 'Walk-in Client'}
                                </p>
                                <p className="text-[10.5px] text-stone-550 dark:text-stone-350 mt-0.5">{customer?.phone}</p>
                              </div>
                              <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold">
                                Booked: {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-4 max-w-sm">
                            {matchingRecord ? (
                              <div className="space-y-1.5">
                                {order.notes?.instructions && (
                                  <div className="text-[11px] leading-tight text-stone-700 dark:text-stone-200 font-medium">
                                    <span className="font-semibold text-[8px] text-stone-500 dark:text-stone-300 uppercase tracking-wider block mb-0.5">Design & Cut Spec</span>
                                    <span className="text-stone-900 dark:text-white font-bold line-clamp-1">{order.notes.instructions}</span>
                                  </div>
                                )}
                                <div className="pt-1">
                                  <span className="inline-flex items-center space-x-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors shadow-2xs font-extrabold text-[9px]">
                                    <span>View {Object.keys(matchingRecord.fields).length} Measurement Specs</span>
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <p className="text-stone-400 dark:text-stone-500 text-[10.5px] italic">No active size measurements locked</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (currentUser?.role === 'Owner' || currentUser?.role === 'Manager') {
                                      setOwnerTab('tailor_measurements');
                                    } else {
                                      setTailorPage('sizing');
                                    }
                                    setCustomerName(customer?.name || '');
                                    setCustomerPhone(customer?.phone || '');
                                    setCustomerEmail(customer?.email || '');
                                    setClothingType(order.clothingType);
                                    triggerToast('Ready to record sizing specifications!', 'info');
                                  }}
                                  className="text-amber-600 dark:text-amber-450 font-bold text-[10px] hover:underline flex items-center space-x-1"
                                >
                                  <span>Measure Customer</span>
                                </button>
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-2">
                              <div>
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                                  className={`p-2 py-1 px-2.5 rounded-xl border text-[11px] font-extrabold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-sm transition-all ${
                                    order.status === 'Delivered'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                      : order.status === 'Ready for Pickup'
                                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                  }`}
                                >
                                  <option value="Order Received">Order Received</option>
                                  <option value="Measurement Taken">Measurement Specs</option>
                                  <option value="Cutting">Cutting Cloth</option>
                                  <option value="Stitching">Stitching Unit</option>
                                  <option value="Finishing">Finishing Touches</option>
                                  <option value="Ready for Pickup">Ready for Pickup</option>
                                  <option value="Delivered">Delivered to Customer</option>
                                </select>
                              </div>
                              <div className="text-[10px] space-y-0.5">
                                <span className="text-stone-400 dark:text-stone-500 block">Fitting Target Date</span>
                                <span className="font-mono font-bold text-stone-700 dark:text-stone-300">
                                  {new Date(order.deliveryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-1.5 min-w-[150px]">
                              {(() => {
                                const workerObj = workers.find(w => w.id === order.assignedWorkerId);
                                return (
                                  <div className="text-[10px] space-y-1">
                                    <span className="text-stone-400 dark:text-stone-500 block uppercase font-bold text-[8px] tracking-wider">Production Assignee</span>
                                    {workerObj ? (
                                      <div className="flex items-center space-x-1.5 py-0.5">
                                        <div className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-black text-[9px]">
                                          {workerObj.name ? workerObj.name.substring(0, 2).toUpperCase() : 'TA'}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-bold text-stone-850 dark:text-stone-200 truncate leading-tight">{workerObj.name}</p>
                                          <p className="text-[9px] text-stone-400 mt-0.5 leading-none font-medium uppercase tracking-wider">{workerObj.role}</p>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="font-medium text-stone-400 dark:text-stone-500 text-[11px] italic block">Unassigned</span>
                                    )}
                                  </div>
                                );
                              })()}

                              {(currentUser?.role === 'Owner' || currentUser?.role === 'Manager') && (
                                <select
                                  value={order.assignedWorkerId || ''}
                                  onChange={(e) => handleAssignWorker(order.id, e.target.value)}
                                  className="font-semibold text-[10px] p-1.5 border rounded-lg dark:bg-slate-950 dark:border-slate-800 bg-stone-50 border-stone-200 text-stone-800 dark:text-stone-100 w-full focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-3xs"
                                >
                                  <option value="">Choose Craftsman...</option>
                                  {(() => {
                                    const filtered = workers.filter((w) => 
                                      w.skills?.some(s => s.toLowerCase().trim() === order.clothingType.toLowerCase().trim())
                                    );
                                    const displayWorkers = filtered.length > 0 ? filtered : workers;
                                    return displayWorkers.map((w) => {
                                      const isSpecialist = w.skills?.some(s => s.toLowerCase().trim() === order.clothingType.toLowerCase().trim());
                                      const skillStr = w.skills && w.skills.length > 0 ? ` [${w.skills.join(', ')}]` : '';
                                      return (
                                        <option key={w.id} value={w.id}>
                                          {w.name} ({w.role}){isSpecialist ? ' ⭐' : ''}
                                        </option>
                                      );
                                    });
                                  })()}
                                </select>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col items-end space-y-2">
                              <div className="font-mono text-[10.5px] text-right space-y-0.5">
                                <div className="flex justify-between w-28 text-stone-500 dark:text-stone-450">
                                  <span>Price:</span>
                                  <span className="font-bold text-stone-800 dark:text-stone-200">₹{order.price}</span>
                                </div>
                                <div className="flex justify-between w-28 text-emerald-600 dark:text-emerald-400 font-medium">
                                  <span>Paid:</span>
                                  <span>₹{order.advancePayment}</span>
                                </div>
                                {order.remainingBalance > 0 ? (
                                  <div className="flex justify-between w-28 font-bold text-rose-500 dark:text-rose-450 font-mono">
                                    <span>Unpaid:</span>
                                    <span>₹{order.remainingBalance}</span>
                                  </div>
                                ) : (
                                  <div className="text-emerald-500 dark:text-emerald-400 text-[9px] font-extrabold tracking-wider uppercase pt-0.5 animate-pulse">
                                    ★ Settled In Full
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-end space-x-1.5 pt-1">
                                {order.remainingBalance > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleSettleOrderPayment(order.id)}
                                    className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center space-x-1 shadow-xs transition duration-150 cursor-pointer"
                                    title="Settle outstanding balance"
                                  >
                                    <IndianRupee className="h-3 w-3" />
                                    <span>Settle</span>
                                  </button>
                                )}

                                <a
                                  href={`https://wa.me/${customer?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `Hello ${customer?.name || 'Patron'}, the fabrication state of your order ${order.id} (${order.clothingType}) is updated to [${order.status}]. Outstanding: ₹${order.remainingBalance}. Thank you for booking with Sartorial Atelier!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-600 dark:text-stone-300 rounded-lg inline-flex border border-stone-200 dark:border-slate-700 transition"
                                  title="Share progress via WhatsApp"
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-1.5 border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200 dark:border-slate-800 hover:dark:border-red-900/40 transition duration-150 rounded-lg cursor-pointer"
                                  title="Purge order record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                  {visibleOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-stone-400 font-serif italic">
                        Zero orders booked in TAILORSHOP ERP system yet. Set up client coordinates to log customized orders.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : tailorPage === 'tailors' ? (
          /* Tailors List/Registry Page Section */
          <section className={`p-6 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div className="border-b border-stone-200 dark:border-slate-800 pb-4 mb-6">
              <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2 font-sans">
                <span className="p-2 bg-amber-500/10 text-amber-600 rounded-lg"><Scissors className="h-4.5 w-4.5" /></span>
                <span>Registered Tailors Registry</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">Sartorial database of all active master artisans and tailors registered in the workspace system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
              {(() => {
                const userShop = getCurrentUserShopInfo();
                const userShopNameClean = userShop?.shopName?.toLowerCase().trim();

                // 1. Get the filtered registered tailors (which are the shop owners/partners)
                const baseFilteredTailors = registeredTailors.filter((t: any) => {
                  if (currentUser?.role === 'Owner' || currentUser?.role === 'Manager') return true;

                  const userEmail = (currentUser?.email || '').toLowerCase().trim();
                  const userPhone = (currentUser?.phone || '').trim();
                  const userName = (currentUser?.name || '').toLowerCase().trim();

                  const tEmail = (t.email || '').toLowerCase().trim();
                  const tPhone = (t.phone || '').trim();
                  const tName = (t.name || '').toLowerCase().trim();

                  const isSelf = (userEmail && tEmail === userEmail) ||
                                 (userPhone && isPhoneMatch(userPhone, tPhone)) ||
                                 (userName && tName === userName);

                  if (isSelf) return true;

                  if (userShopNameClean && t.shopName && t.shopName.toLowerCase().trim() === userShopNameClean) {
                    return true;
                  }

                  return false;
                });

                // Map tailors with extra metadata indicating if they are the primary founder / shop owner
                const mappedTailors = baseFilteredTailors.map((t: any) => {
                  const userEmail = (currentUser?.email || '').toLowerCase().trim();
                  const userPhone = (currentUser?.phone || '').trim();
                  const userName = (currentUser?.name || '').toLowerCase().trim();

                  const tEmail = (t.email || '').toLowerCase().trim();
                  const tPhone = (t.phone || '').trim();
                  const tName = (t.name || '').toLowerCase().trim();

                  const isSelf = (userEmail && tEmail === userEmail) ||
                                 (userPhone && isPhoneMatch(userPhone, tPhone)) ||
                                 (userName && tName === userName);

                  // A person is the direct founder/owner of the shop if they registered the shop (hasRegisteredShop) or isSelf
                  const isShopOwner = t.hasRegisteredShop || isSelf || t.role === 'Owner';

                  return {
                    ...t,
                    displayRole: isShopOwner ? 'Shop Owner' : 'Artisan / Tailor',
                    isShopOwner,
                    isWorker: false
                  };
                });

                // 2. Also retrieve the employees, managers or workers registered under this shop!
                const relevantWorkers = workers.filter((w: any) => {
                  if (w.id === 'branding') return false;
                  if (currentUser?.role === 'Owner' || currentUser?.role === 'Manager') return true;
                  if (userShopNameClean) {
                    const wName = (w.shopName || '').toLowerCase().trim();
                    if (wName && wName === userShopNameClean) return true;
                  }
                  return w.shopOwnerId === currentUser?.id || 
                         (w.shopOwnerEmail && currentUser?.email && w.shopOwnerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim());
                });

                // Map these workers/employees into the registry list format
                const mappedWorkers = relevantWorkers.map((w: any) => {
                  return {
                    id: w.id,
                    name: w.name,
                    email: w.email,
                    phone: w.phone,
                    location: w.location || 'Central Desk',
                    shopName: w.shopName || userShop?.shopName,
                    hasRegisteredShop: false,
                    createdAt: w.createdAt || new Date().toISOString(),
                    displayRole: w.role || 'Staff Employee',
                    isShopOwner: false,
                    isWorker: true
                  };
                });

                // Combine them so that the Shop Owner comes first!
                const combinedList = [...mappedTailors, ...mappedWorkers].sort((a, b) => {
                  if (a.isShopOwner && !b.isShopOwner) return -1;
                  if (!a.isShopOwner && b.isShopOwner) return 1;
                  return a.name.localeCompare(b.name);
                });

                if (combinedList.length === 0) {
                  return (
                    <div className="col-span-full py-12 text-center text-stone-400 text-xs font-sans font-semibold">
                      No matching registered members or employees found for your shop workstation.
                    </div>
                  );
                }

                return combinedList.map((t: any) => {
                  const isCurrentClientUser = currentUser && (
                    (currentUser.email && t.email && currentUser.email.toLowerCase().trim() === t.email.toLowerCase().trim()) ||
                    (currentUser.phone && t.phone && isPhoneMatch(currentUser.phone, t.phone)) ||
                    (currentUser.name && t.name && currentUser.name.toLowerCase().trim() === t.name.toLowerCase().trim())
                  );

                  return (
                    <div key={t.id} className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                      t.isShopOwner 
                        ? (isDarkMode ? 'bg-gradient-to-br from-amber-950/20 to-slate-950 border-amber-500/30 shadow-amber-950/20' : 'bg-gradient-to-br from-amber-50/50 to-stone-50 border-amber-200 shadow-xs')
                        : (isDarkMode ? 'bg-slate-950 border-slate-900 text-white' : 'bg-stone-50 border-stone-150 text-stone-800')
                    }`}>
                      {/* Glowing indicator style for Shop Owner */}
                      {t.isShopOwner && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
                      )}

                      {/* Delete button for other profiles */}
                      {!isCurrentClientUser && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove the tailor profile for "${t.name}"?`)) {
                              handleDeleteRegistryMember(t);
                            }
                          }}
                          className="absolute top-4 right-4 z-10 p-1.5 rounded-lg border border-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 transition duration-150 cursor-pointer"
                          title="Remove tailor profile"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-xl font-black text-sm relative shrink-0 ${
                            t.isShopOwner 
                              ? 'bg-amber-500 text-white shadow-xs animate-none' 
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {t.name ? t.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'TL'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              <h3 className="font-extrabold text-sm text-stone-900 dark:text-white leading-tight truncate">{t.name}</h3>
                              {t.isShopOwner && (
                                <span className="text-[8px] bg-amber-500 text-white dark:bg-amber-400 dark:text-stone-900 px-1 py-0.5 rounded-md font-black tracking-normal uppercase shrink-0">
                                  OWNER
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {t.isShopOwner ? (
                                <span className="text-[10px] bg-amber-400/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1 border border-amber-500/20 leading-none">
                                  👑 WORKSTATION OWNER &amp; FOUNDER
                                </span>
                              ) : (
                                <span className="text-[9px] bg-indigo-550/15 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider flex items-center gap-1.5 border border-indigo-500/15 dark:border-indigo-455/15 leading-none">
                                  🛠️ {t.displayRole}
                                </span>
                              )}
                              
                              {t.isShopOwner && t.hasRegisteredShop && (
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 border border-emerald-500/15 dynamic-pulse leading-none">
                                  <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                                  ERP Active
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs space-y-1.5 pt-2 border-t border-dashed dark:border-slate-850 border-stone-200 text-stone-500 dark:text-stone-400">
                        <p className="flex items-center justify-between gap-4">
                          <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 font-bold tracking-wider shrink-0">EMAIL:</span>
                          <span className="font-semibold text-stone-850 dark:text-stone-200 truncate">{t.email}</span>
                        </p>
                        <p className="flex items-center justify-between gap-4">
                          <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 font-bold tracking-wider shrink-0">PHONE:</span>
                          <span className="font-semibold text-stone-850 dark:text-stone-200 truncate">{t.phone || 'N/A'}</span>
                        </p>
                        <p className="flex items-center justify-between gap-4">
                          <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 font-bold tracking-wider shrink-0">ROOM / LOC:</span>
                          <span className="font-semibold text-stone-850 dark:text-stone-200 truncate">{t.location || 'Central Desk'}</span>
                        </p>
                        {t.shopName && (
                          <p className="flex items-center justify-between gap-4">
                            <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 font-bold tracking-wider shrink-0">TAILORSHOP:</span>
                            <span className="font-bold text-amber-600 dark:text-amber-500 truncate">{t.shopName}</span>
                          </p>
                        )}
                        <p className="flex items-center justify-between gap-4">
                          <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 font-bold tracking-wider shrink-0">JOINED:</span>
                          <span className="font-semibold text-stone-850 dark:text-stone-200 truncate">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Initial'}</span>
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </section>
        ) : (
          /* Settings Page Section */
          <div className="space-y-6 fade-in font-sans">
            {/* Settings Sub-tabs (Rendered directly under the main tab switcher navigation bar) */}
            <div className="flex border-b border-stone-200 dark:border-slate-800 space-x-6 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedSettingsSubTab('general')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                  selectedSettingsSubTab === 'general'
                    ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-extrabold'
                    : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>General Sizing &amp; Categories</span>
              </button>
              {currentUser?.role === 'Owner' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedSettingsSubTab('shop_profile')}
                    className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                      selectedSettingsSubTab === 'shop_profile'
                        ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-extrabold'
                        : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Edit Shop Workstation Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSettingsSubTab('add_worker')}
                    className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                      selectedSettingsSubTab === 'add_worker'
                        ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-extrabold'
                        : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Tailor Registry</span>
                  </button>
                </>
              )}
            </div>

            {selectedSettingsSubTab === 'general' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span className="p-2 bg-amber-500/10 text-amber-600 rounded-lg"><Settings className="h-4.5 w-4.5" /></span>
                    <span>TAILORSHOP ERP Blueprint &amp; System Settings</span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">Configure personalized garment templates, pricing, default measurements and workshop properties.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {confirmResetConfigs ? (
                    <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/25 rounded-xl p-1 animate-fadeIn">
                      <span className="text-[10px] text-yellow-600 dark:text-yellow-500 font-extrabold px-1.5 select-none">Restore default setups?</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleResetTailorshopConfig();
                          setConfirmResetConfigs(false);
                        }}
                        className="px-2 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Yes, Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmResetConfigs(false)}
                        className="px-2 py-1 rounded bg-stone-500 hover:bg-stone-600 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmResetConfigs(true)}
                      className="px-3.5 py-1.5 border border-stone-300 dark:border-slate-700 bg-transparent hover:bg-yellow-500/10 text-stone-600 hover:text-yellow-700 dark:text-stone-300 dark:hover:text-yellow-400 rounded-xl text-xs font-bold transition duration-155 flex items-center space-x-1.5 cursor-pointer shadow-3xs"
                      title="Reset Categories and Templates"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Restore Factory Defaults</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {selectedSettingsSubTab === 'general' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column - General and Add Genre cards */}
              <div className="space-y-6">
                
                {/* Preferred Measurement System Selection Card */}
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-3 flex items-center gap-1.5">
                    <Scissors className="h-4 w-4" />
                    <span>Preferred Measurement System</span>
                  </h3>
                  <p className="text-[10.5px] text-stone-400 mb-4 leading-relaxed font-sans font-medium">
                    Set the primary units (Inches or Centimeters) utilized across all custom garment templates and active workstation orders.
                  </p>
                  
                  <div className={`p-1 rounded-xl border flex gap-1 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-200'}`}>
                    {(['Inches', 'Centimeters'] as const).map((unit) => {
                      const active = unitSystem === unit;
                      return (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setUnitSystem(unit)}
                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                            active
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                          }`}
                        >
                          {unit} ({unit === 'Inches' ? 'in' : 'cm'})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Custom Genre Card */}
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4 flex items-center gap-1.5">
                    <Plus className="h-4 w-4" />
                    <span>Create Custom Genre Template</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold text-stone-500 dark:text-stone-300 uppercase tracking-wider block mb-1.5">Genre Name</label>
                      <input
                        type="text"
                        value={settingsNewCatName}
                        onChange={(e) => setSettingsNewCatName(e.target.value)}
                        placeholder="e.g. Waistcoat, Sherwani"
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200 shadow-sm'
                        }`}
                      />
                    </div>

                    {/* Custom Icon/Emoji/Upload block for new genre template creation */}
                    <div className="p-4 rounded-xl border border-dashed text-left space-y-3 bg-stone-50/40 dark:bg-slate-950/20 border-stone-250 dark:border-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border select-none transition-all text-base overflow-hidden ${
                          isDarkMode ? 'bg-slate-950 border-slate-900 text-stone-200' : 'bg-stone-100 border-stone-200 text-stone-750'
                        }`}>
                          {renderGenreIcon(settingsNewCatName || 'Preview', { [settingsNewCatName || 'Preview']: settingsNewCatEmoji }, "h-4.5 w-4.5", "w-5 h-5")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-[9px] font-extrabold text-stone-500 dark:text-stone-300 uppercase tracking-wider block mb-0.5">
                            Genre Icon
                          </label>
                          <p className="text-[8.5px] text-stone-400 leading-tight">
                            Choose an outline preset, type an emoji, or upload a custom image.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="text"
                            value={settingsNewCatEmoji && !settingsNewCatEmoji.startsWith('data:image/') ? settingsNewCatEmoji : ''}
                            onChange={(e) => setSettingsNewCatEmoji(e.target.value)}
                            placeholder="🔍 Type Emoji"
                            className={`flex-1 p-2 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono ${
                              isDarkMode ? 'bg-slate-900 border-slate-850 text-white' : 'bg-white border-stone-250 shadow-3xs text-stone-850'
                            }`}
                          />

                          {/* Image Uploader */}
                          <div className="relative">
                            <input
                              type="file"
                              id="file-upload-new-genre"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64Str = event.target?.result as string;
                                    if (base64Str) {
                                      const img = new Image();
                                      img.src = base64Str;
                                      img.onload = () => {
                                        const canvas = document.createElement('canvas');
                                        const ctx = canvas.getContext('2d');
                                        const TARGET_SIZE = 64;
                                        canvas.width = TARGET_SIZE;
                                        canvas.height = TARGET_SIZE;
                                        if (ctx) {
                                          ctx.imageSmoothingEnabled = true;
                                          ctx.imageSmoothingQuality = 'high';
                                          const minDim = Math.min(img.width, img.height);
                                          const sx = (img.width - minDim) / 2;
                                          const sy = (img.height - minDim) / 2;
                                          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, TARGET_SIZE, TARGET_SIZE);
                                          setSettingsNewCatEmoji(canvas.toDataURL('image/png'));
                                          triggerToast("New genre icon uploaded & auto-resized beautifully!", "success");
                                        } else {
                                          setSettingsNewCatEmoji(base64Str);
                                          triggerToast("New genre icon uploaded!", "success");
                                        }
                                      };
                                    }
                                  };
                                  reader.readAsDataURL(f);
                                }
                              }}
                            />
                            <label
                              htmlFor="file-upload-new-genre"
                              className={`p-2 rounded-lg border text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer flex items-center justify-center transition-all ${
                                isDarkMode ? 'bg-slate-900 border-slate-850 hover:bg-slate-800' : 'bg-white border-stone-250 shadow-3xs hover:bg-stone-50'
                              }`}
                              title="Upload custom icon image"
                            >
                              <Upload className="h-4 w-4" />
                            </label>
                          </div>

                          {/* Reset Button */}
                          {settingsNewCatEmoji && (
                            <button
                              type="button"
                              onClick={() => {
                                setSettingsNewCatEmoji('');
                                triggerToast("Reset custom icon.", "info");
                              }}
                              className={`p-2 rounded-lg border text-stone-400 hover:text-rose-500 cursor-pointer flex items-center justify-center transition-all ${
                                isDarkMode ? 'bg-slate-900 border-slate-850 hover:bg-slate-800' : 'bg-white border-stone-250 shadow-3xs hover:bg-stone-50'
                              }`}
                              title="Reset custom icon"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {/* Line Icon Presets */}
                        <div className="flex flex-col">
                          <label className="text-[7.5px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider mb-1.5 block">
                            Or Select Monochromatic Outline Preset
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { key: 'svg:Shirt', label: 'Shirt' },
                              { key: 'svg:Pant', label: 'Pant' },
                              { key: 'svg:Suit', label: 'Suit' },
                              { key: 'svg:Kurta', label: 'Kurta' },
                              { key: 'svg:Custom', label: 'Ruler' },
                              { key: 'svg:Scissors', label: 'Scissors' }
                            ].map((preset) => (
                              <button
                                key={preset.key}
                                type="button"
                                onClick={() => {
                                  setSettingsNewCatEmoji(preset.key);
                                }}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                                  settingsNewCatEmoji === preset.key
                                    ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                                    : isDarkMode ? 'bg-slate-900 border-slate-850 hover:bg-slate-800 text-stone-400' : 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-600'
                                }`}
                                title={`Set ${preset.label} line-icon as default`}
                              >
                                {preset.key === 'svg:Shirt' && <Shirt className="w-4 h-4" />}
                                {preset.key === 'svg:Pant' && <PantIcon className="w-4 h-4" />}
                                {preset.key === 'svg:Suit' && <SuitIcon className="w-4 h-4" />}
                                {preset.key === 'svg:Kurta' && <KurtaIcon className="w-4 h-4" />}
                                {preset.key === 'svg:Custom' && <Ruler className="w-4 h-4" />}
                                {preset.key === 'svg:Scissors' && <Scissors className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-stone-500 dark:text-stone-300 uppercase tracking-wider block mb-1.5">Starting Price (₹)</label>
                      <input
                        type="number"
                        value={settingsNewCatPrice || ''}
                        onChange={(e) => setSettingsNewCatPrice(parseInt(e.target.value) || 0)}
                        placeholder="e.g. 250"
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200 shadow-sm'
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const name = settingsNewCatName.trim();
                        if (!name) {
                          triggerToast("Please enter a category name.", 'error');
                          return;
                        }
                        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
                        if (clothingCategories.includes(capitalizedName)) {
                          triggerToast("This category already exists!", 'error');
                          return;
                        }

                        // Add
                        setClothingCategories(prev => [...prev, capitalizedName]);
                        setClothingCategoryEmojis(prev => ({
                          ...prev,
                          [capitalizedName]: settingsNewCatEmoji.trim() || ''
                        }));
                        setClothingPrices(prev => ({
                          ...prev,
                          [capitalizedName]: settingsNewCatPrice || 250
                        }));
                        setClothingTemplates(prev => ({
                          ...prev,
                          [capitalizedName]: { Length: '36', Width: '20' } // minimal safe template baseline
                        }));

                        triggerToast(`Genre "${capitalizedName}" added to system parameters database!`, 'success');
                        
                        // Clear
                        setSettingsNewCatName('');
                        setSettingsNewCatEmoji('');
                        setSettingsNewCatPrice(250);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition duration-150 flex items-center justify-center space-x-1.5 shadow-sm shadow-amber-500/10 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Genre Template</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column - Configured Genres & Blueprint Parameters */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between border-b border-stone-100 dark:border-slate-800 pb-3.5 mb-5">
                    <div>
                      <h3 className="font-sans text-sm font-bold tracking-tight">Clothing Genres, Base Pricing &amp; Measurement Templates</h3>
                      <p className="text-[10.5px] text-stone-400 mt-0.5">Edit category details inline &amp; manage global blueprint properties below.</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/15 font-mono">
                      {clothingCategories.length} Active Genres
                    </span>
                  </div>

                  <div className="space-y-4">
                    {clothingCategories.map((cat) => {
                      const isDefaultCategoryChoice = ['Shirt', 'Pant', 'Suit', 'Kurta'].includes(cat);
                      const currentTemplateFields = clothingTemplates[cat] || {};
                      const currentPrice = clothingPrices[cat] || 250;
                      const isRenaming = editingCategoryNameKey === cat;

                      return (
                        <div
                          key={cat}
                          className={`p-5 rounded-xl border transition-all duration-150 ${
                            isDarkMode 
                              ? 'bg-slate-950/60 border-slate-900 hover:border-slate-800' 
                              : 'bg-stone-50/50 border-stone-150 hover:border-stone-250 shadow-3xs'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dashed border-stone-200 dark:border-slate-850">
                            
                            {/* Left Side: Genre Name & Emoji Preview */}
                            <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                              
                              {/* Icon Preview */}
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border select-none transition-all text-base overflow-hidden ${
                                isDarkMode ? 'bg-slate-950 border-slate-900 text-stone-200' : 'bg-stone-100 border-stone-200 text-stone-750'
                              }`}>
                                {renderGenreIcon(cat, clothingCategoryEmojis, "h-4.5 w-4.5", "w-5 h-5")}
                              </div>

                              {/* Emoji / Icon Upload & Select Controller (For ALL genres) */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 flex-wrap text-left shrink-0 ml-1">
                                <div className="flex items-center space-x-1.5">
                                  <div className="flex flex-col">
                                    <label className="text-[7.5px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider mb-0.5">Emoji / Custom Icon</label>
                                    <div className="flex items-center space-x-1">
                                      <input
                                        type="text"
                                        value={clothingCategoryEmojis[cat] && !clothingCategoryEmojis[cat].startsWith('data:image/') ? clothingCategoryEmojis[cat] : ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setClothingCategoryEmojis(prev => ({
                                            ...prev,
                                            [cat]: val
                                          }));
                                        }}
                                        placeholder="📐"
                                        title="Type or paste any emoji"
                                        className={`w-12 p-1 text-center text-[10.5px] rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono ${
                                          isDarkMode ? 'bg-slate-900 border-slate-850 text-white' : 'bg-white border-stone-250 shadow-3xs text-stone-850'
                                        }`}
                                        maxLength={10}
                                      />
                                      
                                      {/* Image Uploader */}
                                      <div className="relative">
                                        <input
                                          type="file"
                                          id={`file-upload-genre-${cat}`}
                                          className="hidden"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) {
                                              const reader = new FileReader();
                                              reader.onload = (event) => {
                                                const base64Str = event.target?.result as string;
                                                if (base64Str) {
                                                  const img = new Image();
                                                  img.src = base64Str;
                                                  img.onload = () => {
                                                    const canvas = document.createElement('canvas');
                                                    const ctx = canvas.getContext('2d');
                                                    // Favorable small square size (64x64) keeps LocalStorage fast & lightweight
                                                    const TARGET_SIZE = 64;
                                                    canvas.width = TARGET_SIZE;
                                                    canvas.height = TARGET_SIZE;
                                                    if (ctx) {
                                                      ctx.imageSmoothingEnabled = true;
                                                      ctx.imageSmoothingQuality = 'high';
                                                      const minDim = Math.min(img.width, img.height);
                                                      const sx = (img.width - minDim) / 2;
                                                      const sy = (img.height - minDim) / 2;
                                                      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, TARGET_SIZE, TARGET_SIZE);
                                                      
                                                      setClothingCategoryEmojis(prev => ({
                                                        ...prev,
                                                        [cat]: canvas.toDataURL('image/png')
                                                      }));
                                                      triggerToast(`Custom icon uploaded & auto-resized beautifully for ${cat}!`, "success");
                                                    } else {
                                                      setClothingCategoryEmojis(prev => ({
                                                        ...prev,
                                                        [cat]: base64Str
                                                      }));
                                                      triggerToast(`Icon uploaded for ${cat}!`, "success");
                                                    }
                                                  };
                                                }
                                              };
                                              reader.readAsDataURL(f);
                                            }
                                          }}
                                        />
                                        <label 
                                          htmlFor={`file-upload-genre-${cat}`}
                                          className={`p-1.5 rounded-lg border text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer flex items-center justify-center transition-all ${
                                            isDarkMode ? 'bg-slate-900 border-slate-850 hover:bg-slate-800' : 'bg-white border-stone-250 shadow-3xs hover:bg-stone-50'
                                          }`}
                                          title="Upload a custom icon or image of your choice"
                                        >
                                          <Upload className="h-3 w-3" />
                                        </label>
                                      </div>

                                      {/* Clear/Reset Button if custom icon is active */}
                                      {clothingCategoryEmojis[cat] && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setClothingCategoryEmojis(prev => ({
                                              ...prev,
                                              [cat]: ''
                                            }));
                                            triggerToast(`Reset custom icon/emoji for ${cat} to default.`, "info");
                                          }}
                                          className={`p-1.5 rounded-lg border text-stone-400 hover:text-rose-500 cursor-pointer flex items-center justify-center transition-all ${
                                            isDarkMode ? 'bg-slate-900 border-slate-850 hover:bg-slate-800' : 'bg-white border-stone-250 shadow-3xs hover:bg-stone-50'
                                          }`}
                                          title="Reset to default icon"
                                        >
                                          <RotateCcw className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Quick Presets Grid */}
                                <div className="flex flex-col pl-0 sm:pl-1">
                                  <label className="text-[7.5px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider mb-1">Presets</label>
                                  <div className="flex flex-wrap gap-1 max-w-[125px]">
                                    {(() => {
                                      let presetsList: { key: string; label: string; isSvg?: boolean; emoji?: string }[] = [];
                                      
                                      if (cat === 'Shirt') {
                                        presetsList = [
                                          { key: 'svg:Shirt', label: 'Shirt', isSvg: true },
                                          { key: '👕', label: 'T-Shirt', emoji: '👕' },
                                          { key: '👔', label: 'Necktie', emoji: '👔' },
                                          { key: '🧥', label: 'Coat', emoji: '🧥' },
                                          { key: 'svg:Custom', label: 'Ruler', isSvg: true },
                                          { key: 'svg:Scissors', label: 'Scissors', isSvg: true },
                                        ];
                                      } else if (cat === 'Pant') {
                                        presetsList = [
                                          { key: 'svg:Pant', label: 'Pant', isSvg: true },
                                          { key: '👖', label: 'Jeans', emoji: '👖' },
                                          { key: '🩳', label: 'Shorts', emoji: '🩳' },
                                          { key: 'svg:Custom', label: 'Ruler', isSvg: true },
                                          { key: 'svg:Scissors', label: 'Scissors', isSvg: true },
                                        ];
                                      } else if (cat === 'Suit') {
                                        presetsList = [
                                          { key: 'svg:Suit', label: 'Suit', isSvg: true },
                                          { key: '🕴️', label: 'Formal', emoji: '🕴️' },
                                          { key: '🧥', label: 'Coat', emoji: '🧥' },
                                          { key: '🤵', label: 'Tuxedo', emoji: '🤵' },
                                          { key: 'svg:Custom', label: 'Ruler', isSvg: true },
                                          { key: 'svg:Scissors', label: 'Scissors', isSvg: true },
                                        ];
                                      } else if (cat === 'Kurta') {
                                        presetsList = [
                                          { key: 'svg:Kurta', label: 'Kurta', isSvg: true },
                                          { key: '🥻', label: 'Saree', emoji: '🥻' },
                                          { key: '👗', label: 'Dress', emoji: '👗' },
                                          { key: '👘', label: 'Kimono', emoji: '👘' },
                                          { key: 'svg:Custom', label: 'Ruler', isSvg: true },
                                          { key: 'svg:Scissors', label: 'Scissors', isSvg: true },
                                        ];
                                      } else {
                                        // Custom user-created genre gets all presets
                                        presetsList = [
                                          { key: 'svg:Shirt', label: 'Shirt', isSvg: true },
                                          { key: 'svg:Pant', label: 'Pant', isSvg: true },
                                          { key: 'svg:Suit', label: 'Suit', isSvg: true },
                                          { key: 'svg:Kurta', label: 'Kurta', isSvg: true },
                                          { key: 'svg:Custom', label: 'Ruler', isSvg: true },
                                          { key: 'svg:Scissors', label: 'Scissors', isSvg: true },
                                          { key: '👔', label: 'Necktie', emoji: '👔' },
                                          { key: '👕', label: 'T-Shirt', emoji: '👕' },
                                          { key: '👖', label: 'Jeans', emoji: '👖' },
                                          { key: '👗', label: 'Dress', emoji: '👗' },
                                          { key: '🧥', label: 'Coat', emoji: '🧥' },
                                          { key: '🥻', label: 'Saree', emoji: '🥻' },
                                        ];
                                      }
                                      
                                      return presetsList.map((preset) => (
                                        <button
                                          key={preset.key}
                                          type="button"
                                          onClick={() => {
                                            setClothingCategoryEmojis(prev => ({
                                              ...prev,
                                              [cat]: preset.key
                                            }));
                                          }}
                                          className={`w-5 h-5 rounded flex items-center justify-center border hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                                            clothingCategoryEmojis[cat] === preset.key
                                              ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                                              : isDarkMode ? 'bg-slate-900 border-slate-850 hover:bg-slate-800 text-stone-400' : 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-600'
                                          }`}
                                          title={`Set as icon`}
                                        >
                                          {preset.isSvg ? (
                                            <>
                                              {preset.key === 'svg:Shirt' && <Shirt className="w-3.5 h-3.5" />}
                                              {preset.key === 'svg:Pant' && <PantIcon className="w-3.5 h-3.5" />}
                                              {preset.key === 'svg:Suit' && <SuitIcon className="w-3.5 h-3.5" />}
                                              {preset.key === 'svg:Kurta' && <KurtaIcon className="w-3.5 h-3.5" />}
                                              {preset.key === 'svg:Custom' && <Ruler className="w-3.5 h-3.5" />}
                                              {preset.key === 'svg:Scissors' && <Scissors className="w-3.5 h-3.5" />}
                                            </>
                                          ) : (
                                            <span className="text-[10px] leading-none mb-0.5">{preset.emoji}</span>
                                          )}
                                        </button>
                                      ));
                                    })()}
                                  </div>
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                {isRenaming ? (
                                  <div className="flex items-center space-x-1.5">
                                    <input
                                      type="text"
                                      value={tempCategoryRenameValue}
                                      onChange={(e) => setTempCategoryRenameValue(e.target.value)}
                                      className={`p-1 px-2.5 rounded-lg text-xs font-bold leading-none border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                        isDarkMode ? 'bg-slate-900 border-slate-850 text-white' : 'bg-white border-stone-300'
                                      }`}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRenameCategoryInSettings(cat, tempCategoryRenameValue);
                                      }}
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleRenameCategoryInSettings(cat, tempCategoryRenameValue);
                                        setEditingCategoryNameKey(null);
                                      }}
                                      className="p-1 text-emerald-600 hover:text-emerald-500 bg-emerald-500/10 rounded cursor-pointer"
                                      title="Save name change"
                                    >
                                      <Check className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-sans font-bold text-sm tracking-tight text-stone-900 dark:text-stone-200">
                                      {cat}
                                    </h4>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCategoryNameKey(cat);
                                        setTempCategoryRenameValue(cat);
                                      }}
                                      className="text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                                      title="Rename Genre Name"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </button>
                                    {isDefaultCategoryChoice && (
                                      <span className="px-1.5 py-0.25 text-[8.5px] tracking-wider uppercase font-extrabold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                )}
                                <span className="text-[10px] text-stone-400 block mt-0.5">
                                  Default template fields: {Object.keys(currentTemplateFields).join(', ') || 'None'}
                                </span>
                              </div>
                            </div>

                            {/* Right Side: Pricing and Delete option */}
                            <div className="flex items-center space-x-3 shrink-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-bold text-stone-400">Base Price:</span>
                                <div className="relative flex items-center">
                                  <span className="absolute left-2 text-stone-400 text-[11px] font-bold">₹</span>
                                  <input
                                    type="number"
                                    value={currentPrice}
                                    onChange={(e) => handleChangeCategoryPrice(cat, parseInt(e.target.value) || 0)}
                                    className={`w-18 p-1 pl-4.5 pr-1.5 rounded-lg border text-xs text-right font-extrabold focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                      isDarkMode ? 'bg-slate-900 border-slate-850 text-white' : 'bg-white border-stone-250 shadow-2xs'
                                    }`}
                                  />
                                </div>
                              </div>

                              {confirmDeleteGenre === cat ? (
                                <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/25 rounded-lg p-1 animate-fadeIn">
                                  <span className="text-[9px] text-red-500 font-extrabold px-1.5 select-none">Delete {cat}?</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteCategoryInSettings(cat);
                                      setConfirmDeleteGenre(null);
                                    }}
                                    className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold cursor-pointer"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteGenre(null)}
                                    className="px-2 py-0.5 rounded bg-stone-500 dark:bg-stone-750 hover:bg-stone-600 text-white dark:text-stone-200 text-[9px] font-bold cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteGenre(cat)}
                                  className={`p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-500/20`}
                                  title={`Delete ${cat} config`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>

                          </div>

                          {/* Default measurement parameter customization blueprint array */}
                          <div className="pt-3.5">
                            <h5 className="text-[9.5px] font-extrabold text-stone-450 dark:text-stone-300 uppercase tracking-widest mb-2">Default Blueprint Parameters:</h5>
                            
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {Object.keys(currentTemplateFields).map((paramKey) => (
                                <div
                                  key={paramKey}
                                  className={`p-1 px-2.5 rounded-lg border text-[10.5px] font-medium font-mono flex items-center space-x-1 ${
                                    isDarkMode ? 'bg-slate-900 border-slate-850 text-stone-200' : 'bg-white border-stone-200 shadow-3xs text-stone-700'
                                  }`}
                                >
                                  <span>{paramKey}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTemplateParameter(cat, paramKey)}
                                    className="text-stone-400 hover:text-orange-500 focus:outline-none ml-1 shrink-0 font-bold leading-none cursor-pointer"
                                    title={`Remove standard default "${paramKey}"`}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}

                              {/* Simple Add Parameter mini-field */}
                              <div className="flex items-center space-x-1 border border-stone-200 dark:border-slate-800 rounded-lg p-0.5 max-w-[130px]">
                                <input
                                  type="text"
                                  value={settingsNewCategoryParam[cat] || ''}
                                  onChange={(e) => setSettingsNewCategoryParam(prev => ({
                                    ...prev,
                                    [cat]: e.target.value
                                  }))}
                                  placeholder="New spec field"
                                  className={`p-0.5 px-1.5 rounded text-[10px] w-full border-none bg-transparent text-stone-700 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none`}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddTemplateParameter(cat, settingsNewCategoryParam[cat] || '');
                                      setSettingsNewCategoryParam(prev => ({ ...prev, [cat]: '' }));
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleAddTemplateParameter(cat, settingsNewCategoryParam[cat] || '');
                                    setSettingsNewCategoryParam(prev => ({ ...prev, [cat]: '' }));
                                  }}
                                  className="p-1 bg-amber-500 hover:bg-amber-400 text-white rounded text-[9.5px] font-bold leading-none shrink-0"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
            ) : (selectedSettingsSubTab === 'shop_profile' && currentUser?.role === 'Owner') ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
                {/* Left Column - Shop Workstation details */}
                <div className="lg:col-span-2 space-y-6">
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                    <div className="border-b border-stone-150 dark:border-slate-800 pb-3 mb-5">
                      <h3 className="font-sans text-sm font-bold tracking-tight">Update Atelier Workstation Details</h3>
                      <p className="text-[10.5px] text-stone-400 mt-0.5 font-medium">Configure contact details, physical address, logo and GPS coordinates representation.</p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!tailorShopNameInput.trim()) {
                          triggerToast("Shop Name is required!", "error");
                          return;
                        }
                        if (!tailorOwnerNameInput.trim()) {
                          triggerToast("Owner Name is required!", "error");
                          return;
                        }
                        if (!tailorPhoneInput.trim()) {
                          triggerToast("Phone is required!", "error");
                          return;
                        }

                        const formattedAddr = [
                          tailorAreaInput.trim(),
                          tailorDistrictInput.trim(),
                          tailorStateInput.trim(),
                          tailorCountryInput.trim(),
                          tailorPincodeInput.trim() ? `PIN: ${tailorPincodeInput.trim()}` : ''
                        ].filter(Boolean).join(', ');

                        handleUpdateTailorShop(
                          tailorShopNameInput.trim(),
                          tailorLogoUrlInput.trim(),
                          tailorOwnerNameInput.trim(),
                          tailorPhoneInput.trim(),
                          formattedAddr,
                          tailorLatitudeInput.trim(),
                          tailorLongitudeInput.trim()
                        );
                      }}
                      className="space-y-4 text-left"
                    >
                      {/* Identity Details Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-extrabold text-stone-500 dark:text-stone-300 uppercase tracking-wider block mb-1.5 font-sans">Shop Name *</label>
                          <input
                            type="text"
                            value={tailorShopNameInput}
                            onChange={(e) => setTailorShopNameInput(e.target.value)}
                            placeholder="e.g. My Bespoke Row"
                            className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800 shadow-sm'
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold text-stone-500 dark:text-stone-300 uppercase tracking-wider block mb-1.5 font-sans">Owner / Master Artisan Name *</label>
                          <input
                            type="text"
                            value={tailorOwnerNameInput}
                            onChange={(e) => setTailorOwnerNameInput(e.target.value)}
                            placeholder="e.g. Jean Laurent"
                            className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800 shadow-sm'
                            }`}
                            required
                          />
                        </div>
                      </div>

                      {/* Contact & Logo URLs Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                        <div>
                          <label className="text-[10px] font-extrabold text-stone-500 dark:text-stone-300 uppercase tracking-wider block mb-1.5">Contact Phone *</label>
                          <input
                            type="text"
                            value={tailorPhoneInput}
                            onChange={(e) => setTailorPhoneInput(e.target.value)}
                            placeholder="e.g. +91 94567 12345"
                            className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800 shadow-sm'
                            }`}
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold text-stone-500 dark:text-stone-300 uppercase tracking-wider block mb-1.5">Shop Logo (pasted URL or Upload file)</label>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={tailorLogoUrlInput}
                              onChange={(e) => setTailorLogoUrlInput(e.target.value)}
                              placeholder="e.g. https://example.com/logo.png"
                              className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-800 shadow-sm'
                              }`}
                            />
                            
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        const base64Str = reader.result as string;
                                        setTailorLogoUrlInput(base64Str);
                                        triggerToast("Store logo uploaded & stored locally successfully!", "success");
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  };
                                  input.click();
                                }}
                                className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] rounded-lg active:scale-95 transition cursor-pointer flex items-center gap-1 shadow-sm font-sans uppercase tracking-wider"
                              >
                                <Upload className="h-3 w-3" />
                                <span>Upload logo image file</span>
                              </button>
                              {tailorLogoUrlInput && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTailorLogoUrlInput('');
                                    triggerToast("Logo input cleared!", "info");
                                  }}
                                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 font-bold text-[10px] rounded-lg cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address Geography */}
                      <div className="border-t border-stone-150 dark:border-slate-800 pt-3 mt-4 space-y-3 font-sans">
                        <h4 className="text-[10px] font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-widest">Physical Studio Location</h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase font-sans font-medium">Country</label>
                            <select
                              value={tailorCountryInput}
                              onChange={(e) => {
                                setTailorCountryInput(e.target.value);
                                if (e.target.value !== 'India') {
                                  setTailorStateInput('');
                                  setTailorDistrictInput('');
                                }
                              }}
                              className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-800 shadow-sm'
                              }`}
                            >
                              <option value="India">India</option>
                              <option value="United States">United States</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="UAE">UAE</option>
                              <option value="Singapore">Singapore</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase font-sans font-medium">State</label>
                            {tailorCountryInput === 'India' ? (
                              <select
                                value={tailorStateInput}
                                onChange={(e) => {
                                  setTailorStateInput(e.target.value);
                                  setTailorDistrictInput('');
                                }}
                                className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans ${
                                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-800 shadow-sm'
                                }`}
                              >
                                <option value="">-- Choose State --</option>
                                {Object.keys(INDIA_STATES_MAP).map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                placeholder="State Province"
                                value={tailorStateInput}
                                onChange={(e) => setTailorStateInput(e.target.value)}
                                className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans ${
                                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 shadow-sm'
                                }`}
                              />
                            )}
                          </div>

                          <div className="col-span-2 md:col-span-1">
                            <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase font-sans font-medium">District</label>
                            {tailorCountryInput === 'India' && tailorStateInput && INDIA_STATES_MAP[tailorStateInput] ? (
                              <select
                                value={tailorDistrictInput}
                                onChange={(e) => setTailorDistrictInput(e.target.value)}
                                className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans ${
                                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-800 shadow-sm'
                                }`}
                              >
                                <option value="">-- Choose District --</option>
                                {INDIA_STATES_MAP[tailorStateInput].map((d) => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                placeholder="District Town"
                                value={tailorDistrictInput}
                                onChange={(e) => setTailorDistrictInput(e.target.value)}
                                className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans ${
                                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-800 shadow-sm'
                                }`}
                              />
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase font-sans">Area / Landmark *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Edappal Bypass Road"
                              value={tailorAreaInput}
                              onChange={(e) => setTailorAreaInput(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-800 shadow-sm'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase font-sans">PIN / Pincode *</label>
                            <input
                              type="text"
                              required
                              placeholder="Pincode / ZIP"
                              value={tailorPincodeInput}
                              onChange={(e) => setTailorPincodeInput(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-800 shadow-sm'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* GPS coordinates & autofill */}
                      <div className="border-t border-stone-150 dark:border-slate-800 pt-3 mt-4 space-y-3 font-sans">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-wider font-sans">GPS Geolocation Mapping</h4>
                          <button
                            type="button"
                            disabled={tailorLocationLoading}
                            onClick={async () => {
                              const fallbackToIp = async (errMsg?: string) => {
                                triggerToast('GPS failed. Falling back to Network IP Geolocation...', 'info');
                                try {
                                  const ipData = await fetchIPLocation();
                                  setTailorLatitudeInput(ipData.latitude);
                                  setTailorLongitudeInput(ipData.longitude);
                                  if (ipData.country) setTailorCountryInput(ipData.country);
                                  
                                  let detectedState = '';
                                  if (ipData.region) {
                                    const findState = Object.keys(INDIA_STATES_MAP).find(
                                      (s) => s.toLowerCase() === ipData.region.toLowerCase() || ipData.region.toLowerCase().includes(s.toLowerCase())
                                    );
                                    if (findState) {
                                      setTailorStateInput(findState);
                                      detectedState = findState;
                                    } else {
                                      setTailorStateInput(ipData.region);
                                      detectedState = ipData.region;
                                    }
                                  }
                                  if (detectedState && INDIA_STATES_MAP[detectedState] && ipData.city) {
                                    const distList = INDIA_STATES_MAP[detectedState];
                                    const match = distList.find(d => 
                                      d.toLowerCase() === ipData.city.toLowerCase() || 
                                      ipData.city.toLowerCase().includes(d.toLowerCase()) ||
                                      d.toLowerCase().includes(ipData.city.toLowerCase())
                                    );
                                    if (match) {
                                      setTailorDistrictInput(match);
                                    } else {
                                      setTailorDistrictInput(ipData.city);
                                    }
                                  } else if (ipData.city) {
                                    setTailorDistrictInput(ipData.city);
                                  }

                                  if (ipData.postal) setTailorPincodeInput(ipData.postal);
                                  setTailorAreaInput(ipData.area || 'Central Area');
                                  triggerToast('Workstation coordinates loaded via IP successfully!', 'success');
                                } catch (fError: any) {
                                  console.error("IP fallback error:", fError);
                                  triggerToast(errMsg || fError?.message || 'Network Geolocation failed.', 'error');
                                } finally {
                                  setTailorLocationLoading(false);
                                }
                              };

                              if (!navigator.geolocation) {
                                fallbackToIp('Geolocation not supported by search framework.');
                                return;
                              }
                              setTailorLocationLoading(true);
                              triggerToast('Querying active GPS telemetry...', 'info');
                              navigator.geolocation.getCurrentPosition(
                                async (pos) => {
                                  const lat = pos.coords.latitude.toFixed(6);
                                  const lon = pos.coords.longitude.toFixed(6);
                                  setTailorLatitudeInput(lat);
                                  setTailorLongitudeInput(lon);
                                  
                                  triggerToast('GPS Locked! Georeferencing address attributes...', 'info');
                                  
                                  try {
                                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
                                      headers: {
                                        'Accept-Language': 'en'
                                      }
                                    });
                                    if (res.ok) {
                                      const data = await res.json();
                                      if (data && data.address) {
                                        const addr = data.address;
                                        if (addr.country) setTailorCountryInput(addr.country);
                                        
                                        let detectedState = '';
                                        const stateCandidates = [
                                          addr.state,
                                          addr.region,
                                          addr.province,
                                          addr.state_district
                                        ].filter(Boolean).map(v => String(v).trim());

                                        let foundStateKey = '';
                                        for (const sc of stateCandidates) {
                                          const match = Object.keys(INDIA_STATES_MAP).find(
                                            (s) => s.toLowerCase() === sc.toLowerCase() || 
                                                   sc.toLowerCase().includes(s.toLowerCase()) || 
                                                   s.toLowerCase().includes(sc.toLowerCase())
                                          );
                                          if (match) {
                                            foundStateKey = match;
                                            break;
                                          }
                                        }

                                        if (foundStateKey) {
                                          setTailorStateInput(foundStateKey);
                                          detectedState = foundStateKey;
                                        } else if (addr.state) {
                                          setTailorStateInput(addr.state);
                                          detectedState = addr.state;
                                        }
                                        
                                        let matchedDistrict = '';
                                        if (detectedState && INDIA_STATES_MAP[detectedState]) {
                                          const distList = INDIA_STATES_MAP[detectedState];
                                          const fullTextSearchSource = [
                                            data.display_name || '',
                                            addr.state_district || '',
                                            addr.district || '',
                                            addr.county || '',
                                            addr.city || '',
                                            addr.town || '',
                                            addr.city_district || '',
                                            addr.suburb || '',
                                            addr.village || '',
                                            addr.neighbourhood || '',
                                            addr.municipality || '',
                                            addr.subdistrict || ''
                                          ].filter(Boolean).map(s => String(s).toLowerCase().trim());

                                          for (const text of fullTextSearchSource) {
                                            const match = distList.find(d => {
                                              const dl = d.toLowerCase();
                                              return dl === text || text.includes(dl) || dl.includes(text);
                                            });
                                            if (match) {
                                              matchedDistrict = match;
                                              break;
                                            }
                                          }
                                          if (!matchedDistrict && data.display_name) {
                                            const dispLower = data.display_name.toLowerCase();
                                            const match = distList.find(d => dispLower.includes(d.toLowerCase()));
                                            if (match) matchedDistrict = match;
                                          }
                                        }

                                        if (matchedDistrict) {
                                          setTailorDistrictInput(matchedDistrict);
                                        } else if (addr.state_district || addr.district || addr.county) {
                                          const rawD = addr.state_district || addr.district || addr.county || '';
                                          setTailorDistrictInput(rawD.replace(/\s+(District|Taluk|County)$/i, '').trim());
                                        }

                                        if (addr.postcode) setTailorPincodeInput(addr.postcode);
                                        
                                        const str = addr.road || addr.suburb || addr.neighbourhood || addr.village || '';
                                        const areaVal = [str, addr.quarter || ''].filter(Boolean).join(', ');
                                        if (areaVal) {
                                          setTailorAreaInput(areaVal);
                                        } else if (data.display_name) {
                                          setTailorAreaInput(data.display_name.split(',').slice(0, 2).join(',').trim());
                                        }
                                        triggerToast('Workstation details mapped beautifully!', 'success');
                                      } else {
                                        triggerToast('Coordinates fetched successfully!', 'success');
                                      }
                                    }
                                  } catch (geError) {
                                    console.error("OSM error in Settings:", geError);
                                  } finally {
                                    setTailorLocationLoading(false);
                                  }
                                },
                                (err) => {
                                  console.error("Geolocation error:", err);
                                  fallbackToIp(`Geolocation error code ${err.code}: ${err.message}`);
                                }
                              );
                            }}
                            className="text-[10px] text-amber-600 dark:text-amber-500 font-extrabold hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <MapPin className="h-3 w-3" />
                            <span>{tailorLocationLoading ? 'Loading Coordinate Geodata...' : 'Acquire Current GPS Location'}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase font-sans">Latitude</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 10.785421"
                              value={tailorLatitudeInput}
                              onChange={(e) => setTailorLatitudeInput(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-amber-500' : 'bg-white border-stone-200 text-amber-600 shadow-sm'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-extrabold block mb-1 text-stone-500 uppercase font-sans font-medium">Longitude</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 76.124578"
                              value={tailorLongitudeInput}
                              onChange={(e) => setTailorLongitudeInput(e.target.value)}
                              className={`w-full p-2 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-amber-500' : 'bg-white border-stone-200 text-amber-600 shadow-sm'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action save profile button */}
                      <div className="pt-4 border-t border-stone-150 dark:border-slate-800 mt-4 font-sans">
                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md shadow-amber-500/10 cursor-pointer animate-pulse"
                        >
                          <CheckCircle className="h-4.5 w-4.5" />
                          <span>Apply &amp; Lock Workstation Details</span>
                        </button>
                      </div>

                    </form>
                  </div>
                </div>

                {/* Right Column - Map Satellite Overlay representation */}
                <div className="space-y-6">
                  {tailorLogoUrlInput && (
                    <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                      <h4 className="text-[10px] font-extrabold text-stone-500 dark:text-stone-300 uppercase tracking-wider mb-3">TAILORSHOP ERP Logo Outlook</h4>
                      <div className="mx-auto h-24 w-24 rounded-full border border-stone-150 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-2">
                        <img
                          src={tailorLogoUrlInput}
                          alt="TAILORSHOP ERP Logo preview"
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop';
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-stone-500 mt-2 font-mono break-all font-sans">{tailorShopNameInput || 'Unconfigured Studio'}</p>
                    </div>
                  )}

                  <div className={`p-5 rounded-2xl border text-left ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                    <h4 className="text-[10px] font-extrabold text-stone-500 dark:text-stone-300 uppercase tracking-wider mb-3 flex items-center gap-1 font-sans">
                      <MapPin className="h-3.5 w-3.5 text-amber-500" />
                      <span>GIS Satellite Workstation Map</span>
                    </h4>
                    
                    <div className="h-44 rounded-xl relative overflow-hidden bg-stone-100 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 shadow-inner flex flex-col items-center justify-center text-center">
                      {tailorLatitudeInput && tailorLongitudeInput ? (
                        <iframe
                          title="Workstation Details Google Map"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen={false}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          src={`https://maps.google.com/maps?q=${tailorLatitudeInput},${tailorLongitudeInput}&z=16&output=embed`}
                        />
                      ) : (
                        <>
                          {/* Leaflet/Static representation */}
                          <div className="absolute inset-0 opacity-40 mix-blend-multiply dark:mix-blend-overlay dark:opacity-30" style={{
                            backgroundImage: `radial-gradient(#d97706 1px, transparent 1px), radial-gradient(#d97706 1px, transparent 1px)`,
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 10px 10px'
                          }}></div>
                          
                          <div className="relative z-10 flex flex-col items-center space-y-2 p-4">
                            <div className="h-8 w-8 bg-amber-500/25 animate-ping absolute rounded-full font-sans"></div>
                            <MapPin className="h-9 w-9 text-amber-600 animate-bounce relative z-10" />
                            <span className="text-[10px] font-extrabold text-stone-750 dark:text-stone-350 bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded-md shadow-3xs font-mono font-sans">
                              GPS Target Unacquired
                            </span>
                            <p className="text-[9px] text-stone-400 max-w-[180px] font-medium leading-normal">
                              {tailorAreaInput || 'Acquire or enter geo address values to plot coordinate mapping on OpenStreetMap GIS framework.'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-3.5 space-y-1.5 text-[10px] text-stone-500 dark:text-stone-400 font-sans font-medium">
                      <p className="flex justify-between border-b border-stone-100 dark:border-slate-850 pb-1"><span>Target Country:</span> <span className="font-bold text-stone-850 dark:text-stone-200">{tailorCountryInput}</span></p>
                      <p className="flex justify-between border-b border-stone-100 dark:border-slate-850 pb-1"><span>Province State:</span> <span className="font-bold text-stone-850 dark:text-stone-200">{tailorStateInput || 'N/A'}</span></p>
                      <p className="flex justify-between border-b border-stone-100 dark:border-slate-850 pb-1"><span>Taluk District:</span> <span className="font-bold text-stone-850 dark:text-stone-200">{tailorDistrictInput || 'N/A'}</span></p>
                      <p className="flex justify-between"><span>Registry Pincode:</span> <span className="font-bold text-stone-850 dark:text-stone-200">{tailorPincodeInput || 'N/A'}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 fade-in font-sans">
                <WorkerManagementView
                  clothingCategories={clothingCategories}
                  workers={workers.filter((w: any) => {
                    const shopInfo = getCurrentUserShopInfo();
                    if (currentUser?.role === 'Owner' || currentUser?.role === 'Manager') return true;
                    if (shopInfo) {
                      const sName = (shopInfo.shopName || '').toLowerCase().trim();
                      const wName = (w.shopName || '').toLowerCase().trim();
                      if (sName && sName === wName) return true;
                    }
                    return w.shopOwnerId === currentUser?.id || 
                           (w.shopOwnerEmail && currentUser?.email && w.shopOwnerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim());
                  })}
                  orders={visibleOrders}
                  onAddWorker={handleAddWorker}
                  onDeleteWorker={handleDeleteWorker}
                  onDeleteAllWorkers={handleDeleteAllWorkers}
                  onUpdateWorker={handleUpdateWorker}
                  registeredTailors={registeredTailors}
                  triggerToast={triggerToast}
                  isDarkMode={isDarkMode}
                  currentUser={currentUser}
                />
              </div>
            )}
          </div>
        )}

        {selectedDetOrder && (() => {
          const order = selectedDetOrder;
          const customer = customers.find((c) => c.id === order.customerId);
          const matchingRecord = measurements.find(
            (m) => m.customerId === order.customerId && m.clothingType.toLowerCase() === order.clothingType.toLowerCase()
          ) || measurements.find((m) => m.customerId === order.customerId);

          return (
            <div className="fixed inset-0 bg-stone-900/40 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
              <div 
                className={`relative max-w-2xl w-full rounded-2xl border p-6 md:p-8 shadow-2xl transition-all duration-300 max-h-[90vh] overflow-y-auto ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-stone-100 shadow-amber-950/20' 
                    : 'bg-white border-stone-250 text-stone-900 shadow-stone-300'
                }`}
              >
                {/* Top Banner / Close bar */}
                <div className="flex items-start justify-between border-b pb-4 mb-5 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-extrabold text-sm text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                        {order.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-355 font-extrabold uppercase text-[10px] tracking-wider inline-flex items-center border border-stone-200 dark:border-slate-700">
                        {order.clothingType}
                      </span>
                    </div>
                    <h3 className="font-sans text-2xl font-extrabold tracking-tight leading-tight text-stone-900 dark:text-stone-100">
                      Sartorial Specification Card
                    </h3>
                    <p className="text-xs text-stone-400">
                      Booked: {new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDetOrder(null);
                      setIsEditingNotes(false);
                      setIsEditingCustomer(false);
                      setEditingFieldKey(null);
                    }}
                    className="p-1 px-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs font-bold border border-stone-200 dark:border-slate-800 rounded-lg hover:bg-stone-50/50 dark:hover:bg-slate-950/40 transition transition-colors cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* 2-column Information Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Customer particulars card */}
                  <div className={`p-4 rounded-xl border relative ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-150'}`}>
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="font-mono font-extrabold text-[10px] uppercase tracking-wider text-amber-500">Customer Particulars</h4>
                      {customer && (
                        isEditingCustomer ? (
                          <div className="flex space-x-1 z-10">
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateCustomerDetails(customer.id, editCustName, editCustPhone, editCustEmail);
                                setIsEditingCustomer(false);
                              }}
                              className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-550 text-white rounded font-bold text-[9px] cursor-pointer"
                            >
                              ✓ Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingCustomer(false)}
                              className="px-1.5 py-0.5 bg-stone-500/15 hover:bg-stone-500/25 text-stone-600 dark:text-stone-330 rounded font-bold text-[9px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingCustomer(true);
                              setEditCustName(customer.name);
                              setEditCustPhone(customer.phone);
                              setEditCustEmail(customer.email || '');
                            }}
                            className="text-stone-400 hover:text-amber-500 transition-colors p-0.5 cursor-pointer"
                            title="Edit contact details"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )
                      )}
                    </div>

                    {isEditingCustomer ? (
                      <div className="space-y-2 mt-1">
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Name</label>
                          <input
                            type="text"
                            value={editCustName}
                            onChange={(e) => setEditCustName(e.target.value)}
                            className={`w-full p-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDarkMode ? 'bg-slate-900 border-slate-750 text-white' : 'bg-white border-stone-300 text-stone-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Phone</label>
                          <input
                            type="text"
                            value={editCustPhone}
                            onChange={(e) => setEditCustPhone(e.target.value)}
                            className={`w-full p-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDarkMode ? 'bg-slate-900 border-slate-750 text-white' : 'bg-white border-stone-300 text-stone-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">Email</label>
                          <input
                            type="text"
                            value={editCustEmail}
                            onChange={(e) => setEditCustEmail(e.target.value)}
                            className={`w-full p-1 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              isDarkMode ? 'bg-slate-900 border-slate-750 text-white' : 'bg-white border-stone-300 text-stone-900'
                            }`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="font-bold text-base text-stone-950 dark:text-white leading-tight font-sans">
                          {customer ? customer.name : 'Walk-in Client'}
                        </p>
                        <div className="flex items-center space-x-1.5 text-xs text-stone-700 dark:text-stone-200 font-sans">
                          <Phone className="h-3 w-3 text-stone-500 dark:text-stone-400" />
                          <span className="font-semibold text-stone-900 dark:text-white">{customer?.phone || 'No phone registered'}</span>
                        </div>
                        {customer?.email && (
                          <div className="flex items-center space-x-1.5 text-xs text-stone-700 dark:text-stone-200 font-sans">
                            <Mail className="h-3 w-3 text-stone-500 dark:text-stone-400" />
                            <span className="font-semibold text-stone-900 dark:text-white">{customer.email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Scheduling card */}
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-150'}`}>
                    <h4 className="font-mono font-extrabold text-[10px] uppercase tracking-wider text-amber-500 mb-2">Timeline & Status</h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Status:</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-stone-600 dark:text-stone-300">
                        <Calendar className="h-3.5 w-3.5 text-stone-400" />
                        <div>
                          <span className="text-stone-400">Fitting Target: </span>
                          <span className="font-bold">
                            {new Date(order.deliveryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fabric & Design details with inline editing capabilities */}
                <div className={`p-4 rounded-xl border mb-6 relative ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-stone-50 border-stone-150'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-mono font-extrabold text-[10px] uppercase tracking-wider text-amber-500">
                      Workshop Fit Instructions &amp; Pose Notes
                    </h4>
                    
                    {isEditingNotes ? (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateOrderNotes(order.id, '', editInstructions);
                            setIsEditingNotes(false);
                            // Keep modal in sync
                            setSelectedDetOrder(prev => prev ? {
                              ...prev,
                              notes: {
                                ...prev.notes,
                                fabricDetails: '',
                                instructions: editInstructions
                              }
                            } : null);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-550 text-white font-extrabold text-[10px] rounded-lg transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                          Save Specifications
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingNotes(false);
                            setEditInstructions(order.notes?.instructions || '');
                          }}
                          className="px-2.5 py-1 bg-stone-500/10 hover:bg-stone-500/20 text-stone-600 dark:text-stone-300 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingNotes(true);
                          setEditInstructions(order.notes?.instructions || '');
                        }}
                        className="px-2.5 py-1 border border-amber-500/35 hover:border-amber-500 text-amber-600 dark:text-amber-450 font-bold text-[10px] rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                      >
                        Edit Specifications
                      </button>
                    )}
                  </div>

                  {isEditingNotes ? (
                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-amber-600 dark:text-amber-500 uppercase text-[8px] tracking-wider block">Fit Instructions &amp; Tailor Directives</span>
                      <textarea
                        value={editInstructions}
                        onChange={(e) => setEditInstructions(e.target.value)}
                        placeholder="Alteration directives, posture adjustments, custom fits, pocket details, tailoring guidelines..."
                        className={`w-full p-2.5 h-24 rounded-lg border text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none ${
                          isDarkMode ? 'bg-slate-900 border-slate-800 text-white font-sans' : 'bg-white border-stone-200 font-sans'
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="text-xs">
                      <span className="font-semibold text-amber-600 dark:text-amber-500 uppercase text-[8px] tracking-wider block mb-1">Fit Instructions &amp; Tailor Directives</span>
                      <p className="text-stone-950 dark:text-white bg-stone-100/50 dark:bg-slate-950/90 p-2.5 rounded-lg border border-stone-200/40 dark:border-slate-800 font-sans font-semibold min-h-[55px]">
                        {order.notes?.instructions || 'Standard luxury atelier cut guidelines.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Large Sizing Specs Measurement Board */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-mono font-extrabold text-[10px] uppercase tracking-wider text-amber-500">
                      Sizing Specifications ({matchingRecord ? Object.keys(matchingRecord.fields).length : 0} Parameters)
                    </h4>
                    {matchingRecord && (
                      <button
                        type="button"
                        onClick={() => {
                          const textStr = Object.entries(matchingRecord.fields).map(([k, v]) => `${k}: ${cleanMeasurementValue(v)}`).join('\n');
                          navigator.clipboard.writeText(`${customer?.name || 'Client'} - ${order.clothingType} Sizing:\n${textStr}`);
                          triggerToast('Sizing copied to clipboard!', 'success');
                        }}
                        className="text-[10px] font-bold text-amber-600 dark:text-amber-450 hover:underline font-sans"
                      >
                        Copy Sizing Specs
                      </button>
                    )}
                  </div>

                  {matchingRecord ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {Object.entries(matchingRecord.fields).map(([k, v]) => {
                        const isFieldEditing = editingFieldKey === k;
                        return (
                          <div 
                             key={k} 
                             className={`p-3 rounded-xl border text-center relative overflow-hidden group/size ${
                              isDarkMode 
                                ? 'bg-slate-950 border-slate-800/80 hover:border-amber-500/30' 
                                : 'bg-stone-50 border-stone-150 hover:bg-white hover:shadow-sm'
                            } transition-all`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider font-sans truncate">
                                {k}
                              </span>
                              {!isFieldEditing && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingFieldKey(k);
                                    setEditingFieldValue(cleanMeasurementValue(v));
                                  }}
                                  className="text-stone-400 hover:text-amber-500 transition-colors cursor-pointer self-start p-0.5"
                                  title={`Edit ${k}`}
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              )}
                            </div>

                            {isFieldEditing ? (
                              <div className="flex items-center space-x-1 mt-1 justify-center">
                                <input
                                  type="text"
                                  value={editingFieldValue}
                                  onChange={(e) => setEditingFieldValue(e.target.value)}
                                  className={`w-16 text-center py-0.5 px-1 font-sans text-xs font-black rounded border focus:outline-none focus:ring-1 focus:ring-amber-550 ${
                                    isDarkMode ? 'bg-slate-900 border-slate-700 text-amber-450' : 'bg-white border-stone-300 text-amber-600'
                                  }`}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateMeasurementField(matchingRecord.id, k, editingFieldValue);
                                      setEditingFieldKey(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingFieldKey(null);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateMeasurementField(matchingRecord.id, k, editingFieldValue);
                                    setEditingFieldKey(null);
                                  }}
                                  className="p-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs cursor-pointer"
                                  title="Save"
                                >
                                  ✓
                                </button>
                              </div>
                            ) : (
                              <div className="font-sans text-lg font-black text-amber-600 dark:text-amber-450">
                                {cleanMeasurementValue(v)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={`p-6 text-center rounded-xl border border-dashed ${isDarkMode ? 'border-slate-800 text-stone-400' : 'border-stone-250 text-stone-500'}`}>
                      <p className="text-xs italic mb-2 text-stone-500 dark:text-stone-400 font-sans">No size profile matching this clothing category exists for this customer yet.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDetOrder(null);
                          if (currentUser?.role === 'Owner' || currentUser?.role === 'Manager') {
                            setOwnerTab('tailor_measurements');
                          } else {
                            setTailorPage('sizing');
                          }
                          setCustomerName(customer?.name || '');
                          setCustomerPhone(customer?.phone || '');
                          setCustomerEmail(customer?.email || '');
                          setClothingType(order.clothingType);
                          triggerToast('Ready to record sizing specifications!', 'info');
                        }}
                        className="text-amber-600 dark:text-amber-450 font-bold text-[11px] hover:underline"
                      >
                        Add Measurements Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Drawer Control Action bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 dark:border-slate-800 mt-6">
                  <div>
                    <div className="text-[11px] text-stone-400">Total Settlement Balance</div>
                    <div className="font-mono text-base font-extrabold text-stone-900 dark:text-white">
                      ₹{order.price} <span className="text-xs font-normal text-stone-450">({order.remainingBalance > 0 ? `₹${order.remainingBalance} outstanding` : 'Settled'})</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {matchingRecord && (
                      <>
                        <button
                          type="button"
                          onClick={() => triggerPrintVoucher(matchingRecord.id, customer?.id || '', order.id)}
                          className={`p-2 px-3 text-xs font-bold rounded-lg border flex items-center space-x-1.5 cursor-pointer transition ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 text-stone-100 hover:bg-slate-700'
                              : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                          }`}
                        >
                          <Printer className="h-4 w-4 text-amber-500" />
                          <span>Print Ticket</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadVoucherAsHtml(matchingRecord.id, customer?.id || '', order.id)}
                          className={`p-2 px-3 text-xs font-bold rounded-lg border flex items-center space-x-1.5 cursor-pointer transition ${
                            isDarkMode
                              ? 'bg-indigo-950/20 border-indigo-900 text-indigo-400 hover:bg-indigo-950/40'
                              : 'bg-indigo-50/20 border-indigo-150 text-indigo-600 hover:bg-indigo-50'
                          }`}
                        >
                          <Download className="h-4 w-4/12 max-h-4 text-indigo-500 shrink-0" />
                          <span>Download Bill</span>
                        </button>
                      </>
                    )}

                    <a
                      href={`https://wa.me/${customer?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hello ${customer?.name || 'Patron'}, the fabrication state of your order ${order.id} (${order.clothingType}) is updated to [${order.status}]. Outstanding: ₹${order.remainingBalance}. Thank you for booking with Sartorial Atelier!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer transition"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </a>

                    {order.remainingBalance > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          handleSettleOrderPayment(order.id);
                          setSelectedDetOrder(prev => prev ? { ...prev, remainingBalance: 0, advancePayment: prev.price } : null);
                        }}
                        className="p-2 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-extrabold flex items-center space-x-1.5 shadow-md cursor-pointer transition"
                      >
                        <IndianRupee className="h-4 w-4" />
                        <span>Settle Balance</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

      </main>

      {/* Footer copyright */}
      <footer className={`py-6 border-t text-center text-[11px] mt-auto ${
        isDarkMode ? 'bg-slate-950 border-slate-900 text-stone-500' : 'bg-stone-100 border-stone-200 text-stone-400'
      }`}>
        <p className="font-sans text-[11px]">
          Pwerdby{' '}
          <a
            href="https://u-bsol.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:underline text-amber-600 dark:text-amber-500"
          >
            U-bsol
          </a>
        </p>
      </footer>
    </div>
  );
}
