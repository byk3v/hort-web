"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, message, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { getGroups } from "@/src/features/groups/api";
import {GroupDTO} from "@/src/types/group";

const { Title, Text } = Typography;

export default function GroupsClient() {
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<GroupDTO[]>([]);
    const [q, setQ] = useState<string>(""); // filtro simple por nombre

    const load = async () => {
        try {
            setLoading(true);
            const data = await getGroups();
            // filtro en cliente (si quieres filtro en BE, cambia a params)
            const filtered = q
                ? data.filter((g) =>
                    g.name.toLowerCase().includes(q.trim().toLowerCase())
                )
                : data;
            setRows(filtered);
        } catch (e) {
            console.error(e);
            message.error("Fehler beim Laden der Gruppenliste");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSearch = () => load();

    const columns: ColumnsType<GroupDTO> = useMemo(
        () => [
            {
                title: "ID",
                dataIndex: "id",
                key: "id",
                width: 120,
                sorter: (a, b) => a.id - b.id,
            },
            {
                title: "Name",
                dataIndex: "name",
                key: "name",
                sorter: (a, b) => a.name.localeCompare(b.name),
                render: (v: string) => <Text>{v}</Text>,
            },
        ],
        []
    );

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={3} style={{ margin: 0 }}>
                Gruppen
            </Title>

            {/* Barra de filtros */}
            <Space wrap>
                <Input
                    allowClear
                    placeholder="Gruppenname"
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
            <Table<GroupDTO>
                rowKey={(r) => r.id}
                loading={loading}
                columns={columns}
                dataSource={rows}
                pagination={{ pageSize: 10, showSizeChanger: true }}
            />
        </Space>
    );
}
