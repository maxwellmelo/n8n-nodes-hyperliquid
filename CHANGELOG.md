# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2024-12-29

### Added

#### Market Data (5 new operations)
- **Get Candle Snapshot**: Historical OHLCV data with configurable intervals (1m to 1M)
- **Get Funding History**: Historical funding rates for any asset
- **Get Predicted Fundings**: Predicted next funding rates
- **Get Recent Trades**: Recent market trades
- **Get Meta And Asset Contexts**: Real-time mark price, open interest, and funding data

#### User Data (4 new operations)
- **Get Order Status**: Query status of a specific order by OID
- **Get Historical Orders**: Complete order history
- **Get User Funding**: User's funding payments history
- **Get User Fees**: User's fee schedule and rates

#### Advanced Orders (4 new operations)
- **Modify Order**: Modify an existing order (price, size, etc.)
- **Cancel by Client ID**: Cancel orders using custom client order IDs (CLOID)
- **Schedule Cancel**: Dead man's switch - schedule automatic cancellation of all orders
- **Update Isolated Margin**: Add or remove margin from isolated positions

### Technical
- Added 15+ new TypeScript interfaces for API responses
- Extended HyperliquidClient with 9 new convenience methods
- All existing functionality remains unchanged and backwards compatible

## [0.1.3] - 2024-12-16

### Fixed
- Fixed "Main order cannot be trigger order" error for TP/SL orders
- Changed grouping from `normalTpsl` to `na` for standalone Take Profit and Stop Loss orders
- TP/SL orders now work correctly with both Main Wallet and Agent Wallet

## [0.1.2] - 2024-12-16

### Fixed
- Fixed "Order has invalid price" error by limiting prices to max 5 significant figures (Hyperliquid API requirement)
- Added `formatPrice()` function that properly formats prices for all order types
- Affected operations: Market Order, Limit Order, Take Profit, Stop Loss

## [0.1.1] - 2024-12-16

### Fixed
- Fixed vault marker encoding in EIP-712 signing (was using 20 bytes instead of 1 byte for no-vault case)
- This fix resolves "User or API Wallet does not exist" errors when executing signed operations

## [0.1.0] - 2024-12-16

### Added
- Initial release
- Order operations: market orders, limit orders, take profit, stop loss, cancel
- Position management: get positions, update leverage, trade history
- Account operations: balance, margin summary
- Market data: prices, metadata, order book
- Support for API wallets (agents) and main wallets
- Support for vault/subaccount trading
- Mainnet and testnet support
- EIP-712 signing with phantom agent mechanism
