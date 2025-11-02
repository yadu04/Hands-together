import PointOfInterestModel from '../models/PointOfInterest.js';
import NeighborhoodModel from '../models/Neighborhood.js';
import { 
  asyncHandler, 
  validateRequired, 
  checkResourceExists,
  ValidationError,
  NotFoundError
} from '../middleware/errorHandler.js';

// Get points of interest for a specific neighborhood with optional filtering
export const getPointsOfInterest = asyncHandler(async (req, res) => {
  const { neighborhoodId } = req.params;
  const { filter } = req.query;

  // Validate neighborhood exists
  await checkResourceExists(NeighborhoodModel, neighborhoodId);

  let query = { neighborhoodId };
  if (filter && filter !== 'all') {
    query.category = filter;
  }

  const points = await PointOfInterestModel.find(query);
  
  res.status(200).json({ 
    success: true, 
    points 
  });
});

// Get current user's neighborhood with coordinates
export const getCurrentNeighborhood = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const neighborhood = await NeighborhoodModel.findOne({
    members: userId
  });

  if (!neighborhood) {
    throw new NotFoundError('No neighborhood found for current user');
  }

  res.status(200).json({ 
    success: true, 
    neighborhood 
  });
});

// Add a new point of interest
export const addPointOfInterest = asyncHandler(async (req, res) => {
  const { name, description, category, coordinates, address, contactInfo } = req.body;
  const { neighborhoodId } = req.params;

  // Validate required fields
  validateRequired(req.body, ['name', 'category', 'coordinates']);

  // Validate neighborhood exists
  await checkResourceExists(NeighborhoodModel, neighborhoodId);

  // Validate coordinates format
  if (!coordinates.lat || !coordinates.lng) {
    throw new ValidationError('Coordinates must include lat and lng');
  }

  const newPoint = new PointOfInterestModel({
    name,
    description,
    category,
    coordinates,
    neighborhoodId,
    address,
    contactInfo
  });

  await newPoint.save();
  
  res.status(201).json({ 
    success: true, 
    point: newPoint 
  });
});

// Update a point of interest
export const updatePointOfInterest = asyncHandler(async (req, res) => {
  const { pointId } = req.params;
  const updates = req.body;

  // Check if point exists
  const existingPoint = await checkResourceExists(PointOfInterestModel, pointId);

  // Validate coordinates if provided
  if (updates.coordinates) {
    if (!updates.coordinates.lat || !updates.coordinates.lng) {
      throw new ValidationError('Coordinates must include lat and lng');
    }
  }

  const updatedPoint = await PointOfInterestModel.findByIdAndUpdate(
    pointId,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({ 
    success: true, 
    point: updatedPoint 
  });
});

// Delete a point of interest
export const deletePointOfInterest = asyncHandler(async (req, res) => {
  const { pointId } = req.params;

  const deletedPoint = await checkResourceExists(PointOfInterestModel, pointId);
  await PointOfInterestModel.findByIdAndDelete(pointId);

  res.status(200).json({ 
    success: true, 
    message: 'Point of interest deleted successfully' 
  });
});