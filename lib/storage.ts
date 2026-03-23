import fs from 'fs';
import path from 'path';
import { UploadRecord } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const TOKEN_FILE = path.join(DATA_DIR, 'tokens.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Upload History

export function getHistory(): UploadRecord[] {
  ensureDataDir();
  if (!fs.existsSync(HISTORY_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(raw) as UploadRecord[];
  } catch {
    return [];
  }
}

export function saveHistory(records: UploadRecord[]): void {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export function addHistoryRecord(record: UploadRecord): void {
  const records = getHistory();
  records.unshift(record);
  saveHistory(records);
}

export function updateHistoryRecord(id: string, updates: Partial<UploadRecord>): void {
  const records = getHistory();
  const index = records.findIndex((r) => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    saveHistory(records);
  }
}

export function getHistoryRecord(id: string): UploadRecord | null {
  const records = getHistory();
  return records.find((r) => r.id === id) ?? null;
}

// Token Storage

export interface StoredTokens {
  facebook?: {
    accessToken: string;
    pageId?: string;
    pageName?: string;
    instagramAccountId?: string;
    instagramUsername?: string;
    expiresAt?: number;
  };
}

export function getTokens(): StoredTokens {
  ensureDataDir();
  if (!fs.existsSync(TOKEN_FILE)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(TOKEN_FILE, 'utf-8');
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return {};
  }
}

export function saveTokens(tokens: StoredTokens): void {
  ensureDataDir();
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
}

export function getFacebookToken(): StoredTokens['facebook'] | null {
  const tokens = getTokens();
  return tokens.facebook ?? null;
}

export function saveFacebookToken(data: NonNullable<StoredTokens['facebook']>): void {
  const tokens = getTokens();
  tokens.facebook = data;
  saveTokens(tokens);
}

export function clearFacebookToken(): void {
  const tokens = getTokens();
  delete tokens.facebook;
  saveTokens(tokens);
}
