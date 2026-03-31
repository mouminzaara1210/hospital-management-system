import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ChevronLeft, CreditCard, User, HeartPulse } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

// Defined Schemas for Steps
const demographicsSchema = z.object({
  address: z.object({
    street: z.string().min(1, 'Street required'),
    city: z.string().min(1, 'City required'),
    state: z.string().min(1, 'State required'),
    zipCode: z.string().min(1, 'Zip Code required'),
  }),
  bloodGroup: z.string().min(1, 'Blood group is required'),
});

const emergencySchema = z.object({
  emergencyContact: z.object({
    name: z.string().min(2, 'Name required'),
    relation: z.string().min(2, 'Relation required'),
    phone: z.string().min(10, 'Valid phone required'),
  }),
});

const insuranceSchema = z.object({
  insurance: z.object({
    providerName: z.string().optional(),
    policyNumber: z.string().optional(),
  }),
});

const steps = [
  { id: 1, name: 'Demographics', icon: User, schema: demographicsSchema },
  { id: 2, name: 'Emergency', icon: HeartPulse, schema: emergencySchema },
  { id: 3, name: 'Insurance', icon: CreditCard, schema: insuranceSchema },
];

export default function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const currentValidationSchema = steps[currentStep - 1].schema;

  const { register, handleSubmit, formState: { errors }, trigger } = useForm({
    resolver: zodResolver(currentValidationSchema),
    mode: 'onTouched',
  });

  const processNextStep = async (e) => {
    e.preventDefault();
    const isStepValid = await trigger();
    if (isStepValid) {
      if (currentStep < steps.length) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const processPreviousStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const submitFinalData = async (data) => {
    try {
      await api.put('/patients/me', data);
      // Navigate to patient dashboard
      navigate('/patient');
    } catch (error) {
      console.error('Registration failed', error);
      alert('Failed to register details. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Progress Bar */}
      <nav aria-label="Progress" className="mb-12">
        <ol role="list" className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className={`relative flex-1 ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className={`h-1 w-full ${currentStep > step.id ? 'bg-soft-teal' : 'bg-gray-200'}`} />
              </div>
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white ring-2 ring-soft-teal">
                <step.icon className={`h-5 w-5 ${currentStep >= step.id ? 'text-soft-teal' : 'text-gray-300'}`} />
              </div>
              <span className="absolute -bottom-6 text-sm font-medium text-gray-500 whitespace-nowrap">
                  {step.name}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100 mt-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-heading text-gray-900">Patient Registration</h2>
          <p className="mt-1 text-sm text-gray-500">Please complete your profile to book appointments.</p>
        </div>

        <form onSubmit={currentStep === steps.length ? handleSubmit(submitFinalData) : processNextStep}>
          
          {/* STEP 1 */}
          {currentStep === 1 && (
             <div className="space-y-6 animate-in slide-in-from-right-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                   <select {...register('bloodGroup')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border">
                     <option value="">Select Group...</option>
                     <option value="A+">A+</option>
                     <option value="A-">A-</option>
                     <option value="B+">B+</option>
                     <option value="B-">B-</option>
                     <option value="O+">O+</option>
                     <option value="O-">O-</option>
                     <option value="AB+">AB+</option>
                     <option value="AB-">AB-</option>
                   </select>
                   {errors.bloodGroup && <p className="mt-1 text-sm text-alert-red">{errors.bloodGroup.message}</p>}
                 </div>
               </div>

               <div className="border-t pt-4">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Current Address</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-gray-700">Street</label>
                     <input type="text" {...register('address.street')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                     {errors.address?.street && <p className="mt-1 text-sm text-alert-red">{errors.address.street.message}</p>}
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">City</label>
                     <input type="text" {...register('address.city')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                     {errors.address?.city && <p className="mt-1 text-sm text-alert-red">{errors.address.city.message}</p>}
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">State</label>
                     <input type="text" {...register('address.state')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                     {errors.address?.state && <p className="mt-1 text-sm text-alert-red">{errors.address.state.message}</p>}
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">ZIP / Postal Code</label>
                     <input type="text" {...register('address.zipCode')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                     {errors.address?.zipCode && <p className="mt-1 text-sm text-alert-red">{errors.address.zipCode.message}</p>}
                   </div>
                 </div>
               </div>
             </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
             <div className="space-y-6 animate-in slide-in-from-right-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                 <input type="text" {...register('emergencyContact.name')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                 {errors.emergencyContact?.name && <p className="mt-1 text-sm text-alert-red">{errors.emergencyContact.name.message}</p>}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Relationship</label>
                   <input type="text" {...register('emergencyContact.relation')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                   {errors.emergencyContact?.relation && <p className="mt-1 text-sm text-alert-red">{errors.emergencyContact.relation.message}</p>}
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                   <input type="tel" {...register('emergencyContact.phone')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                   {errors.emergencyContact?.phone && <p className="mt-1 text-sm text-alert-red">{errors.emergencyContact.phone.message}</p>}
                 </div>
               </div>
             </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
             <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-medical-blue mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Entering insurance information is optional but highly recommended to expedite your billing process during appointments.
                  </p>
                </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Provider Name</label>
                   <input type="text" placeholder="e.g. Cigna, BlueCross" {...register('insurance.providerName')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                   <input type="text" {...register('insurance.policyNumber')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                 </div>
               </div>
             </div>
          )}

          {/* Controls */}
          <div className="mt-10 pt-6 border-t flex justify-between">
            <button
              type="button"
              onClick={processPreviousStep}
              disabled={currentStep === 1}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentStep === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}
            >
              <ChevronLeft className="mr-1 h-5 w-5" />
              Back
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 text-sm font-medium rounded-md text-white bg-medical-blue hover:bg-blue-800 shadow-sm"
            >
              {currentStep === steps.length ? 'Complete Profile' : 'Next Step'}
              {currentStep !== steps.length && <ChevronRight className="ml-1 h-5 w-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
