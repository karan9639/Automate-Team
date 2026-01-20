import { jsPDF } from "jspdf";
import { getDescriptionLines } from "@/utils/descriptionUtils";

export const generateMeetingPDF = async (meeting) => {
  // ✅ Landscape for wide excel tables
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let yPosition = margin;

  const addLine = () => {
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 14;
  };

  const ensurePageSpace = (needed = 20) => {
    if (yPosition + needed > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Header
  pdf.setFillColor(16, 185, 129);
  pdf.rect(0, 0, pageWidth, 40, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("MEETING DETAILS REPORT", margin, 26);

  yPosition = 70;

  // Title
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(meeting.title || "Meeting", margin, yPosition);
  yPosition += 18;

  addLine();

  // Meeting Information
  pdf.setFillColor(249, 250, 251);
  pdf.rect(margin, yPosition - 10, contentWidth, 22, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(16, 185, 129);
  pdf.text("Meeting Information", margin + 8, yPosition + 6);
  yPosition += 26;

  pdf.setFontSize(11);
  pdf.setTextColor(107, 114, 128);
  pdf.setFont("helvetica", "bold");
  pdf.text("Date:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text(meeting.date || "N/A", margin + 70, yPosition);
  yPosition += 16;

  pdf.setTextColor(107, 114, 128);
  pdf.setFont("helvetica", "bold");
  pdf.text("Department:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text(meeting.department || "N/A", margin + 70, yPosition);
  yPosition += 16;

  pdf.setTextColor(107, 114, 128);
  pdf.setFont("helvetica", "bold");
  pdf.text("Type:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text(meeting.type || "N/A", margin + 70, yPosition);
  yPosition += 16;

  if (meeting.members && meeting.members.length > 0) {
    pdf.setTextColor(107, 114, 128);
    pdf.setFont("helvetica", "bold");
    pdf.text("Participants:", margin, yPosition);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      `${meeting.members.length} member${meeting.members.length !== 1 ? "s" : ""}`,
      margin + 70,
      yPosition,
    );
    yPosition += 16;
  }

  yPosition += 6;
  addLine();

  // Members
  if (meeting.members && meeting.members.length > 0) {
    ensurePageSpace(60);

    pdf.setFillColor(249, 250, 251);
    pdf.rect(margin, yPosition - 10, contentWidth, 22, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(16, 185, 129);
    pdf.text("Meeting Participants", margin + 8, yPosition + 6);
    yPosition += 26;

    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);

    meeting.members.forEach((member, index) => {
      ensurePageSpace(18);

      const memberName = typeof member === "string" ? member : member.name;
      const memberRole = member.role;

      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}. ${memberName}`, margin + 8, yPosition);

      if (memberRole) {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(107, 114, 128);
        pdf.text(
          `(${memberRole})`,
          margin + 8 + pdf.getTextWidth(`${index + 1}. ${memberName} `),
          yPosition,
        );
        pdf.setTextColor(0, 0, 0);
      }

      yPosition += 16;
    });

    yPosition += 6;
    addLine();
  }

  // ✅ Description (Monospace Table)
  ensurePageSpace(60);

  pdf.setFillColor(249, 250, 251);
  pdf.rect(margin, yPosition - 10, contentWidth, 22, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(16, 185, 129);
  pdf.text("Meeting Minutes", margin + 8, yPosition + 6);
  yPosition += 26;

  const lines = getDescriptionLines(meeting.description || "");

  if (!lines.length) {
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(11);
    pdf.setTextColor(107, 114, 128);
    pdf.text("No meeting minutes provided.", margin + 8, yPosition);
    yPosition += 16;
  } else {
    const numX = margin + 8;
    const textX = margin + 40;
    const maxTextWidth = pageWidth - margin - textX;

    for (let i = 0; i < lines.length; i++) {
      ensurePageSpace(18);

      // ✅ monospace
      pdf.setFont("courier", "normal");

      // dynamic font size (to fit wide rows)
      let fontSize = 10;
      pdf.setFontSize(fontSize);

      while (pdf.getTextWidth(lines[i]) > maxTextWidth && fontSize > 7) {
        fontSize -= 1;
        pdf.setFontSize(fontSize);
      }

      const lineHeight = fontSize + 6;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont("courier", "bold");
      pdf.text(`${i + 1}.`, numX, yPosition);

      pdf.setFont("courier", "normal");
      pdf.text(lines[i], textX, yPosition);

      yPosition += lineHeight;
    }
  }

  // Footer
  const footerY = pageHeight - 20;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(156, 163, 175);

  pdf.text(
    `Generated on ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`,
    margin,
    footerY,
  );

  pdf.text(
    `Page ${pdf.internal.getNumberOfPages()}`,
    pageWidth - margin - 60,
    footerY,
  );

  const safeTitle = (meeting.title || "Meeting").replace(/[^\w-]+/g, "_");
  const safeDate = (meeting.date || "date").replace(/[^\w-]+/g, "_");
  pdf.save(`Meeting_${safeTitle}_${safeDate}.pdf`);
};
