// Pure PoW helpers shared by the miner and tests.
// Matches PowTokenV4: keccak256(abi.encodePacked(address miner, uint256 nonce, bytes32 seed)) < target
import { keccak_256 } from '@noble/hashes/sha3';

export function hexToBytes(h) {
  h = h.startsWith('0x') ? h.slice(2) : h;
  const b = new Uint8Array(h.length / 2);
  for (let i = 0; i < b.length; i++) b[i] = parseInt(h.substr(i * 2, 2), 16);
  return b;
}
export function bytesToBig(b) { let x = 0n; for (const v of b) x = (x << 8n) | BigInt(v); return x; }

/** 84-byte buffer: [20 miner][32 nonce][32 seed]; nonce lives at offset 20. */
export function makeBuffer(miner, seed) {
  const buf = new Uint8Array(84);
  buf.set(hexToBytes(miner), 0);
  buf.set(hexToBytes(seed), 52);
  return buf;
}
export function writeNonce(buf, nonce) {
  let n = nonce;
  for (let i = 51; i >= 20; i--) { buf[i] = Number(n & 0xffn); n >>= 8n; }
}
export function powHash(miner, nonce, seed) {
  const buf = makeBuffer(miner, seed); writeNonce(buf, nonce);
  return bytesToBig(keccak_256(buf));
}
/** Search nonces start, start+step, ... up to maxIters. Returns nonce or null. */
export function search(miner, seed, target, start, step, maxIters) {
  const buf = makeBuffer(miner, seed);
  let n = BigInt(start); const s = BigInt(step);
  for (let i = 0; i < maxIters; i++, n += s) {
    writeNonce(buf, n);
    if (bytesToBig(keccak_256(buf)) < target) return n;
  }
  return null;
}
