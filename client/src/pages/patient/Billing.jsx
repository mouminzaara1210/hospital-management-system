import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Receipt, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import api from '../../services/api';
import { formatINR, formatDate } from '../../utils/formatters';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await api.get('/patients/me/billing');
        setBills(res.data || []);
      } catch (err) {
        setBills([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const totalOutstanding = bills
    .filter(b => b.status === 'pending')
    .reduce((sum, b) => sum + (b.totalAmount - (b.paidAmount || 0)), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900 italic">Bills & Payments</h1>
          <p className="text-neutral-500 mt-1">Manage your hospital invoices and payment history.</p>
        </div>
        
        <div className="bg-white px-5 py-3 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-4">
           <div>
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Total Outstanding</p>
              <p className="text-xl font-bold text-red-600">{formatINR(totalOutstanding)}</p>
           </div>
           <CreditCard size={24} className="text-neutral-300" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
           <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
              <Receipt size={18} className="text-primary-600" />
              Invoice History
           </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center animate-pulse text-neutral-400">Loading billing history...</div>
        ) : bills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 font-bold border-b border-neutral-100">
                <tr>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {bills.map(bill => (
                  <tr key={bill._id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4">
                       <span className="font-mono text-xs font-semibold text-primary-700">{bill.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{formatDate(bill.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                       <p className="text-sm font-bold text-neutral-800">{formatINR(bill.totalAmount)}</p>
                       {bill.status === 'pending' && (
                          <p className="text-[10px] text-red-500 font-medium">Due: {formatINR(bill.totalAmount - (bill.paidAmount || 0))}</p>
                       )}
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${
                         bill.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                         bill.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                         'bg-neutral-50 text-neutral-600 border-neutral-200'
                       }`}>
                         {bill.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-all" title="Download PDF">
                             <Download size={16} />
                          </button>
                          {bill.status === 'pending' && (
                             <button className="px-3 py-1 bg-primary-600 text-white text-[11px] font-bold rounded shadow-sm hover:bg-primary-700 transition-colors">
                                PAY NOW
                             </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-neutral-400">
             <FileText size={48} className="mx-auto mb-4 text-neutral-200" />
             <p>No billing records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
