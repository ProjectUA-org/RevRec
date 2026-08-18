import type { Customer } from '../types/usageRevenue'
import { Tag } from './Tag'
import './Table.css'
import './ContractPolicyTable.css'

const METERING_UNIT_LABEL: Record<Customer['meteringUnit'], string> = {
  tokens: 'Tokens',
  'gpu-minutes': 'GPU-minutes',
  'api-requests': 'API requests',
}

export function ContractPolicyTable({ customers }: { customers: Customer[] }) {
  return (
    <div className="table-card">
      <table className="contract-policy-table">
        <colgroup>
          <col style={{ width: '160px' }} />
          <col style={{ width: '195px' }} />
          <col style={{ width: '135px' }} />
          <col style={{ width: '125px' }} />
          <col style={{ width: '245px' }} />
          <col style={{ width: '115px' }} />
          <col style={{ width: '123px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Legal entity</th>
            <th>Pricing model</th>
            <th>Metering unit</th>
            <th>Expiration policy</th>
            <th>Refundable</th>
            <th>Auto-recharge</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>
                {customer.name}
                <div className="contract-policy-table__contract-id">{customer.contractId}</div>
              </td>
              <td>{customer.legalEntity}</td>
              <td>
                <Tag
                  label={customer.contractType === 'payg' ? 'Pay-as-you-go' : 'Prepaid'}
                  tone={customer.contractType === 'payg' ? 'info' : 'matched'}
                />
              </td>
              <td>{METERING_UNIT_LABEL[customer.meteringUnit]}</td>
              <td>{customer.expirationPolicy}</td>
              <td>{customer.contractType === 'payg' ? 'N/A' : customer.refundable ? 'Yes' : 'No'}</td>
              <td>{customer.contractType === 'payg' ? 'N/A' : customer.autoRecharge ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
