import jwt from 'jsonwebtoken'

export const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Accès refusé. Aucun jeton fourni.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Jeton invalide.' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Accès restreint aux administrateurs.' });
  }
};

export const technicianOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'technicien' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Accès restreint aux techniciens.' });
  }
};

export const clientOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'client' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Accès restreint aux clients.' });
  }
};
