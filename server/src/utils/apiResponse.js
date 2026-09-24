const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    statusCode,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'Error', errors = null) => {
  const response = {
    success: false,
    statusCode,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
};
