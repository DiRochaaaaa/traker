# 🎨 Sistema de Configuração de Cores

## 📋 Visão Geral

O sistema possui um configurador profissional de cores que permite ajustar as regras de performance e visual das campanhas em tempo real. Todas as cores são centralizadas e podem ser facilmente modificadas.

## 🎯 Localização dos Arquivos

### Configuração Principal
- **`src/config/performanceColors.ts`** - Configuração centralizada de todas as regras de cores

### Componentes que Usam as Cores
- **`src/components/Dashboard.tsx`** - Dashboard principal com métricas
- **`src/components/MetricsCard.tsx`** - Cards de métricas individuais  
- **`src/components/CampaignsTable.tsx`** - Tabela de campanhas detalhadas
- **`src/components/ColorConfigModal.tsx`** - Modal de configuração das cores

## 🎨 Regras de Cores Atuais

### ROAS (Return on Ad Spend)
- **🟢 Verde (Excelente)**: ROAS ≥ 2.0
- **🟡 Amarelo (Moderado)**: 1.0 ≤ ROAS < 2.0  
- **🔴 Vermelho (Ruim)**: ROAS < 1.0

### Lucro
- **Segue as regras do ROAS**: O lucro usa as mesmas cores do ROAS correspondente
- **🔴 Vermelho**: Lucro negativo (independente do ROAS)

### Performance Excepcional 🏆
Campanhas que atendem **AMBOS** os critérios:
- **Lucro > R$ 0,00**
- **ROAS ≥ 2.0**

Recebem destaque especial com:
- Gradientes verdes
- Bordas animadas
- Ícones de troféu
- Badges "Performance Excepcional"

## ⚙️ Como Configurar

### 1. Via Interface (Recomendado)
1. Acesse o Dashboard
2. Clique no botão **"Cores"** no canto superior direito
3. Escolha um preset ou configure manualmente:
   - **Conservador**: ROAS ≥ 3.0 = Verde
   - **Balanceado**: ROAS ≥ 2.0 = Verde ⭐ (Padrão)
   - **Agressivo**: ROAS ≥ 1.5 = Verde

### 2. Via Código
Edite o arquivo `src/config/performanceColors.ts`:

```typescript
export const PERFORMANCE_THRESHOLDS = {
  roas: {
    excellent: 2.0,    // Verde
    moderate: 1.0,     // Amarelo  
    poor: 0.0          // Vermelho
  },
  profit: {
    positive: 0,       // Lucro positivo
    negative: 0        // Lucro negativo
  }
}
```

## 🎨 Esquema de Cores

### Cores Disponíveis
```typescript
excellent: {
  text: 'text-green-400',
  background: 'bg-green-900/30',
  border: 'border-green-500/50',
  shadow: 'shadow-green-500/20'
}

moderate: {
  text: 'text-yellow-400', 
  background: 'bg-yellow-900/30',
  border: 'border-yellow-500/50',
  shadow: 'shadow-yellow-500/20'
}

poor: {
  text: 'text-red-400',
  background: 'bg-red-900/30', 
  border: 'border-red-500/50',
  shadow: 'shadow-red-500/20'
}
```

## 🔧 Funções Utilitárias

### Verificação de Performance
```typescript
// Verificar nível de ROAS
getROASPerformance(roas: number): 'excellent' | 'moderate' | 'poor'

// Verificar nível de lucro (considera ROAS)
getProfitPerformance(profit: number, roas: number): PerformanceLevel

// Verificar se é alta performance
isHighPerformance(profit: number, roas: number): boolean
```

### Obtenção de Cores
```typescript
// Cores para ROAS
getROASColors(roas: number)

// Cores para lucro (coordenadas com ROAS)
getProfitColors(profit: number, roas: number)

// Cores por nível de performance
getPerformanceColors(level: PerformanceLevel)
```

## 📊 Onde as Cores Aparecem

### Dashboard
- **Cards de métricas principais** (Lucro Total, ROAS Médio)
- **Badge "Performance Excepcional"** no header
- **Seção de resumo** com destaque especial

### Página de Vendas
- **Tabela de campanhas** (desktop)
- **Cards de campanhas** (mobile)
- **Valores de ROAS e Lucro** destacados
- **Badges de alta performance**

### Elementos Visuais
- **Backgrounds gradientes**
- **Bordas coloridas**
- **Sombras suaves**
- **Ícones animados** (🏆 para alta performance)
- **Texto destacado**

## 🚀 Presets Disponíveis

### Conservador
- Ideal para negócios que precisam de margens altas
- ROAS ≥ 3.0 = Verde
- ROAS ≥ 1.5 = Amarelo

### Balanceado ⭐ (Padrão)
- Equilibrio entre performance e realismo
- ROAS ≥ 2.0 = Verde  
- ROAS ≥ 1.0 = Amarelo

### Agressivo
- Para negócios em crescimento/teste
- ROAS ≥ 1.5 = Verde
- ROAS ≥ 0.8 = Amarelo

## 💾 Persistência

As configurações são salvas no **localStorage** do navegador e aplicadas automaticamente ao recarregar a página.

## 🎯 Benefícios

✅ **Centralizado**: Todas as regras em um local  
✅ **Flexível**: Fácil de ajustar via interface  
✅ **Consistente**: Cores aplicadas em todo o sistema  
✅ **Profissional**: Visual elegante e moderno  
✅ **Responsivo**: Funciona em desktop e mobile  
✅ **Performático**: Otimizado para velocidade  

## 🔄 Atualizações Futuras

- [ ] Configuração de cores personalizadas
- [ ] Mais presets especializados por nicho
- [ ] Salvamento em banco de dados
- [ ] Configuração por usuário/empresa
- [ ] Temas claro/escuro
- [ ] Exportar/importar configurações 