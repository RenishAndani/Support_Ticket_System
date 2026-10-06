import {
  getMyTicketsService,
  createTicketService,
  updateTicketService,
  ticketCustomer,
  getTicketByIdService,
  fillTicketService,
  deleteTicketService,
  getDashBoardService,
} from "../services/user.service.js";

import { addCommentService, getCommentByTicketService } from "../services/staff.service.js";

import { newTicketSchema, updateSchema } from "../validators/user.validator.js";

export const getMyTickets = async (req, res, next) => {
  try {
    const userid = req.user.userid;

    const { status } = req.query;

    const myTickets = await getMyTicketsService(userid, status);

    res.json(myTickets);
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const isValid = await ticketCustomer(id, req.user.userid);

    if (!isValid) {
      return res.status(404).json({ message: "ticket not found" });
    }

    if (isValid === "NO") {
      return res.status(401).json({ message: "you are not authorize for see this ticket" });
    }

    const result = await getTicketByIdService(id);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const fillTicket = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await fillTicketService(id);

    res.json(result);
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

export const updateTicket = async (req, res, next) => {
  try {
    const id = req.params.id;

    const result = updateSchema.safeParse(req.body);

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

    const isValid = await ticketCustomer(id, req.user.userid);

    if (!isValid) {
      return res.status(404).json({ message: "ticket not found" });
    }

    if (isValid === "NO") {
      return res.status(401).json({ message: "you are not authorize for update this tcicket" });
    }

    const update = await updateTicketService(id, validatedData);

    res.json({ count: update.rowCount, message: "update successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteTicket = async (req, res, next) => {
  try {
    console.log("inside delta");

    const id = req.params.id;

    const isValid = await ticketCustomer(id, req.user.userid);

    if (!isValid) {
      return res.status(404).json({ message: "ticket not found" });
    }

    if (isValid === "NO") {
      return res.status(401).json({ message: "you are not authorize for update this tcicket" });
    }

    const result = await deleteTicketService(id);

    res.json({ count: result.rowCount, message: "delete ticket successfully" });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  const id = req.params.id;

  const isValid = await ticketCustomer(id, req.user.userid);

  if (!isValid) {
    return res.status(404).json({ message: "ticket not found" });
  }

  if (isValid === "NO") {
    return res.status(401).json({ message: "you are not authorize for update this tcicket" });
  }

  const userid = req.user.userid;

  const message = req.body.message;

  if (!message) {
    return res.status(400).json({ message: "please provide message" });
  }

  const result = await addCommentService(id, userid, message);

  res.json({ count: result.rowCount, message: "comment successfully" });
};

export const getComment = async (req, res, next) => {
  const id = req.params.id;

  const isValid = await ticketCustomer(id, req.user.userid);

  if (!isValid) {
    return res.status(404).json({ message: "ticket not found" });
  }

  if (isValid === "NO") {
    return res.status(401).json({ message: "you are not authorize for update this tcicket" });
  }

  const comments = await getCommentByTicketService(id);

  res.status(200).json(comments);
};

// DASHBOARD

export const getDashBoard = async (req, res, next) => {
  try {
    const result = await getDashBoardService(req.user.userid);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
