'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Package {
  id: string;
  name: string;
  price: number;
  credits: number;
  description: string;
}

export default function UpgradePageClient() {
  const t = useTranslations('UpgradePage');
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [session, setSession] = useState<any>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSessionAndPackages = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        try {
          const response = await fetch('/api/packages');
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setPackages(data);
        } catch (err) {
          setError(t('loginPrompt')); // Re-use for generic error
        }
      }
      setLoading(false);
    };

    getSessionAndPackages();
  }, [supabase, t]);

  const handlePurchase = async (packageId: string) => {
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ packageId }),
    });

    if (response.ok) {
      const { approval_url } = await response.json();
      window.location.href = approval_url;
    } else {
      console.error('Failed to create payment');
      // Handle error, show message to user
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Progress value={50} className="w-1/2" /></div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg mb-4">{t('loginPrompt')}</p>
        <Button onClick={() => router.push('/login')}>{t('loginButton')}</Button>
      </div>
    );
  }
  
  if (error) {
     return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('description')}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${pkg.price}</p>
              <p className="text-muted-foreground">{pkg.credits} credits</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handlePurchase(pkg.id)}>
                {t('purchaseButton')}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}