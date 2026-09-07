import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Location from '../models/Location.js';

const router = Router();

// GET /api/locations
router.get('/', async (req: Request, res: Response) => {
  try {
    const locations = await Location.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ locations });
  } catch (error) {
    console.error('Fetch locations error:', error);
    return res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// GET /api/locations/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }

    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    return res.status(200).json({ location });
  } catch (error) {
    console.error('Fetch location by ID error:', error);
    return res.status(500).json({ error: 'Failed to fetch location' });
  }
});

export default router;
