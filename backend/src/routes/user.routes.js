import express from "express";
import {
  getMyTickets,
  createTicket,
  updateTicket,
  getTicketById,
  fillTicket,
  deleteTicket,
  addComment,
  getComment,
  getDashBoard,
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);

router.use(authorize("user"));

router.get("/my-tickets", getMyTickets);

router.post("/ticket", createTicket);

router.get("/ticket/:id", getTicketById);

router.get("/fill-ticket/:id", fillTicket);

router.put("/ticket/:id", updateTicket);

router.delete("/ticket/:id", deleteTicket);

// ticket comment

router.post("/ticket-comment/:id", addComment);

router.get("/ticket-comment/:id", getComment);

// dashboard

router.get("/dashboard", getDashBoard);

export default router;
