import type { Metadata } from "next";
import { Noto_Sans_Lao } from "next/font/google"; // [!code focus] ເອີ້ນໃຊ້ Noto Sans Lao
import "./globals.css";

// ຕັ້ງຄ່າ Font Noto Sans Lao
const notoSansLao = Noto_Sans_Lao({
  subsets: ["lao"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-noto-lao",
});

export const metadata: Metadata = {
  title: "GFMS - ລະບົບຄຸ້ມຄອງການເງິນ ແລະ ຊັບສິນ",
  description: "Government Financial Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lo">
      <body className={`${notoSansLao.className} antialiased bg-slate-50 text-slate-800`}>
        {children}
      </body>
    </html>
  );
}