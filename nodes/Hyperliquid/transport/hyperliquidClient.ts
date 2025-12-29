import { ethers } from 'ethers';
import * as msgpack from '@msgpack/msgpack';
import {
  HyperliquidSignature,
  PlaceOrderAction,
  CancelOrderAction,
  CancelByCloidAction,
  ModifyOrderAction,
  BatchModifyAction,
  ScheduleCancelAction,
  UpdateLeverageAction,
  UpdateIsolatedMarginAction,
  ExchangeRequest,
  InfoRequest,
  ExchangeAction,
} from '../types';

// Domain configurations for EIP-712 signing
const L1_DOMAIN = {
  name: 'Exchange',
  version: '1',
  chainId: 1337,
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

const AGENT_TYPES = {
  Agent: [
    { name: 'source', type: 'string' },
    { name: 'connectionId', type: 'bytes32' },
  ],
};

export class HyperliquidClient {
  private wallet: ethers.Wallet;
  private isMainnet: boolean;
  private baseUrl: string;
  private userAddress: string;
  private vaultAddress: string | null;

  constructor(
    privateKey: string,
    isMainnet: boolean = true,
    masterAddress?: string,
    vaultAddress?: string
  ) {
    this.wallet = new ethers.Wallet(privateKey);
    this.isMainnet = isMainnet;
    this.baseUrl = isMainnet
      ? 'https://api.hyperliquid.xyz'
      : 'https://api.hyperliquid-testnet.xyz';
    // For API wallets, use master address; for main wallets, derive from key
    this.userAddress = masterAddress || this.wallet.address;
    this.vaultAddress = vaultAddress || null;
  }

  // Remove trailing zeros from price/size strings
  private removeTrailingZeros(value: string): string {
    if (value.includes('.')) {
      return value.replace(/\.?0+$/, '');
    }
    return value;
  }

  // Normalize action object for consistent hashing
  private normalizeAction(action: unknown): unknown {
    if (typeof action !== 'object' || action === null) return action;

    if (Array.isArray(action)) {
      return action.map((item) => this.normalizeAction(item));
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(action as Record<string, unknown>)) {
      if ((key === 'p' || key === 's' || key === 'triggerPx') && typeof value === 'string') {
        result[key] = this.removeTrailingZeros(value);
      } else if (typeof value === 'object') {
        result[key] = this.normalizeAction(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  // Compute action hash for phantom agent signing
  private async actionHash(action: unknown, nonce: number): Promise<string> {
    const normalizedAction = this.normalizeAction(action);
    const encoded = msgpack.encode(normalizedAction);

    // Create 8-byte big-endian nonce
    const nonceBytes = new Uint8Array(8);
    const view = new DataView(nonceBytes.buffer);
    view.setBigUint64(0, BigInt(nonce), false);

    // Vault marker: 0x00 if no vault, or 0x01 + 20-byte address if vault
    let vaultBytes: Uint8Array;
    if (this.vaultAddress) {
      const addrBytes = ethers.getBytes(this.vaultAddress);
      vaultBytes = new Uint8Array([0x01, ...addrBytes]);
    } else {
      vaultBytes = new Uint8Array([0x00]);
    }

    // Concatenate: encoded action + nonce + vault
    const combined = new Uint8Array([
      ...new Uint8Array(encoded),
      ...nonceBytes,
      ...vaultBytes,
    ]);

    return ethers.keccak256(combined);
  }

  // Sign L1 action (orders, cancels, leverage updates, margin updates, etc.)
  async signL1Action(
    action: ExchangeAction
  ): Promise<ExchangeRequest> {
    const nonce = Date.now();
    const hash = await this.actionHash(action, nonce);

    const phantomAgent = {
      source: this.isMainnet ? 'a' : 'b',
      connectionId: hash,
    };

    const signature = await this.wallet.signTypedData(
      L1_DOMAIN,
      AGENT_TYPES,
      phantomAgent
    );

    const sig = ethers.Signature.from(signature);

    const request: ExchangeRequest = {
      action,
      nonce,
      signature: {
        r: sig.r,
        s: sig.s,
        v: sig.v,
      } as HyperliquidSignature,
    };

    if (this.vaultAddress) {
      request.vaultAddress = this.vaultAddress;
    }

    return request;
  }

  // Execute exchange action
  async exchange(
    action: ExchangeAction
  ): Promise<unknown> {
    const signedRequest = await this.signL1Action(action);

    const response = await fetch(`${this.baseUrl}/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signedRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Exchange request failed: ${error}`);
    }

    return response.json();
  }

  // Info endpoint queries (no signing required)
  async info(request: InfoRequest): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Info request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Convenience methods
  async getAllMids(): Promise<Record<string, string>> {
    return this.info({ type: 'allMids' }) as Promise<Record<string, string>>;
  }

  async getClearinghouseState(): Promise<unknown> {
    return this.info({ type: 'clearinghouseState', user: this.userAddress });
  }

  async getOpenOrders(): Promise<unknown[]> {
    return this.info({ type: 'openOrders', user: this.userAddress }) as Promise<unknown[]>;
  }

  async getMeta(): Promise<unknown> {
    return this.info({ type: 'meta' });
  }

  async getUserFills(startTime?: number): Promise<unknown[]> {
    const request: InfoRequest = { type: 'userFills', user: this.userAddress };
    if (startTime) {
      request.startTime = startTime;
    }
    return this.info(request) as Promise<unknown[]>;
  }

  get address(): string {
    return this.userAddress;
  }

  get signerAddress(): string {
    return this.wallet.address;
  }

  // ========== NEW INFO METHODS ==========

  // Get candle snapshot (OHLCV data)
  async getCandleSnapshot(
    coin: string,
    interval: string,
    startTime: number,
    endTime: number
  ): Promise<unknown[]> {
    return this.info({
      type: 'candleSnapshot',
      req: { coin, interval, startTime, endTime },
    }) as Promise<unknown[]>;
  }

  // Get funding history for a coin
  async getFundingHistory(
    coin: string,
    startTime: number,
    endTime?: number
  ): Promise<unknown[]> {
    const request: InfoRequest = {
      type: 'fundingHistory',
      coin,
      startTime,
    };
    if (endTime) {
      request.endTime = endTime;
    }
    return this.info(request) as Promise<unknown[]>;
  }

  // Get predicted fundings
  async getPredictedFundings(): Promise<unknown[]> {
    return this.info({ type: 'predictedFundings' }) as Promise<unknown[]>;
  }

  // Get recent trades for a coin
  async getRecentTrades(coin: string): Promise<unknown[]> {
    return this.info({ type: 'recentTrades', coin }) as Promise<unknown[]>;
  }

  // Get meta and asset contexts (mark price, OI, funding in real-time)
  async getMetaAndAssetCtxs(): Promise<unknown> {
    return this.info({ type: 'metaAndAssetCtxs' });
  }

  // Get order status by OID
  async getOrderStatus(oid: number): Promise<unknown> {
    return this.info({ type: 'orderStatus', user: this.userAddress, oid });
  }

  // Get historical orders
  async getHistoricalOrders(): Promise<unknown[]> {
    return this.info({ type: 'historicalOrders', user: this.userAddress }) as Promise<unknown[]>;
  }

  // Get user funding history
  async getUserFunding(startTime: number, endTime?: number): Promise<unknown[]> {
    const request: InfoRequest = {
      type: 'userFunding',
      user: this.userAddress,
      startTime,
    };
    if (endTime) {
      request.endTime = endTime;
    }
    return this.info(request) as Promise<unknown[]>;
  }

  // Get user fees
  async getUserFees(): Promise<unknown> {
    return this.info({ type: 'userFees', user: this.userAddress });
  }
}
