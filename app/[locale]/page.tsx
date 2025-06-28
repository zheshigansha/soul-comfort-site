import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/Container';
import { Navbar } from '@/components/ui/Navbar';
import { QuoteCard } from '@/components/ui/QuoteCard';
import { getRandomQuote } from '@/lib/quotes';

export default function Home({ params }: { params: { locale: string } }) {
  const t = useTranslations('Index');
  const { locale } = params;
  
  // 获取一条随机句子
  const quote = getRandomQuote();
  
  // 刷新函数，获取新的随机句子
  const refreshQuote = () => {
    return getRandomQuote();
  };

  return (
    <>
      <Navbar locale={locale} />
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Container className="py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              {t('title')}
            </h1>
            <div className="mt-16 flex justify-center">
              <QuoteCard 
                initialQuote={quote} 
                locale={locale} 
                onRefresh={refreshQuote} 
              />
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}