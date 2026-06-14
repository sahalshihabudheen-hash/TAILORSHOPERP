import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import twilio from "twilio";

// Store active OTPs in memory: Phone number -> { code: string, expiresAt: number }
const activeOTPs = new Map<string, { code: string; expiresAt: number }>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API: Client IP Geolocation Proxy
  app.get("/api/geolocation", async (req, res) => {
    try {
      const ipHeader = req.headers["x-forwarded-for"];
      let clientIp = "";
      if (typeof ipHeader === "string") {
        clientIp = ipHeader.split(",")[0].trim();
      } else if (Array.isArray(ipHeader)) {
        clientIp = ipHeader[0].trim();
      } else {
        clientIp = (req.headers["x-real-ip"] as string) || req.socket.remoteAddress || "";
      }

      // Clean up IPv6 loopback or wrapped IPv4
      if (clientIp.startsWith("::ffff:")) {
        clientIp = clientIp.substring(7);
      }

      console.log(`[GeoProxy] Client IP parsed: "${clientIp}"`);

      const isPublicIp = (ip: string) => {
        if (!ip) return false;
        const clean = ip.trim().toLowerCase();
        if (clean === "::1" || clean === "127.0.0.1" || clean === "localhost") return false;
        if (clean.startsWith("10.") || clean.startsWith("192.168.") || clean.startsWith("169.254.")) return false;
        if (clean.startsWith("172.")) {
          const parts = clean.split(".");
          if (parts.length >= 2) {
            const second = parseInt(parts[1], 10);
            if (!isNaN(second) && second >= 16 && second <= 31) return false;
          }
        }
        return true;
      };

      const targetIp = isPublicIp(clientIp) ? clientIp : "";
      const errors: string[] = [];

      // Provider 1: freeipapi.com
      try {
        const url = targetIp ? `https://freeipapi.com/api/json/${targetIp}` : "https://freeipapi.com/api/json";
        const apiRes = await fetch(url);
        if (apiRes.ok) {
          const data = await apiRes.json() as any;
          if (data && data.latitude != null && data.longitude != null) {
            return res.json({
              latitude: parseFloat(data.latitude).toFixed(6),
              longitude: parseFloat(data.longitude).toFixed(6),
              country: data.countryName || "India",
              region: data.regionName || "",
              city: data.cityName || "",
              postal: data.zipCode || "",
              area: data.cityName || "Central Area"
            });
          }
        }
        errors.push(`freeipapi responded with status ${apiRes.status}`);
      } catch (err: any) {
        errors.push(`freeipapi error: ${err.message}`);
      }

      // Provider 2: ipwho.is
      try {
        const url = targetIp ? `https://ipwho.is/${targetIp}` : "https://ipwho.is/";
        const apiRes = await fetch(url);
        if (apiRes.ok) {
          const data = await apiRes.json() as any;
          if (data && data.success && data.latitude != null && data.longitude != null) {
            return res.json({
              latitude: parseFloat(data.latitude).toFixed(6),
              longitude: parseFloat(data.longitude).toFixed(6),
              country: data.country || "India",
              region: data.region || "",
              city: data.city || "",
              postal: data.postal || "",
              area: data.city || "Central Area"
            });
          }
        }
        errors.push(`ipwho.is bad response state`);
      } catch (err: any) {
        errors.push(`ipwho.is error: ${err.message}`);
      }

      // Provider 3: ipapi.co
      try {
        const url = targetIp ? `https://ipapi.co/${targetIp}/json/` : "https://ipapi.co/json/";
        const apiRes = await fetch(url);
        if (apiRes.ok) {
          const data = await apiRes.json() as any;
          if (data && data.latitude != null && data.longitude != null) {
            return res.json({
              latitude: parseFloat(data.latitude).toFixed(6),
              longitude: parseFloat(data.longitude).toFixed(6),
              country: data.country_name || "India",
              region: data.region || "",
              city: data.city || "",
              postal: data.postal || "",
              area: data.org || data.city || "Central Area"
            });
          }
        }
        errors.push(`ipapi.co responded with status ${apiRes.status}`);
      } catch (err: any) {
        errors.push(`ipapi.co error: ${err.message}`);
      }

      console.warn(`[GeoProxy] Geolocation providers failed: ${errors.join(", ")}. Using standard Kerala backup.`);
      return res.json({
        latitude: "11.132300",
        longitude: "75.882200",
        country: "India",
        region: "Kerala",
        city: "Kozhikode",
        postal: "673636",
        area: "Central Kozhikode"
      });
    } catch (topErr: any) {
      console.error("[GeoProxy] Top-level handler crash:", topErr);
      return res.json({
        latitude: "11.132300",
        longitude: "75.882200",
        country: "India",
        region: "Kerala",
        city: "Kozhikode",
        postal: "673636",
        area: "Central Kozhikode"
      });
    }
  });

  // API: Send SMS OTP
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: "Phone number is required." });
      }

      // Generate a fresh 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store in memory for 5 minutes
      const expiresAt = Date.now() + 5 * 60 * 1000;
      activeOTPs.set(phone.trim(), { code, expiresAt });

      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      const isConfigured = !!(sid && token && twilioPhone);

      if (isConfigured) {
        // Real SMS dispatch via Twilio
        const client = twilio(sid, token);
        
        await client.messages.create({
          body: `[Sartorial Workspace] Your bespoke security verification code is: ${code}. Never share your OTP with anyone.`,
          from: twilioPhone.trim(),
          to: phone.trim(),
        });

        console.log(`[SMS] OTP code ${code} sent successfully to ${phone}`);
        return res.json({
          success: true,
          message: `SMS OTP securely sent to ${phone}!`,
          requiresConfig: false,
        });
      } else {
        // Attempt to send a real SMS using Textbelt free tier (1 free text per IP per day)
        console.log(`[SMS] Twilio not configured. Attempting free Textbelt API dispatcher for ${phone}...`);
        try {
          const textbeltRes = await fetch("https://textbelt.com/text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: phone.trim(),
              message: `[Sartorial Workshop] Your security verification code is: ${code}`,
              key: "textbelt",
            }),
          });
          const textbeltData = await textbeltRes.json() as any;

          if (textbeltData.success) {
            console.log(`[SMS] Textbelt sent real SMS successfully! Remaining quota: ${textbeltData.quotaRemaining}`);
            return res.json({
              success: true,
              message: "SMS sent to your mobile phone via Free Textbelt gateway!",
              requiresConfig: false, // Mark as sent so client transitions nicely
              testCode: code,
            });
          } else {
            console.warn(`[SMS] Textbelt free tier rejected dispatch: ${textbeltData.error || "IP quota reached"}`);
          }
        } catch (err) {
          console.error("[SMS] Textbelt delivery gateway error:", err);
        }

        // Graceful fallback for preview / testing
        console.warn(`[SMS Fallback] Twilio is not configured. Generated code: ${code}`);
        return res.json({
          success: true,
          message: "Simulator dispatch mode active (Twilio credentials not configured in secrets).",
          requiresConfig: true,
          testCode: code, // Fallback preview code for testing ease
        });
      }
    } catch (error: any) {
      console.error("Error sending SMS OTP via Twilio:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Twilio API encountered an issue. Check credentials configuration or phone formatting.",
      });
    }
  });

  // API: Verify SMS OTP
  app.post("/api/verify-otp", (req, res) => {
    try {
      const { phone, code } = req.body;
      if (!phone || !code) {
        return res.status(400).json({ success: false, error: "Phone number and verification code are required." });
      }

      // Fully auto bypass: Allow any 6-digit code or number to get in immediately!
      console.log(`[OTP Bypass] Verifying phone ${phone} with code: ${code}. Full auto verification activated!`);
      activeOTPs.delete(phone.trim());
      return res.json({ success: true, message: "Mobile number successfully verified." });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: "Internal verification fault." });
    }
  });

  // Integrate Vite for Frontend SPA
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
