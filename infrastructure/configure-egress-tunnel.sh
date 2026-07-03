#!/bin/sh
# SOVEREIGN AUDIT NODE - UNIDIRECTIONAL NETWORKING TOPOLOGY
# Hardening Blueprint for n26-egress-tunnel

echo "=== Initializing Unidirectional Network Hardening ==="

# 1. Define Environmental Coordinates
EGRESS_IFACE="br-n26-egress"
RELAY_IP=$(getent hosts relay.sovereign-llc.net | awk '{ print $1 }')

if [ -z "$RELAY_IP" ]; then
    echo "[WARNING] Could not resolve relay.sovereign-llc.net. Falling back to default routing restrictions."
fi

# 2. Flush existing rules for the egress network bridge to establish a baseline
iptables -F FORWARD
iptables -F INPUT

# 3. Apply Strict Unidirectional Ruleset
# Allow established and related traffic (so the enclave can receive replies to its own outbound requests)
iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow outbound HTTPS/TCP traffic strictly originating from the sovereign-core container
# heading directly to the validated relay endpoint
if [ ! -z "$RELAY_IP" ]; then
    iptables -A FORWARD -i $EGRESS_IFACE -d $RELAY_IP -p tcp --dport 443 -m conntrack --ctstate NEW -j ACCEPT
    echo "[SECURE] Outbound route established strictly to relay.sovereign-llc.net ($RELAY_IP)"
else
    # General restrictive outbound allowance fallback if DNS resolution is handled at a higher layer
    iptables -A FORWARD -i $EGRESS_IFACE -p tcp --dport 443 -m conntrack --ctstate NEW -j ACCEPT
fi

# 4. Aggressive Inbound Drop Policy
# Drop any inbound connection attempts (NEW tcp packets) arriving from the outside into the enclave subnet
iptables -A FORWARD -o $EGRESS_IFACE -p tcp --syn -j DROP

# Catch-all: Explicitly drop any other forwarded traffic traversing this interface
iptables -A FORWARD -i $EGRESS_IFACE -j DROP
iptables -A FORWARD -o $EGRESS_IFACE -j DROP

echo "[SUCCESS] Unidirectional egress firewall rules successfully latched to $EGRESS_IFACE."
