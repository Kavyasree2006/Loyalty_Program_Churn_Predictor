"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
  LabelList,
} from "recharts"
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
import { prettyFeature, type ChurnResults } from "@/lib/churn-types"

type Eda = ChurnResults["eda"]

const pct = (v: number) => `${(v * 100).toFixed(0)}%`

export function EdaSection({ eda }: { eda: Eda }) {
  const churnByService = eda.churn_by_service.map((d) => ({
    name: d.service_type,
    churn: +(d.churn_rate * 100).toFixed(1),
    count: d.count,
  }))
  const churnByTenure = eda.churn_by_tenure.map((d) => ({
    name: d.bucket,
    churn: +(d.churn_rate * 100).toFixed(1),
    count: d.count,
  }))
  const churnByAge = eda.churn_by_age.map((d) => ({
    name: d.group,
    churn: +(d.churn_rate * 100).toFixed(1),
  }))
  const fees = eda.fee_distribution.map((d) => ({
    name: d.range,
    count: d.count,
  }))
  const correlations = eda.correlations.map((d) => ({
    name: prettyFeature(d.feature),
    corr: +d.corr.toFixed(3),
  }))

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard
        title="Churn Rate by Tenure"
        description="Newer members churn far more than tenured ones"
      >
        <ChartContainer
          config={{ churn: { label: "Churn Rate", color: "var(--chart-3)" } }}
          className="h-[260px] w-full"
        >
          <BarChart data={churnByTenure} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="churn" fill="var(--color-churn)" radius={[6, 6, 0, 0]}>
              <LabelList
                dataKey="churn"
                position="top"
                className="fill-muted-foreground text-xs"
                formatter={(v: number) => `${v}%`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        title="Churn Rate by Service Type"
        description="Mobile-only members are the most likely to leave"
      >
        <ChartContainer
          config={{ churn: { label: "Churn Rate", color: "var(--chart-1)" } }}
          className="h-[260px] w-full"
        >
          <BarChart data={churnByService} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="churn" radius={[6, 6, 0, 0]}>
              {churnByService.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.churn > 35 ? "var(--chart-3)" : "var(--chart-1)"}
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
      </ChartCard>

      <ChartCard
        title="Churn Rate by Age Group"
        description="Engagement softens churn risk across cohorts"
      >
        <ChartContainer
          config={{ churn: { label: "Churn Rate", color: "var(--chart-4)" } }}
          className="h-[260px] w-full"
        >
          <BarChart data={churnByAge} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="churn" fill="var(--color-churn)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        title="Monthly Fee Distribution"
        description="Spread of monthly fees across the member base"
      >
        <ChartContainer
          config={{ count: { label: "Members", color: "var(--chart-5)" } }}
          className="h-[260px] w-full"
        >
          <BarChart data={fees} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </ChartCard>

      <Card className="border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">
            Feature Correlation with Churn
          </CardTitle>
          <CardDescription>
            Positive values raise churn likelihood; negative values protect
            against it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ corr: { label: "Correlation" } }}
            className="h-[280px] w-full"
          >
            <BarChart
              data={correlations}
              layout="vertical"
              margin={{ left: 24, right: 32 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" domain={[-0.5, 0.5]} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={130}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="corr" radius={4}>
                {correlations.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.corr >= 0 ? "var(--chart-3)" : "var(--chart-1)"}
                  />
                ))}
                <LabelList
                  dataKey="corr"
                  position="right"
                  className="fill-muted-foreground text-xs"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
