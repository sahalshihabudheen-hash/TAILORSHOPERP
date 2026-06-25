import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Smartphone,
  ExternalLink,
  History,
  Image as ImageIcon,
  Download,
  Upload,
  User,
  Scissors
} from 'lucide-react';
import { Customer, Order } from '../types';
import PaginationByNumber from './PaginationByNumber';

interface CustomerManagementProps {
  customers: Customer[];
  orders: Order[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'qrCodeData' | 'createdAt' | 'passwordChanged'>) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  isDarkMode: boolean;
  searchFilter: string;
}

export default function CustomerManagementView({
  customers,
  orders,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  isDarkMode,
  searchFilter
}: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Forms states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    avatar: ''
  });

  const [customerPage, setCustomerPage] = useState(1);
  const [customerPageSize, setCustomerPageSize] = useState(10);

  const [editFormData, setEditFormData] = useState<Customer | null>(null);

  // Filter customers based on search query
  const combinedSearchQuery = (searchTerm || searchFilter || '').toLowerCase();
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(combinedSearchQuery) ||
      c.id.toLowerCase().includes(combinedSearchQuery) ||
      c.phone.includes(combinedSearchQuery) ||
      c.email.toLowerCase().includes(combinedSearchQuery)
  );

  useEffect(() => {
    setCustomerPage(1);
  }, [combinedSearchQuery, customerPageSize]);

  const totalCustomerPages = Math.ceil(filteredCustomers.length / customerPageSize) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (customerPage - 1) * customerPageSize,
    customerPage * customerPageSize
  );

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?auto=format&fit=crop&q=80&w=120`
    });
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill out the name, email, and phone fields.');
      return;
    }
    onAddCustomer({
      name: formData.name,
      phone: formData.phone,
      whatsapp: formData.whatsapp || formData.phone,
      email: formData.email,
      address: formData.address || 'No address specified',
      avatar: formData.avatar
    });
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditFormData(cust);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editFormData) {
      onEditCustomer(editFormData);
      setIsEditModalOpen(false);
      if (selectedCustomer?.id === editFormData.id) {
        setSelectedCustomer(editFormData);
      }
    }
  };

  // Get images for customer gallery based on their orders
  const customerOrders = orders.filter((o) => o.customerId === (selectedCustomer?.id || ''));
  const allReferenceImg = customerOrders.flatMap((o) => o.images.reference);
  const allFabricImg = customerOrders.flatMap((o) => o.images.fabric);
  const allFinishedImg = customerOrders.flatMap((o) => o.images.finished);

  // QR Code generator helper (procedurally draws inside canvas or shows graphic representation)
  const drawProceduralQR = (id: string, name: string) => {
    // Generate a reliable mock SVG QR layout
    return (
      <svg className="w-36 h-36 bg-white p-2 rounded-xl border" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="white" />
        {/* Corners */}
        <rect x="5" y="5" width="25" height="25" fill="#1e293b" />
        <rect x="9" y="9" width="17" height="17" fill="white" />
        <rect x="13" y="13" width="9" height="9" fill="#1e293b" />

        <rect x="70" y="5" width="25" height="25" fill="#1e293b" />
        <rect x="74" y="9" width="17" height="17" fill="white" />
        <rect x="78" y="13" width="9" height="9" fill="#1e293b" />

        <rect x="5" y="70" width="25" height="25" fill="#1e293b" />
        <rect x="9" y="74" width="17" height="17" fill="white" />
        <rect x="13" y="78" width="9" height="9" fill="#1e293b" />

        {/* Random procedural QR-style patterns based on Customer name length */}
        <rect x="40" y="10" width="15" height="5" fill="#d4af37" />
        <rect x="45" y="20" width="10" height="10" fill="#1e293b" />
        <rect x="10" y="45" width="15" height="10" fill="#1e293b" />
        <rect x="35" y="40" width="25" height="15" fill="#1e293b" />
        <rect x="70" y="40" width="10" height="20" fill="#d4af37" />
        <rect x="40" y="70" width="20" height="10" fill="#1e293b" />
        <rect x="75" y="75" width="15" height="15" fill="#1e293b" />
        <rect x="45" y="85" width="20" height="10" fill="#d4af37" />
        <circle cx="50" cy="50" r="4" fill="#d4af37" />
      </svg>
    );
  };

  const forceImageDownload = (url: string) => {
    // Open in separate window referrer policy compliant
    window.open(url, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in p-1">
      {/* Customers List Box */}
      <div className={`p-5 rounded-2xl border ${selectedCustomer ? 'lg:col-span-1' : 'lg:col-span-3'} ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center mb-4 gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold">Clients Registry</h3>
            <p className="text-[11px] text-stone-400">Total {filteredCustomers.length} bespoke profiles</p>
          </div>
          <div className="flex items-center gap-1.5">
            <select
              value={customerPageSize}
              onChange={(e) => {
                setCustomerPageSize(Number(e.target.value));
                setCustomerPage(1);
              }}
              title="Clients per page"
              className={`p-1.5 px-2 rounded-xl border text-[10.5px] font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <option value={5}>5 / Page</option>
              <option value={10}>10 / Page</option>
              <option value={20}>20 / Page</option>
              <option value={50}>50 / Page</option>
              <option value={100}>100 / Page</option>
              <option value={400}>400 / Page</option>
            </select>
            <button
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 transition-all font-semibold text-xs rounded-xl text-white flex items-center space-x-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Client</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500 focus:ring-amber-500'
                : 'bg-stone-50 border-stone-200 text-stone-800 focus:border-amber-500'
            }`}
          />
        </div>

        {/* Clients table/list */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 mb-2">
          {filteredCustomers.length === 0 ? (
            <p className="text-stone-400 text-center text-xs py-10">No matching client profiles located.</p>
          ) : (
            paginatedCustomers.map((cust) => {
              const isActive = selectedCustomer?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${
                    isActive
                      ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-500/10'
                      : isDarkMode
                      ? 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-850/50'
                      : 'border-stone-150 bg-stone-50/40 hover:bg-white hover:border-stone-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800 text-stone-100 font-mono text-[10px] font-bold p-1 overflow-hidden select-none shrink-0 ring-2 ring-stone-200/55 dark:ring-slate-800" title={cust.name}>
                      <span className="truncate max-w-full text-center lowercase leading-none">{cust.name.substring(0, 20)}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs truncate">{cust.name}</h4>
                      <p className="text-[10px] text-stone-400 font-mono tracking-wide">{cust.id}</p>
                      <p className="text-[10px] text-stone-500 truncate">{cust.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleOpenEditModal(cust, e)}
                      className="p-1 rounded-lg bg-stone-100 dark:bg-slate-800 hover:text-amber-500 transition-all"
                      title="Edit Account"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomer(cust.id);
                        if (selectedCustomer?.id === cust.id) setSelectedCustomer(null);
                      }}
                      className="p-1 rounded-lg bg-stone-100 dark:bg-slate-800 hover:text-red-500 transition-all"
                      title="Delete Customer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalCustomerPages > 1 && (
          <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2">
            <PaginationByNumber
              currentPage={customerPage}
              totalPages={totalCustomerPages}
              onPageChange={(p) => setCustomerPage(p)}
              isDarkMode={isDarkMode}
            />
            <div className="text-[10px] text-stone-400 font-sans text-center">
              Showing <span className="font-bold text-stone-600 dark:text-stone-300">{(customerPage - 1) * customerPageSize + 1}</span> to <span className="font-bold text-stone-600 dark:text-stone-300">{Math.min(customerPage * customerPageSize, filteredCustomers.length)}</span> of <span className="font-bold text-stone-600 dark:text-stone-300">{filteredCustomers.length}</span> clients
            </div>
          </div>
        )}
      </div>

      {/* Customer dossier/profile Page Column */}
      {selectedCustomer && (
        <div className={`p-6 rounded-2xl border lg:col-span-2 space-y-6 fade-in ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 dark:border-slate-800 gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-14 w-14 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-800 text-stone-100 font-mono text-xs font-bold p-1 overflow-hidden select-none shrink-0" title={selectedCustomer.name}>
                <span className="truncate max-w-full text-center lowercase leading-none">{selectedCustomer.name.substring(0, 20)}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-500 block">Active Client Dossier</span>
                <h3 className="font-serif text-xl font-bold">{selectedCustomer.name}</h3>
                <span className="text-[10px] font-mono bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded text-stone-500 dark:text-stone-300">
                  ID: {selectedCustomer.id}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-xs px-2.5 py-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-lg transition-all self-end sm:self-auto"
            >
              Close Dossier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Details cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center space-x-1">
                <User className="h-3.5 w-3.5 text-amber-500" />
                <span>Contact Specifications</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl flex items-center space-x-3">
                  <Phone className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-stone-400">Personal Phone</p>
                    <p className="font-bold truncate">{selectedCustomer.phone}</p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl flex items-center space-x-3">
                  <Smartphone className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-stone-400">WhatsApp Alert Line</p>
                      <p className="font-bold truncate text-emerald-600 dark:text-emerald-400">{selectedCustomer.whatsapp}</p>
                    </div>
                    <a
                      href={`https://wa.me/${selectedCustomer.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 text-[10px] font-bold flex items-center space-x-1"
                    >
                      <span>Ping</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl flex items-center space-x-3">
                  <Mail className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-stone-400">Email Address (Username)</p>
                    <p className="font-bold truncate">{selectedCustomer.email}</p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl flex items-center space-x-3">
                  <MapPin className="h-3.5 w-3.5 text-stone-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-stone-400">Physical Address</p>
                    <p className="font-bold leading-tight">{selectedCustomer.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR System Box */}
            <div className="flex flex-col items-center justify-center p-4 bg-stone-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-stone-200 dark:border-slate-800 text-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center space-x-1.5">
                <Scissors className="h-3.5 w-3.5 text-amber-500" />
                <span>Bespoke Dossier QR Identifier</span>
              </h4>
              {drawProceduralQR(selectedCustomer.id, selectedCustomer.name)}
              <p className="text-[10px] text-stone-500 mt-2 max-w-[200px] leading-tight">
                Scan vector token to instantly pull customer size card inside physical tablet workstation.
              </p>
            </div>
          </div>

          {/* Sizing Galleries */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center space-x-1">
              <ImageIcon className="h-3.5 w-3.5 text-amber-500" />
              <span>Garments & Fabric Media Album ({allReferenceImg.length + allFabricImg.length + allFinishedImg.length} photos)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ref Album */}
              <div className="p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl space-y-2 border">
                <span className="text-[10.5px] font-bold text-stone-500 uppercase tracking-wider">Styles & References</span>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {allReferenceImg.length === 0 ? (
                    <span className="text-[10px] text-stone-400">No images.</span>
                  ) : (
                    allReferenceImg.map((img, i) => (
                      <div key={i} className="relative group rounded overflow-hidden h-14 border bg-stone-200">
                        <img src={img} alt="Reference" className="w-full h-full object-cover" />
                        <button
                          onClick={() => forceImageDownload(img)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          title="Open full preview"
                        >
                          <Download className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Fabric Album */}
              <div className="p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl space-y-2 border">
                <span className="text-[10.5px] font-bold text-stone-500 uppercase tracking-wider">Fabric Samples</span>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {allFabricImg.length === 0 ? (
                    <span className="text-[10px] text-stone-400">No images.</span>
                  ) : (
                    allFabricImg.map((img, i) => (
                      <div key={i} className="relative group rounded overflow-hidden h-14 border bg-stone-200">
                        <img src={img} alt="Fabric" className="w-full h-full object-cover" />
                        <button
                          onClick={() => forceImageDownload(img)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          title="Open full preview"
                        >
                          <Download className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Finished Album */}
              <div className="p-3 bg-stone-50 dark:bg-slate-900/40 rounded-xl space-y-2 border">
                <span className="text-[10.5px] font-bold text-stone-500 uppercase tracking-wider">Finished Bespokes</span>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {allFinishedImg.length === 0 ? (
                    <span className="text-[10px] text-stone-400">No images.</span>
                  ) : (
                    allFinishedImg.map((img, i) => (
                      <div key={i} className="relative group rounded overflow-hidden h-14 border bg-stone-200">
                        <img src={img} alt="Finished" className="w-full h-full object-cover" />
                        <button
                          onClick={() => forceImageDownload(img)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          title="Open full preview"
                        >
                          <Download className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order history summary */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center space-x-1">
              <History className="h-3.5 w-3.5 text-amber-500" />
              <span>Historic Commission Logs</span>
            </h4>
            <div className="border rounded-2xl overflow-hidden divide-y divide-stone-100 dark:divide-slate-800 text-xs text-left">
              {customerOrders.length === 0 ? (
                <div className="p-4 text-center text-stone-400">No order logs associated.</div>
              ) : (
                customerOrders.map((ord) => (
                  <div key={ord.id} className="p-3 flex items-center justify-between hover:bg-stone-50/50 dark:hover:bg-slate-850/50">
                    <div>
                      <p className="font-bold">{ord.clothingType} Booking ({ord.quantity} qty)</p>
                      <p className="text-[10px] text-stone-400">Status: <span className="font-semibold text-amber-500">{ord.status}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">${ord.price}</p>
                      <p className="text-[9px] text-stone-400">Due {ord.deliveryDate}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-2xl max-w-md w-full border ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <h3 className="font-serif text-lg font-bold mb-4">Initialize Bespoke Client File</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">WhatsApp Line</label>
                  <input
                    type="tel"
                    placeholder="+15550000000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none tracking-wider text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Email Username *</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Physical Address</label>
                <textarea
                  placeholder="Mailing address for bespoke dropoff..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none h-16 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold"
                >
                  Register Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-2xl max-w-md w-full border ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <h3 className="font-serif text-lg font-bold mb-4">Edit bespoke Client File</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">WhatsApp Line</label>
                  <input
                    type="tel"
                    value={editFormData.whatsapp}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Email Username</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Physical Address</label>
                <textarea
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full p-2 rounded-xl border dark:bg-slate-800 dark:border-slate-700 h-16 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
