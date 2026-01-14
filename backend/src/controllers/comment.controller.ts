import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { database } from '../services/database.service';
import { users } from './auth.controller';

// Load comments from database
let comments: any[] = [];

// Initialize comments from database
const loadComments = async () => {
  try {
    comments = await database.comments.read();
    // Convert date strings back to Date objects if needed
    comments = comments.map(comment => ({
      ...comment,
      createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(),
    }));
  } catch (error) {
    console.error('Error loading comments:', error);
    comments = [];
  }
};

// Save comments to database
const saveComments = async () => {
  try {
    await database.comments.write(comments);
  } catch (error) {
    console.error('Error saving comments:', error);
  }
};

// Load comments on startup
loadComments();

// Helper function to enrich comment with author information
const enrichCommentWithAuthor = (comment: any) => {
  const author = users.find((u) => u.id === comment.authorId);
  return {
    ...comment,
    author: author
      ? {
          id: author.id,
          name: author.name,
          email: author.email,
        }
      : null,
  };
};

// GET /api/v1/comments
export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Reload from database to get latest data
    await loadComments();
    
    const { postId } = req.query;
    let filteredComments = comments;

    if (postId) {
      filteredComments = comments.filter((c) => c.postId === postId);
    }

    // Enrich comments with author information
    const commentsWithAuthors = filteredComments.map(enrichCommentWithAuthor);

    res.status(200).json({
      success: true,
      count: commentsWithAuthors.length,
      data: commentsWithAuthors,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/comments/:id
export const getCommentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const comment = comments.find((c) => c.id === id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: `Comment with id ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/comments
export const createComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { content, postId } = req.body;
    // Get authorId from authenticated user
    const authorId = req.user?.id || req.body.authorId;

    if (!authorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Reload from database to get latest data
    await loadComments();

    // Generate new ID
    const maxId = comments.length > 0 
      ? Math.max(...comments.map(c => parseInt(c.id) || 0))
      : 0;

    const newComment = {
      id: String(maxId + 1),
      content,
      postId,
      authorId,
      createdAt: new Date(),
    };

    comments.push(newComment);

    // Save to database
    await saveComments();

    // Return comment with author information
    const commentWithAuthor = enrichCommentWithAuthor(newComment);

    res.status(201).json({
      success: true,
      data: commentWithAuthor,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/comments/:id
export const updateComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Reload from database to get latest data
    await loadComments();
    
    const commentIndex = comments.findIndex((c) => c.id === id);

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Comment with id ${id} not found`,
      });
    }

    // Check authorization - only comment owner can update
    if (comments[commentIndex].authorId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this comment',
      });
    }

    comments[commentIndex] = {
      ...comments[commentIndex],
      content: content || comments[commentIndex].content,
      updatedAt: new Date(),
    };

    // Save to database
    await saveComments();

    // Return comment with author information
    const commentWithAuthor = enrichCommentWithAuthor(comments[commentIndex]);

    res.status(200).json({
      success: true,
      data: commentWithAuthor,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/comments/:id
export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Reload from database to get latest data
    await loadComments();
    
    const commentIndex = comments.findIndex((c) => c.id === id);

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Comment with id ${id} not found`,
      });
    }

    // Check authorization - only comment owner can delete
    if (comments[commentIndex].authorId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment',
      });
    }

    comments.splice(commentIndex, 1);

    // Save to database
    await saveComments();

    res.status(200).json({
      success: true,
      message: `Comment with id ${id} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
