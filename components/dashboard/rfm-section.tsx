"use client"

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChurnResults } from "@/lib/churn-types"

const SEGMENT_ORDER = [
  "Champions",
  "Loyal",
  "Potential",
  "At Risk",
  "Hibernating",
]

export function RfmSection({ eda }: { eda: ChurnResults["eda"] }) {
  const segments = [...eda.segment_summary].sort(
    (a, b) => SEGMENT_ORDER.indexOf(a.segment) - SEGMENT_ORDER.indexOf(b.segment),
  )

  const chartData = segments.map((s) => ({
    name: s.segment,
    count: s.count,
    churn: +(s.churn_rate * 100).toFixed(1),
  }))

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">RFM Customer Segments</CardTitle>
        <CardDescription>
          Members grouped by combined Recency (tenure), Frequency (engagement),
          and Monetary (lifetime value) scores
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {segments.map((s) => (
            <div
              key={s.segment}
              className="rounded-lg border border-border bg-secondary/40 p-3"
            >
              <p className="text-sm font-medium text-foreground">{s.segment}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {s.count}
              </p>
              <p className="text-xs text-muted-foreground">
                {(s.churn_rate * 100).toFixed(0)}% churn
              </p>
            </div>
          ))}
        </div>

        <ChartContainer
          config={{ churn: { label: "Churn Rate", color: "var(--chart-3)" } }}
          className="h-[260px] w-full"
        >
          <BarChart data={chartData} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v) => `${v}%`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="churn" radius={[6, 6, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.churn >= 30 ? "var(--chart-3)" : "var(--chart-1)"}
                />
              ))}
              <LabelList
                dataKey="churn"
                position="top"
                className="fill-muted-foreground text-xs"
                formatter={(v: number) => `${v}%`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
