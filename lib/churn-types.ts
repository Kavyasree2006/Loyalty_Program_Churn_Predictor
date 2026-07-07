export type RiskTier = "High" | "Medium" | "Low"

export interface Customer {
  customer_id: string
  age: number
  tenure: number
  service_type: string
  monthly_fee: number
  lifetime_value: number
  rfm_segment: string
  rfm_score: number
  churn_probability: number
  risk_score: number
  risk_tier: RiskTier
  actual_churn: number
  recommendations: string[]
}

export interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1: number
  roc_auc: number
  confusion_matrix: number[][]
  roc_curve: { fpr: number; tpr: number }[]
}

export interface ChurnResults {
  generated_with: string
  inspection: {
    n_rows: number
    n_cols: number
    columns: string[]
    dtypes: Record<string, string>
    missing_values: Record<string, number>
    duplicate_rows: number
    duplicate_customer_ids: number
  }
  eda: {
    overall_churn_rate: number
    n_customers: number
    n_churned: number
    n_retained: number
    summary_stats: Record<
      string,
      {
        mean: number
        std: number
        min: number
        p25: number
        median: number
        p75: number
        max: number
      }
    >
    age_distribution: { range: string; count: number }[]
    fee_distribution: { range: string; count: number }[]
    tenure_distribution: { range: string; count: number }[]
    churn_by_service: {
      service_type: string
      count: number
      churn_rate: number
      avg_fee: number
      avg_tenure: number
    }[]
    churn_by_tenure: { bucket: string; count: number; churn_rate: number }[]
    churn_by_age: { group: string; count: number; churn_rate: number }[]
    segment_summary: {
      segment: string
      count: number
      churn_rate: number
      avg_ltv: number
    }[]
    correlations: { feature: string; corr: number }[]
  }
  model_comparison: {
    model: string
    accuracy: number
    precision: number
    recall: number
    f1: number
    roc_auc: number
  }[]
  best_model: {
    name: string
    cv_roc_auc: number
    best_params: Record<string, string>
    metrics: ModelMetrics
  }
  feature_importance: { feature: string; importance: number }[]
  risk_summary: {
    High: number
    Medium: number
    Low: number
    revenue_at_risk: number
    high_risk_ltv: number
  }
  customers: Customer[]
}

import results from "@/lib/data/churn-results.json"

export function getChurnResults(): ChurnResults {
  return results as unknown as ChurnResults
}

export const FEATURE_LABELS: Record<string, string> = {
  monthly_fee: "Monthly Fee",
  age: "Age",
  tenure: "Tenure (months)",
  engagement_score: "Engagement Score",
  lifetime_value: "Lifetime Value",
  RFM_score: "RFM Score",
  rfm_score: "RFM Score",
}

export function prettyFeature(name: string): string {
  if (FEATURE_LABELS[name]) return FEATURE_LABELS[name]
  // one-hot like service_type_bundle
  if (name.startsWith("service_type_")) {
    const v = name.replace("service_type_", "")
    return `Service: ${v.charAt(0).toUpperCase()}${v.slice(1)}`
  }
  return name
}

export const tierColor: Record<RiskTier, string> = {
  High: "var(--chart-3)",
  Medium: "var(--chart-2)",
  Low: "var(--chart-1)",
}

// Semantic badge styling so risk tiers are readable at a glance.
export const tierBadgeClass: Record<RiskTier, string> = {
  High: "border-transparent bg-destructive/12 text-destructive",
  Medium: "border-transparent bg-[oklch(0.72_0.15_70)]/15 text-[oklch(0.45_0.13_60)]",
  Low: "border-transparent bg-primary/12 text-primary",
}
