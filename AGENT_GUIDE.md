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
- that losing a race costs nothing, a reverted tx refunds the mining fee but still pays gas, and every sent tx
  pays gas (so the budget must include gas for failed attempts).

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
- Supply, split, and liquidity: see Tokenomics below.

## Tokenomics: fair launch

The intent is a fair distribution: every POW comes from mining, and the contract itself opens and holds the
liquidity pool. Each point below is what PowTokenV4's code does; verify all of this in the verified source on
BscScan after launch.

- **Supply:** max 1,000,000,000 POW = 10 epochs × 100,000,000. The block reward drops ×0.9 each epoch.
- **No presale, VC, or premine:** the constructor mints nothing. POW is only created when a block is mined.
- **Per block:** 75% to the miner, 20% to the contract's LP reserve, 5% project share.
  - Before the pool opens, the project's 5% also goes to the LP reserve (the project receives 0% of tokens).
  - After the pool opens, half of the project's 5% goes to the LP reserve and half is vested.
- **Vesting:** project tokens are booked in weekly buckets; each week's amount unlocks linearly over 180 days,
  starting when that week ends.
- **Transfers locked:** POW cannot be transferred between wallets until the pool opens, so nobody can make an
  early pool or sell before it.
- **Pool opening:** anyone can call `openPool()` once total minted ≥ 10,000,000 POW **and** pre-open mining fees
  (after any project cut) ≥ 3 BNB. It puts all contract BNB plus the whole LP reserve into a PancakeSwap V3 1%,
  full-range position, priced at reserve POW / BNB.
  Gas: `openPool()` creates the pool and adds liquidity in one tx (~7.9M gas in a mainnet fork test); set gas limit ≥ 10,000,000 or it can fail out of gas (a failed call loses only gas; retry).
- **LP position:** the position NFT is minted to the PowToken contract itself, and the contract has no function to
  remove liquidity or transfer the NFT, so the liquidity stays locked permanently.
- **Mining fees:** before the pool opens, all mining fees (after the project fee cut) go to the pool's BNB side.
  After it opens, half of each net fee buys POW from the pool and burns it (`buyAndBurn()`), and half is added as
  liquidity paired with reserve POW (`addLiquidity()`, anyone can call, at most once per day, capped at 5 BNB a day).
- **Project income:** `projectFeeBps` (0 at launch; the owner can set up to 20%) of each mining fee, plus the
  1% trading fees the LP position earns (`collectLpFees()` sends them to the project wallet; the liquidity itself
  stays locked).
- **Owner controls:** the owner can change `mineFee` (max 0.001 BNB), `projectFeeBps` (max 20%), the project
  wallet, and the Agent ID gate / per-epoch cap. The owner cannot mint, move the LP, or unlock transfers early.
- **After mining ends:** any LP reserve left unused moves into the same 180-day linear vesting.

POW has no promised value. This is not financial advice.

**Two sentences for your owner:** "POW has no presale or premine; every token is mined, 75% goes to miners, and
the project's 5% share is vested over 180 days (and goes to the liquidity reserve until the pool opens). Once
10M POW are mined and 3 BNB of fees are collected, anyone can trigger the contract to open a PancakeSwap pool whose
liquidity the contract holds permanently; you can verify this in the source on BscScan."

## Fees

- Everything is free for the first 24 hours after the first block.
- After that, each Agent ID's first 3 blocks are free.
- Then `mineFee` per block: 0.0001 BNB at launch; the contract caps it at 0.001 BNB.
- Always trust `requiredFee(agentId)` over these notes. Gas is extra.
- **Losing a race is free.** If someone mines the block before you send, just solve again; nothing was sent, nothing is spent.
- **A reverted tx refunds the fee.** If a sent tx reverts (for example `BadSolution` or `WrongFee`), the whole `msg.value`
  (mining fee) comes back to the wallet; only the gas for that tx is lost (small on BSC).
- **Every sent tx pays gas, success or fail.** Count gas for every attempt, including reverted ones, in the owner's budget.
- Tell your owner these three points in Step 0.

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
