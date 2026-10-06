import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Status Filter State
  const [currentStatus, setCurrentStatus] = useState("all");

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Comment Modal State
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedTicketCommentId, setSelectedTicketCommentId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newCommentMessage, setNewCommentMessage] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Allowed status filter options
  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Open", value: "open" },
    { label: "In Progress", value: "in_progress" },
    { label: "Waiting for User", value: "waiting_for_user" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
  ];

  useEffect(() => {
    fetchMyTickets(currentStatus);
  }, [currentStatus]);

  const fetchMyTickets = async (status) => {
    try {
      setLoading(true);
      const params = status !== "all" ? { status } : {};
      const response = await api.get("/users/my-tickets", { params });
      setTickets(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch user tickets:", err);
      setError("Failed to load your tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicketClick = () => {
    navigate("/user/ticket-form");
  };

  const handleEditClick = (ticketId) => {
    navigate(`/user/ticket-form/${ticketId}`);
  };

  const handleDetailClick = async (ticketId) => {
    try {
      setIsDetailModalOpen(true);
      setDetailLoading(true);
      const response = await api.get(`/users/ticket/${ticketId}`);
      setSelectedTicketDetail(response.data.ticket || response.data);
    } catch (err) {
      console.error("Failed to fetch ticket details:", err);
      alert("Failed to load ticket details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteClick = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      console.log(ticketId);

      await api.delete(`/users/ticket/${ticketId}`);
      // Filter out the deleted ticket from the local state
      setTickets((prevTickets) => prevTickets.filter((ticket) => ticket.id !== ticketId));
      alert("Ticket deleted successfully!");
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      alert("Failed to delete ticket.");
    }
  };

  const handleAddCommentClick = async (ticketId) => {
    setSelectedTicketCommentId(ticketId);
    setIsCommentModalOpen(true);
    try {
      setCommentsLoading(true);
      const response = await api.get(`/users/ticket-comment/${ticketId}`);
      setComments(response.data.comments || response.data || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      alert("Failed to load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newCommentMessage.trim()) return;
    try {
      setCommentSubmitting(true);
      await api.post(`/users/ticket-comment/${selectedTicketCommentId}`, {
        message: newCommentMessage,
      });
      setNewCommentMessage("");
      // Refresh comments list
      const response = await api.get(`/users/ticket-comment/${selectedTicketCommentId}`);
      setComments(response.data.comments || response.data || []);
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to send comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

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

  const getPriorityBadge = (priority) => {
    const styles = {
      Low: "bg-gray-100 text-gray-700",
      Medium: "bg-orange-100 text-orange-700",
      High: "bg-red-100 text-red-700",
    };
    return styles[priority] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className='space-y-6 p-4 sm:p-6 max-w-7xl mx-auto'>
      {/* Header & Add Ticket Button */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl font-bold text-gray-800'>My Support Tickets</h2>
          <p className='text-sm text-gray-500'>
            View and manage all the support tickets you have submitted.
          </p>
        </div>

        <button
          onClick={handleAddTicketClick}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 4v16m8-8H4' />
          </svg>
          Add Ticket
        </button>
      </div>

      {/* Status Selection Tabs */}
      <div className='flex flex-wrap items-center gap-2 pb-2 overflow-x-auto'>
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

      {/* Tickets Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {loading ? (
          <div className='flex justify-center items-center h-48 text-gray-500'>
            Loading your tickets...
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
                    Subject / Description
                  </th>
                  <th className='px-6 py-3 text-xs font-semibold text-gray-500 uppercase'>
                    Priority
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
                    const tid = ticket.id;
                    return (
                      <tr key={tid} className='hover:bg-gray-50 transition-colors'>
                        <td className='px-6 py-4 text-sm font-medium text-gray-900'>#{tid}</td>
                        <td className='px-6 py-4 text-sm text-gray-700 font-medium'>
                          <div className='font-semibold text-gray-900'>{ticket.subject}</div>
                          <div className='text-xs text-gray-500 line-clamp-1 mt-0.5'>
                            {ticket.description}
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(
                              ticket.priority,
                            )}`}
                          >
                            {ticket.priority || "Medium"}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-sm'>
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wider ${getStatusBadge(
                              ticket.status,
                            )}`}
                          >
                            {ticket.status?.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-right text-sm space-x-2 whitespace-nowrap'>
                          <button
                            onClick={() => handleAddCommentClick(tid)}
                            className='text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors font-medium text-xs'
                          >
                            Add Comments
                          </button>
                          <button
                            onClick={() => handleEditClick(tid)}
                            className='text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors font-medium text-xs'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDetailClick(tid)}
                            className='text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors font-medium text-xs'
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleDeleteClick(tid)}
                            className='text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors font-medium text-xs'
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan='5' className='px-6 py-12 text-center text-gray-500'>
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

      {/* Ticket Detail Modal */}
      {isDetailModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='bg-white rounded-xl shadow-lg max-w-lg w-full overflow-hidden'>
            <div className='flex justify-between items-center px-6 py-4 border-b border-gray-200'>
              <h3 className='text-lg font-bold text-gray-800'>
                Ticket Details {selectedTicketDetail?.id ? `#${selectedTicketDetail.id}` : ""}
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className='text-gray-400 hover:text-gray-600 font-bold text-xl'
              >
                &times;
              </button>
            </div>

            <div className='p-6 max-h-[80vh] overflow-y-auto'>
              {detailLoading ? (
                <div className='flex justify-center items-center py-12 text-gray-500'>
                  Loading details...
                </div>
              ) : selectedTicketDetail ? (
                <div className='space-y-4 text-sm'>
                  <div>
                    <span className='text-xs font-semibold text-gray-500 uppercase block'>
                      Subject
                    </span>
                    <p className='text-gray-800 font-semibold text-base mt-0.5'>
                      {selectedTicketDetail.subject}
                    </p>
                  </div>

                  <div>
                    <span className='text-xs font-semibold text-gray-500 uppercase block'>
                      Description
                    </span>
                    <p className='text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-0.5 whitespace-pre-wrap'>
                      {selectedTicketDetail.description}
                    </p>
                  </div>

                  <div className='grid grid-cols-2 gap-4 pt-2 border-t border-gray-100'>
                    <div>
                      <span className='text-xs font-semibold text-gray-500 uppercase block'>
                        Status
                      </span>
                      <span className='inline-block mt-1 px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wider bg-gray-100 text-gray-800'>
                        {selectedTicketDetail.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div>
                      <span className='text-xs font-semibold text-gray-500 uppercase block'>
                        Priority
                      </span>
                      <span className='inline-block mt-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700'>
                        {selectedTicketDetail.priority || "Medium"}
                      </span>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 pt-2 border-t border-gray-100'>
                    <div>
                      <span className='text-xs font-semibold text-gray-500 uppercase block'>
                        Customer Name
                      </span>
                      <p className='text-gray-800 font-medium mt-0.5'>
                        {selectedTicketDetail.customerName || "-"}
                      </p>
                    </div>
                    <div>
                      <span className='text-xs font-semibold text-gray-500 uppercase block'>
                        Staff Name
                      </span>
                      <p className='text-gray-800 font-medium mt-0.5'>
                        {selectedTicketDetail.staffName || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <div className='pt-2 border-t border-gray-100'>
                    <span className='text-xs font-semibold text-gray-500 uppercase block'>
                      Created At
                    </span>
                    <p className='text-gray-600 mt-0.5'>
                      {selectedTicketDetail.createdAt
                        ? new Date(selectedTicketDetail.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className='text-center py-8 text-red-500'>Failed to load ticket info.</div>
              )}
            </div>

            <div className='flex justify-end px-6 py-3 bg-gray-50 border-t border-gray-200'>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className='px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}

      {/* Ticket Comments Modal */}
      {isCommentModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='bg-white rounded-xl shadow-lg max-w-lg w-full flex flex-col h-[80vh] overflow-hidden'>
            <div className='flex justify-between items-center px-6 py-4 border-b border-gray-200'>
              <h3 className='text-lg font-bold text-gray-800'>
                Ticket Comments #{selectedTicketCommentId}
              </h3>
              <button
                onClick={() => setIsCommentModalOpen(false)}
                className='text-gray-400 hover:text-gray-600 font-bold text-xl'
              >
                &times;
              </button>
            </div>

            {/* Chat Body */}
            <div className='flex-1 p-6 overflow-y-auto space-y-3 bg-gray-50'>
              {commentsLoading ? (
                <div className='flex justify-center items-center py-12 text-gray-500'>
                  Loading comments...
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div
                    key={index}
                    className='bg-white p-3 rounded-lg shadow-sm border border-gray-200'
                  >
                    <div className='flex justify-between items-center mb-1'>
                      <span className='font-semibold text-xs text-blue-600'>
                        {comment.name || "User"}
                      </span>
                      <span className='text-[10px] text-gray-400'>
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                      </span>
                    </div>
                    <p className='text-sm text-gray-700 whitespace-pre-wrap'>{comment.message}</p>
                  </div>
                ))
              ) : (
                <div className='text-center py-12 text-gray-400'>
                  No comments yet. Start the conversation below!
                </div>
              )}
            </div>

            {/* Message Input Footer */}
            <form
              onSubmit={handleSendComment}
              className='p-4 bg-white border-t border-gray-200 flex gap-2'
            >
              <input
                type='text'
                value={newCommentMessage}
                onChange={(e) => setNewCommentMessage(e.target.value)}
                placeholder='Type your message...'
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                disabled={commentSubmitting}
              />
              <button
                type='submit'
                disabled={commentSubmitting || !newCommentMessage.trim()}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap'
              >
                {commentSubmitting ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
