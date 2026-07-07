import { Card, CardContent } from "@/components/ui/card"
import { Users, TrendingDown, AlertTriangle, DollarSign, Target } from "lucide-react"
import type { ChurnResults } from "@/lib/churn-types"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)
}

export function KpiCards({ data }: { data: ChurnResults }) {
  const { eda, risk_summary, best_model } = data

  const kpis = [
    {
      label: "Loyalty Members",
      value: eda.n_customers.toLocaleString(),
      sub: `${eda.n_churned} historically churned`,
      icon: Users,
      tone: "text-foreground",
    },
    {
      label: "Overall Churn Rate",
      value: `${(eda.overall_churn_rate * 100).toFixed(1)}%`,
      sub: `${eda.n_retained} retained members`,
      icon: TrendingDown,
      tone: "text-foreground",
    },
    {
      label: "High-Risk Members",
      value: risk_summary.High.toLocaleString(),
      sub: `${risk_summary.Medium} medium · ${risk_summary.Low} low`,
      icon: AlertTriangle,
      tone: "text-[var(--chart-3)]",
    },
    {
      label: "Monthly Revenue at Risk",
      value: formatCurrency(risk_summary.revenue_at_risk),
      sub: `${formatCurrency(risk_summary.high_risk_ltv)} lifetime value`,
      icon: DollarSign,
      tone: "text-foreground",
    },
    {
      label: "Model ROC-AUC",
      value: best_model.metrics.roc_auc.toFixed(3),
      sub: `${best_model.name} · F1 ${best_model.metrics.f1.toFixed(2)}`,
      icon: Target,
      tone: "text-primary",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {kpis.map((k) => {
        const Icon = k.icon
        return (
          <Card key={k.label} className="border-border">
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {k.label}
                </span>
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className={`text-2xl font-semibold tracking-tight ${k.tone}`}>
                  {k.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{k.sub}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
