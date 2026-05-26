'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';
import { reportsApi, type UpdateFormatReq } from '@/lib/api/reports';
import { Loader2, Save, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ReportTemplateSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const { data, isLoading } = useQuery({
    queryKey: ['report-format'],
    queryFn: ({ signal }) => reportsApi.getFormat(signal),
  });

  const [form, setForm] = useState<UpdateFormatReq>({
    header_text: '',
    address_text: '',
    footer_text: '',
    logo_url: '',
  });

  useEffect(() => {
    if (data) {
      setForm({
        header_text: data.header_text ?? '',
        address_text: data.address_text ?? '',
        footer_text: data.footer_text ?? '',
        logo_url: data.logo_url ?? '',
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: reportsApi.updateFormat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-format'] });
      alert('Report Template saved successfully!');
    }
  });

  if (isLoading) {
    return <div className="p-6 text-gray-500 flex gap-2"><Loader2 className="animate-spin" /> Loading template settings...</div>;
  }

  const isDoctor = user?.role === 'Doctor' || user?.designation === 'Doctor' || user?.designation === 'General Physician';
  if (!isDoctor) {
    return <div className="p-6 text-red-500 font-bold">Unauthorized. Only Doctors can edit clinic report formats.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl p-6">
      <PageHeader title="Report Template Settings" description="Customize how medical reports and prescriptions are printed." />
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card p-6 shadow-xl border-none bg-white/60 backdrop-blur-md space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><FileText size={20} /> Edit Format</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Header Name (Clinic/Hospital)</label>
              <input 
                type="text" 
                value={form.header_text} 
                onChange={e => setForm({...form, header_text: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Apex Hospital"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <textarea 
                value={form.address_text} 
                onChange={e => setForm({...form, address_text: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                placeholder="e.g. 123 Main St, City"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Footer Notes</label>
              <input 
                type="text" 
                value={form.footer_text} 
                onChange={e => setForm({...form, footer_text: e.target.value})}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Valid for 3 months"
              />
            </div>

            <button 
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white p-3 rounded-xl shadow hover:bg-indigo-700 transition font-bold disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save />}
              Save Template
            </button>
          </div>
        </div>

        {/* Live Preview Pane */}
        <div className="border-l pl-8 space-y-4 hidden md:block">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Live Preview</h2>
          <div className="bg-white border border-gray-200 shadow-lg min-h-[500px] p-8 space-y-6">
             <div className="text-center border-b-2 border-indigo-500 pb-4">
                <h1 className="text-2xl font-black text-indigo-900 uppercase">{form.header_text || 'HOSPITAL NAME'}</h1>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{form.address_text || 'Hospital Address will appear here'}</p>
             </div>
             
             <div className="text-sm text-gray-800 space-y-2">
                <p><strong>Doctor:</strong> {user ? `Dr. ${user.first_name} ${user.last_name}` : 'Dr. Name'}</p>
                <p><strong>Patient:</strong> John Doe | <strong>Age:</strong> 30</p>
             </div>

             <div className="mt-8 border-t border-gray-100 pt-8 flex items-center justify-center text-gray-300">
                [ Medical Content ]
             </div>

             <div className="mt-auto border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
               {form.footer_text || 'Footer content'}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
