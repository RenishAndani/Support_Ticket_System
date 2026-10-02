import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

const EditTicket = () => {
  const { id } = useParams(); // Get ticket id from URL params
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [staffList, setStaffList] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    status: "open",
    assigned_to: "",
  });

  const statusOptions = [
    { label: "Open", value: "open" },
    { label: "In Progress", value: "in_progress" },
    { label: "Waiting for User", value: "waiting_for_user" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
  ];

  // Fetch ticket details & staff list on mount
  useEffect(() => {
    fetchEditData();
  }, [id]);

  const fetchEditData = async () => {
    try {
      await getStaff();
      const reponse = await api.get(`/admin/tickets/${id}`);

      const data = reponse.data;

      setFormData({
        subject: data.subject,
        description: data.description,
        status: data.status,
        assigned_to: data.assigned_to,
      });

      setLoading(true);
    } catch (err) {
      console.error("Failed to load edit data:", err);
      alert("Could not load ticket information.");
    } finally {
      setLoading(false);
    }
  };

  async function getStaff() {
    try {
      const response = await api.get("/admin/dropdown/staff");
      console.log(response.data);
      setStaffList(response.data);
    } catch (error) {}
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit PUT request
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.put(`/admin/tickets/${id}`, formData);
      navigate("/tickets"); // Redirect back to tickets list after success
    } catch (err) {
      console.error("Failed to update ticket:", err);
      alert("Failed to update ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64 text-gray-500 font-medium'>
        Loading ticket details...
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200'>
      <div className='flex justify-between items-center border-b pb-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>Edit Ticket #{id}</h2>
          <p className='text-sm text-gray-500'>Update ticket information and assignment.</p>
        </div>
        <button
          type='button'
          onClick={() => navigate("/admin/tickets")}
          className='px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50'
        >
          Back to Tickets
        </button>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Subject */}
        <div>
          <label className='block text-sm font-medium text-gray-700'>Subject</label>
          <input
            type='text'
            name='subject'
            required
            value={formData.subject}
            onChange={handleChange}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          />
        </div>

        {/* Description */}
        <div>
          <label className='block text-sm font-medium text-gray-700'>Description</label>
          <textarea
            name='description'
            rows='4'
            value={formData.description}
            onChange={handleChange}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          />
        </div>

        {/* Status */}
        <div>
          <label className='block text-sm font-medium text-gray-700'>Status</label>
          <select
            name='status'
            value={formData.status}
            onChange={handleChange}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned To (Value is ID, Display text is Name) */}
        <div>
          <label className='block text-sm font-medium text-gray-700'>Assigned To</label>
          <select
            name='assigned_to'
            value={formData.assigned_to}
            onChange={handleChange}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
          >
            <option value=''>-- Select Staff Member --</option>
            {staffList.map((staff) => {
              const staffId = staff.id || staff.id;
              return (
                <option key={staffId} value={staffId}>
                  {staff.name}({staffId})
                </option>
              );
            })}
          </select>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end gap-3 pt-4 border-t border-gray-200'>
          <button
            type='button'
            onClick={() => navigate("/tickets")}
            className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={submitting}
            className='px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm disabled:opacity-50'
          >
            {submitting ? "Saving..." : "Update Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTicket;
