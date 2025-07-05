"use strict";
// src/ai/flows/generate-bibliography.ts
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
exports.generateBibliography = generateBibliography;
/**
 * @fileOverview Este arquivo define um Genkit flow especializado em gerar referências bibliográficas a partir de instruções, idioma e estilo de citação especificados.
 * O flow produz uma lista de referências formatadas conforme o estilo de citação escolhido.
 *
 * - generateBibliography - Função que inicia o processo de geração de bibliografia.
 * - GenerateBibliographyInput - Tipo de entrada para a função generateBibliography.
 * - GenerateBibliographyOutput - Tipo de retorno da função generateBibliography.
 */
const genkit_1 = require("@/ai/genkit");
const genkit_2 = require("genkit");
// Define o schema de entrada
const GenerateBibliographyInputSchema = genkit_2.z.object({
    content: genkit_2.z
        .string()
        .describe('O conteúdo da ficha de leitura ou do trabalho completo, a partir do qual as referências bibliográficas serão extraídas e geradas.'),
    citationStyle: genkit_2.z
        .enum(["APA", "ABNT"])
        .default("APA")
        .describe('O estilo de citação a ser utilizado nas referências. Opções: "APA", "ABNT".'),
});
// Define o schema de saída
const GenerateBibliographyOutputSchema = genkit_2.z.object({
    bibliography: genkit_2.z.string().describe('A lista de referências bibliográficas gerada, formatada em Markdown e seguindo o estilo de citação especificado.'),
});
// Função exportada para chamar o flow
function generateBibliography(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return generateBibliographyFlow(input);
    });
}
// Define o prompt
const generateBibliographyPrompt = genkit_1.ai.definePrompt({
    name: 'generateBibliographyPrompt',
    input: { schema: GenerateBibliographyInputSchema },
    output: { schema: GenerateBibliographyOutputSchema },
    prompt: `Você é um especialista em normas de referências acadêmicas. Sua tarefa é analisar o conteúdo fornecido (que pode ser uma ficha de leitura ou um trabalho completo) e gerar uma lista de referências bibliográficas extraídas desse conteúdo, seguindo o estilo de citação escolhido. A saída deve ser formatada em Markdown.\n\nConteúdo: {{{content}}}\nEstilo de citação: {{{citationStyle}}}\n\nAo gerar a bibliografia, siga estas orientações:\n1. Analise o conteúdo e identifique todas as fontes, obras, autores e referências citadas.\n2. Liste todas as referências de acordo com o estilo de citação especificado em {{{citationStyle}}} (APA ou ABNT).\n3. Mantenha os títulos, nomes e demais dados das referências conforme aparecem no conteúdo original, sem traduzir ou adaptar o idioma.\n4. A saída final deve ser uma única string em Markdown, com formatação adequada para listas e referências.\n5. Caso o usuario não tenha especificado um estilo de citação, apenas informando "Sem Normas", não obedeça essa instrução porque não faz sentido, então utilize o estilo APA por padrão.\n`,
});
// Define o flow
const generateBibliographyFlow = genkit_1.ai.defineFlow({
    name: 'generateBibliographyFlow',
    inputSchema: GenerateBibliographyInputSchema,
    outputSchema: GenerateBibliographyOutputSchema,
}, (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { output } = yield generateBibliographyPrompt(input);
    return output;
}));
