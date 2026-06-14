export interface UnifiedIPLocation {
  latitude: string;
  longitude: string;
  country: string;
  region: string;
  city: string;
  postal: string;
  area: string;
}

/**
 * Attempts to fetch IP-based geolocation by sequentially contacting multiple public, CORS-enabled HTTPS providers.
 * This guarantees resilience against service outages, rate limits, or client-side ad-blockers.
 */
export async function fetchIPLocation(): Promise<UnifiedIPLocation> {
  const errors: Error[] = [];

  // 1. Try our internal server-side Geolocation API Proxy (highly robust, bypasses ad-blockers, no CORS)
  try {
    const res = await fetch("/api/geolocation");
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude != null && data.longitude != null) {
        console.log("Geolocation loaded successfully via secure server-side Proxy /api/geolocation");
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          country: data.country || "India",
          region: data.region || "",
          city: data.city || "",
          postal: data.postal || "",
          area: data.area || "Central Area"
        };
      }
    } else {
      errors.push(new Error(`Internal proxy API returned status: ${res.status}`));
    }
  } catch (err: any) {
    errors.push(err);
    console.warn("Secure Geolocation server-side Proxy failed, attempting client-side fallback libraries...", err);
  }

  // 2. Client-side direct fallback: try freeipapi.com
  try {
    const res = await fetch("https://freeipapi.com/api/json");
    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude != null && data.longitude != null) {
        console.log("Geolocation loaded successfully via direct freeipapi.com fallback");
        return {
          latitude: parseFloat(data.latitude).toFixed(6),
          longitude: parseFloat(data.longitude).toFixed(6),
          country: data.countryName || "India",
          region: data.regionName || "",
          city: data.cityName || "",
          postal: data.zipCode || "",
          area: data.cityName || "Central Area"
        };
      }
    }
  } catch (err: any) {
    errors.push(err);
    console.warn("freeipapi.com direct fallback failed:", err);
  }

  // 3. Client-side direct fallback: try ipwho.is
  try {
    const res = await fetch("https://ipwho.is/");
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.latitude != null && data.longitude != null) {
        console.log("Geolocation loaded successfully via direct ipwho.is fallback");
        return {
          latitude: parseFloat(data.latitude).toFixed(6),
          longitude: parseFloat(data.longitude).toFixed(6),
          country: data.country || "India",
          region: data.region || "",
          city: data.city || "",
          postal: data.postal || "",
          area: data.city || "Central Area"
        };
      }
    }
  } catch (err: any) {
    errors.push(err);
    console.warn("ipwho.is direct fallback failed:", err);
  }

  // 4. Default Kerala Kozhikode backup as final safety valve so the app NEVER crashes
  console.error("All IP Geolocation fallback providers failed. Errors:", errors);
  return {
    latitude: "11.132300",
    longitude: "75.882200",
    country: "India",
    region: "Kerala",
    city: "Kozhikode",
    postal: "673636",
    area: "Central Kozhikode"
  };
}
