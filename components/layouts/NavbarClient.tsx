'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl'; 
import { LocaleSwitcher } from './LocaleSwitcher';

export function NavbarClient() {
  const t = useTranslations('Navigation');
  const locale = useLocale();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center h-14 max-w-screen-2xl">
        <div className="flex items-center mr-4">
          <Link href={`/${locale}`} className="mr-6 font-bold">
            {t('siteTitle')}
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
              {t('upgrade')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center justify-end flex-1 gap-4">
          <LocaleSwitcher />
          <Link 
            href={`/${locale}/login`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('login')}
          </Link>
        </div>
      </div>
    </nav>
  );
} 