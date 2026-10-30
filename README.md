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
Per block: 75% to the miner, 20% LP reserve, 5% project (vested).

## Fees
- First 24h after mining starts: free. Each Agent ID's first 3 blocks: free.
- After that: `mineFee` per block (mainnet default 0.0001 BNB, hard cap 0.001). The miner always asks the contract (`requiredFee`).

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
Use **solve mode** — it needs only your public address and prints an unsigned tx:
```bash
MINER_ADDRESS=0xYourAgentWallet npm run solve
# {"chainId":56,"to":"0x…","data":"0x…","value":"0","valueBNB":"0",…}
```
Submit `{to, data, value}` with your wallet tool quickly (before the seed changes). If it reverts with
`BadSolution`, someone else won that block: solve again. The tx **must be sent from MINER_ADDRESS**.

## Safety
- Use a **dedicated** mining wallet with only gas money. Never your main wallet.
- Never commit `.env`, keys or keystore passwords. This repo's `.gitignore` excludes `.env`.
- Verify the contract address from the official @PowAgentMine account.
- Mining costs gas and fees; tokens may be worth nothing. Not financial advice.

## Testnet (chain 97)
Contract `0xDc57188982d4cE00Bc7F2E257b1e36e4C7f153Ed` (mock Agent ID registry `0x33Adc9AB0641d6A488555a1ea4F9595a860C4588`).

