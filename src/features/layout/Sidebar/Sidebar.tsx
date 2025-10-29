'use client';

import {Layout, Menu} from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    ClockCircleOutlined,
    HomeOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import styles from './Sidebar.module.css';

const {Sider} = Layout;

export type SidebarProps = {
    collapsed: boolean;
    onToggle(): void;
};

export default function Sidebar({collapsed, onToggle}: SidebarProps) {
    const pathname = usePathname();

    // lógica para saber qué key está activa
    const selectedKey =
        pathname.startsWith('/students') ? 'students' :
            pathname.startsWith('/collectors') ? 'collectors' :
                pathname.startsWith('/permissions') ? 'permissions' :
                    pathname.startsWith('/groups') ? 'groups' :
                        pathname.startsWith('/checkout') ? 'checkout' : 'home';

    return (
        <Sider
            width={220}
            collapsible
            collapsed={collapsed}
            trigger={null} // controlado desde afuera
        >
            <div className={styles.siderHeader}>
                {!collapsed && <span className={styles.logo}>HortApp</span>}
                <button
                    className={styles.toggleButton}
                    onClick={onToggle}
                    aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
                >
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>
            </div>

            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                items={[
                    {key: 'home', icon: <HomeOutlined/>, label: <Link href="/">Start</Link>},
                    {key: 'groups', icon: <TeamOutlined/>, label: <Link href="/groups">Gruppen</Link>},
                    {key: 'students', icon: <TeamOutlined/>, label: <Link href="/students">Schülern</Link>},
                    {key: 'collectors', icon: <UserOutlined/>, label: <Link href="/collectors">Abholer</Link>},
                    {key: 'permissions', icon: <UserOutlined/>, label: <Link href="/permissions">Vollmächte</Link>},
                    {key: 'checkout', icon: <ClockCircleOutlined/>, label: <Link href="/checkout">Abmeldung</Link>},
                ]}
            />
        </Sider>
    );
}
