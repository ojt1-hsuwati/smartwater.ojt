import mqtt from "mqtt";

// MQTT Topics
const TOPICS = {
  waterLevel1: "home/ultrasonic1", // Main Ultrasonic Sensor
  waterLevel2: "home/ultrasonic2", // Error Detection Sensor
  pumpControl: "home/relay/control", // Pump Control Topic
  pumpStatus: "home/relay/Status", // Pump Status Topic
};

// MQTT Broker Configuration
export const client = mqtt.connect("mqtt://192.168.0.109", {
  username: "detpos",
  password: "1234567890",
});

// Connect to MQTT Broker
export const connect = () => {
  client.on("connect", () => {
    console.log("Connected to MQTT broker.");

    // Subscribe to relevant topics
    client.subscribe(Object.values(TOPICS), (err) => {
      if (err) {
        console.error("Failed to subscribe to topics:", err);
      } else {
        console.log("Subscribed to topics:", Object.values(TOPICS));
      }
    });
  });
};

// Handle Incoming Messages
export const messageHandler = (io) => {
  client.on("message", (topic, message) => {
    const payload = message.toString();
    console.log(`Message received on topic ${topic}: ${payload}`);

    if (topic === TOPICS.waterLevel1) {
      // Emit water level 1 updates to clients
      io.emit("updateWaterLevel1", { level: payload });
      console.log(`Water Level 1 (Tank): ${payload}`);
    }

    if (topic === TOPICS.waterLevel2) {
      // Emit water level 2 updates to clients
      io.emit("updateWaterLevel2", { level: payload });
      console.log(`Water Level 2 (Error Detection): ${payload}`);
    }

    if (topic === TOPICS.pumpStatus) {
      const pumpState = payload === "ON";
      // Emit pump status to clients
      io.emit("pumpStatusUpdate", { state: pumpState });
      console.log(`Pump Status: ${payload}`);
    }
  });
};

// Publish Control Commands
export const controlPump = (action) => {
  client.publish(TOPICS.pumpControl, action, (err) => {
    if (err) {
      console.error("Failed to publish pump control command:", err);
    } else {
      console.log(`Pump control command sent: ${action}`);
    }
  });
};

// Handle MQTT Errors
client.on("error", (err) => {
  console.error("MQTT error:", err);
});
