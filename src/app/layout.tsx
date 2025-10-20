import type { Metadata } from 'next';
import { ConfigProvider } from 'antd';
import '../styles/globals.css';
import AppShell from "@/src/components/layout/AppShell";

export const metadata: Metadata = { title: 'HortApp', description: 'Panel Hort' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
        <body>
        <ConfigProvider>
            <AppShell>{children}</AppShell>
        </ConfigProvider>
        </body>
        </html>
    );
}