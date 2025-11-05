'use client';

import {Layout, Avatar, Dropdown} from 'antd';
import {
    BellOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/src/lib/auth/KeycloakProvider';
import styles from './HeaderBar.module.css';

const {Header} = Layout;

export type HeaderBarProps = {
    title?: string;
};

export default function HeaderBar({title = 'Panel Hort'}: HeaderBarProps) {
    const { authenticated, user, login, logout } = useAuth();
    const displayName = (user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'Gast');

    const handleMenuClick = ({ key }: { key: string }) => {
        if (key === 'logout') {
            logout();
        } else if (key === 'login') {
            login();
        }
    };

    const items = authenticated ? [
        { key: 'profile', icon: <UserOutlined />, label: 'Mein Profil' },
        { key: 'settings', icon: <SettingOutlined />, label: 'Einstellungen' },
        { type: 'divider' as const },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Abmelden' },
    ] : [
        { key: 'login', icon: <UserOutlined />, label: 'Anmelden' }
    ];

    return (
        <Header className={styles.headerRoot}>
            <h2 className={styles.title}>{title}</h2>

            <div className={styles.actions}>
                <button className={styles.iconButton} aria-label="Benachrichtigungen">
                    <BellOutlined />
                </button>

                <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight" trigger={['click']}>
                    <button className={styles.userButton}>
                        <Avatar
                            size="small"
                            icon={<UserOutlined />}
                            className={styles.avatar}
                        />
                        <span className={styles.userName}>{displayName}</span>
                    </button>
                </Dropdown>
            </div>
        </Header>
    );
}
