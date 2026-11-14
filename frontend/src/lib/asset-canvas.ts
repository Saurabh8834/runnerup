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
  isCancerEvent?: boolean;
  isKineticEvent?: boolean;
};

export type CertRenderData = {
  runnerName: string;
  distance: string;
  dateStr?: string;
  category?: string;
  isCancerEvent?: boolean;
  isKineticEvent?: boolean;
  isAdminDemo?: boolean;
};

export type StoryRenderData = {
  runnerName: string;
  distance: string;
  paceStr?: string;
  timeStr?: string;
  tierName?: "SPEEDSTER" | "PACER" | "LEGEND" | "CHAMPION" | "FINISHER";
  bibNumber?: string;
  medalSide?: "front" | "back";
  isKineticEvent?: boolean;
  storyMode?: "finisher" | "pledge"; // "finisher" = post-race achievement flex; "pledge" = pre-race commitment / I'm In
  isPaid?: boolean; // true = Paid ₹499 Finisher Kit; false = Unpaid Challenger (upsell mode)
};

/**
 * Format runner name for Cancer certificate:
 * If the name is too long (>22 chars or >=3 words), cleanly take the First Name and Last Name
 * so it looks balanced and never overflows the designated field.
 */
export function formatCertificateRunnerName(fullName: string): string {
  if (!fullName) return "Runner";
  let cleaned = fullName.replace(/\((?:admin|runner|athlete|tester)\)/gi, "").trim().replace(/\s+/g, " ");
  if (cleaned.length <= 22) {
    return toTitleCase(cleaned);
  }
  const parts = cleaned.split(" ");
  if (parts.length >= 3) {
    const abbreviated = `${parts[0]} ${parts[parts.length - 1]}`;
    if (abbreviated.length <= 22) {
      return toTitleCase(abbreviated);
    }
    return toTitleCase(`${parts[0]} ${parts[1]}`);
  }
  return toTitleCase(cleaned.slice(0, 22));
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

  if (
    data.isKineticEvent ||
    (data.positionStr &&
      (data.positionStr.toUpperCase().startsWith("KRUN") ||
        data.positionStr.toUpperCase().startsWith("KRVC")))
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 686;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire 2D canvas context");

    // 1. Sleek athletic background (Carbon Slate with Orange/Red Energy Angles)
    ctx.fillStyle = "#090d12";
    ctx.fillRect(0, 0, 1024, 686);

    // Dynamic geometric background slashes (matching medal ribbon)
    ctx.save();
    ctx.fillStyle = "#ff4500";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(240, 0);
    ctx.lineTo(80, 686);
    ctx.lineTo(0, 686);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.moveTo(1024, 0);
    ctx.lineTo(820, 0);
    ctx.lineTo(940, 686);
    ctx.lineTo(1024, 686);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(240, 0);
    ctx.lineTo(260, 0);
    ctx.lineTo(100, 686);
    ctx.lineTo(80, 686);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. High-contrast inner bib card (White placard with orange accent line)
    const cardX = 64, cardY = 56, cardW = 896, cardH = 574, cardR = 20;
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 12;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#ff4500";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // Top Card Header Bar in Carbon
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, 100, [cardR, cardR, 0, 0]);
    ctx.fillStyle = "#0f172a";
    ctx.fill();

    // Gold/Orange trim line
    ctx.fillStyle = "#ff4500";
    ctx.fillRect(cardX, cardY + 96, cardW, 4);

    // Event Title in Header
    ctx.font = `bold 22px "OfficialArialBlack", "Arial Black", "Arial", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("RUNNERUP · KINETIC RUN VIRTUAL CHALLENGE 2026", 512, cardY + 38);

    ctx.font = `bold 14px "Arial", sans-serif`;
    ctx.fillStyle = "#f59e0b";
    ctx.fillText("⚡ CHALLENGE YOUR LIMITS · GPS VERIFIED ATHLETE ⚡", 512, cardY + 70);
    ctx.restore();

    // 3. Participant Name
    const nameClean = (data.runnerName || "PARTICIPANT").toUpperCase().trim();
    ctx.font = `bold 42px "Times New Roman", "Georgia", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(nameClean, 512, 225);

    // 4. Distance Pill Badge
    let distStr = (data.distance || "5 KM").toUpperCase().trim();
    if (!distStr.endsWith("KM") && !distStr.endsWith("K")) distStr += " KM";
    ctx.save();
    ctx.fillStyle = "#fff7ed";
    ctx.strokeStyle = "#ea580c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(412, 268, 200, 36, 18);
    ctx.fill();
    ctx.stroke();
    ctx.font = `900 16px "OfficialArialBlack", "Arial Black", "Arial", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ea580c";
    ctx.fillText(distStr, 512, 287);
    ctx.restore();

    // 5. Giant Bib Number
    const bibDisplay = (data.positionStr || "KRUN-1001").toUpperCase().trim();
    let fontSize = 110;
    if (bibDisplay.length > 10) fontSize = 82;
    else if (bibDisplay.length > 8) fontSize = 95;

    ctx.font = `900 ${fontSize}px "OfficialArialBlack", "Arial Black", "Impact", "Arial", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Bevel stroke in fiery kinetic orange
    ctx.strokeStyle = "#ea580c";
    ctx.lineWidth = 6;
    ctx.strokeText(bibDisplay, 512, 410);

    // Deep midnight slate fill
    ctx.fillStyle = "#0f172a";
    ctx.fillText(bibDisplay, 512, 410);

    // 6. Card Bottom Footer
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY + cardH - 64, cardW, 64, [0, 0, cardR, cardR]);
    ctx.fillStyle = "#f8fafc";
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = `bold 14px "Arial", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#64748b";
    ctx.fillText("OFFICIAL DIGITAL RACE BIB · WWW.RUNNERUP.IN", 512, cardY + cardH - 32);
    ctx.restore();

    return canvas;
  }

  if (data.isCancerEvent || (data.positionStr && data.positionStr.toUpperCase().startsWith("NCAD"))) {
    const baseImg = await loadImage("/cancer-bib-clean-base-master.jpg?v=20261115_v4");
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 686;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire 2D canvas context");

    // Draw clean base with empty white card (preserves corner ribbons and bottom borders)
    ctx.drawImage(baseImg, 0, 0, 1024, 686);

    // 1. Participant Name in commanding bold regal serif (enlarged font as requested)
    const nameClean = (data.runnerName || "PARTICIPANT").toUpperCase().trim();
    ctx.font = `bold 46px "Times New Roman", "Georgia", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#2c124d"; // Royal deep purple
    ctx.fillText(nameClean, 512, 202);

    // 2. Bib Number (e.g. "NCAD-1999")
    const bibDisplay = (data.positionStr || "NCAD-1001").toUpperCase().trim();
    let fontSize = 115;
    if (bibDisplay.length > 10) fontSize = 85;
    else if (bibDisplay.length > 8) fontSize = 100;

    ctx.font = `900 ${fontSize}px "OfficialArialBlack", "Arial Black", "Impact", "Arial", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Gold bevel outline (stroke)
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 5;
    ctx.strokeText(bibDisplay, 512, 380);

    // Deep royal purple fill
    ctx.fillStyle = "#260a44";
    ctx.fillText(bibDisplay, 512, 380);

    return canvas;
  }

  const baseImg = await loadImage("/iaf-bib-clean-base.jpg?v=20261031_v3");
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

  // 2. Big Rank Position / Bib Number (e.g. "1242", "1001")
  const posStr = data.positionStr || "1001";
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
  ctx.fillText(`— ${nameClean} —`, 512, 560);

  return canvas;
}

/**
 * Render Official Certificate onto HTML5 Canvas
 */
export async function renderCertCanvas(data: CertRenderData): Promise<HTMLCanvasElement> {
  await ensureCanvasFonts();

  if (data.isKineticEvent) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 682;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire 2D canvas context");

    // Clean premium athletic parchment / ivory canvas
    ctx.fillStyle = "#fafaf9";
    ctx.fillRect(0, 0, 1024, 682);

    // Ornate multi-tone border
    ctx.save();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, 976, 634);

    ctx.strokeStyle = "#ea580c";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(34, 34, 956, 614);

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, 944, 602);
    ctx.restore();

    // Top Header: RUNNERUP
    ctx.font = `bold 16px "OfficialArialBlack", "Arial Black", "Arial", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ea580c";
    ctx.fillText("RUNNERUP · OFFICIAL FINISHER CERTIFICATE", 512, 80);

    // Large Title
    ctx.font = `bold 32px "Times New Roman", "Georgia", serif`;
    ctx.fillStyle = "#0f172a";
    ctx.fillText("KINETIC RUN VIRTUAL CHALLENGE 2026", 512, 126);

    ctx.font = `italic 15px "Georgia", serif`;
    ctx.fillStyle = "#64748b";
    ctx.fillText("“Challenge Your Limits · Momentum Conquered”", 512, 160);

    // Thin separator
    ctx.fillStyle = "#ea580c";
    ctx.fillRect(412, 184, 200, 2);

    // Presentation text
    ctx.font = `bold 14px "Arial", sans-serif`;
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("PROUDLY PRESENTED TO", 512, 220);

    // Runner Name
    const nameDisplay = formatCertificateRunnerName(data.runnerName);
    ctx.font = `bold 48px "Georgia", "Times New Roman", serif`;
    ctx.fillStyle = "#0f172a";
    ctx.fillText(nameDisplay, 512, 275);

    // Citation
    let distStr = (data.distance || "5 KM").toUpperCase().trim();
    if (!distStr.endsWith("KM") && !distStr.endsWith("K")) distStr += " KM";

    ctx.font = `16px "Georgia", serif`;
    ctx.fillStyle = "#334155";
    ctx.fillText(`For outstanding endurance and successfully completing the verified ${distStr} challenge`, 512, 345);
    ctx.fillText("with GPS-verified tracking, relentless determination, and spirit.", 512, 372);

    // Three Detail Badges (Boxed)
    const badgeY = 445;
    const badges = [
      { label: "CHALLENGE CATEGORY", val: data.category || "Running" },
      { label: "ACHIEVEMENT DISTANCE", val: distStr },
      { label: "OFFICIAL EVENT DATE", val: data.dateStr || "15 Dec 2026" },
    ];

    badges.forEach((b, i) => {
      const bx = 160 + i * 260;
      ctx.save();
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, badgeY, 200, 70, 10);
      ctx.fill();
      ctx.stroke();

      ctx.font = `bold 11px "Arial", sans-serif`;
      ctx.fillStyle = "#64748b";
      ctx.textAlign = "center";
      ctx.fillText(b.label, bx + 100, badgeY + 22);

      ctx.font = `bold 18px "OfficialArialBlack", "Arial Black", "Arial", sans-serif`;
      ctx.fillStyle = "#0f172a";
      ctx.fillText(b.val, bx + 100, badgeY + 50);
      ctx.restore();
    });

    // Verification Seal / Signatures at bottom
    ctx.font = `bold 12px "Arial", sans-serif`;
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.fillText("GPS VERIFIED · AUTHENTIC DIGITAL RECORD", 260, 580);
    ctx.fillText("TEAM RUNNERUP · RACE COMMITTEE", 764, 580);

    ctx.fillStyle = "#94a3b8";
    ctx.font = `11px "Arial", sans-serif`;
    ctx.fillText("Official Verification Seal", 260, 600);
    ctx.fillText("Pan-India Virtual Challenge", 764, 600);

    return canvas;
  }

  if (data.isCancerEvent) {
    // Only apply the new master template to the admin demo user
    if (data.isAdminDemo) {
      const baseImg = await loadImage("/cancer-cert-clean-base-master.jpg?v=20261115_v4");
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 682;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not acquire 2D canvas context");

      // Draw pristine master base
      ctx.drawImage(baseImg, 0, 0, 1024, 682);

      // Draw crisp Leaderboard QR badge at bottom-left next to Team RunnerUp signature
      // (Leaves the medal and medal ribbon 100% visible and unblocked)
      try {
        const qrImg = await loadImage("/cancer-leaderboard-qr.png");
        const qx = 271, qy = 574, qs = 68, r = 6;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(qx + r, qy);
        ctx.arcTo(qx + qs, qy, qx + qs, qy + qs, r);
        ctx.arcTo(qx + qs, qy + qs, qx, qy + qs, r);
        ctx.arcTo(qx, qy + qs, qx, qy, r);
        ctx.arcTo(qx, qy, qx + qs, qy, r);
        ctx.closePath();
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#7e22ce";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.drawImage(qrImg, qx + 4, qy + 4, 60, 60);
        ctx.restore();
      } catch (e) {
        // Fallback if qr not loaded
      }

      // A. Participant Name: exactly centered in name area (x=450, y=284) with prominent bold typography
      const nameDisplay = formatCertificateRunnerName(data.runnerName);
      let nameSize = 52;
      if (nameDisplay.length > 25) nameSize = 36;
      else if (nameDisplay.length > 18) nameSize = 44;

      ctx.font = `bold ${nameSize}px "Georgia", "Times New Roman", Times, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#3b0764"; // Imperial Royal Purple
      ctx.fillText(nameDisplay, 450, 284);

      // B, C, D: The Three Detail Badges (fixed prominent 21px font size, center y=530)
      ctx.font = `bold 21px "Georgia", "Times New Roman", serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#2e104b"; // Deep Plum Purple

      // Challenge Category (directly below Challenge Category label, center x=235, y=530)
      const catDisplay = data.category || "Running";
      ctx.fillText(catDisplay, 235, 530);

      // Issue Date (directly below Issue Date label, center x=445.5, y=530)
      const dateDisplay = data.dateStr || "15 Nov 2026";
      ctx.fillText(dateDisplay, 445.5, 530);

      // Achievement Distance (directly below Achievement Distance label, center x=654, y=530)
      let distStr = (data.distance || "5 KM").toUpperCase().trim();
      if (!distStr.endsWith("KM") && !distStr.endsWith("K")) distStr += " KM";
      ctx.fillText(distStr, 654, 530);

      return canvas;
    }

    // Default/fallback behavior for other non-admin users
    const baseImg = await loadImage("/cancer-certificate-official-with-qr.jpg?v=20261114_legacy");
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 682;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not acquire 2D canvas context");

    ctx.drawImage(baseImg, 0, 0, 1024, 682);

    const nameDisplay = formatCertificateRunnerName(data.runnerName);
    ctx.font = `50px "AlexBrush", "Brush Script MT", cursive`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#581c87";
    ctx.fillText(nameDisplay, 512, 360);

    let distStr = (data.distance || "5 KM").toUpperCase().trim();
    if (!distStr.endsWith("KM") && !distStr.endsWith("K")) distStr += " KM";
    ctx.font = `900 16px "OfficialArialBlack", "Arial", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#1e1b4b";
    ctx.fillText(distStr, 635, 552);

    return canvas;
  }

  const baseImg = await loadImage("/iaf-cert-clean-base.jpg?v=20261031_v3");
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
 * 📱 Idea 4: Instant 1-Click Instagram & WhatsApp Story Card Renderer (1080 x 1920 - 9:16)
 * Generates an ultra-high resolution shareable story graphic for athletes to share on social media.
 */
export async function renderStoryCanvas(data: StoryRenderData): Promise<HTMLCanvasElement> {
  await ensureCanvasFonts();

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D canvas context");

  // 1. Premium Midnight Carbon Canvas Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
  bgGrad.addColorStop(0, "#05080c");
  bgGrad.addColorStop(0.3, "#0b121a");
  bgGrad.addColorStop(0.7, "#080d14");
  bgGrad.addColorStop(1, "#040608");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Dynamic Kinetic Energy Angle Streaks (Background motion lines)
  ctx.save();
  ctx.lineWidth = 1.5;
  for (let i = -400; i < 2000; i += 180) {
    ctx.strokeStyle = "rgba(255, 75, 38, 0.04)";
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 600, 1920);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Ambient Fiery Halo Behind Medal (Radial Glow)
  ctx.save();
  const medalCenterX = 540;
  const medalCenterY = 700;
  const radialGlow = ctx.createRadialGradient(medalCenterX, medalCenterY, 50, medalCenterX, medalCenterY, 480);
  radialGlow.addColorStop(0, "rgba(255, 75, 38, 0.28)");
  radialGlow.addColorStop(0.4, "rgba(245, 158, 11, 0.15)");
  radialGlow.addColorStop(0.8, "rgba(230, 72, 51, 0.04)");
  radialGlow.addColorStop(1, "transparent");
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 200, 1080, 1000);
  ctx.restore();

  // 4. Subtle Outer Framing Inset
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, 1008, 1848);

  // Corner Accent Marks
  const corners = [
    [36, 36],
    [1044, 36],
    [36, 1884],
    [1044, 1884],
  ];
  ctx.strokeStyle = "#ff4b26";
  ctx.lineWidth = 4;
  corners.forEach(([cx, cy]) => {
    const dirX = cx === 36 ? 1 : -1;
    const dirY = cy === 36 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(cx, cy + dirY * 30);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dirX * 30, cy);
    ctx.stroke();
  });
  ctx.restore();

  // 5. Header Brand Eyebrow
  const isPledgeMode = data.storyMode === "pledge";
  const isPaid = data.isPaid !== false;

  ctx.save();
  ctx.fillStyle = "#121820";
  ctx.strokeStyle = isPledgeMode ? "rgba(59, 130, 246, 0.5)" : "rgba(245, 158, 11, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(320, 90, 440, 48, 24);
  ctx.fill();
  ctx.stroke();

  ctx.font = `bold 18px "Arial Black", "Impact", "Arial", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = isPledgeMode ? "#60a5fa" : "#f59e0b";
  ctx.fillText(
    isPledgeMode ? "⚡ RUNNERUP · OFFICIAL CHALLENGE PLEDGE" : "⚡ RUNNERUP · OFFICIAL VIRTUAL RUN",
    540,
    114
  );
  ctx.restore();

  // 6. Header Event Title
  ctx.font = `900 48px "Arial Black", "Arial", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("KINETIC RUN", 540, 185);

  ctx.font = `bold 28px "Arial Black", sans-serif`;
  ctx.fillStyle = "#ff5e3a";
  ctx.fillText(isPledgeMode ? "I'M IN! CHALLENGE ACCEPTED" : "VIRTUAL CHALLENGE 2026", 540, 230);

  ctx.font = `bold 16px "Arial", sans-serif`;
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("10–15 DECEMBER 2026 · ALL-INDIA GPS CHALLENGE", 540, 268);

  // 7. Render Authentic 3D Finisher Medal
  const medalSrc =
    data.medalSide === "back"
      ? "/images/kinetic-run-medal-back.png"
      : "/images/kinetic-run-medal-front.png";
  try {
    const medalImg = await loadImage(medalSrc);

    // Realistic hardware drop shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(540, 1070, 240, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.filter = "blur(18px)";
    ctx.fill();
    ctx.restore();

    // Draw high-resolution medal (490 x 735)
    const mw = 490;
    const mh = 735;
    ctx.drawImage(medalImg, 540 - mw / 2, 330, mw, mh);
  } catch (err) {
    console.warn("Could not load medal for story canvas:", err);
  }

  // 8. Tier Pill Floating Below Medal
  const tier = data.tierName || "SPEEDSTER";
  ctx.save();
  const tierGrad = ctx.createLinearGradient(300, 0, 780, 0);
  if (isPledgeMode) {
    if (!isPaid) {
      tierGrad.addColorStop(0, "#2563eb");
      tierGrad.addColorStop(0.5, "#38bdf8");
      tierGrad.addColorStop(1, "#2563eb");
    } else {
      tierGrad.addColorStop(0, "#ea580c");
      tierGrad.addColorStop(0.5, "#fbbf24");
      tierGrad.addColorStop(1, "#ea580c");
    }
  } else {
    tierGrad.addColorStop(0, "#ea580c");
    tierGrad.addColorStop(0.5, "#f59e0b");
    tierGrad.addColorStop(1, "#ea580c");
  }

  ctx.fillStyle = tierGrad;
  ctx.beginPath();
  ctx.roundRect(280, 1120, 520, 52, 26);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = `bold 20px "Arial Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";
  if (isPledgeMode) {
    ctx.fillText(
      !isPaid ? "🎯 REGISTERED CHALLENGER · PLEDGED" : "⚡ CONFIRMED ATHLETE · READY FOR GLORY",
      540,
      1146
    );
  } else {
    ctx.fillText(`⚡ VERIFIED ${tier} TIER ATHLETE`, 540, 1146);
  }
  ctx.restore();

  // 9. Glassmorphic Runner Achievement Console (Bottom Box)
  const cardX = 80;
  const cardY = 1220;
  const cardW = 920;
  const cardH = 470;
  const cardR = 32;

  ctx.save();
  ctx.fillStyle = "rgba(14, 21, 30, 0.94)";
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
  ctx.fill();
  ctx.strokeStyle = isPledgeMode && !isPaid ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Subtle top accent line on the card
  ctx.strokeStyle = isPledgeMode && !isPaid ? "#38bdf8" : "#ff4b26";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(cardX + 40, cardY, cardW - 80, 4, 2);
  ctx.stroke();

  // Eyebrow
  ctx.font = `bold 18px "Arial Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = isPledgeMode && !isPaid ? "#38bdf8" : "#f59e0b";
  if (isPledgeMode) {
    ctx.fillText(
      !isPaid ? "🎯 OFFICIAL RACE PLEDGE · 10–15 DEC" : "🏁 CONFIRMED RACER · FINISHER KIT RESERVED",
      540,
      cardY + 50
    );
  } else {
    ctx.fillText("🏆 OFFICIAL FINISHER · NATIONAL EDITION", 540, cardY + 50);
  }

  // Runner Full Name
  const runnerDisplay = (data.runnerName || "RUNNER").toUpperCase().trim();
  let nameSize = 54;
  if (runnerDisplay.length > 20) nameSize = 40;
  else if (runnerDisplay.length > 14) nameSize = 46;

  ctx.font = `bold ${nameSize}px "Georgia", "Times New Roman", serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(runnerDisplay, 540, cardY + 115);

  // 3 Stats Boxes inside Card
  const statBoxY = cardY + 180;
  const statBoxW = 260;
  const statBoxH = 110;
  const statGap = 20;
  const statStartX = cardX + (cardW - (statBoxW * 3 + statGap * 2)) / 2;

  let distClean = (data.distance || "10 KM").toUpperCase().trim();
  if (!distClean.endsWith("KM") && !distClean.endsWith("K")) distClean += " KM";

  const stats = isPledgeMode
    ? [
        { label: "GOAL DISTANCE", val: distClean, sub: "Challenge Target" },
        { label: "CHALLENGE DATES", val: "10–15 DEC", sub: "All-India Virtual" },
        { label: "RACE BIB", val: data.bibNumber || "KRUN-1001", sub: isPaid ? "Confirmed Kit" : "Registered" },
      ]
    : [
        { label: "DISTANCE", val: distClean, sub: "Conquered" },
        { label: "FINISH TIME", val: data.timeStr || "00:52:14", sub: "Verified" },
        { label: "AVG PACE", val: data.paceStr || "5:13 /KM", sub: "GPS Tracked" },
      ];

  stats.forEach((s, idx) => {
    const bx = statStartX + idx * (statBoxW + statGap);
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, statBoxY, statBoxW, statBoxH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = `bold 13px "Arial", sans-serif`;
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "center";
    ctx.fillText(s.label, bx + statBoxW / 2, statBoxY + 28);

    ctx.font = `900 24px "Arial Black", "Arial", sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(s.val, bx + statBoxW / 2, statBoxY + 62);

    ctx.font = `bold 12px "Arial", sans-serif`;
    ctx.fillStyle = isPledgeMode && !isPaid ? "#38bdf8" : "#10b981";
    ctx.fillText(`✓ ${s.sub}`, bx + statBoxW / 2, statBoxY + 92);
    ctx.restore();
  });

  // Runner Bib & Authenticity Tag inside card
  const bibStr = data.bibNumber || "KRUN-1001";
  ctx.font = `bold 18px "Arial Black", sans-serif`;
  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.fillText(`OFFICIAL RACE BIB: ${bibStr}`, 540, cardY + 340);

  ctx.font = `bold 15px "Arial", sans-serif`;
  ctx.fillStyle = "#64748b";
  ctx.fillText("WORKS WITH STRAVA · GARMIN · APPLE WATCH · COROS · NRC", 540, cardY + 380);

  ctx.font = `bold 13px "Arial", sans-serif`;
  if (isPledgeMode && !isPaid) {
    ctx.fillStyle = "#f59e0b";
    ctx.fillText("★ UPGRADE TO FINISHER KIT (₹499) TO CLAIM 3D SCULPTED PHYSICAL MEDAL ★", 540, cardY + 418);
  } else {
    ctx.fillStyle = "#10b981";
    ctx.fillText("100% VERIFIED ATHLETE RECORD · FREE DOORSTEP MEDAL DELIVERY", 540, cardY + 418);
  }
  ctx.restore();

  // 10. Social Tag Footer
  ctx.save();
  ctx.font = `bold 22px "Arial Black", "Arial", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#ff5e3a";
  ctx.fillText("TAG @RUNNERUP.IN TO GET FEATURED IN HALL OF FAME 📸", 540, 1750);

  ctx.font = `bold 18px "Arial", sans-serif`;
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("WWW.RUNNERUP.IN · INDIA'S PREMIER VIRTUAL RACES", 540, 1800);
  ctx.restore();

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
