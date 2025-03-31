import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getPointsOfInterest,
  getCurrentNeighborhood,
  addPointOfInterest,
  updatePointOfInterest,
  deletePointOfInterest
} from '../controllers/pointsOfInterestController.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Get current user's neighborhood
router.get('/current', getCurrentNeighborhood);

// Get points of interest for a neighborhood
router.get('/:neighborhoodId/points-of-interest', getPointsOfInterest);

// Add a new point of interest
router.post('/:neighborhoodId/points-of-interest', addPointOfInterest);

// Update a point of interest
router.put('/points-of-interest/:pointId', updatePointOfInterest);

// Delete a point of interest
router.delete('/points-of-interest/:pointId', deletePointOfInterest);

export default router;