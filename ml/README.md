# Loyalty Program Churn Predictor — ML Pipeline

End-to-end churn prediction and customer retention analytics for loyalty
program members, built on the [Customer Churn Prediction dataset](https://www.kaggle.com/datasets/sahideseker/customer-churn-prediction-dataset).

The repository ships **two deliverables**:

1. **`ml/churn_pipeline.py`** — a reproducible Python pipeline that cleans the
   data, runs EDA, computes RFM metrics, trains and tunes classifiers, scores
   every member, and exports artifacts.
2. **The Next.js dashboard** (`app/`, `components/dashboard/`) — a Loyalty
   Retention Dashboard that visualizes the pipeline output.

---

## 1. Dataset

`ml/data/customer_churn_dataset.csv` — 1,000 loyalty members with:

| Column         | Description                                  |
| -------------- | -------------------------------------------- |
| `customer_id`  | Unique member id                             |
| `age`          | Member age                                   |
| `tenure`       | Months enrolled in the program               |
| `service_type` | Product line (mobile, internet, tv, bundle)  |
| `monthly_fee`  | Monthly spend                                |
| `churn`        | Target — 1 = churned, 0 = retained           |

---

## 2. Running the pipeline

```bash
pip install scikit-learn pandas numpy matplotlib joblib
python ml/churn_pipeline.py
```

Outputs are written to `ml/outputs/` and `lib/data/`:

| File                              | Purpose                                                |
| --------------------------------- | ------------------------------------------------------ |
| `outputs/churn_model.joblib`      | Trained, tuned best model (sklearn Pipeline)           |
| `outputs/churn_predictions.csv`   | Per-member risk scores, tiers, and recommendations     |
| `outputs/churn-results.json`      | Full results bundle                                    |
| `lib/data/churn-results.json`     | Same bundle, consumed by the dashboard                 |
| `outputs/*.png`                   | Confusion matrix, ROC curve, feature importance plots  |

---

## 3. What the pipeline does

### Day 1 — Customer analysis, RFM & feature engineering
- **Inspection & cleaning**: dtype/missing/duplicate checks, range validation.
- **EDA**: churn rate overall and by tenure, service type, and age cohort;
  age / fee / tenure distributions; correlation analysis.
- **RFM**: since the dataset is snapshot-level (not transactional), RFM is
  adapted to the available signals:
  - **Recency** ← inverse of `tenure` (recently joined = less established)
  - **Frequency** ← engagement score derived from tenure & service type
  - **Monetary** ← `monthly_fee` and derived `lifetime_value`
  Each dimension is scored 1–5 (quintiles) and combined into an `RFM_score`
  (3–15) and a named segment (Champions, Loyal, Potential, At Risk,
  Hibernating).
- **Feature engineering**: `lifetime_value`, `engagement_score`, one-hot
  service type, plus the RFM features.
- **Train/test split**: stratified 80/20.

### Day 2 — Model development & retention engine
- **Models**: Logistic Regression, Random Forest, Gradient Boosting, compared
  on Accuracy, Precision, Recall, F1, and ROC-AUC.
- **Tuning**: 5-fold cross-validated grid search on the best ROC-AUC model.
- **Evaluation**: confusion matrix, ROC curve, feature importance.
- **Risk scoring**: a 0–100 composite score blends model churn probability
  (70%) with inverse RFM value (30%), then buckets members into
  **High (≥60) / Medium (35–59) / Low (<35)** risk tiers.
- **Re-engagement engine**: rule-based personalized recommendations per member
  (win-back calls, loyalty discounts, referral/VIP invites, nurture sequences)
  driven by risk tier, tenure, and service mix.

---

## 4. Note on model scores

This is a **near noise-free synthetic dataset**, so tree-based models separate
it almost perfectly (ROC-AUC ≈ 1.0) while Logistic Regression scores ~0.93 due
to the non-linear decision boundary. This is a property of the data, not label
leakage — no post-outcome features are used. The composite risk score is used
(instead of raw probability) precisely so the business-facing tiers stay
graduated and actionable rather than purely bimodal.

---

## 5. Dashboard

The Next.js app reads `lib/data/churn-results.json` and presents four tabs:

- **EDA & RFM** — KPIs, RFM segments, churn drivers, distributions, correlations
- **Model Performance** — model comparison, confusion matrix, ROC curve, feature importance
- **Risk Scoring** — risk distribution, scoring methodology, searchable member risk register
- **Campaigns** — aggregated re-engagement campaign recommendations ranked by LTV at stake
