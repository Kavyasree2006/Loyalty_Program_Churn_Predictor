"""
Loyalty Program Churn Predictor
================================
End-to-end churn prediction pipeline for loyalty program members.

This single script covers the full Day 1 + Day 2 workflow:
  1. Load & inspect the dataset
  2. Clean / pre-process
  3. Exploratory Data Analysis (EDA)
  4. RFM-style analysis (adapted to available fields)
  5. Feature engineering & selection
  6. Train/test split
  7. Train multiple classifiers (LogReg, RandomForest, GradientBoosting)
  8. Evaluate (Accuracy, Precision, Recall, F1, ROC-AUC, confusion matrix)
  9. Hyperparameter tuning of the best model
 10. Feature importance / churn drivers
 11. Customer risk scoring (Low / Medium / High)
 12. Re-engagement campaign recommendations
 13. Export model + JSON artifacts for the web dashboard

The dataset (customer_churn_dataset.csv) contains:
    customer_id, age, tenure, service_type, monthly_fee, churn

NOTE ON RFM:
This dataset has no transaction-level timestamps, so a textbook RFM
(Recency, Frequency, Monetary) cannot be computed directly. We adapt it
to the available behavioural fields:
    - Recency  -> proxied by `tenure` (months as an active member; longer
                  tenure = more entrenched / recently-still-active loyalty).
    - Frequency-> proxied by an engagement score derived from tenure &
                  service_type (bundle users interact across more services).
    - Monetary -> `monthly_fee` and derived lifetime value
                  (monthly_fee * tenure).
This adaptation is documented in the EDA report.
"""

import json
import os
import warnings

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

warnings.filterwarnings("ignore")

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(HERE, "data", "customer_churn_dataset.csv")
OUT_DIR = os.path.join(HERE, "outputs")
# JSON consumed by the Next.js dashboard
WEB_DATA_DIR = os.path.join(HERE, "..", "lib", "data")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(WEB_DATA_DIR, exist_ok=True)

RANDOM_STATE = 42


def log(msg):
    print(f"[pipeline] {msg}")


# ---------------------------------------------------------------------------
# 1. LOAD & INSPECT
# ---------------------------------------------------------------------------
def load_and_inspect():
    df = pd.read_csv(DATA_PATH)
    log(f"Loaded {len(df)} rows, {df.shape[1]} columns")
    report = {
        "n_rows": int(len(df)),
        "n_cols": int(df.shape[1]),
        "columns": list(df.columns),
        "dtypes": {c: str(t) for c, t in df.dtypes.items()},
        "missing_values": {c: int(df[c].isna().sum()) for c in df.columns},
        "duplicate_rows": int(df.duplicated().sum()),
        "duplicate_customer_ids": int(df["customer_id"].duplicated().sum()),
    }
    return df, report


# ---------------------------------------------------------------------------
# 2. CLEAN / PRE-PROCESS
# ---------------------------------------------------------------------------
def clean(df):
    df = df.copy()
    before = len(df)
    df = df.drop_duplicates()
    df = df.drop_duplicates(subset=["customer_id"])
    # Fill any numeric missing with median, categorical with mode
    for col in ["age", "tenure", "monthly_fee"]:
        if df[col].isna().any():
            df[col] = df[col].fillna(df[col].median())
    if df["service_type"].isna().any():
        df["service_type"] = df["service_type"].fillna(df["service_type"].mode()[0])
    # Clip obviously invalid values
    df["age"] = df["age"].clip(lower=18, upper=100)
    df["tenure"] = df["tenure"].clip(lower=0)
    df["monthly_fee"] = df["monthly_fee"].clip(lower=0)
    df["churn"] = df["churn"].astype(int)
    log(f"Cleaned: removed {before - len(df)} duplicate/invalid rows")
    return df.reset_index(drop=True)


# ---------------------------------------------------------------------------
# 3 + 4. EDA + RFM
# ---------------------------------------------------------------------------
def quantile_score(series, ascending=True, q=5):
    """Return 1..q score based on quantile rank."""
    ranks = series.rank(method="first")
    bins = pd.qcut(ranks, q, labels=False, duplicates="drop") + 1
    if not ascending:
        bins = (q + 1) - bins
    return bins.astype(int)


def build_rfm(df):
    df = df.copy()
    # Derived behavioural / RFM-style features
    df["lifetime_value"] = (df["monthly_fee"] * df["tenure"]).round(2)
    # engagement: bundle = more services touched, tv/internet = single
    svc_weight = {"bundle": 3, "internet": 2, "tv": 1, "phone": 1}
    df["service_weight"] = df["service_type"].map(svc_weight).fillna(1)
    df["engagement_score"] = (
        df["service_weight"] * np.log1p(df["tenure"])
    ).round(3)

    # RFM-style scores (1-5)
    # Recency proxy: higher tenure => higher (still active longer) => better
    df["R_score"] = quantile_score(df["tenure"], ascending=True)
    # Frequency proxy: engagement
    df["F_score"] = quantile_score(df["engagement_score"], ascending=True)
    # Monetary: lifetime value
    df["M_score"] = quantile_score(df["lifetime_value"], ascending=True)
    df["RFM_score"] = df["R_score"] + df["F_score"] + df["M_score"]

    def segment(s):
        if s >= 12:
            return "Champions"
        if s >= 9:
            return "Loyal"
        if s >= 6:
            return "Potential"
        if s >= 4:
            return "At Risk"
        return "Hibernating"

    df["rfm_segment"] = df["RFM_score"].apply(segment)
    return df


def eda_report(df):
    def dist(col, bins):
        cats = pd.cut(df[col], bins=bins, include_lowest=True)
        counts = cats.value_counts().sort_index()
        return [
            {"range": f"{int(iv.left)}-{int(iv.right)}", "count": int(c)}
            for iv, c in counts.items()
        ]

    overall_churn = float(df["churn"].mean())

    # churn by service type
    svc = (
        df.groupby("service_type")
        .agg(count=("churn", "size"), churn_rate=("churn", "mean"),
             avg_fee=("monthly_fee", "mean"), avg_tenure=("tenure", "mean"))
        .reset_index()
    )
    churn_by_service = [
        {
            "service_type": r["service_type"],
            "count": int(r["count"]),
            "churn_rate": round(float(r["churn_rate"]), 4),
            "avg_fee": round(float(r["avg_fee"]), 2),
            "avg_tenure": round(float(r["avg_tenure"]), 1),
        }
        for _, r in svc.iterrows()
    ]

    # churn by tenure bucket
    df["_tenure_bucket"] = pd.cut(
        df["tenure"], bins=[-1, 6, 12, 24, 48, 200],
        labels=["0-6", "7-12", "13-24", "25-48", "49+"],
    )
    ten = df.groupby("_tenure_bucket").agg(
        count=("churn", "size"), churn_rate=("churn", "mean")
    ).reset_index()
    churn_by_tenure = [
        {"bucket": str(r["_tenure_bucket"]), "count": int(r["count"]),
         "churn_rate": round(float(r["churn_rate"]), 4)}
        for _, r in ten.iterrows()
    ]

    # churn by age group
    df["_age_group"] = pd.cut(
        df["age"], bins=[17, 25, 35, 45, 55, 65, 100],
        labels=["18-25", "26-35", "36-45", "46-55", "56-65", "65+"],
    )
    ag = df.groupby("_age_group").agg(
        count=("churn", "size"), churn_rate=("churn", "mean")
    ).reset_index()
    churn_by_age = [
        {"group": str(r["_age_group"]), "count": int(r["count"]),
         "churn_rate": round(float(r["churn_rate"]), 4)}
        for _, r in ag.iterrows()
    ]

    # segment summary
    seg = df.groupby("rfm_segment").agg(
        count=("churn", "size"), churn_rate=("churn", "mean"),
        avg_ltv=("lifetime_value", "mean")
    ).reset_index()
    segment_summary = [
        {"segment": r["rfm_segment"], "count": int(r["count"]),
         "churn_rate": round(float(r["churn_rate"]), 4),
         "avg_ltv": round(float(r["avg_ltv"]), 2)}
        for _, r in seg.iterrows()
    ]

    # correlation with churn (numeric)
    num_cols = ["age", "tenure", "monthly_fee", "lifetime_value",
                "engagement_score", "RFM_score", "churn"]
    corr = df[num_cols].corr()["churn"].drop("churn")
    correlations = [
        {"feature": k, "corr": round(float(v), 4)}
        for k, v in corr.sort_values(key=abs, ascending=False).items()
    ]

    summary_stats = {}
    for col in ["age", "tenure", "monthly_fee", "lifetime_value"]:
        s = df[col]
        summary_stats[col] = {
            "mean": round(float(s.mean()), 2),
            "std": round(float(s.std()), 2),
            "min": round(float(s.min()), 2),
            "p25": round(float(s.quantile(0.25)), 2),
            "median": round(float(s.median()), 2),
            "p75": round(float(s.quantile(0.75)), 2),
            "max": round(float(s.max()), 2),
        }

    return {
        "overall_churn_rate": round(overall_churn, 4),
        "n_customers": int(len(df)),
        "n_churned": int(df["churn"].sum()),
        "n_retained": int((df["churn"] == 0).sum()),
        "summary_stats": summary_stats,
        "age_distribution": dist("age", [17, 25, 35, 45, 55, 65, 100]),
        "fee_distribution": dist("monthly_fee", [0, 30, 60, 90, 120, 200]),
        "tenure_distribution": dist("tenure", [-1, 6, 12, 24, 48, 200]),
        "churn_by_service": churn_by_service,
        "churn_by_tenure": churn_by_tenure,
        "churn_by_age": churn_by_age,
        "segment_summary": segment_summary,
        "correlations": correlations,
    }


# ---------------------------------------------------------------------------
# 5 + 6. FEATURE ENGINEERING + SPLIT
# ---------------------------------------------------------------------------
FEATURES_NUM = ["age", "tenure", "monthly_fee", "lifetime_value",
                "engagement_score", "RFM_score"]
FEATURES_CAT = ["service_type"]


def make_xy(df):
    X = df[FEATURES_NUM + FEATURES_CAT].copy()
    y = df["churn"].copy()
    return X, y


def build_preprocessor():
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), FEATURES_NUM),
            ("cat", OneHotEncoder(handle_unknown="ignore"), FEATURES_CAT),
        ]
    )


# ---------------------------------------------------------------------------
# 7 + 8. TRAIN + EVALUATE
# ---------------------------------------------------------------------------
def evaluate(model, X_test, y_test):
    proba = model.predict_proba(X_test)[:, 1]
    pred = (proba >= 0.5).astype(int)
    cm = confusion_matrix(y_test, pred).tolist()
    fpr, tpr, _ = roc_curve(y_test, proba)
    # downsample roc curve points for the dashboard
    idx = np.linspace(0, len(fpr) - 1, min(50, len(fpr))).astype(int)
    return {
        "accuracy": round(float(accuracy_score(y_test, pred)), 4),
        "precision": round(float(precision_score(y_test, pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, proba)), 4),
        "confusion_matrix": cm,
        "roc_curve": [
            {"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)}
            for i in idx
        ],
    }


def train_models(X_train, X_test, y_train, y_test):
    pre = build_preprocessor()
    candidates = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced"),
        "Random Forest": RandomForestClassifier(
            n_estimators=300, class_weight="balanced", random_state=RANDOM_STATE
        ),
        "Gradient Boosting": GradientBoostingClassifier(random_state=RANDOM_STATE),
    }
    results = {}
    fitted = {}
    for name, clf in candidates.items():
        pipe = Pipeline([("pre", pre), ("clf", clf)])
        pipe.fit(X_train, y_train)
        results[name] = evaluate(pipe, X_test, y_test)
        fitted[name] = pipe
        log(f"{name}: ROC-AUC={results[name]['roc_auc']} F1={results[name]['f1']}")
    return results, fitted


# ---------------------------------------------------------------------------
# 9. HYPERPARAMETER TUNING
# ---------------------------------------------------------------------------
def tune_best(best_name, X_train, y_train):
    pre = build_preprocessor()
    if best_name == "Random Forest":
        clf = RandomForestClassifier(class_weight="balanced", random_state=RANDOM_STATE)
        grid = {
            "clf__n_estimators": [200, 400],
            "clf__max_depth": [None, 8, 16],
            "clf__min_samples_leaf": [1, 3],
        }
    elif best_name == "Gradient Boosting":
        clf = GradientBoostingClassifier(random_state=RANDOM_STATE)
        grid = {
            "clf__n_estimators": [150, 300],
            "clf__learning_rate": [0.05, 0.1],
            "clf__max_depth": [2, 3],
        }
    else:
        clf = LogisticRegression(max_iter=1000, class_weight="balanced")
        grid = {"clf__C": [0.1, 1.0, 10.0]}
    pipe = Pipeline([("pre", pre), ("clf", clf)])
    gs = GridSearchCV(pipe, grid, scoring="roc_auc", cv=5, n_jobs=-1)
    gs.fit(X_train, y_train)
    log(f"Tuned {best_name}: best ROC-AUC={gs.best_score_:.4f} params={gs.best_params_}")
    return gs.best_estimator_, gs.best_params_, float(gs.best_score_)


# ---------------------------------------------------------------------------
# 10. FEATURE IMPORTANCE
# ---------------------------------------------------------------------------
def feature_importance(model, X_test, y_test):
    feat_names = FEATURES_NUM + list(
        model.named_steps["pre"]
        .named_transformers_["cat"]
        .get_feature_names_out(FEATURES_CAT)
    )
    clf = model.named_steps["clf"]
    if hasattr(clf, "feature_importances_"):
        importances = clf.feature_importances_
    elif hasattr(clf, "coef_"):
        importances = np.abs(clf.coef_[0])
    else:
        importances = permutation_importance(
            model, X_test, y_test, n_repeats=5, random_state=RANDOM_STATE
        ).importances_mean
    pairs = sorted(
        zip(feat_names, importances), key=lambda x: x[1], reverse=True
    )
    total = sum(abs(v) for _, v in pairs) or 1.0
    return [
        {"feature": f, "importance": round(float(v) / total, 4)}
        for f, v in pairs
    ]


# ---------------------------------------------------------------------------
# 11 + 12. RISK SCORING + RECOMMENDATIONS
# ---------------------------------------------------------------------------
def recommend(row):
    recs = []
    if row["risk_tier"] == "High":
        recs.append("Personal outreach call + win-back offer")
        if row["monthly_fee"] > 80:
            recs.append("Offer 20% loyalty discount for 3 months")
        else:
            recs.append("Offer bonus loyalty points / free month")
    elif row["risk_tier"] == "Medium":
        recs.append("Targeted re-engagement email campaign")
        if row["service_type"] != "bundle":
            recs.append("Cross-sell bundle upgrade with intro pricing")
        else:
            recs.append("Send tier-up rewards reminder")
    else:
        recs.append("Maintain via standard loyalty newsletter")
        recs.append("Invite to referral / VIP program")
    if row["tenure"] < 6:
        recs.append("Enroll in onboarding nurture sequence")
    return recs


def score_customers(model, df, X):
    df = df.copy()
    df["churn_probability"] = model.predict_proba(X)[:, 1]

    # Composite risk score (0-100): blend the model's churn probability with
    # the inverse RFM score. The model captures behavioural churn signal while
    # RFM captures loyalty value, producing a graduated, business-usable score
    # rather than the bimodal output of a near-perfect classifier.
    # RFM_score ranges 3..15 -> normalise to 0..1, invert (low RFM = higher risk)
    rfm_norm = (df["RFM_score"] - 3) / 12.0
    df["risk_score"] = (
        (0.7 * df["churn_probability"] + 0.3 * (1 - rfm_norm)) * 100
    ).round(1)

    def tier(s):
        if s >= 60:
            return "High"
        if s >= 35:
            return "Medium"
        return "Low"

    df["risk_tier"] = df["risk_score"].apply(tier)
    df["recommendations"] = df.apply(recommend, axis=1)

    customers = []
    for _, r in df.iterrows():
        customers.append({
            "customer_id": r["customer_id"],
            "age": int(r["age"]),
            "tenure": int(r["tenure"]),
            "service_type": r["service_type"],
            "monthly_fee": round(float(r["monthly_fee"]), 2),
            "lifetime_value": round(float(r["lifetime_value"]), 2),
            "rfm_segment": r["rfm_segment"],
            "rfm_score": int(r["RFM_score"]),
            "churn_probability": round(float(r["churn_probability"]), 4),
            "risk_score": float(r["risk_score"]),
            "risk_tier": r["risk_tier"],
            "actual_churn": int(r["churn"]),
            "recommendations": r["recommendations"],
        })

    tier_counts = df["risk_tier"].value_counts().to_dict()
    risk_summary = {
        "High": int(tier_counts.get("High", 0)),
        "Medium": int(tier_counts.get("Medium", 0)),
        "Low": int(tier_counts.get("Low", 0)),
        "revenue_at_risk": round(
            float(df.loc[df["risk_tier"] == "High", "monthly_fee"].sum()), 2
        ),
        "high_risk_ltv": round(
            float(df.loc[df["risk_tier"] == "High", "lifetime_value"].sum()), 2
        ),
    }
    return customers, risk_summary


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    import joblib

    df, inspect = load_and_inspect()
    df = clean(df)
    df = build_rfm(df)
    eda = eda_report(df)

    X, y = make_xy(df)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE
    )
    log(f"Train={len(X_train)} Test={len(X_test)}")

    results, fitted = train_models(X_train, X_test, y_train, y_test)
    best_name = max(results, key=lambda k: results[k]["roc_auc"])
    log(f"Best base model: {best_name}")

    best_model, best_params, cv_auc = tune_best(best_name, X_train, y_train)
    tuned_metrics = evaluate(best_model, X_test, y_test)
    importance = feature_importance(best_model, X_test, y_test)

    # Refit best model on full data for scoring + export
    best_model.fit(X, y)
    customers, risk_summary = score_customers(best_model, df, X)

    # ---- Export model ----
    joblib.dump(best_model, os.path.join(OUT_DIR, "churn_model.joblib"))

    # ---- Export CSV of predictions ----
    pred_df = pd.DataFrame([
        {k: v for k, v in c.items() if k != "recommendations"}
        for c in customers
    ])
    pred_df.to_csv(os.path.join(OUT_DIR, "churn_predictions.csv"), index=False)
    df.to_csv(os.path.join(OUT_DIR, "cleaned_dataset.csv"), index=False)

    # ---- Bundle JSON for the dashboard ----
    payload = {
        "generated_with": "scikit-learn",
        "inspection": inspect,
        "eda": eda,
        "model_comparison": [
            {"model": name, **{k: m[k] for k in
             ["accuracy", "precision", "recall", "f1", "roc_auc"]}}
            for name, m in results.items()
        ],
        "best_model": {
            "name": best_name,
            "cv_roc_auc": round(cv_auc, 4),
            "best_params": {k: str(v) for k, v in best_params.items()},
            "metrics": tuned_metrics,
        },
        "feature_importance": importance,
        "risk_summary": risk_summary,
        "customers": customers,
    }

    web_path = os.path.join(WEB_DATA_DIR, "churn-results.json")
    with open(web_path, "w") as f:
        json.dump(payload, f)
    with open(os.path.join(OUT_DIR, "churn-results.json"), "w") as f:
        json.dump(payload, f, indent=2)

    log(f"Wrote dashboard data -> {os.path.relpath(web_path, HERE)}")
    log("Done.")


if __name__ == "__main__":
    main()
