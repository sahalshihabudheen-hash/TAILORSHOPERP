import React, { useState } from 'react';
import {
  Scale,
  Ruler,
  Clock,
  Printer,
  ChevronRight,
  Plus,
  Compass,
  CornerDownRight,
  TrendingUp,
  FileSpreadsheet,
  Trash2,
  Shirt
} from 'lucide-react';
import { Customer, MeasurementRecord } from '../types';

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

interface MeasurementViewProps {
  customers: Customer[];
  measurements: MeasurementRecord[];
  onAddMeasurement: (record: Omit<MeasurementRecord, 'id' | 'date'>) => void;
  isDarkMode: boolean;
}

const DEFAULT_FIELDS_BY_TYPE = {
  Shirt: ['Collar', 'Chest', 'Waist', 'Sleeve', 'Length', 'Cuff'],
  Pant: ['Waist', 'Hips', 'Inseam', 'Length', 'Thigh', 'Crotch'],
  Suit: ['Shoulder', 'Chest', 'Waist', 'Hips', 'Sleeve', 'Length', 'Collar', 'Inseam'],
  Kurta: ['Shoulder', 'Chest', 'Waist', 'Seat', 'Sleeve', 'Length', 'Collar'],
  Custom: ['Length', 'Width']
};

export default function MeasurementView({
  customers,
  measurements,
  onAddMeasurement,
  isDarkMode
}: MeasurementViewProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [clothingType, setClothingType] = useState<'Shirt' | 'Pant' | 'Suit' | 'Kurta' | 'Custom'>('Shirt');

  // Input states
  const [fields, setFields] = useState<Record<string, string>>({
    Collar: '15"',
    Chest: '38"',
    Waist: '32"',
    Sleeve: '33"',
    Length: '29"',
    Cuff: '9"'
  });
  const [notes, setNotes] = useState('');
  const [customFieldName, setCustomFieldName] = useState('');

  // Sizing Comparison state
  const [compareOldId, setCompareOldId] = useState('');
  const [compareNewId, setCompareNewId] = useState('');

  const [clothingCategoryEmojis] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('custom_clothing_emojis');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const getFavorableEmojiSize = (emojiStr: string): string => {
    if (!emojiStr) return '11px';
    const charArray = Array.from(emojiStr); 
    const len = charArray.length;
    if (len <= 1) return '14px';
    if (len === 2) return '11px';
    return '8px';
  };

  // Active Customer item
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Measurements specifically for this customer
  const customerHistory = measurements.filter((m) => m.customerId === selectedCustomerId);

  const handleTypeChange = (type: 'Shirt' | 'Pant' | 'Suit' | 'Kurta' | 'Custom') => {
    setClothingType(type);
    const defaults = DEFAULT_FIELDS_BY_TYPE[type];
    const newFields: Record<string, string> = {};
    defaults.forEach((f) => {
      newFields[f] = '';
    });
    setFields(newFields);
  };

  const handleAddField = () => {
    if (!customFieldName.trim()) return;
    setFields({
      ...fields,
      [customFieldName.trim()]: ''
    });
    setCustomFieldName('');
  };

  const handleRemoveField = (fieldKey: string) => {
    const updated = { ...fields };
    delete updated[fieldKey];
    setFields(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer.');
      return;
    }
    onAddMeasurement({
      customerId: selectedCustomerId,
      clothingType,
      fields,
      notes
    });
    setNotes('');
    alert(`Successfully registered new ${clothingType} measurements archive for ${selectedCustomer?.name}.`);
  };

  // Compile comparison data
  const comparisonOld = measurements.find((m) => m.id === compareOldId);
  const comparisonNew = measurements.find((m) => m.id === compareNewId);

  const calculateComparisonDelta = (field: string) => {
    if (!comparisonOld || !comparisonNew) return null;
    const valOld = parseFloat(comparisonOld.fields[field] || '0');
    const valNew = parseFloat(comparisonNew.fields[field] || '0');
    if (isNaN(valOld) || !valOld || isNaN(valNew) || !valNew) return null;
    const diff = valNew - valOld;
    if (diff === 0) return 'No Change';
    return diff > 0 ? `+${diff}" (expanded)` : `${diff}" (shrunk)`;
  };

  const triggerMockPrint = (recordId: string) => {
    const record = measurements.find((m) => m.id === recordId);
    if (!record || !selectedCustomer) return;

    // Beautiful procedural printing alert
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Atelier Sizing Voucher - #${record.id}</title>
            <style>
              body { font-family: 'Georgia', serif; padding: 40px; color: #1c1917; background-color: #fdfbf7; }
              .card { border: 2px dashed #aa8612; padding: 30px; max-width: 500px; margin: 0 auto; background: white; }
              .header { text-align: center; border-b: 1px solid #e7e5e4; padding-bottom: 20px; }
              .title { font-size: 24px; font-weight: bold; font-family: 'Times New Roman'; letter-spacing: 2px; }
              .subtitle { font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #aa8612; }
              .details { margin: 20px 0; font-size: 14px; }
              .table { w-full; border-collapse: collapse; margin: 20px 0; }
              .table th, .table td { border-bottom: 1px solid #f5f5f4; padding: 10px; font-size: 13px; text-align: left; }
              .meta { font-size: 11px; color: #78716c; text-align: center; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <div class="title">Sartorial Atelier</div>
                <div class="subtitle">Bespoke Sizing Ledger</div>
              </div>
              <div class="details">
                <p><strong>Customer ID:</strong> ${selectedCustomer.id}</p>
                <p><strong>Customer Name:</strong> ${selectedCustomer.name}</p>
                <p><strong>Clothing Type:</strong> ${record.clothingType} Edition</p>
                <p><strong>Timestamped:</strong> ${new Date(record.date).toLocaleDateString()}</p>
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #e7e5e4;">
                    <th style="text-align:left; padding: 8px;">Size Parameter</th>
                    <th style="text-align:right; padding: 8px;">Inches (")</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(record.fields)
                    .map(
                      ([k, v]) => `
                    <tr style="border-bottom: 1px solid #f5f5f4;">
                      <td style="padding: 8px;">${k}</td>
                      <td style="text-align:right; padding: 8px; font-weight:bold;">${v}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
              <div style="margin-top: 15px; font-size: 12px; font-style: italic; color: #57534e;">
                <strong>Apothecary Instruction Notes:</strong> ${record.notes || 'Classic standard fit.'}
              </div>
              <div class="meta">
                Printed via Sartorial CRM Engine. All patterns remain confidential copyright properties of the Atelier.
              </div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 fade-in p-1">
      {/* Intro strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-250 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">Atelier Sizing Ledger</h2>
          <p className="text-stone-400 text-xs">Establish, archive, and cross-reference bespoke clothing outlines</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xs font-bold text-stone-400 leading-none">Selected Client:</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              setCompareOldId('');
              setCompareNewId('');
            }}
            className={`p-2 font-bold text-xs rounded-xl border focus:outline-none ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-stone-250 text-stone-800'
            }`}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sizing Intake form container */}
        <div className={`p-5 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100 dark:border-slate-800">
            <h3 className="font-serif text-md font-bold flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-amber-500" />
              <span>Record Sizing Pattern</span>
            </h3>
            {/* Clothing Category Tabs */}
            <div className={`p-1 rounded-xl flex space-x-1 border ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-100 border-stone-200'
            }`}>
              {(['Shirt', 'Pant', 'Suit', 'Kurta', 'Custom'] as const).map((type) => {
                const isSelected = clothingType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-sm'
                        : isDarkMode
                        ? 'text-stone-400 hover:text-white'
                        : 'text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    {(() => {
                      const custom = clothingCategoryEmojis[type];
                      if (custom) {
                        if (custom.startsWith('data:image/')) {
                          return (
                            <img 
                              src={custom} 
                              alt={type} 
                              className="w-3.5 h-3.5 object-contain rounded-xs shrink-0" 
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
                      
                      if (type === 'Shirt') return <Shirt className="h-3.5 w-3.5" />;
                      if (type === 'Pant') return <PantIcon className="h-3.5 w-3.5" />;
                      if (type === 'Suit') return <SuitIcon className="h-3.5 w-3.5" />;
                      if (type === 'Kurta') return <KurtaIcon className="h-3.5 w-3.5" />;
                      return <Ruler className="h-3.5 w-3.5" />;
                    })()}
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs text-left">
            {/* Sizing Input Values Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.keys(fields).map((fieldName) => (
                <div key={fieldName} className="space-y-1 relative group">
                  <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    {fieldName} (in)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder='e.g. 15.5"'
                      value={fields[fieldName]}
                      onChange={(e) => setFields({ ...fields, [fieldName]: e.target.value })}
                      className={`w-full p-2 pr-6 rounded-lg text-xs leading-none border dark:bg-slate-800 dark:border-slate-700 font-mono focus:outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveField(fieldName)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove field"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customize option strip */}
            <div className={`p-3 rounded-xl border border-dashed ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-stone-50 border-stone-200'
            }`}>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                + Append Custom Pattern Variable
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Ankle, Back Width..."
                  value={customFieldName}
                  onChange={(e) => setCustomFieldName(e.target.value)}
                  className="p-1 px-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddField}
                  className="p-1 px-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold"
                >
                  Append
                </button>
              </div>
            </div>

            {/* Instruction notes */}
            <div>
              <label className="block text-stone-400 font-semibold mb-1">Internal Tailor notes</label>
              <textarea
                placeholder="Specify fitting alterations, drapes, physical posture adjustments (e.g. sloping shoulders)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 h-16 rounded-xl border focus:outline-none dark:bg-slate-800 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold transition-all"
            >
              Commit pattern parameters to Ledger
            </button>
          </form>
        </div>

        {/* Saved Profiles list and Printable Card / Compare tools */}
        <div className="space-y-6">
          {/* Sizing History ledger for client */}
          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <h3 className="font-serif text-md font-bold mb-3 flex items-center gap-1.5 pb-2 border-b border-stone-100 dark:border-slate-800">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Archetype Size cards ({customerHistory.length})</span>
            </h3>

            {customerHistory.length === 0 ? (
              <p className="text-stone-400 text-xs py-8 text-center bg-stone-50/50 dark:bg-slate-900/10 rounded-xl">
                No historic sizes recorded yet for {selectedCustomer?.name}.
              </p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {customerHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-stone-50 border-stone-150'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-stone-850 dark:text-stone-200">{rec.clothingType} Pattern</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">{rec.id}</span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Dated: {new Date(rec.date).toLocaleDateString()} at{' '}
                        {new Date(rec.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5 text-[10px] max-w-sm">
                        {Object.entries(rec.fields).map(([k, v]) => (
                          <span
                            key={k}
                            className={`px-1.5 py-0.5 rounded font-mono ${
                              isDarkMode ? 'bg-slate-800 text-stone-300' : 'bg-white text-stone-600 border'
                            }`}
                          >
                            {k}: {String(v).endsWith('in') || String(v).endsWith('cm') ? String(v) : `${v}"`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerMockPrint(rec.id)}
                      className="p-1 px-2 bg-stone-900 text-white hover:bg-stone-800 dark:bg-slate-850 dark:hover:bg-slate-750 rounded-lg flex items-center space-x-1 text-[10px] font-bold self-end sm:self-auto"
                    >
                      <Printer className="h-3 w-3" />
                      <span>Print card</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sizing comparative delta analyst */}
          {customerHistory.length >= 2 && (
            <div className={`p-5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              <h3 className="font-serif text-md font-bold mb-3 flex items-center gap-1.5 pb-2 border-b border-stone-100 dark:border-slate-800">
                <Scale className="h-4 w-4 text-amber-500" />
                <span>Bespoke Delta Analyst (+/- compares)</span>
              </h3>
              <p className="text-[10px] text-stone-400 mb-3">Compare size fluctuations over time to target fabric drapes.</p>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Old Pattern Card (Base)</label>
                  <select
                    value={compareOldId}
                    onChange={(e) => setCompareOldId(e.target.value)}
                    className="p-1.5 w-full rounded-lg border dark:bg-slate-850 text-xs text-left"
                  >
                    <option value="">-- Select Basis --</option>
                    {customerHistory.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.clothingType} - {c.id} ({new Date(c.date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1">New Pattern Card (Variant)</label>
                  <select
                    value={compareNewId}
                    onChange={(e) => setCompareNewId(e.target.value)}
                    className="p-1.5 w-full rounded-lg border dark:bg-slate-850 text-xs text-left"
                  >
                    <option value="">-- Select Alternate --</option>
                    {customerHistory.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.clothingType} - {c.id} ({new Date(c.date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {comparisonOld && comparisonNew && (
                <div className="border rounded-xl p-3 bg-stone-50 dark:bg-slate-900/30 text-xs divide-y divide-stone-100 dark:divide-slate-800">
                  <div className="pb-2 flex justify-between font-bold uppercase text-[9px] text-stone-400 tracking-wider">
                    <span>Parameter</span>
                    <span>Basis Sizing ({comparisonOld.id})</span>
                    <span>Alternate ({comparisonNew.id})</span>
                    <span>Delta Difference</span>
                  </div>

                  {Object.keys(comparisonNew.fields).map((fieldName) => {
                    const delta = calculateComparisonDelta(fieldName);
                    return (
                      <div key={fieldName} className="py-2 flex justify-between items-center text-xs">
                        <span className="font-bold">{fieldName}</span>
                        <span className="font-mono text-stone-500">{comparisonOld.fields[fieldName] || 'N/A'}</span>
                        <span className="font-mono font-bold text-stone-850 dark:text-stone-200">
                          {comparisonNew.fields[fieldName] || 'N/A'}
                        </span>
                        <span className={`font-mono font-bold font-semibold uppercase tracking-wider ${
                          !delta ? 'text-stone-400' :
                          delta.includes('+') ? 'text-emerald-500' :
                          delta.includes('-') ? 'text-red-400' : 'text-stone-400'
                        }`}>
                          {delta || 'Fluids / text parameter'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
