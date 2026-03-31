import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { FileSignature, Plus, Trash2, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export default function PrescriptionWriter() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appt');
  const navigate = useNavigate();

  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      symptoms: '',
      diagnosis: '',
      medicines: [{ name: '', dosage: '', frequency: '', durationDays: 1, instructions: '' }],
      notes: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicines"
  });

  const onSubmit = async (data) => {
    try {
       // Format comma separated strings to arrays
       const formattedData = {
          ...data,
          patientId,
          appointmentId,
          symptoms: data.symptoms.split(',').map(s => s.trim()).filter(x => x),
          diagnosis: data.diagnosis.split(',').map(s => s.trim()).filter(x => x),
          medicines: data.medicines.map(m => ({ ...m, durationDays: parseInt(m.durationDays, 10) }))
       };

       await api.post('/clinical/prescriptions', formattedData);
       navigate('/doctor'); // Back to today's queue
    } catch (err) {
       console.error(err);
       alert('Failed to save prescription');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Header section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900 flex items-center">
               <FileSignature className="w-6 h-6 mr-3 text-medical-blue" />
               Clinical Prescription
            </h1>
            <p className="text-gray-500 mt-1">Write symptoms, diagnosis and prescribe medications.</p>
          </div>
          <button 
             type="submit"
             className="bg-medical-blue hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
          >
             Sign & Save
          </button>
        </div>

        {/* Clinical Assessment */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h3 className="text-lg font-bold text-gray-900 mb-6 border-b pb-3">Clinical Assessment</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Presenting Symptoms (comma separated)</label>
                 <textarea 
                    {...register('symptoms')} 
                    rows={3}
                    placeholder="e.g. Fever, dry cough, fatigue"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-medical-blue focus:border-medical-blue text-sm shadow-sm"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Provisional Diagnosis (comma separated)</label>
                 <textarea 
                    {...register('diagnosis')} 
                    rows={3}
                    placeholder="e.g. Viral Pharyngitis, Mild Dehydration"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-medical-blue focus:border-medical-blue text-sm shadow-sm"
                 />
              </div>
           </div>
        </div>

        {/* Medication Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-center mb-6 border-b pb-3">
             <h3 className="text-lg font-bold text-gray-900">Medications</h3>
             <button 
                type="button" 
                onClick={() => append({ name: '', dosage: '', frequency: '', durationDays: 1, instructions: '' })}
                className="flex items-center text-sm font-medium text-soft-teal bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md transition-colors"
             >
                <Plus className="w-4 h-4 mr-1" /> Add Row
             </button>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-y">
                   <th className="p-3 w-1/3">Medicine Name</th>
                   <th className="p-3">Dosage</th>
                   <th className="p-3">Frequency</th>
                   <th className="p-3 w-20">Days</th>
                   <th className="p-3">Instructions</th>
                   <th className="p-3 w-10"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 bg-white">
                 {fields.map((field, index) => (
                   <tr key={field.id} className="hover:bg-gray-50/50 transition-colors">
                     <td className="p-2">
                       <input 
                         {...register(`medicines.${index}.name`, { required: true })} 
                         placeholder="e.g. Amoxicillin"
                         className="w-full p-2 border-none bg-transparent focus:ring-1 focus:ring-medical-blue rounded text-sm font-medium" 
                       />
                     </td>
                     <td className="p-2">
                       <input 
                         {...register(`medicines.${index}.dosage`, { required: true })} 
                         placeholder="e.g. 500mg"
                         className="w-full p-2 border-none bg-transparent focus:ring-1 focus:ring-medical-blue rounded text-sm text-gray-600" 
                       />
                     </td>
                     <td className="p-2">
                       <input 
                         {...register(`medicines.${index}.frequency`, { required: true })} 
                         placeholder="e.g. 1-0-1"
                         className="w-full p-2 border-none bg-transparent focus:ring-1 focus:ring-medical-blue rounded text-sm text-gray-600" 
                       />
                     </td>
                     <td className="p-2">
                       <input 
                         type="number"
                         min="1"
                         {...register(`medicines.${index}.durationDays`, { required: true })} 
                         className="w-full p-2 border border-gray-200 focus:ring-medical-blue rounded text-sm text-center" 
                       />
                     </td>
                     <td className="p-2">
                       <input 
                         {...register(`medicines.${index}.instructions`)} 
                         placeholder="e.g. After food"
                         className="w-full p-2 border-none bg-transparent focus:ring-1 focus:ring-medical-blue rounded text-sm text-gray-500 italic" 
                       />
                     </td>
                     <td className="p-2 text-center">
                       <button 
                         type="button" 
                         onClick={() => remove(index)}
                         className="p-1.5 text-gray-400 hover:text-alert-red hover:bg-red-50 rounded transition-colors"
                         title="Remove Medication"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             
             {fields.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No medications prescribed.</p>
                </div>
             )}
           </div>
        </div>

        {/* General Notes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <label className="block text-sm font-medium text-gray-900 mb-2">Doctor Notes / Instructions passed to patient</label>
           <textarea 
              {...register('notes')} 
              rows={4}
              placeholder="Post-consultation advice..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-medical-blue focus:border-medical-blue text-sm shadow-sm resize-y"
           />
        </div>

      </form>
    </div>
  );
}
