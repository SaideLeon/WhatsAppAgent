"use strict";
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
exports.detectTopicFromIndex = detectTopicFromIndex;
/**
 * @fileOverview Detects the main topic from a given academic index/outline.
 *
 * - detectTopicFromIndex - A function that initiates the topic detection process.
 * - DetectTopicFromIndexInput - The input type for the detectTopicFromIndex function.
 * - DetectTopicFromIndexOutput - The return type for the detectTopicFromIndex function.
 */
const genkit_1 = require("@/ai/genkit");
const genkit_2 = require("genkit");
const DetectTopicFromIndexInputSchema = genkit_2.z.object({
    academicIndex: genkit_2.z
        .string()
        .describe('The academic index/outline (in Markdown format) from which to detect the main topic.'),
    targetLanguage: genkit_2.z
        .string()
        .describe('The language of the academic index (e.g., "en", "es", "fr", "pt-BR", "pt-PT"). The detected topic should also be in this language.'),
});
const DetectTopicFromIndexOutputSchema = genkit_2.z.object({
    detectedTopic: genkit_2.z
        .string()
        .describe('The main topic detected from the academic index, in the specified target language.'),
});
function detectTopicFromIndex(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return detectTopicFromIndexFlow(input);
    });
}
const detectTopicPrompt = genkit_1.ai.definePrompt({
    name: 'detectTopicPrompt',
    input: { schema: DetectTopicFromIndexInputSchema },
    output: { schema: DetectTopicFromIndexOutputSchema },
    prompt: `You are an expert in understanding academic structures.
Your task is to identify and extract the main topic or central theme from the provided academic index/outline.
The index is written in {{{targetLanguage}}}.
The detected topic should be concise and also in {{{targetLanguage}}}.

Academic Index/Outline:
{{{academicIndex}}}

Return only the main topic in the 'detectedTopic' field.
For example, if the index is about "Introduction to Artificial Intelligence", "Machine Learning Concepts", "Neural Networks", the topic might be "Artificial Intelligence".
If the index is "História da Filosofia Antiga", "Platão e Aristóteles", "Estoicismo", the topic might be "Filosofia Antiga".
If the index is "# Introduction\n## Background\n## Problem Statement\n# Literature Review\n## Key Theories\n# AI Ethics\n## Bias in AI\n## Fairness", the topic might be "AI Ethics".
`,
});
const detectTopicFromIndexFlow = genkit_1.ai.defineFlow({
    name: 'detectTopicFromIndexFlow',
    inputSchema: DetectTopicFromIndexInputSchema,
    outputSchema: DetectTopicFromIndexOutputSchema,
}, (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { output } = yield detectTopicPrompt(input);
    return output;
}));
