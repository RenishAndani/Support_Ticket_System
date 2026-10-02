import React, { useState, useEffect } from "react";
import api from "../../api/api";

const Dashboard = () => {
  const [stats, setStats] = useState({ status: [], role: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define all possible statuses and roles as requested
  const allStatuses = ["open", "in_progress", "waiting_for_user", "resolved", "closed"];
  const allRoles = ["user", "admin", "staff"];

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        // Replace with your actual dashboard endpoint if different
        const response = await api.get("/admin/dashboard");
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Map API response status counts, fallback to 0 if missing
  const getStatusCount = (statusName) => {
    const found = stats.status?.find((item) => item.status === statusName);
    return found ? found.count : 0;
  };

  // Map API response role counts, fallback to 0 if missing
  const getRoleCount = (roleName) => {
    const found = stats.role?.find((item) => item.role === roleName);
    return found ? found.userCount : 0;
  };

  // Helper formatting for status titles
  const formatLabel = (text) => {
    return text
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <p className='text-gray-500 text-sm'>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-200'>
        {error}
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Page Header */}
      <div>
        <h2 className='text-2xl font-bold text-gray-800'>Dashboard Overview</h2>
        <p className='text-sm text-gray-500'>
          Summary of system tickets by status and users by role.
        </p>
      </div>

      {/* Ticket Status Section */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-700'>Ticket Statuses</h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
          {allStatuses.map((status) => {
            const count = getStatusCount(status);
            return (
              <div
                key={status}
                className='bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow'
              >
                <span className='text-xs font-semibold uppercase tracking-wider text-gray-400'>
                  {formatLabel(status)}
                </span>
                <div className='mt-4 flex items-baseline justify-between'>
                  <span className='text-3xl font-extrabold text-gray-800'>{count}</span>
                  <span className='text-xs text-blue-600 font-medium'>Tickets</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Roles Section */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold text-gray-700'>User Roles</h3>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {allRoles.map((role) => {
            const count = getRoleCount(role);
            return (
              <div
                key={role}
                className='bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow'
              >
                <span className='text-xs font-semibold uppercase tracking-wider text-gray-400'>
                  {formatLabel(role)}
                </span>
                <div className='mt-4 flex items-baseline justify-between'>
                  <span className='text-3xl font-extrabold text-gray-800'>{count}</span>
                  <span className='text-xs text-indigo-600 font-medium'>Users</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
