'use client';

import {useEffect, useMemo, useState, useCallback} from 'react';
import {Button, Input, InputNumber, message, Space, Table, Tag, Tooltip, Typography} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import {PlusOutlined, ReloadOutlined, SearchOutlined} from '@ant-design/icons';
import {CollectorDTO, StudentDTO} from "@/src/types/student";
import {getStudents} from "@/src/features/students/api";
import AddStudentModal from "./AddStudentModal";

const {Title, Text} = Typography;

export default function StudentsClient() {
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<StudentDTO[]>([]);
    const [name, setName] = useState<string>('');
    const [groupId, setGroupId] = useState<number | undefined>(undefined);
    const [openAdd, setOpenAdd] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getStudents({ name: name || undefined, groupId });
            setRows(data);
        } catch (e) {
            console.error(e);
            message.error('Fehler beim Laden der Schülerliste');
        } finally {
            setLoading(false);
        }
    }, [name, groupId]);

    useEffect(() => { load(); }, [load]);

    const onSearch = () => load();

    const onReset = () => {
        setName('');
        setGroupId(undefined);
        setTimeout(load, 0);
    };

    const columns: ColumnsType<StudentDTO> = useMemo(
        () => [
            {
                title: 'Name',
                key: 'name',
                render: (_, r) => (
                    <span>
            {r.firstName} {r.lastName}
          </span>
                ),
                sorter: (a, b) =>
                    (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
            },
            {
                title: 'Gruppe',
                dataIndex: 'group',
                key: 'group',
                width: 140,
            },
            {
                title: 'Adresse',
                dataIndex: 'address',
                key: 'address',
                ellipsis: true,
            },
            {
                title: 'Allein gehen?',
                dataIndex: 'canLeaveAlone',
                key: 'canLeaveAlone',
                width: 140,
                render: (v: boolean | undefined) => v ? <Tag color="green">Ja</Tag> : <Tag>Nein</Tag>,
            },
            {
                title: 'Berechtigte Abholer',
                key: 'collectorsCount',
                width: 180,
                render: (_, r) => <Text>{r.collectors?.length ?? 0}</Text>,
            },
        ],
        []
    );

    const renderCollectorsTable = (collectors: CollectorDTO[]) => {
        const cCols: ColumnsType<CollectorDTO> = [
            {title: 'Vorname', dataIndex: 'firstName', key: 'firstName', width: 160},
            {title: 'Nachname', dataIndex: 'lastName', key: 'lastName', width: 160},
            {title: 'Telefon', dataIndex: 'phone', key: 'phone', width: 160},
            {title: 'Adresse', dataIndex: 'address', key: 'address', ellipsis: true},
        ];
        return (
            <Table<CollectorDTO>
                size="small"
                columns={cCols}
                dataSource={(collectors || []).map((c, i) => ({...c, key: i}))}
                pagination={false}
            />
        );
    };

    return (
        <Space direction="vertical" size="large" style={{width: '100%'}}>
            <Title level={3} style={{margin: 0}}>
                Schüler
            </Title>

            {/* Barra de filtros */}
            <Space wrap>
                <Input
                    allowClear
                    placeholder="Name (Vor- oder Nachname)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onPressEnter={onSearch}
                    style={{width: 260}}
                    prefix={<SearchOutlined/>}
                />
                <InputNumber
                    placeholder="groupId"
                    value={groupId}
                    onChange={(v) =>
                        setGroupId(typeof v === 'number' ? v : undefined)
                    }
                    style={{width: 160}}
                />
                <Button type="primary" icon={<SearchOutlined/>} onClick={onSearch}>
                    Suchen
                </Button>
                <Tooltip title="Filter & Tabelle zurücksetzen">
                    <Button icon={<ReloadOutlined/>} onClick={onReset}/>
                </Tooltip>
                <Button type="primary" icon={<PlusOutlined/>} onClick={() => setOpenAdd(true)}>
                    Schüler hinzufügen
                </Button>
            </Space>

            {/* Tabla principal */}
            <Table<StudentDTO>
                rowKey={(r) => r.id}
                loading={loading}
                columns={columns}
                dataSource={rows}
                expandable={{
                    expandedRowRender: (record) =>
                        renderCollectorsTable(record.collectors || []),
                    rowExpandable: (record) =>
                        (record.collectors?.length || 0) > 0,
                }}
                pagination={{pageSize: 10, showSizeChanger: true}}
            />
            <AddStudentModal
                open={openAdd}
                onCloseAction={() => setOpenAdd(false)}
                onCreatedAction={load}
            />
        </Space>
    );
}