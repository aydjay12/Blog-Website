import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    mentionedUser: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [replySchema],
  },
  { timestamps: true }
);

// Virtual for formatting date
commentSchema.virtual("formattedDate").get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  // If more than a month, return formatted date
  return created.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Also add formatted date to replies
replySchema.virtual("formattedDate").get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return created.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Method to check if user has liked a comment
commentSchema.methods.isLikedByUser = function (userId) {
  return this.likedBy.includes(userId);
};

// Method to like/unlike a comment
commentSchema.methods.toggleLike = async function (userId) {
  const isLiked = this.likedBy.includes(userId);
  
  if (isLiked) {
    // Unlike: remove userId and decrement like count
    this.likedBy = this.likedBy.filter(id => id.toString() !== userId.toString());
    this.likes -= 1;
  } else {
    // Like: add userId and increment like count
    this.likedBy.push(userId);
    this.likes += 1;
  }
  
  await this.save();
  return !isLiked; // Return new like status
};

// Method to format comment for frontend
commentSchema.methods.toJSON = function() {
  const comment = this.toObject({ virtuals: true });
  
  return {
    id: comment._id,
    content: comment.content,
    date: comment.formattedDate,
    likes: comment.likes,
    isLiked: false, // This will be set dynamically based on the requesting user
    replies: comment.replies.map(reply => ({
      id: reply._id,
      content: reply.content,
      date: reply.formattedDate,
      likes: reply.likes,
      isLiked: false, // This will be set dynamically based on the requesting user
      mentionedUser: reply.mentionedUser
    })),
    author: null // This will be populated with user data
  };
};

// Method to add a reply to a comment
commentSchema.methods.addReply = async function(content, authorId, mentionedUser = null) {
  this.replies.push({
    content,
    author: authorId,
    mentionedUser
  });
  
  await this.save();
  return this.replies[this.replies.length - 1];
};

// Function to check if user can delete a comment/reply
commentSchema.methods.canBeDeletedBy = function(userId) {
  return this.author.toString() === userId.toString();
};

// Create and export the Comment model
export const Comment = mongoose.model("Comment", commentSchema);