import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";

const createSubscription = asyncHandler(async (req, res) => {
  try {
    const { subscription } = req.body;
    subscription.userId = req.user._id;
    const newSubscription = await Subscription.create({ ...subscription });
    if (!newSubscription)
      throw new ApiError(404, `Error while creating subscription`);

    res
      .status(200)
      .json(
        new ApiResponce(
          200,
          newSubscription,
          `Subscription added successfully !!`
        )
      );
  } catch (error) {
    throw new ApiError(404, `Error while creating subscription`, error);
  }
});

const checkRegistration = asyncHandler(async (req, res) => {
  const { endPoint } = req.body;

  if (!endPoint) throw new ApiError(404, `EndPoint not found`);

  const subscription = await Subscription.findOne({
    endpoint: endPoint,
  });

  if (!subscription) throw new ApiError(404, `Subscription not found`);
  res
    .status(200)
    .json(
      new ApiResponce(200, subscription, `Subscription found successfully !!`)
    );
});

export { createSubscription, checkRegistration };
