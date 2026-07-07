import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Mail, PhoneCall, Sparkles, Users } from "lucide-react"
import type { ChurnResults, Customer, RiskTier } from "@/lib/churn-types"
import { tierBadgeClass } from "@/lib/churn-types"

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)

function iconFor(text: string) {
  const t = text.toLowerCase()
  if (t.includes("call") || t.includes("outreach")) return PhoneCall
  if (t.includes("email") || t.includes("newsletter")) return Mail
  if (t.includes("discount") || t.includes("offer") || t.includes("points") || t.includes("reward"))
    return Gift
  if (t.includes("referral") || t.includes("vip") || t.includes("bundle") || t.includes("tier"))
    return Sparkles
  return Users
}

export function CampaignsSection({ data }: { data: ChurnResults }) {
  const { customers } = data

  // Aggregate every recommendation into a campaign bucket
  const buckets = new Map<
    string,
    { reach: number; monthly: number; ltv: number; tiers: Set<string> }
  >()

  for (const c of customers as Customer[]) {
    for (const rec of c.recommendations) {
      const b =
        buckets.get(rec) ?? { reach: 0, monthly: 0, ltv: 0, tiers: new Set() }
      b.reach += 1
      b.monthly += c.monthly_fee
      b.ltv += c.lifetime_value
      b.tiers.add(c.risk_tier)
      buckets.set(rec, b)
    }
  }

  const campaigns = Array.from(buckets.entries())
    .map(([title, b]) => ({
      title,
      reach: b.reach,
      monthly: b.monthly,
      ltv: b.ltv,
      tiers: Array.from(b.tiers),
    }))
    .sort((a, b) => b.ltv - a.ltv)

  const priorityTier = (tiers: string[]): RiskTier =>
    tiers.includes("High") ? "High" : tiers.includes("Medium") ? "Medium" : "Low"

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">
            Re-engagement Campaign Engine
          </CardTitle>
          <CardDescription>
            Personalized retention plays generated from each member&apos;s risk
            tier, tenure, and service mix &mdash; ranked by lifetime value
            protected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {campaigns.map((c) => {
              const Icon = iconFor(c.title)
              const tier = priorityTier(c.tiers)
              return (
                <div
                  key={c.title}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="size-4" aria-hidden="true" />
                      </div>
                      <p className="text-pretty font-medium leading-snug text-foreground">
                        {c.title}
                      </p>
                    </div>
                    <Badge variant="outline" className={tierBadgeClass[tier]}>
                      {tier}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <Stat label="Members" value={c.reach.toLocaleString()} />
                    <Stat label="Monthly rev." value={currency(c.monthly)} />
                    <Stat label="LTV at stake" value={currency(c.ltv)} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums text-foreground">{value}</p>
    </div>
  )
}
