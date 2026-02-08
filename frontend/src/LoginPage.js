import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage({ onLogin }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!name || !password) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.detail || "Login failed");
        return;
      }

      const userData = await response.json();

      // מעבירים ל־App את המשתמש
      onLogin(userData);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

 return (
  <div className="auth-container">
    <div className="auth-card">
      <h1 className="auth-title">🔐 Login</h1>
      <p className="auth-subtitle">Welcome back</p>

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
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="send-button" onClick={handleLogin}>
        Login
      </button>

      <div className="auth-link">
        Don’t have an account?{" "}
        <button onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </div>
    </div>
  </div>
);
}

export default LoginPage;
