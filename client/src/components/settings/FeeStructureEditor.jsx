import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import UnsavedChangesBar from '../ui/UnsavedChangesBar';

const ConsultationFeesTable = ({ data, onChange }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-neutral-800">Consultation Fees</h4>
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600 font-medium">
          <tr>
            <th className="px-4 py-2 border-b text-left">Role / Designation</th>
            <th className="px-4 py-2 border-b text-center">OPD (₹)</th>
            <th className="px-4 py-2 border-b text-center">IPD (₹)</th>
            <th className="px-4 py-2 border-b text-center">Emergency (₹)</th>
            <th className="px-4 py-2 border-b text-center w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="p-2"><input value={row.role} onChange={(e) => onChange(idx, 'role', e.target.value)} placeholder="e.g. Senior Cardiologist" className="w-full px-2 py-1 border rounded" /></td>
              <td className="p-2 w-24"><input type="number" value={row.opd} onChange={(e) => onChange(idx, 'opd', Number(e.target.value))} className="w-full px-2 py-1 border rounded text-right" /></td>
              <td className="p-2 w-24"><input type="number" value={row.ipd} onChange={(e) => onChange(idx, 'ipd', Number(e.target.value))} className="w-full px-2 py-1 border rounded text-right" /></td>
              <td className="p-2 w-24"><input type="number" value={row.emergency} onChange={(e) => onChange(idx, 'emergency', Number(e.target.value))} className="w-full px-2 py-1 border rounded text-right" /></td>
              <td className="p-2 text-center">
                <button onClick={() => onChange(idx, null, null, true)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
          {!data.length && <tr><td colSpan={5} className="p-4 text-center text-neutral-500 text-xs">No entries added.</td></tr>}
        </tbody>
      </table>
    </div>
    <button onClick={() => onChange(-1, 'add', { role: '', opd: 0, ipd: 0, emergency: 0 })} className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"><Plus size={14} /> Add Row</button>
  </div>
);

const LabFeesTable = ({ data, onChange }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-neutral-800">Laboratory & Diagnostic Fees</h4>
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600 font-medium">
          <tr>
            <th className="px-4 py-2 border-b text-left w-32">Test Code</th>
            <th className="px-4 py-2 border-b text-left border-l">Test Name</th>
            <th className="px-4 py-2 border-b text-left border-l">Category</th>
            <th className="px-4 py-2 border-b text-center border-l w-28">Price (₹)</th>
            <th className="px-4 py-2 border-b text-center w-12 border-l"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="p-2"><input value={row.testCode} onChange={(e) => onChange(idx, 'testCode', e.target.value)} placeholder="CBC-01" className="w-full px-2 py-1 border rounded font-mono text-xs uppercase" /></td>
              <td className="p-2"><input value={row.testName} onChange={(e) => onChange(idx, 'testName', e.target.value)} placeholder="Complete Blood Count" className="w-full px-2 py-1 border rounded" /></td>
              <td className="p-2"><input value={row.category} onChange={(e) => onChange(idx, 'category', e.target.value)} placeholder="Pathology" className="w-full px-2 py-1 border rounded" /></td>
              <td className="p-2"><input type="number" value={row.price} onChange={(e) => onChange(idx, 'price', Number(e.target.value))} className="w-full px-2 py-1 border rounded text-right" /></td>
              <td className="p-2 text-center">
                <button onClick={() => onChange(idx, null, null, true)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
          {!data.length && <tr><td colSpan={5} className="p-4 text-center text-neutral-500 text-xs">No lab tests added.</td></tr>}
        </tbody>
      </table>
    </div>
    <button onClick={() => onChange(-1, 'add', { testCode: '', testName: '', category: '', price: 0 })} className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"><Plus size={14} /> Add Lab Test</button>
  </div>
);

const RoomChargesTable = ({ data, onChange }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-neutral-800">Default Room Charges</h4>
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600 font-medium">
          <tr>
            <th className="px-4 py-2 border-b text-left">Room Type</th>
            <th className="px-4 py-2 border-b text-center border-l w-32">Rate/Day (₹)</th>
            <th className="px-4 py-2 border-b text-center w-12 border-l"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="p-2">
                 <select value={row.roomType} onChange={(e) => onChange(idx, 'roomType', e.target.value)} className="w-full px-2 py-1 border rounded capitalize">
                    <option value="general">General</option>
                    <option value="semi-private">Semi-Private</option>
                    <option value="private">Private</option>
                    <option value="icu">ICU</option>
                    <option value="nicu">NICU</option>
                 </select>
              </td>
              <td className="p-2"><input type="number" value={row.ratePerDay} onChange={(e) => onChange(idx, 'ratePerDay', Number(e.target.value))} className="w-full px-2 py-1 border rounded text-right" /></td>
              <td className="p-2 text-center">
                <button onClick={() => onChange(idx, null, null, true)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
          {!data.length && <tr><td colSpan={3} className="p-4 text-center text-neutral-500 text-xs">No entries.</td></tr>}
        </tbody>
      </table>
    </div>
    <button onClick={() => onChange(-1, 'add', { roomType: 'general', ratePerDay: 0 })} className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"><Plus size={14} /> Add Room Type</button>
  </div>
);

const MiscChargesTable = ({ data, onChange }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-semibold text-neutral-800">Miscellaneous Charges</h4>
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-50 text-neutral-600 font-medium">
          <tr>
            <th className="px-4 py-2 border-b text-left">Item / Service</th>
            <th className="px-4 py-2 border-b text-center border-l w-32">Price (₹)</th>
            <th className="px-4 py-2 border-b text-center w-12 border-l"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="p-2"><input value={row.item} onChange={(e) => onChange(idx, 'item', e.target.value)} placeholder="e.g. Registration Fee" className="w-full px-2 py-1 border rounded" /></td>
              <td className="p-2"><input type="number" value={row.price} onChange={(e) => onChange(idx, 'price', Number(e.target.value))} className="w-full px-2 py-1 border rounded text-right" /></td>
              <td className="p-2 text-center">
                <button onClick={() => onChange(idx, null, null, true)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
          {!data.length && <tr><td colSpan={3} className="p-4 text-center text-neutral-500 text-xs">No entries.</td></tr>}
        </tbody>
      </table>
    </div>
    <button onClick={() => onChange(-1, 'add', { item: '', price: 0 })} className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"><Plus size={14} /> Add Misc Item</button>
  </div>
);

export default function FeeStructureEditor({ initialData = {}, onSave, isSaving }) {
  const [fees, setFees] = useState({
    consultationFees: [], labTestFees: [], roomCharges: [], miscCharges: [],
    gstPercent: 18, currency: 'INR'
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialData.feeStructure) {
      setFees({
        consultationFees: initialData.feeStructure.consultationFees || [],
        labTestFees: initialData.feeStructure.labTestFees || [],
        roomCharges: initialData.feeStructure.roomCharges || [],
        miscCharges: initialData.feeStructure.miscCharges || [],
        gstPercent: initialData.feeStructure.gstPercent || 18,
        currency: initialData.feeStructure.currency || 'INR'
      });
      setIsDirty(false);
    }
  }, [initialData]);

  const handleChange = (key, idx, field, val, isDelete = false) => {
    setIsDirty(true);
    setFees(prev => {
       const clone = { ...prev };
       if (field === 'add') {
          clone[key] = [...clone[key], val];
       } else if (isDelete) {
          clone[key] = clone[key].filter((_, i) => i !== idx);
       } else {
          clone[key][idx] = { ...clone[key][idx], [field]: val };
       }
       return clone;
    });
  };

  const handleGlobalChange = (e) => {
    setIsDirty(true);
    setFees(prev => ({ ...prev, [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));
  };

  const internalSave = () => {
    onSave(fees);
    setTimeout(() => setIsDirty(false), 500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
      <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
         <div>
            <h3 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
               <Receipt size={22} className="text-primary-600" />
               Fee Structure & Billing
            </h3>
            <p className="text-sm text-neutral-500 mt-1">Configure global pricing, lab tests, and room defaults</p>
         </div>
         <div className="flex gap-4">
            <div>
               <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">Currency</label>
               <select name="currency" value={fees.currency} onChange={handleGlobalChange} className="px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 border border-neutral-300 rounded text-sm bg-neutral-50">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
               </select>
            </div>
            <div>
               <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-1">Tax (GST %)</label>
               <input type="number" name="gstPercent" value={fees.gstPercent} onChange={handleGlobalChange} className="w-20 px-3 py-1.5 text-right font-mono focus:outline-none focus:ring-1 focus:ring-primary-500 border border-neutral-300 rounded text-sm bg-neutral-50" />
            </div>
         </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="space-y-8">
            <ConsultationFeesTable data={fees.consultationFees} onChange={(idx, f, v, d) => handleChange('consultationFees', idx, f, v, d)} />
            <MiscChargesTable data={fees.miscCharges} onChange={(idx, f, v, d) => handleChange('miscCharges', idx, f, v, d)} />
         </div>
         <div className="space-y-8">
            <LabFeesTable data={fees.labTestFees} onChange={(idx, f, v, d) => handleChange('labTestFees', idx, f, v, d)} />
            <RoomChargesTable data={fees.roomCharges} onChange={(idx, f, v, d) => handleChange('roomCharges', idx, f, v, d)} />
         </div>
      </div>

      <UnsavedChangesBar 
         isDirty={isDirty} 
         reset={() => {
            if (initialData.feeStructure) {
               setFees(initialData.feeStructure);
            }
            setIsDirty(false);
         }} 
         onSave={internalSave} 
         isSaving={isSaving} 
      />
    </div>
  );
}
