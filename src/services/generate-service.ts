import {
  createPdf,
  FileBuffer,
} from "./utils/generate-pdf-for-qr-code";
import { archiveFiles } from "./utils/archive-files";

class Service {
  public async generateQRCodePDF(
    name: string
  ): Promise<FileBuffer> {
    try {
      return await createPdf(name);
    } catch (error) {
      console.log(`QR generation error: ${error}`);
      throw this.qrEncryptionError();
    }
  }

  public async generateQRCodesArchive(names: string[]): Promise<FileBuffer> {
    try {
      const fileBuffers = await Promise.all(
        names.map((name) => createPdf(name))
      );
      return await archiveFiles(fileBuffers, "archived");
    } catch (error) {
      console.log(`QR generation error: ${error}`);
      throw this.qrEncryptionError();
    }
  }

  private qrEncryptionError(): Error {
    return new Error("QR generation error");
  }
}

export default new Service();
