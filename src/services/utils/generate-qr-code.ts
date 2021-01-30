import QRCode from "qrcode";

export const generateDataUri = (content: string): Promise<string> => {
  return QRCode.toDataURL(content);
};
