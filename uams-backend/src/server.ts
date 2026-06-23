import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    connectDB()
      .then(() => seedAdmin())
      .then(() => {
        app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
        });
      });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();