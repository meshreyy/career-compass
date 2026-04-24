import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

/* ================= OPTIONS ================= */

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

const skillOptions = [
  { value: "c", label: "C" },
  { value: "c++", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "rust", label: "Rust" },
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
  { value: "spring", label: "Spring Boot" },
  { value: "django", label: "Django" },
  { value: "flask", label: "Flask" },
  { value: "microservices", label: "Microservices" },
  { value: "sql", label: "SQL" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "redis", label: "Redis" },
  { value: "dsa", label: "Data Structures & Algorithms" },
  { value: "system design", label: "System Design" },
  { value: "operating systems", label: "Operating Systems" },
  { value: "computer networks", label: "Computer Networks" },
  { value: "dbms", label: "DBMS" },
  { value: "machine learning", label: "Machine Learning" },
  { value: "deep learning", label: "Deep Learning" },
  { value: "data science", label: "Data Science" },
  { value: "analytics", label: "Analytics" },
  { value: "powerbi", label: "Power BI" },
  { value: "excel", label: "Excel" },
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
  { value: "gcp", label: "Google Cloud" },
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "ci/cd", label: "CI/CD" },
  { value: "git", label: "Git" },
  { value: "github", label: "GitHub" },
  { value: "linux", label: "Linux" }
];

const experienceOptions = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" }
];

/* ================= COMPONENT ================= */

const AuthPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  const [skills, setSkills] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [experience, setExperience] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    university: "",
    branch: "",
    year: ""
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    university: "",
    branch: "",
    year: "",
    skills: "",
    companies: "",
    experience: "",
    general: ""
  });

  const navigate = useNavigate();

  /* ================= INPUT ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name" && !/^[A-Za-z ]*$/.test(value)) return;
    if (name === "email") {
      setForm({ ...form, [name]: value.toLowerCase() });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  /* ================= VALIDATION ================= */

  const validate = () => {
    const newErrors = {
      email: "", password: "", name: "", phone: "",
      university: "", branch: "", year: "",
      skills: "", companies: "", experience: ""
    };

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/;
    const phoneRegex = /^(?!([0-9])\1{9})[0-9]{10}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

    if (!form.email) newErrors.email = "Required";
    else if (!emailRegex.test(form.email) || form.email.endsWith("."))
      newErrors.email = "Enter a valid email (e.g. abc@gmail.com)";

    if (!form.password) newErrors.password = "Required";
    else if (!passwordRegex.test(form.password))
      newErrors.password = "Make your password stronger by adding a symbol or a number(Length 6 character).";

    if (isSignup && selectedRole === "student") {
      if (!form.name) newErrors.name = "Invalid input";
      if (!form.phone || !phoneRegex.test(form.phone))
        newErrors.phone = "Invalid phone";
      if (!form.university) newErrors.university = "Required";
      if (!form.branch) newErrors.branch = "Required";
      if (!form.year) newErrors.year = "Required";
      if (!skills.length) newErrors.skills = "Select skill";
      if (!companies.length) newErrors.companies = "Select company";
      if (!experience) newErrors.experience = "Select experience";
    }

    setErrors({ ...newErrors, general: "" });
    return Object.values(newErrors).every((val) => val === "");
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!validate()) return;
    const endpoint = isSignup ? "signup" : "login";

    try {
      const bodyData = isSignup
        ? {
          role: selectedRole,
          ...form,
          skills: skills.map(s => s.value).join(","),
          preferred_company: companies.map(c => c.value).join(","),
          experience: experience?.value
        }
        : {
          role: selectedRole,
          email: form.email,
          password: form.password
        };

      const res = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      if (data.status !== "success") {
        setErrors(prev => ({ ...prev, general: data.message }));
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.role);

      if (selectedRole === "student") navigate("/student");
      if (selectedRole === "admin") navigate("/admin");
      if (selectedRole === "placement") navigate("/placement-cell");

    } catch {
      setErrors(prev => ({ ...prev, general: "Server error" }));
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">

      {!selectedRole && (
        <div className="max-w-4xl w-full animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
              Career <span className="text-blue-600">Compass</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium">AI-Powered skill gap analysis for your dream career.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: "student", label: "Student", icon: "🎓" },
              { id: "admin", label: "Admin", icon: "🛡️" },
              { id: "placement", label: "Placement", icon: "💼" }
            ].map((role) => (
              <div
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id);
                  setIsSignup(false);
                }}
                className="group cursor-pointer bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-white hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{role.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 uppercase tracking-wide">{role.label}</h3>
                <p className="text-slate-400 text-xs font-semibold">Click to enter portal</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRole && (
        <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl w-full max-w-[580px] border border-white animate-in slide-in-from-bottom-10 duration-500 relative overflow-hidden">
          
          <button onClick={() => setSelectedRole(null)} className="text-slate-400 hover:text-blue-500 transition-colors mb-4 flex items-center gap-1 text-sm font-bold uppercase tracking-wider">
            ← Change Role
          </button>

          <header className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 capitalize leading-tight">
              {selectedRole} <span className="text-blue-600">{isSignup ? "Registration" : "Login"}</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Enter your credentials to manage your career journey.</p>
          </header>

          {errors.general && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold">
              {errors.general}
            </div>
          )}

          <div className="space-y-5">
            {/* Email + Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <input name="email" onChange={handleChange} placeholder="name@university.edu" className="input-modern" />
                <p className="error-text">{errors.email}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-modern pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 uppercase hover:text-blue-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="error-text">{errors.password}</p>
              </div>
            </div>

            {/* SIGNUP FOR STUDENT */}
            {isSignup && selectedRole === "student" && (
              <div className="space-y-5 pt-4 border-t border-slate-100 mt-4 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                    <input name="name" onChange={handleChange} className="input-modern" placeholder="e.g. Shreya" />
                    <p className="error-text">{errors.name}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                    <input name="phone" onChange={handleChange} className="input-modern" placeholder="10-digit number" />
                    <p className="error-text">{errors.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">University</label>
                    <select name="university" onChange={handleChange} className="input-modern appearance-none">
                      <option value="">Select</option>
                      <option value="banasthali">Banasthali Vidyapith</option>
                    </select>
                    <p className="error-text">{errors.university}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Branch</label>
                    <select name="branch" onChange={handleChange} className="input-modern appearance-none">
                      <option value="">Select</option>
                      <option value="cs">CS</option>
                      <option value="it">IT</option>
                      <option value="ai">AI</option>
                    </select>
                    <p className="error-text">{errors.branch}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Year</label>
                    <select name="year" onChange={handleChange} className="input-modern appearance-none">
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                    <p className="error-text">{errors.year}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Experience Level</label>
                  <Select 
                    options={experienceOptions} 
                    onChange={setExperience} 
                    className="react-select-container" 
                    classNamePrefix="react-select"
                  />
                  <p className="error-text">{errors.experience}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Current Skills</label>
                  <Select 
                    options={skillOptions} 
                    isMulti 
                    onChange={(s) => setSkills(s ? [...s] : [])} 
                    className="react-select-container" 
                    classNamePrefix="react-select"
                  />
                  <p className="error-text">{errors.skills}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Target Companies</label>
                  <Select 
                    options={companyOptions} 
                    isMulti 
                    onChange={(c) => setCompanies(c ? [...c] : [])} 
                    className="react-select-container" 
                    classNamePrefix="react-select"
                  />
                  <p className="error-text">{errors.companies}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] mt-4 text-lg tracking-wide"
            >
              {isSignup ? "Create Student Account" : `Login as ${selectedRole}`}
            </button>

            {selectedRole === "student" && (
              <p className="text-center text-slate-500 text-sm mt-6 font-bold">
                {isSignup ? "Already have an account?" : "New here?"}{" "}
                <span onClick={() => setIsSignup(!isSignup)} className="text-blue-600 cursor-pointer hover:underline underline-offset-4 ml-1">
                  {isSignup ? "Sign In" : "Create account"}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`
        .input-modern {
          width: 100%;
          padding: 12px 16px;
          background: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 12px;
          transition: all 0.2s;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
        }
        .input-modern:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .input-modern::placeholder {
          color: #cbd5e1;
        }
        .error-text {
          color: #ef4444;
          font-size: 11px;
          margin-top: 4px;
          font-weight: 800;
          margin-left: 4px;
        }
        .react-select__control {
          border-radius: 12px !important;
          border: 2px solid #f1f5f9 !important;
          background: #f8fafc !important;
          padding: 3px !important;
          box-shadow: none !important;
        }
        .react-select__control--is-focused {
          border-color: #3b82f6 !important;
          background: white !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
        }
        .react-select__placeholder {
          font-weight: 500;
          color: #cbd5e1 !important;
        }
        .react-select__multi-value {
          background-color: #eff6ff !important;
          border-radius: 8px !important;
          color: #1e40af !important;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;