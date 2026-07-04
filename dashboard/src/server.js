import { WebSocketServer } from 'ws';
import { Kafka } from 'kafkajs';

const PORT = 80;
const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' });

console.log('=== Sovereign Telemetry Engine Initializing ===');
console.log(`[NETWORK] Volatile server active on interface 0.0.0.0:${PORT}`);

const kafka = new Kafka({
    clientId: 'sovereign-audit-dashboard-consumer',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'sovereign-telemetry-group' });

async function runKafkaStream() {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'ledger-telemetry', fromBeginning: false });
        console.log('[KAFKA] Connected to Redpanda ledger stream.');

        await consumer.run({
            eachMessage: async ({ message }) => {
                const payload = message.value.toString();
                broadcast(payload);
            },
        });
    } catch (error) {
        console.warn('[WARNING] Real Kafka broker unreachable. Failing over to MOCK telemetry stream...');
        startMockStream();
    }
}

function startMockStream() {
    setInterval(() => {
        const mockTransaction = {
            transaction_id: `TXN-${Math.random().toString(36).substring(7).toUpperCase()}`,
            timestamp: Date.now(),
            source_account_hash: "0xMockHashA123...",
            destination_account_hash: "0xMockHashB456...",
            amount_cents: Math.floor(Math.random() * 50000) + 1000,
            currency: "EUR"
        };
        broadcast(JSON.stringify(mockTransaction));
    }, 2000); // Emit a fake transaction every 2 seconds
}

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(data);
        }
    });
}

// Start the ingestion pipeline
runKafkaStream();
