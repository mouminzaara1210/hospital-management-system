import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadCloud, X, Building2 } from 'lucide-react';
import UnsavedChangesBar from '../ui/UnsavedChangesBar';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  tagline: z.string().optional(),
  registrationNumber: z.string().optional(),
  accreditation: z.string().optional(),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Invalid email address'),
  website: z.string().optional(),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

export default function HospitalProfileForm({ initialData = {}, onSave, isSaving }) {
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData.profile || {
      name: '', tagline: '', registrationNumber: '', accreditation: '',
      phone: '', email: '', website: '', gstNumber: '',
      address: '', city: '', state: '', pincode: ''
    }
  });

  useEffect(() => {
    if (initialData.profile) {
       reset(initialData.profile);
       if (initialData.profile.logoUrl) {
          // ensure the base URL is prepended if developing locally based on proxy or not
          setLogoPreview(initialData.profile.logoUrl);
       }
    }
  }, [initialData, reset]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsHovering(true);
  };
  
  const handleDragLeave = () => setIsHovering(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    const file = e.dataTransfer.files[0];
    handleFileSelection(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelection(file);
  };

  const handleFileSelection = (file) => {
    if (!file) return;
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
       alert('Only PNG or JPG files are allowed.');
       return;
    }
    if (file.size > 2 * 1024 * 1024) {
       alert('File size exceeds 2MB.');
       return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const internalSubmit = (data) => {
    // We construct FormData to send the file along with textual fields
    const formData = new FormData();
    formData.append('profile', JSON.stringify(data));
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    onSave(formData);
  };

  // We are "dirty" if form values changed OR if user selected a new logo / removed old logo
  const hasChanges = isDirty || logoFile !== null || (initialData.profile?.logoUrl && !logoPreview && logoPreview !== initialData.profile?.logoUrl);

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <h3 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-2">
        <Building2 size={24} className="text-primary-600" />
        Hospital Profile
      </h3>
      
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Col - 65% */}
        <div className="flex-[6.5] space-y-5">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Hospital Name *</label>
                <input {...register('name')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tagline</label>
                <input {...register('tagline')} placeholder="e.g. Caring for Life" className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Registration No.</label>
                <input {...register('registrationNumber')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Accreditation</label>
                <input {...register('accreditation')} placeholder="e.g. NABH, JCI" className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone *</label>
                <input {...register('phone')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                <input type="email" {...register('email')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Website</label>
                <input type="url" {...register('website')} placeholder="https://..." className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">GST Number</label>
                <input {...register('gstNumber')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
              <textarea {...register('address')} rows="2" className="w-full px-3 py-2 border border-neutral-300 rounded resize-none focus:ring-primary-500"></textarea>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                <input {...register('city')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">State</label>
                <input {...register('state')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Pincode</label>
                <input {...register('pincode')} className="w-full px-3 py-2 border border-neutral-300 rounded focus:ring-primary-500" />
              </div>
           </div>
        </div>

        {/* Right Col - 35% Logo Upload */}
        <div className="flex-[3.5] flex flex-col gap-2">
           <label className="block text-sm font-medium text-neutral-700">Logo Upload</label>
           
           <div 
             className={`flex-1 min-h-[220px] max-h-[250px] flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors relative ${isHovering ? 'border-primary-500 bg-primary-50/50' : 'border-neutral-300 bg-neutral-50'} ${logoPreview ? 'p-2' : ''}`}
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
           >
              {logoPreview ? (
                 <div className="w-full h-full relative group flex items-center justify-center bg-white rounded-lg shadow-sm border border-neutral-100 p-4">
                    <img src={logoPreview} alt="Hospital Logo" className="max-w-full max-h-full object-contain" />
                    <button 
                      type="button" 
                      onClick={removeLogo}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-50"
                    >
                      <X size={16} />
                    </button>
                    {logoFile && <div className="absolute bottom-2 left-2 right-2 text-xs text-center bg-black/60 text-white truncate px-2 py-1 rounded">{logoFile.name}</div>}
                 </div>
              ) : (
                 <div className="text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-3">
                       <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-medium text-neutral-700">Drag & drop logo</p>
                    <p className="text-xs text-neutral-500 mt-1">or click to upload</p>
                    <p className="text-[10px] text-neutral-400 mt-3">PNG or JPG, max 2MB</p>
                 </div>
              )}
              
              <input 
                type="file" 
                id="logo-upload"
                accept="image/png, image/jpeg" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
           </div>
        </div>
      </div>

      <UnsavedChangesBar 
         isDirty={hasChanges} 
         reset={() => { reset(); removeLogo(); }} 
         onSave={handleSubmit(internalSubmit)} 
         isSaving={isSaving} 
      />
    </form>
  );
}
