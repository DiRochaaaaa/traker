// 🎨 Configuração centralizada de cores de performance
// Aqui você pode ajustar todas as regras de cores do sistema

export interface PerformanceThresholds {
  roas: {
    excellent: number    // Verde - Performance excelente
    moderate: number     // Amarelo - Performance moderada  
    poor: number         // Vermelho - Performance ruim
  }
  profit: {
    positive: number     // Lucro positivo
    negative: number     // Lucro negativo
  }
}

export interface ColorScheme {
  excellent: {
    text: string
    background: string
    border: string
    shadow: string
  }
  moderate: {
    text: string
    background: string
    border: string
    shadow: string
  }
  poor: {
    text: string
    background: string
    border: string
    shadow: string
  }
  neutral: {
    text: string
    background: string
    border: string
    shadow: string
  }
}

// 🎯 Configuração dos limites de performance
export const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  roas: {
    excellent: 2.0,    // ROAS >= 2.0 = Verde
    moderate: 1.0,     // ROAS >= 1.0 e < 2.0 = Amarelo
    poor: 0.0          // ROAS < 1.0 = Vermelho
  },
  profit: {
    positive: 0,       // Lucro > 0 = Positivo
    negative: 0        // Lucro <= 0 = Negativo
  }
}

// 🎨 Esquema de cores do sistema
export const COLOR_SCHEME: ColorScheme = {
  excellent: {
    text: 'text-green-400',
    background: 'bg-green-900/30',
    border: 'border-green-500/50',
    shadow: 'shadow-green-500/20'
  },
  moderate: {
    text: 'text-yellow-400',
    background: 'bg-yellow-900/30',
    border: 'border-yellow-500/50',
    shadow: 'shadow-yellow-500/20'
  },
  poor: {
    text: 'text-red-400',
    background: 'bg-red-900/30',
    border: 'border-red-500/50',
    shadow: 'shadow-red-500/20'
  },
  neutral: {
    text: 'text-gray-400',
    background: 'bg-gray-800/30',
    border: 'border-gray-600/50',
    shadow: 'shadow-gray-500/20'
  }
}

// 🏆 Configuração para alta performance (campanhas especiais)
export const HIGH_PERFORMANCE_CONFIG = {
  lucroMinimo: 0,      // Lucro deve ser > 0
  roasMinimo: 2.0,     // ROAS deve ser >= 2.0
  colors: {
    text: 'text-green-300',
    background: 'bg-green-900/40',
    border: 'border-green-400/60',
    shadow: 'shadow-green-500/25',
    gradient: 'bg-gradient-to-br from-green-900/50 via-green-800/40 to-emerald-900/50'
  }
}

// 🎯 Funções utilitárias para determinar performance
export type PerformanceLevel = 'excellent' | 'moderate' | 'poor' | 'negative'

export function getROASPerformance(roas: number): PerformanceLevel {
  if (roas >= PERFORMANCE_THRESHOLDS.roas.excellent) return 'excellent'
  if (roas >= PERFORMANCE_THRESHOLDS.roas.moderate) return 'moderate'
  return 'poor'
}

export function getProfitPerformance(profit: number, roas: number): PerformanceLevel {
  if (profit <= PERFORMANCE_THRESHOLDS.profit.negative) return 'negative'
  
  // Para lucro positivo, seguir as regras do ROAS
  return getROASPerformance(roas)
}

export function isHighPerformance(profit: number, roas: number): boolean {
  return profit > HIGH_PERFORMANCE_CONFIG.lucroMinimo && 
         roas >= HIGH_PERFORMANCE_CONFIG.roasMinimo
}

// 🎨 Funções para obter classes CSS
export function getPerformanceColors(level: PerformanceLevel) {
  if (level === 'negative') return COLOR_SCHEME.poor
  return COLOR_SCHEME[level]
}

export function getROASColors(roas: number) {
  const level = getROASPerformance(roas)
  return getPerformanceColors(level)
}

export function getProfitColors(profit: number, roas: number) {
  const level = getProfitPerformance(profit, roas)
  return getPerformanceColors(level)
} 