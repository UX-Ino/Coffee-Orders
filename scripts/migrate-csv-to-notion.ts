/*
  Placeholder migration script.
  Reads 커피데이터.csv and creates menu pages in Notion Menu DB.
  Fill in NotionService methods to enable.
*/
import fs from 'node:fs';
import path from 'node:path';

const csvPath = path.resolve(process.cwd(), '커피데이터.csv');

if (!fs.existsSync(csvPath)) {
  console.error('CSV 파일을 찾을 수 없습니다:', csvPath);
  process.exit(1);
}

const raw = fs.readFileSync(csvPath, 'utf8');
console.log('CSV 로드 완료 (미구현) — 행 수:', raw.split('\n').length);

