/**
 * Joi validation middleware factory.
 * Usage: validate(schema, 'body') or validate(schema, 'query')
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }

    req[property] = value;
    next();
  };
};
