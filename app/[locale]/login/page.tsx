'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LoginPage({ params }: { params: { locale: string } }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const t = useTranslations('Login');

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // 恢复使用 router.push 进行客户端导航，并用 router.refresh() 
        // 来触发服务端组件（如Navbar）的刷新，这是更优的实践
        router.push(`/${params.locale}`);
        router.refresh();
      }
    });

    // Unsubscribe on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, params.locale]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {t('title')}
        </h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          theme="default"
          localization={{
            variables: {
              sign_in: {
                email_label: t('email_label'),
                password_label: t('password_label_signin'),
                email_input_placeholder: t('email_placeholder'),
                password_input_placeholder: t('password_placeholder'),
                button_label: t('button_signin'),
                social_provider_text: params.locale === 'zh' ? '通过 {{provider}} 登录' : 'Sign in with {{provider}}',
                link_text: t('link_signin'),
              },
              sign_up: {
                email_label: t('email_label'),
                password_label: t('password_label_signup'),
                button_label: t('button_signup'),
                link_text: t('link_signup'),
              },
              forgotten_password: {
                email_label: t('email_label'),
                button_label: t('button_forgot_password'),
                link_text: t('link_forgot_password'),
              },
              magic_link: {
                email_input_placeholder: t('email_placeholder'),
                button_label: t('button_magic_link'),
                link_text: t('link_magic_link'),
              }
            },
          }}
        />
      </div>
      <div className="mt-4">
        <Link href={`/${params.locale}`} className="text-sm text-gray-600 hover:underline dark:text-gray-400">
          {t('return_home')}
        </Link>
      </div>
    </div>
  );
}