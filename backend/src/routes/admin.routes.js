import express from "express";

import {
  getAllUser,
  getUserById,
  createUser,
  deleteUser,
  getTicketsByStatus,
  getTicketById,
  assignStaff,
  dropdownStaff,
  changeStatus,
  addComment,
  getCommentByTicket,
  updateUser,
  getAllStaff,
  delteTicket,
  updateTicket,
  createTicket,
  getDashBoard,
} from "../controllers/admin.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(protect);

router.use(authorize("admin"));

// users

router.get("/users", getAllUser);

router.get("/staff", getAllStaff);

router.post("/users", createUser);

router.get("/users/:id", getUserById);

router.delete("/users/:id", deleteUser);

router.put("/users/:id", updateUser);

// tickets

router.get("/tickets", getTicketsByStatus);

router.post("/tickets", createTicket);

router.get("/tickets/:id", getTicketById);

router.delete("/tickets/:id", delteTicket);

router.put("/tickets/:id", updateTicket);

router.patch("/tickets/changeStatus/:tktid", changeStatus);

router.patch("/tickets/assign/:tktid/:userid", assignStaff);

// ticket comment

router.post("/ticket-comment/:tktid", addComment);

router.get("/ticket-comment/:id", getCommentByTicket);

// dropdown

router.get("/dropdown/staff", dropdownStaff);

// DASHBOARD

router.get("/dashboard", getDashBoard);

export default router;
