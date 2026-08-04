const authMiddleware = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required. Please log in.' });
};

export default authMiddleware;
