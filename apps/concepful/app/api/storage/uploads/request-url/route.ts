import { NextRequest, NextResponse } from "next/server";
import { RequestUploadUrlBody, RequestUploadUrlResponse } from "@workspace/api-zod";
import { ObjectStorageService } from "@/lib/objectStorage";

const objectStorageService = new ObjectStorageService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestUploadUrlBody.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
    }

    const { name, size, contentType } = parsed.data;

    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    return NextResponse.json(
      RequestUploadUrlResponse.parse({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      })
    );
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
