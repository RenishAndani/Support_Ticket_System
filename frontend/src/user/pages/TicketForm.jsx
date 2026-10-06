import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";

const TicketForm = () => {
  const { id } = useParams(); // If id exists -> Edit mode; otherwise -> Add mode
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchingTicket, setFetchingTicket] = useState(isEditMode);

  // Form Fields
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [closed, setClosed] = useState(false); // boolean (true / false)

  // Fetch data if in Edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchTicketData = async () => {
        try {
          setFetchingTicket(true);
          const response = await api.get(`/users/fill-ticket/${id}`);
          const ticket = response.data.ticket || response.data;
          setSubject(ticket.subject || ticket.title || "");
          setDescription(ticket.description || "");
          setClosed(ticket.closed !== undefined ? ticket.closed : false);
        } catch (err) {
          console.error("Failed to fetch ticket fill data:", err);
          alert("Failed to load ticket details.");
        } finally {
          setFetchingTicket(false);
        }
      };
      fetchTicketData();
    }
  }, [id, isEditMode]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditMode) {
        await api.put(`/users/ticket/${id}`, {
          subject,
          description,
          closed,
        });
        alert("Ticket updated successfully!");
      } else {
        await api.post(`/users/ticket`, {
          subject,
          description,
        });
        alert("Ticket created successfully!");
      }
      navigate(-1);
    } catch (err) {
      console.error("Failed to save ticket:", err);
      alert(isEditMode ? "Failed to update ticket." : "Failed to create ticket.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTicket) {
    return (
      <div className='flex justify-center items-center h-64 text-gray-500'>
        Loading ticket data...
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <div className='flex justify-between items-center border-b pb-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>
            {isEditMode ? `Edit Ticket #${id}` : "Create New Ticket"}
          </h2>
          <p className='text-sm text-gray-500'>
            {isEditMode
              ? "Update your ticket details below."
              : "Fill in the information to submit a support request."}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className='px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold'
        >
          Cancel
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5'
      >
        <div>
          <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
            Subject
          </label>
          <input
            type='text'
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder='Enter ticket subject...'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label className='block text-xs font-semibold text-gray-700 uppercase mb-1'>
            Description
          </label>
          <textarea
            rows='4'
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Describe your issue in detail...'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          />
        </div>

        {/* Closed Field (Boolean Radio Buttons) - Shown ONLY in Edit Mode */}
        {isEditMode && (
          <div>
            <label className='block text-xs font-semibold text-gray-700 uppercase mb-2'>
              Closed Status
            </label>
            <div className='flex items-center gap-6'>
              <label className='flex items-center gap-2 text-sm text-gray-700 cursor-pointer'>
                <input
                  type='radio'
                  name='closed'
                  checked={closed === true}
                  onChange={() => setClosed(true)}
                  className='text-blue-600 focus:ring-blue-500'
                />
                True (Closed)
              </label>
              <label className='flex items-center gap-2 text-sm text-gray-700 cursor-pointer'>
                <input
                  type='radio'
                  name='closed'
                  checked={closed === false}
                  onChange={() => setClosed(false)}
                  className='text-blue-600 focus:ring-blue-500'
                />
                False (Open/Active)
              </label>
            </div>
          </div>
        )}

        <div className='flex justify-end gap-3 pt-4 border-t'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={loading}
            className='px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors'
          >
            {loading ? "Saving..." : isEditMode ? "Update Ticket" : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
