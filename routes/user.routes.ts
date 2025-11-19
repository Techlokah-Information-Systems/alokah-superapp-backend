import router from "./route";
import { addUser, getUser } from "../controllers/user.controller";
import { isAuthenticatedUser } from "../middleware/authenticate";

router.route("/register").post(addUser);
router.route("/").get(isAuthenticatedUser, getUser);

export default router;
