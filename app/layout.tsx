import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // 这是显示在浏览器标签页上的标题
  title: "心灵慰-慰站",
  // 这是网站的描述，用于搜索引擎优化
  description: "A place to find peace and comfort.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 注意：这里的 lang 我们暂时硬编码为 "en" (英文)
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}