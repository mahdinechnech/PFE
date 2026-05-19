import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("=== AUTH DEBUG ===");
  console.log("Auth header exists:", !!authHeader);

  if (!authHeader) {
    console.log("No Authorization header");
    return res
      .status(401)
      .json({ message: "Accès refusé. Aucun jeton fourni." });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token exists:", !!token);
  console.log("Token first 20 chars:", token?.substring(0, 20) + "...");

  if (!token) {
    console.log("No token in header");
    return res
      .status(401)
      .json({ message: "Accès refusé. Aucun jeton fourni." });
  }

  try {
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    req.user = {
      ...decoded,
      _id: decoded.userId || decoded._id || decoded.id,
      id: decoded.userId || decoded._id || decoded.id,
    };

    console.log("req.user._id:", req.user._id);
    console.log("req.user.role:", req.user.role);
    console.log("=== AUTH SUCCESS ===");

    next();
  } catch (ex) {
    console.error("=== AUTH ERROR ===");
    console.error("Error name:", ex.name);
    console.error("Error message:", ex.message);
    console.error("Token used:", token);
    res.status(400).json({ message: "Jeton invalide." });
  }
};

export const adminOnly = (req, res, next) => {
  console.log("=== ADMIN CHECK ===");
  console.log("req.user:", req.user);
  console.log("req.user?.role:", req.user?.role);

  if (req.user && req.user.role === "admin") {
    console.log("Admin access granted");
    next();
  } else {
    console.log("Admin access denied");
    res.status(403).json({ message: "Accès restreint aux administrateurs." });
  }
};

export const technicianOnly = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "technicien" || req.user.role === "admin")
  ) {
    next();
  } else {
    res.status(403).json({ message: "Accès restreint aux techniciens." });
  }
};

export const clientOnly = (req, res, next) => {
  if (req.user && (req.user.role === "client" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ message: "Accès restreint aux clients." });
  }
};
