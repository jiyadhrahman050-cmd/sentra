import React from "react";

function Permissions() {
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Permissions</h2>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5>Permission Matrix</h5>

          <table className="table table-bordered table-hover mt-3">
            <thead className="table-dark">
              <tr>
                <th>Permission</th>
                <th>Description</th>
                <th>Assigned Roles</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>users.view</td>
                <td>View Users</td>
                <td>Admin, Manager, Viewer</td>
              </tr>

              <tr>
                <td>users.create</td>
                <td>Create Users</td>
                <td>Admin, Manager</td>
              </tr>

              <tr>
                <td>users.edit</td>
                <td>Edit Users</td>
                <td>Admin, Manager</td>
              </tr>

              <tr>
                <td>users.delete</td>
                <td>Delete Users</td>
                <td>Admin</td>
              </tr>

              <tr>
                <td>roles.view</td>
                <td>View Roles</td>
                <td>Admin, Manager</td>
              </tr>

              <tr>
                <td>roles.manage</td>
                <td>Manage Roles</td>
                <td>Admin</td>
              </tr>

              <tr>
                <td>permissions.view</td>
                <td>View Permissions</td>
                <td>Admin</td>
              </tr>

              <tr>
                <td>audit.view</td>
                <td>View Audit Logs</td>
                <td>Admin</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Permissions;