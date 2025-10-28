"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {
    Modal,
    Form,
    Radio,
    Checkbox,
    DatePicker,
    TimePicker,
    Input,
    Row,
    Col,
    Select,
    Divider,
    Button,
    message,
    Space,
    Typography, Tag, Table,
} from "antd";
import dayjs, {Dayjs} from "dayjs";
import {createNewPermission} from "@/src/features/permissions/api";
import {CheckoutStudentInfo} from "@/src/types/CheckoutSearchResponse";
import {searchStudentForCheckout} from "@/src/features/checkout/api";
import {ColumnsType} from "antd/es/table";

const { Text } = Typography;

type StudentOption = {
    value: number;
    label: string;
};

type FormValues = {
    studentId?: number;

    kind: "TAGES" | "DAUER";
    canLeaveAlone: boolean;

    // Tagesvollmacht
    tagesDate?: Dayjs;
    tagesTime?: Dayjs;

    // Dauer
    dauerFrom?: Dayjs;
    dauerUntil?: Dayjs;

    // allowed-from-time para Tages selfDismissal
    tagesAllowedFromTime?: Dayjs;

    // allowed-from-time por día (Dauer selfDismissal)
    mondayFrom?: Dayjs;
    tuesdayFrom?: Dayjs;
    wednesdayFrom?: Dayjs;
    thursdayFrom?: Dayjs;
    fridayFrom?: Dayjs;

    // Collector info (si NO puede irse solo)
    collectorFirstName?: string;
    collectorLastName?: string;
    collectorAddress?: string;
    collectorPhone?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
};

export default function AddPermissionModal({open, onClose, onCreated}: Props) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [studentResults, setStudentResults] = useState<CheckoutStudentInfo[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<CheckoutStudentInfo | null>(null);

    const debounceRef = useRef<number | null>(null);

    const kind: FormValues["kind"] = Form.useWatch("kind", form) ?? "TAGES";
    const canLeaveAlone: boolean =
        Form.useWatch("canLeaveAlone", form) ?? false;

    const doSearch = useCallback(
        async (q: string) => {
            if (q.length < 2) {
                setStudentResults([]);
                return;
            }
            try {
                setSearchLoading(true);
                const data = await searchStudentForCheckout(q);
                setStudentResults(data.students ?? []);
            } catch (err) {
                console.error(err);
            } finally {
                setSearchLoading(false);
            }
        },
        []
    );

    // disparar búsqueda con debounce cuando escribe
    useEffect(() => {
        if (!open) return;
        if (debounceRef.current) {
            window.clearTimeout(debounceRef.current);
        }
        debounceRef.current = window.setTimeout(() => {
            doSearch(searchText.trim());
        }, 300);
        return () => {
            if (debounceRef.current) {
                window.clearTimeout(debounceRef.current);
            }
        };
    }, [searchText, doSearch, open]);

    // reset modal state cuando se abre/cierra
    useEffect(() => {
        if (open) {
            // reset sólo si es un "nuevo" open
            form.resetFields();
            form.setFieldsValue({
                kind: "TAGES",
                canLeaveAlone: false,
            });
            setSearchText("");
            setStudentResults([]);
            setSelectedStudent(null);
        }
    }, [open, form]);

    // columnas de la mini tabla de búsqueda de alumno
    const studentCols: ColumnsType<CheckoutStudentInfo> = [
        {
            title: "Name",
            key: "name",
            render: (_, r) => (
                <Space direction="vertical" size={0}>
          <span>
            {r.firstName} {r.lastName}
          </span>
                    {r.checkedOutToday && <Tag color="red">Schon gegangen</Tag>}
                </Space>
            ),
        },
        {
            title: "Gruppe",
            dataIndex: "groupName",
            key: "group",
            width: 120,
            render: (g: string | null) =>
                g ? <span>{g}</span> : <Text type="secondary">—</Text>,
        },
    ];

    const handleOk = useCallback(async () => {
        try {
            await form.validateFields();
        } catch {
            return;
        }

        const values = form.getFieldsValue(true);

        // Validación de alumno seleccionado
        if (!values.studentId) {
            message.error("Bitte ein Kind auswählen.");
            return;
        }


        // Caso TAGES
    //   - necesitamos tagesDate (obligatoria)
    //   - necesitamos tagesTime (hora desde cuándo es válido)
    //
    // Caso DAUER
    //   - dauerFrom y dauerUntil son opcionales
    //
    // allowedFromTime:
    //   - TAGES + canLeaveAlone => tagesTime
    //   - DAUER + canLeaveAlone => horarios semanales
    //
    // collector:
    //   - obligatorio si canLeaveAlone === false

    // Armar fechas finales
    let validFrom: string | undefined = undefined;
    let validUntil: string | null | undefined = undefined;
    let allowedFromTime: string | undefined = undefined;
    let weeklyAllowedFrom:
        | {
        monday?: string;
        tuesday?: string;
        wednesday?: string;
        thursday?: string;
        friday?: string;
    }
        | undefined = undefined;
    let collector:
        | {
        firstName: string;
        lastName: string;
        address: string;
        phone?: string;
    }
        | undefined = undefined;

    if (kind === "TAGES") {
        // Fecha obligatoria
        if (!values.tagesDate) {
            message.error("Bitte ein Datum auswählen (Tagesvollmacht).");
            return;
        }

        // Para tagesTime: si no se define, asumimos ahora
        const startTime = values.tagesTime ?? dayjs();

        // validFrom = fecha seleccionada + hora seleccionada
        const vf = values.tagesDate
            .hour(startTime.hour())
            .minute(startTime.minute())
            .second(0);

        validFrom = vf.toISOString();

        // validUntil -> mismo día 23:59:59 (o vacío y backend decide)
        const vu = values.tagesDate
            .hour(23)
            .minute(59)
            .second(59);
        validUntil = vu.toISOString();

        if (canLeaveAlone) {
            // niño se va solo en ese horario
            allowedFromTime = startTime.format("HH:mm");
        } else {
            // adulto recoge
            collector = {
                firstName: values.collectorFirstName || "",
                lastName: values.collectorLastName || "",
                address: values.collectorAddress || "",
                phone: values.collectorPhone || "",
            };

            // si quieres forzar collectorFirstName/LastName obligatorios:
            if (!collector.firstName || !collector.lastName) {
                message.error(
                    "Bitte Abholer-Daten ausfüllen (Vorname und Nachname)."
                );
                return;
            }

            // allowed_from_time para el adulto podría ser igual que tagesTime:
            allowedFromTime = startTime.format("HH:mm");
        }
    }

    if (kind === "DAUER") {
        // dauerFrom opcional -> si no viene, backend usará 'hoy'
        if (values.dauerFrom) {
            // si definiste dauerFrom como DatePicker sin hora, uso 00:00
            validFrom = values.dauerFrom
                .hour(0)
                .minute(0)
                .second(0)
                .toISOString();
        } else {
            validFrom = undefined; // backend pondrá now
        }

        // dauerUntil opcional -> si no viene, null
        if (values.dauerUntil) {
            validUntil = values.dauerUntil
                .hour(23)
                .minute(59)
                .second(59)
                .toISOString();
        } else {
            validUntil = null;
        }

        if (canLeaveAlone) {
            // Niño puede ir solo, y se definen horas por día
            weeklyAllowedFrom = {
                monday: values.mondayFrom
                    ? values.mondayFrom.format("HH:mm")
                    : undefined,
                tuesday: values.tuesdayFrom
                    ? values.tuesdayFrom.format("HH:mm")
                    : undefined,
                wednesday: values.wednesdayFrom
                    ? values.wednesdayFrom.format("HH:mm")
                    : undefined,
                thursday: values.thursdayFrom
                    ? values.thursdayFrom.format("HH:mm")
                    : undefined,
                friday: values.fridayFrom
                    ? values.fridayFrom.format("HH:mm")
                    : undefined,
            };
        } else {
            // adulto recoge
            collector = {
                firstName: values.collectorFirstName || "",
                lastName: values.collectorLastName || "",
                address: values.collectorAddress || "",
                phone: values.collectorPhone || "",
            };
            if (!collector.firstName || !collector.lastName) {
                message.error(
                    "Bitte Abholer-Daten ausfüllen (Vorname und Nachname)."
                );
                return;
            }

            // allowed_from_time (para el adulto) podríamos pedirla o no.
            // Para simplificar, vamos a NO ponerla en Dauer si no se pide explícitamente.
            // allowedFromTime = undefined;
        }
    }
        const payload = {
            studentId: values.studentId,
            kind, // "TAGES" | "DAUER"
            canLeaveAlone,
            validFrom,
            validUntil,
            allowedFromTime, // string "HH:mm" o undefined
            collector, // o undefined
            weeklyAllowedFrom, // o undefined
        };

        try {
            setLoading(true);
            await createNewPermission(payload);
            message.success("Vollmacht erstellt");
            if (onCreated) {
                onCreated();
            } // cierra modal + refresca tabla en el padre
            form.resetFields();
        } catch (err) {
            console.error(err);
            message.error("Fehler beim Erstellen der Vollmacht");
        } finally {
            setLoading(false);
        }
    }, [form, kind, canLeaveAlone, onCreated, selectedStudent]);

    // cuando el user hace click en una fila de resultados
    const handlePickStudent = (s: CheckoutStudentInfo) => {
        setSelectedStudent(s);
        form.setFieldsValue({ studentId: s.studentId });
        message.success(
            `${s.firstName} ${s.lastName} (${s.groupName ?? "—"}) ausgewählt`
        );
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText="Speichern"
            confirmLoading={loading}
            title="Neue Vollmacht"
            width={900}
            destroyOnClose
        >
            {/* BLOQUE: búsqueda y selección del alumno */}
            <Space
                direction="vertical"
                size="middle"
                style={{
                    width: "100%",
                    marginBottom: 16,
                    padding: 12,
                    border: "1px solid #eee",
                    borderRadius: 8,
                    background: "#fafafa",
                }}
            >
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: "1 1 240px", minWidth: 240 }}>
                        <Text strong>Schüler suchen</Text>
                        <Input
                            placeholder="z.B. 'so', '1a la' ..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </div>

                    <div style={{ minWidth: 220 }}>
                        <Text strong>Ausgewählt:</Text>
                        <div style={{ minHeight: 40 }}>
                            {selectedStudent ? (
                                <Tag color="blue">
                                    {selectedStudent.firstName} {selectedStudent.lastName}{" "}
                                    ({selectedStudent.groupName ?? "—"})
                                </Tag>
                            ) : (
                                <Text type="secondary">Kein Kind ausgewählt</Text>
                            )}
                        </div>
                    </div>
                </div>

                <Table<CheckoutStudentInfo>
                    size="small"
                    rowKey={(r) => r.studentId}
                    loading={searchLoading}
                    columns={studentCols}
                    dataSource={studentResults}
                    pagination={{ pageSize: 5, showSizeChanger: false }}
                    onRow={(record) => ({
                        onClick: () => handlePickStudent(record),
                        style: { cursor: "pointer" },
                    })}
                />
            </Space>
            {/* FORMULARIO DE LA VOLLMACHT */}
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    kind: "TAGES",
                    canLeaveAlone: false,
                }}
            >
                {/* NOTA: escondemos studentId en el form (lo setea handlePickStudent) */}
                <Form.Item
                    name="studentId"
                    hidden
                    rules={[{ required: true, message: "Bitte ein Kind auswählen" }]}
                >
                    <Input type="hidden" />
                </Form.Item>

                {/* Tipo Vollmacht */}
                <Form.Item label="Art der Vollmacht" required>
                    <Form.Item name="kind" noStyle>
                        <Radio.Group>
                            <Radio value="TAGES">Tagesvollmacht</Radio>
                            <Radio value="DAUER">Dauervollmacht</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form.Item>

                {/* Puede ir solo */}
                <Form.Item
                    name="canLeaveAlone"
                    valuePropName="checked"
                >
                    <Checkbox>
                        Kind darf alleine gehen
                    </Checkbox>
                </Form.Item>

                {/* Campos condicionales TAGES */}
                {kind === "TAGES" && (
                    <>
                        <Divider>Tagesvollmacht</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="tagesDate"
                                    label="Datum"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Bitte Datum wählen",
                                        },
                                    ]}
                                >
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        format="DD.MM.YYYY"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="tagesTime"
                                    label="ab Uhrzeit"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Bitte eine Uhrzeit wählen (ab wann gilt die Vollmacht)",
                                        },
                                    ]}
                                >
                                    <TimePicker
                                        style={{ width: "100%" }}
                                        format="HH:mm"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {!canLeaveAlone && (
                            <>
                                <Divider>Abholer</Divider>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="collectorFirstName"
                                            label="Vorname"
                                            rules={[{ required: true }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="collectorLastName"
                                            label="Nachname"
                                            rules={[{ required: true }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={16}>
                                        <Form.Item
                                            name="collectorAddress"
                                            label="Adresse"
                                            rules={[{ required: true }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            name="collectorPhone"
                                            label="Telefon"
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {canLeaveAlone && (
                            <Form.Item
                                name="tagesAllowedFromTime"
                                label="Kind darf alleine gehen ab (Uhrzeit)"
                            >
                                <TimePicker
                                    style={{ width: 160 }}
                                    format="HH:mm"
                                />
                            </Form.Item>
                        )}
                    </>
                )}

                {/* Campos condicionales DAUER */}
                {kind === "DAUER" && (
                    <>
                        <Divider>Dauervollmacht</Divider>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="dauerFrom" label="Gültig ab (Datum)">
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        format="DD.MM.YYYY"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="dauerUntil" label="Gültig bis (Datum)">
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        format="DD.MM.YYYY"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        {!canLeaveAlone && (
                            <>
                                <Divider>Abholer</Divider>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="collectorFirstName"
                                            label="Vorname"
                                            rules={[{ required: true }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="collectorLastName"
                                            label="Nachname"
                                            rules={[{ required: true }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={16}>
                                        <Form.Item
                                            name="collectorAddress"
                                            label="Adresse"
                                            rules={[{ required: true }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            name="collectorPhone"
                                            label="Telefon"
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {canLeaveAlone && (
                            <>
                                <Divider>
                                    Kind darf alleine gehen (pro Wochentag)
                                </Divider>
                                <Text type="secondary">
                                    Ab welcher Uhrzeit darf das Kind alleine
                                    gehen?
                                </Text>
                                <Row gutter={16} style={{ marginTop: 12 }}>
                                    <Col span={8}>
                                        <Form.Item
                                            name="mondayFrom"
                                            label="Montag"
                                        >
                                            <TimePicker
                                                style={{ width: "100%" }}
                                                format="HH:mm"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            name="tuesdayFrom"
                                            label="Dienstag"
                                        >
                                            <TimePicker
                                                style={{ width: "100%" }}
                                                format="HH:mm"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            name="wednesdayFrom"
                                            label="Mittwoch"
                                        >
                                            <TimePicker
                                                style={{ width: "100%" }}
                                                format="HH:mm"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Form.Item
                                            name="thursdayFrom"
                                            label="Donnerstag"
                                        >
                                            <TimePicker
                                                style={{ width: "100%" }}
                                                format="HH:mm"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            name="fridayFrom"
                                            label="Freitag"
                                        >
                                            <TimePicker
                                                style={{ width: "100%" }}
                                                format="HH:mm"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </>
                )}
            </Form>

            {/* Footer extra opcional */}
            <Space
                direction="vertical"
                size={4}
                style={{ marginTop: 16 }}
            >
                <Text type="secondary" style={{ fontSize: 12 }}>
                    Hinweis:
                    {" "}
                    Tagesvollmacht = nur für einen Tag.
                    Dauervollmacht = gültig für längeren Zeitraum.
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    Wenn "Kind darf alleine gehen" aktiv ist,
                    wird eine Selbstentlassungs-Erlaubnis gespeichert.
                    Sonst wird eine Abholberechtigung gespeichert.
                </Text>
            </Space>
        </Modal>
    );
}
