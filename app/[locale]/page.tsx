import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/Container';
import { QuoteCard } from '@/components/ui/QuoteCard';
import { getRandomQuote } from '@/lib/quotes';
import { MessageSquareHeart } from 'lucide-react';

export default function Home({ params }: { params: { locale: string } }) {
  const t = useTranslations('Index');
  const { locale } = params;
  
  // 获取一条随机句子作为初始数据
  const initialQuote = getRandomQuote();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Container className="py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            {t('title')}
          </h1>
          <div className="mt-16 flex justify-center">
            <QuoteCard 
              initialQuote={initialQuote} 
              locale={locale} 
            />
          </div>
          
          {/* 树洞功能入口 */}
          <div className="mt-16">
            <Link 
              href={`/${locale}/tree-hole`}
              className="inline-block p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl backdrop-blur-sm bg-opacity-70 dark:bg-opacity-70 border border-white/20 hover:shadow-2xl transition-shadow"
            >
              <div className="flex flex-col items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                  <MessageSquareHeart size={32} className="text-purple-600 dark:text-purple-300" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('treeHoleCard')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
                  {t('treeHoleDescription')}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}