import { useLiveData } from "@/utils/useLiveData";

export function useLocationData(locationId, user, profile) {
  const {
    data: liveData,
    loading: liveLoading,
    lastUpdate,
    refresh,
  } = useLiveData(
    async () => {
      const [locationRes, devicesRes, alertsRes] = await Promise.all([
        fetch(`/api/locations?locationId=${locationId}`),
        fetch(`/api/devices?locationId=${locationId}`),
        fetch(`/api/alerts`),
      ]);

      const locationData = locationRes.ok ? await locationRes.json() : {};
      const devicesData = devicesRes.ok ? await devicesRes.json() : {};
      const alertsData = alertsRes.ok ? await alertsRes.json() : {};

      const location = locationData.locations?.[0] || null;
      const devices = devicesData.devices || [];

      // Fetch latest sensor data for each device
      const devicesWithSensorData = await Promise.all(
        devices.map(async (device) => {
          const sensorRes = await fetch(
            `/api/sensor-data?deviceId=${device.id}&limit=1`,
          );
          const sensorData = sensorRes.ok ? await sensorRes.json() : {};
          return {
            ...device,
            latestReading: sensorData.readings?.[0] || null,
          };
        }),
      );

      return {
        location,
        devices: devicesWithSensorData,
        alerts:
          alertsData.alerts?.filter(
            (a) => a.location_id === parseInt(locationId),
          ) || [],
      };
    },
    {
      refreshInterval: 10000,
      cacheKey: `location_${locationId}`,
      enabled: !!user && profile?.status === "approved",
    },
  );

  const location = liveData?.location;
  const devices = liveData?.devices || [];
  const alerts = liveData?.alerts || [];

  return {
    location,
    devices,
    alerts,
    liveLoading,
    lastUpdate,
    refresh,
  };
}
