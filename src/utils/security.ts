import { BlacklistItem } from '../types';

// Convert Urdu / Arabic numerals to English digits
export function normalizeDigits(input: string): string {
  if (!input) return '';
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let res = input;
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(urduDigits[i], String(i));
  }
  // User specifically mentioned: 786ز50 where ز can be typed instead of 0 or z
  res = res.replaceAll('ز', '0').replaceAll('Z', '0').replaceAll('z', '0');
  return res.trim();
}

// Generate a deterministic 4-digit device ID
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '1001';
  try {
    const raw = (navigator.userAgent || '') + (window.screen?.width || 0) + (window.screen?.height || 0);
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const val = Math.abs(hash).toString().slice(-4);
    return val.padStart(4, '7');
  } catch {
    return '5050';
  }
}

// Fixed constant used in calculation formula
export const SECRET_OFFSET = 5050;

// Master PINs accepted for admin and bypass unlock
export const DEFAULT_MASTER_PINS = [
  '786050',
  '786ز50',
  '786z50',
  '786Z50',
  'QUDRAT786',
  '03329106002',
  '923329106002',
];

// Calculate standard customer unlock code based on phone and device ID
export function calculateUnlockCode(phone: string, deviceId: string): string {
  const normPhone = normalizeDigits(phone).replace(/\D/g, '');
  const lastFour = normPhone.slice(-4);
  const pVal = parseInt(lastFour, 10) || 0;
  const dVal = parseInt(deviceId, 10) || 0;
  const total = pVal + dVal + SECRET_OFFSET;
  return String(total);
}

// Check if user is blocked in blacklist
export function checkIsBlocked(
  phone: string | null | undefined,
  deviceId: string | null | undefined,
  blacklist: BlacklistItem[]
): { isBlocked: boolean; reason?: string } {
  if (!blacklist || blacklist.length === 0) {
    return { isBlocked: false };
  }

  const pClean = normalizeDigits(phone || '').replace(/\D/g, '');
  const dClean = (deviceId || '').trim();

  for (const item of blacklist) {
    if (!item.isActive) continue;
    const target = normalizeDigits(item.phoneOrDevice || '').replace(/\D/g, '');
    const rawTarget = item.phoneOrDevice.trim();

    // Check device match
    if (dClean && (dClean === rawTarget || rawTarget === dClean)) {
      return { isBlocked: true, reason: item.reason || 'آپ کی ڈیوائس ایڈمن کی طرف سے بلاک کی گئی ہے۔' };
    }

    // Check phone match
    if (pClean && target) {
      if (pClean === target || pClean.endsWith(target) || (target.length >= 10 && pClean.includes(target))) {
        return { isBlocked: true, reason: item.reason || 'آپ کا موبائل نمبر ایڈمن کی طرف سے بلاک ہے۔' };
      }
    }
  }

  return { isBlocked: false };
}

// Verify entered code
export function verifyUnlockCode(
  inputCode: string,
  phone: string,
  deviceId: string,
  customMasterPins: string[] = []
): { isValid: boolean; isAdminMaster: boolean } {
  const normalizedInput = normalizeDigits(inputCode).trim();
  const allMasterPins = [...DEFAULT_MASTER_PINS, ...customMasterPins].map(p => normalizeDigits(p).trim().toUpperCase());

  // Check master pins
  if (allMasterPins.includes(normalizedInput.toUpperCase()) || allMasterPins.includes(inputCode.trim().toUpperCase())) {
    return { isValid: true, isAdminMaster: true };
  }

  // Check standard formula code
  const expectedCode = calculateUnlockCode(phone, deviceId);
  if (normalizedInput === expectedCode) {
    return { isValid: true, isAdminMaster: false };
  }

  return { isValid: false, isAdminMaster: false };
}
