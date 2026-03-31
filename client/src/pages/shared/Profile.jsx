import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Info, Check, Lock, Camera, AlertCircle, ShieldCheck, FileText, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import useAuthStore from '../../store/authStore';
import { userService } from '../../services/user.service';
import ToggleSwitch from '../../components/ui/ToggleSwitch';

const FieldLabel = ({ label, tooltip, locked }) => (
  <div className="flex items-center gap-1.5 mb-1 w-fit" title={locked ? "This field can only be changed by an Admin." : tooltip}>
    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</label>
    {locked ? (
      <Lock size={12} className="text-neutral-400" />
    ) : tooltip ? (
      <Info size={12} className="text-neutral-400 cursor-help" />
    ) : null}
  </div>
);

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const personalSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  contactNumber: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
});

export default function Profile() {
  const { user: authUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [entity, setEntity] = useState(null);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  
  const [passFeedback, setPassFeedback] = useState({ success: false, msg: '' });

  const fetchProfile = async () => {
    try {
      const [{ user, entity }, statRes] = await Promise.all([
        userService.getMe(),
        userService.getStats()
      ]);
      setProfile(user);
      setEntity(entity);
      if (statRes?.stats) setStats(statRes.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const { register: regPersonal, handleSubmit: handlePersonal, reset: resetPersonal, formState: { errors: ePersonal } } = useForm({
     resolver: zodResolver(personalSchema)
  });

  useEffect(() => {
     if (entity && profile) {
        resetPersonal({
           firstName: entity.firstName || '',
           lastName: entity.lastName || '',
           contactNumber: entity.contactNumber || '',
           gender: entity.gender || '',
           dateOfBirth: entity.dateOfBirth ? new Date(entity.dateOfBirth).toISOString().split('T')[0] : '',
           bloodGroup: entity.bloodGroup || ''
        });
     }
  }, [entity, profile, resetPersonal]);

  const { register: regPass, handleSubmit: handlePass, watch, reset: resetPass, formState: { errors: ePass, isSubmitting: isPassSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onPersonalSubmit = async (data) => {
     setIsSavingPersonal(true);
     try {
        await userService.updateMe(data);
        await fetchProfile();
        setIsEditingPersonal(false);
     } catch (err) {
        alert("Failed to update profile form");
     } finally {
        setIsSavingPersonal(false);
     }
  };

  const onPassSubmit = async (data) => {
     try {
       await userService.changePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword });
       setPassFeedback({ success: true, msg: 'Password updated successfully' });
       resetPass();
       setTimeout(() => setPassFeedback({ success: false, msg: '' }), 5000);
     } catch (err) {
       setPassFeedback({ success: false, msg: err.response?.data?.error || 'Failed to update' });
     }
  };

  const togglePref = async (field, val) => {
     try {
        const newPrefs = { ...(profile.preferences || {}), [field]: val };
        await userService.updatePreferences(newPrefs);
        setProfile(prev => ({ ...prev, preferences: newPrefs }));
     } catch (err) {
        console.error(err);
     }
  };

  const newPassWatcher = watch('newPassword') || '';
  const passScore = [
     newPassWatcher.length >= 8,
     /[A-Z]/.test(newPassWatcher),
     /[0-9]/.test(newPassWatcher),
     /[^A-Za-z0-9]/.test(newPassWatcher)
  ].filter(Boolean).length;
  
  const pColors = ['bg-neutral-200', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-500'];
  const pLabels = ['None', 'Weak', 'Fair', 'Good', 'Strong'];

  if (isLoading) {
     return <div className="p-12 text-center text-neutral-500">Loading Profile...</div>;
  }

  if (!profile || !entity) {
     return <div className="p-12 text-center text-red-500">Cannot load profile details.</div>;
  }

  const getInitials = () => `${entity.firstName?.charAt(0) || ''}${entity.lastName?.charAt(0) || ''}`;

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
       
       <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <div className="relative group">
             <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 text-2xl font-bold shadow-sm border-4 border-white">
                {entity.photoUrl ? <img src={entity.photoUrl} className="w-full h-full rounded-full object-cover" /> : getInitials()}
             </div>
             <button className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-medium p-2">
                <Camera size={16} className="mb-1" /> Change
             </button>
          </div>

          <div className="flex-1 space-y-2">
             <h1 className="text-2xl font-semibold font-sora text-neutral-900 leading-tight">
                {entity.firstName} {entity.lastName}
             </h1>
             <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center text-sm font-medium">
                <span className="bg-primary-100 text-primary-800 px-2.5 py-0.5 rounded-md capitalize">{profile.role.replace('_',' ')}</span>
                <span className="text-neutral-300">•</span>
                <span className="text-neutral-600">{entity.department?.name || entity.department || 'No Dept'}</span>
                <span className="text-neutral-300">•</span>
                <span className="font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-xs tracking-wide">
                   {entity.employeeId || entity.patientId || 'N/A'}
                </span>
             </div>
             <p className="text-sm text-neutral-400">Member since {format(new Date(profile.createdAt || entity.createdAt || new Date()), 'dd MMM yyyy')}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4 md:pt-0 border-t md:border-none border-neutral-200 w-full md:w-auto mt-4 md:mt-0">
             {Object.entries(stats).map(([key, val]) => (
                <div key={key} className="text-center bg-white/60 px-4 py-2 rounded-xl">
                   <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-0.5">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                   </p>
                   <p className="text-lg font-semibold text-primary-900">{val}</p>
                </div>
             ))}
          </div>
       </div>

       {/* CONTENT TWO-COLUMNS */}
       <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* LEFT 60% */}
          <div className="w-full lg:flex-[6] space-y-6">
             
             {/* Personal Info */}
             <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 relative">
                <div className="flex justify-between items-center mb-5">
                   <h3 className="font-semibold text-neutral-800 flex items-center gap-2"><UserIcon size={18} className="text-primary-600"/> Personal Information</h3>
                   {!isEditingPersonal ? (
                      <button onClick={() => setIsEditingPersonal(true)} className="text-sm font-medium text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded transition-colors">Edit</button>
                   ) : (
                      <div className="flex gap-2">
                         <button onClick={() => { resetPersonal(); setIsEditingPersonal(false); }} disabled={isSavingPersonal} className="text-sm px-3 py-1.5 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">Cancel</button>
                         <button onClick={handlePersonal(onPersonalSubmit)} disabled={isSavingPersonal} className="text-sm px-3 py-1.5 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center gap-1">
                            {isSavingPersonal ? <div className="w-3 h-3 animte-spin rounded-full border border-white border-t-transparent"/> : <Check size={14} />} Save
                         </button>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   <div>
                      <FieldLabel label="First Name" />
                      {isEditingPersonal ? <input {...regPersonal('firstName')} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-primary-500" /> : <div className="text-sm text-neutral-800">{entity.firstName}</div>}
                      {ePersonal.firstName && <span className="text-xs text-red-500">{ePersonal.firstName.message}</span>}
                   </div>
                   <div>
                      <FieldLabel label="Last Name" />
                      {isEditingPersonal ? <input {...regPersonal('lastName')} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-primary-500" /> : <div className="text-sm text-neutral-800">{entity.lastName}</div>}
                   </div>
                   <div>
                      <FieldLabel label="Email" locked tooltip="Contact admin to update." />
                      <div className="text-sm text-neutral-800">{profile.email}</div>
                   </div>
                   <div>
                      <FieldLabel label="Contact Number" />
                      {isEditingPersonal ? <input {...regPersonal('contactNumber')} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-primary-500" /> : <div className="text-sm text-neutral-800">{entity.contactNumber || '-'}</div>}
                   </div>
                   <div>
                      <FieldLabel label="Gender" />
                      {isEditingPersonal ? (
                         <select {...regPersonal('gender')} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-primary-500">
                           <option value="">Select</option>
                           <option value="Male">Male</option>
                           <option value="Female">Female</option>
                           <option value="Other">Other</option>
                         </select>
                      ) : <div className="text-sm text-neutral-800">{entity.gender || '-'}</div>}
                   </div>
                   <div>
                      <FieldLabel label="Date Of Birth" />
                      {isEditingPersonal ? <input type="date" {...regPersonal('dateOfBirth')} className="w-full px-3 py-1.5 border rounded focus:ring-1 focus:ring-primary-500" /> : <div className="text-sm text-neutral-800">{entity.dateOfBirth ? format(new Date(entity.dateOfBirth), 'dd MMM yyyy') : '-'}</div>}
                   </div>
                </div>
             </div>

             {/* Emergency Contact */}
             <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-red-500"/> Emergency Contact</h3>
                {entity.emergencyContact && entity.emergencyContact.name ? (
                   <div className="flex items-center gap-4 bg-red-50/50 p-4 rounded-lg border border-red-100">
                      <div>
                         <p className="text-sm font-semibold text-neutral-800">{entity.emergencyContact.name}</p>
                         <p className="text-sm text-neutral-600">{entity.emergencyContact.relation} · {entity.emergencyContact.phone}</p>
                      </div>
                   </div>
                ) : (
                   <p className="text-sm text-neutral-500 italic">No emergency contact configured.</p>
                )}
             </div>

          </div>

          {/* RIGHT 40% */}
          <div className="w-full lg:flex-[4] space-y-6">
             
             {/* Work Information */}
             <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-800 mb-5 flex items-center gap-2"><FileText size={18} className="text-primary-600"/> Work Information</h3>
                <div className="space-y-4">
                   <div>
                      <FieldLabel label="Department" locked tooltip="Your assigned department. Only an Admin can reassign departments." />
                      <p className="text-sm text-neutral-800">{entity.department?.name || entity.department || 'N/A'}</p>
                   </div>
                   <div>
                      <FieldLabel label="Shift" tooltip="Your default working hours." />
                      <p className="text-sm text-neutral-800 capitalize">{entity.shift || 'Flexible'} Shift</p>
                   </div>
                   {entity.qualifications && (
                      <div>
                         <FieldLabel label="Qualifications" />
                         <div className="flex flex-wrap gap-1.5 mt-1">
                            {entity.qualifications.map(q => (
                               <span key={q} className="bg-neutral-100 px-2 py-0.5 rounded text-xs font-medium text-neutral-700">{q}</span>
                            ))}
                         </div>
                      </div>
                   )}
                </div>
             </div>

             {/* Account & Security */}
             <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h3 className="font-semibold text-neutral-800 mb-5 flex items-center gap-2"><ShieldCheck size={18} className="text-primary-600"/> Account & Security</h3>
                
                <form onSubmit={handlePass(onPassSubmit)} className="space-y-4 pb-6 border-b border-neutral-100">
                   <h4 className="text-sm font-medium text-neutral-700">Change Password</h4>
                   
                   <div>
                      <input type="password" {...regPass('oldPassword')} placeholder="Current Password" className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-primary-500 bg-neutral-50" />
                      {ePass.oldPassword && <p className="text-xs text-red-500 mt-1">{ePass.oldPassword.message}</p>}
                   </div>
                   <div>
                      <input type="password" {...regPass('newPassword')} placeholder="New Password" className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-primary-500 bg-neutral-50" />
                      
                      {/* Password strength meter */}
                      <div className="flex gap-1 mt-1.5 h-1.5">
                         {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`flex-1 rounded-full ${passScore >= i ? pColors[passScore] : 'bg-neutral-200 transition-colors'}`}></div>
                         ))}
                      </div>
                      {newPassWatcher.length > 0 && <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider text-right">{pLabels[passScore]}</p>}
                      
                      {ePass.newPassword && <p className="text-xs text-red-500 mt-1">{ePass.newPassword.message}</p>}
                   </div>
                   <div>
                      <input type="password" {...regPass('confirmPassword')} placeholder="Confirm New Password" className="w-full px-3 py-2 text-sm border rounded focus:ring-1 focus:ring-primary-500 bg-neutral-50" />
                      {ePass.confirmPassword && <p className="text-xs text-red-500 mt-1">{ePass.confirmPassword.message}</p>}
                   </div>
                   
                   <div className="flex items-center justify-between">
                      <span className={`text-xs ${passFeedback.success ? 'text-green-600' : 'text-red-500'}`}>{passFeedback.msg}</span>
                      <button disabled={isPassSubmitting} className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded font-medium disabled:opacity-50">Update Password</button>
                   </div>
                </form>

                <div className="pt-5 space-y-4">
                   <h4 className="text-sm font-medium text-neutral-700">Notification Preferences</h4>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-600">Email Alerts</span>
                      <ToggleSwitch checked={profile.preferences?.emailAlerts ?? true} onChange={(v) => togglePref('emailAlerts', v)} />
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-600">In-App Notifications</span>
                      <ToggleSwitch checked={profile.preferences?.inAppAlerts ?? true} onChange={(v) => togglePref('inAppAlerts', v)} />
                   </div>
                </div>
             </div>

          </div>
       </div>

    </div>
  );
}
