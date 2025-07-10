
'use client';

import { useEffect, useState } from 'react';
import { SkeletonCard } from './SkeletonCard';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      if (accounts.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const adAccountIds = accounts.map(acc => acc.id).join(',');
        const response = await fetch(`/api/facebook/billing?accounts=${adAccountIds}`);
        const data = await response.json();
        setBillingInfo(data);
      } catch (error) {
        console.error('Failed to fetch billing info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingInfo();
  }, [accounts]);

  const formatCurrency = (value: string) => {
    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) {
      return value; // Retorna o valor original se não for um número
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);
  };

  if (loading) {
    return <SkeletonCard />;
  }

  if (billingInfo.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
      {billingInfo.map((info) => {
        const account = accounts.find(acc => acc.id === info.id);
        const accountName = account ? account.name : info.id;

        return (
          <div key={info.id} className="bg-gray-800 p-3 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold text-white truncate">{accountName}</h3>
            {info.error ? (
              <p className="text-red-500 text-xs">{info.error}</p>
            ) : (
              <div className="mt-1.5">
                <p className="text-xs text-gray-400">Saldo: <span className="block text-white font-medium text-sm">{formatCurrency(info.balance)}</span></p>
                {info.funding_source && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    Cartão: <span className="block text-white font-medium text-sm">{info.funding_source.display_string}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BillingInfoCard;
