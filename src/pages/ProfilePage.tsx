import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Bell, Lock, Save, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/authService';
import { getInitials } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const schema = z.object({
  coordinatorName: z.string().min(2, 'Name required'),
  coordinatorEmail: z.string().email('Valid email required'),
  coordinatorContact: z.string().min(10, 'Valid contact required'),
  notifications: z.boolean(),
});
type FormData = z.infer<typeof schema>;

const ProfilePage: React.FC = () => {
  const session = useAuthStore(state => state.session);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  const [cell, setCell] = useState<any>(null);

  React.useEffect(() => {
    authService.getCurrentCell().then(setCell).catch(console.error);
  }, []);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      coordinatorName: '',
      coordinatorEmail: '',
      coordinatorContact: '',
      notifications: true,
    },
  });

  React.useEffect(() => {
    if (cell) {
      setValue('coordinatorName', cell.coordinatorName || '');
      setValue('coordinatorEmail', cell.coordinatorEmail || '');
      setValue('coordinatorContact', cell.coordinatorContact || '');
      setValue('notifications', cell.notifications ?? true);
    }
  }, [cell, setValue]);

  const notificationsValue = watch('notifications');

  const onSubmit = async (data: FormData) => {
    await new Promise(r => setTimeout(r, 500));
    authService.updateCoordinatorProfile(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!session || !cell) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>

      {/* Avatar Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-3xl shadow-md flex-shrink-0">
              {getInitials(session.coordinatorName)}
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{session.coordinatorName}</p>
              <p className="text-sm font-medium text-slate-500 mt-0.5">{session.cellName}</p>
              <p className="text-xs font-bold text-blue-600 mt-1.5 uppercase tracking-wider">{cell.department}</p>
            </div>
            <div className="sm:ml-auto flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-slate-100 sm:border-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Session
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {session.cellId}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl max-w-sm">
        {(['profile', 'security'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'profile' ? 'Profile Details' : 'Security'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <motion.form
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-2">Coordinator Information</h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-slate-600">
                    <User size={14} /> Full Name
                  </Label>
                  <Input {...register('coordinatorName')} />
                  {errors.coordinatorName && <p className="text-xs font-medium text-red-500 mt-1">{errors.coordinatorName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-slate-600">
                    <Mail size={14} /> Email Address
                  </Label>
                  <Input {...register('coordinatorEmail')} type="email" />
                  {errors.coordinatorEmail && <p className="text-xs font-medium text-red-500 mt-1">{errors.coordinatorEmail.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5 text-slate-600">
                    <Phone size={14} /> Contact Number
                  </Label>
                  <Input {...register('coordinatorContact')} />
                  {errors.coordinatorContact && <p className="text-xs font-medium text-red-500 mt-1">{errors.coordinatorContact.message}</p>}
                </div>
              </div>

              {/* Cell Info (read-only) */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cell Details (Read-only)</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 font-medium text-xs mb-1">Cell ID</p>
                    <p className="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-100 inline-block">{cell.cellId}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium text-xs mb-1">Department</p>
                    <p className="font-bold text-slate-900">{cell.department}</p>
                  </div>
                </div>
              </div>

              {/* Notifications toggle */}
              <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Bell size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Email Notifications</span>
                    <span className="text-xs text-slate-500 font-medium">Receive alerts for new assignments and deadlines</span>
                  </div>
                </div>
                <Switch 
                  checked={notificationsValue} 
                  onCheckedChange={(val) => setValue('notifications', val)} 
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`gap-2 min-w-[140px] ${
                    saved ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : saved ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.form>
      )}

      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6 space-y-6">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-2">
                <Lock size={18} className="text-slate-400" /> Security Settings
              </h3>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-medium text-amber-800">
                  Password changes are managed by the Super Admin. Please contact your administrator to reset your cell password.
                </p>
              </div>
              
              <div className="space-y-1">
                {[
                  { label: 'Session Active Since', value: session.loginTime ? new Date(session.loginTime).toLocaleString() : 'Unknown' },
                  { label: 'Cell ID', value: session.cellId },
                  { label: 'Role', value: 'Cell Coordinator' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-slate-100 last:border-0">
                    <span className="text-sm font-medium text-slate-500">{label}</span>
                    <span className="text-sm font-bold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
