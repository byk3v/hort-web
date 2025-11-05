'use client';

import {Layout, theme} from 'antd';
import {useState} from 'react';
import Sidebar from "@/src/features/layout/Sidebar/Sidebar";
import HeaderBar from "@/src/features/layout/HeaderBar/HeaderBar";

const {Content} = Layout;

export default function AppShell({children}: { children: React.ReactNode }) {
    const {token: {colorBgContainer}} = theme.useToken();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
            />

            <Layout>
                <HeaderBar title="Panel Hort" />

                <Content style={{margin: 16}}>
                    <div
                        style={{
                            padding: 16,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: 8,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        }}
                    >
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
