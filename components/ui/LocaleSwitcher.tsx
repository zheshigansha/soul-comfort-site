// 路径: components/ui/LocaleSwitcher.tsx

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react'; // Icon for the button

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    // The pathname includes the locale, so we need to remove it first
    const newPath = `/${newLocale}${pathname.substring(3)}`;
    router.replace(newPath);
  };

  return (
    <Button variant="ghost" size="icon" onClick={switchLocale}>
      <Globe className="w-5 h-5" />
      <span className="sr-only">Switch language</span>
    </Button>
  );
}