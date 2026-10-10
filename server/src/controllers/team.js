import bcrypt from "bcrypt";
import User from "../models/User.js";

export const getTeam = async (req, res) => {
  try {
    const members = await User.find({ business: req.user.business })
      .select("-passwordHash")
      .sort({ createdAt: 1 });

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch team members", error: err.message });
  }
};

export const addTeamMember = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newMember = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: "accountant",
      business: req.user.business,
      businessName: req.user.businessName,
    });

    const memberData = newMember.toObject();
    delete memberData.passwordHash;

    res.status(201).json(memberData);
  } catch (err) {
    res.status(500).json({ message: "Failed to add team member", error: err.message });
  }
};

export const removeTeamMember = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent removing self or admin owner
    if (id === req.user._id.toString() || id === req.user.business.toString()) {
      return res.status(400).json({ message: "Cannot remove the business owner or yourself" });
    }

    const member = await User.findOne({ _id: id, business: req.user.business });
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    await member.deleteOne();
    res.json({ message: "Team member removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove team member", error: err.message });
  }
};
