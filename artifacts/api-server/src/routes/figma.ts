import { Router } from "express";

const router = Router();

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

router.post("/figma/extract", async (req, res) => {
  const { fileUrl, accessToken } = req.body ?? {};
  if (typeof fileUrl !== "string" || !fileUrl.trim()) {
    return res.status(400).json({ error: "fileUrl is required" });
  }
  if (typeof accessToken !== "string" || !accessToken.trim()) {
    return res.status(400).json({ error: "accessToken is required" });
  }
  const fileKey = extractFileKey(fileUrl);
  if (!fileKey) {
    return res.status(400).json({ error: "Could not extract Figma file key from URL. Paste a full Figma file URL." });
  }

  try {
    const figmaRes = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=2`, {
      headers: { "X-Figma-Token": accessToken },
    });

    if (!figmaRes.ok) {
      if (figmaRes.status === 403) {
        return res.status(422).json({ error: "Invalid Figma access token or insufficient permissions." });
      }
      if (figmaRes.status === 404) {
        return res.status(422).json({ error: "Figma file not found. Check the URL and your access." });
      }
      return res.status(422).json({ error: `Figma API error: ${figmaRes.status}` });
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

    return res.json({
      fileName: data.name,
      pages,
      frames,
    });
  } catch (err) {
    console.error("Figma extract error:", err);
    return res.status(500).json({ error: "Failed to connect to Figma API." });
  }
});

export default router;
