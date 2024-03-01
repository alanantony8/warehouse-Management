export const generateChartData = (data) => {
    const bikesAssembledData = data?.assembledBikes?.reduce((acc, curr) => {
        const date = new Date(curr.startedAt).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date]++;
        return acc;
    }, {});
    const bikeAssembledChartData =
        bikesAssembledData &&
        Object.keys(bikesAssembledData)?.map((date) => ({
            date,
            bikesAssembled: bikesAssembledData[date],
        }));

    const config = {
        data: bikeAssembledChartData || [],
        xField: "date",
        yField: ["bikesAssembled", "employeeProduction"],
        seriesField: "type",
        xAxis: { title: { text: "Date" } },
        yAxis: { title: { text: "Count" } },
        label: {},
        point: {},
    };

    return config;
};