import { validationResult } from "express-validator";
import Apierror from "../utils/apierror.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err =>
    extractedErrors.push({
      [err.path]: err.msg,
    }),
  );

  //first I'll convert error into an array , each error goes into extractederror

  throw new Apierror(422, "Data is not valid", extractedErrors);
};
