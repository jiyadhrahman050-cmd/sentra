import { useState } from "react";

function RoleForm({ onSubmit }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({ name });

    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="row">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Role Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="col-md-4">
          <button className="btn btn-primary w-100">
            Add Role
          </button>
        </div>
      </div>
    </form>
  );
}

export default RoleForm;