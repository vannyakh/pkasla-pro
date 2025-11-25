import sharp from 'sharp';
import { AppError } from '@/common/errors/app-error';
import httpStatus from 'http-status';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 1-100
  format?: 'jpeg' | 'png' | 'webp';
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 80,
  format: 'jpeg',
};

/**
 * Compresses an image buffer with the given options
 * @param buffer - The image buffer to compress
 * @param options - Compression options
 * @returns Compressed image buffer and metadata
 */
export async function compressImage(
  buffer: Buffer,
  options: CompressionOptions = {},
): Promise<{ buffer: Buffer; mimetype: string; size: number }> {
  try {
    const config = { ...DEFAULT_OPTIONS, ...options };
    
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    
    // Determine output format based on input or config
    let outputFormat: 'jpeg' | 'png' | 'webp' = config.format;
    if (metadata.format === 'png' && config.format === 'jpeg') {
      // Keep PNG format if original is PNG (for transparency)
      outputFormat = 'png';
    }

    // Create sharp instance with resize and format conversion
    let sharpInstance = sharp(buffer)
      .resize(config.maxWidth, config.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });

    // Apply format-specific compression
    switch (outputFormat) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality: config.quality, progressive: true });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality: config.quality, compressionLevel: 9 });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality: config.quality });
        break;
    }

    // Compress the image
    const compressedBuffer = await sharpInstance.toBuffer();
    
    // Determine mimetype
    const mimetype = `image/${outputFormat}`;

    return {
      buffer: compressedBuffer,
      mimetype,
      size: compressedBuffer.length,
    };
  } catch (error) {
    throw new AppError(
      `Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

/**
 * Compresses an avatar image with optimized settings
 * @param buffer - The image buffer to compress
 * @returns Compressed image buffer and metadata
 */
export async function compressAvatar(buffer: Buffer): Promise<{ buffer: Buffer; mimetype: string; size: number }> {
  return compressImage(buffer, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 85,
    format: 'jpeg',
  });
}

