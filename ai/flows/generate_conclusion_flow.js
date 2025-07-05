"use strict";
// src/ai/flows/generate-conclusion.ts
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
exports.generateConclusion = generateConclusion;
/**
 * @fileOverview Este arquivo define um Genkit flow especializado em gerar conclusões acadêmicas a partir do conteúdo de uma ficha de leitura ou trabalho completo.
 * O flow produz uma conclusão bem estruturada, coesa e adequada ao contexto fornecido.
 *
 * - generateConclusion - Função que inicia o processo de geração de conclusão.
 * - GenerateConclusionInput - Tipo de entrada para a função generateConclusion.
 * - GenerateConclusionOutput - Tipo de retorno da função generateConclusion.
 */
const genkit_1 = require("@/ai/genkit");
const genkit_2 = require("genkit");
// Define o schema de entrada
const GenerateConclusionInputSchema = genkit_2.z.object({
    content: genkit_2.z
        .string()
        .describe('O conteúdo da ficha de leitura ou do trabalho completo, a partir do qual a conclusão acadêmica será gerada.'),
});
// Define o schema de saída
const GenerateConclusionOutputSchema = genkit_2.z.object({
    conclusion: genkit_2.z.string().describe('A conclusão acadêmica gerada, formatada em Markdown e bem desenvolvida.'),
});
// Função exportada para chamar o flow
function generateConclusion(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return generateConclusionFlow(input);
    });
}
// Define o prompt
const generateConclusionPrompt = genkit_1.ai.definePrompt({
    name: 'generateConclusionPrompt',
    input: { schema: GenerateConclusionInputSchema },
    output: { schema: GenerateConclusionOutputSchema },
    prompt: `Você é um especialista em redação acadêmica. Sua tarefa é analisar o conteúdo fornecido (que pode ser uma ficha de leitura ou um trabalho completo) e gerar uma conclusão acadêmica coesa, clara e bem estruturada, adequada ao contexto apresentado. A saída deve ser formatada em Markdown e não deve conter imagens de nenhum tipo, apenas texto.\n\nConteúdo: {{{content}}}\n\nAo gerar a conclusão, siga estas orientações:\n1. Apresente um parágrafo conclusivo que sintetize as ideias principais do conteúdo, destacando a relevância, possíveis desdobramentos e fechamento do tema.\n2. Mantenha o texto objetivo, claro e alinhado ao tom acadêmico.\n3. A saída final deve ser uma única string em Markdown, com formatação adequada para parágrafos e título (ex: # Conclusão).\n4. Não inclua imagens, gráficos ou qualquer elemento visual, apenas texto.\n`,
});
// Define o flow
const generateConclusionFlow = genkit_1.ai.defineFlow({
    name: 'generateConclusionFlow',
    inputSchema: GenerateConclusionInputSchema,
    outputSchema: GenerateConclusionOutputSchema,
}, (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { output } = yield generateConclusionPrompt(input);
    return output;
}));
