'use client';

import {Layout, Menu, theme} from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    ClockCircleOutlined, HomeOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

const {Header, Sider, Content} = Layout;

export default function AppShell({children}: { children: React.ReactNode }) {
    const {token: {colorBgContainer}} = theme.useToken();
    const pathname = usePathname();

    const selectedKey =
        pathname.startsWith('/students') ? 'students' :
        pathname.startsWith('/collectors') ? 'collectors' :
        pathname.startsWith('/checkout') ? 'checkout' : 'home';

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider collapsible>
                <div style={{height: 48, margin: 16, color: 'white', fontWeight: 600}}>
                    HortApp
                </div>
                <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}

                    items={[
                    { key: 'home', icon: <HomeOutlined />, label: <Link href="/">Start</Link> },
                    { key: 'students', icon: <TeamOutlined />, label: <Link href="/students">Schülern</Link> },
                    { key: 'collectors', icon: <UserOutlined />, label: <Link href="/collectors">Abholer</Link> },
                    { key: 'checkout', icon: <ClockCircleOutlined />, label: <Link href="/checkout">Abmeldung</Link> },
                ]}
                />
            </Sider>
            <Layout>
                <Header style={{ background: colorBgContainer, padding: '0 16px' }}>
                    <h2 style={{ margin: 0 }}>Panel Hort</h2>
                </Header>
                <Content style={{ margin: 16 }}>
                    <div style={{ padding: 16, minHeight: 360, background: colorBgContainer }}>
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
