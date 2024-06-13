const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_TOKEN, { expiresIn: "180d" });
};

module.exports = generateToken;
