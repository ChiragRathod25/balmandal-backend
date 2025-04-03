import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import {logger} from "../utils/logger.js";

const ConnectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    logger.info(
      `MongoDB connected successfully !! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    logger.error("Error while connecting to database", error);
    exit(1);
  }
};
export default ConnectDB;
