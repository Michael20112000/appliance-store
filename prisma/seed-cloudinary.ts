import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryConfig } from "../src/lib/cloudinary";
import {
  CATEGORY_PEXELS_POOL,
  pexelsImageUrl,
  resolvePexelsPhotoId,
  seedImagePublicId,
} from "./seed-image-pools";

const uploadedKeys = new Set<string>();

function configureCloudinary() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
}

async function resourceExists(publicId: string): Promise<boolean> {
  try {
    await cloudinary.api.resource(publicId, { resource_type: "image" });
    return true;
  } catch {
    return false;
  }
}

async function uploadFromUrl(publicId: string, sourceUrl: string): Promise<void> {
  await cloudinary.uploader.upload(sourceUrl, {
    public_id: publicId,
    overwrite: false,
    unique_filename: false,
    resource_type: "image",
  });
}

/**
 * Returns Cloudinary public_id for a category pool image (uploads from Pexels on first run).
 */
export async function ensureCategorySeedImage(
  categorySlug: string,
  indexInCategory: number,
): Promise<string> {
  if (process.env.SEED_SKIP_IMAGE_UPLOAD === "1") {
    return seedImagePublicId(categorySlug, indexInCategory % 14);
  }

  const photoId = resolvePexelsPhotoId(categorySlug, indexInCategory);
  const pool = CATEGORY_PEXELS_POOL[categorySlug];
  const poolIndex = pool ? indexInCategory % pool.length : indexInCategory % 14;
  const publicId = seedImagePublicId(categorySlug, poolIndex);
  const cacheKey = `${categorySlug}:${poolIndex}`;

  if (uploadedKeys.has(cacheKey)) {
    return publicId;
  }

  configureCloudinary();

  if (!(await resourceExists(publicId))) {
    const sourceUrl = pexelsImageUrl(photoId);
    try {
      await uploadFromUrl(publicId, sourceUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Seed image upload failed for ${publicId} (${sourceUrl}): ${message}`);
    }
  }

  uploadedKeys.add(cacheKey);
  return publicId;
}
