import archiver from "archiver";
import { FileBuffer } from "./generate-pdf-for-qr-code";
import streamBuffers from "stream-buffers";

export const archiveFiles =
  async (fileBuffers: FileBuffer[], outputFilename: string): Promise<FileBuffer> => {
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });
    const filename =
      `${outputFilename}.zip`
        .replace(/ /g, "");

    const outputStreamBuffer = new streamBuffers.WritableStreamBuffer({
      initialSize: (1000 * 1024),
      incrementAmount: (1000 * 1024)
    });

    archive.pipe(outputStreamBuffer);

    fileBuffers.forEach(fileBuffer =>
      archive.append(Buffer.from(fileBuffer.contentBytes), { name: fileBuffer.filename }));

    await archive.finalize();
    outputStreamBuffer.end();

    return new Promise((resolve, reject) => {
      const contentBytes = outputStreamBuffer.getContents();
      if (contentBytes !== false) {
        resolve({ filename, contentBytes });
      }
      reject(new Error("Buffering failed."));
    });
  };
