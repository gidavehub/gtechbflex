'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save } from 'lucide-react';
import CustomInput from '@/components/ui/CustomInput';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { updateUser } from '@/lib/firestore';
import { GENDERS, COUNTRIES, GAMBIA_REGIONS } from '@/lib/types';

export default function ProfilePage() {
  const { portalUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: portalUser?.first_name || '',
    last_name: portalUser?.last_name || '',
    phone: portalUser?.phone || '',
    gender: portalUser?.gender || '',
    country: portalUser?.country || '',
    region: portalUser?.region || '',
  });

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(portalUser!.uid, form);
      await refreshUser();
      toast({ title: 'Profile updated!', type: 'success' });
    } catch {
      toast({ title: 'Failed to save', type: 'error' });
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Manage your account details</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gold-400 flex items-center justify-center text-white text-xl font-bold">
            {portalUser?.first_name?.[0]}{portalUser?.last_name?.[0]}
          </div>
          <div>
            <p className="font-bold text-gray-900">{portalUser?.first_name} {portalUser?.last_name}</p>
            <p className="text-xs text-gray-500">{portalUser?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <CustomInput label="First Name" value={form.first_name} onChange={v => set('first_name', v)} required />
          <CustomInput label="Last Name" value={form.last_name} onChange={v => set('last_name', v)} required />
        </div>
        <CustomInput label="Phone" value={form.phone} onChange={v => set('phone', v)} placeholder="Optional" />
        <CustomDropdown label="Gender" options={GENDERS} value={form.gender} onChange={v => set('gender', v)} />
        <CustomDropdown label="Country" options={COUNTRIES} value={form.country} onChange={v => set('country', v)} searchable />
        <CustomDropdown label="Region" options={GAMBIA_REGIONS} value={form.region} onChange={v => set('region', v)} />

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </motion.div>
    </div>
  );
}
