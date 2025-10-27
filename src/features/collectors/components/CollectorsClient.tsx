"use client";

import {useEffect, useMemo, useState} from "react";
import {Button, Input, message, Space, Table, Typography} from "antd";
import type {ColumnsType} from "antd/es/table";
import {ReloadOutlined, SearchOutlined} from "@ant-design/icons";
import {getCollectors} from "@/src/features/collectors/api";
import {CollectorDTO} from "@/src/types/student";

const { Title } = Typography;

export default function CollectorsClient() {
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<CollectorDTO[]>([]);
    const [q, setQ] = useState<string>(""); // filtro simple por nombre

    const load = async () => {
        try {
            setLoading(true);
            const data = await getCollectors();
            // filtro en cliente (si quieres filtro en BE, cambia a params)
            const filtered = q
                ? data.filter((c) =>
                    c.firstName.toLowerCase().includes(q.trim().toLowerCase())
                )
                : data;
            setRows(filtered);
        } catch (e) {
            console.error(e);
            message.error("Fehler beim Laden der Collectors liste");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSearch = () => load();

    const columns: ColumnsType<CollectorDTO> = useMemo(
        () => [
            {
                title: "ID",
                dataIndex: "id",
                key: "id",
                width: 120,
                sorter: (a, b) => a.id - b.id,
            },
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
                title: 'Adresse',
                dataIndex: 'address',
                key: 'address',
                ellipsis: true,
            },
            {
                title: 'Phone',
                dataIndex: 'phone',
                key: 'phone',
                ellipsis: true,
            },
        ],
        []
    );

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={3} style={{ margin: 0 }}>
                Abholer
            </Title>

            {/* Barra de filtros */}
            <Space wrap>
                <Input
                    allowClear
                    placeholder="Abholer Name"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onPressEnter={onSearch}
                    style={{ width: 260 }}
                    prefix={<SearchOutlined />}
                />
                <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
                    Suchen
                </Button>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                        setQ("");
                        setTimeout(load, 0);
                    }}
                />
            </Space>

            {/* Tabla */}
            <Table<CollectorDTO>
                rowKey={(r) => r.id}
                loading={loading}
                columns={columns}
                dataSource={rows}
                pagination={{ pageSize: 10, showSizeChanger: true }}
            />
        </Space>
    );
}
