import {
  addEmployee,
  updateEmployee,
  listEmployees,
} from "../controllers/employee.controller";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { createEmployeeSchema, updateEmployeeSchema } from "../types/schema";
import router from "./route";

router.post(
  "/onboard",
  isAuthenticatedUser,
  authorizeRoles("Admin"),
  validate(createEmployeeSchema),
  addEmployee
);

router
  .route("/update/:id")
  .put(
    isAuthenticatedUser,
    authorizeRoles("Admin"),
    validate(updateEmployeeSchema),
    updateEmployee
  );

router
  .route("/list")
  .get(isAuthenticatedUser, authorizeRoles("Admin"), listEmployees);

export default router;
