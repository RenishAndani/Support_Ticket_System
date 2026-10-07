import {
  getAllUserService,
  getUserByIdService,
  createUserService,
  deleteUserService,
  assignStaffService,
  getFilteredTickets,
  getTicketByIdService,
  dropdownStaffService,
  changeStatusService,
  addCommentService,
  getCommentByTicketService,
  updateUserService,
  getAllStaffService,
  deleteTicketService,
  updateTicketService,
  createTicketService,
  getDashBoardService,
} from "../services/admin.service.js";
import { newUserSchema, updateUserSchema, newTicketSchema } from "../validators/admin.validator.js";

export const getAllUser = async (req, res, next) => {
  try {
    const data = await getAllUserService();

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getAllStaff = async (req, res, next) => {
  try {
    const data = await getAllStaffService();

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;

    console.log(id);

    const data = await getUserByIdService(id);

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const data = newUserSchema.parse(req.body);

    const user = await createUserService(data);

    res.json({ rowCount: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.id;

    console.log(id);

    const result = await deleteUserService(id);

    res.json({ deleteCount: result.rowCount });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const id = req.params.id;

    const data = updateUserSchema.parse(req.body);

    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const updatedUser = await updateUserService(id, data);

    res.json({ count: updateUser.rowCount, message: "update User successfully" });
  } catch (error) {
    next(error);
  }
};

// tickets

export const getTickets = async (req, res, next) => {
  try {
    const { status, priority, search, isUnassigned, page, pageSize } = req.query;

    const tickets = await getFilteredTickets({
      status,
      priority,
      search,
      isUnassigned,
      page,
      pageSize,
    });

    res.status(200).json({
      success: true,
      count: tickets[0],
      tickets: tickets[1],
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const ticket = await getTicketByIdService(id);

    if (!ticket) {
      return res.status(404).json({ message: "ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req, res, next) => {
  try {
    const result = newTicketSchema.safeParse(req.body);

    if (!result.success) {
      // If not satisfied, return a 400 Bad Request with the error breakdown
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        // format() turns the complex Zod error into a clean, readable object map
        errors: result.error.format(),
      });
    }

    const validatedData = result.data;

    const ticket = await createTicketService({ customerId: req.user.userid, ...validatedData });

    res.json({ count: ticket.rowCount, message: "add ticket successfully" });
  } catch (error) {
    next(error);
  }
};

export const assignStaff = async (req, res, next) => {
  try {
    console.log("inside assign");

    const userid = req.params.userid;

    const data = await getUserByIdService(userid);

    if (!data) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (data.role === "user") {
      return res.status(400).json({ message: "User must be admin or staff" });
    }

    const tktid = req.params.tktid;

    const result = await assignStaffService(tktid, userid);

    if (!result) {
      res.status(404).json({ message: "ticket not found" });
    }

    return res.json({ count: result.rowCount, message: "assign successfully" });
  } catch (error) {
    next(error);
  }
};

export const changeStatus = async (req, res, next) => {
  try {
    const status = req.body.status;

    const tktid = req.params.tktid;

    const statuses = ["open", "in_progress", "waiting_for_user", "resolved", "closed"];

    if (!statuses.includes(status)) {
      return res.json({ message: "please send valid status" });
    }

    const result = await changeStatusService(tktid, status);

    if (!result) {
      res.status(404).json({ message: "ticket not found" });
    }

    return res.json({ count: result.rowCount, message: "change successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const id = req.params.id;

    console.log("hi id");

    console.log(id);

    const data = req.body;

    console.log("hi controller");

    console.log(data);

    const result = await updateTicketService(id, data);

    if (!result) {
      res.status(404).json({ message: "ticket not found" });
    }

    res.json({ count: result.rowCount, message: "update successfully" });
  } catch (error) {
    next(error);
  }
};

export const delteTicket = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);

    const result = await deleteTicketService(id);

    console.log(result);

    if (!result) {
      res.status(404).json({ message: "ticket not found" });
    }

    res.json({ count: result.rowCount, message: "delete successfully" });
  } catch (error) {
    next(error);
  }
};

// ticket comment

export const addComment = async (req, res, next) => {
  try {
    const tktid = req.params.tktid;

    const userid = req.user.userid;

    const message = req.body.message;

    if (!message) {
      return res.status(400).json({ message: "please provide message" });
    }

    const result = await addCommentService(tktid, userid, message);

    if (!result) {
      return res.status(404).json({ message: "ticket not found" });
    }

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

    const comments = await getCommentByTicketService(id);

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

// dropdown

export const dropdownStaff = async (req, res, next) => {
  try {
    const staff = await dropdownStaffService();

    res.json(staff);
  } catch (error) {
    next(error);
  }
};

// DASHBOARD

export const getDashBoard = async (req, res, next) => {
  try {
    const result = await getDashBoardService();

    res.json(result);
  } catch (error) {
    next(error);
  }
};
