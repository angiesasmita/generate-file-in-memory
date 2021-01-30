# Use Case
* You need to write an end-point that return a file (e.g .zip/.pdf)
* You can't save the file in your server for some reasons*

# Solution
## General idea
1. Generate file as binary stream
2. Hold it in memory
3. Pipe the stream through API

## Examples
### Generate PDF containing QR-code
1. Install PDF and QR code library
    ```sh

      npm i qrcode && npm i --save-dev @types/qrcode
      npm i pdf-lib

    ```
2. Generate QR code as a data uri
    ```ts

      export const generateDataUri = (content: string): Promise<string> => {
        return QRCode.toDataURL(content);
      };

    ```
3. Create and embed QR code as PNG
    ```ts

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

    ```
4. Return PDF as a buffer 
    ```ts

      const pdfBytes = await pdfDoc.save();

      return {
        contentBytes: Buffer.from(pdfBytes),
        filename
      };

    ```
5. Configure response as a file
    ```ts

      const respondWithAttachingFile = (
        contentBytes: Buffer,
        res: Response,
        filename: string,
        filetype: string
      ): void => {
        res.setHeader("Content-Type", `application/${filetype}`);
        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

        res.status(200).end(contentBytes);
      };

      respondWithAttachingFile(contentBytes, res, filename, "pdf");

    ```

### Generate archive of multiple PDFs
1. Install archive and stream buffer libraries
    ```sh

      npm i archiver && npm i --save-dev @types/archiver
      npm i stream-buffer && npm i --save-dev @types/stream-buffer

    ```
2. Follow PDF instruction to generate files
3. Pipe file buffers into archive file
    ```ts

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

    ```
4. Configure response as a file
    ```ts

      respondWithAttachingFile(contentBytes, res, filename, "zip");
      
    ```

You can find the full solution: https://github.com/angiesasmita/generate-file-in-memory 


## Some reasons why you can't save the file (as intermediate step)
* Security - the generated file is sensitive and you are not allowed to store it at all
* No write access (most common issue)
* Clean up policy (unlikely) - server has a specific clean up policy that needs to be complied on and takes extra effort to configure

## Considerations
* Ensure that your server has sufficient memory to temporarily hold multiple file streams in the event of concurrent requests (max_number_of_concurrent_requests x max_size_of_file < server_memory)

