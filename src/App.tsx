import { useState } from 'react'
import './App.css'
import { RevenueReconciliation } from './views/RevenueReconciliation'
import { ProfitAndLoss } from './views/ProfitAndLoss'
import { UsageRevenueHub } from './views/UsageRevenueHub'

const TABS = [
  { id: 'usage-revenue-hub', label: 'Usage Revenue Hub' },
  { id: 'reconciliation', label: 'Revenue Reconciliation' },
  { id: 'pnl', label: 'P&L' },
] as const

type TabId = (typeof TABS)[number]['id']

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('usage-revenue-hub')

  return (
    <div className="app">
      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'usage-revenue-hub' && <UsageRevenueHub />}
      {activeTab === 'reconciliation' && <RevenueReconciliation />}
      {activeTab === 'pnl' && <ProfitAndLoss />}
    </div>
  )
}

export default App
