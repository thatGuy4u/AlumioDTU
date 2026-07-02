export const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  // Prisma unique constraint violation (e.g. duplicate email)
  if (err.code === 'P2002') {
    statusCode = 400;
    const field = err.meta?.target?.[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    statusCode = 404;
    message = err.meta?.cause || 'Record not found.';
  }

  // Prisma foreign key constraint failure
  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Related record not found. Please check the referenced data.';
  }

  // Prisma required relation violation
  if (err.code === 'P2014') {
    statusCode = 400;
    message = 'This operation violates a required relation.';
  }

  // Multer errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
