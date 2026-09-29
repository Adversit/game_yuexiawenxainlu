import type { Metadata } from "next";

export const metadata: Metadata = { title: "月下问仙录 · 文字修仙模拟器", description: "拾起照夜残镜，在山海间修行、结缘、收徒、渡劫。每一道选择，都会留在你的仙途里。", icons: { icon: "/favicon.svg" } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><head><link rel="stylesheet" href="/style.css" /></head><body>{children}</body></html>;
}
