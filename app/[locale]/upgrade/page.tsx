import UpgradePageClient from '@/components/ui/UpgradePageClient';

interface PageProps {
  params: {
    locale: string;
  };
}

// 这是升级页面的服务端入口
// 它非常简单，只负责渲染客户端组件
export default function UpgradePage({ params }: PageProps) {
  // 将 locale 参数传递给客户端组件，以便它能正确处理翻译和路由
  return <UpgradePageClient locale={params.locale} />;
}