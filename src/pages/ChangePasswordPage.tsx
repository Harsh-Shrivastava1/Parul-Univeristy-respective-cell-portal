import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/authService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current one',
  });

type FormData = z.infer<typeof schema>;

const ChangePasswordPage: React.FC = () => {
  const session = useAuthStore((s) => s.session);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [show, setShow] = useState({ current: false, next: false, confirm: false });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const res = await authService.changePassword(data.currentPassword, data.newPassword);
    if (res.success) {
      setDone(true);
      reset();
      setTimeout(() => setDone(false), 4000);
    } else {
      setServerError(res.error || 'Password change failed.');
    }
  };

  const toggle = (k: keyof typeof show) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const field = (
    name: keyof FormData,
    label: string,
    key: keyof typeof show,
    autoComplete: string,
  ) => (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-slate-600">
        <Lock size={14} /> {label}
      </Label>
      <div className="relative">
        <Input
          {...register(name)}
          type={show[key] ? 'text' : 'password'}
          autoComplete={autoComplete}
          className="pr-10"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => toggle(key)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
          aria-label={show[key] ? 'Hide password' : 'Show password'}
        >
          {show[key] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[name] && <p className="text-xs font-medium text-red-500 mt-1">{errors[name]?.message}</p>}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <KeyRound size={22} className="text-blue-600" /> Change Password
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update the password for your coordinator account
          {session?.coordinatorEmail ? ` (${session.coordinatorEmail})` : ''}.
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 space-y-5">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck size={18} className="text-slate-400" /> Account Security
            </h3>

            {field('currentPassword', 'Current Password', 'current', 'current-password')}
            {field('newPassword', 'New Password', 'next', 'new-password')}
            {field('confirmPassword', 'Confirm New Password', 'confirm', 'new-password')}

            <p className="text-xs text-slate-500">
              Use at least 8 characters. Choose a strong password you don't use elsewhere.
            </p>

            {serverError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-red-700">{serverError}</p>
              </div>
            )}

            {done && (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <CheckCircle size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-emerald-700">
                  Password updated successfully. Use your new password next time you sign in.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`gap-2 min-w-[170px] ${
                  done ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : done ? (
                  <CheckCircle size={16} />
                ) : (
                  <Save size={16} />
                )}
                {isSubmitting ? 'Updating…' : done ? 'Updated!' : 'Update Password'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.form>
    </div>
  );
};

export default ChangePasswordPage;
