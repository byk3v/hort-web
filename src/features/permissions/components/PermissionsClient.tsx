'use client';

import {useEffect, useState, useMemo, useCallback} from "react";
import {Table, Tag, Typography, Space, Select, Button, message} from "antd";
import type {ColumnsType} from "antd/es/table";
import dayjs from "dayjs";
import {fetchPermissions} from "../api";
import {PermissionViewDto} from "@/src/types/PermissionViewDto";
import AddPermissionModal from "@/src/features/permissions/components/AddPermissionModal";

const {Title, Text} = Typography;

export default function PermissionsClient() {
    const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "ALL">("ACTIVE");
    const [rows, setRows] = useState<PermissionViewDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [openNew, setOpenNew] = useState(false);

    const loadPermissions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchPermissions(statusFilter);
            setRows(data);
        } catch (err) {
            console.error(err);
            message.error("Fehler beim Laden der Vollmachten");
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    const columns: ColumnsType<PermissionViewDto> = useMemo(() => [
        {
            title: "Schüler",
            key: "student",
            render: (_, r) => (
                <Space direction="vertical" size={0}>
                    <span>{r.studentFirstName} {r.studentLastName}</span>
                    <Text type="secondary">{r.studentGroupName ? `${r.studentGroupName}` : "—"}</Text>
                </Space>
            ),
            sorter: (a, b) =>
                (a.studentLastName + a.studentFirstName)
                    .localeCompare(b.studentLastName + b.studentFirstName),
        },
        {
            title: "Abholer",
            key: "collector",
            render: (_, r) => {
                if (r.permissionKind === "SELF_DISMISSAL") {
                    return (
                        <Space direction="vertical" size={0}>
                            <Tag color="purple">Selbst</Tag>
                            {r.allowedFromTime && (
                                <Text type="secondary">
                                    ab {r.allowedFromTime} Uhr
                                </Text>
                            )}
                        </Space>
                    );
                }
                return (
                    <Space direction="vertical" size={0}>
                        <span>{r.collectorFirstName} {r.collectorLastName}</span>
                        <Text type="secondary">{r.collectorPhone ?? ""}</Text>
                    </Space>
                );
            },
        },
        {
            title: "Zeitraum",
            key: "range",
            render: (_, r) => {
                const from = r.validFrom ? dayjs(r.validFrom).format("DD.MM.YYYY HH:mm") : "—";
                const until = r.validUntil ? dayjs(r.validUntil).format("DD.MM.YYYY HH:mm") : "∞";
                return (
                    <Space direction="vertical" size={0}>
                        <span>{from} – {until}</span>
                        {r.allowedFromTime && (
                            <Text type="secondary">ab {r.allowedFromTime} Uhr</Text>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (v, r) => (
                r.status === "ACTIVE"
                    ? <Tag color="green">Aktiv</Tag>
                    : <Tag>Inaktiv</Tag>
            ),
            filters: [
                {text: "Aktiv", value: "ACTIVE"},
                {text: "Inaktiv", value: "INACTIVE"},
            ],
            onFilter: (value, rec) => rec.status === value,
        },
        {
            title: "Typ",
            dataIndex: "permissionKind",
            key: "kind",
            render: (kind) => kind === "SELF_DISMISSAL"
                ? <Tag color="purple">Allein gehen</Tag>
                : <Tag color="blue">Abholer</Tag>,
            filters: [
                {text: "Abholer", value: "COLLECTOR"},
                {text: "Allein gehen", value: "SELF_DISMISSAL"},
            ],
            onFilter: (value, rec) => rec.permissionKind === value,
            width: 140,
        },
    ], []);

    return (
        <Space direction="vertical" size="large" style={{width: "100%"}}>
            <Title level={3} style={{margin: 0}}>Vollmachten</Title>

            <Space>
                <Text type="secondary">Filter Status:</Text>
                <Select<"ACTIVE" | "ALL">
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                        {value: "ACTIVE", label: "Nur aktive"},
                        {value: "ALL", label: "Alle"},
                    ]}
                    style={{width: 160}}
                />
                <Button
                    type="primary"
                    onClick={() => setOpenNew(true)}
                >
                    Neue Vollmacht
                </Button>
            </Space>

            <Table<PermissionViewDto>
                rowKey={(r) => `${r.permissionKind}-${r.permissionId}`}
                loading={loading}
                columns={columns}
                dataSource={rows}
                pagination={{pageSize: 10, showSizeChanger: true}}
            />
            {openNew && (
                <AddPermissionModal
                    open={openNew}
                    onCloseAction={() => setOpenNew(false)}
                    onCreatedAction={async () => {
                        setOpenNew(false);
                        await loadPermissions();
                    }}
                />
            )}
        </Space>
    );
}