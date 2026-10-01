import {
  changeStatusService,
  addCommentService,
  getTicketByIdService,
  getCommentByTicketService,
} from "../services/staff.service.js";

export const changeStatus = async (req, res, next) => {
  try {
    const tktid = req.params.tktid;

    const status = req.body.status;

    if (!status) {
      return res.status(400).json({ message: "please give status" });
    }

    const statuses = ["open", "in_progress", "waiting_for_user", "resolved", "closed"];

    if (!statuses.includes(status)) {
      return res.json({ message: "please send valid status" });
    }

    const result = await changeStatusService(tktid, status);

    if (!result) {
      return res.status(404).json({ message: "ticket not found" });
    }

    console.log(result);

    if (req.user.userid !== result.assignedTo) {
      return res.status(401).json({ message: "you are not authorize to change" });
    }

    res.json({ count: result.rowCount, message: "change successfully" });
  } catch (error) {
    next(error);
  }
};

// ticket commetns

export const addComment = async (req, res, next) => {
  try {
    const tktid = req.params.tktid;

    const userid = req.user.userid;

    const message = req.body.message;

    const ticket = await getTicketByIdService(tktid);

    if (!ticket) {
      return res.status(404).json({ message: "ticket not found" });
    }

    if (ticket.assignedTo !== req.user.userid) {
      return res.status(401).json({ message: "You are not authorize to add comment" });
    }

    if (!message) {
      return res.status(400).json({ message: "please provide message" });
    }

    const result = await addCommentService(tktid, userid, message);

    res.json({ count: result.rowCount, message: "comment successfully" });
  } catch (error) {
    next(error);
  }
};

export const getCommentByTicket = async (req, res, next) => {
  try {
    const id = req.params.id;

    const ticket = await getTicketByIdService(id);

    if (!ticket) {
      return res.status(404).json({ message: "ticket not found" });
    }

    if (ticket.assignedTo !== req.user.userid) {
      return res.status(401).json({ message: "You are not authorize to see comment" });
    }

    const comments = await getCommentByTicketService(id);

    res.status(200).json({ data: comments });
  } catch (error) {
    next(error);
  }
};
