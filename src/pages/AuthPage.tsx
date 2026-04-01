import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    university: "",
    branch: "",
    year: "",
    skills: "",
    preferred_company: ""
  });
  const navigate = useNavigate();

  // ✅ HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ VALIDATION
  const validate = () => {
    if (!form.email || !form.password) {
      alert("Email and Password required");
      return false;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{5,}$/;

    if (!passwordRegex.test(form.password)) {
      alert(
        "Password must contain capital, small, number & special character"
      );
      return false;
    }

    if (isSignup && selectedRole === "student") {
      if (
        !form.name ||
        !form.phone ||
        !form.university ||
        !form.branch ||
        !form.year ||
        !form.skills ||
        !form.preferred_company
      ) {
        alert("All student fields required");
        return false;
      }

      if (form.phone.length !== 10) {
        alert("Phone must be 10 digits");
        return false;
      }
    }

    return true;
  };

  // ✅ SUBMIT
  const handleSubmit = async () => {
    if (!validate()) return;

    const endpoint = isSignup ? "signup" : "login";

    try {
      let bodyData;

      // 🔥 DIFFERENT BODY FOR LOGIN & SIGNUP
      if (isSignup) {
        bodyData = {
          role: selectedRole,
          ...form
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

      console.log("RESPONSE:", data); // ✅ DEBUG

      // ❌ HANDLE ERROR
      if (data.status !== "success") {
        alert(data.message || "Something went wrong");
        return;
      }

      // ✅ SUCCESS
      alert("Success!");

      // 🔥 VERY IMPORTANT (for dashboard profile)
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.role);

      // ✅ REDIRECT
      if (selectedRole === "student") navigate("/student");
      if (selectedRole === "admin") navigate("/admin");
      if (selectedRole === "placement") navigate("/placement-cell");

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="flex flex-col items-center p-10">

      {/* 🟦 ROLE SELECTION */}
      {!selectedRole && (
        <div className="grid grid-cols-3 gap-10">
          {["student", "admin", "placement"].map((role) => (
            <div
              key={role}
              onClick={() => setSelectedRole(role)}
              className="cursor-pointer w-60 h-60 flex items-center justify-center text-xl font-bold border rounded-xl hover:bg-blue-100"
            >
              {role.toUpperCase()}
            </div>
          ))}
        </div>
      )}

      {/* 🟩 FORM */}
      {selectedRole && (
        <div className="mt-10 w-80 flex flex-col gap-3">

          <h2 className="text-xl font-bold text-center">
            {selectedRole.toUpperCase()} {isSignup ? "Signup" : "Login"}
          </h2>

          {/* EMAIL */}
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* PASSWORD */}
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {/* 👇 STUDENT EXTRA FIELDS */}
          {isSignup && selectedRole === "student" && (
            <>
              <input name="name" placeholder="Name" onChange={handleChange} className="border p-2 rounded" />
              <input name="phone" placeholder="Phone" onChange={handleChange} className="border p-2 rounded" />
              <input name="university" placeholder="University" onChange={handleChange} className="border p-2 rounded" />
              <input name="branch" placeholder="Branch" onChange={handleChange} className="border p-2 rounded" />
              <input name="year" placeholder="Year" onChange={handleChange} className="border p-2 rounded" />
              <input name="skills" placeholder="Skills (comma separated)" onChange={handleChange} className="border p-2 rounded" />
              <input name="preferred_company" placeholder="Preferred Companies (Google, Amazon, Microsoft)" onChange={handleChange} className="border p-2 rounded"/>
            </>
          )}

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {isSignup ? "Signup" : "Login"}
          </button>

          {/* TOGGLE */}
          <p
            className="text-blue-500 cursor-pointer text-center"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup
              ? "Already have account? Login"
              : "Create account"}
          </p>

          {/* BACK */}
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