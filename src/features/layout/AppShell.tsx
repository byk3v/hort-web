'use client';

import {Layout, Menu, theme} from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    ClockCircleOutlined, HomeOutlined, MenuUnfoldOutlined, MenuFoldOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from "react";
import styles from './AppShell.module.css';

const {Header, Sider, Content} = Layout;

export default function AppShell({children}: { children: React.ReactNode }) {
    const {token: {colorBgContainer}} = theme.useToken();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const selectedKey =
        pathname.startsWith('/students') ? 'students' :
            pathname.startsWith('/collectors') ? 'collectors' :
            pathname.startsWith('/permissions') ? 'permissions' :
                pathname.startsWith('/groups') ? 'groups' :
                    pathname.startsWith('/checkout') ? 'checkout' : 'home';

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider
                width={220}
                collapsible
                collapsed={collapsed}
                trigger={null}
            >
                <div className={styles.siderHeader}>
                  {!collapsed && <span className={styles.logo}>HortApp</span>}
                  <span className={styles.toggleButton} onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  </span>
                </div>
                <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}

                      items={[
                          {key: 'home', icon: <HomeOutlined/>, label: <Link href="/">Start</Link>},
                          {key: 'groups', icon: <TeamOutlined/>, label: <Link href="/groups">Gruppen</Link>},
                          {key: 'students', icon: <TeamOutlined/>, label: <Link href="/students">Schülern</Link>},
                          {key: 'collectors', icon: <UserOutlined/>, label: <Link href="/collectors">Abholer</Link>},
                          {key: 'permissions', icon: <UserOutlined/>, label: <Link href="/permissions">Vollmächte</Link>},
                          {
                              key: 'checkout',
                              icon: <ClockCircleOutlined/>,
                              label: <Link href="/checkout">Abmeldung</Link>
                          },
                      ]}
                />
            </Sider>
            <Layout>
                <Header style={{background: colorBgContainer, padding: '0 16px'}}>
                    <h2 style={{margin: 0}}>Panel Hort</h2>
                </Header>
                <Content style={{margin: 16}}>
                    <div style={{padding: 16, minHeight: 360, background: colorBgContainer}}>
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
