import { PDFDocument, StandardFonts } from "pdf-lib";
import { generateDataUri } from "./generate-qr-code";

export interface FileBuffer {
  contentBytes: Buffer,
  filename: string
}

export const createPdf = async (
  name: string
): Promise<FileBuffer> => {
  const filename = `${name}.pdf`;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  const qrCodeDataUri = await generateDataUri(name);
  const pngImage = await pdfDoc.embedPng(qrCodeDataUri);
  page.drawImage(pngImage, {
    x: page.getWidth() / 2 - pngImage.width / 2,
    y: (page.getHeight() - pngImage.height) / 2,
    width: pngImage.width,
    height: pngImage.height,
  });

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const FONT_SIZE = 24;
  const X_STARTING_POINT = 64
  const Y_TEXT_STARTING_POINT = page.getHeight() - 64;

  page.drawText(`${name}`,
    { x: X_STARTING_POINT, y: Y_TEXT_STARTING_POINT, size: FONT_SIZE, font: helveticaFont });
  const pdfBytes = await pdfDoc.save();

  return {
    contentBytes: Buffer.from(pdfBytes),
    filename
  };
};
