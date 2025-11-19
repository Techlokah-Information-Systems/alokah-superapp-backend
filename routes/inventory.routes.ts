import router from "./route";
import {
  addItemToInventory,
  updateInventoryItem,
  deleteInventoryItem,
} from "../controllers/inventory.controller";
import { isAuthenticatedUser } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
} from "../types/schema";

router
  .route("/add")
  .post(
    isAuthenticatedUser,
    validate(createInventoryItemSchema),
    addItemToInventory
  );

router
  .route("/item/:id")
  .put(
    isAuthenticatedUser,
    validate(updateInventoryItemSchema),
    updateInventoryItem
  )
  .delete(isAuthenticatedUser, deleteInventoryItem);
export default router;
