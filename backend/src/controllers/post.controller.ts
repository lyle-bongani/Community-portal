import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { cacheService, cacheKeys } from '../services/cache.service';
import { users } from './auth.controller';
import { database } from '../services/database.service';
import { notifyNewPost } from '../services/websocket.service';

// Load posts from database
let posts: any[] = [];

// Initialize posts from database
const loadPosts = async () => {
  try {
    posts = await database.posts.read();
    // Convert date strings back to Date objects if needed and ensure likes/savedBy arrays exist
    posts = posts.map(post => ({
      ...post,
      likes: post.likes || [],
      savedBy: post.savedBy || [],
      createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
    }));
  } catch (error) {
    console.error('Error loading posts:', error);
    posts = [];
  }
};

// Save posts to database
const savePosts = async () => {
  try {
    await database.posts.write(posts);
  } catch (error) {
    console.error('Error saving posts:', error);
  }
};

// Load posts on startup
loadPosts();

// Helper function to enrich post with author information
const enrichPostWithAuthor = (post: any) => {
  const author = users.find((u) => u.id === post.authorId);
  return {
    ...post,
    author: author
      ? {
          id: author.id,
          name: author.name,
          email: author.email,
          profileImage: author.profileImage,
        }
      : null,
  };
};

// GET /api/v1/posts
export const getPosts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Check cache first
    const cachedPosts = cacheService.get(cacheKeys.posts.all);
    if (cachedPosts) {
      return res.status(200).json({
        success: true,
        count: (cachedPosts as any[]).length,
        data: cachedPosts,
        cached: true,
      });
    }

    // Enrich posts with author information
    const postsWithAuthors = posts.map(enrichPostWithAuthor);

    // If not in cache, get from storage and cache it
    cacheService.set(cacheKeys.posts.all, postsWithAuthors, { ttl: 300 }); // Cache for 5 minutes

    res.status(200).json({
      success: true,
      count: posts.length,
      data: postsWithAuthors,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/posts/:id
export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Reload from database to get latest data
    await loadPosts();
    
    // Check cache first
    const cachedPost = cacheService.get(cacheKeys.posts.byId(id));
    if (cachedPost) {
      return res.status(200).json({
        success: true,
        data: cachedPost,
        cached: true,
      });
    }

    const post = posts.find((p) => p.id === id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Post with id ${id} not found`,
      });
    }

    // Enrich post with author information
    const postWithAuthor = enrichPostWithAuthor(post);

    // Cache the post
    cacheService.set(cacheKeys.posts.byId(id), postWithAuthor, { ttl: 300 });

    res.status(200).json({
      success: true,
      data: postWithAuthor,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/posts
export const createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content, imageUrl } = req.body;
    // Get authorId from authenticated user
    const authorId = req.user?.id || req.body.authorId;
    
    // Generate new ID
    const maxId = posts.length > 0 
      ? Math.max(...posts.map(p => parseInt(p.id) || 0))
      : 0;
    
    const newPost = {
      id: String(maxId + 1),
      title,
      content,
      authorId,
      imageUrl: imageUrl || null,
      likes: [],
      savedBy: [],
      createdAt: new Date(),
    };

    posts.push(newPost);

    // Save to database
    await savePosts();

    // Invalidate cache
    cacheService.del(cacheKeys.posts.all);
    cacheService.del(cacheKeys.posts.byAuthor(authorId));

    // Return post with author information
    const postWithAuthor = enrichPostWithAuthor(newPost);

    // Notify all clients about new post
    notifyNewPost(postWithAuthor);

    res.status(201).json({
      success: true,
      data: postWithAuthor,
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/v1/posts/:id
export const updatePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const postIndex = posts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Post with id ${id} not found`,
      });
    }

    // Check authorization - only post owner can update
    if (posts[postIndex].authorId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this post',
      });
    }

    const oldPost = posts[postIndex];

    posts[postIndex] = {
      ...posts[postIndex],
      title: title || posts[postIndex].title,
      content: content || posts[postIndex].content,
      updatedAt: new Date(),
    };

    // Save to database
    await savePosts();

    // Invalidate cache
    cacheService.del(cacheKeys.posts.all);
    cacheService.del(cacheKeys.posts.byId(id));
    cacheService.del(cacheKeys.posts.byAuthor(oldPost.authorId));

    // Return post with author information
    const postWithAuthor = enrichPostWithAuthor(posts[postIndex]);

    res.status(200).json({
      success: true,
      data: postWithAuthor,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/v1/posts/:id
export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const postIndex = posts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Post with id ${id} not found`,
      });
    }

    // Check authorization - only post owner can delete
    if (posts[postIndex].authorId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this post',
      });
    }

    const deletedPost = posts[postIndex];
    posts.splice(postIndex, 1);

    // Save to database
    await savePosts();

    // Invalidate cache
    cacheService.del(cacheKeys.posts.all);
    cacheService.del(cacheKeys.posts.byId(id));
    cacheService.del(cacheKeys.posts.byAuthor(deletedPost.authorId));

    res.status(200).json({
      success: true,
      message: `Post with id ${id} deleted successfully`,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/posts/:id/like - Like or unlike a post
export const toggleLike = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Reload from database to get latest data
    await loadPosts();

    const postIndex = posts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Post with id ${id} not found`,
      });
    }

    const post = posts[postIndex];
    
    // Initialize likes array if it doesn't exist
    if (!post.likes) {
      post.likes = [];
    }

    // Toggle like
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(userId);
    }

    // Save to database
    await savePosts();

    // Invalidate cache
    cacheService.del(cacheKeys.posts.all);
    cacheService.del(cacheKeys.posts.byId(id));

    // Return updated post with author information
    const postWithAuthor = enrichPostWithAuthor(post);

    res.status(200).json({
      success: true,
      data: postWithAuthor,
      liked: post.likes.includes(userId),
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/posts/:id/save - Save or unsave a post
export const toggleSave = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Reload from database to get latest data
    await loadPosts();

    const postIndex = posts.findIndex((p) => p.id === id);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Post with id ${id} not found`,
      });
    }

    const post = posts[postIndex];
    
    // Initialize savedBy array if it doesn't exist
    if (!post.savedBy) {
      post.savedBy = [];
    }

    // Toggle save
    const saveIndex = post.savedBy.indexOf(userId);
    if (saveIndex > -1) {
      // Unsave
      post.savedBy.splice(saveIndex, 1);
    } else {
      // Save
      post.savedBy.push(userId);
    }

    // Save to database
    await savePosts();

    // Invalidate cache
    cacheService.del(cacheKeys.posts.all);
    cacheService.del(cacheKeys.posts.byId(id));

    // Return updated post with author information
    const postWithAuthor = enrichPostWithAuthor(post);

    res.status(200).json({
      success: true,
      data: postWithAuthor,
      saved: post.savedBy.includes(userId),
    });
  } catch (error) {
    return next(error);
  }
};
