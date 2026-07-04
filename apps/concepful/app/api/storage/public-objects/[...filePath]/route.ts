import { NextRequest, NextResponse } from "next/server";
import { ObjectStorageService, ObjectNotFoundError } from "@/lib/objectStorage";
import { Readable } from "stream";

const objectStorageService = new ObjectStorageService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filePath: string[] }> }
) {
  try {
    const { filePath: raw } = await params;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const response = await objectStorageService.downloadObject(file);

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error("Error serving public object:", error);
    return NextResponse.json({ error: "Failed to serve public object" }, { status: 500 });
  }
}
