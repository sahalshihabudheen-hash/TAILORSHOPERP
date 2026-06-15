import React, { useState } from 'react';
import {
  CreditCard,
  Printer,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { Order, Customer, PaymentInvoice } from '../types';

interface PaymentManagementProps {
  orders: Order[];
  customers: Customer[];
  onAddPayment: (orderId: string, amount: number) => void;
  isDarkMode: boolean;
}

export default function PaymentManagementView({
  orders,
  customers,
  onAddPayment,
  isDarkMode
}: PaymentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Unpaid' | 'Partially Paid' | 'Fully Paid'>('All');
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer' | 'UPI'>('Cash');

  // Calculates financial aggregates
  const totalReceivables = orders.reduce((sum, o) => sum + o.price, 0);
  const receivedIncome = orders.reduce((sum, o) => sum + o.advancePayment, 0);
  const pendingReceivables = orders.reduce((sum, o) => sum + o.remainingBalance, 0);

  const filteredOrders = orders.filter((o) => {
    const cust = customers.find((c) => c.id === o.customerId);
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && o.paymentStatus === statusFilter;
  });

  const handleApplyPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForPayment) return;
    if (paymentAmount <= 0) {
      alert('Please enter a valid pay amount.');
      return;
    }
    onAddPayment(selectedOrderForPayment.id, paymentAmount);
    setSelectedOrderForPayment(null);
    alert('Payment transaction posted successfully. Balance updated.');
  };

  const triggerMockInvoiceDownload = (order: Order) => {
    const customer = customers.find((c) => c.id === order.customerId);
    if (!customer) return;

    // Open high-end print-friendly frame
    const invoiceWindow = window.open('', '_blank');
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>SARTORIAL ATELIER - INVOICE #${order.id}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; background: #faf9f6; }
              .invoice-card { background: #fff; max-width: 700px; margin: 0 auto; border: 1px solid #e5e5e5; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
              .brand { font-size: 28px; font-weight: bold; font-family: Playfair, serif; letter-spacing: 1px; color: #1c1917; }
              .tagline { font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #d4af37; margin-top: 5px; }
              .grid-meta { display: grid; grid-template-columns: 1fr 1fr; margin: 30px 0; font-size: 13px; line-height: 1.6; }
              .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
              .table th { background: #fdfbf7; border-bottom: 2px solid #d4af37; padding: 12px; font-size: 11px; text-transform: uppercase; text-align: left; font-weight: bold; }
              .table td { border-bottom: 1px solid #eee; padding: 12px; font-size: 13px; }
              .totals { margin-left: auto; width: 250px; font-size: 14px; line-height: 2; margin-top: 20px; }
              .totals-row { display: flex; justify-content: space-between; border-bottom: 1px solid #f5f5f5; }
              .grand-total { font-size: 16px; font-weight: bold; color: #111; border-top: 2px solid #333; padding-top: 5px; margin-top: 5px; }
              .meta-footer { text-align: center; margin-top: 60px; font-size: 11px; color: #999; border-t: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="invoice-card">
              <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #f5f5f5; padding-bottom: 20px;">
                <div>
                  <div class="brand">Sartorial TAILORSHOP ERP</div>
                  <div class="tagline">Luxury Bespoke Outfitters</div>
                </div>
                <div style="text-align: right; font-size: 13px; line-height: 1.5;">
                  <p style="font-weight: bold; font-size: 15px; margin: 0;">OFFICIAL INVOICE</p>
                  <p style="margin: 3px 0; color: #d4af37;">Invoice ID: INV-${order.id.replace('ORD-', '')}</p>
                  <p style="margin: 0;">Date: ${new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div class="grid-meta">
                <div>
                  <p style="font-weight: bold; margin-bottom: 5px; color: #777; font-size: 11px; text-transform: uppercase;">Drawn For:</p>
                  <p style="font-size: 15px; font-weight: bold; margin: 0;">${customer.name}</p>
                  <p style="margin: 3px 0;">${customer.email}</p>
                  <p style="margin: 0;">${customer.phone}</p>
                </div>
                <div style="text-align: right;">
                  <p style="font-weight: bold; margin-bottom: 5px; color: #777; font-size: 11px; text-transform: uppercase;">Service Workshop Location:</p>
                  <p style="margin: 0; font-weight: bold;">TAILORSHOP ERP Midtown Central</p>
                  <p style="margin: 3px 0;">5th Ave, New York, NY</p>
                  <p style="margin: 0;">support@sartorialtailorshop-erp.com</p>
                </div>
              </div>

              <table class="table">
                <thead>
                  <tr>
                    <th>Bespoke Item Category</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Base Surcharge</th>
                    <th style="text-align: right;">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="font-weight: bold;">${order.clothingType} Custom Drafting & Tailor Construction</td>
                    <td style="text-align: center;">${order.quantity}</td>
                    <td style="text-align: right;">$${(order.price / order.quantity).toFixed(2)}</td>
                    <td style="text-align: right; font-weight: bold;">$${order.price.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div class="totals">
                <div class="totals-row">
                  <span>Subtotal</span>
                  <strong>$${order.price.toFixed(2)}</strong>
                </div>
                <div class="totals-row">
                  <span>VAT / Sales Tax (0.00%)</span>
                  <strong>$0.00</strong>
                </div>
                <div class="totals-row">
                  <span style="color: #10b981;">Advance Deposit Received</span>
                  <strong style="color: #10b981;">$${order.advancePayment.toFixed(2)}</strong>
                </div>
                <div class="totals-row grand-total">
                  <span>Remaining Due balance</span>
                  <span>$${order.remainingBalance.toFixed(2)}</span>
                </div>
              </div>

              <div class="meta-footer">
                Thank you for patronizing our custom workshop. All bespoke sizing is retained in our physical vaults.<br/>
                Subject to 14 days full delivery compliance.
              </div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
  };

  return (
    <div className="space-y-6 fade-in p-1">
      {/* Visual Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-250 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">TAILORSHOP ERP Payments & Ledgers</h2>
          <p className="text-stone-400 text-xs">Verify advance payments, balances, outstanding lines, and issue printable invoice slips</p>
        </div>
      </div>

      {/* Aggregate metrics box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200'
        }`}>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Accumulated Sales Volume</p>
          <div className="flex items-center space-x-2 mt-1">
            <DollarSign className="h-5 w-5 text-amber-500" />
            <h3 className="text-xl font-extrabold font-mono">${totalReceivables}</h3>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200'
        }`}>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Deposits Captured</p>
          <div className="flex items-center space-x-2 mt-1">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <h3 className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">${receivedIncome}</h3>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-stone-200'
        }`}>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Outstanding Surcharge Debts</p>
          <div className="flex items-center space-x-2 mt-1">
            <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
            <h3 className="text-xl font-extrabold font-mono text-red-500">${pendingReceivables}</h3>
          </div>
        </div>
      </div>

      {/* Lookups strip */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-stone-50 border-stone-200 shadow-sm'
      }`}>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search invoice or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1 text-xs border rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {(['All', 'Fully Paid', 'Partially Paid', 'Unpaid'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                statusFilter === status
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                  : isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-stone-300 hover:text-white'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Ledger grid */}
      <div className="border rounded-2xl overflow-hidden text-xs text-left">
        <table className="w-full">
          <thead>
            <tr className={`border-b border-light font-bold uppercase text-[9px] tracking-wider ${
              isDarkMode ? 'bg-slate-900 text-stone-400 border-slate-800' : 'bg-stone-50 text-stone-500 border-stone-100'
            }`}>
              <th className="p-3">Reference file</th>
              <th className="p-3">Bespoke Client</th>
              <th className="p-3 text-right">Commission Value</th>
              <th className="p-3 text-right">Deposit Captured</th>
              <th className="p-3 text-right">Outstanding balance</th>
              <th className="p-3 text-center">Receipt Status</th>
              <th className="p-3 text-right">Control Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-stone-400">No payment records match filter choice.</td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const customer = customers.find((c) => c.id === ord.customerId);
                return (
                  <tr key={ord.id} className="hover:bg-stone-55 dark:hover:bg-slate-850/40">
                    <td className="p-3 font-mono font-bold">{ord.id}</td>
                    <td className="p-3">
                      <div className="font-bold">{customer?.name || 'N/A'}</div>
                      <div className="text-[10px] text-stone-400">{customer?.email || 'N/A'}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold">${ord.price}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-500">${ord.advancePayment}</td>
                    <td className="p-3 text-right font-mono font-bold text-red-500">${ord.remainingBalance}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        ord.paymentStatus === 'Fully Paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : ord.paymentStatus === 'Partially Paid'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {ord.remainingBalance > 0 && (
                        <button
                          onClick={() => {
                            setSelectedOrderForPayment(ord);
                            setPaymentAmount(ord.remainingBalance);
                          }}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-600 rounded text-white font-bold text-[10px]"
                        >
                          + Post cash receipt
                        </button>
                      )}
                      <button
                        onClick={() => triggerMockInvoiceDownload(ord)}
                        className="p-1 rounded bg-stone-100 dark:bg-slate-800 hover:text-amber-500 inline-flex items-center justify-center"
                        title="Print Invoice / PDF Sizing Bill"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Draw Payment modal dialog popup */}
      {selectedOrderForPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`p-6 rounded-2xl max-w-sm w-full border ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <h3 className="font-serif text-lg font-bold mb-2">Configure Ledger Entry</h3>
            <p className="text-[11px] text-stone-400 mb-4">Post financial invoice deposit parameters for Order: {selectedOrderForPayment.id}</p>

            <form onSubmit={handleApplyPaymentSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Total Outstanding Debt ($)</label>
                <input
                  type="text"
                  disabled
                  value={`$${selectedOrderForPayment.remainingBalance}`}
                  className="p-2 w-full bg-stone-100 dark:bg-slate-850 font-bold border rounded-lg text-stone-500 font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Income Receipt Amount ($) *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedOrderForPayment.remainingBalance}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                  className="p-2 w-full rounded-lg border dark:bg-slate-800 font-bold font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Receipt Channel Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="p-2 w-full border rounded-lg dark:bg-slate-800 font-semibold text-xs"
                >
                  <option value="Cash">Cash drawer</option>
                  <option value="Card">Credit / Merchant swipe</option>
                  <option value="Bank Transfer">Wire / Bank transfer</option>
                  <option value="UPI">Cellphone Pay (UPI / Scan)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPayment(null)}
                  className="px-4 py-2 border rounded-xl text-stone-500"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-white font-bold"
                >
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
