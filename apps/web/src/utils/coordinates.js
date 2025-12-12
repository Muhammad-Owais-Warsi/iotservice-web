// Simple pincode to coordinates mapping (India-centric)
// In production, you'd use a geocoding API
export function getCoordinatesFromPincode(pincode) {
  // Default to center of India
  const defaultCoords = { lat: 20.5937, lng: 78.9629 };

  // Simple hash to generate somewhat consistent coordinates from pincode
  const hash = pincode
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const lat = 8 + (hash % 30); // Latitude between 8-38 (India range)
  const lng = 68 + (hash % 30); // Longitude between 68-98 (India range)

  return { lat, lng };
}
