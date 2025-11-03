import type { Metadata } from 'next';
import { ConfigProvider } from 'antd';
import '../styles/globals.css';
import AppShell from "@/src/features/layout/AppShell";
import { KeycloakProvider } from "@/src/lib/auth/KeycloakProvider";

export const metadata: Metadata = { title: 'HortApp', description: 'Panel Hort' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
        <body>
        <ConfigProvider>
            <KeycloakProvider config={{
                url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
                realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
                clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
            }}>
                <AppShell>{children}</AppShell>
            </KeycloakProvider>
        </ConfigProvider>
        </body>
        </html>
    );
}