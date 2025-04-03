import { app } from "./app.js";
import ConnectDB from "./DB/index.js";
import "dotenv/config.js";
import {logger} from "./utils/logger.js";

ConnectDB()
  .then(() => {
    try {
      app.listen(process.env.PORT, "0.0.0.0", () => {
        logger.log("Server is listening", process.env.PORT);
      });
    } catch (error) {
      logger.log(`Error while starting the server : `, error);
    }
  })
  .catch((err) => {
    logger.error(`MongoDB connection failed !! \n Error: ${err}`);
  });

