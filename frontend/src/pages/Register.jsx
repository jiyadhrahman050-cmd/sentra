import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import "../styles/loginpage.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    try {
      await register(form);

      alert("Account created successfully");

      navigate("/");
    } catch (err) {
      alert(
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data)
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <div className="logo-box">S</div>
          <h1>Sentra</h1>
        </div>

        <h2>Create account</h2>

        <p className="subtitle">
          New accounts start with the Viewer role
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              name="full_name"
              className="form-control"
              placeholder="Jane Cooper"
              value={form.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min 8 chars"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Confirm</label>
              <input
                type="password"
                name="confirm_password"
                className="form-control"
                placeholder="Repeat it"
                value={form.confirm_password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button className="login-btn">
            Create account
          </button>

        </form>

        <hr />

        <div className="login-footer">
          <span>Already have an account?</span>

          <Link to="/">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;