import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "李博楠｜AI 视频编导 × AI Native Creator",
  description:
    "李博楠的个人作品网站：以 AI Native 的方式完成视频创作、工具编排、Skill 工作流与可运行产品探索。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "李博楠｜AI 视频编导 × AI Native Creator",
    description: "从一个想法出发，把它推进成内容、工作流，甚至一件真正可以运行的产品。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "李博楠 AI 视频编导" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "李博楠｜AI 视频编导 × AI Native Creator",
    description: "用 AI 把想法推进到真实世界。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
