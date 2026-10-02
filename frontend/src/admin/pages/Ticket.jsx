import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const Tickets = () => {
  //==========FOR COMMENT=================
  // Add Comment Modal States
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentTicketId, setCommentTicketId] = useState(null);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  // ========================

  //=========FOR SHOW COMMENT==============
  // Show Comments Modal States
  const [isCommentsListOpen, setIsCommentsListOpen] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsTicketId, setCommentsTicketId] = useState(null);
  // =======================================

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Status Filter State
  const [currentStatus, setCurrentStatus] = useState("open");

  // Modal States
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Allowed statuses
  const statusOptions = [
    { label: "Open", value: "open" },
    { label: "In Progress", value: "in_progress" },
    { label: "Waiting for User", value: "waiting_for_user" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
  ];

  // Fetch tickets whenever currentStatus changes
  useEffect(() => {
    fetchTicketsByStatus(currentStatus);
  }, [currentStatus]);

  // Handle Add Ticket Button Click
  const handleAddTicketClick = () => {
    navigate("/admin/add-ticket");
  };

  const fetchTicketsByStatus = async (status) => {
    try {
      setLoading(true);
      // GET /admin/tickets with query parameter status
      const response = await api.get(`/admin/tickets`, {
        params: { status },
      });
      setTickets(response.data.tickets || response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
      setError("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Detail Button Click: GET /admin/tickets/:id
  const handleDetailClick = async (ticketId) => {
    console.log(ticketId);

    try {
      const response = await api.get(`/admin/tickets/${ticketId}`);
      console.log(response);

      setSelectedTicket(response.data.ticket || response.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error("Failed to fetch ticket details:", err);
      alert("Could not load ticket details.");
    }
  };

  // Handle Edit Button Click: GET details & open form
  const handleEditClick = async (ticketId) => {
    try {
      navigate(`/admin/edit-ticket/${ticketId}`);
    } catch (err) {
      console.error("Failed to load ticket for editing:", err);
      alert("Could not load ticket data.");
    }
  };

  // Handle Delete: DELETE /admin/tickets/:id
  const handleDelete = async (ticketId) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        await api.delete(`/admin/tickets/${ticketId}`);
        fetchTicketsByStatus(currentStatus);
      } catch (err) {
        console.error("Failed to delete ticket:", err);
        alert("Failed to delete ticket.");
      }
    }
  };

  // Handle Add Comment Button Click: Open modal
  const handleAddCommentClick = (ticketId) => {
    setCommentTicketId(ticketId);
    setCommentMessage("");
    setIsCommentModalOpen(true);
  };

  // Handle Submit Comment: POST request
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      setCommentSubmitting(true);
      await api.post(`/admin/ticket-comment/${commentTicketId}`, {
        message: commentMessage,
      });
      setIsCommentModalOpen(false);
      setCommentMessage("");
      alert("Comment added successfully!");
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Handle Show Comment Button Click
  // Handle Show Comment Button Click: Fetch comments & open modal
  const handleShowCommentClick = async (ticketId) => {
    setCommentsTicketId(ticketId);
    setIsCommentsListOpen(true);
    setCommentsLoading(true);
    try {
      const response = await api.get(`/admin/ticket-comment/${ticketId}`);
      console.log(response);

      setCommentsList(response.data.comments || response.data || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      alert("Could not load comments.");
      setCommentsList([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Helper badge color mapper for statuses
  const getStatusBadge = (status) => {
    const styles = {
      open: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      waiting_for_user: "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className='space-y-6'>
      {/* Header & Status Filter Selector */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>Tickets Management</h2>
          <p className='text-sm text-gray-500'>Filter and manage customer support requests.</p>
        </div>

        {/* Status Selection Tabs/Dropdown */}
        <div className='flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pb-2 sm:pb-0'>
          <button
            onClick={handleAddTicketClick}
            className='px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm whitespace-nowrap'
          >
            + Add Ticket
          </button>
          <div className='flex items-center gap-2 overflow-x-auto'>
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCurrentStatus(opt.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  currentStatus === opt.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='flex justify-center items-center h-48 text-gray-500'>
            Loading tickets...
          </div>
        ) : error ? (
          <div className='bg-red-50 text-red-600 p-4 m-4 rounded-md'>{error}</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 text-left'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase'>
                    Ticket ID
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase'>
                    Title / Subject
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => {
                    const tid = ticket.ticketid || ticket.id;
                    return (
                      <tr key={tid} className='hover:bg-gray-50 transition-colors'>
                        <td className='px-6 py-4 text-sm font-medium text-gray-900'>{tid}</td>
                        <td className='px-6 py-4 text-sm text-gray-700 font-medium'>
                          {ticket.title || ticket.subject}
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase ${getStatusBadge(ticket.status)}`}
                          >
                            {ticket.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-right text-sm space-x-2'>
                          <button
                            onClick={() => handleDetailClick(tid)}
                            className='text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors'
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleAddCommentClick(tid)}
                            className='text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors'
                          >
                            Add Comment
                          </button>
                          <button
                            onClick={() => handleShowCommentClick(tid)}
                            className='text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded transition-colors'
                          >
                            Show Comment
                          </button>
                          <button
                            onClick={() => handleEditClick(tid)}
                            className='text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tid)}
                            className='text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors'
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan='4' className='px-6 py-8 text-center text-gray-500'>
                      No tickets found with status:{" "}
                      <strong className='capitalize'>{currentStatus.replace(/_/g, " ")}</strong>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {isDetailOpen && selectedTicket && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 px-4'>
          <div className='w-full max-w-lg bg-white p-6 rounded-xl shadow-xl space-y-4'>
            <div className='flex justify-between items-center pb-3 border-b'>
              <h3 className='text-lg font-bold text-gray-800'>
                Ticket Details #{selectedTicket.id || selectedTicket.ticketid}
              </h3>
              <button
                onClick={() => setIsDetailOpen(false)}
                className='text-gray-400 hover:text-gray-600 font-bold text-xl'
              >
                &times;
              </button>
            </div>
            <div className='space-y-3 text-sm text-gray-700 max-h-[70vh] overflow-y-auto pr-2'>
              <div className='grid grid-cols-2 gap-3'>
                <p>
                  <strong>ID:</strong> {selectedTicket.id || selectedTicket.ticketid}
                </p>
                <p>
                  <strong>Priority:</strong>{" "}
                  <span className='font-semibold text-gray-900'>
                    {selectedTicket.priority || "N/A"}
                  </span>
                </p>
              </div>

              <p>
                <strong>Subject:</strong> {selectedTicket.subject || selectedTicket.title}
              </p>

              <div className='grid grid-cols-2 gap-3'>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${getStatusBadge(selectedTicket.status)}`}
                  >
                    {selectedTicket.status?.replace(/_/g, " ")}
                  </span>
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {selectedTicket.createdAt
                    ? new Date(selectedTicket.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <p>
                  <strong>Customer Name:</strong> {selectedTicket.customerName || "N/A"}(
                  {selectedTicket.customerId})
                </p>
                <p>
                  <strong>Assigned Staff:</strong> {selectedTicket.staffName || "Unassigned"}(
                  {selectedTicket.assignedTo})
                </p>
              </div>

              <div>
                <strong>Description:</strong>
                <p className='mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 whitespace-pre-wrap'>
                  {selectedTicket.description || "No description provided."}
                </p>
              </div>
            </div>
            <div className='flex justify-end pt-3 border-t'>
              <button
                onClick={() => setIsDetailOpen(false)}
                className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Comment Modal */}
      {isCommentModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 px-4'>
          <div className='w-full max-w-md bg-white p-6 rounded-xl shadow-xl space-y-4'>
            <div className='flex justify-between items-center pb-3 border-b'>
              <h3 className='text-lg font-bold text-gray-800'>
                Add Comment for Ticket #{commentTicketId}
              </h3>
              <button
                onClick={() => setIsCommentModalOpen(false)}
                className='text-gray-400 hover:text-gray-600 font-bold text-xl'
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCommentSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Message</label>
                <textarea
                  rows='4'
                  required
                  value={commentMessage}
                  onChange={(e) => setCommentMessage(e.target.value)}
                  placeholder='Enter your comment here...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                />
              </div>
              <div className='flex justify-end gap-2 pt-3 border-t'>
                <button
                  type='button'
                  onClick={() => setIsCommentModalOpen(false)}
                  className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={commentSubmitting}
                  className='px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 shadow-sm disabled:opacity-50'
                >
                  {commentSubmitting ? "Submitting..." : "Add Comment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show Comments Modal */}
      {isCommentsListOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 px-4'>
          <div className='w-full max-w-lg bg-white p-6 rounded-xl shadow-xl space-y-4'>
            <div className='flex justify-between items-center pb-3 border-b'>
              <h3 className='text-lg font-bold text-gray-800'>
                Comments for Ticket #{commentsTicketId}
              </h3>
              <button
                onClick={() => setIsCommentsListOpen(false)}
                className='text-gray-400 hover:text-gray-600 font-bold text-xl'
              >
                &times;
              </button>
            </div>

            <div className='max-h-[60vh] overflow-y-auto space-y-3 pr-1'>
              {commentsLoading ? (
                <div className='text-center py-8 text-gray-500'>Loading comments...</div>
              ) : commentsList.length > 0 ? (
                commentsList.map((c, index) => (
                  <div
                    key={c.id || index}
                    className='p-3.5 bg-gray-50 rounded-lg border border-gray-200 space-y-2'
                  >
                    <p className='text-sm text-gray-800 whitespace-pre-wrap'>{c.message}</p>
                    <div className='flex justify-between items-center text-xs text-gray-500 pt-1 border-t border-gray-100'>
                      <span className='font-medium text-gray-700'>
                        {c.name || `User #${c.userid}`}
                      </span>
                      <span>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  No comments found for this ticket.
                </div>
              )}
            </div>

            <div className='flex justify-end pt-3 border-t'>
              <button
                onClick={() => setIsCommentsListOpen(false)}
                className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
