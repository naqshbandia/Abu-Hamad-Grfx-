import {
  AdminSettings,
  BillRecord,
  BlacklistItem,
  RegisteredCustomer,
  ShopProfile
} from '../types';

export const STORAGE_KEYS = {
  STATUS: 'chak_app_status',
  USER_PHONE: 'chak_user_phone',
  USER_NAME: 'chak_user_name',
  SHOP_PROFILE: 'chak_shop_profile',
  BLACKLIST: 'chak_blacklist',
  CUSTOMERS: 'chak_registered_customers',
  SAVED_BILLS: 'chak_saved_bills',
  ADMIN_SETTINGS: 'chak_admin_settings',
  CALCULATOR_DATA: 'chak_calculator_data',
  BILL_COUNTER: 'chak_bill_counter',
};

export const DEFAULT_SHOP_PROFILE: ShopProfile = {
  shopName: 'میری دکان و ٹمبر مارکیٹ',
  proprietor: '',
  phone: '',
  city: '',
  tagline: 'چک، لکڑی و آرا مشین کٹنگ سپیشلسٹ'
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  adminPins: ['786050', '786ز50', '786z50', 'QUDRAT786'],
  masterPhone: '03329106002',
  masterName: 'Qudrat Ullah Khan',
  easypaisaNumber: '03329106002',
  easypaisaName: 'Qudrat Ullah Khan',
  singleFee: 500,
  pairFee: 850,
  whatsappSupportNumber: '923329106002',
};

export const DEFAULT_BLACKLIST: BlacklistItem[] = [
  {
    id: 'bl-1',
    phoneOrDevice: '03000000000',
    type: 'phone',
    reason: 'فیس ادا نہیں کی',
    addedAt: '2025-01-01',
    isActive: true
  }
];

export function getStoredShopProfile(): ShopProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOP_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load shop profile', e);
  }
  return DEFAULT_SHOP_PROFILE;
}

export function saveStoredShopProfile(profile: ShopProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.SHOP_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save shop profile', e);
  }
}

export function getStoredBlacklist(): BlacklistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLACKLIST);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load blacklist', e);
  }
  return DEFAULT_BLACKLIST;
}

export function saveStoredBlacklist(list: BlacklistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save blacklist', e);
  }
}

export function getStoredCustomers(): RegisteredCustomer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load customers', e);
  }
  return [];
}

export function saveStoredCustomers(customers: RegisteredCustomer[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers', e);
  }
}

export function getStoredBills(): BillRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_BILLS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved bills', e);
  }
  return [];
}

export function saveStoredBills(bills: BillRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_BILLS, JSON.stringify(bills));
  } catch (e) {
    console.error('Failed to save bills', e);
  }
}

export function getStoredAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load admin settings', e);
  }
  return DEFAULT_ADMIN_SETTINGS;
}

export function saveStoredAdminSettings(settings: AdminSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save admin settings', e);
  }
}

export function getNextBillNumber(): string {
  try {
    const current = parseInt(localStorage.getItem(STORAGE_KEYS.BILL_COUNTER) || '1', 10);
    const formatted = String(current).padStart(6, '0');
    localStorage.setItem(STORAGE_KEYS.BILL_COUNTER, String(current + 1));
    return formatted;
  } catch {
    return '000001';
  }
}
