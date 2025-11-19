import { addEmployee, listEmployees } from "../controllers/employee.controller";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { createEmployeeSchema } from "../types/schema";
import router from "./route";

router.post(
  "/onboard",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  validate(createEmployeeSchema),
  addEmployee
);

router
  .route("/list")
  .get(isAuthenticatedUser, authorizeRoles("Admin"), listEmployees);

export default router;
