import { NextRequest, NextResponse } from "next/server";
import { ObjectStorageService, ObjectNotFoundError } from "@/lib/objectStorage";
import { Readable } from "stream";

const objectStorageService = new ObjectStorageService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: raw } = await params;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

    const response = await objectStorageService.downloadObject(objectFile);

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      console.warn("Object not found:", error);
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }
    console.error("Error serving object:", error);
    return NextResponse.json({ error: "Failed to serve object" }, { status: 500 });
  }
}
