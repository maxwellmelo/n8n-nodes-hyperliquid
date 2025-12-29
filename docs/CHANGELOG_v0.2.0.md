# Changelog v0.2.0 - Novas Funcionalidades

> **Data:** 29 de Dezembro de 2024
> **Versão:** 0.2.0

---

## Resumo

Adicionadas **13 novas funcionalidades** de alta prioridade sem alterar as funcionalidades existentes.

---

## Novas Funcionalidades

### 1. Info - Dados de Mercado (5 novas operações)

| Operação | Descrição | Parâmetros |
|----------|-----------|------------|
| **Get Candle Snapshot** | Histórico de candles (OHLCV) | asset, interval, startTime, endTime |
| **Get Funding History** | Histórico de taxas de funding | asset, startTime, endTime |
| **Get Predicted Fundings** | Taxas de funding previstas | - |
| **Get Recent Trades** | Trades recentes do mercado | asset |
| **Get Meta And Asset Contexts** | Mark price, OI, funding em tempo real | - |

**Intervalos de Candle Suportados:**
- 1m, 3m, 5m, 15m, 30m
- 1h, 2h, 4h, 8h, 12h
- 1d, 3d, 1w, 1M

### 2. Info - Dados do Usuário (4 novas operações)

| Operação | Descrição | Parâmetros |
|----------|-----------|------------|
| **Get Order Status** | Status de ordem específica | orderId |
| **Get Historical Orders** | Histórico completo de ordens | - |
| **Get User Funding** | Funding pago/recebido | startTime, endTime |
| **Get User Fees** | Taxas do usuário | - |

### 3. Exchange - Ordens Avançadas (4 novas operações)

| Operação | Descrição | Parâmetros |
|----------|-----------|------------|
| **Modify Order** | Modificar ordem existente | orderId, asset, side, size, price, timeInForce, reduceOnly |
| **Cancel by Client ID** | Cancelar por Client Order ID | asset, clientOrderId |
| **Schedule Cancel** | Agendar cancelamento de todas ordens | cancelTime (ms timestamp, 0 = remover) |
| **Update Isolated Margin** | Ajustar margem isolada | asset, positionSide, marginDelta |

---

## Arquivos Modificados

### 1. `nodes/Hyperliquid/types/index.ts`

**Antes:** 104 linhas
**Depois:** 257 linhas

**Adições:**
- `CancelByCloidAction` - Ação para cancelar por CLOID
- `ModifyOrderAction` - Ação para modificar ordem
- `BatchModifyAction` - Ação para modificar múltiplas ordens
- `ScheduleCancelAction` - Ação para agendar cancelamento
- `UpdateIsolatedMarginAction` - Ação para atualizar margem isolada
- `Candle` - Interface para dados de candle
- `FundingHistory` - Interface para histórico de funding
- `PredictedFunding` - Interface para funding previsto
- `RecentTrade` - Interface para trade recente
- `AssetCtx` - Interface para contexto de ativo
- `MetaAndAssetCtxs` - Interface para meta + contextos
- `OrderStatusResponse` - Interface para status de ordem
- `HistoricalOrder` - Interface para ordem histórica
- `UserFundingEntry` - Interface para entrada de funding do usuário
- `UserFees` - Interface para taxas do usuário
- `ExchangeAction` - Union type para todas as ações

### 2. `nodes/Hyperliquid/transport/hyperliquidClient.ts`

**Antes:** 213 linhas
**Depois:** 293 linhas

**Adições:**
- Imports dos novos tipos
- `signL1Action()` atualizado para aceitar `ExchangeAction`
- `exchange()` atualizado para aceitar `ExchangeAction`
- `getCandleSnapshot(coin, interval, startTime, endTime)` - Busca candles
- `getFundingHistory(coin, startTime, endTime?)` - Busca histórico de funding
- `getPredictedFundings()` - Busca fundings previstos
- `getRecentTrades(coin)` - Busca trades recentes
- `getMetaAndAssetCtxs()` - Busca meta + contextos
- `getOrderStatus(oid)` - Busca status de ordem
- `getHistoricalOrders()` - Busca histórico de ordens
- `getUserFunding(startTime, endTime?)` - Busca funding do usuário
- `getUserFees()` - Busca taxas do usuário

### 3. `nodes/Hyperliquid/Hyperliquid.node.ts`

**Antes:** 610 linhas
**Depois:** ~880 linhas

**Adições em Operations:**

**Order Operations (novas):**
- Modify Order
- Cancel by Client ID
- Schedule Cancel
- Get Order Status
- Get Historical Orders

**Position Operations (novas):**
- Update Isolated Margin

**Account Operations (novas):**
- Get User Funding
- Get User Fees

**Market Data Operations (novas):**
- Get Meta And Asset Contexts
- Get Candle Snapshot
- Get Funding History
- Get Predicted Fundings
- Get Recent Trades

**Novos Parâmetros:**
- `clientOrderId` - Para cancelar por CLOID
- `cancelTime` - Para agendar cancelamento
- `positionSide` - Para update isolated margin (long/short)
- `marginDelta` - Para update isolated margin (valor)
- `fundingStartTime` / `fundingEndTime` - Para user funding
- `candleInterval` - Para candles (1m a 1M)
- `candleStartTime` / `candleEndTime` - Para candles e funding history

---

## Vantagens das Mudanças

### 1. Mais Dados de Mercado
- **Candles (OHLCV):** Permite análise técnica e backtesting
- **Funding History:** Acompanhar custos de posições
- **Predicted Fundings:** Planejar entradas/saídas
- **Recent Trades:** Ver atividade do mercado

### 2. Melhor Gestão de Ordens
- **Modify Order:** Ajustar ordens sem cancelar e recriar
- **Cancel by CLOID:** Usar IDs personalizados para tracking
- **Schedule Cancel:** Proteção automática com dead man's switch
- **Order Status:** Verificar estado de ordem específica
- **Historical Orders:** Auditoria completa

### 3. Melhor Gestão de Risco
- **Update Isolated Margin:** Ajustar margem para controlar liquidação
- **User Funding:** Acompanhar custos de funding
- **User Fees:** Monitorar taxas pagas

### 4. Compatibilidade
- **Todas as funcionalidades existentes continuam funcionando**
- **Nenhuma breaking change**
- **Build passa sem erros**

---

## Como Usar

### Exemplo: Get Candle Snapshot
```json
{
  "resource": "marketData",
  "operation": "getCandleSnapshot",
  "marketAsset": "BTC",
  "candleInterval": "1h",
  "candleStartTime": 1703808000000,
  "candleEndTime": 1703894400000
}
```

### Exemplo: Modify Order
```json
{
  "resource": "order",
  "operation": "modifyOrder",
  "asset": "BTC",
  "orderId": 123456,
  "side": "buy",
  "size": 0.01,
  "price": 42000,
  "timeInForce": "Gtc",
  "reduceOnly": false
}
```

### Exemplo: Schedule Cancel
```json
{
  "resource": "order",
  "operation": "scheduleCancel",
  "cancelTime": 1703900000000
}
```
*Nota: `cancelTime` deve ser pelo menos 5 segundos no futuro. Use 0 para remover agendamento.*

### Exemplo: Update Isolated Margin
```json
{
  "resource": "position",
  "operation": "updateIsolatedMargin",
  "positionAsset": "BTC",
  "positionSide": "long",
  "marginDelta": 100
}
```
*Nota: `marginDelta` positivo adiciona margem, negativo remove.*

---

## Próximos Passos Sugeridos

1. Atualizar versão no `package.json` para 0.2.0
2. Atualizar `CHANGELOG.md` principal
3. Testar todas as novas funcionalidades
4. Publicar nova versão no npm
