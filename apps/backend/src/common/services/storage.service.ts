import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs/promises';
import path from 'path';
import { env } from '@/config/environment';
import { AppError } from '@/common/errors/app-error';
import httpStatus from 'http-status';

export type StorageProvider = 'local' | 'r2';

export interface UploadResult {
  url: string;
  key: string;
  provider: StorageProvider;
}

export interface StorageConfig {
  provider: StorageProvider;
  localPath?: string;
  r2?: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl?: string;
  };
}

class StorageService {
  private config: StorageConfig;
  private s3Client: S3Client | null = null;

  constructor() {
    this.config = {
      provider: (env.storage?.provider as StorageProvider) || 'local',
      localPath: env.storage?.localPath || path.join(process.cwd(), 'uploads'),
      r2: env.storage?.r2,
    };

    if (this.config.provider === 'r2' && this.config.r2) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${this.config.r2.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: this.config.r2.accessKeyId,
          secretAccessKey: this.config.r2.secretAccessKey,
        },
      });
    }

    // Ensure local upload directory exists
    if (this.config.provider === 'local' && this.config.localPath) {
      this.ensureLocalDirectory();
    }
  }

  private async ensureLocalDirectory(): Promise<void> {
    try {
      await fs.access(this.config.localPath!);
    } catch {
      await fs.mkdir(this.config.localPath!, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
    customFileName?: string,
  ): Promise<UploadResult> {
    if (this.config.provider === 'r2') {
      return this.uploadToR2(file, folder, customFileName);
    }
    return this.uploadToLocal(file, folder, customFileName);
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    folder: string,
    customFileName?: string,
  ): Promise<UploadResult> {
    await this.ensureLocalDirectory();

    const folderPath = path.join(this.config.localPath!, folder);
    await fs.mkdir(folderPath, { recursive: true });

    const fileName = customFileName || `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    const filePath = path.join(folderPath, fileName);

    await fs.writeFile(filePath, file.buffer);

    const relativePath = `/uploads/${folder}/${fileName}`;
    const key = `${folder}/${fileName}`;

    // Construct full URL using API base URL from environment or default
    const apiBaseUrl = process.env.API_BASE_URL || process.env.API_URL || `http://localhost:${env.port || 4000}`;
    const url = `${apiBaseUrl}${relativePath}`;

    return {
      url,
      key,
      provider: 'local',
    };
  }

  private async uploadToR2(
    file: Express.Multer.File,
    folder: string,
    customFileName?: string,
  ): Promise<UploadResult> {
    if (!this.s3Client || !this.config.r2) {
      throw new AppError('R2 storage not configured', httpStatus.INTERNAL_SERVER_ERROR);
    }

    const fileName = customFileName || `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.config.r2.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const url = this.config.r2.publicUrl
      ? `${this.config.r2.publicUrl}/${key}`
      : `https://${this.config.r2.bucketName}.${this.config.r2.accountId}.r2.cloudflarestorage.com/${key}`;

    return {
      url,
      key,
      provider: 'r2',
    };
  }

  async deleteFile(key: string): Promise<void> {
    if (this.config.provider === 'r2') {
      return this.deleteFromR2(key);
    }
    return this.deleteFromLocal(key);
  }

  private async deleteFromLocal(key: string): Promise<void> {
    const filePath = path.join(this.config.localPath!, key);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore error
    }
  }

  private async deleteFromR2(key: string): Promise<void> {
    if (!this.s3Client || !this.config.r2) {
      throw new AppError('R2 storage not configured', httpStatus.INTERNAL_SERVER_ERROR);
    }

    const command = new DeleteObjectCommand({
      Bucket: this.config.r2.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.config.provider !== 'r2' || !this.s3Client || !this.config.r2) {
      throw new AppError('Signed URLs only available for R2 storage', httpStatus.BAD_REQUEST);
    }

    const command = new GetObjectCommand({
      Bucket: this.config.r2.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  getProvider(): StorageProvider {
    return this.config.provider;
  }
}

export const storageService = new StorageService();

