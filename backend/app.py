from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from supabase import create_client
import httpx

import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

import os

load_dotenv()

app = Flask(__name__)

frontend_origins = [
    origin.strip()
    for origin in os.environ.get("FRONTEND_URL", "http://localhost:8080").split(",")
    if origin.strip()
]
frontend_origins.extend([
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    r"https://.*\.vercel\.app",
])
CORS(app, origins=frontend_origins)

# ---------------- SUPABASE ----------------

url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_KEY"]

client = httpx.Client(verify=False)

supabase = create_client(url, key)
supabase.postgrest.session = client

_ml_state = None


def get_ml_state():
    global _ml_state
    if _ml_state is not None:
        return _ml_state

    response = supabase.table("company").select("*").execute()
    data = response.data
    df = pd.DataFrame(data)

    df["tools_and_technologies"] = df["tools_and_technologies"].apply(
        lambda x: [i.strip().lower() for i in str(x).split(",")]
    )

    mlb = MultiLabelBinarizer()
    skills_encoded = mlb.fit_transform(df["tools_and_technologies"])
    skills_df = pd.DataFrame(skills_encoded, columns=mlb.classes_)

    le = LabelEncoder()
    df["role_encoded"] = le.fit_transform(df["role_name"])

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        random_state=42,
    )
    model.fit(skills_df, df["role_encoded"])

    df["skills_text"] = df["tools_and_technologies"].apply(lambda x: " ".join(x))

    tfidf = TfidfVectorizer()
    tfidf.fit(df["skills_text"])

    _ml_state = {
        "df": df,
        "mlb": mlb,
        "le": le,
        "model": model,
        "tfidf": tfidf,
    }
    print("ML MODEL READY")
    return _ml_state


# ---------------- HOME ----------------

@app.route("/")
def home():
    return "Backend Running"


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


# ---------------- LOGIN ----------------

@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    role = data.get("role")
    email = (data.get("email") or "").lower()
    password = data.get("password")

    if not role or not email or not password:
        return jsonify({"status": "error", "message": "Missing login fields"}), 400

    table = "student"

    if role == "admin":
        table = "admin_login"
    elif role == "placement":
        table = "placement_login"

    try:
        res = supabase.table(table).select("*").execute()
    except Exception:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500

    user = None

    for u in res.data:
        if u["email"].lower() == email:
            user = u
            break

    if not user:
        return jsonify({"status": "error", "message": "User not found"})

    if user["password"] != password:
        return jsonify({"status": "error", "message": "Wrong password"})

    return jsonify({
        "status": "success",
        "user": user,
        "role": role,
    })


# ---------------- SIGNUP ----------------

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json or {}
    role = data.get("role")

    if role != "student":
        return jsonify({"status": "error", "message": "Signup only supported for students"}), 400

    email = (data.get("email") or "").lower()

    try:
        existing = supabase.table("student").select("*").eq("email", email).execute()
    except Exception:
        return jsonify({"status": "error", "message": "Database connection failed"}), 500

    if existing.data:
        return jsonify({
            "status": "error",
            "message": "Email already registered",
        })

    student_data = {
        "student_name": data.get("name"),
        "email": email,
        "password": data.get("password"),
        "phone": data.get("phone"),
        "university": data.get("university"),
        "branch": data.get("branch"),
        "year": data.get("year"),
        "preferred_company": data.get("preferred_company"),
        "student_status": "Active",
    }

    try:
        student_res = supabase.table("student").insert(student_data).execute()
        student_id = student_res.data[0]["student_id"]

        skills = data.get("skills")
        if skills:
            for skill in skills.split(","):
                supabase.table("student_skills").insert({
                    "student_id": student_id,
                    "skill_name": skill.strip(),
                }).execute()
    except Exception:
        return jsonify({"status": "error", "message": "Failed to create account"}), 500

    return jsonify({
        "status": "success",
        "user": student_res.data[0],
        "role": "student",
    })


# ---------------- RECOMMEND ----------------

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json or {}
    ml = get_ml_state()

    df = ml["df"]
    mlb = ml["mlb"]
    le = ml["le"]
    model = ml["model"]
    tfidf = ml["tfidf"]

    user_skills = [s.lower() for s in data.get("skills", [])]
    preferred_companies = [c.lower() for c in data.get("companies", [])]

    user_vector = pd.DataFrame(
        mlb.transform([user_skills]),
        columns=mlb.classes_,
    )

    pred_role = model.predict(user_vector)
    role_name = le.inverse_transform(pred_role)[0]

    role_df = df[df["role_name"] == role_name]

    filtered_text = role_df["tools_and_technologies"].apply(lambda x: " ".join(x))
    filtered_tfidf = tfidf.transform(filtered_text)

    user_text = " ".join(user_skills)
    user_tfidf = tfidf.transform([user_text])

    similarity = cosine_similarity(user_tfidf, filtered_tfidf)
    similar_indices = similarity.argsort()[0][-15:]

    skill_freq = {}

    for idx in similar_indices:
        for skill in role_df.iloc[idx]["tools_and_technologies"]:
            if skill not in user_skills:
                skill_freq[skill] = skill_freq.get(skill, 0) + 1

    recommended_skills = sorted(skill_freq, key=skill_freq.get, reverse=True)[:5]
    preferred_list = preferred_companies
    other_list = role_df["company_name"].str.lower().unique().tolist()[:5]

    return jsonify({
        "role": role_name,
        "skills": recommended_skills,
        "preferred_companies": preferred_list,
        "other_companies": other_list,
    })


# ---------------- RUN ----------------

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
