import express from "express";
import { getUsers } from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getUsers);

export default router;
