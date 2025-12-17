import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';
import { HyperliquidClient } from './transport/hyperliquidClient';
import { HyperliquidOrderWire, OrderTypeWire, Meta, ClearinghouseState, AssetPosition } from './types';

export class Hyperliquid implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Hyperliquid',
    name: 'hyperliquid',
    icon: 'file:hyperliquid.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Trade perpetuals and query data on Hyperliquid DEX',
    defaults: {
      name: 'Hyperliquid',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'hyperliquidApi',
        required: true,
      },
    ],
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Order', value: 'order' },
          { name: 'Position', value: 'position' },
          { name: 'Account', value: 'account' },
          { name: 'Market Data', value: 'marketData' },
        ],
        default: 'order',
      },

      // ========== ORDER OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['order'] } },
        options: [
          { name: 'Place Market Order', value: 'marketOrder', action: 'Place market order' },
          { name: 'Place Limit Order', value: 'limitOrder', action: 'Place limit order' },
          { name: 'Place Take Profit', value: 'takeProfit', action: 'Place take profit order' },
          { name: 'Place Stop Loss', value: 'stopLoss', action: 'Place stop loss order' },
          { name: 'Cancel Order', value: 'cancel', action: 'Cancel order' },
          { name: 'Cancel All Orders', value: 'cancelAll', action: 'Cancel all orders' },
          { name: 'Get Open Orders', value: 'getOpen', action: 'Get open orders' },
          { name: 'Get Order History', value: 'getHistory', action: 'Get order history' },
        ],
        default: 'limitOrder',
      },

      // Common order fields
      {
        displayName: 'Asset',
        name: 'asset',
        type: 'string',
        default: 'BTC',
        placeholder: 'BTC, ETH, SOL...',
        displayOptions: {
          show: {
            resource: ['order'],
            operation: ['marketOrder', 'limitOrder', 'takeProfit', 'stopLoss', 'cancel'],
          },
        },
        description: 'Trading pair symbol (e.g., BTC for BTC-PERP)',
      },
      {
        displayName: 'Side',
        name: 'side',
        type: 'options',
        options: [
          { name: 'Buy / Long', value: 'buy' },
          { name: 'Sell / Short', value: 'sell' },
        ],
        default: 'buy',
        displayOptions: {
          show: {
            resource: ['order'],
            operation: ['marketOrder', 'limitOrder', 'takeProfit', 'stopLoss'],
          },
        },
      },
      {
        displayName: 'Size',
        name: 'size',
        type: 'number',
        default: 0.001,
        typeOptions: { minValue: 0, numberPrecision: 8 },
        displayOptions: {
          show: {
            resource: ['order'],
            operation: ['marketOrder', 'limitOrder', 'takeProfit', 'stopLoss'],
          },
        },
        description: 'Order size in base asset units',
      },
      {
        displayName: 'Price',
        name: 'price',
        type: 'number',
        default: 0,
        typeOptions: { numberPrecision: 2 },
        displayOptions: {
          show: {
            resource: ['order'],
            operation: ['limitOrder'],
          },
        },
        description: 'Limit price for the order',
      },
      {
        displayName: 'Slippage %',
        name: 'slippage',
        type: 'number',
        default: 0.5,
        typeOptions: { minValue: 0.1, maxValue: 10 },
        displayOptions: {
          show: {
            resource: ['order'],
            operation: ['marketOrder'],
          },
        },
        description: 'Maximum slippage tolerance for market orders',
      },
      {
        displayName: 'Trigger Price',
        name: 'triggerPrice',
        type: 'number',
        default: 0,
        typeOptions: { numberPrecision: 2 },
        displayOptions: {
          show: {
            resource: ['order'],
            operation: ['takeProfit', 'stopLoss'],
          },
        },
        description: 'Price at which the TP/SL order triggers',
      },
      {
        displayName: 'Time In Force',
        name: 'timeInForce',
        type: 'options',
        options: [
          { name: 'Good Til Canceled (GTC)', value: 'Gtc' },
          { name: 'Immediate Or Cancel (IOC)', value: 'Ioc' },
          { name: 'Post Only (ALO)', value: 'Alo' },
        ],
        default: 'Gtc',
        displayOptions: {
          show: {
            resource: ['order'],
            operation: ['limitOrder'],
          },
        },
      },
      {
        displayName: 'Reduce Only',
        name: 'reduceOnly',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['order'],
            operation: ['limitOrder', 'marketOrder'],
          },
        },
        description: 'Whether order can only reduce an existing position',
      },
      {
        displayName: 'Order ID',
        name: 'orderId',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            resource: ['order'],
            operation: ['cancel'],
          },
        },
        description: 'The order ID to cancel',
      },

      // ========== POSITION OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['position'] } },
        options: [
          { name: 'Get Open Positions', value: 'getPositions', action: 'Get open positions' },
          { name: 'Update Leverage', value: 'updateLeverage', action: 'Update leverage' },
          { name: 'Get Trade History', value: 'getTradeHistory', action: 'Get trade history' },
        ],
        default: 'getPositions',
      },
      {
        displayName: 'Asset',
        name: 'positionAsset',
        type: 'string',
        default: 'BTC',
        placeholder: 'BTC, ETH, SOL...',
        displayOptions: {
          show: {
            resource: ['position'],
            operation: ['updateLeverage'],
          },
        },
        description: 'Asset to update leverage for',
      },
      {
        displayName: 'Leverage',
        name: 'leverage',
        type: 'number',
        default: 10,
        typeOptions: { minValue: 1, maxValue: 100 },
        displayOptions: {
          show: {
            resource: ['position'],
            operation: ['updateLeverage'],
          },
        },
      },
      {
        displayName: 'Margin Mode',
        name: 'marginMode',
        type: 'options',
        options: [
          { name: 'Cross', value: 'cross' },
          { name: 'Isolated', value: 'isolated' },
        ],
        default: 'cross',
        displayOptions: {
          show: {
            resource: ['position'],
            operation: ['updateLeverage'],
          },
        },
      },

      // ========== ACCOUNT OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['account'] } },
        options: [
          { name: 'Get Balance', value: 'getBalance', action: 'Get account balance' },
          { name: 'Get Margin Summary', value: 'getMarginSummary', action: 'Get margin summary' },
        ],
        default: 'getBalance',
      },

      // ========== MARKET DATA OPERATIONS ==========
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['marketData'] } },
        options: [
          { name: 'Get All Prices', value: 'getAllMids', action: 'Get all mid prices' },
          { name: 'Get Asset Price', value: 'getAssetPrice', action: 'Get specific asset price' },
          { name: 'Get Asset Metadata', value: 'getMeta', action: 'Get asset metadata' },
          { name: 'Get Order Book', value: 'getOrderBook', action: 'Get order book' },
        ],
        default: 'getAllMids',
      },
      {
        displayName: 'Asset',
        name: 'marketAsset',
        type: 'string',
        default: 'BTC',
        displayOptions: {
          show: {
            resource: ['marketData'],
            operation: ['getAssetPrice', 'getOrderBook'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await this.getCredentials('hyperliquidApi');
    const privateKey = credentials.privateKey as string;
    const network = credentials.network as string;
    const walletType = credentials.walletType as string;
    const masterAddress = credentials.masterAddress as string;
    const vaultAddress = credentials.vaultAddress as string;

    // Validate private key format
    if (!privateKey.match(/^0x[a-fA-F0-9]{64}$/)) {
      throw new NodeOperationError(
        this.getNode(),
        'Invalid private key format. Must be 64 hex characters with 0x prefix.'
      );
    }

    // Initialize client
    const client = new HyperliquidClient(
      privateKey,
      network === 'mainnet',
      walletType === 'agent' ? masterAddress : undefined,
      vaultAddress || undefined
    );

    // Get asset metadata for index lookups
    let meta: Meta;
    try {
      meta = await client.getMeta() as Meta;
    } catch (error) {
      throw new NodeOperationError(this.getNode(), `Failed to fetch asset metadata: ${error}`);
    }

    // Helper to get asset index from symbol
    const getAssetIndex = (symbol: string): number => {
      const index = meta.universe.findIndex(
        (asset) => asset.name.toUpperCase() === symbol.toUpperCase()
      );
      if (index === -1) {
        throw new NodeOperationError(this.getNode(), `Unknown asset: ${symbol}`);
      }
      return index;
    };

    // Helper to remove trailing zeros (for sizes)
    const formatNumber = (value: number): string => {
      return value.toFixed(8).replace(/\.?0+$/, '');
    };

    // Helper to format price with max 5 significant figures (Hyperliquid requirement)
    const formatPrice = (price: number): string => {
      if (!price || isNaN(price)) return '0';

      const MAX_SIG_FIGS = 5;

      // For large prices (>= 10000), handle integer part
      if (price >= 10000) {
        const intPart = Math.floor(price);
        const intDigits = intPart.toString().length;

        if (intDigits >= MAX_SIG_FIGS) {
          // Round to max 5 significant figures
          const factor = Math.pow(10, intDigits - MAX_SIG_FIGS);
          const rounded = Math.round(price / factor) * factor;
          return rounded.toString();
        }
        // Allow some decimals
        const allowedDecimals = MAX_SIG_FIGS - intDigits;
        return price.toFixed(allowedDecimals);
      }

      // For smaller prices, use toPrecision with max 5 sig figs
      const formatted = parseFloat(price.toPrecision(MAX_SIG_FIGS));

      // Ensure max 6 decimal places (perps rule)
      const decimalPlaces = (formatted.toString().split('.')[1] || '').length;
      if (decimalPlaces > 6) {
        return formatted.toFixed(6);
      }

      return formatted.toString();
    };

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        let result: unknown;

        // ========== ORDER OPERATIONS ==========
        if (resource === 'order') {
          if (operation === 'marketOrder') {
            const asset = this.getNodeParameter('asset', i) as string;
            const side = this.getNodeParameter('side', i) as string;
            const size = this.getNodeParameter('size', i) as number;
            const slippage = this.getNodeParameter('slippage', i) as number;
            const reduceOnly = this.getNodeParameter('reduceOnly', i) as boolean;

            // Get current price for slippage calculation
            const mids = await client.getAllMids();
            const midPrice = parseFloat(mids[asset.toUpperCase()]);
            if (!midPrice) {
              throw new NodeOperationError(this.getNode(), `No price found for ${asset}`);
            }

            // Calculate aggressive IOC price with slippage
            const slippageMultiplier = side === 'buy' ? 1 + slippage / 100 : 1 - slippage / 100;
            const price = midPrice * slippageMultiplier;

            const order: HyperliquidOrderWire = {
              a: getAssetIndex(asset),
              b: side === 'buy',
              p: formatPrice(price),
              s: formatNumber(size),
              r: reduceOnly,
              t: { limit: { tif: 'Ioc' } },
            };

            result = await client.exchange({
              type: 'order',
              orders: [order],
              grouping: 'na',
            });
          }

          if (operation === 'limitOrder') {
            const asset = this.getNodeParameter('asset', i) as string;
            const side = this.getNodeParameter('side', i) as string;
            const size = this.getNodeParameter('size', i) as number;
            const limitPrice = this.getNodeParameter('price', i) as number;
            const tif = this.getNodeParameter('timeInForce', i) as 'Gtc' | 'Ioc' | 'Alo';
            const reduceOnly = this.getNodeParameter('reduceOnly', i) as boolean;

            const order: HyperliquidOrderWire = {
              a: getAssetIndex(asset),
              b: side === 'buy',
              p: formatPrice(limitPrice),
              s: formatNumber(size),
              r: reduceOnly,
              t: { limit: { tif } },
            };

            result = await client.exchange({
              type: 'order',
              orders: [order],
              grouping: 'na',
            });
          }

          if (operation === 'takeProfit' || operation === 'stopLoss') {
            const asset = this.getNodeParameter('asset', i) as string;
            const side = this.getNodeParameter('side', i) as string;
            const size = this.getNodeParameter('size', i) as number;
            const triggerPrice = this.getNodeParameter('triggerPrice', i) as number;

            const orderType: OrderTypeWire = {
              trigger: {
                isMarket: true,
                triggerPx: formatPrice(triggerPrice),
                tpsl: operation === 'takeProfit' ? 'tp' : 'sl',
              },
            };

            const order: HyperliquidOrderWire = {
              a: getAssetIndex(asset),
              b: side === 'buy',
              p: formatPrice(triggerPrice),
              s: formatNumber(size),
              r: true, // TP/SL are always reduce only
              t: orderType,
            };

            result = await client.exchange({
              type: 'order',
              orders: [order],
              grouping: 'na',  // Standalone TP/SL uses 'na', not 'normalTpsl'
            });
          }

          if (operation === 'cancel') {
            const asset = this.getNodeParameter('asset', i) as string;
            const orderId = this.getNodeParameter('orderId', i) as number;

            result = await client.exchange({
              type: 'cancel',
              cancels: [{ a: getAssetIndex(asset), o: orderId }],
            });
          }

          if (operation === 'cancelAll') {
            const openOrders = await client.getOpenOrders() as Array<{ coin: string; oid: number }>;
            if (openOrders.length === 0) {
              result = { message: 'No open orders to cancel' };
            } else {
              const cancels = openOrders.map((order) => ({
                a: getAssetIndex(order.coin),
                o: order.oid,
              }));
              result = await client.exchange({
                type: 'cancel',
                cancels,
              });
            }
          }

          if (operation === 'getOpen') {
            result = await client.getOpenOrders();
          }

          if (operation === 'getHistory') {
            result = await client.getUserFills();
          }
        }

        // ========== POSITION OPERATIONS ==========
        if (resource === 'position') {
          if (operation === 'getPositions') {
            const state = await client.getClearinghouseState() as ClearinghouseState;
            result = state.assetPositions.filter(
              (pos: AssetPosition) => parseFloat(pos.position.szi) !== 0
            );
          }

          if (operation === 'updateLeverage') {
            const asset = this.getNodeParameter('positionAsset', i) as string;
            const leverage = this.getNodeParameter('leverage', i) as number;
            const marginMode = this.getNodeParameter('marginMode', i) as string;

            result = await client.exchange({
              type: 'updateLeverage',
              asset: getAssetIndex(asset),
              isCross: marginMode === 'cross',
              leverage,
            });
          }

          if (operation === 'getTradeHistory') {
            result = await client.getUserFills();
          }
        }

        // ========== ACCOUNT OPERATIONS ==========
        if (resource === 'account') {
          const state = await client.getClearinghouseState() as ClearinghouseState;

          if (operation === 'getBalance') {
            result = {
              accountValue: state.marginSummary.accountValue,
              totalRawUsd: state.marginSummary.totalRawUsd,
              withdrawable: state.withdrawable,
            };
          }

          if (operation === 'getMarginSummary') {
            result = state.marginSummary;
          }
        }

        // ========== MARKET DATA OPERATIONS ==========
        if (resource === 'marketData') {
          if (operation === 'getAllMids') {
            result = await client.getAllMids();
          }

          if (operation === 'getAssetPrice') {
            const asset = this.getNodeParameter('marketAsset', i) as string;
            const mids = await client.getAllMids();
            result = {
              asset: asset.toUpperCase(),
              price: mids[asset.toUpperCase()],
            };
          }

          if (operation === 'getMeta') {
            result = meta;
          }

          if (operation === 'getOrderBook') {
            const asset = this.getNodeParameter('marketAsset', i) as string;
            result = await client.info({
              type: 'l2Book',
              coin: asset.toUpperCase(),
            });
          }
        }

        returnData.push({
          json: result as INodeExecutionData['json'],
          pairedItem: { item: i },
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: errorMessage },
            pairedItem: { item: i },
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), errorMessage, { itemIndex: i });
      }
    }

    return [returnData];
  }
}
