"use strict";
// src/ai/flows/analize-imagem.ts
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
exports.generateContextualResponse = generateContextualResponse;
/**
 * @fileOverview Gera uma resposta contextual com base em uma imagem enviada, como se fosse parte de uma conversa.
 *
 * - generateContextualResponse - Uma função que gera uma resposta contextual para uma imagem.
 * - GenerateContextualResponseInput - O tipo de entrada para a função generateContextualResponse.
 * - GenerateContextualResponseOutput - O tipo de retorno para a função generateContextualResponse.
 */
const genkit_1 = require("../genkit");
const genkit_2 = require("genkit");
const GenerateContextualResponseInputSchema = genkit_2.z.object({
    photoDataUri: genkit_2.z
        .string()
        .describe("Uma foto para analisar, como um URI de dados que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."),
    context: genkit_2.z.array(genkit_2.z.string()).optional().describe('Contexto de mensagens anteriores do usuário.'),
});
const GenerateContextualResponseOutputSchema = genkit_2.z.object({
    response: genkit_2.z.string().describe('Uma resposta contextual para a imagem.'),
});
function generateContextualResponse(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return generateContextualResponseFlow(input);
    });
}
const prompt = genkit_1.ai.definePrompt({
    name: 'generateContextualResponsePrompt',
    input: { schema: GenerateContextualResponseInputSchema },
    output: { schema: GenerateContextualResponseOutputSchema },
    prompt: `Você está participando de uma conversa. Um usuário enviou a seguinte imagem. Responda à imagem de uma forma que seja relevante para a imagem, como se estivesse respondendo a um amigo em uma mensagem de texto. Responda em português.

  Historico de conversa: {{{context}}}
Imagem: {{media url=photoDataUri}}`,
});
const generateContextualResponseFlow = genkit_1.ai.defineFlow({
    name: 'generateContextualResponseFlow',
    inputSchema: GenerateContextualResponseInputSchema,
    outputSchema: GenerateContextualResponseOutputSchema,
}, (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { output } = yield prompt(input);
    return output;
}));
