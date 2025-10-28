"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Table, Input, Space, Tag, Typography, message, Button} from "antd";
import type {ColumnsType} from "antd/es/table";
import dayjs from "dayjs";
import {CheckoutCollectorInfo, CheckoutStudentInfo} from "@/src/types/CheckoutSearchResponse";
import {
    confirmCheckoutWithCollector,
    confirmSelfDismissal,
    searchStudentForCheckout
} from "@/src/features/checkout/api";
import {LogoutOutlined, UserOutlined} from "@ant-design/icons";

const {Title, Text} = Typography;

export default function CheckoutClient() {
    const [query, setQuery] = useState("");
    const [rows, setRows] = useState<CheckoutStudentInfo[]>([]);
    const [loading, setLoading] = useState(false);

    // guardamos último timer para debounce
    const debounceRef = useRef<number | null>(null);

    const fetchData = useCallback(async (q: string) => {
        if (q.length < 2) {
            setRows([]);
            return;
        }
        try {
            setLoading(true);
            const data = await searchStudentForCheckout(q);
            setRows(data.students ?? []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    // disparar búsqueda con debounce cada vez que query cambie
    useEffect(() => {
        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
        }
        debounceRef.current = window.setTimeout(() => {
            fetchData(query.trim());
        }, 300); // 300ms debounce
        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
            }
        };
    }, [query, fetchData]);

    // Helpers para acciones
    const handleCollectorCheckout = async (
        student: CheckoutStudentInfo,
        collector: CheckoutCollectorInfo
    ) => {
        try {
            await confirmCheckoutWithCollector(student.studentId, collector);
            message.success(
                `${collector.firstName} ${collector.lastName} hat ${student.firstName} ${student.lastName} abgeholt`
            );
            setRows(prev =>
                prev.map(s =>
                    s.studentId === student.studentId
                        ? {...s, checkedOutToday: true}
                        : s
                )
            );

            // Refresca en segundo plano
            setTimeout(() => fetchData(query.trim()), 1000);
        } catch (e) {
            console.error(e);
            message.error("Fehler beim Checkout speichern");
        }
    };

    const handleSelfCheckout = async (student: CheckoutStudentInfo) => {
        try {
            await confirmSelfDismissal(student.studentId);
            message.success(
                `${student.firstName} ${student.lastName} hat sich selbst abgemeldet`
            );
            setRows(prev =>
                prev.map(s =>
                    s.studentId === student.studentId
                        ? {...s, checkedOutToday: true}
                        : s
                )
            );

            setTimeout(() => fetchData(query.trim()), 1000);
        } catch (e) {
            console.error(e);
            message.error("Fehler beim Checkout speichern");
        }
    };

    const columns: ColumnsType<CheckoutStudentInfo> = useMemo(() => [
        {
            title: "Name",
            key: "name",
            render: (_, r) => (
                <Space size={8} align="center">
                <span>
          {r.firstName} {r.lastName}
                    </span>
                    {r.checkedOutToday && <Tag color="red">Schon abgemeldet</Tag>}

                </Space>
            ),
            sorter: (a, b) =>
                (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName),
        },
        {
            title: "Gruppe",
            dataIndex: "groupName",
            key: "groupName",
            width: 120,
            render: (v: string | null) => v ?? <Text type="secondary">—</Text>,
        },
        {
            title: "Allein gehen?",
            key: "canLeaveAloneToday",
            width: 180,
            render: (_, r) => {
                if (!r.canLeaveAloneToday) {
                    return <Tag>Nein</Tag>;
                }
                const fromHuman = r.allowedToLeaveFromTime
                    ? r.allowedToLeaveFromTime.slice(0, 5)
                    : "Jetzt";
                return (
                    <Space direction="vertical" size={4}>
                        <Tag color="green">Ja ab {fromHuman}</Tag>

                        {r.checkedOutToday ? (
                            <Tag color="red">Schon abgemeldet</Tag>
                        ) : (
                            <Button
                                size="small"
                                icon={<UserOutlined/>}
                                onClick={() => handleSelfCheckout(r)}
                            >
                                Selbst gehen lassen
                            </Button>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Berechtigte Abholer (heute)",
            key: "collectors",
            render: (_, r) => {
                if (!r.allowedCollectors?.length) {
                    return <Text type="secondary">—</Text>;
                }
                return (
                    <Space direction="vertical" size={6} style={{width: "100%"}}>
                        {r.allowedCollectors.map((c, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "minmax(160px, 1fr) 140px auto",
                                    alignItems: "center",
                                    columnGap: 8,
                                    rowGap: 4,
                                }}
                            >
                                <div style={{display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6}}>
                                    <Text strong>
                                        {c.firstName} {c.lastName}
                                    </Text>

                                    {c.mainCollector && <Tag color="blue">Haupt</Tag>}

                                    {c.allowedFromTime && (
                                        <Tag color="green">ab {c.allowedFromTime}</Tag>
                                    )}
                                </div>
                                <div style={{
                                    color: "rgba(0,0,0,.45)", whiteSpace: "nowrap", overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 140,
                                }}>
                                    {c.phone && (
                                        <Text type="secondary" style={{marginLeft: 4}}>
                                            {c.phone}
                                        </Text>
                                    )}
                                </div>
                                <div>
                                    {r.checkedOutToday ? (
                                        <Tag color="red">Schon abgemeldet</Tag>
                                    ) : (
                                        <Button
                                            size="small"
                                            shape="round"
                                            type="primary"
                                            icon={<LogoutOutlined/>}
                                            onClick={() => handleCollectorCheckout(r, c)}
                                        >
                                            Abmelden
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Space>
                );
            },
        },
    ], [handleCollectorCheckout, handleSelfCheckout]);

    return (
        <Space direction="vertical" size="large" style={{width: "100%"}}>
            <Title level={3} style={{margin: 0}}>
                Abmeldung
            </Title>

            {/* barra de búsqueda */}
            <Space wrap style={{width: "100%"}}>
                <Input
                    allowClear
                    autoFocus
                    placeholder="Suche nach Name oder Gruppe (z.B. 'so', 'mül', '3t')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{width: 320}}
                />
                <Text type="secondary">
                    Tippe mind. 2 Zeichen. Suche läuft automatisch.
                </Text>
            </Space>

            {/* tabla de resultados */}
            <Table<CheckoutStudentInfo>
                rowKey={(r) => r.studentId}
                loading={loading}
                columns={columns}
                dataSource={rows}
                pagination={{pageSize: 10, showSizeChanger: true}}
            />
        </Space>
    );
}
