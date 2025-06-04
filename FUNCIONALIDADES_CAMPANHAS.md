# 🎯 Funcionalidades de Gerenciamento de Campanhas

## 📋 **Visão Geral**

O sistema agora possui funcionalidades completas para gerenciar campanhas do Facebook Ads diretamente pelo dashboard, incluindo:

- ⏸️ **Pausar/Despausar campanhas**
- 💰 **Alterar orçamentos** (com detecção automática CBO vs ABO)
- 🔍 **Identificação automática do tipo de campanha**

---

## 🚀 **Funcionalidades Implementadas**

### 1. **Pausar/Despausar Campanhas**
- ✅ Botão dinâmico que muda conforme o status da campanha
- ✅ Feedback visual com ícones (Play/Pause)
- ✅ Estados de loading durante a operação
- ✅ Mensagens de sucesso/erro

### 2. **Alterar Orçamentos**
- ✅ Modal profissional com informações detalhadas
- ✅ Detecção automática entre CBO e ABO
- ✅ Explicação clara das diferenças
- ✅ Validação de valores mínimos
- ✅ Conversão automática para centavos (formato Facebook API)

### 3. **Detecção CBO vs ABO**
- ✅ Análise automática do tipo de campanha
- ✅ Lógica diferenciada para cada tipo:
  - **CBO**: Altera orçamento da campanha
  - **ABO**: Distribui orçamento entre ad sets
- ✅ Indicadores visuais do tipo de campanha

---

## 🎨 **Interface do Usuário**

### **Versão Mobile**
- 📱 Botões integrados nos cards de campanha
- 📱 Modal responsivo para alteração de orçamento
- 📱 Seção dedicada "⚙️ Ações" em cada card

### **Versão Desktop**
- 🖥️ Coluna "Ações" na tabela de campanhas
- 🖥️ Botões compactos com tooltips
- 🖥️ Indicador do tipo de campanha (CBO/ABO)

---

## 🔧 **APIs Implementadas**

### **1. Pausar/Despausar Campanhas**
```
POST /api/facebook/campaigns/pause
```

**Payload:**
```json
{
  "campaignId": "string",
  "action": "pause" | "resume"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Campanha pausada com sucesso",
  "campaignId": "123456789",
  "newStatus": "PAUSED"
}
```

### **2. Alterar Orçamento**
```
POST /api/facebook/campaigns/budget
```

**Payload:**
```json
{
  "campaignId": "string",
  "newBudget": number, // em centavos
  "budgetType": "CBO" | "ABO"
}
```

**Resposta CBO:**
```json
{
  "success": true,
  "message": "Orçamento CBO atualizado com sucesso",
  "campaignId": "123456789",
  "budgetType": "CBO",
  "newBudget": 5000
}
```

**Resposta ABO:**
```json
{
  "success": true,
  "message": "Orçamento ABO atualizado com sucesso",
  "campaignId": "123456789",
  "budgetType": "ABO",
  "newBudget": 5000,
  "updatedAdSets": 3,
  "budgetPerAdSet": 1667
}
```

---

## 🧠 **Lógica de Detecção CBO vs ABO**

### **Critérios de Identificação:**

1. **CBO (Campaign Budget Optimization)**
   - ✅ Campanha possui `daily_budget` > 0
   - ✅ Campo `budget_optimization` = "CBO"
   - 🎯 **Ação**: Altera orçamento diretamente na campanha

2. **ABO (Ad Set Budget Optimization)**
   - ✅ Campanha não possui `daily_budget` ou = 0
   - ✅ Campo `budget_optimization` ≠ "CBO"
   - 🎯 **Ação**: Busca ad sets e distribui orçamento igualmente

3. **UNKNOWN**
   - ❓ Quando não é possível determinar o tipo
   - ⚠️ Exibe aviso ao usuário

---

## 🎨 **Componentes Criados**

### **1. CampaignActions.tsx**
- 🎯 Componente principal para ações da campanha
- 🎯 Gerencia estados de loading e modais
- 🎯 Integração com APIs de pause e budget

### **2. Integração na CampaignsTable.tsx**
- 📊 Nova coluna "Ações" na versão desktop
- 📱 Nova seção "⚙️ Ações" na versão mobile
- 🔄 Callback `onRefresh` para atualizar dados

---

## 🔄 **Fluxo de Funcionamento**

### **Pausar/Despausar:**
1. 👆 Usuário clica no botão Pausar/Ativar
2. 🔄 Sistema envia requisição para API
3. 📡 API chama Facebook Graph API
4. ✅ Retorna sucesso/erro
5. 🔄 Dashboard atualiza automaticamente

### **Alterar Orçamento:**
1. 👆 Usuário clica em "Orçamento"
2. 📋 Modal abre com informações da campanha
3. 🔍 Sistema identifica tipo (CBO/ABO)
4. 💰 Usuário insere novo valor
5. 🔄 Sistema processa conforme o tipo:
   - **CBO**: Atualiza campanha
   - **ABO**: Atualiza todos os ad sets
6. ✅ Feedback de sucesso/erro
7. 🔄 Dashboard atualiza automaticamente

---

## 🛡️ **Tratamento de Erros**

### **Erros Comuns:**
- ❌ **Token inválido**: "Token de acesso não configurado"
- ❌ **Campanha não encontrada**: "Campanha não existe"
- ❌ **Permissões insuficientes**: "Sem permissão para alterar"
- ❌ **Valor inválido**: "Digite um valor válido para o orçamento"
- ❌ **Erro de rede**: "Erro de conexão"

### **Feedback Visual:**
- 🔴 Alertas de erro com detalhes
- 🟢 Mensagens de sucesso
- ⏳ Estados de loading durante operações
- 🚫 Botões desabilitados durante processamento

---

## 🎯 **Próximas Melhorias**

### **Funcionalidades Futuras:**
- 📊 **Histórico de alterações** de orçamento
- 📈 **Sugestões automáticas** de orçamento baseadas em performance
- 🎯 **Ações em lote** (pausar/alterar múltiplas campanhas)
- 📱 **Notificações push** para mudanças de status
- 📊 **Relatórios** de alterações realizadas

### **Melhorias de UX:**
- 🎨 **Animações** mais suaves
- 📋 **Confirmações** antes de ações críticas
- 🔄 **Auto-refresh** em tempo real
- 📱 **Gestos** para ações rápidas no mobile

---

## 🔧 **Configuração Necessária**

### **Variáveis de Ambiente:**
```env
FACEBOOK_ACCESS_TOKEN=your_facebook_token_here
FB_TOKEN=your_facebook_token_here
FB_AD_ACCOUNT_1=act_123456789
FB_AD_ACCOUNT_2=act_987654321
```

### **Permissões Facebook:**
- ✅ `ads_management`
- ✅ `ads_read`
- ✅ `business_management`

---

## 📝 **Logs e Debug**

### **Console Logs:**
- 🔍 Todas as operações são logadas
- 📊 Detalhes de requisições/respostas
- ❌ Erros com stack trace completo
- 📈 Métricas de performance

### **Exemplo de Log:**
```
🎯 Pausando campanha: Nome da Campanha (123456789)
📡 Enviando para Facebook API: PAUSED
✅ Campanha pausada com sucesso
🔄 Atualizando dashboard...
```

---

## 🎉 **Conclusão**

O sistema agora oferece controle completo sobre campanhas do Facebook Ads, com:

- ✅ **Interface intuitiva** e responsiva
- ✅ **Detecção automática** de tipos de campanha
- ✅ **Tratamento robusto** de erros
- ✅ **Feedback visual** em tempo real
- ✅ **Integração completa** com Facebook Graph API

**🚀 Pronto para uso em produção!** 