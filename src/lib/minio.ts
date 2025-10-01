import { Client } from "minio";

// MinIO client singleton
let minioClient: Client | null = null;

export function getMinioClient(): Client {
	if (!minioClient) {
		minioClient = new Client({
			endPoint: process.env.MINIO_ENDPOINT || "localhost",
			port: parseInt(process.env.MINIO_PORT || "9000"),
			useSSL: process.env.MINIO_USE_SSL === "true",
			accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
			secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
		});
	}
	return minioClient;
}

export const MINIO_BUCKET = process.env.MINIO_BUCKET || "cms-media";
export const MINIO_PUBLIC_URL = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || "http://localhost:9000";

/**
 * Get public URL for a MinIO object
 */
export function getMinioPublicUrl(objectName: string): string {
	return `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${objectName}`;
}

/**
 * Ensure bucket exists
 */
export async function ensureBucketExists(): Promise<void> {
	const client = getMinioClient();
	const bucketExists = await client.bucketExists(MINIO_BUCKET);

	if (!bucketExists) {
		await client.makeBucket(MINIO_BUCKET, "us-east-1");

		// Set bucket policy to allow public read access
		const policy = {
			Version: "2012-10-17",
			Statement: [
				{
					Effect: "Allow",
					Principal: { AWS: ["*"] },
					Action: ["s3:GetObject"],
					Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
				},
			],
		};

		await client.setBucketPolicy(MINIO_BUCKET, JSON.stringify(policy));
	}
}
