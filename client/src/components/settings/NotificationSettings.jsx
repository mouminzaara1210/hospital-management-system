import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Bell, Mail, Smartphone, Send } from 'lucide-react';
import ToggleSwitch from '../ui/ToggleSwitch';
import UnsavedChangesBar from '../ui/UnsavedChangesBar';
import { settingsService } from '../../services/settings.service';

export default function NotificationSettings({ initialData = {}, onSave, isSaving }) {
  const [emailSettings, setEmailSettings] = useState({
    enabled: true,
    appointmentReminder: true,
    reminderHoursBefore: 24,
    labResultReady: true,
    appointmentConfirmed: true,
    dischargeReady: true,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    fromName: '',
    fromEmail: ''
  });

  const [inAppSettings, setInAppSettings] = useState({
    enabled: true,
    criticalVitals: true,
    newAppointment: true,
    bedStatusChange: true
  });

  const [isDirty, setIsDirty] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);

  useEffect(() => {
    if (initialData.notifications) {
       setEmailSettings({
          ...emailSettings,
          ...initialData.notifications.email
       });
       setInAppSettings({
          ...inAppSettings,
          ...initialData.notifications.inApp
       });
       setIsDirty(false);
    }
  }, [initialData]);

  const handleEmailToggle = (field, checked) => {
    setEmailSettings(prev => ({ ...prev, [field]: checked }));
    setIsDirty(true);
  };

  const handleEmailText = (e) => {
    const { name, value, type } = e.target;
    setEmailSettings(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    setIsDirty(true);
  };

  const handleInAppToggle = (field, checked) => {
    setInAppSettings(prev => ({ ...prev, [field]: checked }));
    setIsDirty(true);
  };

  const internalSave = () => {
    onSave({ email: emailSettings, inApp: inAppSettings });
    setTimeout(() => setIsDirty(false), 500);
  };

  const handleTestEmail = async () => {
    setTestingSmtp(true);
    try {
      const res = await settingsService.sendTestEmail();
      alert(res.message || 'Test email sent successfully');
    } catch (err) {
      alert('SMTP Check Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
         <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
            <div>
               <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                 <Mail size={20} className="text-primary-600" />
                 Email Notifications
               </h3>
               <p className="text-sm text-neutral-500 mt-1">Configure automated patient & staff emails</p>
            </div>
            <ToggleSwitch id="email-enabled" checked={emailSettings.enabled} onChange={(c) => handleEmailToggle('enabled', c)} />
         </div>

         <div className={`p-6 transition-opacity duration-200 ${!emailSettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-neutral-800 uppercase tracking-wider mb-2">Triggers</h4>
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-neutral-700">Appointment Confirmation</span>
                     <ToggleSwitch checked={emailSettings.appointmentConfirmed} onChange={(c) => handleEmailToggle('appointmentConfirmed', c)} />
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-neutral-700">Lab Results Ready</span>
                     <ToggleSwitch checked={emailSettings.labResultReady} onChange={(c) => handleEmailToggle('labResultReady', c)} />
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-neutral-700">Discharge Summaries</span>
                     <ToggleSwitch checked={emailSettings.dischargeReady} onChange={(c) => handleEmailToggle('dischargeReady', c)} />
                  </div>
                  <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
                     <div>
                        <span className="text-sm text-neutral-700 block mb-0.5">Appointment Reminder</span>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                           Send <input type="number" name="reminderHoursBefore" value={emailSettings.reminderHoursBefore} onChange={handleEmailText} className="w-12 px-1 py-0.5 border border-neutral-300 rounded text-center focus:ring-1 focus:ring-primary-500" /> hrs before
                        </div>
                     </div>
                     <ToggleSwitch checked={emailSettings.appointmentReminder} onChange={(c) => handleEmailToggle('appointmentReminder', c)} />
                  </div>
               </div>

               <div className="space-y-4 bg-neutral-50 p-5 rounded-lg border border-neutral-200">
                  <div className="flex items-center justify-between mb-2">
                     <h4 className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">SMTP Configuration</h4>
                     <button 
                       type="button" 
                       onClick={handleTestEmail}
                       disabled={testingSmtp || !emailSettings.smtpHost}
                       className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 rounded shadow-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                     >
                       {testingSmtp ? <div className="w-3 h-3 rounded-full border border-primary-600 border-t-transparent animate-spin"></div> : <Send size={12} />}
                       Test Connection
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                     <div className="col-span-2">
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Host</label>
                        <input type="text" name="smtpHost" value={emailSettings.smtpHost} onChange={handleEmailText} placeholder="smtp.gmail.com" className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-primary-500" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Port</label>
                        <input type="number" name="smtpPort" value={emailSettings.smtpPort} onChange={handleEmailText} className="w-full px-2 py-1.5 text-sm border font-mono border-neutral-300 rounded focus:ring-primary-500" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Username</label>
                        <input type="text" name="smtpUser" value={emailSettings.smtpUser} onChange={handleEmailText} className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-primary-500" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">Password</label>
                        <input type="password" name="smtpPass" value={emailSettings.smtpPass} onChange={handleEmailText} placeholder="••••••••" className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-primary-500" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">From Name</label>
                        <input type="text" name="fromName" value={emailSettings.fromName} onChange={handleEmailText} placeholder="My Hospital" className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-primary-500" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">From Email</label>
                        <input type="email" name="fromEmail" value={emailSettings.fromEmail} onChange={handleEmailText} placeholder="noreply@hospital.com" className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-primary-500" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
         <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
            <div>
               <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
                 <Smartphone size={20} className="text-primary-600" />
                 In-App Dashboard Alerts
               </h3>
               <p className="text-sm text-neutral-500 mt-1">Configure real-time alerts shown onto the staff portals</p>
            </div>
            <ToggleSwitch id="inapp-enabled" checked={inAppSettings.enabled} onChange={(c) => handleInAppToggle('enabled', c)} />
         </div>

         <div className={`p-6 transition-opacity duration-200 ${!inAppSettings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="max-w-md space-y-4">
               <div className="flex items-center justify-between">
                  <div>
                     <span className="text-sm font-medium text-neutral-800 block">Critical Vitals Alert</span>
                     <span className="text-xs text-neutral-500">To Nurses & Doctors if patient vitals drop</span>
                  </div>
                  <ToggleSwitch checked={inAppSettings.criticalVitals} onChange={(c) => handleInAppToggle('criticalVitals', c)} />
               </div>
               <div className="flex items-center justify-between">
                  <div>
                     <span className="text-sm font-medium text-neutral-800 block">New OPD/Ticket Wait</span>
                     <span className="text-xs text-neutral-500">Alert Receptionist & Doctor when arriving</span>
                  </div>
                  <ToggleSwitch checked={inAppSettings.newAppointment} onChange={(c) => handleInAppToggle('newAppointment', c)} />
               </div>
               <div className="flex items-center justify-between">
                  <div>
                     <span className="text-sm font-medium text-neutral-800 block">Bed Occupancy Updates</span>
                     <span className="text-xs text-neutral-500">Live bed count fluctuations</span>
                  </div>
                  <ToggleSwitch checked={inAppSettings.bedStatusChange} onChange={(c) => handleInAppToggle('bedStatusChange', c)} />
               </div>
            </div>
         </div>
      </div>

      <UnsavedChangesBar 
         isDirty={isDirty} 
         reset={() => {
            if (initialData.notifications) {
               setEmailSettings(initialData.notifications.email || emailSettings);
               setInAppSettings(initialData.notifications.inApp || inAppSettings);
            }
            setIsDirty(false);
         }} 
         onSave={internalSave} 
         isSaving={isSaving} 
      />
    </div>
  );
}
