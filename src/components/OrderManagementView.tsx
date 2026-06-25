import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Compass,
  CheckCircle,
  Truck,
  Image as ImageIcon,
  Clock,
  User,
  Scissors,
  Bookmark,
  Camera,
  Layers,
  Sparkles,
  Search
} from 'lucide-react';
import { Order, Customer, Worker, OrderStatus, OrderNotes, OrderImages } from '../types';

interface OrderManagementViewProps {
  orders: Order[];
  customers: Customer[];
  workers: Worker[];
  onAddOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onAssignWorker: (orderId: string, workerId: string) => void;
  isDarkMode: boolean;
  simulatedRole: string;
  searchFilter: string;
}

const ALL_STATUS_STAGES: OrderStatus[] = [
  'Order Received',
  'Measurement Taken',
  'Cutting',
  'Stitching',
  'Finishing',
  'Ready for Pickup',
  'Delivered'
];

export default function OrderManagementView({
  orders,
  customers,
  workers,
  onAddOrder,
  onUpdateOrderStatus,
  onAssignWorker,
  isDarkMode,
  simulatedRole,
  searchFilter
}: OrderManagementViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter matrix states
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [workerFilter, setWorkerFilter] = useState('All');
  const [credentialFilter, setCredentialFilter] = useState('All');

  // New Order Form State
  const [newOrder, setNewOrder] = useState({
    customerId: customers[0]?.id || '',
    clothingType: 'Shirt' as const,
    quantity: 1,
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedWorkerId: workers[0]?.id || '',
    price: 150,
    advancePayment: 50,
    notes: {
      instructions: '',
      fabricDetails: '',
      urgentNotes: '',
      tailorNotes: '',
      privateNotes: ''
    } as OrderNotes,
    images: {
      reference: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=300'
      ],
      fabric: [
        'https://images.unsplash.com/photo-1524388680868-377a2e6bbb1c?auto=format&fit=crop&q=80&w=300'
      ],
      finished: []
    } as OrderImages
  });

  // Image Upload inputs
  const [dummyImageUrl, setDummyImageUrl] = useState('');
  const [dummyImageType, setDummyImageType] = useState<'reference' | 'fabric' | 'finished'>('reference');

  // Trigger automated mock file upload
  const handleDummyImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dummyImageUrl.trim()) return;

    setNewOrder((prev) => {
      const copy = { ...prev.images };
      copy[dummyImageType] = [...copy[dummyImageType], dummyImageUrl.trim()];
      return { ...prev, images: copy };
    });
    setDummyImageUrl('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerId) {
      alert('Please configure a Customer.');
      return;
    }
    const rem = Math.max(0, newOrder.price - newOrder.advancePayment);
    const payStatus =
      newOrder.advancePayment === 0
        ? 'Unpaid'
        : newOrder.advancePayment >= newOrder.price
        ? 'Fully Paid'
        : 'Partially Paid';

    onAddOrder({
      customerId: newOrder.customerId,
      clothingType: newOrder.clothingType,
      quantity: newOrder.quantity,
      deliveryDate: newOrder.deliveryDate,
      status: 'Order Received',
      assignedWorkerId: newOrder.assignedWorkerId,
      notes: newOrder.notes,
      images: newOrder.images,
      price: newOrder.price,
      advancePayment: newOrder.advancePayment,
      remainingBalance: rem,
      paymentStatus: payStatus as any
    });

    setIsCreateOpen(false);
    alert('Bespoke order registered successfully and staff assignments triggered!');
  };

  // Search through order files and apply multi-faceted filters
  const combinedSearchQuery = (searchTerm || searchFilter || '').toLowerCase().trim();
  const filteredOrders = orders.filter((o) => {
    const cust = customers.find((c) => c.id === o.customerId);
    const worker = workers.find((w) => w.id === o.assignedWorkerId);

    // 1. Text Search Filter
    if (combinedSearchQuery) {
      const matchText = (
        o.id.toLowerCase().includes(combinedSearchQuery) ||
        o.clothingType.toLowerCase().includes(combinedSearchQuery) ||
        o.status.toLowerCase().includes(combinedSearchQuery) ||
        (cust && cust.name.toLowerCase().includes(combinedSearchQuery)) ||
        (worker && worker.name.toLowerCase().includes(combinedSearchQuery))
      );
      if (!matchText) return false;
    }

    // 2. Status Filter
    if (statusFilter !== 'All') {
      if (o.status !== statusFilter) return false;
    }

    // 3. Category Filter
    if (categoryFilter !== 'All') {
      if (o.clothingType.toLowerCase().trim() !== categoryFilter.toLowerCase().trim()) return false;
    }

    // 4. Worker Filter
    if (workerFilter !== 'All') {
      if (workerFilter === 'Unassigned') {
        if (o.assignedWorkerId) return false;
      } else {
        if (o.assignedWorkerId !== workerFilter) return false;
      }
    }

    // 5. Credential Filter
    if (credentialFilter !== 'All') {
      if (credentialFilter === 'Matched') {
        if (!worker) return false;
        const isSpecialist = worker.skills?.some(s => s.toLowerCase().trim() === o.clothingType.toLowerCase().trim());
        if (!isSpecialist) return false;
      } else if (credentialFilter === 'Mismatch') {
        if (!worker) return false;
        const isSpecialist = worker.skills?.some(s => s.toLowerCase().trim() === o.clothingType.toLowerCase().trim());
        if (isSpecialist) return false;
      } else if (credentialFilter === 'Unassigned') {
        if (o.assignedWorkerId) return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6 fade-in p-1">
      {/* Intro block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-250 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">TAILORSHOP ERP Orders Workspace</h2>
          <p className="text-stone-400 text-xs">Coordinate ongoing commission files, assign stitchers, and track status parameters</p>
        </div>
        {simulatedRole !== 'Worker' && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 transition-all font-semibold text-xs rounded-xl text-white shadow-md flex items-center space-x-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Bespoke Order</span>
          </button>
        )}
      </div>

      {/* Lookup & Filter Control panel */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-stone-50 border-stone-200 shadow-3xs'
      }`}>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#aa8612] dark:text-[#f3cd57] block mb-1">
          ⚙️ Premium Bespoke Filter Matrix
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Text Search filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Keyword/Patron Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search style, patron, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-white focus:ring-amber-500'
                    : 'bg-white border-stone-250 text-stone-800 focus:ring-amber-500'
                }`}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Milestone Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full p-1.5 px-2 text-xs rounded-lg border focus:outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-800'
              }`}
            >
              <option value="All">All Milestones</option>
              {ALL_STATUS_STAGES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Category/Genre Filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Clothing Genre</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full p-1.5 px-2 text-xs rounded-lg border focus:outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-800'
              }`}
            >
              <option value="All">All Genres</option>
              {Array.from(new Set(orders.map(o => o.clothingType))).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Assigned Worker Filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Craftsman Assigned</label>
            <select
              value={workerFilter}
              onChange={(e) => setWorkerFilter(e.target.value)}
              className={`w-full p-1.5 px-2 text-xs rounded-lg border focus:outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-800'
              }`}
            >
              <option value="All">All Tailor Staff</option>
              <option value="Unassigned">Unassigned Only</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
              ))}
            </select>
          </div>

          {/* Credentials Skill Matching filter */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Credential Check</label>
            <select
              value={credentialFilter}
              onChange={(e) => setCredentialFilter(e.target.value)}
              className={`w-full p-1.5 px-2 text-xs rounded-lg border focus:outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-stone-200 text-stone-800'
              }`}
            >
              <option value="All">All Checks</option>
              <option value="Matched">Verified Specialist ⭐</option>
              <option value="Mismatch">Credential Mismatch ⚠️</option>
              <option value="Unassigned">Not Yet Assigned</option>
            </select>
          </div>
        </div>

        {/* Filters Clear Button row if any filters are active */}
        {(statusFilter !== 'All' || categoryFilter !== 'All' || workerFilter !== 'All' || credentialFilter !== 'All' || searchTerm) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setStatusFilter('All');
                setCategoryFilter('All');
                setWorkerFilter('All');
                setCredentialFilter('All');
                setSearchTerm('');
              }}
              className="text-[10px] font-extrabold text-amber-600 hover:text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-md cursor-pointer transition"
            >
              Clear Active Filters
            </button>
          </div>
        )}
      </div>

      {/* Orders Pipeline Stack */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <p className="text-stone-400 text-center text-xs py-14">No bespoke commissions found.</p>
        ) : (
          filteredOrders.map((ord) => {
            const customer = customers.find((c) => c.id === ord.customerId);
            const worker = workers.find((w) => w.id === ord.assignedWorkerId);

            // Access Control Rules: Only OWNER can view Private Notes!
            const canViewPrivateNotes = simulatedRole === 'Owner';

            // Find current progress index
            const currentStageIndex = ALL_STATUS_STAGES.indexOf(ord.status);

            return (
              <div
                key={ord.id}
                className={`p-6 rounded-2xl border space-y-5 transition-all relative ${
                  isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
                }`}
              >
                {/* Priority / Urgent Sticker indicator */}
                {ord.notes.urgentNotes && (
                  <span className="absolute top-5 right-6 px-2.5 py-0.5 bg-red-100 text-red-800 text-[9px] font-bold uppercase rounded-lg tracking-wider animate-pulse flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Urgent: {ord.notes.urgentNotes}</span>
                  </span>
                )}

                {/* Grid header row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start pb-4 border-b border-stone-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-serif text-lg font-bold">{ord.clothingType} Booking</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
                        {ord.id}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400">Created: {new Date(ord.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="text-xs">
                    <p className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Client Account</p>
                    {customer ? (
                      <div className="flex items-center space-x-2 mt-1">
                        <img src={customer.avatar} alt="" className="w-6 h-6 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold">{customer.name}</p>
                          <p className="text-[10px] text-stone-400">{customer.phone}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-stone-500">Unspecified customer</p>
                    )}
                  </div>

                  <div className="text-xs space-y-2">
                    <p className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Assigned Tailor Customizer</p>
                    {worker ? (
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black tracking-wider shrink-0 select-none border ${
                          isDarkMode ? 'bg-slate-800 text-amber-500 border-slate-750' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {worker.name ? worker.name.trim().substring(0, 2).toUpperCase() : 'TA'}
                        </div>
                        <div>
                          <p className="font-bold leading-none">{worker.name}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">{worker.role}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-stone-400 italic text-[11px] block">Unassigned</span>
                    )}

                    {/* Staff reassignment quick drop for Owner or Manager */}
                    {simulatedRole !== 'Worker' && simulatedRole !== 'Customer' && (
                      <select
                        value={ord.assignedWorkerId || ''}
                        onChange={(e) => onAssignWorker(ord.id, e.target.value)}
                        className="mt-1 font-semibold text-[10px] p-1.5 border rounded-lg dark:bg-slate-850 w-full focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">Choose Craftsman...</option>
                        {(() => {
                          const eligibleWorkers = workers.filter(
                            (w) => w.role !== 'Apprentice' && w.role !== 'Manager'
                          );
                          const isWorkerSkilledInGenre = (w: any, clothingType: string) => {
                            if (!clothingType) return false;
                            const typeLower = clothingType.toLowerCase().trim();
                            const typeSingular = typeLower.replace(/s$/, '');
                            
                            if (w.skills && Array.isArray(w.skills)) {
                              return w.skills.some((skill: string) => {
                                const skillLower = skill.toLowerCase().trim();
                                const skillSingular = skillLower.replace(/s$/, '');
                                
                                if (skillLower.includes(typeLower) || typeLower.includes(skillLower)) {
                                  return true;
                                }
                                if (skillSingular.includes(typeSingular) || typeSingular.includes(skillSingular)) {
                                  return true;
                                }
                                return false;
                              });
                            }
                            return false;
                          };

                          const filtered = eligibleWorkers.filter((w) => 
                            isWorkerSkilledInGenre(w, ord.clothingType)
                          );
                          const displayWorkers = filtered.length > 0 ? filtered : eligibleWorkers;

                          return displayWorkers.map((w) => {
                            const isSpecialist = isWorkerSkilledInGenre(w, ord.clothingType);
                            const skillStr = w.skills && w.skills.length > 0 ? ` [${w.skills.join(', ')}]` : '';
                            return (
                              <option key={w.id} value={w.id}>
                                {w.name} ({w.role}){isSpecialist ? ' ⭐ SPECIALIST' : ''}{skillStr}
                              </option>
                            );
                          });
                        })()}
                      </select>
                    )}

                    {/* Credentials Status Match Indicator */}
                    <div className="pt-1.5">
                      {worker ? (
                        (() => {
                          const isSpecialist = worker.skills?.some(s => s.toLowerCase().trim() === ord.clothingType.toLowerCase().trim());
                          if (isSpecialist) {
                            return (
                              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold w-full">
                                <span className="text-emerald-500 text-xs">⭐</span>
                                <span className="leading-tight">Credentials Match: {ord.clothingType} Specialist</span>
                              </div>
                            );
                          } else {
                            return (
                              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] w-full">
                                <div className="flex items-center gap-1 font-extrabold text-rose-600 dark:text-rose-400">
                                  <span>⚠️ Credentials Mismatch</span>
                                </div>
                                <p className="text-[9.5px] text-stone-500 dark:text-stone-300 mt-1 leading-tight">
                                  Not specialized in <strong>{ord.clothingType}</strong>. Certifications: {worker.skills && worker.skills.length > 0 ? worker.skills.join(', ') : 'None'}.
                                </p>
                              </div>
                            );
                          }
                        })()
                      ) : (
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] w-full">
                          <span className="font-extrabold block">⚠️ Setup Skill Matcher Suggestions:</span>
                          <p className="text-[9.5px] text-stone-500 dark:text-stone-300 mt-1 leading-tight">
                            Suggested Specialists for {ord.clothingType}: {
                              workers.filter(w => w.skills?.some(s => s.toLowerCase().trim() === ord.clothingType.toLowerCase().trim()))
                                .map(w => w.name).join(', ') || 'No matching certified generalists found.'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-right space-y-1">
                    <p className="text-stone-400 font-bold uppercase text-[9px] tracking-wider">Pricing details</p>
                    <p className="font-mono text-sm font-bold text-stone-850 dark:text-stone-100">Price: ${ord.price}</p>
                    <p className="text-[10px] text-emerald-500 font-bold">Paid: ${ord.advancePayment}</p>
                    <p className="text-[10px] text-red-500 font-extrabold">Bal: ${ord.remainingBalance}</p>
                  </div>
                </div>

                {/* Progress Status workflow timeline bar */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-400 uppercase text-[9px] tracking-wider">TAILORSHOP ERP workflow status:</span>
                    <span className="font-bold text-amber-500">{ord.status} phase</span>
                  </div>

                  {/* Horizontal Visual Timeline dots */}
                  <div className="grid grid-cols-7 gap-1 flex-wrap pt-2">
                    {ALL_STATUS_STAGES.map((stage, idx) => {
                      const isCompleted = idx < currentStageIndex;
                      const isActive = idx === currentStageIndex;
                      return (
                        <div key={stage} className="space-y-1.5 flex flex-col items-center flex-1">
                          {/* Dot item */}
                          <div
                            onClick={() => {
                              // Let Owner, Manager, or worker change status
                              if (simulatedRole !== 'Customer') {
                                onUpdateOrderStatus(ord.id, stage);
                              }
                            }}
                            className={`w-full h-2 rounded-full cursor-pointer transition-all duration-300 ${
                              isCompleted
                                ? 'bg-amber-500'
                                : isActive
                                ? 'bg-emerald-500 ring-2 ring-emerald-500/25 ring-offset-2 dark:ring-offset-slate-900'
                                : 'bg-stone-200 dark:bg-slate-800'
                            }`}
                            title={`Toggle phase: ${stage}`}
                          />
                          <span className={`text-[8.5px] uppercase font-bold tracking-tight text-center truncate w-full ${
                            isActive ? 'text-emerald-500 font-extrabold' : isCompleted ? 'text-amber-500' : 'text-stone-400'
                          }`}>
                            {stage.replace('Order ', '').replace('Reason ', '')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes logs section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                  {/* Public note panels */}
                  <div className={`p-3.5 rounded-xl border ${
                    isDarkMode ? 'bg-slate-950/30' : 'bg-stone-50/70'
                  } space-y-1`}>
                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Style specifications:</p>
                    <p className="italic font-medium">{ord.notes.instructions || 'Classic elegant bespoke drapes.'}</p>

                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider pt-2">Fabric Selection Details:</p>
                    <p className="font-mono text-stone-500 leading-relaxed">{ord.notes.fabricDetails || 'Not specified'}</p>
                  </div>

                  {/* Operational internal tailors list */}
                  <div className={`p-3.5 rounded-xl border relative ${
                    isDarkMode ? 'bg-slate-950/30' : 'bg-stone-50/70'
                  } space-y-1`}>
                    <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Tailors Work specifications:</p>
                    <p className="text-stone-500">{ord.notes.tailorNotes || 'Check sizing ledger parameters.'}</p>

                    {/* Owner-Only Details lock banner */}
                    {canViewPrivateNotes ? (
                      <div className="pt-2 border-t dark:border-slate-800 mt-2 space-y-1 text-xs">
                        <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-500 block">
                          Owner Private records:
                        </span>
                        <p className="font-serif italic text-stone-500">
                          {ord.notes.privateNotes || 'No notes added yet.'}
                        </p>
                      </div>
                    ) : (
                      <div className="pt-2 border-t dark:border-slate-800 mt-2 flex items-center space-x-1.5 text-[10px] text-stone-400">
                        <span>Private records visible specifically to Owner</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bespoke Order initialization Drawer/Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`p-6 rounded-2xl max-w-lg w-full border my-8 ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <h3 className="font-serif text-lg font-bold mb-4">Launch Bespoke Commission</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs text-left max-h-[500px] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Select Client *</label>
                  <select
                    value={newOrder.customerId}
                    onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
                    className="p-2 w-full rounded-xl border dark:bg-slate-800"
                    required
                  >
                    <option value="">-- Choose Profile --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1"> clothing Type</label>
                  <select
                    value={newOrder.clothingType}
                    onChange={(e) => setNewOrder({ ...newOrder, clothingType: e.target.value as any })}
                    className="p-2 w-full rounded-xl border dark:bg-slate-800"
                  >
                    <option value="Shirt">Shirt</option>
                    <option value="Pant">Pant</option>
                    <option value="Suit">Suit</option>
                    <option value="Kurta">Kurta</option>
                    <option value="Custom">Custom Component</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: parseInt(e.target.value) || 1 })}
                    className="p-1.5 w-full rounded-xl border dark:bg-slate-800 text-center font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Appointed Tailor</label>
                  <select
                    value={newOrder.assignedWorkerId}
                    onChange={(e) => setNewOrder({ ...newOrder, assignedWorkerId: e.target.value })}
                    className="p-2 w-full rounded-xl border dark:bg-slate-800"
                  >
                    <option value="">Unassigned</option>
                    {workers.map((w) => {
                      const isSpecialist = w.skills?.some(s => s.toLowerCase() === newOrder.clothingType.toLowerCase());
                      const skillStr = w.skills && w.skills.length > 0 ? ` [${w.skills.join(', ')}]` : '';
                      return (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.role}){isSpecialist ? ' ⭐ SPECIALIST' : ''}{skillStr}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Delivery Target</label>
                  <input
                    type="date"
                    value={newOrder.deliveryDate}
                    onChange={(e) => setNewOrder({ ...newOrder, deliveryDate: e.target.value })}
                    className="p-1.5 w-full rounded-xl border dark:bg-slate-800 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Order commission price ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newOrder.price || ''}
                    onChange={(e) => setNewOrder({ ...newOrder, price: parseInt(e.target.value) || 0 })}
                    className="p-1.5 w-full rounded-xl border dark:bg-slate-800 text-center font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Advance Deposit received ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={newOrder.advancePayment || ''}
                    onChange={(e) => setNewOrder({ ...newOrder, advancePayment: parseInt(e.target.value) || 0 })}
                    className="p-1.5 w-full rounded-xl border dark:bg-slate-800 text-center font-bold"
                  />
                </div>
              </div>

              {/* Sizing notes inputs */}
              <div className="space-y-2 border-t pt-3 dark:border-slate-800">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
                  Bespoke Instructions Ledger
                </span>

                <div>
                  <label className="block text-stone-400 font-semibold">Special Style Directives (Client)</label>
                  <input
                    type="text"
                    placeholder="e.g. Italian spread collar, high armholes..."
                    value={newOrder.notes.instructions}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        notes: { ...newOrder.notes, instructions: e.target.value }
                      })
                    }
                    className="p-2 w-full border rounded-xl dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold">Fabric Specification & Sample ID</label>
                  <input
                    type="text"
                    placeholder="e.g. Scabal Tweed ref #S2409, 100% cashmere wool..."
                    value={newOrder.notes.fabricDetails}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        notes: { ...newOrder.notes, fabricDetails: e.target.value }
                      })
                    }
                    className="p-2 w-full border rounded-xl dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-400 font-semibold text-red-500">Urgency Flags</label>
                    <input
                      type="text"
                      placeholder="e.g. Deliver before wedding June 9"
                      value={newOrder.notes.urgentNotes}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          notes: { ...newOrder.notes, urgentNotes: e.target.value }
                        })
                      }
                      className="p-2 w-full border border-red-200 text-red-700 bg-red-50/20 rounded-xl focus:border-red-500 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-semibold">Stitchers Internal parameters</label>
                    <input
                      type="text"
                      placeholder="e.g. Leave 0.5 inches seam allowances at chest..."
                      value={newOrder.notes.tailorNotes}
                      onChange={(e) =>
                        setNewOrder({
                          ...newOrder,
                          notes: { ...newOrder.notes, tailorNotes: e.target.value }
                        })
                      }
                      className="p-2 w-full border rounded-xl dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold text-emerald-500">Confidential Owner Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Match VIP client gift expectations..."
                    value={newOrder.notes.privateNotes}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        notes: { ...newOrder.notes, privateNotes: e.target.value }
                      })
                    }
                    className="p-2 w-full border border-emerald-200 text-emerald-700 bg-emerald-50/10 rounded-xl focus:border-emerald-500 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Upload simulation panel (Drag and drop representation) */}
              <div className={`p-4 rounded-xl border border-dashed text-center space-y-2 mt-2 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-center justify-center space-x-1 text-stone-400">
                  <Camera className="h-4 w-4 text-amber-500 animate-bounce" />
                  <span className="font-bold uppercase text-[9px] tracking-wider">Simulate Pattern Photography Upload</span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={dummyImageType}
                    onChange={(e) => setDummyImageType(e.target.value as any)}
                    className="p-1 border rounded bg-white dark:bg-slate-800 max-w-[120px]"
                  >
                    <option value="reference">Reference Style</option>
                    <option value="fabric">Fabric Cut</option>
                    <option value="finished text">Finished Garment</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Enter image URL to simulate file drop..."
                    value={dummyImageUrl}
                    onChange={(e) => setDummyImageUrl(e.target.value)}
                    className="p-1 px-2 border rounded flex-1 bg-white dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleDummyImageSubmit}
                    className="p-1 px-3 bg-amber-500 hover:bg-amber-600 rounded text-white font-bold"
                  >
                    Upload
                  </button>
                </div>
                <p className="text-[9px] text-stone-500">Drag & drop files or type online paths to enrich visual garment cards.</p>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-500"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold"
                >
                  Generate Sizing Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
