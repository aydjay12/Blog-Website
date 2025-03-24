// posts.controller.js
import { Post } from "../models/posts.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs/promises";
import { verifyToken, verifyBlogger, verifyOwnership } from "../middleware/verifyToken.js";

/**
 * Create a new post
 * @route POST /api/posts
 * @access Private (Bloggers only)
 */
export const createPost = async (req, res) => {
  try {
    const { title, content, categories, tags, img } = req.body;

    // Verify user is a blogger (via middleware: verifyToken, verifyBlogger)
    const blogger = await User.findById(req.userId);
    if (!blogger || blogger.role !== "blogger") {
      return res.status(403).json({
        success: false,
        message: "Only bloggers can create posts",
      });
    }

    // Validate required fields
    if (!title || !content || !categories || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and at least one category are required",
      });
    }

    // Generate initial slug
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      // Temporarily save the post to get an ID, then append it to the slug
      const tempPost = new Post({
        title,
        content,
        img: img || "",
        author: blogger.displayName,
        authorImg: blogger.profileImage || "",
        authorId: blogger._id,
        categories,
        tags: tags || [],
        slug: `${slug}-temp`, // Temporary slug to avoid unique constraint
      });
      const savedTempPost = await tempPost.save();
      slug = `${slug}-${savedTempPost._id}`;
      
      // Update the post with the new slug
      savedTempPost.slug = slug;
      const savedPost = await savedTempPost.save();

      // Add post to user's posts array
      blogger.posts.push(savedPost._id);
      await blogger.save();

      return res.status(201).json({
        success: true,
        message: "Post created successfully",
        post: savedPost,
      });
    }

    // Create new post if no conflict
    const newPost = new Post({
      title,
      content,
      img: img || "",
      author: blogger.displayName,
      authorImg: blogger.profileImage || "",
      authorId: blogger._id,
      categories,
      tags: tags || [],
      slug,
    });

    // Save post
    const savedPost = await newPost.save();

    // Add post to user's posts array
    blogger.posts.push(savedPost._id);
    await blogger.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: savedPost,
    });
  } catch (error) {
    console.error("Error in createPost controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
};

/**
 * Upload post image
 * @route POST /api/posts/upload-image
 * @access Private (Bloggers only)
 */
export const uploadPostImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "blog_post_images",
          resource_type: "image",
          transformation: [{ width: 800, height: 400, crop: "limit" }, { quality: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Error in uploadPostImage controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
    });
  }
};

/**
 * Get all posts
 * @route GET /api/posts
 * @access Public
 */
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ publishedAt: -1 });
    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Error in getPosts controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

/**
 * Get a single post by slug
 * @route GET /api/posts/:slug
 * @access Public
 */
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug }).populate({
      path: "authorId",
      select: "displayName bio profileImage", // Only fetch necessary fields
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Transform the response to include bio directly in the post object
    const postWithAuthorDetails = {
      ...post.toObject(),
      authorBio: post.authorId?.bio || "No bio available", // Add bio from populated authorId
      author: post.authorId?.displayName || post.author, // Ensure displayName consistency
      authorImg: post.authorId?.profileImage || post.authorImg, // Ensure profileImage consistency
    };

    res.status(200).json({
      success: true,
      post: postWithAuthorDetails,
    });
  } catch (error) {
    console.error("Error in getPostBySlug controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch post",
    });
  }
};

/**
 * Update a post
 * @route PUT /api/posts/:id
 * @access Private (Bloggers only, must be the author)
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, img, categories, tags } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    if (!post.canEdit(req.userId)) {
      return res.status(403).json({ success: false, message: "You can only edit your own posts" });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (img) post.img = img;
    if (categories) post.categories = categories;
    if (tags) post.tags = tags;

    if (title) {
      let newSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const existingPost = await Post.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existingPost) {
        newSlug = `${newSlug}-${id}`; // Append ID to avoid conflict
      }
      post.slug = newSlug;
    }

    const updatedPost = await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error in updatePost controller:", error);
    res.status(500).json({ success: false, message: "Failed to update post" });
  }
};

/**
 * Delete a post
 * @route DELETE /api/posts/:id
 * @access Private (Bloggers only, must be the author)
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check ownership (via middleware: verifyOwnership)
    if (!post.canEdit(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    // Remove post from user's posts array
    await User.findByIdAndUpdate(req.userId, { $pull: { posts: post._id } });

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error in deletePost controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
};

/**
 * Check if the user is the author of a post
 * @route GET /api/posts/:id/is-author
 * @access Private
 */
export const checkPostAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const isAuthor = post.authorId.toString() === req.userId.toString();

    res.status(200).json({
      success: true,
      isAuthor,
    });
  } catch (error) {
    console.error("Error in checkPostAuthor controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check authorship",
    });
  }
};

/**
 * Get related posts based on tags and categories
 * @route GET /api/posts/:slug/related
 * @access Public
 */
export const getRelatedPosts = async (req, res) => {
  try {
    const { slug } = req.params;
    const limit = 4; // Number of related posts to return

    // Find the current post by slug
    const currentPost = await Post.findOne({ slug });
    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Extract tags and categories from the current post
    const { tags, categories, _id: currentPostId } = currentPost;

    // Query for posts that match any of the tags or categories, excluding the current post
    const relatedPosts = await Post.find({
      _id: { $ne: currentPostId }, // Exclude the current post
      $or: [
        { tags: { $in: tags.length > 0 ? tags : [] } }, // Match any tags
        { categories: { $in: categories.length > 0 ? categories : [] } }, // Match any categories
      ],
    })
      .populate({
        path: "authorId",
        select: "displayName profileImage",
      })
      .sort({ publishedAt: -1 }); // Sort by most recent

    // If fewer than 'limit' posts are found, just return what we have
    if (relatedPosts.length <= limit) {
      const formattedPosts = relatedPosts.map(post => ({
        ...post.toObject(),
        author: post.authorId?.displayName || post.author,
        authorImg: post.authorId?.profileImage || post.authorImg,
      }));
      return res.status(200).json({
        success: true,
        relatedPosts: formattedPosts,
      });
    }

    // Randomly select 'limit' posts from the result
    const shuffledPosts = relatedPosts.sort(() => 0.5 - Math.random()); // Simple shuffle
    const selectedPosts = shuffledPosts.slice(0, limit);

    // Format the response to match getPostBySlug
    const formattedPosts = selectedPosts.map(post => ({
      ...post.toObject(),
      author: post.authorId?.displayName || post.author,
      authorImg: post.authorId?.profileImage || post.authorImg,
    }));

    res.status(200).json({
      success: true,
      relatedPosts: formattedPosts,
    });
  } catch (error) {
    console.error("Error in getRelatedPosts controller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch related posts",
    });
  }
};