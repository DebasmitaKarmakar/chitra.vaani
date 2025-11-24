const Joi = require('joi');

// Validation schemas
const schemas = {
  // Order validation (regular, custom, bulk)
  regularOrder: Joi.object({
    order_type: Joi.string().valid('regular').required(),
    artwork_id: Joi.number().integer().positive().required(),
    customer_name: Joi.string().min(2).max(100).required(),
    customer_email: Joi.string().email().pattern(/@gmail\.com$/).required()
      .messages({
        'string.pattern.base': 'Only Gmail addresses are accepted'
      }),
    customer_phone: Joi.string().pattern(/^[0-9]{10}$/).required()
      .messages({
        'string.pattern.base': 'Phone number must be 10 digits'
      }),
    delivery_address: Joi.string().min(10).max(500).required(),
    order_details: Joi.object({
      artwork: Joi.string().required(),
      category: Joi.string().required(),
      price: Joi.string().required(),
      size: Joi.string().required(),
      notes: Joi.string().max(500).allow('', null)
    }).required()
  }),

  customOrder: Joi.object({
    order_type: Joi.string().valid('custom').required(),
    customer_name: Joi.string().min(2).max(100).required(),
    customer_email: Joi.string().email().pattern(/@gmail\.com$/).required(),
    customer_phone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null),
    delivery_address: Joi.string().min(10).max(500).required(),
    order_details: Joi.object({
      idea: Joi.string().min(10).max(1000).required(),
      medium: Joi.string().valid('canvas', 'sketch', 'digital', 'any').required()
    }).required()
  }),

  bulkOrder: Joi.object({
    order_type: Joi.string().valid('bulk').required(),
    customer_name: Joi.string().min(2).max(100).required(),
    customer_email: Joi.string().email().pattern(/@gmail\.com$/).required(),
    customer_phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    delivery_address: Joi.string().min(10).max(500).required(),
    order_details: Joi.object({
      orgName: Joi.string().min(2).max(200).required(),
      itemType: Joi.string().required(),
      quantity: Joi.number().integer().min(2).required(),
      projectDetails: Joi.string().min(10).max(1000).required(),
      deadline: Joi.date().iso().min('now').required(),
      budget: Joi.string().max(100).allow('', null)
    }).required()
  }),

  // Artwork validation
  artwork: Joi.object({
    title: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(2000).allow('', null),
    category: Joi.string().required(),
    medium: Joi.string().max(100).allow('', null),
    dimensions: Joi.string().max(100).allow('', null),
    year: Joi.string().pattern(/^[0-9]{4}$/).allow('', null),
    price: Joi.string().min(1).max(50).required()
  }),

  // Category validation
  category: Joi.object({
    name: Joi.string().min(2).max(100).required()
  }),

  // Login validation (allows special characters in username and password)
  login: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).required()
  }),

  // Password change validation
  changePassword: Joi.object({
    currentPassword: Joi.string().min(6).required(),
    newPassword: Joi.string().min(8).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.pattern.base': 'Password must contain uppercase, lowercase, and number'
      })
  })
};

// Validation middleware factory
function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    
    if (!schema) {
      return res.status(500).json({ 
        error: 'Validation schema not found' 
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
}

// Sanitize output - remove sensitive fields
function sanitizeOrder(order, isAdmin = false) {
  const sanitized = { ...order };

  // Parse order_details if it's a string
  if (typeof sanitized.order_details === 'string') {
    sanitized.order_details = JSON.parse(sanitized.order_details);
  }

  // Remove sensitive data for non-admin users
  if (!isAdmin) {
    delete sanitized.customer_phone;
    delete sanitized.customer_email;
    delete sanitized.delivery_address;
  }

  return sanitized;
}

module.exports = {
  validate,
  schemas,
  sanitizeOrder
};