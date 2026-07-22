import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Info } from 'lucide-react';
import authService from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

const schema = z.object({
  cellId: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;



const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 800));
    const result = await authService.login(data);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };



  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row items-stretch">
      {/* Left – Branding */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 lg:p-20">
        <div className="max-w-md w-full flex flex-col items-center text-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/0/01/Parul_University_logo.svg"
            alt="Parul University"
            className="w-72 h-auto mb-10"
          />
          <h2 className="text-[28px] font-bold text-[#1e5bce] mb-8 tracking-tight">
            Respective Cell Portal
          </h2>
          <div className="w-12 h-1 bg-slate-200 mb-8 rounded-full" />
          <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-sm mx-auto">
            Centralized workspace for Respective Cell Coordinators to manage assigned students, conduct training, submit evaluations, and process final internship confirmations.
          </p>
        </div>
      </div>

      {/* Right – Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative bg-slate-50/30 md:bg-white">
        {/* Mobile Logo Fallback */}
        <div className="md:hidden flex flex-col items-center text-center mb-10">
          <img
            src="https://upload.wikimedia.org/wikipedia/en/0/01/Parul_University_logo.svg"
            alt="Parul University"
            className="w-56 h-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-[#1e5bce] tracking-tight">Cell Portal</h2>
        </div>

        <Card className="w-full max-w-md shadow-2xl shadow-blue-900/5 border-slate-100/60 bg-white rounded-2xl">
          <CardContent className="p-8 sm:p-10">
            <div className="mb-8">
              <h3 className="text-[22px] font-extrabold text-slate-900 mb-2">Sign In</h3>
              <p className="text-sm text-slate-500 font-medium">Continue to your department portal account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cellId" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </span>
                  <Input
                    id="cellId"
                    {...register('cellId')}
                    placeholder="coordinator@paruluniversity.ac.in"
                    type="email"
                    className="h-11 pl-10 bg-slate-50/50 border-slate-200 focus-visible:bg-white rounded-xl text-sm"
                  />
                </div>
                {errors.cellId && <p className="text-xs font-medium text-red-500 mt-1">{errors.cellId.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</Label>
                  <button type="button" className="text-xs font-semibold text-[#1e5bce] hover:text-blue-700">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </span>
                  <Input
                    id="password"
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="h-11 pl-10 pr-10 bg-slate-50/50 border-slate-200 focus-visible:bg-white rounded-xl text-sm font-medium tracking-widest placeholder:tracking-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center gap-2.5 pt-1 pb-1">
                <Checkbox id="rememberMe" {...register('rememberMe')} className="rounded border-slate-300 w-4 h-4" />
                <Label htmlFor="rememberMe" className="text-sm font-medium text-slate-600 cursor-pointer">
                  Keep me signed in
                </Label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-bold bg-[#1e5bce] hover:bg-[#1a4db3] mt-2 rounded-xl shadow-md shadow-blue-900/10 transition-all"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <span className="flex items-center justify-center w-full relative">
                    Continue
                    <svg className="absolute right-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </span>
                )}
              </Button>
            </form>


          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-end gap-2 text-[11px] font-semibold text-slate-500">
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Help Desk</a>
          </div>
          <span className="text-slate-400 font-medium">© 2026 Parul University. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
