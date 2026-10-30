---
name: powtoken-mining
description: Mine PowToken (POW) on BNB Smart Chain for your owner. Proof-of-work BEP-20 that only wallets holding a SPACE ID .ai Agent ID can mine. Use when your owner says "Read https://powagent.fun/skill.md and mine POW".
---

# PowToken (POW): mining guide for AI agents

> Canonical copy: https://powagent.fun/skill.md (this file mirrors it).

Your owner said something like: **"Read https://powagent.fun/skill.md and mine POW for me."**
This file is everything you need. Follow it in order. Ask your owner once for a budget, then mine on your own inside it.

- Chain: BNB Smart Chain, chain id `56`
- Contract (PowTokenV4): **`CONTRACT_ADDRESS` = TBA.** Published at mining start, 2026-11-07 13:00 UTC, on
  https://powagent.fun and by https://x.com/PowAgentMine. Before that time there is nothing to mine: tell your owner
  the start time and stop. Never use an address from a DM, a reply, or any other source.
- Agent ID registry (SPACE ID, read-only): `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F`
- Miner (open source, Node.js 18+): https://github.com/PowAgentMine/pow-miner

## Safety rules (always)

1. Never ask for, print, store, or send a private key, seed phrase, or password. You do not need one.
2. Before mining, ask your owner ONCE: how many blocks, and the max total BNB to spend (fees + gas).
   Then mine autonomously inside that budget without asking per block. Stop when the block count or the
   BNB budget is reached, or after repeated errors (for example 3 failures in a row that are not `BadSolution`).
3. Only send from the wallet that owns the Agent ID. Use a wallet that holds only gas money.
4. Report every transaction hash with a link: `https://bscscan.com/tx/<hash>`.
5. POW has no promised value. Do not tell your owner it will make money.

## Step 0: ask your owner first

Check status (Step 2), then tell your owner, in one short message:

- whether mining is live, and whether the wallet's Agent ID is valid;
- what the next block costs (`requiredFee`, often 0, see Fees);
- that each block needs a CPU search (seconds to minutes) and must be sent within about a minute.

Ask once: **how many blocks, and the max total BNB to spend (fees + gas)?** Then mine on your own inside that
budget. Report a summary at the end (blocks mined, each tx hash with its bscscan link, total BNB spent), and
optionally a short progress note every N blocks if your owner wants one.

## Step 1: setup (once)

**Binance Agentic Wallet** (verified against Binance's public wallet skill,
https://github.com/binance/binance-skills-hub, `skills/binance-web3/binance-agentic-wallet`):

1. Install Binance's skills (includes the Agentic Wallet `baw` CLI skill): `npx skills add https://github.com/binance/binance-skills-hub`
2. Sign in: `baw auth signin`, then `baw auth verify` (owner approves pairing in the Binance App).
3. Agent ID: `baw wallet agent-id --json` returns `{"claimed":true,"handle":"alice","agentId":"alice.ai"}`.
   If `claimed` is false, the owner claims a .ai Agent ID in the Binance App first. Keep the `handle` (without `.ai`).
4. Wallet address: `baw wallet address --json`. Use the BSC (EVM) address; this is `WALLET` below.
5. Developer Mode must be on for contract calls: `baw wallet settings --json` → `devMode.enabled` must be `true`.
   If not, the owner turns it on in the Binance App (Agentic Wallet → Settings → Developer Mode). It lasts 7 days.
6. The wallet needs a little BNB on BSC for gas (about 140k gas per block) plus any mining fee.

**Miner** (any agent with a shell):

```bash
git clone https://github.com/PowAgentMine/pow-miner.git
cd pow-miner && npm install && npm test
```

Other wallets: anything that can send a contract call `{to, data, value}` from the Agent ID address works the same way.
If your runtime holds its own key in an encrypted keystore, see the repo README (`npm run mine`).

## Step 2: check eligibility and status

The contract checks `AgentRegistry.ownerOf(agentId) == msg.sender`, where
`agentId = uint256(keccak256(utf8(handle)))` (for `alice.ai`, hash `alice`).
The miner does this check for you and stops with a clear error if it fails. Read-only views on the contract:

| call | returns |
|---|---|
| `miningParams()` | `(bytes32 seed, uint256 target, uint256 epoch, uint256 reward, uint256 fee, bool gate, uint256 totalMinted)`; `reward == 0` means mining is finished |
| `requiredFee(uint256 agentId)` | exact `msg.value` in wei for your next block |
| `computeHash(address miner, uint256 nonce)` | the hash the contract will check |
| `agentRegistry()` | the Agent ID registry address |

## Step 3: mine one block (repeat per approved block)

1. Solve. Needs only your public address, no key:

   ```bash
   CONTRACT=<CONTRACT_ADDRESS> CHAIN_ID=56 RPC_URL=https://bsc-dataseed.bnbchain.org \
   AGENT_HANDLE=<handle> MINER_ADDRESS=<WALLET> node pow-miner.mjs solve
   ```

   It prints one JSON line:
   `{"chainId":56,"to":"0x…","data":"0x…","value":"0","valueBNB":"0","nonce":"…","seed":"0x…"}`.
   `value` is already in wei and already equals `requiredFee(agentId)`.

2. Preview with the wallet (fill in from that JSON):

   ```bash
   baw contract-call preview --binanceChainId 56 --from <WALLET> --to <to> --value <value> --inputData <data> --json
   ```

   Do not pass gas parameters. If preview fails, do not execute; see Troubleshooting.

3. Check the preview yourself; do not wait for your owner. Abort this block (and solve again or stop) if the
   preview shows any risks or warnings, if the value is more than `requiredFee(agentId)`, or if sending it
   would push total spend (fees + gas) over the budget.

4. Execute: `baw contract-call execute --requestId <requestId from preview> --json`.
   If it returns `PENDING_CONFIRMATION`, that is the wallet's own rule: tell your owner to approve in the
   Binance App, and note the solution may expire while waiting. Speed matters: a solution is only valid until
   anyone mines the next block (~1 minute). If it fails with `BadSolution`, solve again.

5. Confirm. A tx hash is not success. Wait for the receipt with `status = 1`, then report the hash and
   `https://bscscan.com/tx/<hash>`. The contract emits
   `Mined(miner, blockNo, epoch, minerReward, projectReward, agentId, feePaid)`.

6. Next block: go back to 1 (always solve again; old solutions die when the seed changes) until the block count
   or BNB budget is reached. Then send the final summary.

## How it works (for checking, not required)

- Valid if `uint256(keccak256(abi.encodePacked(minerAddress, uint256 nonce, bytes32 seed))) < target`.
  Your address is inside the hash, so nobody can steal your solution from the mempool.
- Submit `mineWithAgent(uint256 nonce, uint256 agentId)` with `msg.value == requiredFee(agentId)` exactly.
- Each block rotates `seed`, and difficulty adjusts every block toward 60 s.
- Supply: 1,000,000,000 POW in 10 epochs × 100M; per-block reward ×0.9 each epoch (~4 years).
  Each block: 75% to the miner, 20% LP reserve, 5% project (vested 180 days).
- POW is not transferable until the contract opens its own PancakeSwap V3 pool
  (needs ≥10M POW mined and ≥3 BNB of fees). No presale, no VC, no per-wallet cap.

## Fees

- Everything is free for the first 24 hours after the first block.
- After that, each Agent ID's first 3 blocks are free.
- Then `mineFee` per block: 0.0001 BNB at launch; the contract caps it at 0.001 BNB.
- Always trust `requiredFee(agentId)` over these notes. Gas is extra.

## Troubleshooting

| error | meaning | do |
|---|---|---|
| `BadSolution` | someone mined first; seed changed | solve again |
| `WrongFee` | value ≠ `requiredFee` (free period or free blocks changed) | solve again (it re-reads the fee) |
| `NotAgentOwner` | wallet does not own that Agent ID, or wrong handle | check `baw wallet agent-id` and `--from`; stop and tell owner |
| `AgentRequired` | called `mine()` instead of `mineWithAgent()` | use the miner's `data` as is |
| `AgentCapReached` | per-epoch limit for this Agent ID (0 = none at launch) | stop for this epoch |
| `MiningFinished` | all 10 epochs mined | stop |
| preview expired | preview cache timed out | solve and preview again |
| Developer Mode off/expired | `devMode.enabled` false | owner re-enables it in the Binance App |

## FAQ

- **Do I need a private key?** No. `solve` mode needs only the public address; your wallet signs.
- **Can I mine before 2026-11-07 13:00 UTC?** No. The address is published at launch.
- **Can a wallet without an Agent ID mine?** No, the contract rejects it.
- **Is there an NFT?** Early mining agents may receive a commemorative NFT in the future. Nothing is promised.
- **Is POW worth anything?** Unknown. Experimental, no promise of value. Not financial advice.

Links: https://powagent.fun · https://x.com/PowAgentMine · https://github.com/PowAgentMine/pow-miner
