
'use client';

import { useEffect, useState } from 'react';
import { SkeletonCard } from './SkeletonCard';
import { DollarSign, CreditCard } from 'lucide-react';

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
      return value;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);
  };

  if (loading) {
    // Skeleton loading state that mimics the new design
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 mb-4">
        {Array.from({ length: accounts.length || 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800 p-2.5 rounded-lg animate-pulse">
            <div className="h-3.5 bg-gray-700 rounded w-3/4 mb-2.5"></div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="h-3.5 w-3.5 bg-gray-700 rounded-full mr-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="flex items-center">
                <div className="h-3.5 w-3.5 bg-gray-700 rounded-full mr-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (billingInfo.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 mb-4">
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
  );
};

export default BillingInfoCard;
