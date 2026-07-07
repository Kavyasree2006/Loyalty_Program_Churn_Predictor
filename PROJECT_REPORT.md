# Loyalty Program Churn Predictor — Project Report

**Project type:** End-to-end Machine Learning + Analytics Dashboard
**Domain:** Customer Loyalty / Retention Analytics
**Dataset:** Customer Churn Prediction Dataset (Kaggle — `sahideseker/customer-churn-prediction-dataset`)
**Deliverables produced:** Cleaned dataset, EDA report, RFM analysis, trained churn model, risk-scoring system, retention dashboard, re-engagement recommendation engine, and this documentation.

---

## 1. Project Overview

The goal of this project is to predict which loyalty-program members are at risk of
disengaging or leaving, based on their behaviour and **RFM (Recency, Frequency, Monetary)**
characteristics. The system generates a **churn risk score** for every member, segments them
into **Low / Medium / High** risk tiers, and produces **actionable re-engagement
recommendations** (discounts, rewards, targeted campaigns) for marketing teams.

The project was delivered in two parts, matching the two-day brief:

| Part | Focus | Output |
|------|-------|--------|
| **Day 1** | Data understanding, cleaning, EDA, RFM modeling, feature engineering | Cleaned dataset + EDA/RFM insights |
| **Day 2** | Model training, evaluation, risk scoring, dashboard, recommendation engine | Trained model + dashboard + reports |

Two artifacts make up the final product:

1. **A reproducible Python ML pipeline** (`ml/churn_pipeline.py`) that performs the full
   data-science workflow and exports the trained model and results.
2. **A web dashboard** (Next.js, in `app/` and `components/dashboard/`) that visualizes the
   pipeline output for business / marketing stakeholders.

---

## 2. Dataset Description

The raw dataset contains **1,000 customer records** with **6 columns** and required minimal cleaning
(no missing values, no duplicate rows, no duplicate customer IDs).

| Column | Type | Description |
|--------|------|-------------|
| `customer_id` | object | Unique customer identifier |
| `age` | int | Customer age in years |
| `tenure` | int | Months the customer has been with the program |
| `service_type` | object | Product/plan: `mobile`, `internet`, `tv`, `bundle` |
| `monthly_fee` | float | Monthly amount the customer pays |
| `churn` | int | Target label: `1` = churned, `0` = retained |

**Class balance:** 257 churned (25.7%) vs. 743 retained (74.3%) — a moderately imbalanced
binary classification problem.

---

## 3. Data Cleaning & Pre-processing

Steps performed in the pipeline:

- **Initial inspection** — shape, dtypes, head/tail, summary statistics.
- **Missing values** — checked every column; **0 missing values** found.
- **Duplicates** — checked full-row and `customer_id` duplicates; **0 found**.
- **Type consistency** — confirmed numeric vs. categorical columns and normalised
  `service_type` casing.
- **Outlier review** — inspected `age`, `tenure`, and `monthly_fee` distributions; values were
  within plausible business ranges, so no rows were dropped.

Result: a clean, model-ready table requiring no row removal — the dataset was already
well-formed, so effort focused on **feature engineering** rather than repair.

---

## 4. RFM Analysis & Feature Engineering

The classic RFM framework assumes a transaction log (purchase dates and amounts). This dataset
is a **customer snapshot**, so RFM was **adapted** to the available behavioural signals — a
common real-world practice when transaction-level history is unavailable:

| RFM dimension | Proxy used | Rationale |
|---------------|-----------|-----------|
| **Recency** | `tenure` (months active) | Longer-tenured members are "more recently" engaged loyalists |
| **Frequency** | derived `engagement_score` | Models interaction frequency from tenure & plan |
| **Monetary** | `monthly_fee` and derived `lifetime_value` | Spend level and accumulated value |

### Engineered features

- **`engagement_score`** — a behavioural engagement proxy combining tenure and fee.
- **`lifetime_value` (LTV)** — `monthly_fee × tenure`, approximating accumulated customer value.
- **`RFM_score`** — each RFM proxy scored 1–5 via quintiles and summed (range **3–15**); higher = more valuable/loyal.
- **RFM segments** — members grouped into business-friendly buckets:
  **Champions, Loyal, Potential, At Risk, Hibernating**.
- **One-hot encoding** of `service_type` for the models.

### Segment summary (output of the pipeline)

| Segment | Count | Churn Rate | Avg LTV |
|---------|-------|-----------|---------|
| Champions | 277 | 20.2% | $5,321 |
| Loyal | 311 | 17.4% | $3,001 |
| Potential | 206 | 18.9% | $1,509 |
| At Risk | 114 | 41.2% | $704 |
| Hibernating | 92 | 66.3% | $230 |

This immediately shows that **low-RFM segments (At Risk, Hibernating) churn 2–3× more** than
high-value segments — validating RFM as a retention signal.

---

## 5. Exploratory Data Analysis (EDA) — Key Findings

**Overall churn rate: 25.7%**

### Churn by tenure (strongest behavioural signal)
| Tenure bucket | Count | Churn Rate |
|---------------|-------|-----------|
| 0–6 months | 100 | **68.0%** |
| 7–12 months | 89 | **59.6%** |
| 13–24 months | 159 | 16.4% |
| 25–48 months | 346 | 17.3% |
| 49+ months | 306 | 16.3% |

> **Insight:** New members (first year) are the dominant churn risk. Retention effort should be
> front-loaded into onboarding and the first 12 months.

### Churn by service type
| Service | Count | Churn Rate |
|---------|-------|-----------|
| mobile | 258 | **46.1%** |
| bundle | 266 | 21.1% |
| tv | 229 | 20.5% |
| internet | 247 | 14.2% |

> **Insight:** `mobile`-only members are the most volatile; `bundle` and `internet` members are
> the stickiest. Cross-selling mobile-only members into bundles is a clear retention lever.

### Churn by age
| Age group | Churn Rate |
|-----------|-----------|
| 18–25 | 42.2% |
| 26–35 | 11.0% |
| 36–45 | 17.3% |
| 46–55 | 14.4% |
| 56–65 | 33.5% |
| 65+ | **56.5%** |

> **Insight:** Churn is **U-shaped** by age — youngest and oldest members are most at risk.

### Correlation with churn
| Feature | Correlation with churn |
|---------|------------------------|
| `monthly_fee` | **+0.41** (higher fee → more churn) |
| `tenure` | **−0.30** (longer tenure → less churn) |
| `engagement_score` | −0.28 |
| `RFM_score` | −0.25 |
| `age` | +0.09 |
| `lifetime_value` | +0.04 |

---

## 6. Model Development & Evaluation

### Workflow
- **Train/test split:** 80/20, **stratified** on the churn label to preserve class balance.
- **Pre-processing pipeline:** numeric scaling + one-hot encoding wrapped in a scikit-learn
  `Pipeline` so transformations are fit only on training data (no leakage).
- **Algorithms compared:** Logistic Regression, Random Forest, Gradient Boosting.
- **Hyperparameter tuning:** `GridSearchCV` with 5-fold cross-validation, optimising ROC-AUC.

### Model comparison (held-out test set)

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |
|-------|----------|-----------|--------|-----|---------|
| Logistic Regression | 0.775 | 0.534 | 0.922 | 0.676 | 0.930 |
| **Random Forest (selected)** | **0.995** | **0.981** | **1.000** | **0.990** | **~1.000** |
| Gradient Boosting | 1.000 | 1.000 | 1.000 | 1.000 | 1.000 |

**Best model selected:** **Random Forest** (cross-validated ROC-AUC 0.998).
Confusion matrix on the test set: **TN=148, FP=1, FN=0, TP=51** — it correctly caught every
churner with a single false positive.

### Feature importance (churn drivers)
| Rank | Feature | Importance |
|------|---------|-----------|
| 1 | `monthly_fee` | 0.333 |
| 2 | `age` | 0.197 |
| 3 | `tenure` | 0.143 |
| 4 | `engagement_score` | 0.090 |
| 5 | `lifetime_value` | 0.090 |
| 6 | `RFM_score` | 0.064 |
| 7 | `service_type_mobile` | 0.059 |

> **Honest caveat (documented for the report):** This Kaggle dataset is **near
> noise-free** — the churn label is almost a deterministic function of the features — so
> tree-based models reach near-perfect scores. This reflects the **dataset's synthetic nature,
> not data leakage** (the pre-processing pipeline is fit only on training folds). Logistic
> Regression's more "realistic" 0.93 ROC-AUC is reported alongside to show the comparison is sound.

---

## 7. Customer Risk Scoring System

Because a near-perfect classifier produces a **bimodal** probability (almost 0 or almost 1),
which leaves no usable "Medium" tier, the risk score is a **composite blend** — a deliberate,
business-driven design decision:

$$\text{Risk Score} = \big(0.7 \times P_{churn} + 0.3 \times (1 - \text{RFM}_{norm})\big) \times 100$$

- **70%** model churn probability (behavioural churn signal)
- **30%** inverse normalised RFM score (loyalty value — low RFM raises risk)

This produces a graduated **0–100** score and three actionable tiers:

| Tier | Score range | Members | Interpretation |
|------|-------------|---------|----------------|
| **High** | ≥ 60 | 256 | Urgent intervention |
| **Medium** | 35–59 | 18 | Monitor & nurture |
| **Low** | < 35 | 726 | Healthy / reward |

- **Revenue at risk (High tier monthly fees):** ~$27,960 / month
- **High-risk lifetime value at stake:** ~$754,393

---

## 8. Re-engagement Campaign Recommendation Engine

Each member receives **rule-based, personalized recommendations** derived from their risk tier,
RFM segment, tenure, and service type. Examples of the logic:

- **High-risk + short tenure** → onboarding call + first-90-days loyalty bonus.
- **High-risk + high LTV** → dedicated retention specialist + premium win-back offer.
- **Mobile-only members** → bundle upgrade incentive (mobile churns at 46%).
- **Hibernating segment** → aggressive win-back discount + re-activation email series.
- **Champions / Loyal** → VIP rewards and referral perks to protect existing value.

The dashboard aggregates these into **campaign cards** ranked by the lifetime value at stake, so
marketing teams act on the highest-impact groups first.

---

## 9. Loyalty Retention Dashboard

A four-tab Next.js web application visualizes the entire workflow:

1. **EDA & RFM** — KPI cards (total members, churn rate, revenue at risk, avg LTV), RFM segment
   breakdown, churn-driver charts, and distribution plots.
2. **Model Performance** — model comparison table, confusion matrix, ROC curve, and feature
   importance.
3. **Risk Scoring** — risk-tier distribution, scoring methodology, and a searchable/filterable
   **member risk register**.
4. **Campaigns** — the aggregated re-engagement recommendation engine, ranked by value at stake.

Risk tiers use semantic colors (red = High, amber = Medium, teal = Low) for at-a-glance reading.

---

## 10. Project Structure / File Guide

```
ml/
  churn_pipeline.py            # End-to-end ML pipeline (clean → EDA → RFM → train → score → export)
  data/
    customer_churn_dataset.csv # Raw Kaggle dataset
  outputs/
    churn_model.joblib         # Trained, exported Random Forest model
    churn_predictions.csv       # Per-customer risk scores, tiers, recommendations
    churn-results.json          # All EDA/model/risk results (consumed by dashboard)
    *.png                       # Confusion matrix, ROC curve, feature-importance plots
  README.md                    # Pipeline run instructions

app/
  page.tsx                     # Dashboard entry (tabbed layout)
  layout.tsx                   # Metadata, fonts, theme
  globals.css                  # Design tokens / theme

components/dashboard/
  dashboard-header.tsx
  kpi-cards.tsx
  eda-section.tsx              # EDA & RFM charts
  model-section.tsx            # Model comparison, confusion matrix, ROC, importance
  risk-section.tsx             # Risk distribution + member risk register
  rfm-section.tsx              # RFM segment overview
  campaigns-section.tsx        # Re-engagement recommendation engine

lib/
  churn-types.ts               # Shared types + tier color helpers
  data/churn-results.json      # Dashboard data source
```

### How to reproduce
```bash
# Regenerate all ML artifacts (model, predictions, results JSON, plots)
python ml/churn_pipeline.py

# Run the dashboard
pnpm install
pnpm dev
```

---

## 11. Deliverables Checklist (Brief vs. Delivered)

| Required deliverable | Status | Location |
|----------------------|--------|----------|
| Cleaned & processed dataset | ✅ | `ml/outputs/churn_predictions.csv`, in-pipeline |
| EDA report | ✅ | Section 5 + dashboard EDA tab |
| RFM analysis | ✅ | Section 4 + dashboard |
| Churn prediction model | ✅ | `ml/outputs/churn_model.joblib` |
| Model evaluation report | ✅ | Section 6 + dashboard Model tab |
| Customer risk-scoring system | ✅ | Section 7 + dashboard Risk tab |
| Loyalty retention dashboard | ✅ | Next.js app |
| Re-engagement recommendation engine | ✅ | Section 8 + dashboard Campaigns tab |
| Project documentation | ✅ | This report + `ml/README.md` |

---

## 12. Skills Demonstrated

- Customer & loyalty analytics; RFM segmentation
- Data cleaning, pre-processing, and feature engineering
- Exploratory data analysis and statistical/correlation analysis
- Classification modeling (Logistic Regression, Random Forest, Gradient Boosting)
- Model evaluation (Accuracy, Precision, Recall, F1, ROC-AUC, confusion matrix)
- Hyperparameter tuning with cross-validation
- Churn risk scoring and customer segmentation
- Marketing-focused retention strategy design
- End-to-end ML workflow + data visualization / dashboarding

---

## 13. Conclusions & Business Recommendations

1. **Front-load retention in the first 12 months** — early-tenure members churn at 60–68%.
2. **Target mobile-only members for bundling** — they churn at 46% vs. 14% for internet.
3. **Protect both ends of the age curve** — 18–25 and 65+ are the highest-risk cohorts.
4. **Prioritise the High-risk tier** — 256 members representing ~$754K of lifetime value and
   ~$28K of monthly revenue are flagged for immediate, personalized re-engagement.
5. **Operationalize the score** — re-run the pipeline on fresh data to refresh scores, and feed
   the campaign recommendations directly to the marketing team.
