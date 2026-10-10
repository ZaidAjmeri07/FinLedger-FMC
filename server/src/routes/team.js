import express from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/roles.js";
import { getTeam, addTeamMember, removeTeamMember } from "../controllers/team.js";

const router = express.Router();

router.use(auth);
router.use(requireRole("admin"));

router.get("/", getTeam);
router.post("/", addTeamMember);
router.delete("/:id", removeTeamMember);

export default router;
