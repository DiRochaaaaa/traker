# 🚀 Facebook Campaign Tracker

Sistema completo para monitoramento de campanhas do Facebook com análise de vendas integrada.

## 📋 Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `env.example` para `.env.local` e configure suas credenciais:

```bash
cp env.example .env.local
```

### 2. Facebook API Configuration

#### Token de Acesso
- `FB_TOKEN`: Token de acesso do Facebook com permissões para ads management

#### Contas de Anúncio
O sistema suporta múltiplas contas automaticamente. Adicione quantas precisar:

```env
# Contas obrigatórias (mínimo 1)
FB_AD_ACCOUNT_1=act_1234567890
FB_AD_ACCOUNT_NAME_1="Conta Principal"
FB_AD_ACCOUNT_2=act_0987654321
FB_AD_ACCOUNT_NAME_2="Conta Secundária"

# Contas opcionais (adicione quantas precisar)
FB_AD_ACCOUNT_3=act_1111111111
FB_AD_ACCOUNT_4=act_2222222222
FB_AD_ACCOUNT_5=act_3333333333
# FB_AD_ACCOUNT_NAME_4="Outra Conta"
# ... e assim por diante
```

Os nomes (`FB_AD_ACCOUNT_NAME_X`) são opcionais e, quando definidos, aparecem no
**Resumo por Conta** do dashboard.

#### 🆕 Como Adicionar Nova Conta de Anúncio

1. **Obtenha o ID da conta do Facebook**:
   - Acesse o Facebook Ads Manager
   - No canto superior esquerdo, copie o número que aparece após "act_"
   - Exemplo: se aparecer "1234567890", o ID é "act_1234567890"

2. **Adicione no arquivo `.env.local`**:
   ```env
   FB_AD_ACCOUNT_X=act_SEU_NUMERO_AQUI
   ```
   (onde X é o próximo número sequencial)

3. **Teste a conexão**:
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:3000/api/facebook/test`

4. **Verificar se aparece no dashboard**:
   - O sistema detectará automaticamente a nova conta
   - Campanhas da nova conta aparecerão na lista
   - Você pode filtrar por conta específica

#### 📊 Como Usar Múltiplas Contas

**API Endpoints suportam filtros:**
- `?account=all` - Todas as contas (padrão)
- `?account=account1` - Primeira conta (FB_AD_ACCOUNT_1)
- `?account=account2` - Segunda conta (FB_AD_ACCOUNT_2)
- `?account=account3` - Terceira conta (FB_AD_ACCOUNT_3)
- `?account=act_1234567890` - Conta específica por ID

### 3. Supabase Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. App Authentication

```env
AUTH_PASSWORD=your-secure-password
```

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

## 🧪 Testes

### Testar Conexão com Facebook API
```bash
curl http://localhost:3000/api/facebook/test
```

### Testar Token Facebook
```bash
curl http://localhost:3000/api/facebook/test-token
```

### Testar Campanhas
```bash
curl "http://localhost:3000/api/facebook/campaigns?period=today&account=all"
```

## 📱 Funcionalidades

- ✅ Monitoramento de múltiplas contas Facebook
- ✅ Análise de campanhas em tempo real
- ✅ Cálculo automático de ROAS e lucro
- ✅ Interface mobile otimizada
- ✅ Sistema de cache inteligente
- ✅ Carregamento progressivo
- ✅ Controles de orçamento integrados
- ✅ Análise de vendas por campanha

## 🎨 Melhorias Implementadas

### Performance
- Sistema de cache de 60 segundos
- Carregamento progressivo de componentes
- Skeleton loading sem flickering
- Fetch paralelo de dados

### Mobile
- Cards compactos (70% redução de espaço)
- Layout responsivo otimizado
- Componentes específicos para mobile

### UX
- Botões de controle redesenhados
- Orçamentos clicáveis para edição
- Indicadores visuais de performance
- Layout reorganizado para melhor workflow

## 🏗️ Arquitetura

```
src/
├── app/
│   ├── api/
│   │   ├── facebook/         # APIs do Facebook
│   │   └── vendas/          # APIs de vendas
│   ├── configuracoes/       # Página de configurações
│   └── vendas/             # Página de vendas
├── components/             # Componentes React
├── hooks/                 # Custom hooks
├── lib/                  # Utilitários
└── config/              # Configurações
```

## 🔍 Troubleshooting

### Erro: "No Facebook ad accounts configured"
- Verifique se as variáveis `FB_AD_ACCOUNT_*` estão definidas
- Confirme que os IDs começam com "act_"

### Erro: "Invalid or expired token"
- Gere um novo token no Facebook for Developers
- Verifique as permissões: `ads_management`, `ads_read`

### Campanhas não aparecem
- Verifique se as campanhas têm dados no período selecionado
- Teste a API: `/api/facebook/test`

## 📈 Próximos Passos

- [ ] Dashboard de métricas avançadas
- [ ] Alertas automáticos
- [ ] Relatórios exportáveis
- [ ] Integração com outras plataformas
- [ ] Análise preditiva
