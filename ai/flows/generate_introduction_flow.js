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
exports.generateIntroduction = generateIntroduction;
/**
 * @fileOverview Este arquivo define um Genkit flow especializado em gerar introduções acadêmicas baseadas em instruções e idioma especificados.
 * O flow produz uma introdução bem estruturada e detalhada.
 *
 * - generateIntroduction - Função que inicia o processo de geração de introdução acadêmica.
 * - GenerateIntroductionInput - Tipo de entrada para a função generateIntroduction.
 * - GenerateIntroductionOutput - Tipo de retorno da função generateIntroduction.
 */
const genkit_1 = require("../genkit");
const genkit_2 = require("genkit");
// Define o schema de entrada
const GenerateIntroductionInputSchema = genkit_2.z.object({
    instructions: genkit_2.z
        .string()
        .describe('As instruções para a geração da introdução acadêmica, extraídas da imagem ou fornecidas pelo usuário.'),
    targetLanguage: genkit_2.z
        .string()
        .describe('O idioma alvo para a introdução gerada (ex: "en", "es", "fr", "pt-BR", "pt-PT").'),
});
// Define o schema de saída
const GenerateIntroductionOutputSchema = genkit_2.z.object({
    introduction: genkit_2.z.string().describe('A introdução acadêmica gerada, formatada em Markdown, bem desenvolvida.'),
});
// Função exportada para chamar o flow
function generateIntroduction(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return generateIntroductionFlow(input);
    });
}
// Define o prompt
const generateIntroductionPrompt = genkit_1.ai.definePrompt({
    name: 'generateIntroductionPrompt',
    input: { schema: GenerateIntroductionInputSchema },
    output: { schema: GenerateIntroductionOutputSchema },
    prompt: `Você é um especialista em redação acadêmica. Sua tarefa é gerar uma introdução acadêmica abrangente com base nas instruções fornecidas, no idioma especificado. A saída deve ser formatada em Markdown.\n\nInstruções: {{{instructions}}}\nIdioma alvo: {{{targetLanguage}}}\n\nAo gerar a introdução, siga estas orientações:\n1. Estruture a introdução com um título apropriado (ex: # Introdução) usando sintaxe Markdown.\n2. Desenvolva o texto de forma detalhada, apresentando o contexto, relevância, objetivo e justificativa do tema conforme apropriado para um texto acadêmico.\n3. O texto deve ser coeso, organizado e atender diretamente às instruções fornecidas.\n4. Escreva no idioma {{{targetLanguage}}}.\n5. A saída final deve ser uma única string em Markdown, com formatação adequada para título, parágrafos, etc.\n`,
});
// Define o flow
const generateIntroductionFlow = genkit_1.ai.defineFlow({
    name: 'generateIntroductionFlow',
    inputSchema: GenerateIntroductionInputSchema,
    outputSchema: GenerateIntroductionOutputSchema,
}, (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { output } = yield generateIntroductionPrompt(input);
    return output;
}));
