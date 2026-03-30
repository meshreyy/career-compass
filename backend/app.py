from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from supabase import create_client, Client
from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# =========================
# SUPABASE CONFIG
# =========================
url = "https://crumghhbmjqmgqmmdgel.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydW1naGhibWpxbWdxbW1kZ2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODg4NDIsImV4cCI6MjA4OTg2NDg0Mn0.Jadce9a4AOlaI2LRdCDZCCkfyYn1x6FZIJH8lf8QG78"   # use same anon key for now
supabase: Client = create_client(url, key)

# =========================
# LOAD DATA FROM DB
# =========================
response = supabase.table("company").select("*").execute()
data = response.data

df = pd.DataFrame(data)

# =========================
# CLEAN DATA
# =========================
df["tools_and_technologies"] = df["tools_and_technologies"].apply(
    lambda x: [i.strip().lower() for i in str(x).split(",")]
)

# =========================
# ENCODING
# =========================
mlb = MultiLabelBinarizer()
skills_encoded = mlb.fit_transform(df["tools_and_technologies"])
skills_df = pd.DataFrame(skills_encoded, columns=mlb.classes_)

le = LabelEncoder()
df["role_encoded"] = le.fit_transform(df["role_name"])

# =========================
# TRAIN MODEL
# =========================
model = RandomForestClassifier(n_estimators=300, max_depth=10, random_state=42)
model.fit(skills_df, df["role_encoded"])

# =========================
# TF-IDF
# =========================
df["skills_text"] = df["tools_and_technologies"].apply(lambda x: " ".join(x))

tfidf = TfidfVectorizer()
tfidf.fit(df["skills_text"])

print("✅ Model Ready with DB Data")

# =========================
# ROUTES
# =========================
@app.route("/")
def home():
    return "Backend Running ✅"

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json

    user_skills = data.get("skills", [])
    preferred_companies = data.get("companies", [])

    # ROLE PREDICTION
    user_vector = pd.DataFrame(
        mlb.transform([user_skills]),
        columns=mlb.classes_
    )

    pred_role = model.predict(user_vector)
    role_name = le.inverse_transform(pred_role)[0]

    # FILTER DATA
    filtered_df = df[df["company_name"].str.lower().isin(preferred_companies)]

    if len(filtered_df) < 5:
        filtered_df = df

    filtered_text = filtered_df["tools_and_technologies"].apply(lambda x: " ".join(x))
    filtered_tfidf = tfidf.transform(filtered_text)

    user_text = " ".join(user_skills)
    user_tfidf = tfidf.transform([user_text])

    similarity = cosine_similarity(user_tfidf, filtered_tfidf)
    similar_indices = similarity.argsort()[0][-15:]

    skill_freq = {}

    for idx in similar_indices:
        for skill in filtered_df.iloc[idx]["tools_and_technologies"]:
            if skill not in user_skills:
                skill_freq[skill] = skill_freq.get(skill, 0) + 1

    recommended_skills = sorted(skill_freq, key=skill_freq.get, reverse=True)[:5]

    return jsonify({
        "role": role_name,
        "skills": recommended_skills,
        "companies": preferred_companies
    })


if __name__ == "__main__":
    app.run(debug=True)