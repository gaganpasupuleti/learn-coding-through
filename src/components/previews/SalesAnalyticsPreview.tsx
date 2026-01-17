import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TrendUp, CurrencyDollar, ShoppingCart, User } from '@phosphor-icons/react'

export function SalesAnalyticsPreview() {
  const salesBySalesperson = [
    { name: 'John', sales: 3, total: 2475.00, avg: 825.00 },
    { name: 'Sarah', sales: 2, total: 375.00, avg: 187.50 }
  ]

  const topProducts = [
    { product: 'Laptop', sold: 2, revenue: 2400.00 },
    { product: 'Monitor', sold: 1, revenue: 350.00 },
    { product: 'Keyboard', sold: 1, revenue: 75.00 }
  ]

  return (
    <div className="min-h-[500px] bg-gradient-to-br from-accent/10 to-primary/5 rounded-lg p-6">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold">Sales Analytics Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Real-time insights from your sales data
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CurrencyDollar size={18} weight="duotone" />
              <span className="text-xs font-medium">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold text-primary">$2,850</div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShoppingCart size={18} weight="duotone" />
              <span className="text-xs font-medium">Total Sales</span>
            </div>
            <div className="text-2xl font-bold text-accent">5</div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendUp size={18} weight="duotone" />
              <span className="text-xs font-medium">Avg Sale</span>
            </div>
            <div className="text-2xl font-bold">$570</div>
          </Card>

          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User size={18} weight="duotone" />
              <span className="text-xs font-medium">Salespeople</span>
            </div>
            <div className="text-2xl font-bold">2</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="overflow-hidden">
            <div className="bg-primary/10 px-4 py-3 border-b">
              <h4 className="font-semibold">Sales by Salesperson</h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Avg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesBySalesperson.map((person) => (
                  <TableRow key={person.name}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell className="text-right">{person.sales}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      ${person.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      ${person.avg.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-accent/10 px-4 py-3 border-b">
              <h4 className="font-semibold">Top Selling Products</h4>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Times Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.product}>
                    <TableCell className="font-medium">{product.product}</TableCell>
                    <TableCell className="text-right">{product.sold}</TableCell>
                    <TableCell className="text-right font-semibold text-accent">
                      ${product.revenue.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        <Card className="bg-muted/50 px-4 py-3 text-xs text-muted-foreground font-mono">
          SELECT salesperson, COUNT(*) as num_sales, SUM(sale_amount) as total_sales
          FROM Sales GROUP BY salesperson ORDER BY total_sales DESC;
        </Card>
      </div>
    </div>
  )
}
