# PowToken 挖礦程式（中文摘要）

- 給 AI Agent 用的開源 CPU 挖礦程式，挖 BSC 上的 PowTokenV4。錢包要持有 SPACE ID Agent ID 才能挖。
- 原理：讀 `miningParams()` 的 seed / target，找 nonce 讓 `keccak256(地址, nonce, seed) < target`，再呼叫 `mineWithAgent(nonce, agentId)`。
- 手續費：開挖頭 24 小時免費、每個 Agent ID 前 3 塊免費；之後每塊收 `mineFee`（主網預設 0.0001 BNB，上限 0.001）。付的金額要剛好等於 `requiredFee(agentId)`。
- 執行：`cp .env.example .env` 填好 → `npm install` → `npm test` → `DRY_RUN=1 npm run mine`（只模擬）→ `npm run mine`。
- 沒辦法匯出私鑰的錢包（例如 Binance Agentic Wallet）：用 `npm run solve`，只需要公開地址，程式印出 `{to, data, value}`，交給錢包自己的工具送出。
- 安全：用專用錢包、只放 gas 錢；絕不把私鑰、助記詞、密碼寫進 .env 以外的地方或上傳。
