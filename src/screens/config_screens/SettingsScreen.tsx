import { useState } from 'react';
import LevyConfigSettings from './LevyConfigSettings';
import CommodityCodesSettings from './CommodityCodesSettings';

type SettingsTab = 'levy' | 'commodities';

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('levy');

  return (
    <div>
      <div className="flex gap-6 border-b border-[#c5c6d2] mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('levy')}
          className={`text-[14px] font-semibold px-1 pb-3 border-b-2 -mb-px ${
            activeTab === 'levy'
              ? 'text-[#002366] border-[#002366]'
              : 'text-[#444650] border-transparent hover:text-[#002366]'
          }`}
        >
          Levy &amp; Commission
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('commodities')}
          className={`text-[14px] font-semibold px-1 pb-3 border-b-2 -mb-px ${
            activeTab === 'commodities'
              ? 'text-[#002366] border-[#002366]'
              : 'text-[#444650] border-transparent hover:text-[#002366]'
          }`}
        >
          Commodity Codes
        </button>
      </div>

      {activeTab === 'levy' ? <LevyConfigSettings /> : <CommodityCodesSettings />}
    </div>
  );
}
