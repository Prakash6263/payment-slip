export const exportTheme: Record<string, string> = {
  "--background": "#f8fafc",
  "--foreground": "#172033",
  "--card": "#ffffff",
  "--card-foreground": "#172033",
  "--muted": "#f1f5f9",
  "--muted-foreground": "#64748b",
  "--border": "#dbe4ee",
  "--primary": "#2563eb",
  "--primary-foreground": "#ffffff",
  "--secondary": "#ea580c",
  "--secondary-foreground": "#ffffff",
  "--gradient-brand": "linear-gradient(135deg, #2563eb, #1d4ed8)",
  "--gradient-accent": "linear-gradient(135deg, #ea580c, #f59e0b)",
  "--shadow-elegant": "0 20px 50px -20px rgba(30, 64, 175, 0.35)",
  "--shadow-soft": "0 4px 20px -8px rgba(30, 64, 175, 0.15)",
};

const colorAliases = [
  "background", "foreground", "card", "card-foreground",
  "muted", "muted-foreground", "border", "primary",
  "primary-foreground", "secondary", "secondary-foreground",
] as const;

export const waitForExportAssets = async (root: HTMLElement) => {
  await document.fonts?.ready;
  await Promise.all(
    Array.from(root.querySelectorAll("img")).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }),
  );
};

export const createExportClone = (source: HTMLElement) => {
  const width = Math.ceil(source.getBoundingClientRect().width);
  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    position: "fixed",
    top: "0",
    left: "-10000px",
    width: `${width}px`,
    background: "#ffffff",
    pointerEvents: "none",
    zIndex: "-1",
  });
  Object.entries(exportTheme).forEach(([k, v]) => wrapper.style.setProperty(k, v));
  colorAliases.forEach((n) => wrapper.style.setProperty(`--color-${n}`, `var(--${n})`));
  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.width = `${width}px`;
  clone.style.maxWidth = "none";
  clone.classList.add("export-capture");
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);
  return { wrapper, clone };
};

export const exportToPDF = async (source: HTMLElement, filename: string) => {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);
  const { wrapper, clone } = createExportClone(source);
  try {
    await waitForExportAssets(clone);
    const canvas = await html2canvas(clone, {
      scale: Math.max(2, window.devicePixelRatio || 1),
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const maxW = pageW - margin * 2;
    // Multi-page: slice the tall canvas into page-sized chunks.
    const pxPerPt = canvas.width / maxW;
    const pageHpx = Math.floor((pageH - margin * 2) * pxPerPt);
    let y = 0;
    let first = true;
    while (y < canvas.height) {
      const sliceH = Math.min(pageHpx, canvas.height - y);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = sliceH;
      const ctx = slice.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, -y);
      const sliceImg = slice.toDataURL("image/png");
      if (!first) pdf.addPage();
      first = false;
      pdf.addImage(sliceImg, "PNG", margin, margin, maxW, sliceH / pxPerPt);
      y += sliceH;
    }
    // Fallback if no slices (empty)
    if (first) pdf.addImage(img, "PNG", margin, margin, maxW, canvas.height / pxPerPt);
    pdf.save(filename);
  } finally {
    wrapper.remove();
  }
};

export const exportToDOC = async (source: HTMLElement, filename: string) => {
  const [{ default: html2canvas }, { Document, ImageRun, Packer, Paragraph }] = await Promise.all([
    import("html2canvas-pro"),
    import("docx"),
  ]);
  const { wrapper, clone } = createExportClone(source);
  try {
    await waitForExportAssets(clone);
    const canvas = await html2canvas(clone, {
      scale: Math.max(2, window.devicePixelRatio || 1),
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
    });
    const pngBytes = await new Promise<Uint8Array>((resolve) => {
      canvas.toBlob(async (blob) => {
        const buffer = await blob!.arrayBuffer();
        resolve(new Uint8Array(buffer));
      }, "image/png");
    });
    const scale = Math.min(736 / canvas.width, 1064 / canvas.height);
    const imageWidth = Math.floor(canvas.width * scale);
    const imageHeight = Math.floor(canvas.height * scale);
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 432, right: 432, bottom: 432, left: 432 },
          },
        },
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                type: "png",
                data: pngBytes,
                transformation: { width: imageWidth, height: imageHeight },
                altText: { title: filename, description: filename, name: filename },
              }),
            ],
          }),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } finally {
    wrapper.remove();
  }
};