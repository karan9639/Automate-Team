import { jsPDF } from "jspdf";

export const generateMeetingPDF = async (meeting) => {
  // Create new PDF document
  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let yPosition = margin;

  // Helper function to add text with line breaks
  const addText = (text, fontSize, fontStyle = "normal", color = [0, 0, 0]) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", fontStyle);
    pdf.setTextColor(...color);

    const lines = pdf.splitTextToSize(text, contentWidth);

    // Check if we need a new page
    if (yPosition + lines.length * fontSize * 0.35 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.35 + 5;
  };

  // Helper function to add a line separator
  const addLine = () => {
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  };

  // Header - Company/Title
  pdf.setFillColor(16, 185, 129); // Emerald color
  pdf.rect(0, 0, pageWidth, 30, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("MEETING DETAILS REPORT", margin, 20);

  yPosition = 45;

  // Meeting Title
  addText(meeting.title, 18, "bold", [0, 0, 0]);
  yPosition += 5;

  addLine();

  // Meeting Information Section
  pdf.setFillColor(249, 250, 251); // Light gray background
  pdf.rect(margin, yPosition, contentWidth, 8, "F");
  addText("Meeting Information", 14, "bold", [16, 185, 129]);
  yPosition += 5;

  // Date
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(107, 114, 128);
  pdf.text("Date:", margin, yPosition);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text(meeting.date || "N/A", margin + 35, yPosition);
  yPosition += 8;

  // Department
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(107, 114, 128);
  pdf.text("Department:", margin, yPosition);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text(meeting.department || "N/A", margin + 35, yPosition);
  yPosition += 8;

  // Meeting Type
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(107, 114, 128);
  pdf.text("Type:", margin, yPosition);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(0, 0, 0);
  pdf.text(meeting.type || "N/A", margin + 35, yPosition);
  yPosition += 8;

  // Members Count
  if (meeting.members && meeting.members.length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(107, 114, 128);
    pdf.text("Participants:", margin, yPosition);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      `${meeting.members.length} member${
        meeting.members.length !== 1 ? "s" : ""
      }`,
      margin + 35,
      yPosition
    );
    yPosition += 8;
  }

  yPosition += 5;
  addLine();

  // Members Section
  if (meeting.members && meeting.members.length > 0) {
    pdf.setFillColor(249, 250, 251);
    pdf.rect(margin, yPosition, contentWidth, 8, "F");
    addText("Meeting Participants", 14, "bold", [16, 185, 129]);
    yPosition += 2;

    meeting.members.forEach((member, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 20) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);

      const memberName = typeof member === "string" ? member : member.name;
      const memberRole = member.role;

      pdf.text(`${index + 1}. ${memberName}`, margin + 5, yPosition);

      // Only add role if it exists
      if (memberRole) {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(107, 114, 128);
        pdf.text(
          `(${memberRole})`,
          margin + 5 + pdf.getTextWidth(`${index + 1}. ${memberName} `),
          yPosition
        );
      }

      yPosition += 7;
    });

    yPosition += 5;
    addLine();
  }

  // Description Section
  if (meeting.description) {
    pdf.setFillColor(249, 250, 251);
    pdf.rect(margin, yPosition, contentWidth, 8, "F");
    addText("Meeting Minutes", 14, "bold", [16, 185, 129]);
    yPosition += 2;

    const descriptionLines = meeting.description
      .split("\n")
      .filter((line) => line.trim());

    descriptionLines.forEach((line, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 20) {
        pdf.addPage();
        yPosition = margin;
      }

      const cleanLine = line.replace(/^\d+\.\s*/, "");

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      // Number
      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}.`, margin + 5, yPosition);

      // Content
      pdf.setFont("helvetica", "normal");
      const textLines = pdf.splitTextToSize(cleanLine, contentWidth - 15);
      pdf.text(textLines, margin + 12, yPosition);

      yPosition += textLines.length * 5 + 3;
    });
  } else {
    addText("No meeting minutes provided.", 11, "italic", [107, 114, 128]);
  }

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(156, 163, 175);
  pdf.text(
    `Generated on ${new Date().toLocaleDateString(
      "en-GB"
    )} at ${new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    margin,
    footerY
  );

  pdf.text(
    `Page ${pdf.internal.getNumberOfPages()}`,
    pageWidth - margin - 20,
    footerY
  );

  // Save PDF
  const fileName = `Meeting_${meeting.title.replace(
    /\s+/g,
    "_"
  )}_${meeting.date.replace(/\//g, "-")}.pdf`;
  pdf.save(fileName);
};
