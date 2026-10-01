import { useState, useEffect } from "react";
import api from "../../api/api"; // Adjust the import path according to your folder structure

const Staff = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");

      // Assuming the response returns an array directly or inside a property like response.data.users
      setUsers(response.data.users || response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Placeholder handler for Add User
  const handleAddUser = () => {
    console.log("Add User button clicked");
    // TODO: Open modal or navigate to add user form
  };

  // Placeholder handler for Edit User
  const handleEdit = (userId) => {
    console.log("Edit user with ID:", userId);
    // TODO: Implement edit logic/modal
  };

  // Placeholder handler for Delete User
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      console.log("Delete user with ID:", userId);
      // TODO: Implement delete API call e.g., await api.delete(`/admin/users/${userId}`);
      // Then refresh list: fetchUsers();
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-gray-500 font-medium'>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md'>
        {error}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Top Header / Action Row */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>Users Management</h2>
          <p className='text-sm text-gray-500'>Manage system users, roles, and records.</p>
        </div>
        <button
          onClick={handleAddUser}
          className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm'
        >
          <span>+</span> Add User
        </button>
      </div>

      {/* Users Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 text-left'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  User ID
                </th>
                <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Name
                </th>
                <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Role
                </th>
                <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.userid || user.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {user.userid || user.id}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium'>
                      {user.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {user.email}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          user.role === "Admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role || "User"}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2'>
                      <button
                        onClick={() => handleEdit(user.userid || user.id)}
                        className='text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.userid || user.id)}
                        className='text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='5' className='px-6 py-8 text-center text-sm text-gray-500'>
                    No staff found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Staff;
