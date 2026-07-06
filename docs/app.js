// Demo app.js — static-only simulation for the N26 executive demo

const TELEMETRY_PATH = './assets/telemetry_sample.json';

const preflightLines = [
  "[fuzz-harness] starting pre-flight checks...",
  "[fuzz-harness] seed corpus loaded: 128 entries",
  "[fuzz-harness] testing AST boundary enforcement: PASS",
  "[fuzz-harness] prototype pollution vectors: BLOCKED (signature: 0x3a7f...)",
  "[fuzz-harness] zero-width joiner obfuscation: DETECTED & REDACTED",
  "[fuzz-harness] sanitizer coverage: 98.7%",
  "[fuzz-harness] runtime memory integrity: OK",
  "[fuzz-harness] final verdict: SAFE — no dangerous transformations applied",
];

function $(sel){return document.querySelector(sel)}

async function loadTelemetry(){
  try{
    const res = await fetch(TELEMETRY_PATH + '?t=' + Date.now());
    const data = await res.json();
    renderLedger(data.blocks || data);
  }catch(e){
    console.error('telemetry load failed', e);
    const ledger = $('#ledger');
    ledger.innerHTML = '<div class="muted">Could not load telemetry_sample.json — falling back to embedded demo.</div>';
  }
}

function renderLedger(blocks){
  const el = $('#ledger');
  el.innerHTML = '';
  blocks.forEach(b=>{
    const item = document.createElement('div');
    item.className = 'ledger-item';
    item.innerHTML = `<div><strong>Block #${b.number}</strong> <span class="meta">${new Date(b.timestamp).toLocaleString()}</span></div>
      <div class="hash">${b.hash}</div>
      <div class="meta">prev: ${b.prev_hash} · tx_count: ${b.tx_count} · attestation: ${b.attestation}</div>`;
    el.appendChild(item);
  });
}

function copyAllHashes(){
  const hashes = Array.from(document.querySelectorAll('.hash')).map(h=>h.textContent).join('\n');
  navigator.clipboard.writeText(hashes).then(()=>{
    alert('Copied hashes to clipboard');
  });
}

// Terminal streaming
function runPreflight(){
  const term = $('#terminal');
  term.innerHTML = '';
  let lineIndex = 0;

  function streamLine(){
    if(lineIndex >= preflightLines.length) return;
    const line = preflightLines[lineIndex++];
    const row = document.createElement('div');
    term.appendChild(row);
    let i = 0;
    const typer = setInterval(()=>{
      row.textContent = line.slice(0,i+1);
      term.scrollTop = term.scrollHeight;
      i++;
      if(i >= line.length){
        clearInterval(typer);
        // small pause then next line
        setTimeout(streamLine, 250);
      }
    }, 18);
  }

  streamLine();
}

function updateRules(){
  const eu = $('#eu-act').checked;
  const nist = $('#nist-rmf').checked;
  const box = $('#rules');
  const lines = [];
  if(eu) lines.push('<strong>EU AI Act (2026)</strong>: AST boundary -> strict redaction of personal identifiers; redaction templates: [REDACTED-PERSON]').
  if(nist) lines.push('<strong>NIST AI RMF</strong>: Risk profile -> High; enforce immutability markers on model inputs and outputs.');
  if(!eu && !nist) lines.push('<p class="muted">No presets active — toggles are demonstrative (SIMULATION_MODE)</p>');
  box.innerHTML = lines.map(l=>`<div style="margin-bottom:8px">${l}</div>`).join('');
}

// Small polling to make ledger feel "live"
function startLedgerHeartbeat(){
  setInterval(()=>{
    const items = document.querySelectorAll('.ledger-item');
    if(!items.length) return;
    items.forEach((it,i)=>{
      it.style.transform = `translateY(${Math.sin((Date.now()/2000)+(i))*1}px)`;
    });
  }, 800);
}

// Event bindings
document.addEventListener('DOMContentLoaded', ()=>{
  loadTelemetry();
  startLedgerHeartbeat();
  $('#refresh-ledger').addEventListener('click', loadTelemetry);
  $('#copy-all').addEventListener('click', copyAllHashes);
  $('#run-preflight').addEventListener('click', runPreflight);
  $('#clear-terminal').addEventListener('click', ()=>$('#terminal').innerHTML='');
  $('#eu-act').addEventListener('change', updateRules);
  $('#nist-rmf').addEventListener('change', updateRules);
});
