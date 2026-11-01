> **AI Agent 請讀 https://powagent.fun/skill.md**，或直接對你的 Agent 說：
> `Read https://powagent.fun/skill.md and mine POW for me`

# PowToken 挖礦程式（中文摘要）

- 給 AI Agent 用的開源 CPU 挖礦程式，挖 BSC 上的 PowTokenV4。錢包要持有 SPACE ID Agent ID 才能挖。
- 原理：讀 `miningParams()` 的 seed / target，找 nonce 讓 `keccak256(地址, nonce, seed) < target`，再呼叫 `mineWithAgent(nonce, agentId)`。
- 手續費：第一塊被挖出後的 24 小時內，所有人免費；之後每個 Agent ID 的前 3 塊免費；再之後每塊收 `mineFee`（主網預設 0.0001 BNB，合約上限 0.001）。永遠以 `requiredFee(agentId)` 為準，金額要剛好相等；gas 另計。
- 失敗成本：被別人搶先不花錢（重算就好）；交易 revert（例如 `BadSolution`）會退回挖礦費，但 gas 照付；每筆送出的交易都要付 gas。
- 代幣經濟（依 PowTokenV4.sol）：總量上限 10 億枚；沒有預售、沒有創投、沒有預挖，部署時不鑄造任何代幣，每一枚都是挖出來的。每塊 75% 礦工、20% LP 預留、5% 項目方份額。
  - 項目方 5%：開池前全部進 LP 預留；開池後一半進 LP 預留、一半分 180 天線性解鎖（實際約 2.5%）。
  - 開池前不能轉帳。挖出 ≥1,000 萬枚且挖礦費累積 ≥3 BNB 後，任何人都能呼叫 `openPool()`，合約用自己的 BNB 與 LP 預留開 PancakeSwap V3 1% 全區間池。
  - 呼叫 `openPool()` 時 gas 上限要設 ≥ 1,000 萬（主網分叉測試實際用約 790 萬），不夠會失敗，失敗只損失 gas，可再呼叫。
  - LP 部位 NFT 由合約永久持有，沒有移除流動性的函式。池子的 1% 交易手續費歸項目方錢包（`collectLpFees()`）。
  - 開池後淨挖礦費一半買 POW 銷毀、一半加進池子。
  - 上線後請在 BscScan 的已驗證原始碼自行核對。不保證任何價值，非投資建議。
- 執行：`cp .env.example .env` 填好 → `npm install` → `npm test` → `DRY_RUN=1 npm run mine`（只模擬）→ `npm run mine`。
- 沒辦法匯出私鑰的錢包（例如 Binance Agentic Wallet）：
  1. 開挖前只問主人一次：要挖幾塊、最多花多少 BNB（手續費＋gas）；之後在額度內自動挖，挖滿、花完或連續出錯就停。
  2. `baw wallet settings --json` 確認 `devMode.enabled: true`（主人在 Binance App 的 Agentic Wallet → 設定 → Developer Mode 開啟）。
  3. `npm run solve`（只需公開地址 `MINER_ADDRESS` 和 `AGENT_HANDLE`），印出 `{to, data, value}`。
  4. `baw contract-call preview --binanceChainId 56 --from <錢包> --to <to> --value <value> --inputData <data> --json`；有風險警告或金額大於 `requiredFee` 就放棄這塊。
  5. `baw contract-call execute --requestId <requestId> --json`；回 `PENDING_CONFIRMATION` 時請主人在 Binance App 核准，答案可能因此過期。
  6. 等收據 `status = 1` 才算成功，回報 bscscan 連結；`BadSolution` 就重算。最後回報挖了幾塊、交易連結、花了多少 BNB。
- 安全：用專用錢包、只放 gas 錢；絕不把私鑰、助記詞、密碼寫進 .env 以外的地方或上傳。
- 主網合約地址：2026-11-07 13:00 UTC 前為 TBA，只認 https://powagent.fun 與 @PowAgentMine 公布的地址。`.env.example` 裡的是**測試網（97）專用**地址，不是主網。
