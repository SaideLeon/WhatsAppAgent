"use strict";
// src/ai/flows/generate-index-flow.ts
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
exports.generateIndexFromTitles = generateIndexFromTitles;
/**
 * @fileOverview This file defines a Genkit flow for generating an academic index (outline/table of contents)
 * from user-provided titles or a topic, in a specified language.
 *
 * - generateIndexFromTitles - A function that initiates the index generation process.
 * - GenerateIndexFromTitlesInput - The input type for the generateIndexFromTitles function.
 * - GenerateIndexFromTitlesOutput - The return type for the generateIndexFromTitles function.
 */
const genkit_1 = require("../genkit");
const genkit_2 = require("genkit");
// Define the input schema
const GenerateIndexFromTitlesInputSchema = genkit_2.z.object({
    titles: genkit_2.z
        .string()
        .describe('The user-provided topic, preliminary titles, or general subject for the academic paper.'),
    targetLanguage: genkit_2.z
        .string()
        .describe('The target language for the generated index (e.g., "en", "pt-BR", "pt-PT", "es", "fr").'),
});
// Define the output schema
const GenerateIndexFromTitlesOutputSchema = genkit_2.z.object({
    generatedIndex: genkit_2.z.array(genkit_2.z.string()).describe('Lista de seções do índice acadêmico, cada item é um título de seção, na ordem correta.'),
});
// Exported function to call the flow
function generateIndexFromTitles(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return generateIndexFromTitlesFlow(input);
    });
}
// Define the prompt
const generateIndexFromTitlesPrompt = genkit_1.ai.definePrompt({
    name: 'generateIndexFromTitlesPrompt',
    input: { schema: GenerateIndexFromTitlesInputSchema },
    output: { schema: GenerateIndexFromTitlesOutputSchema },
    prompt: `Você é um orientador acadêmico especialista. Sua tarefa é gerar uma lista de seções para um índice acadêmico (ou sumário) bem estruturado, baseado no tópico ou títulos preliminares fornecidos.\n\nRegras:\n- O resultado deve ser uma lista (array) de strings, cada uma representando o título de uma seção, na ordem correta.\n- O primeiro item da lista deve ser sempre 'Introdução' (ou equivalente na língua alvo).\n- O último item da lista deve ser sempre 'Referência Bibliográfica' (ou equivalente na língua alvo).\n- Os demais itens devem ser seções relevantes para um trabalho acadêmico, em ordem lógica.\n- Todos os títulos devem estar na língua alvo especificada em 'targetLanguage'.\n\nTópico/Títulos Preliminares:\n{{{titles}}}\n\nRetorne apenas a lista de seções no campo 'generatedIndex'.\nExemplo de saída (para português):\n[\n  "1. Introdução",\n  "2. Revisão da Literatura",\n  "3. Metodologia",\n  "4. Resultados e Discussão",\n  "Conclusão",\n  "Referência Bibliográfica"\n]\n`,
});
// Define the flow
const generateIndexFromTitlesFlow = genkit_1.ai.defineFlow({
    name: 'generateIndexFromTitlesFlow',
    inputSchema: GenerateIndexFromTitlesInputSchema,
    outputSchema: GenerateIndexFromTitlesOutputSchema,
}, (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { output } = yield generateIndexFromTitlesPrompt(input);
    return output;
}));
