import mongoose from "mongoose";

const pointOfInterestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['hotels', 'attractions', 'restaurants'],
      required: true
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    neighborhoodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'neighborhoods',
      required: true
    },
    address: { type: String },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    images: [{
      type: String
    }],
    contactInfo: {
      phone: String,
      website: String,
      email: String
    }
  },
  { timestamps: true }
);

const PointOfInterestModel = mongoose.model("points_of_interest", pointOfInterestSchema);
export default PointOfInterestModel;