import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

/* ================================
   COMPANY OPTIONS
================================ */

const companyOptions = [
  { value: "google", label: "Google" },
  { value: "amazon", label: "Amazon" },
  { value: "meta", label: "Meta" },
  { value: "microsoft", label: "Microsoft" },
  { value: "netflix", label: "Netflix" },
  { value: "stripe", label: "Stripe" },
  { value: "uber", label: "Uber" },
  { value: "flipkart", label: "Flipkart" },
  { value: "swiggy", label: "Swiggy" },
  { value: "zomato", label: "Zomato" },
  { value: "paypal", label: "PayPal" },
  { value: "jpmorgan", label: "JPMorgan" },
  { value: "oracle", label: "Oracle" },
  { value: "cisco", label: "Cisco" },
  { value: "ibm", label: "IBM" },
  { value: "nvidia", label: "Nvidia" }
];

/* ================================
   SKILL OPTIONS
================================ */

const skillOptions = [
  // Programming Languages
  { value: "c", label: "C" },
  { value: "c++", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },

  // Web Development
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "react", label: "React" },
  { value: "angular", label: "Angular" },
  { value: "vue", label: "Vue.js" },
  { value: "node.js", label: "Node.js" },
  { value: "express", label: "Express.js" },
  { value: "next.js", label: "Next.js" },
  { value: "tailwind", label: "Tailwind CSS" },
  { value: "bootstrap", label: "Bootstrap" },

  // Backend
  { value: "spring", label: "Spring Boot" },
  { value: "django", label: "Django" },
  { value: "flask", label: "Flask" },
  { value: "microservices", label: "Microservices" },

  // Databases
  { value: "sql", label: "SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "redis", label: "Redis" },

  // Core CS Skills
  { value: "dsa", label: "Data Structures & Algorithms" },
  { value: "system design", label: "System Design" },
  { value: "operating systems", label: "Operating Systems" },
  { value: "computer networks", label: "Computer Networks" },
  { value: "dbms", label: "DBMS" },

  // Data & AI
  { value: "machine learning", label: "Machine Learning" },
  { value: "deep learning", label: "Deep Learning" },
  { value: "data science", label: "Data Science" },
  { value: "analytics", label: "Analytics" },
  { value: "powerbi", label: "Power BI" },
  { value: "excel", label: "Excel" },

  // Cloud & DevOps
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
  { value: "gcp", label: "Google Cloud" },
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "ci/cd", label: "CI/CD" },

  // Tools
  { value: "git", label: "Git" },
  { value: "github", label: "GitHub" },
  { value: "linux", label: "Linux" }
];

/* ================================
   EXPERIENCE OPTIONS
================================ */

const experienceOptions = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" }
];

/* ================================
   COMPONENT
================================ */

const AuthPage = () => {

  const [selectedRole, setSelectedRole] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  const [skills, setSkills] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [experience, setExperience] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    university: "",
    branch: "",
    year: ""
  });

  const navigate = useNavigate();

  /* ================================
      INPUT HANDLER
  ================================= */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================================
      VALIDATION
  ================================= */

  const validate = () => {

    if (!form.email || !form.password) {
      alert("Email and Password required");
      return false;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{5,}$/;

    if (!passwordRegex.test(form.password)) {
      alert("Password must contain capital, small, number & special character");
      return false;
    }

    if (isSignup && selectedRole === "student") {

      if (
        !form.name ||
        !form.phone ||
        !form.university ||
        !form.branch ||
        !form.year
      ) {
        alert("All student fields required");
        return false;
      }

      if (skills.length === 0) {
        alert("Select at least one skill");
        return false;
      }

      if (companies.length === 0) {
        alert("Select at least one company");
        return false;
      }

      if (!experience) {
        alert("Select experience level");
        return false;
      }

      if (form.phone.length !== 10) {
        alert("Phone must be 10 digits");
        return false;
      }
    }

    return true;
  };

  /* ================================
      SUBMIT
  ================================= */

  const handleSubmit = async () => {

    if (!validate()) return;

    const endpoint = isSignup ? "signup" : "login";

    try {

      let bodyData;

      if (isSignup) {

        bodyData = {
          role: selectedRole,
          ...form,
          skills: skills.map((s) => s.value).join(","),
          preferred_company: companies.map((c) => c.value).join(","),
          experience: experience.value
        };

      } else {

        bodyData = {
          role: selectedRole,
          email: form.email,
          password: form.password
        };
      }

      const res = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (data.status !== "success") {
        alert(data.message || "Something went wrong");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.role);

      if (selectedRole === "student") navigate("/student");
      if (selectedRole === "admin") navigate("/admin");
      if (selectedRole === "placement") navigate("/placement-cell");

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  /* ================================
      UI
  ================================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      {!selectedRole && (
        <div className="flex flex-col items-center gap-8">

          <h1 className="text-3xl font-bold text-gray-700">
            Career Compass
          </h1>

          <div className="flex gap-8">

            {["student", "admin", "placement"].map((role) => (

              <div
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setIsSignup(false);
                }}
                className="cursor-pointer w-52 h-52 flex items-center justify-center text-xl font-semibold 
                bg-white rounded-2xl shadow-md hover:shadow-xl 
                transition duration-300 hover:scale-105 border"
              >
                {role.toUpperCase()}
              </div>

            ))}

          </div>
        </div>
      )}

      {selectedRole && (

        <div className="bg-white p-8 rounded-2xl shadow-lg w-96 flex flex-col gap-4">

          <h2 className="text-2xl font-bold text-center text-gray-700">
            {selectedRole.toUpperCase()} {isSignup ? "Signup" : "Login"}
          </h2>

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="border p-2 rounded-lg"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="border p-2 rounded-lg"
          />

          {isSignup && selectedRole === "student" && (
            <>
              <input name="name" placeholder="Name" onChange={handleChange} className="border p-2 rounded-lg" />
              <input name="phone" placeholder="Phone" onChange={handleChange} className="border p-2 rounded-lg" />
              <input name="university" placeholder="University" onChange={handleChange} className="border p-2 rounded-lg" />
              <input name="branch" placeholder="Branch" onChange={handleChange} className="border p-2 rounded-lg" />
              <input name="year" placeholder="Year" onChange={handleChange} className="border p-2 rounded-lg" />

              <div>
                <label className="text-sm font-semibold">Skills</label>
                <Select
                  options={skillOptions}
                  isMulti
                  onChange={(selected) => setSkills(selected ? [...selected] : [])}
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Preferred Companies</label>
                <Select
                  options={companyOptions}
                  isMulti
                  onChange={(selected) => setCompanies(selected ? [...selected] : [])}
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Experience</label>
                <Select
                  options={experienceOptions}
                  onChange={(selected) => setExperience(selected)}
                />
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
          >
            {isSignup ? "Signup" : "Login"}
          </button>

          {selectedRole === "student" && (
            <p
              className="text-blue-500 cursor-pointer text-center"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Already have account? Login" : "Create account"}
            </p>
          )}

          <button
            className="text-sm text-gray-500"
            onClick={() => setSelectedRole(null)}
          >
            ← Back
          </button>

        </div>

      )}

    </div>
  );
};

export default AuthPage;