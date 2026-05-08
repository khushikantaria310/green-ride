// backend/iot.ts
console.log("-----------------------------------------");
console.log("🔋 GreenRide IoT Hardware Simulator Active");
console.log("📡 Target: http://127.0.0.1:5000");
console.log("-----------------------------------------");

const pingServer = async () => {
  try {
    // 💡 Switching to 127.0.0.1 fixes DNS resolution issues in Bun/Node
    const res = await fetch("http://127.0.0.1:5000/api/iot/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: "super-secret-iot-key" }) 
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.log(`⚠️  GRID REJECTED: ${errorData.error}`);
      return;
    }

    const data = await res.json();
    console.log(`[HARDWARE SYNC] ⚡ ${data.station} updated -> ${data.batteries} batteries available.`);
    
  } catch (error) {
    console.log("❌ Mainframe Offline. Retrying in 4.5s...");
  }
};

// Start the grid heartbeat
setInterval(pingServer, 4500);
