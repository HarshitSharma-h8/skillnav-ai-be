import User from "../models/User.model.js";

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const allowed = ["name", "location", "targetRole", "skills", "education", "experienceYears"];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Normalize skills if provided
    if (updates.skills) {
      if (!Array.isArray(updates.skills)) {
        return res.status(400).json({ message: "skills must be an array of strings" });
      }
      updates.skills = [...new Set(updates.skills.map(s => String(s).trim()).filter(Boolean))];
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select("-passwordHash");

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function addSkills(req, res) {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "skills must be an array" });
    }
    const cleaned = skills.map(s => String(s).trim()).filter(Boolean);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { skills: { $each: cleaned } } },
      { new: true }
    ).select("-passwordHash");

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function removeSkill(req, res) {
  try {
    const skill = String(req.params.skill || "").trim();
    if (!skill) return res.status(400).json({ message: "skill is required" });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { skills: skill } },
      { new: true }
    ).select("-passwordHash");

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}