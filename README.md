# 🎯 Loyalty Program Churn Predictor

> An end-to-end machine learning system that predicts which loyalty program members are at risk of disengaging, generates actionable churn risk scores, and recommends personalized re-engagement campaigns to maximize customer lifetime value.

![Python](https://img.shields.io/badge/Python-3.9-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML-orange.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38b2ac.svg)
![Status](https://img.shields.io/badge/Status-Production--Ready-success.svg)

---

# 📌 Project Overview

The **Loyalty Program Churn Predictor** is an intelligent customer retention analytics platform designed to help businesses identify at-risk loyalty members before they leave and deploy targeted re-engagement campaigns.

This system combines **Machine Learning**, **RFM Analysis**, **Risk Scoring**, and **Interactive Visualization** into a complete end-to-end solution for customer lifetime value optimization.

### Key Capabilities:

- 🔮 **Churn Prediction** — ML models predict which members will churn with high accuracy
- 📊 **RFM Segmentation** — Recency, Frequency, Monetary analysis to identify valuable at-risk members
- ⚠️ **Risk Scoring** — Composite 0-100 risk score with Low/Medium/High tiers
- 💡 **Smart Recommendations** — Rule-based re-engagement campaigns (discounts, rewards, loyalty perks)
- 📈 **Interactive Dashboard** — Real-time analytics, EDA, model performance, and member risk register
- 🧠 **Explainable AI** — Feature importance and model transparency
- 📁 **Batch Processing** — Upload CSV to score entire customer cohorts instantly

---

# 🚀 Features

## 🔮 Churn Prediction Models

Evaluates **three classification algorithms** on the loyalty member dataset:

- **Logistic Regression** (Accuracy: 100%, ROC-AUC: 0.93)
- **Random Forest** (Accuracy: 100%, ROC-AUC: 1.00) ⭐ **Selected Model**
- **Gradient Boosting** (Accuracy: 100%, ROC-AUC: 1.00)

Automatically selects the best model based on ROC-AUC score.

---

## 📊 RFM Analysis & Segmentation

Calculates **Recency, Frequency, and Monetary** metrics:

- **Recency** — Days since last purchase/engagement
- **Frequency** — Number of transactions in loyalty period
- **Monetary** — Total lifetime spending

Segments members into **9 RFM tiers** (Champions, Loyal, At-Risk, Can't Lose, etc.)

---

## ⚠️ Risk Scoring System

Generates **composite risk scores (0-100)** blending:

- **70%** ML churn probability (behavioral signal)
- **30%** Inverse RFM score (loyalty value signal)

Produces **graduated risk tiers**:

- 🟢 **Low Risk** (0-35) — Engaged, likely to stay
- 🟡 **Medium Risk** (35-60) — Showing disengagement signals
- 🔴 **High Risk** (60-100) — Critical intervention needed

---

## 💡 Re-engagement Recommendation Engine

Automatically recommends **personalized campaigns** based on member profile:

- 🎁 **Discount Campaigns** — For price-sensitive, high-value members
- ⭐ **Loyalty Rewards** — Accelerated points, exclusive perks
- 🎯 **Targeted Offers** — Category-specific deals
- 📧 **Win-Back Email** — Re-engagement outreach
- 🔔 **VIP Treatment** — Premium member retention

---

## 📈 Exploratory Data Analysis

Interactive dashboards featuring:

- **KPI Cards** — Member count, churn rate, risk distribution
- **Churn by Demographics** — Tenure, service type, age analysis
- **Spending Distributions** — Monthly fee and lifetime value trends
- **Correlation Heatmap** — Feature relationships
- **RFM Segment Breakdown** — 9-segment distribution chart

---

## 🧠 Model Performance Analysis

Comprehensive model evaluation including:

- **Comparison Table** — Accuracy, Precision, Recall, F1, ROC-AUC
- **Confusion Matrix** — TP/FP/TN/FN visualization
- **ROC Curve** — Model discrimination threshold analysis
- **Feature Importance** — Top 5 drivers of churn

---

## 👥 Member Risk Register

Searchable, filterable customer database with:

- **Risk Score** — 0-100 composite score
- **Risk Tier** — Color-coded High/Medium/Low
- **Churn Probability** — Model's predicted churn likelihood
- **RFM Tier** — Customer value segment
- **Recommended Campaign** — Specific re-engagement action
- **Sort & Filter** — By service type, age, risk tier

---

## 📊 Campaign Aggregation Dashboard

Executive view showing:

- **Campaign Summary** — All recommended plays by tier and count
- **Lifetime Value at Stake** — Total LTV of at-risk members per campaign
- **Risk Tier Distribution** — Proportional breakdown
- **Top Recommendations** — Sorted by potential LTV recovery

---

# 🛠 Technologies Used

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend ML** | Python 3.9 | Data processing & modeling |
| **ML Libraries** | scikit-learn | Classification models |
| **Data Processing** | Pandas, NumPy | EDA & feature engineering |
| **Model Serialization** | Joblib | Model export & loading |
| **Frontend** | Next.js 16 | Web app framework |
| **UI Framework** | React 19 | Component library |
| **Styling** | Tailwind CSS v4 | Responsive design |
| **Charts** | Recharts + shadcn/ui | Interactive visualizations |
| **Tables** | React tables | Sortable data grids |

---

# 📂 Project Structure

```
loyalty-churn-predictor/
│
├── app/                               # Next.js app directory
│   ├── layout.tsx                     # Root layout with branding
│   ├── page.tsx                       # Main dashboard (tabbed)
│   ├── globals.css                    # Tailwind + design tokens
│   └── favicon.ico
│
├── components/                        # React components
│   ├── dashboard/
│   │   ├── dashboard-header.tsx       # Title & description
│   │   ├── kpi-cards.tsx              # Risk metrics cards
│   │   ├── eda-section.tsx            # Charts: churn by tenure/service/age
│   │   ├── model-section.tsx          # Model comparison & confusion matrix
│   │   ├── risk-section.tsx           # Risk register table
│   │   ├── rfm-section.tsx            # RFM segment breakdown
│   │   └── campaigns-section.tsx      # Campaign recommendations
│   └── ui/                            # shadcn components
│
├── lib/                               # Utilities
│   ├── churn-types.ts                 # TypeScript types & tier colors
│   └── data/
│       └── churn-results.json         # Pipeline output (1000 members)
│
├── ml/                                # Python ML pipeline
│   ├── churn_pipeline.py              # Main training script (543 lines)
│   ├── requirements.txt               # Python dependencies
│   ├── data/
│   │   └── customer_churn_dataset.csv # Raw dataset (1000 rows)
│   ├── outputs/
│   │   ├── churn_model.joblib         # Trained model
│   │   ├── churn_predictions.csv      # Member scores & tiers
│   │   └── churn-results.json         # Dashboard data
│   └── README.md                      # Pipeline documentation
│
├── public/                            # Static assets
├── package.json                       # Node dependencies
├── tailwind.config.ts                 # Tailwind configuration
├── tsconfig.json                      # TypeScript config
├── next.config.ts                     # Next.js config
├── PROJECT_REPORT.md                  # Detailed project report
└── README.md                          # This file
```

---

# 📊 Quick Results

| Metric | Value |
|--------|-------|
| **Dataset Size** | 1,000 loyalty members |
| **Churn Rate** | 26.9% (269 churned) |
| **Best Model** | Random Forest |
| **Accuracy** | 100.0% |
| **Precision** | 1.00 |
| **Recall** | 1.00 |
| **F1-Score** | 1.00 |
| **ROC-AUC** | 1.00 |
| **High-Risk Members** | 256 (25.6%) |
| **Medium-Risk Members** | 18 (1.8%) |
| **Low-Risk Members** | 726 (72.6%) |

---

## 🔝 Top Churn Drivers (Feature Importance)

1. **Tenure** — 32.4% — Length of membership strongly predicts churn
2. **Monthly Fee** — 28.1% — Spending level is key retention signal
3. **Age** — 21.8% — Demographics influence engagement
4. **Service Type** — 17.7% — Specific packages have different churn profiles

---

# 📊 Dataset

### Source
Kaggle Customer Churn Prediction Dataset adapted for loyalty program context

### Size
1,000 loyalty members with 6 core attributes + engineered features

### Features

| Feature | Type | Description |
|---------|------|-------------|
| customer_id | Integer | Unique member ID |
| age | Integer | Member age (years) |
| tenure | Integer | Months in loyalty program |
| service_type | Categorical | Service/product tier |
| monthly_fee | Float | Monthly spending ($) |
| churn | Binary | 1 = churned, 0 = retained |
| **RFM_score** | Integer | Engineered: 3-15 scale |
| **lifetime_value** | Float | Engineered: total spend |
| **engagement_score** | Float | Engineered: frequency + recency |

---

# 🔄 Project Workflow

```
Raw Dataset (1000 members)
        ↓
Data Cleaning & Validation
        ↓
Feature Engineering (RFM, Lifetime Value, Engagement)
        ↓
Exploratory Data Analysis
    ├─ Churn distribution by tenure/service/age
    ├─ Spending analysis & correlations
    ├─ RFM segment breakdown
    └─ Statistical summaries
        ↓
Train/Test Split (80/20)
        ↓
Model Training (3 classifiers)
    ├─ Logistic Regression
    ├─ Random Forest ⭐
    └─ Gradient Boosting
        ↓
Model Evaluation & Selection
    ├─ Accuracy, Precision, Recall, F1
    └─ ROC-AUC (Random Forest wins)
        ↓
Composite Risk Scoring
    ├─ 70% ML probability + 30% inverse RFM
    └─ Tier assignment: Low/Medium/High
        ↓
Re-engagement Recommendation Engine
    └─ Campaign assignment by member profile
        ↓
Export Model & Predictions
    ├─ churn_model.joblib
    ├─ churn_predictions.csv
    └─ churn-results.json
        ↓
Interactive Dashboard (Next.js + React)
    ├─ EDA visualizations
    ├─ Model performance
    ├─ Member risk register
    └─ Campaign recommendations
```

---

# 🤖 Machine Learning Models

Three classification models were trained and evaluated:

### Model Comparison

| Model | Accuracy | Precision | Recall | F1 Score | ROC-AUC |
|-------|----------|-----------|--------|----------|---------|
| Logistic Regression | 100.00% | 1.00 | 1.00 | 1.00 | 0.93 |
| **Random Forest** | **100.00%** | **1.00** | **1.00** | **1.00** | **1.00** ⭐ |
| Gradient Boosting | 100.00% | 1.00 | 1.00 | 1.00 | 1.00 |

### Selected Model: Random Forest

- **Algorithm**: Ensemble of decision trees with gradient boosting
- **Hyperparameters**: n_estimators=100, max_depth=15, min_samples_split=5
- **Training Time**: < 1 second
- **Feature Importance**: Tenure (32%), Monthly Fee (28%), Age (21%), Service Type (17%)

### Confusion Matrix (Test Set)
```
              Predicted Negative  Predicted Positive
Actual Negative       154                 0
Actual Positive         0                46
```

**Interpretation**: Perfect classification on test data. Note: Dataset is near-deterministic; real-world churn problems typically achieve 0.7–0.85 ROC-AUC.

---

# 📈 Feature Engineering

Engineered features created during preprocessing:

| Feature | Formula | Purpose |
|---------|---------|---------|
| **RFM_score** | (R_norm + F_norm + M_norm) / 3 × 15 | Customer value segmentation |
| **lifetime_value** | monthly_fee × tenure | Total spending capacity |
| **engagement_score** | (tenure + frequency) / recency | Recency-adjusted loyalty |
| **churn_probability** | model.predict_proba(X)[:, 1] | ML model output (0-1) |
| **risk_score** | 0.7×churn_prob + 0.3×(1-rfm_norm) | Composite risk (0-100) |
| **risk_tier** | Binned from risk_score | Categorical: Low/Med/High |
| **recommendations** | Rule-based on tier & profile | Campaign suggestions |

---

# 🧠 Explainable AI (Feature Importance)

The best model's feature importance breakdown:

1. **Tenure** — 32% — Length of membership strongly predicts churn
2. **Monthly Fee** — 28% — Spending level is key retention signal
3. **Age** — 21% — Demographics influence engagement
4. **Service Type** — 17% — Specific packages have different churn profiles

### Business Insights:
Loyal, high-spending, older members are least likely to churn. Newer members with low spending need targeted retention.

---

# 💻 Dashboard Architecture

### Tab 1: EDA & RFM
- KPI cards (member count, churn rate, risk distribution)
- Churn analysis by tenure, service type, age
- RFM segment breakdown (9 segments)
- Spending distribution and correlation heatmap

### Tab 2: Model Performance
- Model comparison table
- Confusion matrix heatmap
- ROC curve visualization
- Feature importance bar chart

### Tab 3: Risk Scoring
- Risk score distribution (KDE plot)
- Composite risk scoring methodology
- Searchable/sortable member risk register
- Filters: service type, age range, risk tier

### Tab 4: Campaigns
- Campaign summary by tier and count
- Lifetime value at stake per campaign
- Top recommendations ranked by impact
- Campaign details (discount %, duration, eligibility)

---

# 📦 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm, pnpm, yarn, or bun

### Option 1: Full Setup (ML Pipeline + Dashboard)

**Clone the repository:**
```bash
git clone https://github.com/Kavyasree2006/Loyalty_Program_Churn_Predictor.git
cd Loyalty_Program_Churn_Predictor
```

**Install Python dependencies:**
```bash
cd ml
pip install -r requirements.txt
cd ..
```

**Run the ML pipeline:**
```bash
cd ml
python3.9 churn_pipeline.py
cd ..
```

This generates:
- `ml/outputs/churn_model.joblib` (trained model)
- `ml/outputs/churn_predictions.csv` (member scores)
- `lib/data/churn-results.json` (dashboard data)

**Install Node dependencies:**
```bash
pnpm install
```

**Start the dashboard:**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option 2: Dashboard Only (Pre-trained Model)

If you already have the trained model and results:

```bash
pnpm install
pnpm dev
```

The dashboard will load the pre-exported results.

---

### Option 3: ML Pipeline Only

To train models and generate predictions without the dashboard:

```bash
cd ml
pip install -r requirements.txt
python3.9 churn_pipeline.py
```

Outputs will be in `ml/outputs/`.

---

# 🎯 Learning Outcomes

Through this project, the following ML and analytics concepts were implemented:

✅ **Customer Churn Prediction** — Classification modeling on loyalty data  
✅ **RFM Analysis** — Segmentation using Recency, Frequency, Monetary metrics  
✅ **Feature Engineering** — Creating business-relevant features for ML  
✅ **Exploratory Data Analysis (EDA)** — Statistical and visual data exploration  
✅ **Model Evaluation** — Comparing classifiers using multiple metrics  
✅ **Explainable AI** — Feature importance and model transparency  
✅ **Risk Scoring** — Composite scoring combining multiple signals  
✅ **Rule-Based Recommendations** — Campaign logic from member profiles  
✅ **Full-Stack Development** — Python backend + React frontend integration  
✅ **Data Visualization** — Interactive dashboards with Recharts  

---

# 📈 Future Enhancements

- [ ] Integrate with CRM systems for real-time member scoring
- [ ] Add time-series forecasting for multi-month churn prediction
- [ ] Implement customer journey analysis and cohort tracking
- [ ] Deploy to cloud (AWS/Vercel) with REST API
- [ ] Add A/B testing framework for campaign effectiveness
- [ ] Integrate LLM-powered personalized communication drafts
- [ ] Mobile app for on-the-go member risk monitoring
- [ ] Feedback loop: track campaign outcomes and retrain monthly

---

# 🏃 Quick Start

```bash
# Clone & enter directory
git clone https://github.com/Kavyasree2006/Loyalty_Program_Churn_Predictor.git
cd Loyalty_Program_Churn_Predictor

# Run ML pipeline (one-time)
cd ml && python3.9 churn_pipeline.py && cd ..

# Start dashboard
pnpm install && pnpm dev

# Open browser to http://localhost:3000
```

---

# 📁 Important Files

| File | Purpose |
|------|---------|
| `ml/churn_pipeline.py` | Main ML training script (543 lines) |
| `ml/data/customer_churn_dataset.csv` | Raw loyalty member dataset |
| `ml/outputs/churn_model.joblib` | Serialized trained Random Forest model |
| `ml/outputs/churn_predictions.csv` | Member scores, tiers, and recommendations |
| `lib/data/churn-results.json` | Dashboard data (360KB) |
| `app/page.tsx` | Main dashboard container |
| `components/dashboard/*` | 7 component modules |
| `lib/churn-types.ts` | TypeScript types & utilities |

---

# 🔗 Data Flow

```
Raw CSV → Python Pipeline → churn_model.joblib
                          → churn_predictions.csv
                          → churn-results.json
                                       ↓
                              Next.js Server
                                       ↓
                              React Components
                                       ↓
                              Interactive Charts & Tables
                                       ↓
                                  Browser
```

---

# 📄 License

This project is developed for **educational purposes** as part of a machine learning analytics curriculum.

---

# 👨‍💻 Author

**K. Kavya Sree**

Machine Learning & Data Analytics Project  
Loyalty Program Churn Predictor  
2024

---

# 🎓 Acknowledgments

- **Dataset**: [Kaggle Customer Churn Prediction](https://www.kaggle.com/datasets/sahideseker/customer-churn-prediction-dataset)
- **ML Framework**: scikit-learn, pandas, numpy
- **UI Framework**: Next.js, React, Tailwind CSS, shadcn/ui
- **Visualization**: Recharts
- **AI-Assisted Development**: v0.app (Vercel)

---

# 📞 Support & Questions

For questions or issues:

1. Check the [PROJECT_REPORT.md](./PROJECT_REPORT.md) for detailed documentation
2. Review [ml/README.md](./ml/README.md) for pipeline specifics
3. Open an issue on GitHub

---

# ⭐ If you found this project helpful

Please consider giving this repository a **Star ⭐** on GitHub!

Your support motivates continued development and improvement.

---

**Happy Analyzing! 🚀**

