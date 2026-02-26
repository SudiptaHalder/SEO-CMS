'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginFixPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('✅ Session fixed:', session);
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email: 'user@gmail.com',
        password: 'password123',
        redirect: false,
      });
      
      if (result?.error) {
        setError('Login failed: ' + result.error);
      } else if (result?.ok) {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fix Login Session</h1>
        <p className="text-gray-600 mb-6">Use this page to reset your session and login properly</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Fix Session & Login'}
        </button>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          This will log you in as user@gmail.com with password password123
        </p>
      </div>
    </div>
  );
}
