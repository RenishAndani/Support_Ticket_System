import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const AddTicket = () => {
  const navigate = useNavigate();

  const [staffList, setStaffList] = useState([]);

  // Fetch staff list for assignedTo dropdown
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get("/admin/dropdown/staff");
        setStaffList(response.data.staff || response.data || []);
      } catch (err) {
        console.error("Failed to fetch staff dropdown list:", err);
      }
    };
    fetchStaff();
  }, []);

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    status: "open",
    priority: "Medium",
    assignedTo: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const statusOptions = [
    { label: "Open", value: "open" },
    { label: "In Progress", value: "in_progress" },
    { label: "Waiting for User", value: "waiting_for_user" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
  ];

  const priorityOptions = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Prepare payload matching Zod schema requirements
    const payload = {
      subject: formData.subject,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      assignedTo: formData.assignedTo ? parseInt(formData.assignedTo, 10) : null,
    };

    try {
      setSubmitting(true);
      await api.post("/admin/tickets", payload);
      alert("Ticket created successfully!");
      navigate(-1); // Go back to the previous page (Tickets list)
    } catch (err) {
      console.error("Failed to create ticket:", err);
      setError(err.response?.data?.message || "Failed to create ticket. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>Create New Ticket</h2>
          <p className='text-sm text-gray-500'>
            Fill in the details below to open a new support ticket.
          </p>
        </div>
        <button
          type='button'
          onClick={() => navigate(-1)}
          className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
        >
          Back
        </button>
      </div>

      {error && (
        <div className='bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-200'>
          {error}
        </div>
      )}

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Subject */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Subject <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='subject'
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder='Enter ticket subject...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            />
          </div>

          {/* Grid Row: Status & Priority */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Status <span className='text-red-500'>*</span>
              </label>
              <select
                name='status'
                value={formData.status}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white'
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Priority <span className='text-red-500'>*</span>
              </label>
              <select
                name='priority'
                value={formData.priority}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white'
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned To (Dropdown) */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Assigned To <span className='text-gray-400 text-xs'>(Optional)</span>
            </label>
            <select
              name='assignedTo'
              value={formData.assignedTo}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white'
            >
              <option value=''>-- Unassigned --</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}({staff.id})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Description <span className='text-red-500'>*</span>
            </label>
            <textarea
              name='description'
              rows='5'
              required
              value={formData.description}
              onChange={handleChange}
              placeholder='Describe the issue in detail...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            />
          </div>

          {/* Form Actions */}
          <div className='flex justify-end gap-3 pt-4 border-t'>
            <button
              type='button'
              onClick={() => navigate(-1)}
              className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium shadow-sm transition-colors disabled:opacity-50'
            >
              {submitting ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTicket;
