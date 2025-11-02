import NeighborhoodModel from "../models/Neighborhood.js";
import UserModel from "../models/User.js";
import { 
  asyncHandler, 
  validateRequired, 
  checkResourceExists,
  ValidationError,
  NotFoundError
} from "../middleware/errorHandler.js";

// Get all neighborhoods
export const getAllNeighborhoods = asyncHandler(async (req, res) => {
  const neighborhoods = await NeighborhoodModel.find({})
    .populate('members', 'name email');
  
  res.status(200).json({
    success: true,
    neighborhoods
  });
});

// Create a new neighborhood
export const createNeighborhood = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Validate required fields
  validateRequired(req.body, ['name']);

  // Check if neighborhood with same name already exists
  const existingNeighborhood = await NeighborhoodModel.findOne({ name });
  if (existingNeighborhood) {
    throw new ValidationError('Neighborhood with this name already exists');
  }

  const newNeighborhood = new NeighborhoodModel({ 
    name, 
    description: description || '' 
  });
  
  await newNeighborhood.save();
  
  res.status(201).json({
    success: true,
    neighborhood: newNeighborhood
  });
});

// Delete a neighborhood
export const deleteNeighborhood = asyncHandler(async (req, res) => {
  const { neighborhoodId } = req.params;

  // Check if neighborhood exists
  const neighborhood = await checkResourceExists(NeighborhoodModel, neighborhoodId);

  // Remove all users associated with this neighborhood
  await UserModel.deleteMany({ neighborhoodId });

  // Delete the neighborhood
  await NeighborhoodModel.findByIdAndDelete(neighborhoodId);

  res.status(200).json({ 
    success: true,
    message: 'Neighborhood and associated users deleted successfully' 
  });
});

// Update a neighborhood
export const updateNeighborhood = asyncHandler(async (req, res) => {
  const { neighborhoodId } = req.params;
  const { name, description } = req.body;

  // Validate required fields
  validateRequired(req.body, ['name']);

  // Check if neighborhood exists
  await checkResourceExists(NeighborhoodModel, neighborhoodId);

  // Check if new name conflicts with existing neighborhood
  if (name) {
    const existingNeighborhood = await NeighborhoodModel.findOne({ 
      name, 
      _id: { $ne: neighborhoodId } 
    });
    if (existingNeighborhood) {
      throw new ValidationError('Neighborhood with this name already exists');
    }
  }

  const updatedNeighborhood = await NeighborhoodModel.findByIdAndUpdate(
    neighborhoodId, 
    { name, description: description || '' }, 
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    neighborhood: updatedNeighborhood
  });
});

// Get neighborhood by ID
export const getNeighborhoodById = asyncHandler(async (req, res) => {
  const { neighborhoodId } = req.params;
  
  if (!neighborhoodId) {
    throw new ValidationError('Neighborhood ID is required');
  }

  const neighborhood = await NeighborhoodModel.findById(neighborhoodId)
    .populate('members', 'name email');
    
  if (!neighborhood) {
    throw new NotFoundError('Neighborhood');
  }

  res.status(200).json({
    success: true,
    neighborhood
  });
});

// Get current user's neighborhood
export const getCurrentNeighborhood = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id);
  
  if (!user.neighborhoodId) {
    throw new NotFoundError('User is not associated with any neighborhood');
  }

  const neighborhood = await NeighborhoodModel.findById(user.neighborhoodId)
    .populate('members', 'name email');
    
  if (!neighborhood) {
    throw new NotFoundError('Neighborhood');
  }

  res.status(200).json({
    success: true,
    neighborhood
  });
});