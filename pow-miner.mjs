#!/usr/bin/env node
// PowTokenV4 open-source CPU miner (BSC). MIT.
// Modes:
//   solve  : find a nonce and print {to,data,value} JSON only. Needs ONLY your public address.
//            Use this with wallets that don't expose a private key (e.g. Binance Agentic Wallet):
//            your agent submits the printed tx through its own wallet tool.
//   mine   : find + sign + submit in a loop (needs KEYSTORE_PATH+KEYSTORE_PASSWORD_FILE or PRIVATE_KEY).
//   DRY_RUN=1 with mine: solve and simulate (eth_call) but never broadcast.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import os from 'node:os';
import fs from 'node:fs';
import { search } from './lib/pow.mjs';

if (!isMainThread) {
  const { miner, seed, target, start, step } = workerData;
  const T = BigInt(target); let s = BigInt(start); const chunk = 20000;
  let n = null;
  while (n === null) {
    n = search(miner, seed, T, s, step, chunk);
    s += BigInt(step) * BigInt(chunk);
  }
  parentPort.postMessage(n.toString());
} else {
  await main();
}

function loadDotEnv() {
  const p = new URL('./.env', import.meta.url);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
function log(...a) { console.error(new Date().toISOString(), ...a); }

async function main() {
  loadDotEnv();
  const { ethers } = await import('ethers');
  const mode = process.argv[2] || 'mine';
  const E = process.env;
  const rpc = E.RPC_URL || 'https://bsc-dataseed.bnbchain.org';
  const chainId = BigInt(E.CHAIN_ID || '56');
  const contract = E.CONTRACT;
  const threads = Number(E.THREADS || Math.max(1, os.cpus().length - 1));
  const maxBlocks = Number(E.MAX_BLOCKS || 0); // 0 = unlimited
  const dry = E.DRY_RUN === '1';
  if (!contract) throw new Error('CONTRACT is required');
  let agentId = E.AGENT_ID ? BigInt(E.AGENT_ID) : (E.AGENT_HANDLE ? BigInt(ethers.keccak256(ethers.toUtf8Bytes(E.AGENT_HANDLE))) : 0n);

  const provider = new ethers.JsonRpcProvider(rpc, Number(chainId), { staticNetwork: true });
  const net = await provider.getNetwork();
  if (net.chainId !== chainId) throw new Error(`RPC chain ${net.chainId} != CHAIN_ID ${chainId}`);

  let wallet = null, miner;
  if (mode === 'mine') {
    if (E.KEYSTORE_PATH) {
      const pw = fs.readFileSync(E.KEYSTORE_PASSWORD_FILE, 'utf8').trim();
      wallet = await ethers.Wallet.fromEncryptedJson(fs.readFileSync(E.KEYSTORE_PATH, 'utf8'), pw);
    } else if (E.PRIVATE_KEY) wallet = new ethers.Wallet(E.PRIVATE_KEY);
    else throw new Error('mine mode needs KEYSTORE_PATH (+KEYSTORE_PASSWORD_FILE) or PRIVATE_KEY; or use `solve` mode');
    wallet = wallet.connect(provider); miner = wallet.address;
  } else if (mode === 'solve') {
    miner = ethers.getAddress(E.MINER_ADDRESS || '');
  } else throw new Error('usage: pow-miner.mjs [mine|solve]');

  const abi = [
    'function miningParams() view returns (bytes32 seed,uint256 target,uint256 epoch,uint256 reward,uint256 fee,bool gate,uint256 totalMinted)',
    'function requiredFee(uint256 agentId) view returns (uint256)',
    'function agentRegistry() view returns (address)',
    'function mine(uint256 nonce) payable',
    'function mineWithAgent(uint256 nonce,uint256 agentId) payable',
    'function balanceOf(address) view returns (uint256)',
  ];
  const c = new ethers.Contract(contract, abi, provider);
  const iface = c.interface;

  const p0 = await c.miningParams();
  if (p0.gate) {
    if (!agentId) throw new Error('Agent gate is ON: set AGENT_ID or AGENT_HANDLE (SPACE ID Agent ID owned by this wallet)');
    const reg = new ethers.Contract(await c.agentRegistry(), ['function ownerOf(uint256) view returns (address)'], provider);
    const owner = await reg.ownerOf(agentId).catch(() => ethers.ZeroAddress);
    if (owner.toLowerCase() !== miner.toLowerCase()) throw new Error(`Agent ID ${agentId} is owned by ${owner}, not ${miner}`);
  }
  log(`miner=${miner} chain=${chainId} contract=${contract} gate=${p0.gate} agentId=${agentId || '-'} threads=${threads} mode=${mode}${dry ? ' DRY_RUN' : ''}`);

  let mined = 0;
  for (;;) {
    const p = await c.miningParams();
    if (p.reward === 0n) { log('mining finished'); return; }
    log(`epoch=${p.epoch} reward/block=${ethers.formatEther(p.reward)} expected hashes≈${(2n ** 256n / (p.target + 1n))}`);
    const nonce = await solve(miner, p.seed, p.target, threads, c);
    if (nonce === null) { log('seed changed (someone else mined the block); restarting'); continue; }
    const fee = p.gate ? await c.requiredFee(agentId) : p.fee; // contract's own fee logic
    const data = p.gate ? iface.encodeFunctionData('mineWithAgent', [nonce, agentId]) : iface.encodeFunctionData('mine', [nonce]);
    const tx = { to: contract, data, value: fee };
    if (mode === 'solve') {
      console.log(JSON.stringify({ chainId: Number(chainId), to: contract, data, value: fee.toString(), valueBNB: ethers.formatEther(fee), nonce: nonce.toString(), seed: p.seed }));
      return;
    }
    try { await provider.call({ ...tx, from: miner }); }
    catch (e) { log('simulation reverted:', e.shortMessage || e.message, '- retrying with fresh state'); continue; }
    if (dry) { log(`DRY_RUN ok: nonce=${nonce} fee=${ethers.formatEther(fee)} BNB (not broadcast)`); return; }
    const gasPrice = E.GAS_PRICE_GWEI ? ethers.parseUnits(E.GAS_PRICE_GWEI, 'gwei') : undefined;
    const sent = await wallet.sendTransaction({ ...tx, gasLimit: 250000n, ...(gasPrice ? { gasPrice, type: 0 } : {}) });
    log(`sent ${sent.hash} nonce=${nonce} fee=${ethers.formatEther(fee)} BNB`);
    const r = await sent.wait();
    if (r.status === 1) { mined++; log(`✅ block mined in tx ${r.hash} gasUsed=${r.gasUsed} balance=${ethers.formatEther(await c.balanceOf(miner))}`); }
    else log(`❌ tx reverted ${r.hash} (likely lost the race)`);
    if (maxBlocks && mined >= maxBlocks) return;
  }
}

function solve(miner, seed, target, threads, c) {
  return new Promise((resolve) => {
    let done = false; const workers = [];
    const finish = (v) => { if (done) return; done = true; clearInterval(iv); workers.forEach((w) => w.terminate()); resolve(v); };
    for (let i = 0; i < threads; i++) {
      const w = new Worker(new URL(import.meta.url), { workerData: { miner, seed, target: target.toString(), start: i, step: threads } });
      w.on('message', (m) => { if (typeof m === 'string') finish(BigInt(m)); });
      w.on('error', (e) => { log('worker error', e.message); });
      workers.push(w);
    }
    // poll seed: if another miner wins, our search is stale
    const iv = setInterval(async () => {
      try { const p = await c.miningParams(); if (p.seed !== seed) finish(null); } catch {}
    }, 3000);
  });
}
