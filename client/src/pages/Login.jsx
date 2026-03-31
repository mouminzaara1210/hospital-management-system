import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { apiRequest } from "../utils/apiRequest";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      login(data.user, data.token);

      if (data.user.role === "Super Admin") {
        navigate("/admin");
      } else {
        navigate("/doctor");
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h1>Apollo HMS</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="admin@hms.com / doctor@hms.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="any password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Sign in</button>
      </form>
    </div>
  );
};

export default Login;
