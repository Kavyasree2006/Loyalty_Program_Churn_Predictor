import { getChurnResults } from "@/lib/churn-types"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { EdaSection } from "@/components/dashboard/eda-section"
import { RfmSection } from "@/components/dashboard/rfm-section"
import { ModelSection } from "@/components/dashboard/model-section"
import { RiskSection } from "@/components/dashboard/risk-section"
import { CampaignsSection } from "@/components/dashboard/campaigns-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Page() {
  const data = getChurnResults()

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader modelName={data.best_model.name} />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <KpiCards data={data} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary p-1">
            <TabsTrigger value="overview">EDA &amp; RFM</TabsTrigger>
            <TabsTrigger value="model">Model Performance</TabsTrigger>
            <TabsTrigger value="risk">Risk Scoring</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 flex flex-col gap-4">
            <RfmSection eda={data.eda} />
            <EdaSection eda={data.eda} />
          </TabsContent>

          <TabsContent value="model" className="mt-6">
            <ModelSection data={data} />
          </TabsContent>

          <TabsContent value="risk" className="mt-6">
            <RiskSection data={data} />
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <CampaignsSection data={data} />
          </TabsContent>
        </Tabs>

        <footer className="border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            Trained with {data.generated_with} on {data.eda.n_customers} loyalty
            members ({data.inspection.duplicate_rows} duplicates,{" "}
            {Object.values(data.inspection.missing_values).reduce((a, b) => a + b, 0)}{" "}
            missing values handled). Model, predictions CSV, and cleaned dataset
            are exported to <code>/ml/outputs</code>.
          </p>
        </footer>
      </div>
    </main>
  )
}
