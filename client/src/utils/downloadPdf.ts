import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export const downloadElementAsPdf = async (
  element: HTMLElement,
  filename: string,
) => {
  if (typeof window === "undefined") return;

  try {
    // Capture element snapshot with a high scale (2x) for print quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    // Standard A4 dimensions in mm: 210 x 297
    const pdfWidth = 210;
    const margin = 10; // 10mm margin on all sides

    // Fit the image width inside margins
    const imgWidth = pdfWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Failed to render PDF using canvas:", error);
  }
};
