import { NextRequest, NextResponse } from "next/server";

function extractFileKey(url: string): string | null {
  const patterns = [
    /figma\.com\/file\/([a-zA-Z0-9]+)/,
    /figma\.com\/design\/([a-zA-Z0-9]+)/,
    /figma\.com\/proto\/([a-zA-Z0-9]+)/,
    /figma\.com\/board\/([a-zA-Z0-9]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

type FigmaNode = {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
};

function collectFrames(
  node: FigmaNode,
  pageId: string,
  pageName: string,
  out: { id: string; name: string; pageId: string; pageName: string }[],
) {
  if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
    out.push({ id: node.id, name: node.name, pageId, pageName });
  }
  if (node.children) {
    for (const child of node.children) {
      collectFrames(child, pageId, pageName, out);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { fileUrl, accessToken } = body;
    
    if (typeof fileUrl !== "string" || !fileUrl.trim()) {
      return NextResponse.json({ error: "fileUrl is required" }, { status: 400 });
    }
    if (typeof accessToken !== "string" || !accessToken.trim()) {
      return NextResponse.json({ error: "accessToken is required" }, { status: 400 });
    }
    const fileKey = extractFileKey(fileUrl);
    if (!fileKey) {
      return NextResponse.json({ error: "Could not extract Figma file key from URL. Paste a full Figma file URL." }, { status: 400 });
    }

    const figmaRes = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=2`, {
      headers: { "X-Figma-Token": accessToken },
    });

    if (!figmaRes.ok) {
      if (figmaRes.status === 403) {
        return NextResponse.json({ error: "Invalid Figma access token or insufficient permissions." }, { status: 422 });
      }
      if (figmaRes.status === 404) {
        return NextResponse.json({ error: "Figma file not found. Check the URL and your access." }, { status: 422 });
      }
      return NextResponse.json({ error: `Figma API error: ${figmaRes.status}` }, { status: 422 });
    }

    const data = await figmaRes.json() as {
      name: string;
      document: { children: FigmaNode[] };
    };

    const pages = (data.document.children ?? []).map((p: FigmaNode) => ({
      id: p.id,
      name: p.name,
    }));

    const allFrames: { id: string; name: string; pageId: string; pageName: string }[] = [];
    for (const page of data.document.children ?? []) {
      if (page.children) {
        for (const node of page.children) {
          collectFrames(node, page.id, page.name, allFrames);
        }
      }
    }

    const frameIds = allFrames.slice(0, 50).map((f) => f.id);
    let thumbnailMap: Record<string, string> = {};

    if (frameIds.length > 0) {
      try {
        const imgRes = await fetch(
          `https://api.figma.com/v1/images/${fileKey}?ids=${frameIds.join(",")}&format=png&scale=1`,
          { headers: { "X-Figma-Token": accessToken } },
        );
        if (imgRes.ok) {
          const imgData = await imgRes.json() as { images?: Record<string, string> };
          thumbnailMap = imgData.images ?? {};
        }
      } catch {
        // thumbnails are optional — don't fail the whole request
      }
    }

    const frames = allFrames.slice(0, 50).map((f) => ({
      ...f,
      thumbnailUrl: thumbnailMap[f.id] ?? null,
    }));

    return NextResponse.json({
      fileName: data.name,
      pages,
      frames,
    });
  } catch (err) {
    console.error("Figma extract error:", err);
    return NextResponse.json({ error: "Failed to connect to Figma API." }, { status: 500 });
  }
}
