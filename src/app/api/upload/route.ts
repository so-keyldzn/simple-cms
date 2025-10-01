import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/lib/auth";
import { headers } from "next/headers";
import { getMinioClient, MINIO_BUCKET, getMinioPublicUrl, ensureBucketExists } from "@/lib/minio";
import { createMedia } from "@/features/admin/lib/media-actions";
import sharp from "sharp";

export async function POST(request: NextRequest) {
	try {
		// Check authentication
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
		}

		// Check permissions
		const userRoles = session.user.role?.split(",") || [];
		const hasAccess = ["admin", "super-admin", "editor", "author"].some((role) =>
			userRoles.includes(role)
		);

		if (!hasAccess) {
			return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
		}

		// Parse form data
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
		}

		// Validate file size (max 10MB)
		const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{ error: "Fichier trop volumineux (max 10MB)" },
				{ status: 400 }
			);
		}

		// Generate unique filename
		const timestamp = Date.now();
		const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
		const filename = `${timestamp}-${sanitizedName}`;

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Upload to MinIO
		const minioClient = getMinioClient();
		await ensureBucketExists();

		await minioClient.putObject(
			MINIO_BUCKET,
			filename,
			buffer,
			file.size,
			{
				"Content-Type": file.type,
			}
		);

		// Get public URL
		const url = getMinioPublicUrl(filename);

		// Get image dimensions if it's an image
		let width: number | undefined;
		let height: number | undefined;

		if (file.type.startsWith("image/")) {
			try {
				const metadata = await sharp(buffer).metadata();
				width = metadata.width;
				height = metadata.height;
			} catch (error) {
				console.error("Error getting image dimensions:", error);
				// Continue without dimensions if extraction fails
			}
		}

		// Create media entry in database
		const result = await createMedia({
			filename,
			originalName: file.name,
			url,
			mimeType: file.type,
			size: file.size,
			width,
			height,
		});

		if (result.error) {
			// Try to delete uploaded file if database insert fails
			try {
				await minioClient.removeObject(MINIO_BUCKET, filename);
			} catch (deleteError) {
				console.error("Error deleting file after failed DB insert:", deleteError);
			}
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			data: result.data,
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: "Erreur lors de l'upload" },
			{ status: 500 }
		);
	}
}
