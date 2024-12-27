const express = require("express");
const mqtt = require("mqtt");
const http = require("http");
const socketIo = require("socket.io");

// Initialize Express App and Server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://192.168.0.118:3000' // Update this if your client is running from a different IP
  }
});

// Middleware
app.use(express.json());
app.use(express.static("public")); // Serve static files from the 'public' folder

// MQTT Client Setup
const mqttBrokerUrl = 'mqtt://192.168.0.118:1883'; // Correct port for MQTT
const mqttClient = mqtt.connect(mqttBrokerUrl, {
  username: 'detpos',
  password: 'asdffdsa',
});

// MQTT Topics
const topics = {
  waterLevel1: "home/ultrasonic1", // Main Ultrasonic Sensor
  waterLevel2: "home/ultrasonic2", // Error Detection Sensor
  pumpControl: "home/relay/control", // Pump Control Topic
  pumpStatus: "home/relay/Status",  // Pump Status Topic
};

mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe(Object.values(topics), (err) => {
    if (err) console.error("Subscription error:", err);
  });
});

// Handle MQTT Messages
mqttClient.on("message", (topic, message) => {
  const payload = message.toString();

  if (topic === topics.waterLevel1) {
    console.log(`Water Level 1 (Tank): ${payload}`);
    io.emit("updateWaterLevel1", { level: payload }); // Emit update to clients
  }

  if (topic === topics.waterLevel2) {
    console.log(`Water Level 2 (Error Detection): ${payload}`);
    io.emit("updateWaterLevel2", { level: payload }); // Emit update to clients
  }

  if (topic === topics.pumpStatus) {
    const pumpState = payload === "ON";
    console.log(`Pump Status: ${payload}`);
    io.emit("pumpStatusUpdate", { state: pumpState }); // Emit pump status to clients
  }
});

// API Endpoints
app.get("/api/water-level", (req, res) => {
  res.json({ message: "This endpoint is a placeholder for water level data." });
});

app.post("/api/pump-control", (req, res) => {
  const { action } = req.body;

  // Log the action received from the web
  console.log(`Received pump control action: ${action}`);

  // Publish pump control command to MQTT broker
  mqttClient.publish(topics.pumpControl, action, (err) => {
    if (err) {
      console.log("Error publishing pump control command:", err);
      return res.status(500).json({ message: "Failed to send pump control command" });
    }
    console.log(`Pump control command published to MQTT: ${action}`);
    res.json({ message: `Pump control command sent: ${action}` });
  });
});

// Start Server
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://192.168.0.118:${PORT}`);
});
