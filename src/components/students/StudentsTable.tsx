'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Input, InputNumber, message, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import {CollectorDTO, StudentDTO} from "@/src/types/student";
import {api} from "@/src/libs/api";

const { Title, Text } = Typography;

export default function StudentsTable() {
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<StudentDTO[]>([]);
    const [name, setName] = useState('');
    const [groupId, setGroupId] = useState<number | undefined>(undefined);

    const load = async () => {
        try {
            setLoading(true);
            const { data } = await api.get<StudentDTO[]>('/students', {
                params: { name: name || undefined, groupId },
            });
            setRows(data);
        } catch (e) {
            console.error(e);
            message.error('Fehler beim Laden der Schülerliste');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* init */ }, []);

    const columns: ColumnsType<StudentDTO> = useMemo(() => [
        {
            title: 'Name',
            key: 'name',
            render: (_, r) => <span>{r.firstName} {r.lastName}</span>,
            sorter: (a, b) => (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
        },
        { title: 'Gruppe', dataIndex: 'group', key: 'group', width: 140 },
        { title: 'Adresse', dataIndex: 'address', key: 'address', ellipsis: true },
        {
            title: 'Allein gehen?',
            key: 'canLeaveAlone',
            width: 140,
            render: (_, r) => (<Tag color="red">Nein</Tag>),
            // render: (_, r) => (r.canLeaveAlone ? <Tag color="green">Ja</Tag> : <Tag>Nein</Tag>),
        },
        {
            title: 'Erlaubt bis',
            key: 'allowedTimeToLeave',
            width: 180,
            render: (v?: string) =>
                v ? <Text>{dayjs(v).format('YYYY-MM-DD HH:mm')}</Text> : <Text type="secondary">—</Text>,
        },
        {
            title: 'Berechtigte Abholer',
            key: 'collectorsCount',
            width: 180,
            render: (_, r) => <Text>{r.collectors?.length ?? 0}</Text>,
        },
    ], []);

    const renderCollectors = (collectors: CollectorDTO[]) => {
        const cCols: ColumnsType<CollectorDTO> = [
            { title: 'Vorname', dataIndex: 'firstName', key: 'firstName', width: 160 },
            { title: 'Nachname', dataIndex: 'lastName', key: 'lastName', width: 160 },
            { title: 'Telefon', dataIndex: 'phone', key: 'phone', width: 160 },
            { title: 'Adresse', dataIndex: 'address', key: 'address', ellipsis: true },
        ];
        return <Table columns={cCols} dataSource={(collectors||[]).map((c,i)=>({ ...c, key:i }))} size="small" pagination={false} />;
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={3} style={{ margin: 0 }}>Schüler</Title>

            <Space wrap>
                <Input
                    allowClear
                    placeholder="Name (Vor- oder Nachname)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onPressEnter={load}
                    style={{ width: 260 }}
                    prefix={<SearchOutlined />}
                />
                <InputNumber
                    placeholder="groupId"
                    value={groupId}
                    onChange={(v) => setGroupId(typeof v === 'number' ? v : undefined)}
                    style={{ width: 160 }}
                />
                <Button type="primary" icon={<SearchOutlined />} onClick={load}>Suchen</Button>
                <Button icon={<ReloadOutlined />} onClick={() => { setName(''); setGroupId(undefined); setTimeout(load,0); }} />
            </Space>

            <Table<StudentDTO>
                rowKey={(r) => r.id}
                loading={loading}
                columns={columns}
                dataSource={rows}
                expandable={{
                    expandedRowRender: (record) => renderCollectors(record.collectors || []),
                    rowExpandable: (record) => (record.collectors?.length || 0) > 0,
                }}
                pagination={{ pageSize: 10, showSizeChanger: true }}
            />
        </Space>
    );
}
