import PointOfInterestModel from '../models/PointOfInterest.js';
import NeighborhoodModel from '../models/Neighborhood.js';

// Get points of interest for a specific neighborhood with optional filtering
export const getPointsOfInterest = async (req, res) => {
  try {
    const { neighborhoodId } = req.params;
    const { filter } = req.query;

    let query = { neighborhoodId };
    if (filter && filter !== 'all') {
      query.category = filter;
    }

    const points = await PointOfInterestModel.find(query);
    res.json({ success: true, points });
  } catch (error) {
    console.error('Error fetching points of interest:', error);
    res.status(500).json({ success: false, message: 'Error fetching points of interest' });
  }
};

// Get current user's neighborhood with coordinates
export const getCurrentNeighborhood = async (req, res) => {
  try {
    const userId = req.user._id;
    const neighborhood = await NeighborhoodModel.findOne({
      members: userId
    });

    if (!neighborhood) {
      return res.status(404).json({
        success: false,
        message: 'No neighborhood found for current user'
      });
    }

    res.json({ success: true, neighborhood });
  } catch (error) {
    console.error('Error fetching current neighborhood:', error);
    res.status(500).json({ success: false, message: 'Error fetching neighborhood data' });
  }
};

// Add a new point of interest
export const addPointOfInterest = async (req, res) => {
  try {
    const { name, description, category, coordinates, address, contactInfo } = req.body;
    const { neighborhoodId } = req.params;

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
    res.status(201).json({ success: true, point: newPoint });
  } catch (error) {
    console.error('Error adding point of interest:', error);
    res.status(500).json({ success: false, message: 'Error adding point of interest' });
  }
};

// Update a point of interest
export const updatePointOfInterest = async (req, res) => {
  try {
    const { pointId } = req.params;
    const updates = req.body;

    const updatedPoint = await PointOfInterestModel.findByIdAndUpdate(
      pointId,
      updates,
      { new: true }
    );

    if (!updatedPoint) {
      return res.status(404).json({
        success: false,
        message: 'Point of interest not found'
      });
    }

    res.json({ success: true, point: updatedPoint });
  } catch (error) {
    console.error('Error updating point of interest:', error);
    res.status(500).json({ success: false, message: 'Error updating point of interest' });
  }
};

// Delete a point of interest
export const deletePointOfInterest = async (req, res) => {
  try {
    const { pointId } = req.params;

    const deletedPoint = await PointOfInterestModel.findByIdAndDelete(pointId);

    if (!deletedPoint) {
      return res.status(404).json({
        success: false,
        message: 'Point of interest not found'
      });
    }

    res.json({ success: true, message: 'Point of interest deleted successfully' });
  } catch (error) {
    console.error('Error deleting point of interest:', error);
    res.status(500).json({ success: false, message: 'Error deleting point of interest' });
  }
};