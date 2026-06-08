import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';
import type { LoginCredentials } from '../types';
import { LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'כתובת מייל לא תקינה' }),
  password: z.string().min(6, { message: 'הסיסמה חייבת להכיל לפחות 6 תווים' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      console.log('📤 [Login.tsx] Submitting login form with payload:', data);
      const response = await authService.login(data as LoginCredentials);
      console.log('✅ [Login.tsx] Login successful! Response:', response);
      login(response);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ [Login.tsx] Login failed!');
      console.error('❌ [Login.tsx] Error status:', error.response?.status);
      console.error('❌ [Login.tsx] Error response:', error.response?.data);
      console.error('❌ [Login.tsx] Full error:', error);
      setServerError(error.response?.data?.error || 'משהו השתבש בהתחברות לשרת');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans text-white">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-xl border border-slate-800">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <LogIn size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-400">DevSync</h1>
          <p className="mt-2 text-sm text-slate-400">מערכת ניהול משימות ו-Deployment</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center text-sm text-red-400">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">כתובת אימייל</label>
            <input type="email" {...register('email')} className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" placeholder="developer@devsync.com" />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">סיסמה</label>
            <input type="password" {...register('password')} className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {isLoading ? 'מתחבר לשרת...' : 'התחבר למערכת'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
