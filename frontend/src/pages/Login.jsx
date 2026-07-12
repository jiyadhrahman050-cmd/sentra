import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import "../styles/loginpage.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
  email: "",
  password: "",
});

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(form);

    try {
      await login(form);
      navigate("/dashboard");
    } catch (error) {
      console.log(error.response);

      alert(
        error.response?.data?.detail ||
          JSON.stringify(error.response?.data) ||
          "Login failed"
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">

          <div className="logo-box">
            S
          </div>

          <h1>Sentra</h1>

        </div>

        <h2>Sign in</h2>

        <p className="subtitle">
          User & access management console
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Email</label>

            <input
  type="email"
  className="form-control"
  name="email"
  placeholder="you@company.com"
  value={form.email}
  onChange={handleChange}
/>

          </div>

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />

          </div>

          <button
            type="submit"
            className="login-btn"
          >
            Sign in
          </button>

        </form>

        <hr />

        <div className="login-footer">

          <span></span>

          <Link to="/register" className="create-account-link">
    Create account
</Link>

        </div>

      </div>

    </div>
  );
}

export default Login;