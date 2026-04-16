'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, ToggleLeft, ToggleRight, Users, Layers, Pencil } from 'lucide-react';
import CustomInput from '@/components/ui/CustomInput';
import CustomDropdown from '@/components/ui/CustomDropdown';
import CustomTextarea from '@/components/ui/CustomTextarea';
import Modal from '@/components/ui/Modal';
import FormBuilder from '@/components/admin/FormBuilder';
import { useToast } from '@/context/ToastContext';
import { getPrograms, createProgram, updateProgram } from '@/lib/firestore';
import { PROGRAM_TYPES, DEFAULT_FORM_FIELDS } from '@/lib/types';
import type { Program } from '@/lib/types';

const typeLabels: Record<string, string> = {
  mentorship: 'Mentorship',
  investment_readiness: 'Investment Readiness',
  business_linkage: 'Business Linkage',
  incubation: 'Incubation',
  acceleration: 'Acceleration',
};

export default function AdminProgramsPage() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', program_type: '', max_participants: '30', location: '', start_date: '',
  });

  const load = async () => {
    try {
      const data = await getPrograms();
      setPrograms(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.program_type) {
      toast({ title: 'Fill in required fields', type: 'error' });
      return;
    }
    setCreating(true);
    try {
      await createProgram({
        title: form.title,
        description: form.description,
        program_type: form.program_type as any,
        is_active: true,
        is_applications_open: true,
        max_participants: parseInt(form.max_participants) || 30,
        current_participants: 0,
        fields: [...DEFAULT_FORM_FIELDS],
        location: form.location,
        start_date: form.start_date,
      });
      toast({ title: 'Program created with default form!', type: 'success' });
      setShowCreate(false);
      setForm({ title: '', description: '', program_type: '', max_participants: '30', location: '', start_date: '' });
      load();
    } catch {
      toast({ title: 'Error creating', type: 'error' });
    }
    setCreating(false);
  };

  const toggleApplications = async (id: string, current: boolean) => {
    try {
      await updateProgram(id, { is_applications_open: !current });
      setPrograms(prev => prev.map(p => p.id === id ? { ...p, is_applications_open: !current } : p));
      toast({ title: `Applications ${!current ? 'opened' : 'closed'}`, type: 'success' });
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Programs</h1>
          <p className="text-sm text-gray-500">{programs.length} total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Create Program
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl h-28 animate-shimmer" />)}</div>
      ) : programs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <GraduationCap size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Programs</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first program to start accepting applications.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create Program</button>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((p, idx) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{p.title}</h3>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-gold-50 text-gold-600 border border-gold-200">{typeLabels[p.program_type]}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{p.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Users size={12} /> {p.current_participants || 0}/{p.max_participants}</span>
                    <span className="flex items-center gap-1"><Layers size={12} /> {(p.fields || []).length} form fields</span>
                    {p.location && <span>{p.location}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingProgram(p)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gold-50 hover:text-gold-700 transition-all"
                  >
                    <Pencil size={14} /> Edit Form
                  </button>
                  <button
                    onClick={() => toggleApplications(p.id, p.is_applications_open)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      p.is_applications_open ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.is_applications_open ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {p.is_applications_open ? 'Open' : 'Closed'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Program" maxWidth="max-w-xl">
        <div className="space-y-4">
          <CustomInput label="Program Title" value={form.title} onChange={v => set('title', v)} required placeholder="e.g. Youth Mentorship Program" />
          <CustomTextarea label="Description" value={form.description} onChange={v => set('description', v)} required placeholder="Describe the program..." rows={3} />
          <CustomDropdown label="Program Type" options={PROGRAM_TYPES.map(t => t.label)} value={form.program_type} onChange={v => {
            set('program_type', PROGRAM_TYPES.find(t => t.label === v)?.value || v);
          }} required />
          <div className="grid grid-cols-2 gap-4">
            <CustomInput label="Max Participants" type="number" value={form.max_participants} onChange={v => set('max_participants', v)} />
            <CustomInput label="Location" value={form.location} onChange={v => set('location', v)} placeholder="e.g. Banjul" />
          </div>
          <CustomInput label="Start Date" value={form.start_date} onChange={v => set('start_date', v)} placeholder="e.g. May 2026" />
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-blue-700 font-medium">📋 A default application form will be created with the program. You can customize it afterwards using the Form Builder.</p>
          </div>
          <button onClick={handleCreate} disabled={creating} className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-50">
            {creating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
            Create Program
          </button>
        </div>
      </Modal>

      {/* Form Builder */}
      {editingProgram && (
        <FormBuilder
          program={editingProgram}
          onClose={() => setEditingProgram(null)}
          onSaved={(fields) => {
            setPrograms(prev => prev.map(p => p.id === editingProgram.id ? { ...p, fields } : p));
            setEditingProgram(null);
          }}
        />
      )}
    </div>
  );
}
