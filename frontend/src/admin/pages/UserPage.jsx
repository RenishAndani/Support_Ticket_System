import React, { useState, useEffect } from "react";
import api from "../../api/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "User" });
  const [editForm, setEditForm] = useState({ userid: "", name: "", email: "", role: "User" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setUsers(response.data.users || response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Form Submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/admin/users", addForm);
      setIsAddOpen(false);
      setAddForm({ name: "", email: "", password: "", role: "User" });
      fetchUsers();
    } catch (err) {
      console.error("Failed to create user:", err);
      alert("Failed to add user.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal & Fetch User
  const handleEditClick = async (userId) => {
    setSelectedUserId(userId);
    setIsEditOpen(true);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      const userData = response.data.user || response.data;
      setEditForm({
        userid: userData.userid || userId,
        name: userData.name || "",
        email: userData.email || "",
        role: userData.role || "User",
      });
    } catch (err) {
      console.error("Failed to fetch user details:", err);
      alert("Could not load user profile.");
      setIsEditOpen(false);
    }
  };

  // Handle Edit Form Submission
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/admin/users/${selectedUserId}`, editForm);
      setIsEditOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Failed to update user.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    }
  };

  if (loading)
    return (
      <div className='flex justify-center items-center h-64 text-gray-500'>Loading users...</div>
    );
  if (error) return <div className='bg-red-50 text-red-600 p-4 rounded-md'>{error}</div>;

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>Users Management</h2>
          <p className='text-sm text-gray-500'>Manage system users, roles, and records.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors text-sm'
        >
          + Add User
        </button>
      </div>

      {/* Users Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200 text-left'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase'>User ID</th>
              <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase'>Name</th>
              <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase'>Email</th>
              <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase'>Role</th>
              <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase'>Role ID</th>
              <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {users.length > 0 ? (
              users.map((user) => {
                const uid = user.userid || user.id;
                return (
                  <tr key={uid} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 text-sm font-medium text-gray-900'>{uid}</td>
                    <td className='px-6 py-4 text-sm text-gray-700'>{user.name}</td>
                    <td className='px-6 py-4 text-sm text-gray-500'>{user.email}</td>
                    <td className='px-6 py-4 text-sm'>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          user.role === "Admin"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "Staff"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role || "User"}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500 font-mono'>{user.roleId}</td>
                    <td className='px-6 py-4 text-right text-sm space-x-2'>
                      <button
                        onClick={() => handleEditClick(uid)}
                        className='text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(uid)}
                        className='text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan='5' className='px-6 py-8 text-center text-gray-500'>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 px-4'>
          <div className='w-full max-w-lg bg-white p-6 rounded-xl shadow-xl'>
            <h3 className='text-lg font-bold text-gray-800 mb-4'>Add New User</h3>
            <form onSubmit={handleAddSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Full Name</label>
                <input
                  type='text'
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className='mt-1 block w-full px-3 py-2 border rounded-md'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Email Address</label>
                <input
                  type='email'
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className='mt-1 block w-full px-3 py-2 border rounded-md'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Password</label>
                <input
                  type='password'
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className='mt-1 block w-full px-3 py-2 border rounded-md'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Role</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className='mt-1 block w-full px-3 py-2 border rounded-md bg-white'
                >
                  <option value='user'>User</option>
                  <option value='admin'>Admin</option>
                  <option value='staff'>Staff</option>
                </select>
              </div>
              <div className='flex justify-end gap-3 pt-4 border-t'>
                <button
                  type='button'
                  onClick={() => setIsAddOpen(false)}
                  className='px-4 py-2 border rounded-md text-gray-700'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={submitting}
                  className='px-4 py-2 bg-blue-600 text-white rounded-md'
                >
                  {submitting ? "Saving..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 px-4'>
          <div className='w-full max-w-lg bg-white p-6 rounded-xl shadow-xl'>
            <h3 className='text-lg font-bold text-gray-800 mb-4'>Edit User</h3>
            <form onSubmit={handleUpdateSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>User ID</label>
                <input
                  type='text'
                  value={editForm.userid}
                  disabled
                  className='mt-1 block w-full px-3 py-2 bg-gray-100 border rounded-md text-gray-500 cursor-not-allowed'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Full Name</label>
                <input
                  type='text'
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className='mt-1 block w-full px-3 py-2 border rounded-md'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Email Address</label>
                <input
                  type='email'
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className='mt-1 block w-full px-3 py-2 border rounded-md'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className='mt-1 block w-full px-3 py-2 border rounded-md bg-white'
                >
                  <option value='user'>User</option>
                  <option value='admin'>Admin</option>
                  <option value='staff'>Staff</option>
                </select>
              </div>
              <div className='flex justify-end gap-3 pt-4 border-t'>
                <button
                  type='button'
                  onClick={() => setIsEditOpen(false)}
                  className='px-4 py-2 border rounded-md text-gray-700'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={submitting}
                  className='px-4 py-2 bg-blue-600 text-white rounded-md'
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
