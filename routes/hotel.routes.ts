import { getHotel, registerHotel } from "../controllers/hotel.controller";
import { isAuthenticatedUser } from "../middleware/authenticate";
import router from "./route";

router
  .route("/operations")
  .post(isAuthenticatedUser, registerHotel)
  .get(isAuthenticatedUser, getHotel);
export default router;
