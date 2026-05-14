import Settings from "../models/Settings.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne().sort({ createdAt: 1 });
    res.json(settings || (await Settings.create({})));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const existing = await Settings.findOne().sort({ createdAt: 1 });
    const settings = existing
      ? await Settings.findByIdAndUpdate(existing._id, req.body, { new: true, runValidators: true })
      : await Settings.create(req.body);
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
