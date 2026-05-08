/**
 * MEANDER Lucky Wheel — Google Sheets backend (Apps Script).
 *
 * SETUP
 * -----
 * 1. Tạo 1 Google Sheet mới (rỗng).
 * 2. Trong Sheet đó: Extensions → Apps Script.
 * 3. Xóa code mặc định, paste toàn bộ file này vào.
 * 4. Save (đặt project name gì cũng được).
 * 5. Deploy → New deployment:
 *      - Type: Web app
 *      - Execute as: Me (your account)
 *      - Who has access: Anyone
 *    Bấm Deploy. Lần đầu sẽ phải authorize — bấm "Advanced" → "Go to ... (unsafe)" → Allow.
 * 6. Copy "Web app URL" (kết thúc bằng /exec).
 * 7. Paste URL đó vào src/data/constants.js — biến SHEETS_API_URL.
 *
 * Khi chạy lần đầu, script tự tạo 2 sheet "Inventory" và "History" với
 * dữ liệu mặc định cho 4 chi nhánh.
 *
 * MUỐN UPDATE CODE? Mỗi lần thay đổi code → Deploy → Manage deployments
 * → bấm pencil icon → "New version" → Deploy. URL không đổi.
 */

const SHEET_INVENTORY = 'Inventory';
const SHEET_HISTORY   = 'History';
const BRANCHES = ['1948', 'taipei', 'osaka', 'saigon'];

// Phải khớp với DEFAULT_REWARDS bên frontend (constants.js).
// Chỉ giữ những field cần lưu trên Sheet — image/emoji được frontend tự gắn.
const DEFAULT_REWARDS = [
  { id: 'toiletry',   display_name: 'Waterproof Toiletry Bag',  tier: 'rare',     probability_weight: 5,  inventory_count: 15 },
  { id: 'toothpaste', display_name: 'Konnyaku Toothpaste',      tier: 'common',   probability_weight: 35, inventory_count: 50 },
  { id: 'toothbrush', display_name: 'Organic Bamboo Toothbrush', tier: 'common',  probability_weight: 30, inventory_count: 50 },
  { id: 'laundry',    display_name: 'Eco Fabric Laundry Mousse', tier: 'common',  probability_weight: 28, inventory_count: 40 },
  { id: 'mist',       display_name: 'Antibacterial Garment Mist', tier: 'uncommon', probability_weight: 15, inventory_count: 25 },
  { id: 'towel',      display_name: 'SHIZUKU Osaka Towel',      tier: 'uncommon', probability_weight: 12, inventory_count: 20 },
  { id: 'socks',      display_name: '10th Anniversary Socks',   tier: 'ultra',    probability_weight: 3,  inventory_count: 10 },
];

// ── Sheet bootstrap ─────────────────────────────────────────────────────
function ensureSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let inv = ss.getSheetByName(SHEET_INVENTORY);
  if (!inv) {
    inv = ss.insertSheet(SHEET_INVENTORY);
    inv.appendRow(['branch', 'reward_id', 'display_name', 'tier', 'inventory_count', 'probability_weight']);
    inv.setFrozenRows(1);
    BRANCHES.forEach(branch => {
      DEFAULT_REWARDS.forEach(r => {
        inv.appendRow([branch, r.id, r.display_name, r.tier, r.inventory_count, r.probability_weight]);
      });
    });
  }

  let hist = ss.getSheetByName(SHEET_HISTORY);
  if (!hist) {
    hist = ss.insertSheet(SHEET_HISTORY);
    hist.appendRow(['timestamp', 'branch', 'reward_id', 'display_name']);
    hist.setFrozenRows(1);
  }

  return { inv, hist };
}

// ── Read full state ─────────────────────────────────────────────────────
function getState() {
  const { inv, hist } = ensureSheets();

  const state = {};
  BRANCHES.forEach(b => state[b] = { rewards: [], history: [] });

  const invData = inv.getDataRange().getValues().slice(1);
  invData.forEach(row => {
    const [branch, reward_id, display_name, tier, inventory_count, probability_weight] = row;
    if (state[branch]) {
      state[branch].rewards.push({
        id: reward_id,
        display_name: display_name,
        tier: tier,
        inventory_count: Number(inventory_count) || 0,
        probability_weight: Number(probability_weight) || 0,
      });
    }
  });

  const histData = hist.getDataRange().getValues().slice(1);
  histData.forEach(row => {
    const [ts, branch, reward_id, display_name] = row;
    if (state[branch]) {
      state[branch].history.push({
        ts: ts instanceof Date ? ts.getTime() : new Date(ts).getTime(),
        branch: branch,
        reward_id: reward_id,
        display_name: display_name,
      });
    }
  });

  // Mới nhất trước
  BRANCHES.forEach(b => state[b].history.sort((a, b) => b.ts - a.ts));
  return state;
}

// ── Helpers ─────────────────────────────────────────────────────────────
function findInventoryRow(sheet, branch, reward_id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(branch) && String(data[i][1]) === String(reward_id)) {
      return i + 1; // 1-indexed
    }
  }
  return -1;
}

// ── Mutations (all locked to prevent races) ─────────────────────────────
function claim(branch, reward_id, display_name) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const { inv, hist } = ensureSheets();
    const row = findInventoryRow(inv, branch, reward_id);
    if (row > 0) {
      const cell = inv.getRange(row, 5); // inventory_count
      const cur  = Number(cell.getValue()) || 0;
      cell.setValue(Math.max(0, cur - 1));
    }
    hist.appendRow([new Date(), branch, reward_id, display_name]);
  } finally {
    lock.releaseLock();
  }
  return getState();
}

function updateReward(branch, reward_id, field, value) {
  const colMap = { inventory_count: 5, probability_weight: 6 };
  const col = colMap[field];
  if (!col) throw new Error('unknown field: ' + field);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const { inv } = ensureSheets();
    const row = findInventoryRow(inv, branch, reward_id);
    if (row > 0) {
      inv.getRange(row, col).setValue(Math.max(0, Number(value) || 0));
    }
  } finally {
    lock.releaseLock();
  }
  return getState();
}

function resetBranch(branch) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const { inv, hist } = ensureSheets();

    // Reset inventory_count + probability_weight cho branch về default
    DEFAULT_REWARDS.forEach(r => {
      const row = findInventoryRow(inv, branch, r.id);
      if (row > 0) {
        inv.getRange(row, 5).setValue(r.inventory_count);
        inv.getRange(row, 6).setValue(r.probability_weight);
      } else {
        inv.appendRow([branch, r.id, r.display_name, r.tier, r.inventory_count, r.probability_weight]);
      }
    });

    // Xóa history của branch (giữ nguyên branch khác)
    const histData = hist.getDataRange().getValues();
    for (let i = histData.length - 1; i >= 1; i--) {
      if (String(histData[i][1]) === String(branch)) {
        hist.deleteRow(i + 1);
      }
    }
  } finally {
    lock.releaseLock();
  }
  return getState();
}

function importState(state) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let inv  = ss.getSheetByName(SHEET_INVENTORY);
    let hist = ss.getSheetByName(SHEET_HISTORY);
    if (inv)  ss.deleteSheet(inv);
    if (hist) ss.deleteSheet(hist);

    inv = ss.insertSheet(SHEET_INVENTORY);
    inv.appendRow(['branch', 'reward_id', 'display_name', 'tier', 'inventory_count', 'probability_weight']);
    inv.setFrozenRows(1);

    hist = ss.insertSheet(SHEET_HISTORY);
    hist.appendRow(['timestamp', 'branch', 'reward_id', 'display_name']);
    hist.setFrozenRows(1);

    BRANCHES.forEach(branch => {
      const rewards = (state && state[branch] && state[branch].rewards) || DEFAULT_REWARDS;
      rewards.forEach(r => {
        inv.appendRow([branch, r.id, r.display_name, r.tier || 'common',
          Number(r.inventory_count) || 0, Number(r.probability_weight) || 0]);
      });
      const history = (state && state[branch] && state[branch].history) || [];
      history.forEach(h => {
        hist.appendRow([new Date(h.ts || Date.now()), branch, h.reward_id, h.display_name]);
      });
    });
  } finally {
    lock.releaseLock();
  }
  return getState();
}

// ── HTTP entrypoints ────────────────────────────────────────────────────
function doGet(e) {
  return jsonOut({ ok: true, state: getState() });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    let state;
    switch (body.action) {
      case 'getState':      state = getState(); break;
      case 'claim':         state = claim(body.branch, body.reward_id, body.display_name); break;
      case 'updateReward':  state = updateReward(body.branch, body.reward_id, body.field, body.value); break;
      case 'reset':         state = resetBranch(body.branch); break;
      case 'importState':   state = importState(body.state); break;
      default: throw new Error('unknown action: ' + body.action);
    }
    return jsonOut({ ok: true, state: state });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err && err.message || err) });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
