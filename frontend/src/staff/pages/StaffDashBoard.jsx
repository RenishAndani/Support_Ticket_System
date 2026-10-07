import React, { useState, useEffect } from "react";
import api from "../../api/api";

const StaffDashBoard = () => {
  const [dashboardData, setDashboardData] = useState({ status: [], priority: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define all expected statuses and priorities
  const allStatuses = [
    { key: "open", label: "Open", badge: "bg-yellow-100 text-yellow-800" },
    { key: "in_progress", label: "In Progress", badge: "bg-blue-100 text-blue-800" },
    { key: "waiting_for_user", label: "Waiting for User", badge: "bg-purple-100 text-purple-800" },
    { key: "resolved", label: "Resolved", badge: "bg-green-100 text-green-800" },
    { key: "closed", label: "Closed", badge: "bg-gray-100 text-gray-800" },
  ];

  const allPriorities = [
    { key: "Low", label: "Low Priority", badge: "bg-gray-100 text-gray-700" },
    { key: "Medium", label: "Medium Priority", badge: "bg-orange-100 text-orange-700" },
    { key: "High", label: "High Priority", badge: "bg-red-100 text-red-700" },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Changed endpoint to staff dashboard
      const response = await api.get("/staff/dashboard");

      setDashboardData(response.data || { status: [], priority: [] });
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  // Create lookup maps for quick access and default missing ones to 0
  const statusCounts = {};
  dashboardData.status?.forEach((item) => {
    statusCounts[item.status] = item.count;
  });

  const priorityCounts = {};
  dashboardData.priority?.forEach((item) => {
    priorityCounts[item.priority] = item.count;
  });

  return (
    <div className='space-y-8 p-4 sm:p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div>
        <h2 className='text-2xl font-bold text-gray-800'>Staff Dashboard Overview</h2>
        <p className='text-sm text-gray-500'>
          Summary of assigned support tickets categorized by status and priority.
        </p>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-48 text-gray-500'>
          Loading dashboard statistics...
        </div>
      ) : error ? (
        <div className='bg-red-50 text-red-600 p-4 rounded-md'>{error}</div>
      ) : (
        <div className='space-y-6'>
          {/* Status Breakdown Section */}
          <div>
            <h3 className='text-lg font-semibold text-gray-700 mb-4'>Tickets by Status</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
              {allStatuses.map((st) => {
                const count = statusCounts[st.key] || 0;
                return (
                  <div
                    key={st.key}
                    className='bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wider ${st.badge}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <div>
                      <span className='text-3xl font-bold text-gray-800'>{count}</span>
                      <p className='text-xs text-gray-400 mt-1'>Total tickets</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Breakdown Section */}
          <div>
            <h3 className='text-lg font-semibold text-gray-700 mb-4'>Tickets by Priority</h3>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              {allPriorities.map((pr) => {
                const count = priorityCounts[pr.key] || 0;
                return (
                  <div
                    key={pr.key}
                    className='bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${pr.badge}`}
                      >
                        {pr.label}
                      </span>
                    </div>
                    <div>
                      <span className='text-3xl font-bold text-gray-800'>{count}</span>
                      <p className='text-xs text-gray-400 mt-1'>Total tickets</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashBoard;
