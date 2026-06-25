import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().lowercase().trim().pattern(/@dtu\.ac\.in$/)
    .required().messages({
      'string.pattern.base': 'Must be a valid @dtu.ac.in email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('student', 'alumni').required().messages({
    'any.only': 'Role must be either student or alumni',
    'any.required': 'Role is required',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).max(128).required().messages({
    'string.min': 'Password must be at least 8 characters',
  }),
});
