const HttpError = require("../error/http-error");

const errorMiddleware = (error, req, res, next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
  } else if (error instanceof Error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(500).json("erro interno no servidor.");
  }
};

module.exports = errorMiddleware;