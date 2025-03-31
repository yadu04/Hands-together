import express from 'express';
import { 
  getAllNeighborhoods, 
  createNeighborhood,
  deleteNeighborhood, 
  updateNeighborhood,
  getNeighborhoodById,
  getCurrentNeighborhood 
} from '../controllers/neighborhoodController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllNeighborhoods);
router.get('/current', protect, getCurrentNeighborhood);
router.get('/:neighborhoodId', protect, getNeighborhoodById);
router.post('/', protect, admin, createNeighborhood);
router.put('/:neighborhoodId', protect, admin, updateNeighborhood);
router.delete('/:neighborhoodId', protect, admin, deleteNeighborhood);

export default router;