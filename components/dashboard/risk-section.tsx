"use client"

import { useMemo, useState } from "react"
import { Pie, PieChart, Cell } from "recharts"
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChartContainer } from "@/components/ui/chart"
import { Search } from "lucide-react"
import type { ChurnResults, Customer } from "@/lib/churn-types"
import { tierBadgeClass } from "@/lib/churn-types"

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)

export function RiskSection({ data }: { data: ChurnResults }) {
  const { customers, risk_summary } = data
  const [query, setQuery] = useState("")
  const [tier, setTier] = useState<string>("all")
  const [service, setService] = useState<string>("all")

  const services = useMemo(
    () => Array.from(new Set(customers.map((c) => c.service_type))).sort(),
    [customers],
  )

  const filtered = useMemo(() => {
    return customers
      .filter((c) => (tier === "all" ? true : c.risk_tier === tier))
      .filter((c) => (service === "all" ? true : c.service_type === service))
      .filter((c) =>
        query.trim() === ""
          ? true
          : c.customer_id.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .sort((a, b) => b.risk_score - a.risk_score)
  }, [customers, tier, service, query])

  const shown = filtered.slice(0, 60)

  const pieData = [
    { name: "High", value: risk_summary.High, color: "var(--chart-3)" },
    { name: "Medium", value: risk_summary.Medium, color: "var(--chart-2)" },
    { name: "Low", value: risk_summary.Low, color: "var(--chart-1)" },
  ]
  const total = risk_summary.High + risk_summary.Medium + risk_summary.Low

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Risk Distribution</CardTitle>
            <CardDescription>Members by churn-risk tier</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ChartContainer config={{}} className="h-[160px] w-[160px]">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={72}
                  strokeWidth={2}
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="flex flex-1 flex-col gap-2 text-sm">
              {pieData.map((d) => (
                <li key={d.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-sm"
                      style={{ backgroundColor: d.color }}
                    />
                    {d.name} risk
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {d.value} ({((d.value / total) * 100).toFixed(0)}%)
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Risk Scoring Methodology</CardTitle>
            <CardDescription>
              How each member&apos;s 0&ndash;100 risk score is built
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <Method
              title="70% Model Probability"
              body="Churn probability from the tuned classifier on behavioural features."
            />
            <Method
              title="30% Inverse RFM"
              body="Low Recency/Frequency/Monetary value raises the score."
            />
            <Method
              title="Tiering"
              body="High ≥ 60, Medium 35–59, Low < 35 on the blended score."
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Member Risk Register</CardTitle>
          <CardDescription>
            Sorted by risk score · showing {shown.length} of {filtered.length}{" "}
            matching members
          </CardDescription>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search member ID…"
                className="pl-9"
              />
            </div>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Risk tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tiers</SelectItem>
                <SelectItem value="High">High risk</SelectItem>
                <SelectItem value="Medium">Medium risk</SelectItem>
                <SelectItem value="Low">Low risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Tenure</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead>RFM Segment</TableHead>
                  <TableHead className="text-right">Risk Score</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Top Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shown.map((c) => (
                  <RiskRow key={c.customer_id} c={c} />
                ))}
                {shown.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No members match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RiskRow({ c }: { c: Customer }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{c.customer_id}</TableCell>
      <TableCell className="capitalize text-muted-foreground">
        {c.service_type}
      </TableCell>
      <TableCell className="text-right tabular-nums">{c.tenure} mo</TableCell>
      <TableCell className="text-right tabular-nums">
        {currency(c.monthly_fee)}
      </TableCell>
      <TableCell className="text-muted-foreground">{c.rfm_segment}</TableCell>
      <TableCell className="text-right">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full"
              style={{
                width: `${c.risk_score}%`,
                backgroundColor:
                  c.risk_tier === "High"
                    ? "var(--chart-3)"
                    : c.risk_tier === "Medium"
                      ? "var(--chart-2)"
                      : "var(--chart-1)",
              }}
            />
          </span>
          <span className="tabular-nums font-medium">{c.risk_score.toFixed(0)}</span>
        </span>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={tierBadgeClass[c.risk_tier]}>
          {c.risk_tier}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[220px] text-pretty text-xs text-muted-foreground">
        {c.recommendations[0]}
      </TableCell>
    </TableRow>
  )
}

function Method({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 leading-relaxed">{body}</p>
    </div>
  )
}
