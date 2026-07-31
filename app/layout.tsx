import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "李博楠｜AI 视频编导",
  description:
    "李博楠的个人作品网站：从传播洞察、脚本分镜，到角色设定、AI 生成、剪辑与发布，独立闭环完成 AI 视频创作。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "李博楠｜AI 视频编导",
    description: "AI 让奇思妙想触手可及。而我，是那个懂得如何挥动魔杖的人。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "李博楠 AI 视频编导" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "李博楠｜AI 视频编导",
    description: "AI 让奇思妙想触手可及。",
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
