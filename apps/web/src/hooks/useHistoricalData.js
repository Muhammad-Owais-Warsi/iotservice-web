import { useState, useEffect } from "react";

export function useHistoricalData(devices, days = 7) {
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (devices.length === 0) return;

      try {
        // Get data from all devices for the specified number of days
        const allReadings = await Promise.all(
          devices.map(async (device) => {
            const res = await fetch(
              `/api/sensor-data?deviceId=${device.id}&hours=${days * 24}&limit=10000`,
            );
            if (res.ok) {
              const data = await res.json();
              return data.readings || [];
            }
            return [];
          }),
        );

        // Flatten and aggregate by day
        const flatReadings = allReadings.flat();
        const dayMap = new Map();

        flatReadings.forEach((reading) => {
          const date = new Date(reading.recorded_at);
          const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

          if (!dayMap.has(dayKey)) {
            dayMap.set(dayKey, {
              date: dayKey,
              temps: [],
              humidities: [],
              electricity: [],
            });
          }

          const day = dayMap.get(dayKey);
          if (reading.temperature !== null)
            day.temps.push(parseFloat(reading.temperature));
          if (reading.humidity !== null)
            day.humidities.push(parseFloat(reading.humidity));
          if (reading.electricity !== null)
            day.electricity.push(parseFloat(reading.electricity));
        });

        // Calculate averages and format for charts
        const chartData = Array.from(dayMap.values())
          .map((day) => ({
            date: new Date(day.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            temperature:
              day.temps.length > 0
                ? (
                    day.temps.reduce((a, b) => a + b, 0) / day.temps.length
                  ).toFixed(1)
                : null,
            humidity:
              day.humidities.length > 0
                ? (
                    day.humidities.reduce((a, b) => a + b, 0) /
                    day.humidities.length
                  ).toFixed(1)
                : null,
            electricity:
              day.electricity.length > 0
                ? day.electricity.reduce((a, b) => a + b, 0).toFixed(2)
                : null,
          }))
          .sort(
            (a, b) =>
              new Date(
                dayMap.get(
                  Array.from(dayMap.keys()).find(
                    (k) =>
                      new Date(k).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      }) === a.date,
                  ),
                ),
              ) -
              new Date(
                dayMap.get(
                  Array.from(dayMap.keys()).find(
                    (k) =>
                      new Date(k).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      }) === b.date,
                  ),
                ),
              ),
          )
          .slice(-days);

        setHistoricalData(chartData);
      } catch (error) {
        console.error("Failed to fetch historical data:", error);
      }
    };

    fetchHistoricalData();
  }, [devices, days]);

  return historicalData;
}
