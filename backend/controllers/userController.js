import UserModel from '../models/User.js';
import NeighborhoodModel from '../models/Neighborhood.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { 
  asyncHandler, 
  validateRequired, 
  checkResourceExists,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError
} from '../middleware/errorHandler.js';

// Register user with improved error handling
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, neighborhoodId, profilePic, role } = req.body;

  // Validate required fields
  validateRequired(req.body, ['name', 'email', 'password']);

  // Check if neighborhood exists
  const neighborhood = await checkResourceExists(NeighborhoodModel, neighborhoodId);

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    neighborhoodId,
    profilePic,
    role: role || 'user',
  });

  // Add user to neighborhood
  neighborhood.members.push(user._id);
  await neighborhood.save();
  
  // Generate token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.status(201).json({ 
    success: true,
    message: 'User registered successfully', 
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      neighborhoodId: user.neighborhoodId
    }, 
    token 
  });
});

// Login user with improved error handling
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, isAdmin } = req.body;

  // Validate required fields
  validateRequired(req.body, ['email', 'password']);

  // Find user
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Check role match
  if ((isAdmin && user.role !== 'admin') || (!isAdmin && user.role !== 'user')) {
    throw new UnauthorizedError('Invalid credentials for this role');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate token
  const token = jwt.sign(
    { userId: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      neighborhoodId: user.neighborhoodId,
    },
  });
});

// Delete user with improved error handling
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await checkResourceExists(UserModel, userId);
  await UserModel.findByIdAndDelete(userId);

  res.status(200).json({ 
    success: true,
    message: 'User deleted successfully' 
  });
});

// Get users with filtering, sorting, and pagination
export const getUsers = asyncHandler(async (req, res) => {
  const { 
    name, 
    email, 
    neighborhoodId, 
    role, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = req.query;

  // Build filter object
  const filter = {};
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (email) filter.email = { $regex: email, $options: 'i' };
  if (neighborhoodId) filter.neighborhoodId = neighborhoodId;
  if (role) filter.role = role;

  // Build sort options
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOptions = { [sortBy]: sortDirection };

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query with pagination
  const [users, totalUsers] = await Promise.all([
    UserModel.find(filter)
      .select('-password')
      .populate('neighborhoodId', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit)),
    UserModel.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    users,
    pagination: {
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: Number(page),
      limit: Number(limit)
    }
  });
});

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new ValidationError('Only image files are allowed'), false);
    }
  }
});

export const uploadProfilePic = upload.single('profilePic');

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user._id)
    .select('-password')
    .populate('neighborhoodId', 'name');
  
  if (!user) {
    throw new NotFoundError('User');
  }

  res.status(200).json({
    success: true,
    user
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const user = await UserModel.findById(req.user._id);

  if (!user) {
    throw new NotFoundError('User');
  }

  // Update basic info
  if (name) user.name = name;
  if (email) {
    // Check if email is already taken by another user
    const existingUser = await UserModel.findOne({ email, _id: { $ne: user._id } });
    if (existingUser) {
      throw new ConflictError('Email already taken');
    }
    user.email = email;
  }

  // Handle password change
  if (currentPassword && newPassword) {
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  // Handle profile picture upload
  if (req.file) {
    user.profilePic = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
    user.profilePicUrl = `http://localhost:8000/api/users/profile/picture/${user._id}`;
  }

  await user.save();

  // Return updated user without password
  const updatedUser = user.toObject();
  delete updatedUser.password;

  res.status(200).json({
    success: true,
    user: updatedUser
  });
});

// Get profile picture
export const getProfilePic = asyncHandler(async (req, res) => {
  const user = await checkResourceExists(UserModel, req.params.userId);

  if (user.profilePic && user.profilePic.data) {
    res.set('Content-Type', user.profilePic.contentType);
    return res.send(user.profilePic.data);
  }

  // Redirect to default picture
  res.redirect('https://www.pngarts.com/files/10/Default-Profile-Picture-PNG-Free-Download.png');
});