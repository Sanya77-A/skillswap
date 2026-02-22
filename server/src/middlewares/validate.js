import { ZodError } from "zod";

/**
 * Validation middleware: run schema.parse on req (body, query, params)
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const toValidate = {
      body: req.body,
      query: req.query,
      params: req.params,
    };
    schema.parse(toValidate);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({ path: e.path.join("."), message: e.message }));
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    next(err);
  }
};
