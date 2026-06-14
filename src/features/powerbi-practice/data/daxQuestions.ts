import type { DaxPracticeQuestion } from '../types/powerbiPractice.types'

export const DAX_PRACTICE_QUESTIONS: DaxPracticeQuestion[] = [
  {
    id: 'dax-retail-total-sales',
    title: 'Total Sales',
    datasetId: 'retail_sales',
    difficulty: 'easy',
    topic: 'aggregation',
    businessContext: 'The sales manager wants one KPI tile for total revenue across all orders.',
    learningObjective: 'Write a measure that adds up the SalesAmount column.',
    problemStatement: 'Create a measure named Total Sales that returns the sum of Sales[SalesAmount].',
    starterFormula: 'Total Sales = ',
    hints: [
      'DAX measures often start with a name, an equals sign, and an expression.',
      'Use SUM to add values from a single column.',
      'Reference the column as Sales[SalesAmount].',
    ],
    explanation: 'SUM adds every value in Sales[SalesAmount]. Measures like this power total revenue KPI tiles.',
    placeholderRules: {
      requiredFunctions: ['SUM'],
      requiredTableRefs: ['Sales'],
      requiredColumnRefs: ['SalesAmount'],
    },
  },
  {
    id: 'dax-retail-order-count',
    title: 'Order Count',
    datasetId: 'retail_sales',
    difficulty: 'easy',
    topic: 'counting',
    businessContext: 'Operations tracks how many orders were placed, not how many units sold.',
    learningObjective: 'Count rows in the Sales table with COUNT.',
    problemStatement: 'Create a measure named Order Count that counts rows in the Sales table.',
    starterFormula: 'Order Count = ',
    hints: [
      'COUNT counts rows in a table expression.',
      'Pass the Sales table to COUNT.',
    ],
    explanation: 'COUNT(Sales) counts every row in the Sales table, which maps to the number of orders.',
    placeholderRules: {
      requiredFunctions: ['COUNT'],
      requiredTableRefs: ['Sales'],
    },
  },
  {
    id: 'dax-retail-average-sales',
    title: 'Average Sales Amount',
    datasetId: 'retail_sales',
    difficulty: 'easy',
    topic: 'aggregation',
    businessContext: 'Finance wants the average order value for executive dashboards.',
    learningObjective: 'Use AVERAGE on a numeric column.',
    problemStatement: 'Create a measure named Average Sales that averages Sales[SalesAmount].',
    starterFormula: 'Average Sales = ',
    hints: [
      'AVERAGE works on a column of numbers.',
      'Reference Sales[SalesAmount] inside AVERAGE.',
    ],
    explanation: 'AVERAGE(Sales[SalesAmount]) returns the mean order value across all sales rows.',
    placeholderRules: {
      requiredFunctions: ['AVERAGE'],
      requiredTableRefs: ['Sales'],
      requiredColumnRefs: ['SalesAmount'],
    },
  },
  {
    id: 'dax-retail-total-quantity',
    title: 'Total Quantity Sold',
    datasetId: 'retail_sales',
    difficulty: 'easy',
    topic: 'aggregation',
    businessContext: 'Inventory planning needs total units sold across all products.',
    learningObjective: 'Sum the Quantity column with SUM.',
    problemStatement: 'Create a measure named Total Quantity that sums Sales[Quantity].',
    starterFormula: 'Total Quantity = ',
    hints: [
      'SUM adds numeric column values.',
      'Use the Quantity column from Sales.',
    ],
    explanation: 'SUM(Sales[Quantity]) totals every unit sold in the fictional retail dataset.',
    placeholderRules: {
      requiredFunctions: ['SUM'],
      requiredTableRefs: ['Sales'],
      requiredColumnRefs: ['Quantity'],
    },
  },
  {
    id: 'dax-retail-distinct-customers',
    title: 'Distinct Customers',
    datasetId: 'retail_sales',
    difficulty: 'medium',
    topic: 'distinct',
    businessContext: 'Marketing wants to know how many unique customers placed orders.',
    learningObjective: 'Use DISTINCTCOUNT on a customer key column.',
    problemStatement:
      'Create a measure named Distinct Customers that counts unique values in Sales[CustomerKey].',
    starterFormula: 'Distinct Customers = ',
    hints: [
      'DISTINCTCOUNT counts unique values in a column.',
      'CustomerKey identifies each customer on a sales row.',
    ],
    explanation:
      'DISTINCTCOUNT(Sales[CustomerKey]) counts unique customers who appear at least once in Sales.',
    placeholderRules: {
      requiredFunctions: ['DISTINCTCOUNT'],
      requiredTableRefs: ['Sales'],
      requiredColumnRefs: ['CustomerKey'],
    },
  },
]

export function getDaxQuestionById(id: string): DaxPracticeQuestion | undefined {
  return DAX_PRACTICE_QUESTIONS.find((question) => question.id === id)
}

export function getDefaultDaxQuestion(): DaxPracticeQuestion {
  return DAX_PRACTICE_QUESTIONS[0]
}
