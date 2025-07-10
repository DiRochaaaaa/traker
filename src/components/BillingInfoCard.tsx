
'use client';

import { useState } from 'react';
import { DollarSign, CreditCard, RefreshCw } from 'lucide-react';

interface BillingInfoData {
  id: string;
  balance: string;
  funding_source: {
    display_string: string;
    type: string;
  } | null;
  error?: string;
}

interface AccountDetail {
  id: string;
  name: string;
}

const BillingInfoCard = ({ accounts }: { accounts: AccountDetail[] }) => {
  const [billingInfo, setBillingInfo] = useState<BillingInfoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

  const fetchBillingInfo = async () => {
    if (accounts.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const adAccountIds = accounts.map(acc => acc.id).join(',');
      const response = await fetch(`/api/facebook/billing?accounts=${adAccountIds}`);
      const data = await response.json();
      setBillingInfo(data);
      setHasData(true);
    } catch (error) {
      console.error('Failed to fetch billing info:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) {
      return value;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);
  };

  // Se não tem dados ainda, mostrar botão para consultar
  if (!hasData && !loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-1">Saldos das Contas de Anúncio</h3>
            <p className="text-xs text-gray-400">Clique para consultar os saldos atuais das suas contas</p>
          </div>
          <button
            onClick={fetchBillingInfo}
            disabled={accounts.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Consultar Saldos</span>
          </button>
        </div>
      </div>
    );
  }

  // Estado de loading
  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-400" />
          <span className="text-sm text-gray-300">Consultando saldos das contas...</span>
        </div>
      </div>
    );
  }

  // Mostrar dados com botão para atualizar
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300">Saldos das Contas de Anúncio</h3>
        <button
          onClick={fetchBillingInfo}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-xs">Atualizar</span>
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {billingInfo.map((info) => {
          const account = accounts.find(acc => acc.id === info.id);
          const accountName = account ? account.name : info.id;

          return (
            <div key={info.id} className="bg-gray-800 p-2.5 rounded-lg shadow-md transition-all hover:bg-gray-700/50">
              <h3 className="text-xs font-semibold text-gray-300 truncate mb-2">{accountName}</h3>
              {info.error ? (
                <p className="text-red-500 text-xs">{info.error}</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <DollarSign className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                    <span className="text-sm text-gray-100 font-medium truncate">{formatCurrency(info.balance)}</span>
                  </div>
                  {info.funding_source && (
                    <div className="flex items-center">
                      <CreditCard className="h-3.5 w-3.5 text-gray-500 mr-1.5 flex-shrink-0" />
                      <span className="text-sm text-gray-100 font-medium truncate">{info.funding_source.display_string}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BillingInfoCard;
