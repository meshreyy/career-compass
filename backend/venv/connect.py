from supabase import create_client
import httpx

url = "https://crumghhbmjqmgqmmdgel.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydW1naGhibWpxbWdxbW1kZ2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODg4NDIsImV4cCI6MjA4OTg2NDg0Mn0.Jadce9a4AOlaI2LRdCDZCCkfyYn1x6FZIJH8lf8QG78"

client = httpx.Client(verify=False)

supabase = create_client(url, key)
supabase.postgrest.session = client

# 🔥 Take input
student_id = int(input("Enter Student ID: "))

# -------- STUDENT DATA --------
student_res = supabase.table("student") \
    .select("student_id, student_name, email") \
    .eq("student_id", student_id) \
    .execute()

# Check if student exists
if not student_res.data:
    print("❌ Student not found")
    exit()

student = student_res.data[0]

# -------- PRINT STUDENT INFO --------
print("\n🎓 STUDENT PROFILE")
print("------------------------")
print("ID:", student["student_id"])
print("Name:", student["student_name"])
print("Email:", student["email"])

# -------- SKILLS --------
skills_res = supabase.table("student_skills") \
    .select("skill_name") \
    .eq("student_id", student_id) \
    .execute()

print("\n💡 SKILLS:")
skills_list = []

for skill in skills_res.data:
    print("-", skill["skill_name"])
    skills_list.append(skill["skill_name"])

# -------- RECOMMENDED COMPANIES --------
print("\n🏢 RECOMMENDED COMPANIES:")

shown_companies = set()  # to avoid duplicates

for skill in skills_list:
    companies = supabase.table("company") \
        .select("company_name, role_name") \
        .ilike("tools_and_technologies", f"%{skill}%") \
        .execute()

    for comp in companies.data:
        key = (comp["company_name"], comp["role_name"])
        if key not in shown_companies:
            print(f"{comp['company_name']} - {comp['role_name']}")
            shown_companies.add(key)