// 路径: components/ui/Navbar.tsx

import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
// 关键改动：导入 getTranslations 和 getLocale，而不是 useTranslations
import { getTranslations, getLocale } from 'next-intl/server'; 
import { Button } from './button';
import LogoutButton from './LogoutButton';
import LocaleSwitcher from './LocaleSwitcher';

export async function Navbar() {
  // 关键改动：使用 await getTranslations() 在服务端获取翻译函数
  const t = await getTranslations('Navigation');
  const locale = await getLocale();

  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center h-14 max-w-screen-2xl">
        <div className="flex items-center mr-4">
          <Link href={`/${locale}`} className="mr-6 font-bold">
            Soul Comfort
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href={`/${locale}`}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t('home')}
            </Link>
            <Link
              href={`/${locale}/tree-hole`}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {t('treeHole')}
            </Link>
            <Link
              href={`/${locale}/upgrade`}
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Upgrade
            </Link>
          </nav>
        </div>
        <div className="flex items-center justify-end flex-1 gap-4">
          <LocaleSwitcher />
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <LogoutButton />
            </div>
          ) : (
            <Button asChild>
              <Link href={`/${locale}/login`}>Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}