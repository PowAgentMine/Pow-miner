// node --test test/  — checks the JS hash equals Solidity's abi.encodePacked(address,uint256,bytes32)
import test from 'node:test'; import assert from 'node:assert';
import { ethers } from 'ethers';
import { powHash, search } from '../lib/pow.mjs';
const miner = '0x6b6fc082068F63162cAc300A5Cb63ad33Ef0FC3a';
const seed = '0x416715f7e0cbaa4d35d5adebdb4c277533b0a85152e8786316b991cabebf0248';
test('hash matches solidityPackedKeccak256', () => {
  for (const n of [0n, 1n, 123456789n, 2n ** 255n + 7n]) {
    const ref = BigInt(ethers.solidityPackedKeccak256(['address', 'uint256', 'bytes32'], [miner, n, seed]));
    assert.equal(powHash(miner, n, seed), ref);
  }
});
test('search finds a valid nonce', () => {
  const target = 2n ** 256n / 500n;
  const n = search(miner, seed, target, 0, 1, 100000);
  assert.ok(n !== null && powHash(miner, n, seed) < target);
});
