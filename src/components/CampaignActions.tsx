'use client'

import { useState } from 'react'
import { Play, Pause, DollarSign, Settings, Loader2 } from 'lucide-react'
import { CampaignMetrics } from '@/hooks/useFacebookData'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from './ToastContainer'

interface CampaignActionsProps {
  campaign: CampaignMetrics
  onActionComplete?: () => void
  showBudgetModal?: boolean
  onCloseBudgetModal?: () => void
  variant?: 'full' | 'minimal' | 'budget-only' // Nova propriedade
}

export function CampaignActions({ 
  campaign, 
  onActionComplete, 
  showBudgetModal = false, 
  onCloseBudgetModal,
  variant = 'full' // Padrão é 'full'
}: CampaignActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [newBudget, setNewBudget] = useState('')

  const { toasts, removeToast, success, error } = useToast()

  const isActive = campaign.status === 'ACTIVE'

  const handleStatusToggle = async () => {
    setIsProcessing(true)
    try {
      const action = isActive ? 'pause' : 'resume'
      
      const response = await fetch('/api/facebook/campaigns/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.campaign_id,
          action
        })
      })

      const result = await response.json()

      if (result.success) {
        success(
          `Campanha ${action === 'pause' ? 'pausada' : 'reativada'}!`,
          `${campaign.name} foi ${action === 'pause' ? 'pausada' : 'reativada'} com sucesso`
        )
        if (onActionComplete) {
          setTimeout(() => onActionComplete(), 1000)
        }
      } else {
        console.error('❌ Erro ao alterar status:', result)
        error(
          'Erro ao alterar status da campanha',
          result.details || result.error
        )
      }
    } catch (err) {
      console.error('Erro de conexão:', err)
      error('Erro de conexão', 'Não foi possível conectar com o servidor')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBudgetChange = async () => {
    if (!newBudget || parseFloat(newBudget) <= 0) {
      error('Valor inválido', 'Digite um valor válido para o orçamento')
      return
    }

    setIsProcessing(true)
    try {
      const budgetInCents = Math.round(parseFloat(newBudget) * 100)
      
      const response = await fetch('/api/facebook/campaigns/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.campaign_id,
          newBudget: budgetInCents,
          budgetType: campaign.budgetType
        })
      })

      const result = await response.json()

      if (result.success) {
        success(
          `Orçamento ${campaign.budgetType} alterado!`,
          `Novo orçamento de R$ ${parseFloat(newBudget).toFixed(2)}/dia foi aplicado`
        )
        setNewBudget('')
        if (onCloseBudgetModal) onCloseBudgetModal()
        if (onActionComplete) {
          setTimeout(() => onActionComplete(), 1000)
        }
      } else {
        console.error('❌ Erro ao alterar orçamento:', result)
        error(
          'Erro ao alterar orçamento',
          result.details || result.error
        )
      }
    } catch (err) {
      console.error('Erro de conexão:', err)
      error('Erro de conexão', 'Não foi possível conectar com o servidor')
    } finally {
      setIsProcessing(false)
    }
  }

  const getBudgetTypeLabel = () => {
    switch (campaign.budgetType) {
      case 'CBO':
        return '🎯 CBO (Campaign Budget Optimization)'
      case 'ABO':
        return '📊 ABO (Ad Set Budget Optimization)'
      default:
        return '❓ Tipo de orçamento não identificado'
    }
  }

  const getBudgetExplanation = () => {
    if (campaign.budgetType === 'CBO') {
      return 'O orçamento será alterado no nível da campanha. O Facebook distribuirá automaticamente entre os ad sets.'
    } else if (campaign.budgetType === 'ABO') {
      return 'O orçamento será distribuído igualmente entre todos os ad sets desta campanha.'
    }
    return 'Não foi possível identificar o tipo de orçamento desta campanha.'
  }

  // Renderização mínima para o botão de ativar/pausar
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleStatusToggle}
        disabled={isProcessing}
        className={`
          relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shadow-lg
          ${isActive 
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25' 
            : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/25'
          }
          ${isProcessing ? 'opacity-75 scale-95' : 'hover:scale-110 active:scale-95'}
          disabled:cursor-not-allowed
        `}
        title={isActive ? 'Pausar campanha' : 'Reativar campanha'}
      >
        {isProcessing ? (
          <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
        ) : isActive ? (
          <Pause className="h-3.5 w-3.5 text-white" fill="currentColor" />
        ) : (
          <Play className="h-3.5 w-3.5 text-white ml-0.5" fill="currentColor" />
        )}
      </button>
    )
  }

  if (variant === 'budget-only') {
    // Se o modal não deve ser mostrado, não renderiza nada.
    if (!showBudgetModal) {
      return null
    }
    
    // Renderiza apenas o ToastContainer e o Modal
    return (
      <>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        {/* O Modal de Orçamento é renderizado aqui, mas controlado pelo estado `showBudgetModal` vindo do pai */}
        {showBudgetModal && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {/* Conteúdo do Modal... */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-xl">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="relative p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                  <div className="absolute inset-0 bg-blue-500/10 rounded-xl animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Alterar Orçamento
                  </h3>
                  <p className="text-sm text-gray-400 truncate max-w-52">{campaign.name}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              
              {/* Tipo de Orçamento */}
              <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 p-4 rounded-xl border border-gray-700/30">
                <div className="text-sm font-medium text-white mb-1">
                  {getBudgetTypeLabel()}
                </div>
                <div className="text-xs text-gray-400 leading-relaxed">
                  {getBudgetExplanation()}
                </div>
              </div>

              {/* Orçamento Atual */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Orçamento Atual
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                      R$ {campaign.dailyBudget.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">por dia</div>
                  </div>
                </div>
              </div>

              {/* Novo Orçamento */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Novo Orçamento Diário
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    R$
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    placeholder="50.00"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500">
                  💡 Valor mínimo: R$ 1,00
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-700/50">
              <button
                onClick={() => {
                  if (onCloseBudgetModal) onCloseBudgetModal()
                }}
                className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBudgetChange}
                disabled={isProcessing}
                className="relative flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-75"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar
              </button>
            </div>

          </div>
          </div>
        )}
      </>
    )
  }

  // Renderização completa (padrão)
  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="flex items-center gap-2">
        {/* Botão de Pausar/Ativar */}
        <button
          onClick={handleStatusToggle}
          disabled={isProcessing}
          className={`
            relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shadow-lg
            ${isActive 
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25' 
              : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/25'
            }
            ${isProcessing ? 'opacity-75 scale-95' : 'hover:scale-110 active:scale-95'}
            disabled:cursor-not-allowed
          `}
          title={isActive ? 'Pausar campanha' : 'Reativar campanha'}
        >
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
          ) : isActive ? (
            <Pause className="h-3.5 w-3.5 text-white" fill="currentColor" />
          ) : (
            <Play className="h-3.5 w-3.5 text-white ml-0.5" fill="currentColor" />
          )}
          
          {/* Indicator Ring */}
          <div className={`
            absolute inset-0 rounded-full ring-2 ring-offset-1 ring-offset-gray-900 transition-opacity
            ${isActive ? 'ring-amber-400/50' : 'ring-emerald-400/50'}
            ${isProcessing ? 'opacity-100 animate-pulse' : 'opacity-0 group-hover:opacity-100'}
          `} />
        </button>

        {/* Modal de Alterar Orçamento - Controlado Externamente */}
        {showBudgetModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md backdrop-blur-xl">
              
              {/* Header */}
              <div className="p-5 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="relative p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                    <DollarSign className="h-5 w-5 text-blue-400" />
                    <div className="absolute inset-0 bg-blue-500/10 rounded-xl animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Alterar Orçamento
                    </h3>
                    <p className="text-sm text-gray-400 truncate max-w-52">{campaign.name}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                
                {/* Tipo de Orçamento */}
                <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 p-4 rounded-xl border border-gray-700/30">
                  <div className="text-sm font-medium text-white mb-1">
                    {getBudgetTypeLabel()}
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed">
                    {getBudgetExplanation()}
                  </div>
                </div>

                {/* Orçamento Atual */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Orçamento Atual
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      <div className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        R$ {campaign.dailyBudget.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">por dia</div>
                    </div>
                  </div>
                </div>

                {/* Novo Orçamento */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Novo Orçamento Diário
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      R$
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      placeholder="50.00"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    💡 Valor mínimo: R$ 1,00
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-700/50">
                <button
                  onClick={() => {
                    if (onCloseBudgetModal) onCloseBudgetModal()
                    setNewBudget('')
                  }}
                  className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBudgetChange}
                  disabled={isProcessing || !newBudget}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4" />
                      Alterar
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  )
} 