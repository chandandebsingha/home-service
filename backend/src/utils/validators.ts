import { ValidationRule, Validators } from '../middleware/validation.middleware';

// Login validation rules
export const loginRules: ValidationRule[] = [
  {
    field: 'email',
    validator: Validators.isEmail,
    message: 'Invalid email address',
  },
  {
    field: 'password',
    validator: Validators.minLength(6),
    message: 'Password must be at least 6 characters',
  },
];

// Register validation rules
export const registerRules: ValidationRule[] = [
  {
    field: 'email',
    validator: Validators.isEmail,
    message: 'Invalid email address',
  },
  {
    field: 'password',
    validator: Validators.minLength(8),
    message: 'Password must be at least 8 characters',
  },
  {
    field: 'fullName',
    validator: Validators.minLength(2),
    message: 'Full name must be at least 2 characters',
  },
];

// Export schemas for validation middleware
export const loginSchema = loginRules;
export const registerSchema = registerRules;