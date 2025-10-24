"use client";

import { useState } from "react";
import { Modal, Form, Input, Button, Space, Checkbox, DatePicker, Divider, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { createStudentOnboarding } from "@/src/features/students/api";

const { RangePicker } = DatePicker;

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
};

export default function AddStudentModal({ open, onClose, onCreated }: Props) {
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
                validFrom: dayjs(c.validRange?.[0]).format("YYYY-MM-DDTHH:mm:ss"),
                validUntil: dayjs(c.validRange?.[1]).format("YYYY-MM-DDTHH:mm:ss"),
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
                groupId: 1, // hardcoded as requested
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
            title="Add Student"
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            okText="Save"
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
                <Divider orientation="left">Student</Divider>

                <Form.Item
                    name={["student", "firstName"]}
                    label="First Name"
                    rules={[{ required: true, message: "Required" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name={["student", "lastName"]}
                    label="Last Name"
                    rules={[{ required: true, message: "Required" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name={["student", "address"]}
                    label="Address"
                    rules={[{ required: true, message: "Required" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name={["student", "phone"]} label="Phone (optional)">
                    <Input />
                </Form.Item>

                {/* ---------------- COLLECTORS ---------------- */}
                <Divider orientation="left">Abholberechtigte (Collectors)</Divider>

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
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ borderBottom: "1px solid #f0f0f0", marginBottom: 16, paddingBottom: 8 }}>
                                    <Space align="baseline" wrap style={{ width: "100%" }}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "firstName"]}
                                            label="First Name"
                                            rules={[{ required: true }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "lastName"]}
                                            label="Last Name"
                                            rules={[{ required: true }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "address"]}
                                            label="Address"
                                            rules={[{ required: true }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "phone"]}
                                            label="Phone"
                                        >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "validRange"]}
                                            label="Valid From - Until"
                                            rules={[{ required: true }]}
                                        >
                                            <RangePicker showTime />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, "mainCollector"]}
                                            valuePropName="checked"
                                        >
                                            <Checkbox>Main Collector</Checkbox>
                                        </Form.Item>

                                        {fields.length > 1 && (
                                            <MinusCircleOutlined
                                                onClick={() => remove(name)}
                                                style={{ color: "#ff4d4f", marginTop: 30 }}
                                            />
                                        )}
                                    </Space>
                                </div>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add Another Collector
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
}
