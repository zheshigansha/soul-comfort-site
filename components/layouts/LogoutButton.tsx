'use client';

// 暂时注释掉Supabase相关导入
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useLocale, useTranslations } from 'next-intl';

export function LogoutButton() {
  const router = useRouter();
  // const supabase = createClientComponentClient();
  const locale = useLocale();
  const t = useTranslations('Navigation');

  const handleLogout = async () => {
    // 暂时注释掉Supabase登出
    // await supabase.auth.signOut();
    
    // 只进行页面跳转
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      {t('logout')}
    </Button>
  );
} 