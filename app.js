import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import cors from "cors";

import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
dotenv.config();
const app = express();


app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: 'https://hajj-voice-assistant.vercel.app/', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/webhook", webhookRoutes);

app.use((req, res) => {
  res.status(404).send('Route not found');
});
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
export default app;