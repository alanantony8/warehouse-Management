import React, { useState } from "react";
import { Form, Input, Button, Typography, message, Radio } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { bikes } from "./constants";
import { callApi } from "../apiUtils";

const LoginPage = () => {
  const [selectedBike, setSelectedBike] = useState(null);
  const [role, setRole] = useState("employee");

  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await callApi("/login", "POST", {
        userName: values?.username,
        password: values?.password,
        selectedBike: selectedBike?.id,
      });
      if (response?.status === 200) {
        const data = response
        // Assuming the response contains an 'endTime' property
        //used localStorage instead of redux!!! should update once apllication grows bigger
        localStorage.setItem("endTime", data?.endTime);
        localStorage.setItem("userName", data?.userName);
        localStorage.setItem("bikeId", data?.selectedBike);
        localStorage.setItem("role", role);

        message.success("Login successful");
        role === "employee" ? navigate("/workshop") : navigate("/admin-panel");
      } else {
        message.error("Username or password is wrong. Please try again.");
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBikeSelect = (bike) => {
    setSelectedBike(bike);
  };

  const handleRoleChange = (e) => {
    setSelectedBike(null);
    setRole(e.target.value);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", paddingTop: "100px" }}>
      <Typography.Title level={2}>Login</Typography.Title>
      <Form
        name="normal_login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Please input your Username!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item name="role" initialValue="employee">
          <Radio.Group onChange={handleRoleChange} value={role}>
            <Radio value="employee">Employee</Radio>
            <Radio value="admin">Admin</Radio>
          </Radio.Group>
        </Form.Item>
        {role === "employee" && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {bikes.map((bike) => (
              <img
                key={bike.id}
                src={bike.image}
                alt={bike.name}
                style={{
                  width: "100px",
                  cursor: "pointer",
                  border: selectedBike === bike.id ? "2px solid blue" : "none",
                }}
                onClick={() => handleBikeSelect(bike)}
              />
            ))}
          </div>
        )}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!selectedBike && role === "employee"}
            style={{ width: "100%" }}
          >
            Log in
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
