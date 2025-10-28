"use client";

import {useState} from "react";
import {Modal, Form, Input, Button, Checkbox, Divider, message, Row, Col} from "antd";
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {createStudentOnboarding} from "@/src/features/students/api";

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
};

export default function AddStudentModal({open, onClose, onCreated}: Props) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const collectors = values.collectors.map((c: any) => ({
                firstName: c.firstName,
                lastName: c.lastName,
                address: c.address,
                phone: c.phone,
                validFrom: "",
                validUntil: "",
                type: "COLLECTOR",
                permissionType: "PERMANENT",
                mainCollector: c.mainCollector ?? false,
            }));

            const payload = {
                student: {
                    firstName: values.student.firstName,
                    lastName: values.student.lastName,
                    address: values.student.address,
                    phone: values.student.phone || undefined,
                },
                groupId: 1, // hardcoded until definition
                collectors,
            };

            setLoading(true);
            await createStudentOnboarding(payload);
            message.success("Student successfully added!");
            form.resetFields();
            onClose();
            onCreated?.();
        } catch (err) {
            console.error(err);
            message.error("Error while saving student");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Schüler Onboarding"
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            okText="Speichern"
            confirmLoading={loading}
            width={750}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    collectors: [
                        {
                            firstName: "",
                            lastName: "",
                            address: "",
                            phone: "",
                            validRange: [dayjs(), dayjs().add(1, "month")],
                            mainCollector: true,
                        },
                    ],
                }}
            >
                {/* ---------------- STUDENT ---------------- */}
                <Divider orientation="left">Schüler</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name={["student", "firstName"]}
                            label="Vorname"
                            rules={[{required: true, message: "Required"}]}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name={["student", "lastName"]}
                            label="Nachname"
                            rules={[{required: true, message: "Required"}]}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            name={["student", "address"]}
                            label="Address"
                            rules={[{required: true, message: "Required"}]}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name={["student", "phone"]} label="Phone (optional)">
                            <Input/>
                        </Form.Item>
                    </Col>
                </Row>

                {/* ---------------- COLLECTORS ---------------- */}
                <Divider orientation="left">Abholberechtigten</Divider>

                <Form.List
                    name="collectors"
                    rules={[
                        {
                            validator: async (_, collectors) => {
                                if (!collectors || collectors.length < 1) {
                                    return Promise.reject(
                                        new Error("At least one collector is required")
                                    );
                                }
                            },
                        },
                    ]}
                >
                    {(fields, {add, remove}) => (
                        <>
                            {fields.map(({key, name, ...restField}) => (
                                <div
                                    key={key}
                                    style={{
                                        borderBottom: "1px solid #f0f0f0",
                                        marginBottom: 16,
                                        paddingBottom: 8,
                                    }}
                                >
                                    {/* Fila 1: firstName + lastName + remove button */}
                                    <Row gutter={16} align="top">
                                        <Col span={11}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "firstName"]}
                                                label="Vorname"
                                                rules={[{required: true, message: "Required"}]}
                                            >
                                                <Input/>
                                            </Form.Item>
                                        </Col>

                                        <Col span={11}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "lastName"]}
                                                label="Nachname"
                                                rules={[{required: true, message: "Required"}]}
                                            >
                                                <Input/>
                                            </Form.Item>
                                        </Col>

                                        <Col span={2} style={{display: "flex", alignItems: "center"}}>
                                            {fields.length > 1 && (
                                                <MinusCircleOutlined
                                                    onClick={() => remove(name)}
                                                    style={{color: "#ff4d4f", fontSize: 16, cursor: "pointer"}}
                                                />
                                            )}
                                        </Col>
                                    </Row>

                                    {/* Fila 2: phone + address + mainCollector */}
                                    <Row gutter={16} align="middle">
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "phone"]}
                                                label="Phone"
                                                rules={[{required: true, message: "Required"}]}
                                            >
                                                <Input/>
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, "address"]}
                                                label="Address"
                                                rules={[{required: true, message: "Required"}]}
                                            >
                                                <Input/>
                                            </Form.Item>
                                        </Col>

                                        <Col
                                            span={6}
                                            style={{
                                                display: "flex",
                                                alignItems: "end",
                                                paddingTop: 4,
                                            }}
                                        >
                                            <Form.Item
                                                {...restField}
                                                name={[name, "mainCollector"]}
                                                valuePropName="checked"
                                                style={{marginBottom: 0}}
                                            >
                                                <Checkbox>Haupt Abholer</Checkbox>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            ))}

                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                    icon={<PlusOutlined/>}
                                >
                                    Abholer hinzufügen
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

            </Form>
        </Modal>
    );
}
