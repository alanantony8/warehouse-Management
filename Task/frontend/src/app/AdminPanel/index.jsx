import React, { useState } from "react";
import { DatePicker, Button, Card, message } from "antd";
import { Line,Bar } from "@ant-design/charts";
import { apiUrl } from "../config";
import { generateChartData } from "../methods";

const { RangePicker } = DatePicker;

const AdminPanel = () => {
  const [dateRange, setDateRange] = useState([]);
  const [data, setData] = useState([]);

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const fetchData = async () => {
    try {
      const from = dateRange[0]?.format("YYYY-MM-DD");
      const to = dateRange[1]?.format("YYYY-MM-DD");
      const response = await fetch(
        `${apiUrl}/bikes-assembled?from=${from}&to=${to}`
      );
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch data");
    }
  };
  const config = generateChartData(data);

  const EmployeeProductionChartConfig = {
    data: data?.employeeProduction,
    xField: 'assignedTo',
    yField: 'count',
    seriesField: 'date',
    xAxis: { title: { text: 'Employee' } },
    yAxis: { title: { text: 'Number of Bikes Assembled' } },
    label: {},
    point: {},
};

  return (
    <div>
      <Card>
        <RangePicker
          style={{ marginBottom: "20px" }}
          format="YYYY-MM-DD"
          onChange={handleDateRangeChange}
        />
        <Button type="primary" onClick={fetchData}>
          Filter
        </Button>
      </Card>
      <Card title="Number of Bikes Assembled">
        <Line {...config} />
      </Card>
      <Card title="Employee Production">
      <Bar {...EmployeeProductionChartConfig  } />{" "}
      </Card>
    </div>
  );
};

export default AdminPanel;
