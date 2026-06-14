import type { DaxDatasetId, DaxDatasetMeta } from '../types/powerbiPractice.types'

export const DAX_DATASETS: DaxDatasetMeta[] = [
  {
    id: 'retail_sales',
    displayName: 'Contoso Retail Sales (Fictional)',
    description:
      'Sample star-schema-style tables for DAX practice. All company, product, and customer names are fictional.',
    tables: [
      {
        name: 'Sales',
        columns: [
          { name: 'OrderID', dataType: 'Whole Number' },
          { name: 'OrderDate', dataType: 'Date' },
          { name: 'ProductKey', dataType: 'Whole Number' },
          { name: 'CustomerKey', dataType: 'Whole Number' },
          { name: 'Quantity', dataType: 'Whole Number' },
          { name: 'UnitPrice', dataType: 'Decimal' },
          { name: 'SalesAmount', dataType: 'Decimal' },
        ],
      },
      {
        name: 'Products',
        columns: [
          { name: 'ProductKey', dataType: 'Whole Number' },
          { name: 'ProductName', dataType: 'Text' },
          { name: 'Category', dataType: 'Text' },
        ],
      },
      {
        name: 'Customers',
        columns: [
          { name: 'CustomerKey', dataType: 'Whole Number' },
          { name: 'CustomerName', dataType: 'Text' },
          { name: 'Region', dataType: 'Text' },
        ],
      },
    ],
  },
]

export function getDatasetById(id: DaxDatasetId): DaxDatasetMeta {
  const dataset = DAX_DATASETS.find((entry) => entry.id === id)
  if (!dataset) {
    throw new Error(`Unknown DAX dataset: ${id}`)
  }
  return dataset
}
