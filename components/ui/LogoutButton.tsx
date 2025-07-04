// 路径: components/ui/LogoutButton.tsx

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const locale = useLocale();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  );
}