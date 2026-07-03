# Regulators- ⚖️
### *The Independent Big-Tech Black-Box Auditing Infrastructure*

An event-driven, hardware-attested compliance node built in memory-safe Rust, designed to audit high-throughput financial ledgers under strict privacy and non-persistence constraints. Aligned with EU DORA and BaFin regulatory mandates.

---

## 🏛️ Regulatory & Legal Frameworks
Before reviewing the codebase, please examine our core structural oversight documentation:
* **[Alpha Pilot Briefing](docs/alpha_pilot_briefing.md):** Architectural breakdown for DORA compliance mapping.
* **[Product Service Level Agreement (PSLA)](docs/psla_contract_template.md):** Contractual binding translating technical isolation into legally bounded corporate liability shields.

---

## 🛡️ Core Infrastructure Architecture
1. **Physical Silicon Isolation (`core/`):** Executes exclusively inside an Intel SGX secure hardware enclave via Gramine, denying host-root visibility to incoming financial parameters.
2. **Volatile Flash State Logic (`core/src/`):** Guarantees zero local database storage. Financial data is held in volatile RAM buffers and destroyed within a strict 60-second window.
3. **Unidirectional Network Topology (`infrastructure/`):** Hardened with strict iptables rulesets to transmit signed cryptographic hashes outward while aggressively dropping all inbound packets.
4. **Transient Dashboard Engine (`dashboard/`):** A zero-persistence Node.js server piping Kafka streams directly to client WebSockets without a trailing data footprint.

## 📜 Licensing
This repository is protected under the **Business Source License 1.1 (BSL 1.1)**. Non-commercial, research, and audit validation use is free. Production implementation for commercial services requires an active license agreement from **Sovereign Audit Labs LLC**.
