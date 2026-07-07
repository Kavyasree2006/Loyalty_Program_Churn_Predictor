"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LabelList,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { prettyFeature, type ChurnResults } from "@/lib/churn-types"

export function ModelSection({ data }: { data: ChurnResults }) {
  const { model_comparison, best_model, feature_importance } = data
  const cm = best_model.metrics.confusion_matrix
  const [[tn, fp], [fn, tp]] = cm

  const roc = best_model.metrics.roc_curve.map((p) => ({
    fpr: p.fpr,
    tpr: p.tpr,
  }))

  const importance = feature_importance.slice(0, 8).map((d) => ({
    name: prettyFeature(d.feature),
    importance: +(d.importance * 100).toFixed(1),
  }))

  const metricKeys: { key: keyof (typeof model_comparison)[0]; label: string }[] =
    [
      { key: "accuracy", label: "Accuracy" },
      { key: "precision", label: "Precision" },
      { key: "recall", label: "Recall" },
      { key: "f1", label: "F1" },
      { key: "roc_auc", label: "ROC-AUC" },
    ]

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Model Comparison</CardTitle>
          <CardDescription>
            Three classifiers evaluated on a held-out 20% test set. The
            best ROC-AUC model was tuned with 5-fold cross-validated grid search.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  {metricKeys.map((m) => (
                    <TableHead key={m.key} className="text-right">
                      {m.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {model_comparison.map((row) => {
                  const isBest = row.model === best_model.name
                  return (
                    <TableRow key={row.model} className={isBest ? "bg-accent/40" : ""}>
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-2">
                          {row.model}
                          {isBest && (
                            <Badge className="bg-primary text-primary-foreground">
                              Selected
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      {metricKeys.map((m) => (
                        <TableCell key={m.key} className="text-right tabular-nums">
                          {(row[m.key] as number).toFixed(3)}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Note: this is a noise-free synthetic dataset, so tree-based models
            separate it almost perfectly. Logistic Regression&apos;s lower score
            reflects the non-linear decision boundary.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Confusion Matrix</CardTitle>
            <CardDescription>
              {best_model.name} predictions on the test set
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-sm">
              <div />
              <div className="text-center font-medium text-muted-foreground">
                Pred: Retain
              </div>
              <div className="text-center font-medium text-muted-foreground">
                Pred: Churn
              </div>

              <div className="flex items-center font-medium text-muted-foreground">
                Actual: Retain
              </div>
              <MatrixCell value={tn} label="True Negative" good />
              <MatrixCell value={fp} label="False Positive" />

              <div className="flex items-center font-medium text-muted-foreground">
                Actual: Churn
              </div>
              <MatrixCell value={fn} label="False Negative" />
              <MatrixCell value={tp} label="True Positive" good />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">ROC Curve</CardTitle>
            <CardDescription>
              AUC = {best_model.metrics.roc_auc.toFixed(3)} (CV{" "}
              {best_model.cv_roc_auc.toFixed(3)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ tpr: { label: "True Positive Rate", color: "var(--chart-1)" } }}
              className="h-[240px] w-full"
            >
              <AreaChart data={roc} margin={{ left: 4, right: 8 }}>
                <CartesianGrid />
                <XAxis
                  dataKey="fpr"
                  type="number"
                  domain={[0, 1]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <YAxis
                  domain={[0, 1]}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine
                  segment={[
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                  ]}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                />
                <Area
                  dataKey="tpr"
                  type="monotone"
                  fill="var(--color-tpr)"
                  fillOpacity={0.18}
                  stroke="var(--color-tpr)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Churn Drivers (Feature Importance)</CardTitle>
          <CardDescription>
            Relative contribution of each feature to the model&apos;s predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ importance: { label: "Importance %", color: "var(--chart-1)" } }}
            className="h-[300px] w-full"
          >
            <BarChart
              data={importance}
              layout="vertical"
              margin={{ left: 24, right: 40 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="importance" fill="var(--color-importance)" radius={4}>
                <LabelList
                  dataKey="importance"
                  position="right"
                  className="fill-muted-foreground text-xs"
                  formatter={(v: number) => `${v}%`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function MatrixCell({
  value,
  label,
  good,
}: {
  value: number
  label: string
  good?: boolean
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border p-4 ${
        good
          ? "border-primary/30 bg-primary/10"
          : "border-[var(--chart-3)]/30 bg-[var(--chart-3)]/10"
      }`}
    >
      <span className="text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
