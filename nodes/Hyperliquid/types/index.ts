// Order types matching Hyperliquid API
export interface HyperliquidOrderWire {
  a: number;           // Asset index
  b: boolean;          // Buy side (true) or sell (false)
  p: string;           // Price (no trailing zeros)
  s: string;           // Size (no trailing zeros)
  r: boolean;          // Reduce only
  t: OrderTypeWire;    // Order type
  c?: string;          // Client order ID (optional)
}

export type OrderTypeWire =
  | { limit: { tif: 'Gtc' | 'Alo' | 'Ioc' } }
  | { trigger: { isMarket: boolean; triggerPx: string; tpsl: 'tp' | 'sl' } };

export interface PlaceOrderAction {
  type: 'order';
  orders: HyperliquidOrderWire[];
  grouping: 'na' | 'normalTpsl' | 'positionTpsl';
  builder?: { b: string; f: number };
}

export interface CancelOrderAction {
  type: 'cancel';
  cancels: Array<{ a: number; o: number }>;
}

export interface UpdateLeverageAction {
  type: 'updateLeverage';
  asset: number;
  isCross: boolean;
  leverage: number;
}

export interface HyperliquidSignature {
  r: string;
  s: string;
  v: number;
}

export interface ExchangeRequest {
  action: PlaceOrderAction | CancelOrderAction | UpdateLeverageAction;
  nonce: number;
  signature: HyperliquidSignature;
  vaultAddress?: string;
}

// Info endpoint types
export interface ClearinghouseState {
  marginSummary: {
    accountValue: string;
    totalNtlPos: string;
    totalRawUsd: string;
    totalMarginUsed: string;
  };
  crossMarginSummary: {
    accountValue: string;
    totalNtlPos: string;
  };
  assetPositions: AssetPosition[];
  withdrawable?: string;
}

export interface AssetPosition {
  position: {
    coin: string;
    szi: string;
    leverage: { type: string; value: number };
    entryPx: string;
    positionValue: string;
    unrealizedPnl: string;
    returnOnEquity: string;
    liquidationPx: string | null;
  };
}

export interface OpenOrder {
  coin: string;
  limitPx: string;
  oid: number;
  side: 'B' | 'A';
  sz: string;
  timestamp: number;
  orderType: string;
}

export type AllMids = Record<string, string>;

export interface Meta {
  universe: Array<{
    name: string;
    szDecimals: number;
    maxLeverage: number;
  }>;
}

export interface InfoRequest {
  type: string;
  user?: string;
  coin?: string;
  startTime?: number;
  [key: string]: unknown;
}
