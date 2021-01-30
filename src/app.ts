import express from "express";
import { generateRoute } from "./routes/generate-route";

const app: express.Application = express();

app.use("/api/generate", generateRoute);

export default app;
