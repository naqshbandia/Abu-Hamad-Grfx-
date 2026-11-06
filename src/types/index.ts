export interface ChakConfig {
  name: string;
  data: [number, number][]; // [size, cutting]
}

export interface ChakRow {
  id: string;
  size: number;
  cutting: number;
  qty: number | string;
  rowTotal: number;
  hundred: number;
}

export interface ShopProfile {
  shopName: string;
  proprietor: string;
  phone: string;
  city: string;
  tagline: string;
}

export interface BillItem {
  size: number;
  cutting: number;
  qty: number;
  rowTotal: number;
  hundred: number;
}

export interface BillRecord {
  id: string;
  billNo: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  timestamp: number;
  chakType: string;
  items: BillItem[];
  grandTotal: number;
  grandHundred: number;
  rateFotwari: number;
  rateHundred: number;
  fotwariAmount: number;
  hundredAmount: number;
  finalTotalAmount: number;
  shopDetails: ShopProfile;
}

export interface BlacklistItem {
  id: string;
  phoneOrDevice: string;
  type: 'phone' | 'device' | 'all';
  reason: string;
  addedAt: string;
  isActive: boolean;
}

export interface RegisteredCustomer {
  id: string;
  name: string;
  phone: string;
  deviceId: string;
  shopName: string;
  registeredAt: string;
  status: 'active' | 'pending' | 'blocked';
  unlockCode?: string;
  feePaid?: boolean;
}

export interface AdminSettings {
  adminPins: string[];
  masterPhone: string;
  masterName: string;
  easypaisaNumber: string;
  easypaisaName: string;
  singleFee: number;
  pairFee: number;
  whatsappSupportNumber: string;
}
