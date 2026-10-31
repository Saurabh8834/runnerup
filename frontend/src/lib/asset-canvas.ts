/**
 * Client-Side Canvas Renderer for Official IAF Challenge Bib & Certificate.
 * 
 * 100% Zero Backend / Cloud resource utilization.
 * Runs instantly in the user's browser in <10ms using cached static clean bases.
 */

export type BibRenderData = {
  runnerName: string;
  distance: string;
  positionStr: string;
};

export type CertRenderData = {
  runnerName: string;
  distance: string;
  dateStr?: string;
};

let fontLoadPromise: Promise<void> | null = null;

export async function ensureCanvasFonts(): Promise<void> {
  if (typeof window === "undefined" || !("fonts" in document)) return;

  if (!fontLoadPromise) {
    fontLoadPromise = (async () => {
      try {
        const alexBrush = new FontFace("AlexBrush", "url(/fonts/AlexBrush-Regular.ttf)");
        const arialBlack = new FontFace("OfficialArialBlack", "url(/fonts/ArialBlack.ttf)");
        const timesBold = new FontFace("OfficialTimesBold", "url(/fonts/TimesBold.ttf)");

        const results = await Promise.allSettled([
          alexBrush.load(),
          arialBlack.load(),
          timesBold.load(),
        ]);

        results.forEach((res) => {
          if (res.status === "fulfilled") {
            document.fonts.add(res.value);
          }
        });

        await document.fonts.ready;
      } catch (e) {
        console.warn("Could not load custom web fonts, falling back to system fonts", e);
      }
    })();
  }

  await fontLoadPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load base image: ${src}`));
    img.src = src;
  });
}

/**
 * Render Official Bib onto HTML5 Canvas
 */
export async function renderBibCanvas(data: BibRenderData): Promise<HTMLCanvasElement> {
  await ensureCanvasFonts();

  const baseImg = await loadImage("/iaf-bib-clean-base.jpg");
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 682;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D canvas context");

  // Draw clean full-bleed base
  ctx.drawImage(baseImg, 0, 0, 1024, 682);

  // 1. Distance header (e.g. "10 KM" / "5 KM")
  let distStr = (data.distance || "5 KM").toUpperCase().trim();
  if (!distStr.endsWith("KM") && !distStr.endsWith("K")) distStr += " KM";
  ctx.font = `900 26px "OfficialArialBlack", "Arial Black", "Impact", "Arial", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#874f41";
  ctx.fillText(distStr, 512, 318);

  // 2. Big Rank Position (e.g. "0002", "0010")
  const posStr = data.positionStr || "0001";
  ctx.font = `900 170px "OfficialArialBlack", "Arial Black", "Impact", "Arial", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#001834";
  ctx.fillText(posStr, 512, 426);

  // 3. Runner Name in bottom badge
  const nameClean = (data.runnerName || "RUNNER").toUpperCase().trim();
  let nameSize = 22;
  if (nameClean.length > 20) nameSize = 18;
  else if (nameClean.length > 15) nameSize = 20;

  ctx.font = `900 ${nameSize}px "OfficialArialBlack", "Arial Black", "Impact", "Arial", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`— ${nameClean} —`, 512, 563);

  return canvas;
}

/**
 * Render Official Certificate onto HTML5 Canvas
 */
export async function renderCertCanvas(data: CertRenderData): Promise<HTMLCanvasElement> {
  await ensureCanvasFonts();

  const baseImg = await loadImage("/iaf-cert-clean-base.jpg");
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 682;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D canvas context");

  // Draw clean base
  ctx.drawImage(baseImg, 0, 0, 1024, 682);

  // 1. Runner Name in metallic gold serif with shadow
  const nameClean = (data.runnerName || "RUNNER").toUpperCase().trim();
  let nameSize = 34;
  if (nameClean.length > 22) nameSize = 24;
  else if (nameClean.length > 16) nameSize = 28;

  ctx.font = `bold ${nameSize}px "OfficialTimesBold", "Times New Roman", Times, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Subtle dark shadow
  ctx.fillStyle = "#050a14";
  ctx.fillText(nameClean, 513, 308);
  // Metallic gold fill
  ctx.fillStyle = "#f6d791";
  ctx.fillText(nameClean, 512, 307);

  // 2. Distance number (e.g. "10" or "5")
  const distVal = data.distance.toUpperCase().replace("KM", "").replace("K", "").trim() || "5";
  ctx.font = `bold 22px "OfficialTimesBold", "Times New Roman", Times, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#050a14";
  ctx.fillText(distVal, 331, 477);
  ctx.fillStyle = "#f6d791";
  ctx.fillText(distVal, 330, 476);

  // 3. Date
  const dateStr = data.dateStr || "31  /  10  /  2026";
  ctx.fillStyle = "#050a14";
  ctx.fillText(dateStr, 523, 477);
  ctx.fillStyle = "#f6d791";
  ctx.fillText(dateStr, 522, 476);

  // 4. Delicate Signature
  ctx.font = `28px "AlexBrush", "Brush Script MT", "Segoe Script", cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#050a14";
  ctx.fillText("Runnerup", 696, 473);
  ctx.fillStyle = "#f6d791";
  ctx.fillText("Runnerup", 695, 472);

  return canvas;
}

/**
 * Trigger instant browser download from Canvas with 0 server involvement
 */
export function triggerCanvasDownload(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas export failed"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        resolve();
      },
      "image/jpeg",
      0.99,
    );
  });
}
