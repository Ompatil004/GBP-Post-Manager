import { Router, Response } from 'express';
import Location from '../models/Location.js';
import Post from '../models/Post.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/stats
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;

    const [totalLocations, totalPosts, draftPosts, publishedPosts] = await Promise.all([
      Location.countDocuments(),
      Post.countDocuments({ userId }),
      Post.countDocuments({ userId, status: 'draft' }),
      Post.countDocuments({ userId, status: 'published' }),
    ]);

    return res.status(200).json({
      totalLocations,
      totalPosts,
      draftPosts,
      publishedPosts,
    });
  } catch (error) {
    console.error('Stats endpoint error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;
