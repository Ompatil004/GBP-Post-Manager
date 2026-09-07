import { Router, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Location from '../models/Location.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET /api/posts - Fetch user's posts
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _locModel = Location;

    const posts = await Post.find({ userId })
      .populate('locationId', 'businessName address category city')
      .sort({ createdAt: -1 });

    return res.status(200).json({ posts });
  } catch (error) {
    console.error('Fetch posts error:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /api/posts - Create a new post
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const { locationId, topic, postType, tone, language, cta, content, status } = req.body;

    if (!locationId || !topic || !content) {
      return res.status(400).json({ error: 'Location, post topic, and content are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }

    const locationExists = await Location.findById(locationId);
    if (!locationExists) {
      return res.status(404).json({ error: 'Selected location does not exist' });
    }

    const postStatus = status === 'published' ? 'published' : 'draft';
    const publishedAt = postStatus === 'published' ? new Date() : null;

    const post = await Post.create({
      userId,
      locationId,
      topic: topic.trim(),
      postType: postType || 'Update',
      tone: tone || 'Professional',
      language: language || 'English',
      cta: cta || 'Learn More',
      content: content.trim(),
      status: postStatus,
      publishedAt,
    });

    const populatedPost = await Post.findById(post._id).populate(
      'locationId',
      'businessName address category city'
    );

    return res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost,
    });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET /api/posts/:id - Fetch single post
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _locModel = Location;

    const post = await Post.findById(id).populate(
      'locationId',
      'businessName address category city'
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this post' });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error('Fetch post by ID error:', error);
    return res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// PUT /api/posts/:id - Update post
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const { locationId, topic, postType, tone, language, cta, content, status } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this post' });
    }

    if (locationId) post.locationId = locationId;
    if (topic) post.topic = topic.trim();
    if (postType) post.postType = postType;
    if (tone) post.tone = tone;
    if (language) post.language = language;
    if (cta) post.cta = cta;
    if (content) post.content = content.trim();

    if (status && status !== post.status) {
      post.status = status;
      if (status === 'published' && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }

    await post.save();

    const updatedPost = await Post.findById(id).populate(
      'locationId',
      'businessName address category city'
    );

    return res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/posts/:id - Delete post
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this post' });
    }

    await Post.findByIdAndDelete(id);
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
});

// PATCH /api/posts/:id/publish - Mark post as published
router.patch('/:id/publish', async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this post' });
    }

    post.status = 'published';
    post.publishedAt = new Date();
    await post.save();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _locModel = Location;
    const updatedPost = await Post.findById(id).populate(
      'locationId',
      'businessName address category city'
    );

    return res.status(200).json({
      message: 'Post marked as published successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Publish post error:', error);
    return res.status(500).json({ error: 'Failed to publish post' });
  }
});

export default router;
