# Changelog

All notable changes to this project will be documented in this file.

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
