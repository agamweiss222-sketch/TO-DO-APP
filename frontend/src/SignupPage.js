import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }
    if (password.trim().length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    try {
      const res = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          password: password.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Signup failed");
        return;
      }

    setSuccess("User created successfully! Logging you in...");
   

    // 🔥 login אוטומטי אחרי signup
    const loginRes = await fetch("http://127.0.0.1:8000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        name: name.trim(),
        password: password.trim(),
    }),
    });

if (!loginRes.ok) {
  setError("Signup succeeded but login failed");
  return;
}

const userData = await loginRes.json();

sessionStorage.setItem("accessToken", userData.access_token);
sessionStorage.setItem("userName", userData.name);
sessionStorage.setItem("role", userData.role);

// מעבר ישר למשימות
navigate("/");
    } catch (err) {
      setError("Server error - Failed to fetch");
    }
  };

  return (
  <div className="auth-container">
    <div className="auth-card">
      <h1 className="auth-title">📝 Sign Up</h1>
      <p className="auth-subtitle">Create your account</p>

      <form onSubmit={handleSignup}>
        <input
          className="input-box"
          type="text"
          placeholder="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input-box"
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="send-button" type="submit">
          Sign Up
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <div className="auth-link">
        Already have an account?{" "}
        <button onClick={() => navigate("/")}>Login</button>
      </div>
    </div>
  </div>
);

}

export default SignupPage;
