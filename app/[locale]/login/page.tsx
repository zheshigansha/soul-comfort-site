'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage({ params }: { params: { locale: string } }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const t = useTranslations('Login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This effect will redirect the user if they are already logged in.
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(`/${params.locale}`);
      }
    };
    checkSession();
  }, [supabase, router, params.locale]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This is the crucial fix: specify the correct callback URL.
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    // The browser will be redirected by Supabase, so no need to set isSubmitting to false.
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      // On successful sign-in, redirect to the homepage.
      router.push(`/${params.locale}`);
      router.refresh(); // This ensures server components like Navbar are updated.
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
              {isSubmitting ? t('button_loading') : t('google_signin')}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground dark:bg-gray-800">
                  {t('or_continue_with')}
                </span>
              </div>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('email_label')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('email_placeholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t('password_label_signin')}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t('button_loading') : t('button_signin')}
              </Button>
            </form>
          </div>
          <div className="mt-4 text-center text-sm">
            {t('no_account')}{' '}
            <Link href="#" className="underline">
              {t('link_signup')}
            </Link>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4">
        <Link href={`/${params.locale}`} className="text-sm text-gray-600 hover:underline dark:text-gray-400">
          {t('return_home')}
        </Link>
      </div>
    </div>
  );
}
