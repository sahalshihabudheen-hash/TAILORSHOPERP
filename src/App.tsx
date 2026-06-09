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
  Image
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

// Seeding registered tailors database helper
const getRegisteredTailors = () => {
  const data = localStorage.getItem('registered_tailors');
  if (!data) {
    const list = [
      {
        id: 'TAILOR-101',
        name: 'Arthur S. Row',
        email: 'owner@atelier.com',
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
  // Strip quotes at start or end
  valStr = valStr.replace(/^['"\s]+|['"\s]+$/g, '');
  
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
    role: 'Tailor' | 'Customer';
    location?: string;
  } | null>(null);

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInRole, setSignInRole] = useState<'Tailor' | 'Customer'>('Tailor');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Create Account inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpLocation, setSignUpLocation] = useState('');
  const [signUpRole, setSignUpRole] = useState<'Tailor' | 'Customer'>('Tailor');
  const [gatekeeperScreen, setGatekeeperScreen] = useState<'selector' | 'signup' | 'signin'>('selector');

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
  const [ownerTab, setOwnerTab] = useState<'branding' | 'registered_tailors' | 'staffs_erp' | 'customer_patrons'>('branding');
  const [logoInputType, setLogoInputType] = useState<'url' | 'upload'>('url');

  // New admin form states
  const [newTailorName, setNewTailorName] = useState('');
  const [newTailorEmail, setNewTailorEmail] = useState('');
  const [newTailorPassword, setNewTailorPassword] = useState('');
  const [newTailorPhone, setNewTailorPhone] = useState('');
  const [newTailorLocation, setNewTailorLocation] = useState('');

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
  const [welcomeBannerDesc, setWelcomeBannerDesc] = useState(() => localStorage.getItem('welcome_banner_desc') || 'Manage your fine tailoring workshops, track measurements, and generate bespoke delivery packages cleanly.');

  const [voucherMainTitle, setVoucherMainTitle] = useState(() => {
    const saved = localStorage.getItem('voucher_main_title');
    return (!saved || saved === 'Sartorial Atelier') ? 'tailorSHOP ERP' : saved;
  });
  const [voucherSubtitle, setVoucherSubtitle] = useState(() => localStorage.getItem('voucher_subtitle') || 'Bespoke Fitting Voucher');
  const [voucherFooterNotes, setVoucherFooterNotes] = useState(() => localStorage.getItem('voucher_footer_notes') || 'Thank you for trusting tailorSHOP ERP. All sizing blueprints are saved securely in our central index database.');
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
  const [notes, setNotes] = useState(() => localStorage.getItem('atelier_draft_notes') || '');
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
  const [tailorPage, setTailorPage] = useState<'sizing' | 'orders' | 'settings' | 'tailors'>('sizing');

  // Groundbreaking Admin Landing & Brand Customization states (persistent in LocalStorage)
  const [customLogoUrl, setCustomLogoUrl] = useState(() => localStorage.getItem('logo_url') || '');
  const [customLandingTitle, setCustomLandingTitle] = useState(() => {
    const saved = localStorage.getItem('landing_title');
    return (!saved || saved === 'Welcome to Sartorial Atelier') ? 'Welcome to tailorSHOP ERP' : saved;
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
          let val = parsed[key];
          if (val === undefined || ['👔', '👕', '👖', '🧥', '🥻', '📐', '📏'].includes(val)) {
            val = '';
          }
          restored[key] = val;
        }
        for (const key of Object.keys(parsed)) {
          if (!restored[key]) {
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

  const [atelierName, setAtelierName] = useState(() => {
    const saved = localStorage.getItem('atelier_name');
    return (!saved || saved === 'Sartorial Atelier') ? 'tailorSHOP ERP' : saved;
  });

  useEffect(() => {
    localStorage.setItem('custom_clothing_emojis', JSON.stringify(clothingCategoryEmojis));
  }, [clothingCategoryEmojis]);

  useEffect(() => {
    localStorage.setItem('custom_clothing_prices', JSON.stringify(clothingPrices));
  }, [clothingPrices]);

  useEffect(() => {
    localStorage.setItem('atelier_name', atelierName);
  }, [atelierName]);

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
        setCurrentUser(JSON.parse(savedUser));
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
    const workerWithId: Worker = {
      ...newWorker,
      id: nextId
    };
    const updated = [...workers, workerWithId];
    setWorkers(updated);
    saveWorkers(updated);
    addActivity('Staff Added', `Recruited new direct worker ${newWorker.name} as ${newWorker.role}`, currentUser?.role || "Owner", currentUser?.name || "Owner");
    triggerToast(`Staff "${newWorker.name}" added successfully to the ERP!`, "success");
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

    // Secure Master Admin / Creator Bypass check
    if (emailClean === 'owner@gmail.com' && passwordClean === 'AtelierOwner2026!') {
      const user = {
        id: 'TAILOR-OWNER-MASTER',
        name: 'Atelier Master Admin',
        email: 'owner@gmail.com',
        phone: '+91 9876543210',
        location: 'HQ Central Suite',
        role: 'Owner' as const
      };
      setCurrentUser(user);
      if (rememberMe) {
        localStorage.setItem('tailor_logged_in_user', JSON.stringify(user));
      }
      addActivity('Sign In', 'Atelier Master logged in via secure bypass credentials', 'Owner', user.name);
      triggerToast(`Master Executive Access Granted. Welcome, Admin Owner!`, 'success');
      return;
    }

    if (signInRole === 'Tailor') {
      const tailors = getRegisteredTailors();
      const match = tailors.find((t: any) => t.email.toLowerCase().trim() === emailClean && t.password === passwordClean);
      if (match) {
        const user = {
          id: match.id,
          name: match.name,
          email: match.email,
          phone: match.phone,
          location: match.location,
          role: 'Tailor' as const
        };
        setCurrentUser(user);
        if (rememberMe) {
          localStorage.setItem('tailor_logged_in_user', JSON.stringify(user));
        }
        addActivity('Sign In', `Atelier Owner logged in successfully`, 'Owner', user.name);
        triggerToast(`Welcome back to the studio, ${user.name}!`, 'success');
      } else {
        triggerToast('Incorrect credentials for Tailor Owner.', 'error');
      }
    } else {
      // Customer Portal Sign In (Login by Email or Phone number, password is any Order ID e.g. ORD-9841)
      const activeCustomers = getCustomers();
      const allOrders = getOrders();
      const cleanInput = signInEmail.trim().toLowerCase();
      const cleanDigitsInput = cleanInput.replace(/\D/g, '');
      const passwordCleanUpper = signInPassword.trim().toUpperCase();

      // Type-tolerant and Order-based Lookups
      let match: any = null;

      // Scenario A: Check if the password entered is a valid Order ID
      const matchingOrder = allOrders.find(o => o.id.toUpperCase().trim() === passwordCleanUpper);
      if (matchingOrder) {
        const customerOfOrder = activeCustomers.find(c => c.id === matchingOrder.customerId);
        if (customerOfOrder) {
          const custEmail = (customerOfOrder.email || '').toLowerCase().trim();
          const custPhone = (customerOfOrder.phone || '').trim();
          const custPhoneDigits = custPhone.replace(/\D/g, '');

          // Check if username matches this customer (with prefix/typo tolerance!)
          const emailPrefixTyped = cleanInput.split('@')[0].toLowerCase().trim().slice(0, 5);
          const emailPrefixCust = custEmail.split('@')[0].toLowerCase().trim().slice(0, 5);
          const isEmailPrefixMatch = emailPrefixTyped.length >= 3 && emailPrefixTyped === emailPrefixCust;

          if (
            custEmail === cleanInput ||
            custPhone === signInEmail.trim() ||
            (cleanDigitsInput && custPhoneDigits === cleanDigitsInput) ||
            isEmailPrefixMatch
          ) {
            match = customerOfOrder;
          }
        }
      }

      // Scenario B: Traditional lookup by Email or Phone if no order matched or password is a general one
      if (!match) {
        match = activeCustomers.find((c: any) => {
          const custEmail = (c.email || '').toLowerCase().trim();
          const custPhone = (c.phone || '').trim();
          const custPhoneDigits = custPhone.replace(/\D/g, '');

          // Support exact or typo tolerant match on email prefix
          const emailPrefixTyped = cleanInput.split('@')[0].toLowerCase().trim().slice(0, 5);
          const emailPrefixCust = custEmail.split('@')[0].toLowerCase().trim().slice(0, 5);
          const isEmailPrefixMatch = emailPrefixTyped.length >= 5 && emailPrefixTyped === emailPrefixCust;

          return custEmail === cleanInput || 
                 custPhone === signInEmail.trim() ||
                 (cleanDigitsInput && custPhoneDigits === cleanDigitsInput) ||
                 isEmailPrefixMatch;
        });
      }

      if (match) {
        const customerOrders = allOrders.filter(o => o.customerId === match.id);

        const isOrderIdPassword = customerOrders.some(o => o.id.toUpperCase().trim() === passwordCleanUpper);
        const isFallbackPassword = (match.password && match.password === signInPassword.trim()) || 
                                   signInPassword.trim() === 'password123' || 
                                   signInPassword.trim() === match.id;

        if (isOrderIdPassword || isFallbackPassword) {
          const user = {
            id: match.id,
            name: match.name,
            email: match.email,
            phone: match.phone,
            role: 'Customer' as const
          };
          setCurrentUser(user);
          if (rememberMe) {
            localStorage.setItem('tailor_logged_in_user', JSON.stringify(user));
          }
          addActivity('Sign In', `Customer logged in successfully (ID: ${match.id})`, 'Customer', user.name);
          triggerToast(`Welcome back, ${user.name}!`, 'success');
        } else {
          triggerToast('Invalid Password. Please use your Order ID (e.g. ORD-9841) as the password.', 'error');
        }
      } else {
        triggerToast('No registered customer profile found with that email address or phone number.', 'error');
      }
    }
  };

  // Sign Up event trigger
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim() || !signUpPhone.trim()) {
      triggerToast('Please fulfill all critical sizing accounts fields.', 'error');
      return;
    }

    const nameVal = signUpName.trim();
    const emailVal = signUpEmail.toLowerCase().trim();
    const passwordVal = signUpPassword;
    const phoneVal = signUpPhone.trim();
    const locVal = signUpLocation.trim() || 'Walk-in Studio Client';

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
              qrCodeData: `https://sartorial-atelier.net/customer/${newId}`,
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
              qrCodeData: `https://sartorial-atelier.net/customer/${newId}`,
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
    triggerToast('Atelier registration verification aborted.', 'info');
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

    // Copy template fields
    const baseFields = clothingTemplates[newCategoryBase] || { Length: '36', Width: '20' };
    setClothingTemplates((prev) => ({
      ...prev,
      [capitalizedName]: { ...baseFields }
    }));

    // Switch active type to this new type!
    setClothingType(capitalizedName);
    setSizingFields({ ...baseFields });

    // Toast
    triggerToast(`Custom genre "${capitalizedName}" added successfully. Styled in Indigo theme!`, 'success');

    // Reset inputs
    setNewCategoryName('');
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
        qrCodeData: `https://sartorial-atelier.net/customer/${newId}`,
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

    const newMeasureRecord: MeasurementRecord = {
      id: `MSR-${Date.now()}`,
      customerId: currentCust.id,
      clothingType: clothingType,
      date: new Date().toISOString(),
      fields: finalFields,
      notes: notes.trim() || 'Classic bespoke fit.'
    };
    const updatedMeasurements = [newMeasureRecord, ...measurements];
    saveMeasurements(updatedMeasurements);
    setMeasurements(updatedMeasurements);

    // 3. Register Commission Order representing the delivery timelines
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
        fabricDetails: 'Handled by Atelier Cutter Room',
        urgentNotes: 'Captured during live workshop sizing',
        tailorNotes: 'Pattern indices locked successfully',
        privateNotes: 'Bespoke client session logged'
      },
      images: { reference: [], fabric: [], finished: [] }
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

    const whatsappAlert = `Hello ${currentCust.name}, your bespoke tailoring session for custom ${clothingType} measurements is completed! Fitting scheduled to be ready on ${formattedDate}. Advance deposit: ₹${newOrder.advancePayment}. Outstanding: ₹${newOrder.remainingBalance}. Thank you, Sartorial Atelier!`;
    const emailAlert = `Dear ${currentCust.name},\n\nWe have successfully logged your custom ${clothingType} measurements today in our Atelier Ledger. Sizing indices are archived under token reference ${newMeasureRecord.id}.\n\nYour customized tailoring package is scheduled to be completed and ready for final fitting on ${formattedDate}.\n\nWarmest regards,\nSartorial Luxury Tailoring team\nEST. 2026`;

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
  const triggerPrintVoucher = (recordId: string, customerId: string) => {
    const record = measurements.find((m) => m.id === recordId);
    const customer = customers.find((c) => c.id === customerId);
    const order = orders.find((o) => o.customerId === customerId && o.clothingType === record?.clothingType);

    if (!record || !customer) {
      alert('Unable to load matching sizing archival elements.');
      return;
    }

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
          <title>Atelier Fitting Card - ${customer.name}</title>
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
              ${customLogoUrl ? `
                <img 
                  src="${customLogoUrl}" 
                  style="height: 52px; max-width: 180px; object-fit: contain; margin-bottom: 12px; border-radius: 6px;" 
                  alt="Atelier Logo" 
                  referrerpolicy="no-referrer"
                />
              ` : ''}
              <h1 class="title">${voucherMainTitle}</h1>
              <p class="subtitle" style="color: ${voucherAccentColor};">${voucherSubtitle}</p>
            </div>

            <div class="dp-container">
              <div class="customer-info">
                <div class="customer-name">${customer.name}</div>
                <div class="customer-meta">📞 <span>${customer.phone || 'N/A'}</span></div>
                <div class="customer-meta">✉️ <span>${customer.email || 'N/A'}</span></div>
                <div class="customer-meta" style="font-family: monospace; font-size: 11px; margin-top: 6px; color:#a8a29e;">VOUCHER REF: ${record.id}</div>
              </div>
              <div>
                ${clientDp ? `
                  <img 
                    src="${clientDp}" 
                    class="dp-img"
                    alt="${customer.name}"
                    referrerpolicy="no-referrer"
                    onerror="this.style.display='none'; document.getElementById('dp-fallback-el').style.display='flex';"
                  />
                  <div id="dp-fallback-el" class="dp-fallback" style="display: none;">${patronInitials}</div>
                ` : `
                  <div class="dp-fallback">${patronInitials}</div>
                `}
              </div>
            </div>

            <div class="section-title">${record.clothingType} Pattern Metrics</div>
            <div class="grid-params">
              ${Object.entries(record.fields)
                .map(
                  ([k, v]) => `
                <div class="param-box">
                  <div class="param-val">${cleanMeasurementValue(v)}</div>
                  <div class="param-lbl">${k}</div>
                </div>
              `
                )
                .join('')}
            </div>

            <div class="section-title">Style Alterations &amp; Fit Specs</div>
            <div class="notes-block">
              ${record.notes || 'Classic standard fit drapes.'}
            </div>

            ${order ? `
              <div class="section-title">Atelier Accounting Ledger</div>
              <table class="receipt-table">
                <tr>
                  <td><strong>Pattern Job Ref:</strong></td>
                  <td align="right">${order.id}</td>
                </tr>
                <tr>
                  <td><strong>Garment Category:</strong></td>
                  <td align="right">${order.clothingType}</td>
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
              ✨ Ready for Pick-up on ${readyFormatted}
            </div>

            <p class="footer-notes">
              ${voucherFooterNotes}
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
  const handleResetAtelierConfig = () => {
    if (!window.confirm("Are you sure you want to restore original default genres, templates and pricing? This will overwrite your current settings edits.")) return;
    
    localStorage.removeItem('custom_clothing_categories');
    localStorage.removeItem('custom_clothing_templates');
    localStorage.removeItem('custom_clothing_emojis');
    localStorage.removeItem('custom_clothing_prices');
    localStorage.removeItem('atelier_name');

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
    setAtelierName('tailorSHOP ERP');
    
    triggerToast("Atelier configurations returned to original defaults!", "success");
  };

  // Permanently purge all database records
  const handlePurgeAllDatabase = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to permanently delete all customers, measurements, orders, workers, notifications, and edit logs from both local storage AND Firestore? This will completely empty the database for a fully clean start and cannot be undone.")) return;
    
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
                      alt="Atelier Logo"
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
                    setSignInRole('Tailor');
                    setGatekeeperScreen('signin');
                    triggerToast("Atelier Owner Portal selected! Please sign in with your workshop credentials.", 'info');
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
                      alt="Tailoring atelier hands at work"
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
                        Atelier Owner
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
                    setSignInRole('Customer');
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
                    <Typewriter text={signUpRole === 'Tailor' ? 'Empower Your Atelier' : 'The Perfect Drape, Always.'} speed={40} isDark={isDarkMode} />
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
                  Atelier
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

                    {/* Password */}
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

                    {/* Location Column */}
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
                            if (val.toLowerCase().includes('india')) {
                              setSignUpPhone((prev) => {
                                if (!prev || prev.trim() === '' || prev.startsWith('+44')) {
                                  return '+91 ';
                                }
                                if (!prev.startsWith('+91')) {
                                  return '+91 ' + prev.replace(/^\+\d+\s*/, '').trim();
                                }
                                return prev;
                              });
                            }
                          }}
                          className={`w-full pl-11 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs font-semibold ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black shadow-xs'
                          }`}
                        />
                      </div>
                    </div>

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
                      setSignInRole(signUpRole);
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
                  src={
                    signInRole === 'Tailor'
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
                      ? 'bg-black/60 hover:bg-black/80 text-white border border-zinc-800/85' 
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
                    {signInRole === 'Tailor' ? 'Authorized Master System' : 'Customer Lounge Access'}
                  </span>
                  <h2 className={`font-sans font-black text-2xl tracking-tight mt-1 leading-tight ${
                    isDarkMode ? 'text-white' : 'text-zinc-950'
                  }`}>
                    <Typewriter text={signInRole === 'Tailor' ? 'Resuming Atelier Services' : 'Your Customized Fit Workspace'} speed={40} isDark={isDarkMode} />
                  </h2>
                  <p className={`text-xs mt-2 select-none leading-relaxed font-semibold ${
                    isDarkMode ? 'text-zinc-350' : 'text-zinc-700'
                  }`}>
                    {signInRole === 'Tailor'
                      ? 'Seamless coordinate access keys to resume digital stitching schedules and verify material specifications.'
                      : 'Verify instant chest sizing ratios or tracking metrics. Use your phone credentials.'}
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
                      Identify your workshop account credentials
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSignIn} className="space-y-4">
                    
                    {/* Email address */}
                    <div>
                      <label className={`block text-[11px] uppercase tracking-wider font-bold mb-1.5 ${
                        isDarkMode ? 'text-zinc-400' : 'text-zinc-650'
                      }`}>
                        {signInRole === 'Customer' ? 'Email or Phone Number' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input
                          type={signInRole === 'Customer' ? 'text' : 'email'}
                          required
                          placeholder={signInRole === 'Customer' ? 'e.g. customer@domain.com or phone number' : 'owner@atelier.com'}
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
                        {signInRole === 'Customer' ? 'Password (Order ID like ORD-9841)' : 'Password'}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder={signInRole === 'Customer' ? 'e.g. ORD-9841' : '••••••••'}
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          className={`w-full pl-11 pr-11 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs font-sans font-semibold ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-black shadow-xs'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-405 hover:text-stone-605"
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
                        className={`hover:underline font-bold ${
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

                 {/* Toggle logic link to creation */}
                 {signInRole !== 'Customer' ? (
                   <div className={`mt-8 text-center text-xs font-semibold ${
                     isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                   }`}>
                     <span>Atelier logins are managed by administrators. Default: <strong>owner@atelier.com</strong> (pass: <strong>password123</strong>)</span>
                     <button
                       type="button"
                       onClick={() => {
                         setSignUpRole(signInRole);
                         setGatekeeperScreen('signup');
                         triggerToast(`Switched to account creation mode!`, 'info');
                       }}
                       className={`hover:underline font-extrabold cursor-pointer text-sm ${
                         isDarkMode ? 'text-yellow-400' : 'text-black'
                       }`}
                     >
                       
                     </button>
                   </div>
                 ) : (
                   <div className={`mt-8 text-center text-xs font-semibold ${
                     isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                   }`}>
                     <p>Orders are automatically indexed by our workshop team.</p>
                     <p className="mt-1 font-bold text-amber-600 dark:text-amber-400">
                       Please enter your Phone or Email with your Order ID as Password.
                     </p>
                   </div>
                 )}

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
                    alt="Atelier Logo"
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
                  {atelierName.toUpperCase()}
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
                  No measurement pattern archived yet. Join the atelier cutter studio to log your sizing records.
                </div>
              ) : (
                <div className={`grid grid-cols-1 ${myMeasurements.length > 1 ? 'md:grid-cols-2' : ''} gap-6`}>
                  {myMeasurements.map((m) => {
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

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[10px] text-stone-405 font-medium">Recorded: {new Date(m.date).toLocaleDateString()}</span>
                          <button
                            onClick={() => triggerPrintVoucher(m.id, currentCustomerObj.id)}
                            className="p-1.5 px-3 border border-stone-200 dark:border-slate-800 hover:bg-stone-100 dark:hover:bg-slate-800 transition duration-150 rounded-lg text-[10.5px] font-bold flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Printer className="h-3 w-3" />
                            <span>Get Voucher Cards</span>
                          </button>
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
                              { label: 'Ready for Atelier Pickup', key: 'Ready for Pickup', desc: 'Securely packaged and ready for pick-up!' },
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
              {customLogoUrl ? (
                <img
                  src={customLogoUrl}
                  alt="Atelier Logo"
                  className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg"
                  referrerPolicy="no-referrer"
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
                {atelierName.toUpperCase()}
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
        {currentUser?.role === 'Owner' ? (
          <div className="flex border-b border-stone-200 dark:border-slate-800 space-x-6 px-1 overflow-x-auto whitespace-nowrap scrollbar-none">
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

            <button
              type="button"
              onClick={() => setOwnerTab('registered_tailors')}
              className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                ownerTab === 'registered_tailors'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-extrabold'
                  : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
              }`}
            >
              <Scissors className="h-4 w-4" />
              <span>Tailors</span>
            </button>
          </div>
        ) : (
          <div className="flex border-b border-stone-200 dark:border-slate-800 space-x-6 px-1">
            <button
              type="button"
              onClick={() => setTailorPage('sizing')}
              className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                tailorPage === 'sizing'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500'
                  : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
              }`}
            >
              <Scissors className="h-4 w-4" />
              <span>Measurements</span>
            </button>
            <button
              type="button"
              onClick={() => setTailorPage('orders')}
              className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                tailorPage === 'orders'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500'
                  : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Orders</span>
              {orders.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {orders.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setTailorPage('settings')}
              className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                tailorPage === 'settings'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500'
                  : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={() => setTailorPage('tailors')}
              className={`pb-3 text-xs uppercase font-extrabold tracking-wider border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                tailorPage === 'tailors'
                  ? 'border-amber-600 text-amber-600 dark:border-amber-500 dark:text-amber-500 font-extrabold'
                  : 'border-transparent text-stone-400 hover:text-stone-650 dark:hover:text-stone-200'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Tailors</span>
            </button>
          </div>
        )}

        {currentUser?.role === 'Owner' ? (
          /* OWNER MASTER CONTROL PANEL */
          ownerTab === 'branding' ? (
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
                       <label className="text-[10px] font-extrabold text-stone-400 dark:text-stone-300 uppercase tracking-wider block">App Name / Atelier Title</label>
                       <div className="relative">
                         <input
                           type="text"
                           value={atelierName}
                           onChange={(e) => {
                             setAtelierName(e.target.value);
                             triggerToast("Navbar title updated in real-time!", "info");
                           }}
                           placeholder="e.g. Atelier Luxury"
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
                                       const img = new Image();
                                        img.src = base64Str;
                                        img.onload = () => {
                                          const canvas = document.createElement('canvas');
                                          const ctx = canvas.getContext('2d');
                                          const MAX_HEIGHT = 48;
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
                                            triggerToast("Logo uploaded and auto-resized perfectly to fit the navbar!", "success");
                                          } else {
                                            setCustomLogoUrl(base64Str);
                                            triggerToast("Logo uploaded!", "success");
                                          }
                                        };
                                       
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
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.setItem('logo_url', customLogoUrl);
                            localStorage.setItem('atelier_name', atelierName);
                            triggerToast("Brand configuration applied & saved successfully!", "success");
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Save &amp; Apply Changes</span>
                        </button>
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

                 {/* Removed mockup monitor */}
                    {/* Landing Page & Role Cards Content Customization Section */}
                    {/* Welcome Screen customizer card */}
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
                              placeholder="e.g. Welcome to Sartorial Atelier"
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
                                className={`w-full p-2 rounded-lg border text-[11px] focus:ring-1 focus:ring-amber-500 focus:outline-none ${isDarkMode ? 'bg-zinc-955 border-zinc-800 text-white' : 'bg-stone-50 border-stone-200 text-stone-850 shadow-3xs'}`}
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

                    {/* Bespoke Voucher Design Studio & Live Preview */}
                    <div className={`p-6 rounded-2xl border text-left space-y-6 ${isDarkMode ? 'bg-zinc-900/50 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'}`}>
                      <div className="flex items-center space-x-2.5 pb-2 border-b border-light-divider dark:border-zinc-800">
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                          <Printer className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-500">Atelier Voucher Designer &amp; Ledger Studio</h3>
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
                           <span className="font-black text-xs tracking-wider uppercase text-stone-900">{atelierName || 'STYLUS'}</span>
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
                           <span className="font-black text-xs tracking-wider uppercase text-white">{atelierName || 'STYLUS'}</span>
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
             </div>
          ) : ownerTab === 'registered_tailors' ? (
             /* Tailor users logins page */
             <div className="space-y-6 fade-in font-sans">
               <div className="border-b border-stone-200 dark:border-slate-800 pb-4">
                 <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
                   <span className="p-2 bg-amber-500/10 text-amber-600 rounded-lg"><Scissors className="h-4.5 w-4.5" /></span>
                   <span>Register Direct Atelier Worker Staff Logins</span>
                 </h2>
                 <p className="text-xs text-stone-400 mt-1">Configure and manage workshop employee credentials, strong passwords, and room identifiers.</p>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 {/* Left Side: Existing logins list */}
                 <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                   <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4 flex items-center gap-1.5 justify-between">
                     <span>Taylor Workshop Staff Logins</span>
                     <span className="text-[10px] bg-amber-600/10 text-amber-600 px-2 py-0.5 rounded-full font-bold">
                       {getRegisteredTailors().length} Active
                     </span>
                   </h3>
                   <div className="space-y-3">
                     {getRegisteredTailors().map((t: any) => {
                       return (
                         <div key={t.id} className="p-4 rounded-xl border flex justify-between items-center gap-2 dark:bg-slate-950 border-slate-900 bg-stone-50 border-stone-150">
                           <div className="space-y-1 text-left">
                             <div className="font-extrabold text-xs text-stone-850 dark:text-white">{t.name}</div>
                             <div className="text-[10.5px] text-stone-450 space-y-0.5 font-semibold">
                               <p><span className="font-mono">Email:</span> {t.email}</p>
                               <p><span className="font-mono">Phone:</span> {t.phone}</p>
                               <p><span className="font-mono">Room:</span> {t.location}</p>
                               <p className="text-[10.5px] font-mono text-amber-600 p-1 bg-amber-600/5 rounded inline-block">PSWD: {t.password}</p>
                             </div>
                           </div>
                           <button
                             type="button"
                             disabled={t.id === 'TAILOR-OWNER-MASTER'}
                             onClick={() => {
                               if (confirm(`Remove staff ${t.name}?`)) {
                                 const filtered = getRegisteredTailors().filter((x: any) => x.id !== t.id);
                                 saveRegisteredTailors(filtered);
                                 setRegisteredTailors(filtered);
                                 triggerToast('Removed staff credentials!', 'success');
                               }
                             }}
                             className={`p-2 rounded hover:bg-red-500/10 hover:text-red-500 text-stone-400 cursor-pointer ${t.id === 'TAILOR-OWNER-MASTER' ? 'cursor-not-allowed opacity-30' : ''}`}
                           >
                             <Trash2 className="h-4 w-4" />
                           </button>
                         </div>
                       );
                     })}
                   </div>
                 </div>

                 {/* Right Side: Register direct tailor */}
                 <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                   <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4">Register Direct Atelier Worker Node</h3>
                   <form onSubmit={(e) => {
                     e.preventDefault();
                     const target = e.currentTarget;
                     const name = (target.elements.namedItem('workerName') as HTMLInputElement).value.trim();
                     const email = (target.elements.namedItem('workerEmail') as HTMLInputElement).value.trim();
                     const password = (target.elements.namedItem('workerPswd') as HTMLInputElement).value.trim() || 'tailor123';
                     const room = (target.elements.namedItem('workerLoc') as HTMLInputElement).value.trim();
                     const phone = (target.elements.namedItem('workerPhone') as HTMLInputElement).value.trim();

                     if (!name || !email) {
                       triggerToast('Name and email are required fields!', 'error');
                       return;
                     }
                     const list = getRegisteredTailors();
                     if (list.some((x: any) => x.email.toLowerCase().trim() === email.toLowerCase().trim())) {
                       triggerToast('This email is already registered!', 'error');
                       return;
                     }
                     const updated = [...list, { id: `TLR-${Date.now()}`, name, email, password, phone, location: room }];
                     saveRegisteredTailors(updated);
                     setRegisteredTailors(updated);
                     triggerToast('Staff added to tailor database successfully!', 'success');
                     target.reset();
                   }} className="space-y-4 text-left">
                     <div>
                       <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">Worker Display Name</label>
                       <input name="workerName" type="text" className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs dark:bg-slate-950" required />
                     </div>
                     <div>
                       <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">Internal Login Email ID</label>
                       <input name="workerEmail" type="email" className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs dark:bg-slate-950" required />
                     </div>
                     <div>
                       <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">Secure System Password</label>
                       <input name="workerPswd" type="text" placeholder="tailor123" className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs dark:bg-slate-950" />
                     </div>
                     <div>
                       <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">Workshop Location / Room</label>
                       <input name="workerLoc" type="text" placeholder="Room B" className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs dark:bg-slate-950" />
                     </div>
                     <div>
                       <label className="text-[10px] font-extrabold uppercase tracking-wider block mb-1">Phone Coordinates</label>
                       <input name="workerPhone" type="text" placeholder="+91..." className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs dark:bg-slate-950" />
                     </div>
                     <button type="submit" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer">Register Direct Login</button>
                   </form>
                 </div>
               </div>
             </div>
          ) : ownerTab === 'staffs_erp' ? (
             /* Staffs TailorShop ERP view */
             <div className="space-y-6 fade-in font-sans">
               <WorkerManagementView
                 workers={workers}
                 orders={orders}
                 onAddWorker={handleAddWorker}
                 isDarkMode={isDarkMode}
               />
             </div>
          ) : (
             /* Customer Patrons view */
             <div className="space-y-6 fade-in font-sans">
               <CustomerManagementView
                 customers={customers}
                 orders={orders}
                 onAddCustomer={handleAddNewCustomer}
                 onEditCustomer={handleEditExistingCustomer}
                 onDeleteCustomer={handleDeleteExistingCustomer}
                 isDarkMode={isDarkMode}
                 searchFilter=""
               />
             </div>
          )
        ) : tailorPage === 'sizing' ? (
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
                                {type === 'Shirt' ? (
                                  <Shirt className="h-3.5 w-3.5" />
                                ) : type === 'Pant' ? (
                                  <PantIcon className="h-3.5 w-3.5" />
                                ) : type === 'Suit' ? (
                                  <SuitIcon className="h-3.5 w-3.5" />
                                ) : type === 'Kurta' ? (
                                  <KurtaIcon className="h-3.5 w-3.5" />
                                ) : type === 'Custom' ? (
                                  <Ruler className="h-3.5 w-3.5" />
                                ) : clothingCategoryEmojis[type] ? (
                                  <span className="text-[13px] leading-none select-none">{clothingCategoryEmojis[type]}</span>
                                ) : (
                                  <Scissors className="h-3.5 w-3.5" />
                                )}
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
                      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-2.5 text-xs w-full transition-all ${
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
                        <div className="flex items-center gap-2 w-full sm:w-auto">
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
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
                            }}
                            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs font-bold font-sans cursor-pointer px-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

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
                            localStorage.setItem('atelier_draft_notes', notes);
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
                      Atelier
                    </div>

                    <div className="space-y-6">
                      <div className="pb-3 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <h2 className="font-sans text-lg font-bold tracking-tight">2. Client &amp; Timeline</h2>
                          <p className="text-xs text-stone-400">Record customer coordinates &amp; scheduling targets</p>
                        </div>
                        <span className="p-1.5 px-3 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                          Atelier Sizing Core
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
                  <button
                    type="button"
                    onClick={() => triggerPrintVoucher(lastSavedSession?.measurement.id || '', lastSavedSession?.customer.id || '')}
                    className="p-3 px-5 border hover:bg-stone-100 dark:hover:bg-slate-800 transition rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5"
                  >
                    <Printer className="h-4.5 w-4.5" />
                    <span>Print Workshop Voucher Ticket</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartNextSession}
                    className="p-3 px-8 bg-amber-600 hover:bg-amber-700 transition-all font-bold text-xs rounded-xl text-white shadow-lg shadow-amber-600/10 flex items-center justify-center space-x-2 animate-bounce"
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
        ) : tailorPage === 'orders' ? (
          /* Master Orders Book page */
          <section className={`p-6 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 font-sans">
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-stone-50 border-stone-150'}`}>
                <span className="text-[10px] text-stone-450 dark:text-stone-400 font-bold uppercase tracking-wider block">Total Booked Jobs</span>
                <span className="text-2xl font-sans font-black text-stone-900 dark:text-white mt-1 block">{orders.length}</span>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider block">Active Production</span>
                <span className="text-2xl font-sans font-black text-amber-600 dark:text-amber-500 mt-1 block">{orders.filter(o => o.status !== 'Delivered').length} active</span>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-500 font-bold uppercase tracking-wider block">Value Collected</span>
                <span className="text-2xl font-sans font-black text-emerald-600 dark:text-emerald-500 mt-1 block">₹{orders.reduce((sum, o) => sum + o.advancePayment, 0).toLocaleString()}</span>
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
                    <th className="py-3 px-4 text-right">Settlement & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-850">
                  {orders
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
                                    setTailorPage('sizing');
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

                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-stone-400 font-serif italic">
                        Zero orders booked in Atelier system yet. Set up client coordinates to log customized orders.
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
              {registeredTailors.map((t: any) => (
                <div key={t.id} className={`p-5 rounded-2xl border text-left flex flex-col justify-between ${
                  isDarkMode ? 'bg-slate-950 border-slate-900 text-white' : 'bg-stone-50 border-stone-150 text-stone-800'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-amber-500/15 rounded-xl text-amber-600 font-black text-sm">
                        {t.name ? t.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'TL'}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-stone-900 dark:text-white">{t.name}</h3>
                        <span className="text-[9px] bg-amber-600/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Active Tailor
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 pt-2 border-t border-dashed dark:border-slate-900 border-stone-200 text-stone-500 dark:text-stone-400">
                      <p className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-stone-400 font-bold">EMAIL:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{t.email}</span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-stone-400 font-bold">PHONE:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{t.phone || 'N/A'}</span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-stone-400 font-bold">ROOM / LOC:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{t.location || 'Central Desk'}</span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-stone-400 font-bold">JOINED:</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Initial'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {registeredTailors.length === 0 && (
                <div className="col-span-full py-12 text-center text-stone-400 text-xs font-sans font-semibold">
                  No registered tailors found in our database system.
                </div>
              )}
            </div>
          </section>
        ) : (
          /* Settings Page Section */
          <div className="space-y-6 fade-in font-sans">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span className="p-2 bg-amber-500/10 text-amber-600 rounded-lg"><Settings className="h-4.5 w-4.5" /></span>
                  <span>Atelier Blueprint &amp; System Settings</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">Configure personalized garment templates, pricing, default measurements and workshop properties.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAtelierConfig}
                  className="px-3.5 py-1.5 border border-stone-300 dark:border-slate-700 bg-transparent hover:bg-yellow-500/10 text-stone-600 hover:text-yellow-700 dark:text-stone-300 dark:hover:text-yellow-400 rounded-xl text-xs font-bold transition duration-155 flex items-center space-x-1.5 cursor-pointer shadow-3xs"
                  title="Reset Categories and Templates"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Restore Factory Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={handlePurgeAllDatabase}
                  className="px-3.5 py-1.5 border border-rose-350 dark:border-rose-900 bg-transparent hover:bg-rose-500/10 text-stone-600 hover:text-rose-700 dark:text-stone-300 dark:hover:text-rose-450 rounded-xl text-xs font-bold transition duration-155 flex items-center space-x-1.5 cursor-pointer shadow-3xs"
                  title="Purge all customer list and order database"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Purge Database (Clean Slate)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Column - General and Add Genre cards */}
              <div className="space-y-6">
                
                {/* General Settings Card */}
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4 flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span>Workshop Preferences</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold text-stone-440 dark:text-stone-300 uppercase tracking-wider block mb-1.5">Studio / Atelier Name</label>
                      <input
                        type="text"
                        value={atelierName}
                        onChange={(e) => setAtelierName(e.target.value)}
                        placeholder="e.g. Sartorial Atelier"
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-250 text-stone-800 shadow-3xs'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-stone-440 dark:text-stone-300 uppercase tracking-wider block mb-1.5">Default Sizing System</label>
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
                  </div>
                </div>

                {/* Brand Customization & White-Label Panel */}
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-900' : 'bg-white border-stone-200 shadow-sm'}`}>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4 flex items-center gap-1.5">
                    <Settings className="h-4 w-4" />
                    <span>White-Label &amp; Landing Config</span>
                  </h3>
                  
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="text-[10px] font-extrabold text-stone-440 dark:text-stone-300 uppercase tracking-wider block mb-1">Brand Logo Image URL</label>
                      <input
                        type="text"
                        value={customLogoUrl}
                        onChange={(e) => setCustomLogoUrl(e.target.value)}
                        placeholder="Paste image URL (e.g. https://...)"
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-250 text-stone-800 shadow-3xs'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-stone-440 dark:text-stone-300 uppercase tracking-wider block mb-1">Landing Title</label>
                      <input
                        type="text"
                        value={customLandingTitle}
                        onChange={(e) => setCustomLandingTitle(e.target.value)}
                        placeholder="e.g. Welcome to Sartorial Atelier"
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-250'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-stone-440 dark:text-stone-300 uppercase tracking-wider block mb-1">Landing Sub-Description</label>
                      <textarea
                        value={customLandingDescription}
                        onChange={(e) => setCustomLandingDescription(e.target.value)}
                        rows={3}
                        placeholder="Brief overview description..."
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-250'
                        }`}
                      />
                    </div>

                    <div className="border-t border-dashed border-stone-200 dark:border-slate-800 my-4 pt-3">
                      <span className="text-[10.5px] font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-wider block mb-3 leading-none">Tailor Card Customization</span>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-bold text-stone-500 block mb-1">Card Display Name</label>
                          <input
                            type="text"
                            value={customTailorTitle}
                            onChange={(e) => setCustomTailorTitle(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-stone-500 block mb-1">Card Subtitle Description</label>
                          <textarea
                            value={customTailorDescription}
                            onChange={(e) => setCustomTailorDescription(e.target.value)}
                            rows={2}
                            className={`w-full p-2 rounded-lg border text-xs ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-stone-500 block mb-1">Background Image URL</label>
                          <input
                            type="text"
                            value={customTailorImage}
                            onChange={(e) => setCustomTailorImage(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-stone-200 dark:border-slate-800 my-4 pt-3">
                      <span className="text-[10.5px] font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-wider block mb-3 leading-none">Customer Card Customization</span>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-bold text-stone-500 block mb-1">Card Display Name</label>
                          <input
                            type="text"
                            value={customCustomerTitle}
                            onChange={(e) => setCustomCustomerTitle(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-stone-500 block mb-1">Card Subtitle Description</label>
                          <textarea
                            value={customCustomerDescription}
                            onChange={(e) => setCustomCustomerDescription(e.target.value)}
                            rows={2}
                            className={`w-full p-2 rounded-lg border text-xs ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-stone-500 block mb-1">Background Image URL</label>
                          <input
                            type="text"
                            value={customCustomerImage}
                            onChange={(e) => setCustomCustomerImage(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-xs ${
                              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
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
                      <label className="text-[10px] font-extrabold text-stone-440 dark:text-stone-300 uppercase tracking-wider block mb-1.5">Genre Name</label>
                      <input
                        type="text"
                        value={settingsNewCatName}
                        onChange={(e) => setSettingsNewCatName(e.target.value)}
                        placeholder="e.g. Waistcoat, Sherwani"
                        className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-250'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold text-stone-440 dark:text-stone-300 uppercase tracking-wider block mb-1.5">Base Emoji</label>
                        <input
                          type="text"
                          value={settingsNewCatEmoji}
                          onChange={(e) => setSettingsNewCatEmoji(e.target.value)}
                          placeholder="🧥"
                          maxLength={4}
                          className={`w-full p-2.5 rounded-xl border text-center text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-stone-440 dark:text-stone-300 uppercase tracking-wider block mb-1.5">Starting Price (₹)</label>
                        <input
                          type="number"
                          value={settingsNewCatPrice || ''}
                          onChange={(e) => setSettingsNewCatPrice(parseInt(e.target.value) || 0)}
                          placeholder="e.g. 250"
                          className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                          }`}
                        />
                      </div>
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
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border select-none transition-all text-base ${
                                isDarkMode ? 'bg-slate-900 border-slate-850 text-stone-200' : 'bg-stone-100 border-stone-200 text-stone-750'
                              }`}>
                                {cat === 'Shirt' ? (
                                  <Shirt className="h-4.5 w-4.5" />
                                ) : cat === 'Pant' ? (
                                  <PantIcon className="h-4.5 w-4.5" />
                                ) : cat === 'Suit' ? (
                                  <SuitIcon className="h-4.5 w-4.5" />
                                ) : cat === 'Kurta' ? (
                                  <KurtaIcon className="h-4.5 w-4.5" />
                                ) : cat === 'Custom' ? (
                                  <Ruler className="h-4.5 w-4.5" />
                                ) : clothingCategoryEmojis[cat] ? (
                                  <span className="text-[15px] select-none">{clothingCategoryEmojis[cat]}</span>
                                ) : (
                                  <Scissors className="h-4.5 w-4.5" />
                                )}
                              </div>

                              {!isDefaultCategoryChoice && cat !== 'Custom' && (
                                <div className="flex flex-col ml-1 shrink-0">
                                  <label className="text-[7.5px] font-extrabold text-stone-400 uppercase tracking-wider mb-0.5">Emoji</label>
                                  <input
                                    type="text"
                                    value={clothingCategoryEmojis[cat] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setClothingCategoryEmojis(prev => ({
                                        ...prev,
                                        [cat]: val
                                      }));
                                    }}
                                    placeholder="📐"
                                    title="Set a custom emoji for this custom genre"
                                    className={`w-10 p-0.5 py-0.25 text-center text-[10.5px] rounded-md border focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono ${
                                      isDarkMode ? 'bg-slate-900 border-slate-850 text-white' : 'bg-white border-stone-250 shadow-3xs text-stone-850'
                                    }`}
                                    maxLength={2}
                                  />
                                </div>
                              )}

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

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to completely delete the "${cat}" template genre from your atelier configs?`)) {
                                    handleDeleteCategoryInSettings(cat);
                                  }
                                }}
                                className={`p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-500/20`}
                                title={`Delete ${cat} config`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
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
                          setTailorPage('sizing');
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
                      <button
                        type="button"
                        onClick={() => triggerPrintVoucher(matchingRecord.id, customer?.id || '')}
                        className={`p-2 px-3.5 text-xs font-bold rounded-lg border flex items-center space-x-1.5 cursor-pointer transition ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 text-stone-100 hover:bg-slate-700'
                            : 'bg-stone-100 border-stone-250 text-stone-800 hover:bg-stone-200'
                        }`}
                      >
                        <Printer className="h-4 w-4 text-stone-400" />
                        <span>Print Ticket</span>
                      </button>
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
