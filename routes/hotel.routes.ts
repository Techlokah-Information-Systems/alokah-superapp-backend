import { getHotel, registerHotel } from "../controllers/hotel.controller";
import { isAuthenticatedUser } from "../middleware/authenticate";
import router from "./route";
import { validate } from "../middleware/validate";
import { createHotelSchema } from "../types/schema";

router
  .route("/operations")
  .post(isAuthenticatedUser, validate(createHotelSchema), registerHotel)
  .get(isAuthenticatedUser, getHotel);

export default router;
