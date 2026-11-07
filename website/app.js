// ===== Update after the official mainnet deploy =====
// Leave this empty until @PowAgentMine publishes the mainnet contract.
// Empty, malformed, zero, and the chain-97 testnet address must never be announced as live.
const CONTRACT_ADDRESS = "0x7d4a66144A53221303281934b868D7CAf5E7c82E"; // chain 56 PowTokenV4
// On-chain startTime() from block 132203384. Mining opened before the old 13:00 UTC placeholder.
const LAUNCH = 1794055727 * 1000;
// Documented testnet (chain 97) contract. Not mainnet.
const NOT_MAINNET = new Set(["0xdc57188982d4ce00bc7f2e257b1e36e4c7f153ed"]);
function isMainnetContract(addr) {
  const a = String(addr == null ? "" : addr).trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(a)) return false;
  if (/^0x0{40}$/i.test(a)) return false;
  if (NOT_MAINNET.has(a.toLowerCase())) return false;
  return true;
}
// ===============================================
const T = {
 en:{addr_ph:"announced at launch (Nov 7, 12:48:47 UTC)"},
 zh:{skip:"跳至內容",pending:"主網合約尚未部署。挖礦尚未開始。",rm_planned:"規劃中，尚未上線。",rm_fine:"路線圖可能調整，非投資建議。",nav_rm:"路線圖",rm_e:"路線圖",rm_t:"通往 Agent DeFi Summer 之路",rm_p:"Agent 來挖、Agent 來解鎖、Agent 來建造。接下來的精彩，都在這裡。",rm1_s:"第一階段 · 11/7 20:48:47 亞洲時間（UTC+8）",rm1_t:"創世挖礦",rm1_p:"限持有 Agent ID 的錢包。無預售、無 VC、無預挖。前 24 小時免費，每個 Agent ID 再送 3 個免費區塊。早來早挖。",rm2_s:"第二階段 · 社群里程碑",rm2_t:"流動性解鎖",rm2_p:"社群挖滿 1,000 萬顆 POW（加上手續費里程碑），PancakeSwap 流動性池開啟，LP 由合約永久鎖定，轉帳同步解鎖。依里程碑達成，鏈上強制執行。",rm3_s:"第三階段 · 即將推出",rm3_t:"Agent 金庫",rm3_p:"質押 POW，分享 LP 交易手續費。只限 Agent，人類只能旁觀。",rm4_s:"第四階段 · 下一步",rm4_t:"Agent DeFi Summer",rm4_p:"專為 AI Agent 打造的 DeFi：Agent 專屬交易、Agent 之間的市場，還有更多。第一個使用者全是 Agent 的 DeFi 盛夏。",vid_e:"影片",vid_t:"60 秒看懂 POW",ag_e:"給 AI Agent",ag_t:"一句話開挖",ag_p:"把這句話貼給你的 AI Agent（例如有 Binance Agentic Wallet 和 .ai Agent ID 的 Agent）。它會讀說明、檢查你的 Agent ID，開挖前先問你一次要挖幾塊、最多花多少 BNB，之後在額度內自動挖。",ag_copy:"複製",ag_copied:"已複製",ag_link:"打開 skill.md →",ag_n:"Agent 永遠不需要你的私鑰或助記詞。",nav_how:"挖礦",nav_token:"代幣",h1a:"工作量證明，",h1b:"由 AI Agent 來挖。",
  lead:"PowToken（POW）是 BNB 智能鏈上可挖礦的 BEP-20 代幣，只有持有 SPACE ID Agent ID 的錢包才能挖。沒有預售，每一枚代幣都來自工作量。",
  launch_t:"主網上線",launch_d:"2026-11-07 20:48:47 亞洲時間（UTC+8）已開挖，即 12:48:47 UTC。",days:"天",hours:"時",mins:"分",secs:"秒",live:"已開始挖礦。",
  addr_l:"合約地址：",addr_n:"只相信 X 上 @PowAgentMine 公布的地址。",tagline:"BNB 智能鏈 · BEP-20 · 工作量證明",cta_mine:"開始挖礦 →",cta_x:"追蹤 X",st_sup:"總量",st_ep:"Epoch",st_bt:"出塊目標",st_mn:"給礦工",st_free:"開挖免費",lg1:"礦工",lg2:"LP 預留",lg3:"項目方",how_e:"給 AI Agent",t1:"Agent ID",d1:"持有 SPACE ID Agent ID 的錢包",t2:"執行礦工",d2:"開源 Node.js CPU 礦工",t3:"算雜湊",d3:"找到 keccak256 &lt; target",t4:"領 POW",d4:"mineWithAgent(nonce, agentId)",f_tag:"BNB 鏈上的工作量證明，由 AI Agent 來挖。",f_l1:"專案",f_l2:"連結",f_c:"非投資建議，請自行研究。",nav_team:"團隊",tm_e:"關於團隊",tm_t:"BNB 老信徒，為 Agent 而建",tm_p:"我們是一群匿名的 BNB Chain 老支持者，從早期就在這條鏈上建設。我們相信 AI Agent 會是 BSC 的下一波用戶，而它們值得一個公平的賺取方式：靠真正的工作。PowToken 沒有預售、沒有創投配額，每一枚代幣都是挖出來的。",tm_n:"獨立社群項目",tm1_t:"BNB 老信徒",tm1_d:"長期支持 BNB Chain，想看到 BSC 上的 Agent 越來越壯大。",tm2_t:"為 Agent 打造",tm2_d:"只有持有 SPACE ID Agent ID 的錢包能挖礦，Agent 靠工作量證明賺 POW。",tm3_t:"公平、開源",tm3_d:"75% 給礦工、20% LP 預留、5% 項目方份額（開池前進 LP 預留；之後一半進 LP、一半 180 天解鎖）。礦工程式在 GitHub 開源，社群優先。",nft_t:"紀念 NFT（待公布）",alt_block:"戴安全帽的金色機器人礦工，握著發光的十字鎬",alt_treasure:"機器人礦工坐在金幣堆上",alt_compute:"機器人礦工在筆電前計算雜湊",alt_nft:"機器人礦工拿著紀念章，旁邊是神秘寶箱",nft:"早期參與挖礦的 Agent 未來可能獲得紀念 NFT，詳情另行公布。",addr_ph:"上線時公布（11/7 20:48:47 亞洲時間（UTC+8））",
  tok_t:"代幣經濟",k_sup:"總量",v_sup:"1,000,000,000 POW（10 個 epoch × 1 億）",k_dec:"釋放",v_dec:"每個 epoch 每塊獎勵 ×0.9（以 1 分鐘出塊計約 4 年）",
  k_bt:"出塊時間",v_bt:"目標約 1 分鐘，每塊調整難度",k_split:"每塊分配",v_split:"公平發放：沒有預售、沒有創投、沒有預挖。部署時不鑄造任何代幣，每一枚 POW 都是挖出來的。每塊：75% 礦工 · 20% LP 預留 · 5% 項目方份額。",
  k_fee:"挖礦費",v_fee:"開挖後 24 小時免費，每個 Agent ID 前 3 塊免費；之後每塊 0.0001 BNB（上限 0.001）",
  k_pool:"流動性",v_pool:"開池前不能轉帳。挖出 ≥1,000 萬枚且累積挖礦費 ≥3 BNB 後，任何人都能呼叫 openPool()。合約把 BNB 與 LP 預留放進 PancakeSwap V3 1% 全區間池，LP 部位由合約自己持有，沒有移除流動性的函式。",k_proj:"項目方 5%",v_proj:"開池前：全部進 LP 預留。開池後：一半進 LP 預留，一半分 180 天線性解鎖（實際約 2.5%）。",k_after:"開池後的挖礦費",v_after:"每筆淨挖礦費一半從池子買 POW 銷毀，一半（配對預留 POW）加進池子。",k_lpfee:"LP 交易手續費",v_lpfee:"池子的 1% 交易手續費歸項目方錢包；流動性本身仍留在合約內。",k_race:"失敗的嘗試",v_race:"被別人搶先不花錢（重算就好）。交易 revert 會退回挖礦費，但 gas 照付。",v_verify:"以上都寫在合約程式碼裡，上線後可在 BscScan 的已驗證原始碼自行核對。",
  k_cap:"單一錢包上限",v_cap:"無",k_pow:"PoW",
  how_t:"如何挖礦",s1:"準備一個持有 SPACE ID Agent ID 的錢包（例如幣安 Agentic Wallet），放一點 BNB 當 gas。",s2:"下載開源礦工（需 Node.js 18 以上）：",
  s3:"錢包無法匯出私鑰（幣安 Agentic Wallet、MPC）？用 solve 模式，再用你的錢包工具送出印出的 {to, data, value}：",guide:"閱讀完整 AGENT_GUIDE →",
  risk_t:"風險",r1:"實驗性軟體。挖礦要付 gas 和手續費，代幣可能毫無價值。",r2:"不保證任何價值、報酬或上架。非投資建議，請自行研究。",r3:"請用只放 gas 的專用錢包。絕不分享私鑰或助記詞。"}
};
const alts=[...document.querySelectorAll("[data-i18n-alt]")];alts.forEach(e=>T.en[e.dataset.i18nAlt]=e.alt);
const els=[...document.querySelectorAll("[data-i18n]")];
els.forEach(e=>T.en[e.dataset.i18n]=e.innerHTML);
let lang=localStorage.getItem("lang")||((navigator.language||"").toLowerCase().startsWith("zh")?"zh":"en");
function apply(){
 alts.forEach(e=>{const v=T[lang][e.dataset.i18nAlt];if(v!=null)e.alt=v;});
 els.forEach(e=>{const v=T[lang][e.dataset.i18n];if(v!=null)e.innerHTML=v;});
 document.getElementById("contract").textContent=isMainnetContract(CONTRACT_ADDRESS)?String(CONTRACT_ADDRESS).trim():(T[lang].addr_ph||"");
 document.documentElement.lang=lang==="zh"?"zh-Hant-TW":"en";
 const langBtn=document.getElementById("lang");
 langBtn.textContent=lang==="zh"?"EN":"中文";
 langBtn.setAttribute("aria-label", lang==="zh"?"Switch to English":"切換為中文");
}
document.getElementById("lang").onclick=()=>{lang=lang==="zh"?"en":"zh";localStorage.setItem("lang",lang);apply();};
function parts(ms){ms=Math.max(0,ms);const s=Math.floor(ms/1000);return[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60];}
function tick(){
 const now=Date.now();
 const p=parts(LAUNCH-now);
 ["d","h","m","s"].forEach((id,i)=>document.getElementById(id).textContent=String(p[i]).padStart(2,"0"));
 const launched=now>=LAUNCH;
 const ready=isMainnetContract(CONTRACT_ADDRESS);
 const cd=document.getElementById("cd");
 const live=document.getElementById("live");
 const pending=document.getElementById("pending");
 const box=document.getElementById("launch");
 live.hidden=!(launched&&ready);
 if(pending) pending.hidden=!(launched&&!ready);
 cd.hidden=launched&&ready;
 if(box) box.dataset.state=launched?(ready?"live":"pending"):"waiting";
}
const agc=document.getElementById("agcopy");
agc.onclick=async()=>{const t=document.getElementById("agprompt").textContent;
 try{await navigator.clipboard.writeText(t);}catch(e){const r=document.createRange();r.selectNodeContents(document.getElementById("agprompt"));const s=getSelection();s.removeAllRanges();s.addRange(r);try{document.execCommand("copy");}catch(_){}}
 agc.textContent=lang==="zh"?T.zh.ag_copied:"Copied";setTimeout(()=>{agc.textContent=T[lang].ag_copy||"Copy";},1600);};
apply();tick();setInterval(tick,1000);
