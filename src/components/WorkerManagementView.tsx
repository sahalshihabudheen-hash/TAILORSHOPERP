import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  UserCheck,
  Plus,
  TrendingUp,
  Award,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  Layers,
  Calculator,
  User,
  Activity,
  MapPin,
  Trash2,
  Upload,
  Image,
  Link,
  Pencil,
  ChevronDown,
  Check
} from 'lucide-react';
import { Worker, Order } from '../types';
import { fetchIPLocation } from '../utils/geolocation';

interface WorkerManagementProps {
  workers: Worker[];
  orders: Order[];
  onAddWorker: (worker: Omit<Worker, 'id'>) => void;
  onDeleteWorker?: (id: string) => void;
  onUpdateWorker?: (worker: Worker) => void;
  onDeleteAllWorkers?: () => void;
  isDarkMode: boolean;
  triggerToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
  registeredTailors?: any[];
  onSetupTailorShop?: (worker: Worker, shopDetails: any) => void;
  currentUser?: any;
  clothingCategories?: string[];
}

export default function WorkerManagementView({
  workers,
  orders,
  onAddWorker,
  onDeleteWorker,
  onUpdateWorker,
  onDeleteAllWorkers,
  isDarkMode,
  triggerToast,
  registeredTailors,
  onSetupTailorShop,
  currentUser,
  clothingCategories = ['Shirt', 'Pant', 'Suit', 'Kurta']
}: WorkerManagementProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  const [workerPage, setWorkerPage] = useState(1);
  const workerPageSize = 10;

  // States for Editing Tailor details
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editRole, setEditRole] = useState<Worker['role']>('Tailor');
  const [editBaseSalary, setEditBaseSalary] = useState(2200);
  const [editPerOrderBonus, setEditPerOrderBonus] = useState(20);
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [isEditRoleDropdownOpen, setIsEditRoleDropdownOpen] = useState(false);

  // States for Filtering and Searching Tailors
  const [filterSearch, setFilterSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterGenre, setFilterGenre] = useState('All');

  // Reset pagination on search/filters change
  React.useEffect(() => {
    setWorkerPage(1);
  }, [filterSearch, filterRole, filterGenre]);

  // Admin shop configuration states for setup shop
  const [selectedSetupWorker, setSelectedSetupWorker] = useState<Worker | null>(null);
  const [setupShopName, setSetupShopName] = useState('');
  const [setupOwnerName, setSetupOwnerName] = useState('');
  const [setupShopPhone, setSetupShopPhone] = useState('');
  const [setupShopCountry, setSetupShopCountry] = useState('India');
  const [setupShopState, setSetupShopState] = useState('');
  const [setupShopDistrict, setSetupShopDistrict] = useState('');
  const [setupShopArea, setSetupShopArea] = useState('');
  const [setupShopPincode, setSetupShopPincode] = useState('');
  const [setupLatitude, setSetupLatitude] = useState('12.9716');
  const [setupLongitude, setSetupLongitude] = useState('77.5946');
  const [setupLogoUrl, setSetupLogoUrl] = useState('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop');
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url'>('upload');
  const [setupLocationLoading, setSetupLocationLoading] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast?.('Image is too large! Please choose an image smaller than 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSetupLogoUrl(reader.result);
          triggerToast?.('Logo uploaded successfully!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetWorkerSetupLocation = () => {
    const fallbackToIp = async (errMsg?: string) => {
      triggerToast?.('GPS failed. Falling back to Network IP Geolocation...', 'info');
      try {
        const ipData = await fetchIPLocation();
        setSetupLatitude(ipData.latitude);
        setSetupLongitude(ipData.longitude);
        if (ipData.country) setSetupShopCountry(ipData.country);
        if (ipData.region) setSetupShopState(ipData.region);
        if (ipData.city) setSetupShopDistrict(ipData.city);
        if (ipData.postal) setSetupShopPincode(ipData.postal);
        setSetupShopArea(ipData.area || 'Central Area');
        triggerToast?.('Location auto-loaded via IP Geolocation successfully!', 'success');
      } catch (err: any) {
        console.error("IP fallback error:", err);
        triggerToast?.(errMsg || err?.message || 'Network Geolocation failed.', 'error');
      } finally {
        setSetupLocationLoading(false);
      }
    };

    if (!navigator.geolocation) {
      fallbackToIp('Geolocation is not supported by your browser.');
      return;
    }
    setSetupLocationLoading(true);
    triggerToast?.('Requesting GPS coordinates...', 'info');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        setSetupLatitude(lat);
        setSetupLongitude(lon);
        
        triggerToast?.('GPS Locked! Fetching address details...', 'info');
        
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
              
              if (addr.country) setSetupShopCountry(addr.country);
              if (addr.state) setSetupShopState(addr.state);
              
              const resolvedDistrict = addr.state_district || addr.district || addr.county || addr.city || addr.town || addr.suburb || '';
              const cleanDistrict = resolvedDistrict.replace(/\s+(District|Taluk|County|Division)$/i, '').trim();
              setSetupShopDistrict(cleanDistrict || '');
              
              if (addr.postcode) setSetupShopPincode(addr.postcode);
              
              const street = addr.road || addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || '';
              const areaParts = [street, addr.quarter || ''].filter(Boolean).join(', ');
              if (areaParts) {
                setSetupShopArea(areaParts);
              } else if (data.display_name) {
                const dispParts = data.display_name.split(',');
                setSetupShopArea(dispParts.slice(0, 2).join(',').trim());
              }
              triggerToast?.('Address fields auto-loaded successfully!', 'success');
            } else {
              triggerToast?.('Current location coordinates retrieved successfully!', 'success');
            }
          } else {
            triggerToast?.('Current location coordinates retrieved successfully!', 'success');
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          triggerToast?.('Current location coordinates retrieved successfully!', 'success');
        } finally {
          setSetupLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        fallbackToIp(`Geolocation error: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const isPhoneMatchLocal = (phone1: string, phone2: string): boolean => {
    const c1 = (phone1 || '').replace(/\D/g, '');
    const c2 = (phone2 || '').replace(/\D/g, '');
    if (!c1 || !c2) return false;
    if (c1 === c2) return true;
    if (c1.length >= 8 && c2.length >= 8) {
      return c1.endsWith(c2) || c2.endsWith(c1);
    }
    return false;
  };

  // Find the workstation shop owner to display at the top of the registry
  const getWorkstationOwner = () => {
    if (!registeredTailors) return null;

    // 1. If currentUser is a tailor who corresponds to a registered shop, they are the owner
    const userEmail = (currentUser?.email || '').toLowerCase().trim();
    const userPhone = (currentUser?.phone || '').trim();
    const userName = (currentUser?.name || '').toLowerCase().trim();

    if (currentUser?.role === 'Tailor') {
      const selfMatch = registeredTailors.find((t: any) => {
        const tEmail = (t.email || '').toLowerCase().trim();
        const tPhone = (t.phone || '').trim();
        return (userEmail && tEmail === userEmail) || (userPhone && tPhone && isPhoneMatchLocal(userPhone, tPhone));
      });
      if (selfMatch) return selfMatch;
    }

    // 2. Otherwise, look for any registered tailor whose shop matches the workers' shop
    if (workers && workers.length > 0) {
      const firstWorker = workers[0];
      const ownerEmail = (firstWorker.shopOwnerEmail || '').toLowerCase().trim();
      const ownerId = firstWorker.shopOwnerId;
      const sName = (firstWorker.shopName || '').toLowerCase().trim();

      const ownerMatch = registeredTailors.find((t: any) => {
        const tEmail = (t.email || '').toLowerCase().trim();
        const tId = t.id;
        const tShopName = (t.shopName || '').toLowerCase().trim();

        return (ownerEmail && tEmail === ownerEmail) || 
               (ownerId && tId === ownerId) || 
               (sName && tShopName && tShopName === sName && t.hasRegisteredShop);
      });
      if (ownerMatch) return ownerMatch;
    }

    // 3. Fallback: find any registered tailor who has registered a shop that matches currentUser's known shop details
    const fallbackMatch = registeredTailors.find((t: any) => {
      const tEmail = (t.email || '').toLowerCase().trim();
      const tPhone = (t.phone || '').trim();
      const tName = (t.name || '').toLowerCase().trim();
      return (userEmail && tEmail === userEmail) || 
             (userPhone && tPhone && isPhoneMatchLocal(userPhone, tPhone)) ||
             (userName && tName === userName) ||
             t.hasRegisteredShop;
    });

    if (fallbackMatch && (fallbackMatch.hasRegisteredShop || fallbackMatch.role === 'Owner')) {
      return fallbackMatch;
    }

    return null;
  };

  // Helper to cross-reference with login profile / workspace registration status
  const getShopRegistrationStatus = (worker: Worker) => {
    // If the worker has shop registration attributes directly attached (and set to true), use it!
    if (worker.hasRegisteredShop) {
      return { 
        status: 'Registered', 
        label: 'Shop Active', 
        shopName: worker.shopName,
        logoUrl: worker.logoUrl,
        color: 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400',
        record: worker
      };
    }

    if (!registeredTailors) return null;
    
    // Robust phone comparison helper (handles spaces, formatting, and trailing digits)
    const isPhoneMatch = (phone1: string, phone2: string) => {
      const c1 = (phone1 || '').replace(/\D/g, '');
      const c2 = (phone2 || '').replace(/\D/g, '');
      if (!c1 || !c2) return false;
      if (c1 === c2) return true;
      if (c1.length >= 8 && c2.length >= 8) {
        return c1.endsWith(c2) || c2.endsWith(c1);
      }
      return false;
    };

    const workerEmail = (worker.email || '').toLowerCase().trim();
    const workerPhone = (worker.phone || '').trim();
    const workerName = (worker.name || '').toLowerCase().trim();
    
    const match = registeredTailors.find((t: any) => {
      const tEmail = (t.email || '').toLowerCase().trim();
      const tPhone = (t.phone || '').trim();
      const tName = (t.name || '').toLowerCase().trim();
      
      const emailMatches = workerEmail && tEmail === workerEmail;
      const phoneMatches = workerPhone && tPhone && isPhoneMatch(workerPhone, tPhone);
      const nameMatches = workerName && tName === workerName;

      return emailMatches || phoneMatches || nameMatches;
    });
    
    if (!match) {
      return { status: 'No Account', label: 'No Login Account', color: 'bg-stone-500/10 text-stone-500 dark:text-stone-400' };
    }
    
    if (match.hasRegisteredShop) {
      return { 
        status: 'Registered', 
        label: 'Shop Active', 
        shopName: match.shopName,
        logoUrl: match.logoUrl,
        color: 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400',
        record: match
      };
    }
    
    return { status: 'Pending', label: 'Setup Pending', color: 'bg-amber-500/10 text-[#d97706] dark:text-amber-400', record: match };
  };

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    role: 'Tailor' as Worker['role'],
    baseSalary: 2200,
    perOrderBonus: 20,
    avatar: ''
  });

  const [selectedRole, setSelectedRole] = useState<'Manager' | 'Tailor' | ''>('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    if (!editName.trim()) {
      triggerToast?.('Please specify the tailor\'s name.', 'error');
      return;
    }
    if (!editEmail.trim()) {
      triggerToast?.('Please specify a valid email address.', 'error');
      return;
    }

    const updatedWorker: Worker = {
      ...editingWorker,
      name: editName.trim(),
      email: editEmail.toLowerCase().trim(),
      phone: editPhone.trim(),
      location: editLocation.trim(),
      role: editRole,
      baseSalary: editBaseSalary,
      perOrderBonus: editPerOrderBonus,
      skills: editSkills
    };

    if (onUpdateWorker) {
      onUpdateWorker(updatedWorker);
    } else {
      triggerToast?.('Update handler is not registered in layout.', 'error');
    }

    setEditingWorker(null);
  };

  // Country code state linked automatically to location changes
  const [countryCode, setCountryCode] = useState('+1');
  const [localPhone, setLocalPhone] = useState('');

  const detectAndSetCountryCode = (locationText: string) => {
    const loc = locationText.toLowerCase();
    let detectedSign = '';
    
    if (loc.includes('london') || loc.includes('uk') || loc.includes('united kingdom') || loc.includes('britain') || loc.includes('scotland') || loc.includes('wales') || loc.includes('leicester')) {
      detectedSign = '+44';
    } else if (loc.includes('paris') || loc.includes('france')) {
      detectedSign = '+33';
    } else if (loc.includes('milan') || loc.includes('italy') || loc.includes('rome')) {
      detectedSign = '+39';
    } else if (loc.includes('tokyo') || loc.includes('japan') || loc.includes('kyoto') || loc.includes('osaka')) {
      detectedSign = '+81';
    } else if (loc.includes('mumbai') || loc.includes('india') || loc.includes('delhi') || loc.includes('bangalore') || loc.includes('kerala') || loc.includes('malappuram') || loc.includes('anakkayam')) {
      detectedSign = '+91';
    } else if (loc.includes('dubai') || loc.includes('uae') || loc.includes('abu dhabi') || loc.includes('emirates')) {
      detectedSign = '+971';
    } else if (loc.includes('germany') || loc.includes('berlin') || loc.includes('munich') || loc.includes('frankfurt')) {
      detectedSign = '+49';
    } else if (loc.includes('spain') || loc.includes('madrid') || loc.includes('barcelona')) {
      detectedSign = '+34';
    } else if (loc.includes('canada') || loc.includes('toronto') || loc.includes('vancouver')) {
      detectedSign = '+1';
    } else if (loc.includes('australia') || loc.includes('sydney') || loc.includes('melbourne')) {
      detectedSign = '+61';
    } else if (loc.includes('new york') || loc.includes('usa') || loc.includes('california') || loc.includes('chicago') || loc.includes('america') || loc.includes('boston') || loc.includes('houston')) {
      detectedSign = '+1';
    }

    if (detectedSign) {
      setCountryCode(detectedSign);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      if (triggerToast) {
        triggerToast('Please provide an employee name.', 'error');
      } else {
        alert('Please provide an employee name.');
      }
      return;
    }

    if (!formData.email.trim()) {
      if (triggerToast) {
        triggerToast('Please provide an email address.', 'error');
      } else {
        alert('Please provide an email address.');
      }
      return;
    }

    if (!formData.location.trim()) {
      if (triggerToast) {
        triggerToast('Please provide a location.', 'error');
      } else {
        alert('Please provide a location.');
      }
      return;
    }

    if (!localPhone.trim()) {
      if (triggerToast) {
        triggerToast('Please provide a phone number.', 'error');
      } else {
        alert('Please provide a phone number.');
      }
      return;
    }

    if (!selectedRole) {
      if (triggerToast) {
        triggerToast('Please select an employee role.', 'error');
      } else {
        alert('Please select an employee role.');
      }
      return;
    }

    if (selectedRole === 'Tailor' && selectedGenres.length === 0) {
      if (triggerToast) {
        triggerToast('Please tick at least one skilled clothing genre for the tailor.', 'error');
      } else {
        alert('Please tick at least one skilled clothing genre for the tailor.');
      }
      return;
    }

    const emailStr = formData.email.trim();
    const phoneStr = `${countryCode} ${localPhone.trim()}`;

    onAddWorker({
      name: formData.name.trim(),
      phone: phoneStr,
      email: emailStr,
      role: selectedRole as any,
      rating: 4.8,
      baseSalary: formData.baseSalary || 2200,
      perOrderBonus: formData.perOrderBonus || 20,
      avatar: formData.avatar || `https://images.unsplash.com/photo-${1519085360753 - Math.floor(Math.random() * 50000)}?auto=format&fit=crop&q=80&w=120`,
      location: formData.location.trim(),
      skills: selectedRole === 'Tailor' ? selectedGenres : []
    });
    setIsAddOpen(false);
    if (triggerToast) {
       triggerToast(`Activated ${selectedRole} profile and generated credentials!`, 'success');
    } else {
       alert(`Activated ${selectedRole} profile and generated credentials!`);
    }
  };

  return (
    <div className="space-y-6 fade-in p-1">
      {/* Intro Block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-250 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">TAILORSHOP ERP Tailor Registry</h2>
          <p className="text-stone-400 text-xs">Verify tailor profiles, check productivity charts, commissions, and assign custom bonus structures</p>
        </div>
         <div className="flex items-center gap-3">
          {currentUser?.role === 'Owner' && onDeleteAllWorkers && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to permanently remove all tailors from your registry? This cannot be undone.")) {
                  onDeleteAllWorkers();
                }
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 transition-all font-semibold text-xs rounded-xl text-white shadow-md flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="h-4 w-4" />
              <span>Remove All Tailors</span>
            </button>
          )}
          <button
            onClick={() => {
              setFormData({
                name: '',
                phone: '',
                email: '',
                location: '',
                role: 'Tailor',
                baseSalary: 2200,
                perOrderBonus: 20,
                avatar: `https://images.unsplash.com/photo-${1500648767791 - Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&q=80&w=120`
              });
              setCountryCode('+1');
              setLocalPhone('');
              setSelectedRole('');
              setSelectedGenres([]);
              setIsRoleDropdownOpen(false);
              setIsAddOpen(true);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 transition-all font-semibold text-xs rounded-xl text-white shadow-md flex items-center space-x-1.5 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Include tailor/manager</span>
          </button>
        </div>
      </div>

      {/* Search & Filters block */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row gap-3 items-center justify-between text-xs font-sans ${
        isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-stone-50 border-stone-200'
      }`}>
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search tailor name, phone, workshop..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-250 text-stone-900'
            }`}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">🔍</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          <div className="flex items-center space-x-2">
            <span className="text-stone-400 font-bold shrink-0 uppercase tracking-wider text-[10px]">Role:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className={`p-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-semibold ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-250 text-stone-955'
              }`}
            >
              <option value="All">All Roles</option>
              <option value="Master Cutter">Master Cutter</option>
              <option value="Senior Stitcher">Senior Stitcher</option>
              <option value="Finisher & Ironer">Finisher & Ironer</option>
              <option value="Apprentice">Apprentice</option>
              <option value="Manager">Manager</option>
              <option value="Tailor">Tailor</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-stone-400 font-bold shrink-0 uppercase tracking-wider text-[10px]">Genre:</span>
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className={`p-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-semibold ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-250 text-stone-955'
              }`}
            >
              <option value="All">All Specialities</option>
              {clothingCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List of tailor registry bars */}
      <div className="flex flex-col gap-3">
        {(() => {
          const ownerRecord = getWorkstationOwner();

          // Filter out duplicate worker entries that match the Shop Owner's email or phone
          const filteredWorkers = workers.filter((w) => {
            if (!ownerRecord) return true;
            const wEmail = (w.email || '').toLowerCase().trim();
            const oEmail = (ownerRecord.email || '').toLowerCase().trim();
            const wPhone = (w.phone || '').trim();
            const oPhone = (ownerRecord.phone || '').trim();
            
            const isOwnerEmail = wEmail && oEmail && wEmail === oEmail;
            const isOwnerPhone = wPhone && oPhone && isPhoneMatchLocal(wPhone, oPhone);
            if (isOwnerEmail || isOwnerPhone) return false;

            // Apply search filter
            if (filterSearch) {
              const query = filterSearch.toLowerCase().trim();
              const nameMatch = (w.name || '').toLowerCase().includes(query);
              const phoneMatch = (w.phone || '').includes(query);
              const emailMatch = (w.email || '').toLowerCase().includes(query);
              const locationMatch = (w.location || '').toLowerCase().includes(query);
              if (!nameMatch && !phoneMatch && !emailMatch && !locationMatch) return false;
            }

            // Apply role filter
            if (filterRole !== 'All') {
              if (w.role !== filterRole) return false;
            }

            // Apply genre specialty filter
            if (filterGenre !== 'All') {
              const hasGenre = w.skills && w.skills.includes(filterGenre);
              if (!hasGenre) return false;
            }

            return true;
          });

          // Convert ownerRecord to a standard listing-compatible format
          const ownerListItem = ownerRecord ? {
            id: ownerRecord.id || 'owner-item-id',
            name: ownerRecord.name,
            email: ownerRecord.email,
            phone: ownerRecord.phone,
            role: 'Shop Owner' as const,
            location: ownerRecord.location || 'Central Suite',
            avatar: ownerRecord.logoUrl || ownerRecord.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
            rating: 5.0,
            isOwner: true,
            shopName: ownerRecord.shopName,
            hasRegisteredShop: true
          } : null;

          // Only show Owner in list if no roll filters or if the role filter matches Shop Owner (conceptually and visually clean)
          const showOwner = filterRole === 'All' && filterGenre === 'All';
          const listToRender = (ownerListItem && showOwner) ? [ownerListItem, ...filteredWorkers] : filteredWorkers;
          const totalWorkersCount = listToRender.length;
          const totalWorkerPages = Math.ceil(totalWorkersCount / workerPageSize) || 1;
          const paginatedList = listToRender.slice((workerPage - 1) * workerPageSize, workerPage * workerPageSize);

          return (
            <>
              {paginatedList.length > 0 ? (
                paginatedList.map((worker) => {
                  const isOwner = 'isOwner' in worker && worker.isOwner;
                  const shopStatus = isOwner ? null : getShopRegistrationStatus(worker as any);
                  const displayAvatar = isOwner 
                    ? (worker.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120')
                    : ((shopStatus && shopStatus.status === 'Registered' && shopStatus.logoUrl) ? shopStatus.logoUrl : worker.avatar);

                  return (
                    <div
                      key={worker.id}
                      className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between transition-all relative gap-4 ${
                        isOwner
                          ? (isDarkMode ? 'bg-gradient-to-r from-amber-950/20 via-slate-900/40 to-slate-900/30 border-amber-500/30 shadow-amber-950/15' : 'bg-gradient-to-r from-amber-50/50 via-white to-stone-50/60 border-amber-350 shadow-md shadow-amber-500/5')
                          : (isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white border-stone-200 shadow-sm')
                      }`}
                    >
                      {/* Profile Details (Left side) */}
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black tracking-wider shrink-0 select-none border-2 ${
                          isOwner 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-300 dark:border-amber-500/30 shadow-md shadow-amber-500/10' 
                            : (isDarkMode ? 'bg-slate-805 text-amber-500 border-slate-800' : 'bg-amber-50 text-amber-700 border-amber-100 shadow-3xs')
                        }`}>
                          {worker.name ? worker.name.trim().substring(0, 2).toUpperCase() : 'TA'}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100">{worker.name}</h3>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {isOwner ? (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold uppercase tracking-wider flex items-center gap-1 border border-amber-600/20">
                                👑 Shop Owner &amp; Founder
                              </span>
                            ) : (
                              <>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold uppercase tracking-wider border border-blue-500/10">
                                  Employee
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-stone-300 font-bold uppercase tracking-wider">
                                  {worker.role}
                                </span>
                                {(worker as any).skills && (worker as any).skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 items-center">
                                    {(worker as any).skills.map((skill: string) => (
                                      <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-semibold uppercase">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                            
                          </div>
                        </div>
                      </div>

                      {/* Contact Data (Middle side) */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-stone-500 dark:text-stone-400 md:ml-auto md:mr-12">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                          <span>{worker.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{worker.email}</span>
                        </div>
                        {worker.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span>{worker.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons (Right side) */}
                      <div className="flex items-center space-x-2 shrink-0 md:static relative self-end md:self-auto top-[-8px] md:top-auto">

                        {!isOwner && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingWorker(worker as any);
                              setEditName(worker.name);
                              setEditPhone(worker.phone || '');
                              setEditEmail(worker.email || '');
                              setEditLocation(worker.location || '');
                              setEditRole(worker.role || 'Tailor');
                              setEditBaseSalary((worker as any).baseSalary || 2200);
                              setEditPerOrderBonus((worker as any).perOrderBonus || 20);
                              setEditSkills((worker as any).skills || []);
                            }}
                            className="px-3 py-1.5 border border-stone-300 hover:border-amber-600 hover:bg-amber-500 hover:text-white dark:border-slate-800 dark:text-stone-300 dark:hover:bg-amber-600 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer shrink-0 shadow-3xs"
                            title="Edit tailor profile details"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Edit details</span>
                          </button>
                        )}

                        {!isOwner && onDeleteWorker && (
                          <button
                            type="button"
                            onClick={() => {
                              setWorkerToDelete(worker as any);
                            }}
                            title="Remove tailor profile"
                            className="p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-8 text-stone-400">
                  No tailors found matching filters.
                </div>
              )}

              {totalWorkersCount > workerPageSize && (
                <div className="flex flex-col items-center justify-center gap-3 pt-4 mt-2 border-t border-stone-100 dark:border-slate-800 font-sans text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={workerPage === 1}
                      onClick={() => setWorkerPage(prev => Math.max(prev - 1, 1))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        workerPage === 1
                          ? 'bg-stone-50 text-stone-300 border-stone-200 dark:bg-slate-900 dark:text-slate-700 dark:border-slate-800 cursor-not-allowed'
                          : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-850 dark:border-slate-800 cursor-pointer'
                      }`}
                    >
                      Previous
                    </button>
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                      Page {workerPage} of {totalWorkerPages}
                    </span>
                    <button
                      type="button"
                      disabled={workerPage === totalWorkerPages}
                      onClick={() => setWorkerPage(prev => Math.min(prev + 1, totalWorkerPages))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        workerPage === totalWorkerPages
                          ? 'bg-stone-50 text-stone-300 border-stone-200 dark:bg-slate-900 dark:text-slate-700 dark:border-slate-800 cursor-not-allowed'
                          : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-850 dark:border-slate-800 cursor-pointer'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="text-stone-400">
                    Showing <span className="font-bold text-stone-600 dark:text-stone-300">{(workerPage - 1) * workerPageSize + 1}</span> to <span className="font-bold text-stone-600 dark:text-stone-300">{Math.min(workerPage * workerPageSize, totalWorkersCount)}</span> of <span className="font-bold text-stone-600 dark:text-stone-300">{totalWorkersCount}</span> employees
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>



      {/* Include new tailor Modal */}
      {isAddOpen && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
          <div className={`p-6 rounded-2xl max-w-md w-full border shadow-2xl relative ${
            isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white shadow-black/80' : 'bg-white border-stone-150 text-stone-900 shadow-stone-300'
          }`}>
            <h3 className="font-serif text-lg font-bold mb-4">Include Tailor/Manager Card</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Tailor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Rashid Khan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. name@tailorshop.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. London Workshop, Bay 2"
                  value={formData.location}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, location: val });
                    detectAndSetCountryCode(val);
                  }}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Phone Number *</label>
                <div className="flex space-x-1.5">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-bold w-[72px] shrink-0 text-center bg-stone-50 dark:bg-slate-850 text-stone-800 dark:text-stone-100"
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+61">🇦🇺 +61</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="e.g. (555) 018-9999"
                    value={localPhone}
                    onChange={(e) => setLocalPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Employee Role Select Component */}
              <div className="relative">
                <label className="block text-stone-400 font-semibold mb-1">Select Employee Role *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-stone-50 dark:bg-slate-850 hover:bg-stone-100 dark:hover:bg-slate-750 transition text-xs font-semibold text-stone-800 dark:text-stone-100"
                  >
                    <span className={selectedRole ? '' : 'text-stone-400 dark:text-stone-500 font-bold'}>
                      {selectedRole || 'Choose Role'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-stone-400" />
                  </button>
                  {isRoleDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 rounded-xl border shadow-lg bg-white dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 z-[99999] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole('Manager');
                          setIsRoleDropdownOpen(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-stone-100 dark:hover:bg-zinc-700 text-xs font-semibold text-stone-800 dark:text-stone-100"
                      >
                        Manager
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole('Tailor');
                          setIsRoleDropdownOpen(false);
                        }}
                        className="w-full text-left p-2.5 hover:bg-stone-100 dark:hover:bg-zinc-700 text-xs font-semibold text-stone-800 dark:text-stone-100"
                      >
                        Tailor
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Show Skilled Genres Checkboxes if role is Tailor */}
              {selectedRole === 'Tailor' && (
                <div className="p-3 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900/40">
                  <span className="block text-stone-400 font-bold mb-2">Skilled Clothing Genres *</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {clothingCategories.map((genre) => {
                      const isTicked = selectedGenres.includes(genre);
                      return (
                        <label
                          key={genre}
                          className="flex items-center space-x-2 cursor-pointer p-1 text-stone-700 dark:text-stone-300 font-medium"
                        >
                          <input
                            type="checkbox"
                            checked={isTicked}
                            onChange={() => {
                              if (isTicked) {
                                setSelectedGenres(selectedGenres.filter((item) => item !== genre));
                              } else {
                                setSelectedGenres([...selectedGenres, genre]);
                              }
                            }}
                            className="rounded border-stone-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer accent-amber-500"
                          />
                          <span>{genre}</span>
                        </label>
                      );
                    })}
                  </div>
                  {selectedGenres.length === 0 && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 font-semibold animate-pulse">
                      ⚠️ Please tick at least one genre the tailor is skilled in.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-500 font-semibold hover:bg-stone-50 dark:hover:bg-slate-800 dark:border-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold"
                >
                  Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Delete Confirmation Modal */}
      {workerToDelete && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] fade-in text-left">
          <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl relative ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <h3 className="text-base font-bold mb-2">Delete Tailor Profile?</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-bold text-stone-900 dark:text-white">"{workerToDelete.name}"</span> from the ERP registry? This action is irreversible.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setWorkerToDelete(null)}
                className="px-4 py-2 border rounded-xl text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-semibold hover:bg-stone-50 dark:hover:bg-slate-850 dark:border-slate-750 text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteWorker) {
                    onDeleteWorker(workerToDelete.id);
                  }
                  setWorkerToDelete(null);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-white font-bold text-xs transition shadow-sm"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Setup Shop Modal */}
      {selectedSetupWorker && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] fade-in text-left overflow-y-auto">
          <div className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl relative my-8 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white shadow-black/80' : 'bg-white border-stone-150 text-stone-900 shadow-stone-300 font-sans'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 mb-4 dark:border-stone-800 border-stone-150">
              <h3 className="font-serif text-lg font-bold">Setup Shop Workstation for {selectedSetupWorker.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedSetupWorker(null)}
                className="text-stone-400 hover:text-stone-600 font-bold font-mono text-base"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!setupShopName.trim() || !setupOwnerName.trim() || !setupShopPhone.trim() || !setupShopArea.trim() || !setupShopPincode.trim() || !setupLatitude.trim() || !setupLongitude.trim()) {
                  triggerToast?.('All required (*) fields are needed to setup this tailor workstation!', 'error');
                  return;
                }
                const formattedAddr = [
                  setupShopArea.trim(),
                  setupShopDistrict.trim(),
                  setupShopState.trim(),
                  setupShopCountry.trim(),
                  setupShopPincode.trim() ? `PIN: ${setupShopPincode.trim()}` : ''
                ].filter(Boolean).join(', ');

                onSetupTailorShop?.(selectedSetupWorker, {
                  shopName: setupShopName.trim(),
                  name: setupOwnerName.trim(),
                  phone: setupShopPhone.trim(),
                  location: formattedAddr,
                  logoUrl: setupLogoUrl.trim() || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop',
                  coordinateLatitude: setupLatitude.trim(),
                  coordinateLongitude: setupLongitude.trim()
                });
                setSelectedSetupWorker(null);
              }}
              className="space-y-4 text-xs text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Shop / TAILORSHOP ERP Name *</label>
                  <input
                    type="text"
                    required
                    value={setupShopName}
                    onChange={(e) => setSetupShopName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    value={setupOwnerName}
                    onChange={(e) => setSetupOwnerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Workstation Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={setupShopPhone}
                    onChange={(e) => setSetupShopPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-400 font-semibold mb-0.5">Establishment Logo</label>
                    <div className="flex bg-stone-100 dark:bg-slate-800 p-0.5 rounded-lg text-[9.5px]">
                      <button
                        type="button"
                        onClick={() => setLogoInputMode('upload')}
                        className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                          logoInputMode === 'upload'
                            ? 'bg-amber-500 text-white shadow-3xs'
                            : 'text-stone-550 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                        }`}
                      >
                        Upload Local File
                      </button>
                      <button
                        type="button"
                        onClick={() => setLogoInputMode('url')}
                        className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                          logoInputMode === 'url'
                            ? 'bg-amber-500 text-white shadow-3xs'
                            : 'text-stone-550 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                        }`}
                      >
                        Paste Image URL
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-center">
                    {/* Live thumbnail preview */}
                    <div className="w-11 h-11 rounded-lg border border-dashed border-stone-300 dark:border-slate-700 flex items-center justify-center bg-stone-100/50 dark:bg-slate-800/50 shrink-0 overflow-hidden relative shadow-inner">
                      {setupLogoUrl ? (
                        <img
                          src={setupLogoUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&auto=format&fit=crop';
                          }}
                        />
                      ) : (
                        <Image className="h-4 w-4 text-stone-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {logoInputMode === 'upload' ? (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            id="workshop-logo-upload-input"
                          />
                          <label
                            htmlFor="workshop-logo-upload-input"
                            className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center space-x-1.5 text-[10.5px] cursor-pointer hover:bg-stone-50 dark:hover:bg-slate-750 transition border-dashed text-stone-550 dark:text-stone-350 font-bold"
                          >
                            <Upload className="h-3.5 w-3.5 text-amber-500" />
                            <span>Choose Photo...</span>
                          </label>
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="https://example.com/logo.png"
                          value={setupLogoUrl}
                          onChange={(e) => setSetupLogoUrl(e.target.value)}
                          className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                        />
                      )}
                    </div>
                  </div>

                  {/* Preset suggestions for fast, exquisite customization */}
                  <div className="flex flex-col space-y-1 pt-1">
                    <span className="text-[8.5px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider">Fast Presets Suggestions</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { name: 'Shears', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=150&auto=format&fit=crop' },
                        { name: 'Loom', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=150&auto=format&fit=crop' },
                        { name: 'Stitch', url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=150&auto=format&fit=crop' },
                        { name: 'Roll', url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=150&auto=format&fit=crop' },
                        { name: 'Crest', url: 'https://images.unsplash.com/photo-1524295984849-51b72e9dd980?w=150&auto=format&fit=crop' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSetupLogoUrl(preset.url);
                            triggerToast?.(`Applied ${preset.name} preset!`, 'success');
                          }}
                          className={`flex items-center space-x-1 shrink-0 px-1.5 py-0.5 rounded-md border text-[9px] font-bold transition-all cursor-pointer ${
                            setupLogoUrl.startsWith(preset.url.split('?')[0])
                              ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-500'
                              : 'border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900/40 hover:border-stone-300 dark:hover:border-slate-700 text-stone-550 dark:text-stone-400'
                          }`}
                        >
                          <img src={preset.url} className="w-3.5 h-3.5 rounded object-cover" alt={preset.name} referrerPolicy="no-referrer" />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t dark:border-stone-800 border-stone-150 pt-2 flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-500">Address Details & Coordinates</span>
                <button
                  type="button"
                  onClick={handleGetWorkerSetupLocation}
                  disabled={setupLocationLoading}
                  className="text-[9.5px] bg-amber-500/10 hover:bg-amber-500/25 text-amber-600 dark:text-amber-550 font-extrabold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 border border-amber-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
                  title="Lock current coordinates and auto-fill address"
                >
                  <MapPin className={`h-3 w-3 ${setupLocationLoading ? 'animate-spin' : ''}`} />
                  <span>{setupLocationLoading ? 'Locking...' : 'Use Current Location'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Area / Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MG Road, Near Central Library"
                    value={setupShopArea}
                    onChange={(e) => setSetupShopArea(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">District / City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bangalore"
                    value={setupShopDistrict}
                    onChange={(e) => setSetupShopDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karnataka"
                    value={setupShopState}
                    onChange={(e) => setSetupShopState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 560001"
                    value={setupShopPincode}
                    onChange={(e) => setSetupShopPincode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={setupShopCountry}
                    onChange={(e) => setSetupShopCountry(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">GPS Latitude *</label>
                  <input
                    type="text"
                    required
                    value={setupLatitude}
                    onChange={(e) => setSetupLatitude(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">GPS Longitude *</label>
                  <input
                    type="text"
                    required
                    value={setupLongitude}
                    onChange={(e) => setSetupLongitude(e.target.value)}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t dark:border-slate-800 border-stone-150">
                <button
                  type="button"
                  onClick={() => setSelectedSetupWorker(null)}
                  className="px-4 py-2 border rounded-xl text-stone-500 dark:text-stone-400 font-semibold hover:bg-stone-50 dark:hover:bg-slate-800 dark:border-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Activate Shop Workstation
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Editing Tailor Modal */}
      {editingWorker && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
          <div className={`p-6 rounded-2xl max-w-md w-full border shadow-2xl relative ${
            isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white shadow-black/80' : 'bg-white border-stone-150 text-stone-900 shadow-stone-300'
          }`}>
            <h3 className="font-serif text-lg font-bold mb-4">Edit Tailor Credentials &amp; Specialty</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Tailor Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold bg-transparent"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Email Address (Username) *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold bg-transparent"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Phone Number (Can log in with this too!) *</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold bg-transparent"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Workshop Location *</label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold bg-transparent"
                />
              </div>

              <div className="relative">
                <label className="block text-stone-400 font-semibold mb-1">Employee Role *</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsEditRoleDropdownOpen(!isEditRoleDropdownOpen)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 bg-stone-50 dark:bg-slate-850 hover:bg-stone-100 dark:hover:bg-slate-750 transition text-xs font-semibold text-stone-800 dark:text-stone-100"
                  >
                    <span>{editRole}</span>
                    <ChevronDown className="h-4 w-4 text-stone-400" />
                  </button>
                  {isEditRoleDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 rounded-xl border shadow-lg bg-white dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 z-[99999] overflow-hidden">
                      {['Master Cutter', 'Senior Stitcher', 'Finisher & Ironer', 'Apprentice', 'Manager', 'Tailor'].map((roleOpt) => (
                        <button
                          key={roleOpt}
                          type="button"
                          onClick={() => {
                            setEditRole(roleOpt as any);
                            setIsEditRoleDropdownOpen(false);
                          }}
                          className="w-full text-left p-2.5 hover:bg-stone-100 dark:hover:bg-zinc-700 text-xs font-semibold text-stone-800 dark:text-stone-100 block"
                        >
                          {roleOpt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Monthly Base Salary (₹) *</label>
                  <input
                    type="number"
                    value={editBaseSalary}
                    onChange={(e) => setEditBaseSalary(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Per Order Bonus (₹) *</label>
                  <input
                    type="number"
                    value={editPerOrderBonus}
                    onChange={(e) => setEditPerOrderBonus(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-semibold bg-transparent"
                  />
                </div>
              </div>

              {/* Show Skilled Genres Checkboxes */}
              <div className="p-3 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900/40">
                <span className="block text-stone-400 font-bold mb-2">Skilled Clothing Genres (Specialties)</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {clothingCategories.map((genre) => {
                    const isTicked = editSkills.includes(genre);
                    return (
                      <label
                        key={genre}
                        className="flex items-center space-x-2 cursor-pointer p-1 text-stone-700 dark:text-stone-300 font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={isTicked}
                          onChange={() => {
                            if (isTicked) {
                              setEditSkills(editSkills.filter((item) => item !== genre));
                            } else {
                              setEditSkills([...editSkills, genre]);
                            }
                          }}
                          className="rounded border-stone-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer accent-amber-500"
                        />
                        <span>{genre}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t dark:border-slate-800 border-stone-150">
                <button
                  type="button"
                  onClick={() => setEditingWorker(null)}
                  className="px-4 py-2 border rounded-xl text-stone-500 font-semibold hover:bg-stone-50 dark:hover:bg-slate-805 dark:border-slate-750"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold transition-all"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
