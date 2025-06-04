'use client'

import { useState } from 'react'
import { X, Save, RotateCcw, Palette } from 'lucide-react'
import { PERFORMANCE_THRESHOLDS, HIGH_PERFORMANCE_CONFIG } from '@/config/performanceColors'

interface ColorConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: Record<string, number>) => void
}

export function ColorConfigModal({ isOpen, onClose, onSave }: ColorConfigModalProps) {
  const [config, setConfig] = useState({
    roasExcelente: PERFORMANCE_THRESHOLDS.roas.excellent,
    roasModerado: PERFORMANCE_THRESHOLDS.roas.moderate,
    lucroPositivo: PERFORMANCE_THRESHOLDS.profit.positive,
    altoDesempenhoLucro: HIGH_PERFORMANCE_CONFIG.lucroMinimo,
    altoDesempenhoRoas: HIGH_PERFORMANCE_CONFIG.roasMinimo
  })

  const [presets] = useState({
    conservador: { roasExcelente: 3.0, roasModerado: 1.5, lucroPositivo: 0, altoDesempenhoLucro: 0, altoDesempenhoRoas: 3.0 },
    balanceado: { roasExcelente: 2.0, roasModerado: 1.0, lucroPositivo: 0, altoDesempenhoLucro: 0, altoDesempenhoRoas: 2.0 },
    agressivo: { roasExcelente: 1.5, roasModerado: 0.8, lucroPositivo: 0, altoDesempenhoLucro: 0, altoDesempenhoRoas: 1.5 }
  })

  if (!isOpen) return null

  const resetToDefault = () => {
    setConfig({
      roasExcelente: 2.0,
      roasModerado: 1.0,
      lucroPositivo: 0,
      altoDesempenhoLucro: 0,
      altoDesempenhoRoas: 2.0
    })
  }

  const applyPreset = (preset: keyof typeof presets) => {
    setConfig(presets[preset])
  }

  const handleSave = () => {
    onSave(config)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-scroll">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Palette className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Configuração de Cores</h2>
              <p className="text-sm text-gray-400">Ajuste as regras de performance e cores do sistema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Presets */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">🎯 Presets Rápidos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => applyPreset('conservador')}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-colors text-left"
              >
                <div className="font-medium text-white">Conservador</div>
                <div className="text-sm text-gray-400">ROAS ≥ 3.0 = Verde</div>
                <div className="text-sm text-gray-400">ROAS ≥ 1.5 = Amarelo</div>
              </button>
              <button
                onClick={() => applyPreset('balanceado')}
                className="p-4 bg-blue-700/30 hover:bg-blue-700/50 rounded-lg border border-blue-500/30 transition-colors text-left"
              >
                <div className="font-medium text-white">Balanceado ⭐</div>
                <div className="text-sm text-gray-400">ROAS ≥ 2.0 = Verde</div>
                <div className="text-sm text-gray-400">ROAS ≥ 1.0 = Amarelo</div>
              </button>
              <button
                onClick={() => applyPreset('agressivo')}
                className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-colors text-left"
              >
                <div className="font-medium text-white">Agressivo</div>
                <div className="text-sm text-gray-400">ROAS ≥ 1.5 = Verde</div>
                <div className="text-sm text-gray-400">ROAS ≥ 0.8 = Amarelo</div>
              </button>
            </div>
          </div>

          {/* ROAS Settings */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">📊 Configurações de ROAS</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🟢 ROAS Excelente (Verde)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.roasExcelente}
                  onChange={(e) => setConfig({...config, roasExcelente: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="2.0"
                />
                <p className="text-xs text-gray-400 mt-1">
                  ROAS maior ou igual a este valor será destacado em verde
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🟡 ROAS Moderado (Amarelo)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.roasModerado}
                  onChange={(e) => setConfig({...config, roasModerado: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="1.0"
                />
                <p className="text-xs text-gray-400 mt-1">
                  ROAS entre este valor e o excelente será amarelo. Abaixo será vermelho.
                </p>
              </div>
            </div>
          </div>

          {/* High Performance Settings */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">🏆 Performance Excepcional</h3>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 space-y-4">
              <p className="text-sm text-green-300">
                Campanhas com performance excepcional recebem destaque especial com bordas, gradientes e ícones animados.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">
                  💰 Lucro Mínimo
                </label>
                <input
                  type="number"
                  step="1"
                  value={config.altoDesempenhoLucro}
                  onChange={(e) => setConfig({...config, altoDesempenhoLucro: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-700 border border-green-500/30 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">
                  🎯 ROAS Mínimo
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.altoDesempenhoRoas}
                  onChange={(e) => setConfig({...config, altoDesempenhoRoas: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-700 border border-green-500/30 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="2.0"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">🎨 Preview das Cores</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
                <div className="text-green-400 text-sm font-medium">🟢 Excelente</div>
                <div className="text-green-200 text-xs">ROAS ≥ {config.roasExcelente}</div>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
                <div className="text-yellow-400 text-sm font-medium">🟡 Moderado</div>
                <div className="text-yellow-200 text-xs">{config.roasModerado} ≤ ROAS {'<'} {config.roasExcelente}</div>
              </div>
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                <div className="text-red-400 text-sm font-medium">🔴 Ruim</div>
                <div className="text-red-200 text-xs">ROAS {'<'} {config.roasModerado}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              Salvar Configurações
            </button>
          </div>
        </div>

      </div>
    </div>
  )
} 