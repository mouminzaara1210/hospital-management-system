import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HeartPulse, Search, User } from 'lucide-react';
import api from '../../services/api';

export default function VitalsEntry() {
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const handleSearch = async () => {
    try {
      const res = await api.get('/patients');
      // For demo, we just find the patient locally by ID from the fetched list
      // In production, an explicit search endpoint is better
      const found = res.data.find(p => p.patientId === patientId);
      if (found) {
         setPatient(found);
         setError('');
      } else {
         setPatient(null);
         setError('Patient not found. Check ID format (e.g. HMS-2023-12345)');
      }
    } catch (err) {
      setError('Failed to fetch patients database.');
    }
  };

  const onSubmit = async (data) => {
    if (!patient) return;
    try {
      await api.post('/clinical/vitals', {
         patientId: patient._id,
         ...data
      });
      alert('Vitals logged successfully. Dashboard updated.');
      reset();
      setPatient(null);
      setPatientId('');
    } catch (err) {
      console.error(err);
      alert('Failed to log vitals');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900 flex items-center">
               <HeartPulse className="w-6 h-6 mr-3 text-alert-red" />
               Vitals Entry
            </h1>
            <p className="text-gray-500 mt-1">Log patient vitals for live charts.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <label className="block text-sm font-medium text-gray-700 mb-2">Search Patient ID</label>
           <div className="flex space-x-3">
              <input 
                 type="text" 
                 placeholder="HMS-YYYY-XXXXX" 
                 value={patientId}
                 onChange={e => setPatientId(e.target.value)}
                 className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue p-3 border"
              />
              <button 
                 onClick={handleSearch}
                 className="bg-medical-blue hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center"
              >
                 <Search className="w-5 h-5 mr-2" /> Search
              </button>
           </div>
           {error && <p className="text-red-500 text-sm mt-3 font-medium">{error}</p>}
        </div>

        {patient && (
           <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6 text-medical-blue">
                 <User className="w-8 h-8 mr-3 opacity-70" />
                 <div>
                    <h3 className="font-bold text-lg">{patient.firstName} {patient.lastName}</h3>
                    <p className="text-sm opacity-80">{patient.gender} | Blood: <span className="font-bold">{patient.bloodGroup}</span></p>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">BP Systolic (mmHg)</label>
                    <input 
                       type="number" 
                       {...register('bpSystolic', { required: 'Required' })}
                       className="w-full rounded-lg border-gray-300 shadow-sm focus:border-medical-blue p-3 border"
                    />
                    {errors.bpSystolic && <span className="text-red-500 text-xs mt-1 block">{errors.bpSystolic.message}</span>}
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">BP Diastolic (mmHg)</label>
                    <input 
                       type="number" 
                       {...register('bpDiastolic', { required: 'Required' })}
                       className="w-full rounded-lg border-gray-300 shadow-sm focus:border-medical-blue p-3 border"
                    />
                    {errors.bpDiastolic && <span className="text-red-500 text-xs mt-1 block">{errors.bpDiastolic.message}</span>}
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pulse Rate (bpm)</label>
                    <input 
                       type="number" 
                       {...register('pulse', { required: 'Required' })}
                       className="w-full rounded-lg border-gray-300 shadow-sm focus:border-medical-blue p-3 border border-red-200 bg-red-50/30"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                    <input 
                       type="number" 
                       step="0.1"
                       {...register('temperature', { required: 'Required' })}
                       className="w-full rounded-lg border-gray-300 shadow-sm focus:border-medical-blue p-3 border"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SpO2 (%)</label>
                    <input 
                       type="number" 
                       {...register('spo2', { required: 'Required', max: { value: 100, message: "Max 100" } })}
                       className="w-full rounded-lg border-gray-300 shadow-sm focus:border-medical-blue p-3 border border-teal-200 bg-teal-50/30"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input 
                       type="number" 
                       step="0.1"
                       {...register('weight')}
                       className="w-full rounded-lg border-gray-300 shadow-sm focus:border-medical-blue p-3 border"
                    />
                 </div>
              </div>

              <div className="border-t pt-6 flex justify-end space-x-4">
                 <button 
                    type="button" 
                    onClick={() => setPatient(null)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:ring-medical-blue font-medium"
                 >
                    Cancel
                 </button>
                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-8 py-2 bg-soft-teal hover:bg-teal-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
                 >
                    Save Vitals
                 </button>
              </div>
           </form>
        )}
    </div>
  );
}
