import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./db/connectDB.js";
import { authRoute } from "./routes/auth.route.js";
import path from "path";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { postsRoute } from "./routes/posts.route.js";
import { commentsRoute } from "./routes/comments.route.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cookieParser());

// Configure CORS for both development and production
const allowedOrigins = [
  "http://localhost:3000",
  "https://blog-website-kappa-roan.vercel.app"
];

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));

app.use(express.json({ limit: "10mb" }));

const __dirname = path.resolve();

const storage = multer.memoryStorage();
const upload = multer({ storage });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use("/api/auth", authRoute(upload));
app.use("/api/posts", postsRoute); 
app.use("/api/comments", commentsRoute);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "client/dist")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
//   });
// }

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});