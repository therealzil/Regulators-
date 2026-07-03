// SOVEREIGN AUDIT NODE - TELEMETRY SERIALIZATION ENGINE
// Memory-safe transactional ledger deserialization for isolated enclaves

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AuditTransaction {
    pub transaction_id: String,
    pub timestamp: u64,
    pub source_account_hash: String,
    pub destination_account_hash: String,
    pub amount_cents: u64,
    pub currency: String,
}

#[derive(Serialize, Debug)]
pub struct ParsingError {
    pub reason: String,
}

impl AuditTransaction {
    /// Ingests a raw byte array from the message broker and attempts schema validation.
    /// Explicitly designed not to panic to protect SGX enclave runtime continuity.
    pub fn deserialize_safely(raw_payload: &[u8]) -> Result<Self, ParsingError> {
        serde_json::from_slice::<AuditTransaction>(raw_payload).map_err(|e| ParsingError {
            reason: format!("Schema violation or malformed payload: {}", e),
        })
    }
}
