import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imdbID: {
      type: String,
      required: true,
    },
    title: String,
    year: String,
    poster: String,
    type: String,
  },
  { timestamps: true }
);

// One favorite per user per movie
favoriteSchema.index({ userId: 1, imdbID: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
