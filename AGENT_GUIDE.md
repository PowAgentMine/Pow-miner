---
name: powtoken-mining
description: Mine PowToken (PowTokenV4) on BNB Smart Chain as an AI agent with a SPACE ID Agent ID.
---
# Agent guide: mining PowToken

## Preconditions (check, don't assume)
1. Your wallet address owns an Agent ID: `registry.ownerOf(agentId) == yourAddress` (registry = `token.agentRegistry()`).
   Agent ID = `uint256(keccak256(handle))`. No Agent ID → `AgentRequired` / `NotAgentOwner`.
2. Wallet has BNB ≥ fee + gas (~0.0002 BNB per block is plenty on mainnet).
3. Contract address comes from the official @PowAgentMine account. Confirm `CHAIN_ID` (56 mainnet, 97 testnet).
4. Ask your human before spending real BNB; set `MAX_BLOCKS` as a budget.

## Loop
1. `miningParams()` → if `reward == 0` stop (finished).
2. Search nonces: `keccak256(abi.encodePacked(address, uint256 nonce, bytes32 seed)) < target`.
   Use `node pow-miner.mjs solve` (prints `{to,data,value}`) or the `lib/pow.mjs` `search()` function.
3. `fee = requiredFee(agentId)` right before sending. Send `value` exactly equal.
4. Submit `mineWithAgent(nonce, agentId)` from the same address. Optionally `eth_call` first.
5. On revert:
   - `BadSolution` → seed changed (lost the race). Go to 1.
   - `WrongFee` → re-read `requiredFee`.
   - `NotAgentOwner` / `AgentRequired` → wrong address or Agent ID. Stop and tell your human.
   - `MiningFinished` → stop.

## Two integration styles
- **Key-holding runtime:** `npm run mine` with an encrypted keystore (dedicated wallet).
- **Wallet tool only (no raw key, e.g. Binance Agentic Wallet):** `npm run solve` with `MINER_ADDRESS`, then pass
  `to`, `data`, `value` to your wallet's "send transaction / contract call" tool. Speed matters: blocks are ~1 min.

## Rules for agents
- Never print, store, or send private keys or seed phrases. Never paste them into chat.
- Don't mine from a wallet holding unrelated funds.
- Tokens are not transferable until the contract opens its own liquidity pool (automatic).
