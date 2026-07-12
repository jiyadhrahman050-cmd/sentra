import { useState } from "react";

function UserForm({ onSubmit }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);

    setForm({
      username: "",
      email: "",
      password: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">

      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
      </div>

      <button className="btn btn-success">
        Create User
      </button>

    </form>
  );
}

export default UserForm;