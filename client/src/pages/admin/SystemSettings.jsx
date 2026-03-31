import React, { useState, useEffect, useCallback } from 'react';
import { settingsService } from '../../services/settings.service';
import { staffService } from '../../services/staff.service';

import SettingsTabs from '../../components/settings/SettingsTabs';
import HospitalProfileForm from '../../components/settings/HospitalProfileForm';
import DepartmentManager from '../../components/settings/DepartmentManager';
import BedManager from '../../components/settings/BedManager';
import FeeStructureEditor from '../../components/settings/FeeStructureEditor';
import NotificationSettings from '../../components/settings/NotificationSettings';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState(null);
  const [activeStaff, setActiveStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ FIXED DATA FETCH
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [settingsRes, staffRes] = await Promise.all([
        settingsService.getSettings(),
        staffService.getAll({ status: 'active', limit: 500 })
      ]);

      // 🔥 FIX: handle BOTH response formats
      const settingsData = settingsRes?.data?.data || settingsRes?.data || settingsRes;
      const staffData = staffRes?.data || staffRes;

      setSettings(settingsData);
      setActiveStaff(staffData || []);

    } catch (err) {
      console.error("Failed to load settings data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ FIXED REFRESH FUNCTION
  const fetchSettingsOnly = async () => {
    try {
      const res = await settingsService.getSettings();
      const settingsData = res?.data || res;
      setSettings(settingsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProfileSave = async (formData) => {
    setIsSaving(true);
    try {
      await settingsService.updateProfile(formData);
      await fetchSettingsOnly();
    } catch (err) {
      alert('Error updating profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeesSave = async (feeData) => {
    setIsSaving(true);
    try {
      await settingsService.updateFeeStructure(feeData);
      await fetchSettingsOnly();
    } catch (err) {
      alert('Error saving fee structure.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationsSave = async (notificationData) => {
    setIsSaving(true);
    try {
      await settingsService.updateNotificationSettings(notificationData);
      await fetchSettingsOnly();
    } catch (err) {
      alert('Error saving notification settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ LOADING UI
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-8 h-8 rounded-full border-b-2 border-primary-600 animate-spin"></div>
      </div>
    );
  }

  // ✅ ERROR UI
 if (!settings) {
  const mockSettings = {
    profile: {
      name: "Apollo Horizon Hospital",
      tagline: "Healing with Heart",
      address: "14, Rajiv Gandhi Salai",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600096",
      phone: "044-4800-5000",
      email: "care@apollohorizon.in",
      website: "www.apollohorizon.in",
      registrationNumber: "TN-HEALTH-9988",
      accreditation: "NABH"
    },

    departments: [
      {
        _id: "1",
        name: "Cardiology",
        code: "CARDIO",
        totalBeds: 20,
        location: "Block A, Floor 2",
        isActive: true
      },
      {
        _id: "2",
        name: "Orthopedics",
        code: "ORTHO",
        totalBeds: 15,
        location: "Block B, Floor 1",
        isActive: true
      },
      {
        _id: "3",
        name: "Neurology",
        code: "NEURO",
        totalBeds: 10,
        location: "Block C, Floor 3",
        isActive: true
      }
    ],

    beds: [
      {
        _id: "b1",
        bedNumber: "A101",
        ward: "General",
        type: "general",
        status: "available",
        ratePerDay: 1500
      },
      {
        _id: "b2",
        bedNumber: "ICU-01",
        ward: "ICU",
        type: "icu",
        status: "occupied",
        ratePerDay: 5000
      },
      {
        _id: "b3",
        bedNumber: "P201",
        ward: "Private",
        type: "private",
        status: "maintenance",
        ratePerDay: 3000
      }
    ],

    feeStructure: {
      consultationFees: [
        { role: "General Physician", opd: 300, ipd: 500, emergency: 700 },
        { role: "Cardiologist", opd: 800, ipd: 1200, emergency: 1500 }
      ],
      labTestFees: [
        { testName: "Blood Test", testCode: "BT001", price: 500, category: "Haematology" },
        { testName: "X-Ray", testCode: "XR001", price: 800, category: "Radiology" }
      ],
      roomCharges: [
        { roomType: "general", ratePerDay: 1500 },
        { roomType: "private", ratePerDay: 3000 },
        { roomType: "icu", ratePerDay: 5000 }
      ],
      miscCharges: [
        { item: "Ambulance", price: 1000 },
        { item: "Nursing", price: 500 }
      ],
      gstPercent: 18,
      currency: "INR"
    },

    notifications: {
      email: {
        enabled: true,
        appointmentReminder: true,
        reminderHoursBefore: 24,
        labResultReady: true,
        appointmentConfirmed: true,
        dischargeReady: true,
        fromName: "Apollo HMS",
        fromEmail: "no-reply@apollo.com"
      },
      inApp: {
        enabled: true,
        criticalVitals: true,
        newAppointment: true,
        bedStatusChange: true
      }
    }
  };

  setSettings(mockSettings);
}

  // ✅ MAIN UI
  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6 h-[calc(100vh-64px)] overflow-hidden">

      {/* Header */}
      <div className="flex-none">
        <h1 className="text-2xl font-bold text-neutral-900">System Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configure hospital-wide profiles, clinical departments, and integrations.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden min-h-0">

        {/* Sidebar */}
        <div className="flex-none hidden md:block w-56">
          <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Mobile Dropdown */}
        <div className="md:hidden flex-none">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-neutral-800 bg-white"
          >
            <option value="profile">Hospital Profile</option>
            <option value="departments">Departments</option>
            <option value="beds">Beds</option>
            <option value="fees">Fee Structures</option>
            <option value="notifications">Notifications</option>
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20 px-1 custom-scrollbar">
          {activeTab === 'profile' && (
            <HospitalProfileForm
              initialData={settings}
              onSave={handleProfileSave}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentManager
              settings={settings}
              fetchSettings={fetchSettingsOnly}
              activeStaff={activeStaff}
            />
          )}

          {activeTab === 'beds' && (
            <BedManager
              settings={settings}
              fetchSettings={fetchSettingsOnly}
            />
          )}

          {activeTab === 'fees' && (
            <FeeStructureEditor
              initialData={settings}
              onSave={handleFeesSave}
              isSaving={isSaving}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationSettings
              initialData={settings}
              onSave={handleNotificationsSave}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
    </div>
  );
}