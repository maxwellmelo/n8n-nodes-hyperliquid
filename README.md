# n8n-nodes-hyperliquid

This is an n8n community node for integrating with **Hyperliquid DEX** - a high-performance perpetual futures decentralized exchange.

## Features

### Order Operations
- **Place Market Order** - Execute market orders with slippage protection
- **Place Limit Order** - Place limit orders with GTC, IOC, or Post Only (ALO) time-in-force
- **Place Take Profit** - Set take profit trigger orders
- **Place Stop Loss** - Set stop loss trigger orders
- **Cancel Order** - Cancel specific orders by ID
- **Cancel All Orders** - Cancel all open orders
- **Get Open Orders** - Retrieve all currently open orders
- **Get Order History** - Retrieve historical fills/trades

### Position Operations
- **Get Open Positions** - View all current positions with PnL data
- **Update Leverage** - Modify leverage and margin mode (cross/isolated)
- **Get Trade History** - View historical trades

### Account Operations
- **Get Balance** - View account balance and withdrawable amount
- **Get Margin Summary** - Detailed margin information

### Market Data
- **Get All Prices** - Fetch mid prices for all trading pairs
- **Get Asset Price** - Get price for a specific asset
- **Get Asset Metadata** - Asset specifications (decimals, max leverage)
- **Get Order Book** - L2 order book data

## Installation

### In n8n

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-hyperliquid`
4. Agree to the risks and click **Install**

### Manual Installation

```bash
npm install n8n-nodes-hyperliquid
```

## Credentials

This node requires Hyperliquid API credentials:

### Wallet Types

1. **API Wallet (Recommended)** - A delegated wallet that can only trade, not withdraw
   - Generate a new Ethereum keypair
   - Approve it as an agent in app.hyperliquid.xyz > API settings
   - Use the agent's private key with your master wallet address

2. **Main Wallet** - Full access wallet (can trade and withdraw)
   - Use your main wallet's private key
   - Not recommended for automated systems

### Configuration

- **Private Key**: 64 hex characters with 0x prefix (encrypted at rest)
- **Master Address**: Required for API wallets - the address that authorized the agent
- **Network**: Mainnet or Testnet
- **Vault Address**: Optional - for subaccount/vault trading

## Security

- Private keys are encrypted using AES-256-CBC before database storage
- API wallets are recommended as they cannot withdraw funds
- The node validates private key format before use
- Uses EIP-712 typed data signing with chain ID 1337 to prevent replay attacks

## API Reference

This node interacts with:
- **Exchange API** (`/exchange`) - For trading operations (requires signing)
- **Info API** (`/info`) - For querying data (no signing required)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode with watch
npm run dev

# Lint
npm run lint
```

### Testing with n8n

```bash
export N8N_CUSTOM_EXTENSIONS="/path/to/n8n-nodes-hyperliquid"
n8n start
```

## Resources

- [Hyperliquid Documentation](https://hyperliquid.gitbook.io/hyperliquid-docs/)
- [Hyperliquid API Docs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
