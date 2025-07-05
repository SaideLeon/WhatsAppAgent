"use strict";
// src/ai/flows/extract-instructions-from-file.ts
'use server';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractInstructionsFromFile = extractInstructionsFromFile;
/**
 * @fileOverview Extracts instructions from a file (image, PDF, or DOCX) using a multimodal model and detects the language of the text.
 *
 * - extractInstructionsFromFile - A function that extracts instructions from a file and detects its language.
 * - ExtractInstructionsFromFileInput - The input type for the extractInstructionsFromFile function.
 * - ExtractInstructionsFromFileOutput - The return type for the extractInstructionsFromFile function.
 */
const genkit_1 = require("@/ai/genkit");
const genkit_2 = require("genkit");
const ExtractInstructionsFromFileInputSchema = genkit_2.z.object({
    fileUri: genkit_2.z
        .string()
        .describe('The file containing the instructions (image, PDF, or DOCX), as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
});
const ExtractInstructionsFromFileOutputSchema = genkit_2.z.object({
    extractedText: genkit_2.z
        .string()
        .describe('The extracted text from the file, representing the instructions.'),
    detectedLanguage: genkit_2.z
        .string()
        .describe('The detected language of the extracted text (e.g., "en", "es", "fr", "pt-BR", "pt-PT").'),
});
function extractInstructionsFromFile(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return extractInstructionsFromFileFlow(input);
    });
}
const extractInstructionsFromFilePrompt = genkit_1.ai.definePrompt({
    name: 'extractInstructionsFromFilePrompt',
    input: { schema: ExtractInstructionsFromFileInputSchema },
    output: { schema: ExtractInstructionsFromFileOutputSchema },
    prompt: `Extract the text from the following file. The file could be an image (PNG, JPG, WEBP), a PDF document, or a DOCX document. The file content is provided as a data URI.
Your primary goal is to identify and extract instructions for an academic paper from this file.
Also, detect the language of the extracted text. For example, if the text is in English, return "en"; if Spanish, return "es"; if Portuguese (Brazil), return "pt-BR"; if Portuguese (Portugal), return "pt-PT".

{{media url=fileUri}}

Ensure the extracted text is accurate and complete.
Return the extracted text in the 'extractedText' field and the detected language code (ISO 639-1 like, e.g. pt-BR or pt-PT) in the 'detectedLanguage' field.
`,
});
const extractInstructionsFromFileFlow = genkit_1.ai.defineFlow({
    name: 'extractInstructionsFromFileFlow',
    inputSchema: ExtractInstructionsFromFileInputSchema,
    outputSchema: ExtractInstructionsFromFileOutputSchema,
}, (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { output } = yield extractInstructionsFromFilePrompt(input);
    return output;
}));
