# Roadmap de Funcionalidades - n8n-nodes-hyperliquid

> **Data:** 29 de Dezembro de 2024
> **Versão Atual:** 0.1.3

---

## Resumo Comparativo

### Implementado vs Disponível na API

| Categoria | Implementado | Disponível | Cobertura |
|-----------|--------------|------------|-----------|
| **Info - Perpetuals** | 4 | 16 | 25% |
| **Info - Spot** | 0 | 4 | 0% |
| **Info - Usuário Perp** | 4 | 14 | 29% |
| **Info - Usuário Spot** | 0 | 1 | 0% |
| **Info - Subcontas/Agentes** | 0 | 2 | 0% |
| **Info - Vaults** | 0 | 4 | 0% |
| **Info - Staking** | 0 | 5 | 0% |
| **Info - TWAP** | 0 | 3 | 0% |
| **Exchange - Ordens** | 5 | 6 | 83% |
| **Exchange - TWAP** | 0 | 2 | 0% |
| **Exchange - Gestão Risco** | 1 | 2 | 50% |
| **Exchange - Transferências** | 0 | 7 | 0% |
| **Exchange - Staking** | 0 | 4 | 0% |
| **Exchange - Subcontas** | 0 | 3 | 0% |
| **WebSocket** | 0 | 8 | 0% |

---

## Funcionalidades Já Implementadas

### Info Endpoint (/info)
- ✅ `meta` - Metadados de ativos
- ✅ `allMids` - Todos os preços mid
- ✅ `l2Book` - Order book L2
- ✅ `clearinghouseState` - Estado da conta (posições, margem)
- ✅ `openOrders` - Ordens abertas
- ✅ `userFills` - Histórico de fills

### Exchange Endpoint (/exchange)
- ✅ `order` - Colocar ordens (market, limit, TP, SL)
- ✅ `cancel` - Cancelar ordens por OID
- ✅ `updateLeverage` - Atualizar alavancagem

---

## Funcionalidades para Adicionar

### PRIORIDADE ALTA (Muito Úteis para Trading)

#### 1. Info - Dados de Mercado Perpetuals

| Funcionalidade | Type | Descrição | Complexidade |
|----------------|------|-----------|--------------|
| **Candle Snapshot** | `candleSnapshot` | Histórico de candles (OHLCV) | Média |
| **Funding History** | `fundingHistory` | Histórico de taxas de funding | Baixa |
| **Predicted Fundings** | `predictedFundings` | Taxas de funding previstas | Baixa |
| **Recent Trades** | `recentTrades` | Trades recentes do mercado | Baixa |
| **Meta And Asset Contexts** | `metaAndAssetCtxs` | Metadados + mark price, funding, OI | Baixa |

#### 2. Info - Dados do Usuário

| Funcionalidade | Type | Descrição | Complexidade |
|----------------|------|-----------|--------------|
| **Order Status** | `orderStatus` | Status de ordem específica por OID | Baixa |
| **Historical Orders** | `historicalOrders` | Histórico completo de ordens | Baixa |
| **User Funding** | `userFunding` | Histórico de funding pago/recebido | Baixa |
| **User Fees** | `userFees` | Taxas pagas pelo usuário | Baixa |
| **Frontend Open Orders** | `frontendOpenOrders` | Ordens abertas (formato detalhado) | Baixa |

#### 3. Exchange - Ordens Avançadas

| Funcionalidade | Type | Descrição | Complexidade |
|----------------|------|-----------|--------------|
| **Modify Order** | `modify` | Modificar ordem existente | Média |
| **Batch Modify** | `batchModify` | Modificar múltiplas ordens | Média |
| **Cancel by CLOID** | `cancelByCloid` | Cancelar por Client Order ID | Baixa |
| **Schedule Cancel** | `scheduleCancel` | Agendar cancelamento futuro | Média |

#### 4. Exchange - Gestão de Risco

| Funcionalidade | Type | Descrição | Complexidade |
|----------------|------|-----------|--------------|
| **Update Isolated Margin** | `updateIsolatedMargin` | Ajustar margem isolada | Baixa |

---

### PRIORIDADE MÉDIA (Funcionalidades Complementares)

#### 5. TWAP (Time-Weighted Average Price)

| Funcionalidade | Type | Descrição | Complexidade |
|----------------|------|-----------|--------------|
| **Place TWAP Order** | `twapOrder` | Ordem TWAP (execução distribuída) | Alta |
| **Cancel TWAP** | `twapCancel` | Cancelar ordem TWAP | Baixa |
| **TWAP History** | `twapHistory` | Histórico de ordens TWAP | Baixa |
| **TWAP Slice Fills** | `userTwapSliceFills` | Fills dos slices TWAP | Baixa |

#### 6. Transferências

| Funcionalidade | Type | Descrição | Complexidade |
|----------------|------|-----------|--------------|
| **USD Transfer** | `usdTransfer` | Transferir USD entre usuários | Média |
| **USD Class Transfer** | `usdClassTransfer` | Transferir entre spot/perp | Baixa |
| **Withdraw** | `withdraw` | Sacar para L1 | Média |
| **Vault Transfer** | `vaultTransfer` | Transferir para/de vault | Média |
| **SubAccount Transfer** | `subAccountTransfer` | Transferir para subconta | Média |

#### 7. Subcontas e Agentes

| Funcionalidade | Type | Descrição | Complexidade |
|----------------|------|-----------|--------------|
| **List SubAccounts** | `subAccounts` | Listar subcontas | Baixa |
| **Create SubAccount** | `createSubAccount` | Criar subconta | Média |
| **List Extra Agents** | `extraAgents` | Listar API wallets | Baixa |
| **Approve Agent** | `approveAgent` | Aprovar nova API wallet | Alta |

#### 8. Vaults

| Funcionalidade | Type | Descrição | Complexidade |
|----------------|------|-----------|--------------|
| **Vault Summaries** | `vaultSummaries` | Sumários de vaults | Baixa |
| **Vault Details** | `vaultDetails` | Detalhes de um vault | Baixa |
| **User Vault Equities** | `userVaultEquities` | Equities em vaults | Baixa |

---

### PRIORIDADE BAIXA (Funcionalidades Especializadas)

#### 9. Spot Trading

| Funcionalidade | Type | Descrição | Complexidade |
|----------------|------|-----------|--------------|
| **Spot Meta** | `spotMeta` | Metadados spot | Baixa |
| **Spot Clearinghouse** | `spotClearinghouseState` | Balances spot | Baixa |
| **Spot Transfer** | `spotTransfer` | Transferir tokens spot | Média |
| **Spot Send** | `spotSend` | Enviar spot para endereço | Média |

#### 10. Staking/Delegação

| Funcionalidade | Type | Descrição | Complexidade |
|----------------|------|-----------|--------------|
| **Delegations** | `delegations` | Listar delegações | Baixa |
| **Delegator Summary** | `delegatorSummary` | Sumário de delegação | Baixa |
| **Delegator Rewards** | `delegatorRewards` | Recompensas de staking | Baixa |
| **Token Delegate** | `tokenDelegate` | Delegar tokens | Média |
| **Token Undelegate** | `tokenUndelegate` | Remover delegação | Média |

#### 11. Informações Adicionais

| Funcionalidade | Type | Descrição | Complexidade |
|----------------|------|-----------|--------------|
| **Exchange Status** | `exchangeStatus` | Status da exchange | Baixa |
| **User Rate Limit** | `userRateLimit` | Limites de rate | Baixa |
| **Referral Info** | `referral` | Informações de referral | Baixa |
| **Is VIP** | `isVip` | Verificar status VIP | Baixa |
| **Portfolio** | `portfolio` | Portfolio completo | Baixa |

---

### WEBSOCKET (Funcionalidade Avançada)

| Channel | Descrição | Complexidade |
|---------|-----------|--------------|
| **allMids** | Stream de preços em tempo real | Alta |
| **l2Book** | Stream de order book | Alta |
| **trades** | Stream de trades | Alta |
| **candle** | Stream de candles | Alta |
| **userEvents** | Todos eventos do usuário | Alta |
| **userFills** | Stream de fills | Alta |
| **orderUpdates** | Updates de ordens | Alta |

> **Nota:** WebSocket requer arquitetura diferente no n8n (Trigger Node)

---

## Plano de Implementação Sugerido

### Fase 1 - Quick Wins (1-2 dias)
Funcionalidades de baixa complexidade e alto valor:

1. `candleSnapshot` - Candles históricos
2. `fundingHistory` - Histórico de funding
3. `predictedFundings` - Funding previsto
4. `recentTrades` - Trades recentes
5. `orderStatus` - Status de ordem
6. `historicalOrders` - Histórico de ordens
7. `userFunding` - Funding do usuário
8. `userFees` - Taxas do usuário

### Fase 2 - Ordens Avançadas (2-3 dias)
1. `modify` - Modificar ordem
2. `batchModify` - Modificar múltiplas
3. `cancelByCloid` - Cancel por CLOID
4. `scheduleCancel` - Cancelamento agendado
5. `updateIsolatedMargin` - Margem isolada

### Fase 3 - TWAP (1-2 dias)
1. `twapOrder` - Ordem TWAP
2. `twapCancel` - Cancelar TWAP
3. `twapHistory` - Histórico TWAP

### Fase 4 - Transferências (2-3 dias)
1. `usdTransfer` - Transfer USD
2. `usdClassTransfer` - Spot/Perp transfer
3. `withdraw` - Saques
4. `vaultTransfer` - Vault transfers
5. `subAccountTransfer` - Subconta transfers

### Fase 5 - Gestão de Contas (2-3 dias)
1. Subcontas (list, create)
2. Agentes (list, approve)
3. Vaults (summaries, details, equities)

### Fase 6 - Spot Trading (2-3 dias)
1. `spotMeta` - Metadados
2. `spotClearinghouseState` - Balances
3. `spotTransfer` / `spotSend` - Transfers

### Fase 7 - WebSocket Trigger (5+ dias)
Criar novo nó Trigger para streams em tempo real.

---

## Estimativa de Esforço Total

| Fase | Funcionalidades | Complexidade | Estimativa |
|------|-----------------|--------------|------------|
| Fase 1 | 8 | Baixa | 1-2 dias |
| Fase 2 | 5 | Média | 2-3 dias |
| Fase 3 | 3 | Média | 1-2 dias |
| Fase 4 | 5 | Média | 2-3 dias |
| Fase 5 | 5 | Média | 2-3 dias |
| Fase 6 | 4 | Média | 2-3 dias |
| Fase 7 | 7 | Alta | 5+ dias |
| **Total** | **37** | - | **15-21 dias** |

---

## Próximos Passos Recomendados

1. **Validar prioridades** com casos de uso reais
2. **Começar pela Fase 1** (maior valor, menor esforço)
3. **Refatorar estrutura** para suportar mais operações (usar pastas actions/)
4. **Adicionar testes** conforme implementa
5. **Documentar** cada nova funcionalidade

---

## Referências

- [Hyperliquid API Docs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)
- [Info Endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint)
- [Exchange Endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)
- [WebSocket](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket)
