import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import { authorize } from "../middleware/role.middleware.js";
import {
  addComment,
  changeStatus,
  getCommentByTicket,
  getAssignedTicket,
  getDetailTicketById,
} from "../controllers/staff.controller.js";

const router = express.Router();

router.use(protect);

router.use(authorize("staff"));

router.get("/tickets", getAssignedTicket);

router.get("/tickets/:id", getDetailTicketById);

router.patch("/tickets/status/:tktid", changeStatus);

// ticket comment

router.post("/ticket-comment/:tktid", addComment);

router.get("/ticket-comment/:id", getCommentByTicket);

export default router;
