// scrape-passorder.mjs
// Usage:
//   node scrape-passorder.mjs passorder_fullmenu.csv --headed --debug --dump-json --normalize

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

// --------------------------- CLI ---------------------------
const argv = process.argv.slice(2);
const outCsvPath = argv.find(a => !a.startsWith("--")) || "passorder_fullmenu.csv";
const HEADED = argv.includes("--headed");
const DEBUG = argv.includes("--debug");
const DUMP_JSON = argv.includes("--dump-json");
const NORMALIZE = argv.includes("--normalize");

// 편의 로그
const log = (...args) => DEBUG && console.log(...args);

// --------------------------- 대상 지점 ---------------------------
// 필요 시 여기 배열에 점포 추가
const STORES = [
  {
    brand: "우지커피",
    store: "홍대동교점",
    url: "https://app.passorder.co.kr/normal/1a0ad87c-334d-4e7c-aec1-3a46881e01c1",
  },
  {
    brand: "카페게이트",
    store: "동교점",
    url: "https://app.passorder.co.kr/normal/b645519d-2ee5-4338-a8c1-cc1d69629ff4",
  },
];

// --------------------------- 유틸 ---------------------------
const SKIP_CATEGORIES = [/^\s*선착순\s*한정\s*이벤트\s*$/];

const cleanse = (s) =>
  (s ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const norm = (s) => (NORMALIZE ? cleanse(s) : (s ?? "").trim());

const toIntOrEmpty = (s) => {
  const n = (s ?? "").replace(/[^\d]/g, "");
  return n ? Number(n) : "";
};

// CSV 이스케이프
const csvEscape = (v) => {
  if (v === null || v === undefined) v = "";
  v = String(v);
  if (v.includes('"') || v.includes(",") || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
};

// 쓰기
const writeCsv = (rows, outPath) => {
  const header = [
    "brand",
    "store",
    "category",
    "item_name_ko",
    "item_name_en",
    "item_desc_ko",
    "price_krw",
    "options_json",
    "source_url",
    "captured_at",
    "note",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(header.map((h) => csvEscape(r[h] ?? "")).join(","));
  }
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
};

// --------------------------- 핵심 스크레이퍼 ---------------------------
async function getCategories(page) {
  // #category-list 하위의 data-category와 h3 텍스트
  const cats = await page.evaluate(() => {
    const list = document.querySelector("#category-list");
    if (!list) return [];
    const items = Array.from(list.querySelectorAll("[data-category]"));
    return items
      .map((el) => {
        const id = (el.getAttribute("data-category") || "").trim();
        const name = ((el.querySelector("h3") || {}).textContent || "").trim();
        return id && name ? { id, name } : null;
      })
      .filter(Boolean);
  });

  return cats || [];
}

async function scrollIntoViewOfCategory(page, catId) {
  // 섹션 컨테이너가 lazy-load/virtualize일 수 있어, 내부를 천천히 스크롤
  try {
    await page.evaluate(async (id) => {
      const sel = `[id="${id.replace(/"/g, '\\"')}"]`;
      const box = document.querySelector(sel);
      if (!box) return;

      const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
      let last = -1;
      let sameCount = 0;

      for (let i = 0; i < 20; i++) {
        box.scrollTop = box.scrollHeight;
        await sleep(150);
        const h = box.scrollHeight;
        if (h === last) {
          sameCount++;
          if (sameCount >= 2) break;
        } else {
          sameCount = 0;
          last = h;
        }
      }
    }, catId);
  } catch (_e) {
    // 조용히 패스
  }
}

async function extractCategoryItems(page, cat) {
  const { id: catId, name: catNameRaw } = cat;
  const catName = norm(catNameRaw);

  // 제외 카테고리 체크
  if (SKIP_CATEGORIES.some((rx) => rx.test(catName))) {
    return { catName, items: [], skipped: true };
  }

  // 필요 시 섹션 내 스크롤
  await scrollIntoViewOfCategory(page, catId);

  // 해당 카테고리 id 섹션에서 .cursor-pointer 카드들 긁기
  const items = await page.evaluate(
    ({ id, normalize }) => {
      const clean = (s) =>
        normalize
          ? (s || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim()
          : (s || "").trim();

      const sel = `[id="${id.replace(/"/g, '\\"')}"]`;
      const root = document.querySelector(sel);
      if (!root) return [];

      const cards = Array.from(root.querySelectorAll(".cursor-pointer"));
      return cards.map((card) => {
        const nameEl =
          card.querySelector(".mb-4.b1-extrabold")

        const priceEl = card.querySelector(".flex.items-end.b1-extrabold");
        const descEl = card.querySelector(".mt-8.w-full.truncate.b3-regular");

        // 이미지(src) = size-64 overflow-hidden 내부 img
        const imgEl = card.querySelector(".size-64.overflow-hidden img");

        const item_name_ko = clean(nameEl ? nameEl.textContent : "");
        const price_raw = clean(priceEl ? priceEl.textContent : "");
        const item_desc_ko = clean(descEl ? descEl.textContent : "");
        const source_url = imgEl ? imgEl.getAttribute("src") || "" : "";

        return {
          item_name_ko,
          price_raw,
          item_desc_ko,
          source_url,
        };
      });
    },
    { id: catId, normalize: NORMALIZE }
  );

  return { catName, items, skipped: false };
}

async function scrapeStore(page, storeMeta) {
  const { brand, store, url } = storeMeta;

  console.log(`[${store}] goto: ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });

  // 콘솔 에러도 보고 싶으면
  if (DEBUG) {
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log("[console] error:", msg.text());
      }
    });
  }

  // 카테고리 등장 대기
  try {
    await page.waitForSelector("#category-list [data-category] h3", {
      timeout: 15_000,
    });
  } catch (e) {
    log(`[${store}] category list not found, trying anyway...`);
  }

  // 카테고리 수집
  const allCats = await getCategories(page);
  console.log(
    "[cats]",
    allCats.map((c) => c.name)
  );

  // 필터링(스킵)
  const cats = allCats.filter(
    (c) => !SKIP_CATEGORIES.some((rx) => rx.test(norm(c.name)))
  );

  const skipped = allCats
    .filter((c) => !cats.find((x) => x.id === c.id))
    .map((c) => c.name);
  if (skipped.length) log(`[${store}] skip cats: ${skipped.join(", ")}`);

  let rows = [];
  for (const cat of cats) {
    const { catName, items } = await extractCategoryItems(page, cat);

    log(`[${store}] cat="${catName}" items=${items.length}`);

    const nowIso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const mapped = items
      .filter((it) => it.item_name_ko || it.price_raw || it.source_url)
      .map((it) => ({
        brand,
        store,
        category: catName,
        item_name_ko: it.item_name_ko,
        item_name_en: "",
        item_desc_ko: it.item_desc_ko,
        price_krw: toIntOrEmpty(it.price_raw),
        options_json: "",
        // 요구사항: source_url은 이미지 src를 넣는다
        source_url: it.source_url,
        captured_at: nowIso,
        note: "",
      }));

    rows.push(...mapped);
  }

  return rows;
}

// --------------------------- 메인 ---------------------------
(async () => {
  const browser = await puppeteer.launch({
    headless: !HEADED,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    defaultViewport: { width: 1366, height: 900 },
  });

  try {
    const page = await browser.newPage();

    // 살짝 여유
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
    );

    let all = [];
    for (const s of STORES) {
      const rows = await scrapeStore(page, s);
      console.log(`[${s.store}] rows: ${rows.length}`);
      all.push(...rows);
    }

    writeCsv(all, outCsvPath);
    console.log(`Saved: ${outCsvPath} (${all.length} rows)`);

    if (DUMP_JSON) {
      const jsonPath = outCsvPath.replace(/\.csv$/i, ".json");
      fs.writeFileSync(jsonPath, JSON.stringify(all, null, 2), "utf8");
      console.log(`Saved: ${jsonPath}`);
    }
  } catch (e) {
    console.error("ERROR:", e.message || e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();