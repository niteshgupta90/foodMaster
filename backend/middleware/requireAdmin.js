const User = require('../models/User');
module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('isAdmin');
    if (!user?.isAdmin) return res.status(403).json({ msg: 'Administrator access required' });
    next();
  } catch {
    res.status(500).json({ msg: 'Unable to verify administrator access' });
  }
};
