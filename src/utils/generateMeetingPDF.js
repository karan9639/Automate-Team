import { jsPDF } from "jspdf";
import { getDescriptionLines } from "@/utils/descriptionUtils";

export const generateMeetingPDF = async (meeting) => {
  // ✅ Landscape for wide excel tables
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  const COLORS = {
    emerald: [16, 185, 129],
    grayText: [107, 114, 128],
    lightGray: [249, 250, 251],
    border: [220, 220, 220],
    black: [0, 0, 0],
    white: [255, 255, 255],
  };

  const ensureSpace = (need = 20) => {
    if (y + need > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      drawHeader();
      y += 20;
    }
  };

  const drawHeader = () => {
    pdf.setFillColor(...COLORS.emerald);
    pdf.rect(0, 0, pageWidth, 44, "F");

    pdf.setTextColor(...COLORS.white);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("MEETING DETAILS REPORT", margin, 28);
  };

  const drawSectionTitle = (title) => {
    ensureSpace(40);

    pdf.setFillColor(...COLORS.lightGray);
    pdf.rect(margin, y - 12, contentWidth, 26, "F");

    pdf.setTextColor(...COLORS.emerald);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text(title, margin + 10, y + 6);

    y += 28;
  };

  const drawKeyValue = (key, value) => {
    ensureSpace(18);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLORS.grayText);
    pdf.text(`${key}:`, margin, y);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...COLORS.black);
    pdf.text(value || "N/A", margin + 90, y);

    y += 16;
  };

  const drawLine = () => {
    pdf.setDrawColor(...COLORS.border);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 14;
  };

  // ✅ Main title under header
  const drawMainTitle = () => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(...COLORS.black);
    pdf.text(meeting.title || "Meeting", margin, y);
    y += 22;
  };

  // ✅ Fit row to width by decreasing font size
  const fitFontSizeForRow = (text, maxWidth, start = 10, min = 7) => {
    let size = start;
    pdf.setFontSize(size);
    while (pdf.getTextWidth(text) > maxWidth && size > min) {
      size -= 1;
      pdf.setFontSize(size);
    }
    return size;
  };

  // ✅ Draw minutes lines in monospace with wrapping + indent
  const drawMinutesLines = (lines) => {
    const numX = margin;
    const textX = margin + 34;
    const maxTextWidth = pageWidth - margin - textX;

    for (let i = 0; i < lines.length; i++) {
      // first, compute a good font size for this row
      pdf.setFont("courier", "normal");
      const baseSize = fitFontSizeForRow(lines[i], maxTextWidth, 10, 7);
      const lineHeight = baseSize + 6;

      // wrap into multiple lines if still too long (for extreme cases)
      const wrapped = pdf.splitTextToSize(lines[i], maxTextWidth);

      // space: number line + wrapped lines height
      ensureSpace(wrapped.length * lineHeight + 6);

      // number
      pdf.setFont("courier", "bold");
      pdf.setFontSize(baseSize);
      pdf.setTextColor(...COLORS.black);
      pdf.text(`${i + 1}.`, numX, y);

      // first wrapped line
      pdf.setFont("courier", "normal");
      pdf.text(wrapped[0], textX, y);
      y += lineHeight;

      // remaining wrapped lines aligned under text (no extra numbering)
      for (let w = 1; w < wrapped.length; w++) {
        ensureSpace(lineHeight + 4);
        pdf.text(wrapped[w], textX, y);
        y += lineHeight;
      }

      // small gap after each row (like table row spacing)
      y += 3;
    }
  };

  // ✅ Footer on every page
  const addFooters = () => {
    const total = pdf.internal.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      pdf.setPage(p);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.grayText);

      const footerY = pageHeight - 18;

      pdf.text(
        `Generated on ${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString(
          "en-US",
          { hour: "2-digit", minute: "2-digit" },
        )}`,
        margin,
        footerY,
      );

      pdf.text(`Page ${p} of ${total}`, pageWidth - margin - 80, footerY);
    }
  };

  // ====== BUILD PDF ======
  drawHeader();
  y = 70;

  drawMainTitle();
  drawLine();

  drawSectionTitle("Meeting Information");
  drawKeyValue("Date", meeting.date || "N/A");
  drawKeyValue("Department", meeting.department || "N/A");
  drawKeyValue("Type", meeting.type || "N/A");
  if (meeting.members?.length) {
    drawKeyValue("Participants", `${meeting.members.length} member(s)`);
  }
  drawLine();

  if (meeting.members?.length) {
    drawSectionTitle("Meeting Participants");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLORS.black);

    meeting.members.forEach((m, idx) => {
      ensureSpace(18);
      const name = typeof m === "string" ? m : m.name;
      const role = m?.role ? ` (${m.role})` : "";
      pdf.text(`${idx + 1}. ${name}${role}`, margin + 10, y);
      y += 16;
    });

    drawLine();
  }

  drawSectionTitle("Meeting Minutes");

  const minutesLines = getDescriptionLines(meeting.description || "");
  if (!minutesLines.length) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(11);
    pdf.setTextColor(...COLORS.grayText);
    pdf.text("No meeting minutes provided.", margin + 10, y);
    y += 16;
  } else {
    drawMinutesLines(minutesLines);
  }

  addFooters();

  const safeTitle = (meeting.title || "Meeting").replace(/[^\w-]+/g, "_");
  const safeDate = (meeting.date || "date").replace(/[^\w-]+/g, "_");
  pdf.save(`Meeting_${safeTitle}_${safeDate}.pdf`);
};
