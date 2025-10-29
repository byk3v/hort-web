'use client';

import {Layout, Avatar, Dropdown, Menu} from 'antd';
import {
    BellOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import styles from './HeaderBar.module.css';

const {Header} = Layout;

export type HeaderBarProps = {
    title?: string;
    userName?: string;
};

export default function HeaderBar({title = 'Panel Hort', userName = 'Gianny'}: HeaderBarProps) {

    const userMenu = (
        <Menu
            items={[
                { key: 'profile', icon: <UserOutlined />, label: 'Mein Profil' },
                { key: 'settings', icon: <SettingOutlined />, label: 'Einstellungen' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Abmelden' },
            ]}
        />
    );

    return (
        <Header className={styles.headerRoot}>
            <h2 className={styles.title}>{title}</h2>

            <div className={styles.actions}>
                <button className={styles.iconButton} aria-label="Benachrichtigungen">
                    <BellOutlined />
                </button>

                <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
                    <button className={styles.userButton}>
                        <Avatar
                            size="small"
                            icon={<UserOutlined />}
                            className={styles.avatar}
                        />
                        <span className={styles.userName}>{userName}</span>
                    </button>
                </Dropdown>
            </div>
        </Header>
    );
}
