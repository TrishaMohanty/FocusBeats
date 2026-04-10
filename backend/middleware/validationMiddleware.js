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
    const message = error.errors ? error.errors[0].message : error.message;
    next(new Error(message));
  }
};

export default validate;
