import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type PutObjectCommandOutput,
  type GetObjectCommandOutput,
  type DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MinioService {
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!,
        secretAccessKey: process.env.MINIO_SECRET_KEY!,
      },
      forcePathStyle: true,
    });
  }

  async upload(
    bucket: string,
    key: string,
    body: Buffer,
    mimeType: string,
  ): Promise<PutObjectCommandOutput> {
    return this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      }),
    );
  }

  async get(
    bucket: string,
    key: string,
  ): Promise<GetObjectCommandOutput> {
    return this.s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }

  async remove(
    bucket: string,
    key: string,
  ): Promise<DeleteObjectCommandOutput> {
    return this.s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }

  // ⭐ PREVIEW UCHUN ASOSIY METOD
  async getPresignedUrl(
    bucket: string,
    key: string,
    expiresInSeconds = 300,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: expiresInSeconds,
    });
  }
}
