const jwt = require('jsonwebtoken');

// Temporary auth for magic link (24hr window)
module.exports = (req, res, next) => {
  const tempToken = req.headers['x-temp-token'];
  
  if (!tempToken) return res.status(401).json({ message: 'Temp token required' });
  
  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    req.user = { id: decoded.id, temp: true };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid temp token' });
  }
};

