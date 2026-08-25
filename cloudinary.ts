import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export { cloudinary };

/**
 * Upload a buffer to Cloudinary and return the secure URL.
 */
export const uploadBuffer = (
  buffer: Buffer,
  folder: string = 'akwasi/listings'
): Promise<{ url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error('Cloudinary upload failed'));
        }
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete an asset from Cloudinary using its public_id.
 */
export const deleteByPublicId = async (publicId: string): Promise<boolean> => {
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === 'ok';
  } catch (err) {
    console.error('Cloudinary destroy error for publicId:', publicId, err);
    return false;
  }
};

/**
 * Extract public_id from a Cloudinary URL and delete the asset.
 */
export const deleteByUrl = async (url: string): Promise<boolean> => {
  if (!url || !url.includes('cloudinary.com')) {
    return false; // Not a Cloudinary URL
  }
  try {
    // Example Cloudinary URL:
    // https://res.cloudinary.com/cloudname/image/upload/v1234567890/akwasi/listings/filename.jpg
    const parts = url.split('/upload/');
    if (parts.length < 2) return false;

    // Remove version prefix if present (e.g. v1234567890/)
    let publicIdWithExt = parts[1].replace(/^v\d+\//, '');

    // Strip extension
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      publicIdWithExt = publicIdWithExt.substring(0, lastDotIndex);
    }

    return await deleteByPublicId(publicIdWithExt);
  } catch (err) {
    console.error('Cloudinary deleteByUrl error:', url, err);
    return false;
  }
};
