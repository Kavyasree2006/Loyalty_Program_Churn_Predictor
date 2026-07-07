import { Activity } from "lucide-react"

export function DashboardHeader({ modelName }: { modelName: string }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-pretty text-xl font-semibold tracking-tight text-foreground">
              Loyalty Churn Predictor
            </h1>
            <p className="text-sm text-muted-foreground">
              Retention analytics &amp; re-engagement intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          <span className="text-sm text-secondary-foreground">
            Production model:{" "}
            <span className="font-medium text-foreground">{modelName}</span>
          </span>
        </div>
      </div>
    </header>
  )
}
