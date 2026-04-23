from flask import Flask, request, jsonify
from flask_cors import CORS

from supabase import create_client
import httpx

import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# ---------------- SUPABASE ----------------

url = "https://crumghhbmjqmgqmmdgel.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydW1naGhibWpxbWdxbW1kZ2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODg4NDIsImV4cCI6MjA4OTg2NDg0Mn0.Jadce9a4AOlaI2LRdCDZCCkfyYn1x6FZIJH8lf8QG78"

client = httpx.Client(verify=False)

supabase = create_client(url, key)
supabase.postgrest.session = client

# ---------------- LOAD COMPANY DATA ----------------

response = supabase.table("company").select("*").execute()
data = response.data

df = pd.DataFrame(data)

df["tools_and_technologies"] = df["tools_and_technologies"].apply(
    lambda x: [i.strip().lower() for i in str(x).split(",")]
)

# ---------------- ML MODEL ----------------

mlb = MultiLabelBinarizer()
skills_encoded = mlb.fit_transform(df["tools_and_technologies"])
skills_df = pd.DataFrame(skills_encoded, columns=mlb.classes_)

le = LabelEncoder()
df["role_encoded"] = le.fit_transform(df["role_name"])

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    random_state=42
)

model.fit(skills_df, df["role_encoded"])

df["skills_text"] = df["tools_and_technologies"].apply(lambda x: " ".join(x))

tfidf = TfidfVectorizer()
tfidf.fit(df["skills_text"])

print("✅ ML MODEL READY")

# ---------------- HOME ----------------

@app.route("/")
def home():
    return "Backend Running ✅"

# ---------------- LOGIN ----------------

@app.route("/login", methods=["POST"])
def login():

    data = request.json
    role = data.get("role")
    email = data.get("email").lower()
    password = data.get("password")

    table = "student"

    if role == "admin":
        table = "admin_login"

    elif role == "placement":
        table = "placement_login"

    res = supabase.table(table).select("*").execute()

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
        "role": role
    })

# ---------------- SIGNUP ----------------

@app.route("/signup", methods=["POST"])
def signup():

    data = request.json
    role = data.get("role")

    if role == "student":

        email = data.get("email").lower()

        existing = supabase.table("student").select("*").eq("email", email).execute()

        if existing.data:
            return jsonify({
                "status": "error",
                "message": "Email already registered"
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
            "student_status": "Active"
        }

        student_res = supabase.table("student").insert(student_data).execute()

        student_id = student_res.data[0]["student_id"]

        skills = data.get("skills")

        if skills:
            for skill in skills.split(","):
                supabase.table("student_skills").insert({
                    "student_id": student_id,
                    "skill_name": skill.strip()
                }).execute()

        return jsonify({
            "status": "success",
            "user": student_res.data[0],
            "role": "student"
        })

# ---------------- RECOMMEND ----------------

@app.route("/recommend", methods=["POST"])
def recommend():

    data = request.json

    user_skills = [s.lower() for s in data.get("skills", [])]
    preferred_companies = [c.lower() for c in data.get("companies", [])]

   
    user_vector = pd.DataFrame(
        mlb.transform([user_skills]),
        columns=mlb.classes_
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

    # =========================
    # COMPANIES
    # =========================

    # preferred companies ALWAYS returned
    preferred_list = preferred_companies

    # recommended companies from dataset
    other_list = role_df["company_name"].str.lower().unique().tolist()[:5]

    return jsonify({
        "role": role_name,
        "skills": recommended_skills,
        "preferred_companies": preferred_list,
        "other_companies": other_list
    })
# ---------------- RUN ----------------

if __name__ == "__main__":
    app.run(debug=True)