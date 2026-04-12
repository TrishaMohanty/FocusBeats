const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    res.status(400);
    // Extracting just the first error message for a cleaner API response
    // Handling Zod issues correctly whether it's an array or a formatted object
    let message = 'Validation failed';
    if (error.errors && error.errors.length > 0) {
      message = error.errors[0].message;
    } else if (error.issues && error.issues.length > 0) {
      message = error.issues[0].message;
    } else {
      message = error.message;
    }
    
    // Safety check: if the message still looks like a JSON array/object, extract the actual message field if possible
    if (typeof message === 'string' && (message.startsWith('[') || message.startsWith('{'))) {
      try {
        const parsed = JSON.parse(message);
        const firstError = Array.isArray(parsed) ? parsed[0] : parsed;
        message = firstError.message || message;
      } catch (e) {
        // Keep original if parsing fails
      }
    }

    next(new Error(message));
  }
};

export default validate;
