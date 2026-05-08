console.log("-----------------------------------------");
console.log("🔋 GreenRide IoT Hardware Simulator Active");
console.log("📡 Target: http://127.0.0.1:5000");
console.log("-----------------------------------------");

const pingServer = async () => {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/iot/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: "super-secret-iot-key" }) 
    });
    const data = await res.json();
    if (data.success) console.log(`[HARDWARE] ✅ ${data.station} -> ${data.batteries} batteries`);
  } catch { console.log("❌ Offline"); }
};

setInterval(pingServer, 4500);
