// 路径: components/ui/Navbar.tsx

import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { useTranslations } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { Button } from './button'; // 确保你的项目中 Button 组件路径正确
import LogoutButton from './LogoutButton'; // 我们马上会创建这个文件
import LocaleSwitcher from './LocaleSwitcher'; // 确保语言切换组件路径正确

export async function Navbar() {
  const t = useTranslations('Navigation');
  const locale = await getLocale();

  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center h-14 max-w-screen-2xl">
        <div className="flex items-center mr-4">
          <Link href="/" className="mr-6 font-bold">
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