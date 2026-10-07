import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const AssignedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Status Filter State
  const [currentStatus, setCurrentStatus] = useState("open");

  // Track modified status values per ticket before saving
  const [selectedStatuses, setSelectedStatuses] = useState({});

  // Comment Modal & Chat States
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentTicketId, setCommentTicketId] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentMessage, setNewCommentMessage] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Detail Modal States
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Allowed statuses
  const statusOptions = [
    { label: "Open", value: "open" },
    { label: "In Progress", value: "in_progress" },
    { label: "Waiting for User", value: "waiting_for_user" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
  ];
  const statusFilterOptions = [{ label: "All", value: "all" }, ...statusOptions];

  // Fetch tickets whenever currentStatus changes
  useEffect(() => {
    fetchAssignedTicketsByStatus(currentStatus);
  }, [currentStatus]);

  const fetchAssignedTicketsByStatus = async (status) => {
    try {
      setLoading(true);
      const response = await api.get(`/staff/tickets`, {
        params: status === "all" ? {} : { status },
      });
      setTickets(response.data.tickets || response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch assigned tickets:", err);
      setError("Failed to load assigned tickets.");
    } finally {
      setLoading(false);
    }
  };

  // Handle dropdown value change locally
  const handleStatusSelectChange = (ticketId, value) => {
    setSelectedStatuses((prev) => ({ ...prev, [ticketId]: value }));
  };

  // Handle Save button click to call API
  const handleStatusChange = async (ticketId, originalStatus) => {
    const newStatus = selectedStatuses[ticketId] || originalStatus;

    try {
      await api.patch(`/staff/tickets/status/${ticketId}`, {
        status: newStatus,
      });

      // Re-fetch tickets and clear local selection for this ticket
      fetchAssignedTicketsByStatus(currentStatus);
      setSelectedStatuses((prev) => {
        const updated = { ...prev };
        delete updated[ticketId];
        return updated;
      });

      alert("Ticket status updated successfully!");
    } catch (err) {
      console.error("Failed to update ticket status:", err);
      alert("Failed to update status.");
    }
  };

  // Handle Detail Button Click: GET /staff/tickets/:id
  const handleDetailClick = async (ticketId) => {
    try {
      const response = await api.get(`/staff/tickets/${ticketId}`);
      setSelectedTicket(response.data.ticket || response.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error("Failed to fetch ticket details:", err);
      alert("Could not load ticket details.");
    }
  };

  // Handle Add Comment Button Click: Open modal & fetch comments
  const handleAddCommentClick = async (ticketId) => {
    setCommentTicketId(ticketId);
    setIsCommentModalOpen(true);
    setCommentsLoading(true);
    setNewCommentMessage("");
    try {
      const response = await api.get(`/staff/ticket-comment/${ticketId}`);
      setCommentsList(response.data.comments || response.data || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setCommentsList([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Handle Submit New Comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentMessage.trim()) return;

    try {
      setCommentSubmitting(true);
      await api.post(`/ticket-comment/${commentTicketId}`, {
        message: newCommentMessage,
      });

      // Refresh comments list after successful post
      const response = await api.get(`/staff/ticket-comment/${commentTicketId}`);
      setCommentsList(response.data.comments || response.data || []);
      setNewCommentMessage("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment.");
    } finally {
      setCommentSubmitting(false);
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

  // Helper badge color mapper for priorities
  const getPriorityBadge = (priority) => {
    const styles = {
      Low: "bg-gray-100 text-gray-700",
      Medium: "bg-orange-100 text-orange-700",
      High: "bg-red-100 text-red-700",
    };
    return styles[priority] || "bg-gray-100 text-gray-700";
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredTickets = tickets.filter((ticket) =>
    Object.values(ticket).some(
      (value) => value != null && String(value).toLowerCase().includes(normalizedSearchTerm),
    ),
  );

  return (
    <div className='space-y-6'>
      {/* Header & Status Filter Selector */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>Assigned Tickets</h2>
          <p className='text-sm text-gray-500'>
            Manage and update support tickets assigned to you.
          </p>
        </div>

        {/* Status Selection Tabs */}
        <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pb-2 sm:pb-0 overflow-x-auto'>
          {statusFilterOptions.map((opt) => (
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

      {/* Tickets Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='flex justify-center items-center h-48 text-gray-500'>
            Loading assigned tickets...
          </div>
        ) : error ? (
          <div className='bg-red-50 text-red-600 p-4 m-4 rounded-md'>{error}</div>
        ) : (
          <>
            <div className='p-4 border-b border-gray-200'>
              <label
                htmlFor='assigned-ticket-search'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Search tickets
              </label>
              <input
                id='assigned-ticket-search'
                type='search'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder='Search any ticket field...'
                className='w-full sm:max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              />
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[1700px] table-fixed divide-y divide-gray-200 text-left'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='w-20 px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                      Ticket ID
                    </th>
                    <th className='w-36 px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                      Subject
                    </th>
                    <th className='w-56 px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                      Description
                    </th>
                    <th className='w-28 px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                      Priority
                    </th>
                    <th className='w-48 px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                      Status (Update)
                    </th>
                    <th className='w-32 px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                      Staff Name
                    </th>
                    <th className='w-32 px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                      Staff ID
                    </th>
                    <th className='w-36 px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                      Customer Name
                    </th>
                    <th className='w-36 px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                      Customer ID
                    </th>
                    <th className='w-48 px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                      Created At
                    </th>
                    <th className='w-48 px-4 py-3 text-xs font-semibold text-gray-500 uppercase'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => {
                      const tid = ticket.id ?? ticket.ticketid;
                      return (
                        <tr key={tid} className='hover:bg-gray-50 transition-colors'>
                          <td className='px-4 py-4 text-sm font-medium text-gray-900'>{tid}</td>
                          <td className='px-4 py-4 text-sm font-medium text-gray-900 break-words'>
                            {ticket.subject || ticket.title || "N/A"}
                          </td>
                          <td className='px-4 py-4 text-sm text-gray-700 whitespace-pre-wrap break-words'>
                            {ticket.description || "N/A"}
                          </td>
                          <td className='px-4 py-4 text-sm'>
                            <span
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(
                                ticket.priority,
                              )}`}
                            >
                              {ticket.priority || "Medium"}
                            </span>
                          </td>
                          <td className='px-4 py-4 text-sm'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <select
                                value={
                                  selectedStatuses[tid] !== undefined
                                    ? selectedStatuses[tid]
                                    : ticket.status
                                }
                                onChange={(e) => handleStatusSelectChange(tid, e.target.value)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusBadge(
                                  selectedStatuses[tid] !== undefined
                                    ? selectedStatuses[tid]
                                    : ticket.status,
                                )}`}
                              >
                                {statusOptions.map((opt) => (
                                  <option
                                    key={opt.value}
                                    value={opt.value}
                                    className='bg-white text-gray-800'
                                  >
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleStatusChange(tid, ticket.status)}
                                disabled={
                                  selectedStatuses[tid] === undefined ||
                                  selectedStatuses[tid] === ticket.status
                                }
                                className='px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded text-xs font-medium transition-colors whitespace-nowrap'
                              >
                                Save
                              </button>
                            </div>
                          </td>
                          <td className='px-4 py-4 text-sm text-gray-700 break-words'>
                            {ticket.staffName || "Unassigned"}
                          </td>
                          <td className='px-4 py-4 text-sm text-gray-700 break-words'>
                            {ticket.staff_id || "N/A"}
                          </td>
                          <td className='px-4 py-4 text-sm text-gray-700 break-words'>
                            {ticket.customerName || "N/A"}
                          </td>
                          <td className='px-4 py-4 text-sm text-gray-700 break-words'>
                            {ticket.customer_id || "N/A"}
                          </td>
                          <td className='px-4 py-4 text-sm text-gray-700'>
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "N/A"}
                          </td>
                          <td className='px-4 py-4 text-sm'>
                            <div className='flex flex-wrap gap-2'>
                              <button
                                onClick={() => handleDetailClick(tid)}
                                className='whitespace-nowrap text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded transition-colors font-medium text-xs'
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => handleAddCommentClick(tid)}
                                className='whitespace-nowrap text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded transition-colors font-medium text-xs'
                              >
                                Add Comment
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan='11' className='px-6 py-8 text-center text-gray-500'>
                        {normalizedSearchTerm ? (
                          "No assigned tickets match your search."
                        ) : (
                          <>
                            No assigned tickets found with status:{" "}
                            <strong className='capitalize'>
                              {currentStatus === "all" ? "all" : currentStatus.replace(/_/g, " ")}
                            </strong>
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {/* Chat-style Comment Modal */}
      {isCommentModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'>
          <div className='w-full max-w-2xl bg-white rounded-xl shadow-xl flex flex-col h-[80vh] max-h-[700px] overflow-hidden'>
            {/* Modal Header */}
            <div className='flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50'>
              <div>
                <h3 className='text-lg font-bold text-gray-800'>
                  Ticket Conversation #{commentTicketId}
                </h3>
                <p className='text-xs text-gray-500'>View comment history and add new messages</p>
              </div>
              <button
                onClick={() => setIsCommentModalOpen(false)}
                className='text-gray-400 hover:text-gray-600 font-bold text-xl'
              >
                &times;
              </button>
            </div>

            {/* Comments Message List (Chat Body) */}
            <div className='flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50'>
              {commentsLoading ? (
                <div className='flex justify-center items-center h-full text-gray-500'>
                  Loading comments...
                </div>
              ) : commentsList.length > 0 ? (
                commentsList.map((c, index) => (
                  <div
                    key={c.id || index}
                    className='p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-2'
                  >
                    <div className='flex justify-between items-center text-xs text-gray-500 border-b border-gray-100 pb-1.5'>
                      <span className='font-semibold text-gray-800'>
                        {c.name || `User #${c.userid}`}
                      </span>
                      <span>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</span>
                    </div>
                    <p className='text-sm text-gray-700 whitespace-pre-wrap'>{c.message}</p>
                  </div>
                ))
              ) : (
                <div className='flex justify-center items-center h-full text-gray-500'>
                  No comments found yet. Start the conversation below!
                </div>
              )}
            </div>

            {/* Add Comment Input Footer */}
            <form
              onSubmit={handleCommentSubmit}
              className='p-4 border-t border-gray-200 bg-white flex gap-3 items-end'
            >
              <div className='flex-1'>
                <textarea
                  rows='2'
                  required
                  value={newCommentMessage}
                  onChange={(e) => setNewCommentMessage(e.target.value)}
                  placeholder='Type your message here...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm resize-none'
                />
              </div>
              <button
                type='submit'
                disabled={commentSubmitting}
                className='px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm disabled:opacity-50 h-[42px] whitespace-nowrap'
              >
                {commentSubmitting ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {isDetailOpen && selectedTicket && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'>
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
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${getStatusBadge(
                      selectedTicket.status,
                    )}`}
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
                  <strong>Customer Name:</strong> {selectedTicket.customerName || "N/A"} (
                  {selectedTicket.customer_id || selectedTicket.customerId})
                </p>
                <p>
                  <strong>Assigned Staff:</strong> {selectedTicket.staffName || "Unassigned"} (
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
    </div>
  );
};

export default AssignedTickets;
