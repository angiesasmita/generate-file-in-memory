import { Response, Request, Router } from "express";
import generateService from "../services/generate-service";
import asyncHandler from "express-async-handler";

export const generateRoute = Router();
generateRoute.get(
  "/qr-code-pdf/:name",
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;

    const { contentBytes, filename } = await generateService.generateQRCodePDF(
      name
    );

    respondWithAttachingFile(contentBytes, res, filename, "pdf");
  })
);

generateRoute.get(
  "/qr-code-archive/:commaSeparatedNames",
  asyncHandler(async (req: Request, res: Response) => {
    const { commaSeparatedNames } = req.params;
    const names = commaSeparatedNames.split(",");

    const {
      contentBytes,
      filename,
    } = await generateService.generateQRCodesArchive(names);

    respondWithAttachingFile(contentBytes, res, filename, "zip");
  })
);

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

