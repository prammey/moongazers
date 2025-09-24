'use client';

import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();

  const handleBackToMain = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white">
      <AdminDashboard onBackToMain={handleBackToMain} />
    </div>
  );
}