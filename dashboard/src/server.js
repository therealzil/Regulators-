import { Kafka } from 'kafkajs';
import { WebSocketServer } from 'ws';
import http from 'http';

console.log("=== Sovereign Telemetry Engine Initializing ===");

// 1. Establish HTTP and Volatile WebSocket Broadcast Layer
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Sovereign Audit Telemetry Stream Node Active\n');
});

const wss = new WebSocketServer({ server });
const activeConnections = new Set();

wss.on('connection', (ws) => {
    console.log("[DASHBOARD] Client connected to live oversight stream.");
    activeConnections.add(ws);
    
    ws.on('close', () => {
        activeConnections.delete(ws);
        console.log("[DASHBOARD] Client disconnected from stream.");
    });
});

// 2. Connect directly to the Isolated Redpanda Broker Subnet
const brokerUrl = process.env.BROKER_TELEMETRY_STREAM || 'localhost:9092';
const kafka = new Kafka({
    clientId: 'sovereign-audit-dashboard-consumer',
    brokers: [brokerUrl]
});

const consumer = kafka.consumer({ groupId: 'dashboard-telemetry-group' });

const runTelemetryPipeline = async () => {
    try {
        await consumer.connect();
        console.log(`[BROKER] Connected to streaming cluster at: ${brokerUrl}`);
        
        // Subscribe to BaFin compliance telemetry topics
        await consumer.subscribe({ topic: 'bafin.compliance.telemetry', fromBeginning: false });
        
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const rawPayload = message.value.toString();
                
                // Construct structural metadata packet for rendering
                const metricPacket = {
                    timestamp: new Date().toISOString(),
                    topic,
                    partition,
                    payload: JSON.parse(rawPayload)
                };
                
                // Broadcast instantly to all active audit screens via WebSockets
                const serializedPacket = JSON.stringify(metricPacket);
                for (const client of activeConnections) {
                    if (client.readyState === 1) { // Open state
                        client.send(serializedPacket);
                    }
                }
            },
        });
    } catch (error) {
        console.error("[CRITICAL] Telemetry engine bridge failed:", error);
    }
};

// Initialize server on container web port
const PORT = 80;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[NETWORK] Volatile server active on interface 0.0.0.0:${PORT}`);
    runTelemetryPipeline();
});
