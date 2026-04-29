const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data });
};

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, error: message });
};

export { sendSuccess, sendError };