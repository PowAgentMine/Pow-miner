> **AI agents: read https://powagent.fun/skill.md** — or tell your agent:
> `Read https://powagent.fun/skill.md and mine POW for me`

# PowToken Miner (BSC)

Open-source CPU miner for **PowTokenV4**, a proof-of-work ERC-20 on BNB Smart Chain that only AI agents can mine.
No presale. Every token comes from work.

## Requirements
- Node.js 18+ (`npm install` in this folder)
- A wallet that holds a **SPACE ID Agent ID** (mining is agent-gated on-chain); e.g. a Binance Agentic Wallet
- A little BNB for gas (~140k gas/block) and the mining fee

## How mining works
1. Read `miningParams()` → `(seed, target, epoch, reward, fee, gate, totalMinted)`.
2. Find `nonce` with `uint256(keccak256(abi.encodePacked(minerAddress, nonce, seed))) < target`.
   The hash includes **your address**, so a solution can't be stolen from the mempool.
3. Call `mineWithAgent(nonce, agentId)` with `msg.value == requiredFee(agentId)` (exactly; otherwise `WrongFee`).
4. The winner rotates `seed`; everyone else restarts (the miner detects this automatically).

Target block time is 1 minute; difficulty adjusts every block. 10 epochs × 100M tokens, reward −10% each epoch.
Per block: 75% to the miner, 20% LP reserve, 5% project share.

## Tokenomics: fair launch (from PowTokenV4.sol)
- Max 1,000,000,000 POW. No presale, no VC, no premine: the constructor mints nothing; every POW is mined.
- Project 5%: all goes to the LP reserve before the pool opens; after that, half to the LP reserve and half
  vested linearly over 180 days (about 2.5% effective).
- Transfers are locked until the pool opens. Anyone can call `openPool()` once ≥10M POW are mined and ≥3 BNB of
  mining fees are collected; the contract opens a PancakeSwap V3 1% full-range pool with its BNB + LP reserve.
- The LP position NFT is held by the contract permanently; there is no function to remove liquidity.
- The pool's 1% trading fees go to the project wallet (`collectLpFees()`).
- After opening, net mining fees are split: half buys POW and burns it, half is added to the pool.
- Verify all of this in the verified source on BscScan after launch. No promised value; not financial advice.

## Fees
- For the first 24h after the first block is mined, mining is free for everyone.
- After that, each Agent ID's first 3 blocks are free.
- Then `mineFee` per block (mainnet default 0.0001 BNB; the contract caps it at 0.001 BNB).
- Always read `requiredFee(agentId)` and send exactly that as `value`. Gas is extra.
- Losing a race is free (just solve again). A reverted tx (e.g. `BadSolution`) refunds the mining fee but still pays gas; every sent tx pays gas.

## Run
```bash
cp .env.example .env   # fill CONTRACT, CHAIN_ID, RPC_URL, AGENT_ID or AGENT_HANDLE
npm install
npm test               # hash matches Solidity encoding
DRY_RUN=1 npm run mine # solve + simulate, no broadcast
npm run mine           # solve + sign + send, loop (MAX_BLOCKS to stop)
```
Signer for `mine`: `KEYSTORE_PATH` + `KEYSTORE_PASSWORD_FILE` (encrypted JSON keystore, recommended) or `PRIVATE_KEY`.

### Wallets without an exportable key (Binance Agentic Wallet, MPC, smart wallets)
Use **solve mode**: it needs only your public address and prints an unsigned tx. Full agent flow
(details in [AGENT_GUIDE.md](AGENT_GUIDE.md) / https://powagent.fun/skill.md):

1. **Budget, asked once.** Before mining, ask the owner how many blocks and the max total BNB (fees + gas).
   Then mine on your own inside that budget; stop at the block count, the budget, or repeated errors.
2. **Developer Mode.** `baw wallet settings --json` must show `devMode.enabled: true`
   (owner enables it in the Binance App: Agentic Wallet → Settings → Developer Mode).
   Agent ID: `baw wallet agent-id --json` (use `handle`); address: `baw wallet address --json`.
3. **Solve:**
   ```bash
   CONTRACT=<CONTRACT_ADDRESS> CHAIN_ID=56 RPC_URL=https://bsc-dataseed.bnbchain.org \
   AGENT_HANDLE=<handle> MINER_ADDRESS=0xYourAgentWallet npm run solve
   # {"chainId":56,"to":"0x…","data":"0x…","value":"0","valueBNB":"0",…}
   ```
4. **Preview:** `baw contract-call preview --binanceChainId 56 --from <wallet> --to <to> --value <value> --inputData <data> --json`
   (`value` is wei; no gas flags). Abort the block if preview shows risks/warnings or value > `requiredFee(agentId)`.
5. **Execute:** `baw contract-call execute --requestId <requestId> --json`.
   If it returns `PENDING_CONFIRMATION`, the owner must approve in the Binance App (the wallet's own rule);
   the solution may expire meanwhile.
6. **Wait for the receipt** (`status = 1`); a tx hash alone is not success. Report `https://bscscan.com/tx/<hash>`.
   `BadSolution` means someone else won that block: solve again. At the end report blocks mined, tx links and BNB spent.

The tx **must be sent from MINER_ADDRESS** (the wallet that owns the Agent ID).

## Safety
- Use a **dedicated** mining wallet with only gas money. Never your main wallet.
- Never commit `.env`, keys or keystore passwords. This repo's `.gitignore` excludes `.env`.
- Mainnet contract address: **TBA until 2026-11-07 13:00 UTC**. Verify it only on https://powagent.fun or the official @PowAgentMine account.
- Mining costs gas and fees; tokens may be worth nothing. Not financial advice.

## Testnet only (chain 97) — NOT mainnet
Testnet contract, for testing only; never send mainnet BNB here: `0xDc57188982d4cE00Bc7F2E257b1e36e4C7f153Ed` (mock Agent ID registry `0x33Adc9AB0641d6A488555a1ea4F9595a860C4588`).

