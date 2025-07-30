import { UpgradePageClient } from '@/components/features';

interface PageProps {
  params: {
    locale: string;
  };
}

// 这是升级页面的服务端入口
// 它非常简单，只负责渲染客户端组件
export default function UpgradePage() {
  return <UpgradePageClient />;
}