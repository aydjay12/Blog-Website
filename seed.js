// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs/promises";
import { User } from "./server/models/user.model.js";
import { Post } from "./server/models/posts.model.js";
import path from "path";
import { fileURLToPath } from "url";

// Explicitly load .env from the root directory
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log the environment variable to debug
console.log("MongoDB URI:", process.env.DATABASE_URL);

// MongoDB connection function
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit with failure
  }
};

// Function to seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log("Existing data cleared");

    // Read JSON files
    const usersData = JSON.parse(
      await fs.readFile(path.join(__dirname, "data", "Users.json"), "utf8")
    );
    const postsData = JSON.parse(
      await fs.readFile(path.join(__dirname, "data", "Posts.json"), "utf8")
    );

    // Step 1: Seed Users
    const userMap = new Map(); // Map displayName to their _id for bloggers, username for others

    // Ensure bloggers have displayName; default to username if not provided
    const updatedUsersData = usersData.map((user) => {
      if (user.role === "blogger") {
        return {
          ...user,
          displayName: user.displayName || user.username, // Use displayName if present, else username
          bio: user.bio || `${user.username}'s bio goes here`, // Placeholder bio if not provided
        };
      }
      return user;
    });

    const insertedUsers = await User.insertMany(updatedUsersData);
    insertedUsers.forEach((user) => {
      if (user.role === "blogger") {
        userMap.set(user.displayName, user._id); // Map bloggers by displayName
      }
      userMap.set(user.username, user._id); // Map all users by username for comments/replies
    });
    console.log("Users seeded successfully:", insertedUsers.length);

    // Step 2: Seed Posts with mapped authorId and userId
    const postsToInsert = postsData.map((post) => {
      const authorId = userMap.get(post.author); // Look up by displayName
      if (!authorId) {
        console.log("Available displayNames/usernames in userMap:", Array.from(userMap.keys()));
        throw new Error(`Author ${post.author} not found in users (should match a blogger's displayName)`);
      }

      // Map comments and replies with userId (using username)
      const comments = post.comments.map((comment) => {
        const commenterId = userMap.get(comment.author); // Look up by username
        if (!commenterId) {
          throw new Error(`Commenter ${comment.author} not found in users (should match a username)`);
        }

        const replies = comment.replies.map((reply) => {
          const replierId = userMap.get(reply.author); // Look up by username
          if (!replierId) {
            throw new Error(`Replier ${reply.author} not found in users (should match a username)`);
          }
          return {
            content: reply.content,
            author: reply.author,
            userImg: reply.userImg,
            userId: replierId,
            likes: [],
            createdAt: reply.createdAt,
            updatedAt: reply.createdAt,
          };
        });

        return {
          content: comment.content,
          author: comment.author,
          userImg: comment.userImg,
          userId: commenterId,
          replies,
          likes: [],
          createdAt: comment.createdAt,
          updatedAt: comment.createdAt,
        };
      });

      return {
        title: post.title,
        content: post.content,
        img: post.img,
        author: post.author,
        authorImg: post.authorImg,
        authorId: authorId,
        categories: post.categories,
        tags: post.tags,
        comments: comments,
        publishedAt: post.publishedAt,
        slug: post.slug,
        createdAt: post.publishedAt, // Align with publishedAt for consistency
        updatedAt: post.publishedAt,
      };
    });

    const insertedPosts = await Post.insertMany(postsToInsert);
    console.log("Posts seeded successfully:", insertedPosts.length);

    // Step 3: Update users' posts arrays
    for (const post of insertedPosts) {
      await User.findByIdAndUpdate(post.authorId, {
        $push: { posts: post._id },
      });
    }
    console.log("Users updated with post references");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Run the seeding process
const runSeeder = async () => {
  await connectDB();
  await seedData();
  process.exit(0);
};

runSeeder();