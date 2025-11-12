import app from "./app";
import { PORT, ENVIRONMENT, HOST } from "./utils/constants";

let server: any;

const startServer = () => {
  try {
    server = app.listen(PORT, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
    });

    process.on("unhandledRejection", (err: any) => {
      console.error("Unhandled Rejection:", err.message);
      shutDown(1);
    });

    process.on("uncaughtException", (err: any) => {
      console.error("Uncaught Exception:", err.message);
      shutDown(1);
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      shutDown(0);
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received. Shutting down gracefully...");
      shutDown(0);
    });
  } catch (error) {
    console.error("Error starting server:", (error as Error).message);
    process.exit(1);
  }
};

function shutDown(exitCode: number) {
  if (server) {
    server.close(() => {
      console.log("Process terminated!");
      process.exit(exitCode);
    });
  } else {
    process.exit(exitCode);
  }
}

if (ENVIRONMENT === "production") {
  console.log("Running in production mode");
} else {
  console.log("Running in development mode");
}

startServer();
