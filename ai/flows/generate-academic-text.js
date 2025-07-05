"use strict";
// src/ai/flows/generate-academic-text.ts
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
exports.generateAcademicText = generateAcademicText;
/**
 * @fileOverview This file defines a Genkit flow for generating academic text based on instructions, a specified language, and a citation style.
 * The flow aims to produce well-structured academic content with detailed explanations under each heading, adhering to the chosen citation style.
 *
 * - generateAcademicText - A function that initiates the academic text generation process.
 * - GenerateAcademicTextInput - The input type for the generateAcademicText function.
 * - GenerateAcademicTextOutput - The return type for the generateAcademicText function.
 */
const genkit_1 = require("../genkit");
const genkit_2 = require("genkit");
// Define the input schema
const GenerateAcademicTextInputSchema = genkit_2.z.object({
    reference: genkit_2.z
        .string()
        .describe('The reference for the academic text generation, extracted from the image or provided by the user.'),
    instructions: genkit_2.z
        .string()
        .describe('The instructions for the academic text generation, extracted from the image or provided by the user.'),
    targetLanguage: genkit_2.z
        .string()
        .describe('The target language for the generated academic text (e.g., "en", "es", "fr", "pt-BR", "pt-PT").'),
    citationStyle: genkit_2.z
        .enum(["APA", "ABNT", "Sem Normas"])
        .default("Sem Normas")
        .describe('The citation style to be used for the academic text. Options: "APA", "ABNT", "Sem Normas" (default).'),
    completedSections: genkit_2.z
        .string()
        .optional()
        .describe('Sections of the academic text that have already been completed. These should be used as context, but not redeveloped.'),
});
// Define the output schema
const GenerateAcademicTextOutputSchema = genkit_2.z.object({
    academicText: genkit_2.z.string().describe('The generated academic text, formatted in Markdown, with well-developed sections under each heading, following the specified citation style.'),
});
// Exported function to call the flow
function generateAcademicText(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return generateAcademicTextFlow(input);
    });
}
// Define the prompt
const generateAcademicTextPrompt = genkit_1.ai.definePrompt({
    name: 'generateAcademicTextPrompt',
    input: { schema: GenerateAcademicTextInputSchema },
    output: { schema: GenerateAcademicTextOutputSchema },
    prompt: `Você é um escritor acadêmico especialista. Sua tarefa é gerar um texto acadêmico completo com base nas instruções fornecidas, no idioma alvo especificado e seguindo o estilo de citação escolhido. A saída deve estar formatada em Markdown.

Instruções: {{{instructions}}}
Idioma alvo: {{{targetLanguage}}}
Estilo de citação: {{{citationStyle}}}
Referência bibliográfica: {{{reference}}}

Seções já concluídas (apenas contexto, não desenvolver novamente):
{{#if completedSections}}
{{{completedSections}}}
{{/if}}

IMPORTANTE:
- Desenvolva apenas o título/tema exato proposto nas instruções, sem desenvolver ou repetir qualquer outro título, subtítulo ou contexto anterior.
- NÃO desenvolva subtítulos implícitos, nem aprofunde tópicos que não estejam explicitamente no título atual.
- NÃO repita, resuma ou utilize o conteúdo das seções anteriores, apenas use como contexto para evitar repetição.
- NÃO inclua introdução, conclusão, bibliografia ou qualquer outra parte do trabalho acadêmico, a menos que seja explicitamente solicitado no título atual.
- O texto gerado deve conter apenas o desenvolvimento do título atual proposto, sem qualquer conteúdo extra.

Ao gerar o texto, siga estes passos:
1. Estruture o texto acadêmico com títulos claros e relevantes (ex: # Título da Seção) apenas se apropriado para o título atual. Use a sintaxe de títulos do Markdown.
2. Garanta que o conteúdo abaixo do título seja bem desenvolvido e expandido, com explicações detalhadas, exemplos, argumentos e detalhes de apoio conforme apropriado para um artigo acadêmico.
3. Todo o texto deve ser coerente, bem organizado e abordar diretamente as instruções fornecidas.
4. O texto deve ser escrito em {{{targetLanguage}}}.
5. Siga estritamente o estilo de citação especificado em {{{citationStyle}}}.

    - Se "APA" for escolhido, siga as diretrizes da American Psychological Association (APA) 7ª edição para todas as citações e referências. Use o sistema autor-data. Cada citação deve incluir o sobrenome do autor, ano de publicação e número da página. Priorize o uso de citações diretas curtas (menos de 40 palavras) incorporadas ao texto, seguindo o formato: De acordo com Pinto (2008) a nova reforma só surgirá em 1982, agora no contexto “da emergente sociedade da informação” (p. 29). Existem três tipos de citação:
      - Citação indireta: Parafraseie a ideia do autor com suas próprias palavras.
      - Citação direta curta (menos de 40 palavras): Incorpore a citação ao texto com aspas duplas. Exemplo: Era um estágio que conferia “habilitação preferencial para o provimento dos lugares de arquivista” (Silva & Ribeiro, 2002, pp. 143-144).
      - Citação direta longa (40 palavras ou mais): Apresente a citação em bloco separado, sem aspas, com recuo de 1,27 cm da margem esquerda e espaçamento duplo. Exemplo:

        Na década de 70 abre-se um novo período na vida dos profissionais da informação com a criação da primeira associação profissional do setor. Nessa altura:
        Debatia-se então, o orgulho de ser um profissional BAD sem complexos perante as outras profissões mais afirmativas e com maior reconhecimento social, com estatutos remuneratórios mais compensadores e carreiras mais bem definidas e estruturadas. Foram tempos de mudança, de luta, em que se ganhou consciência de classe. (Queirós, 2001, pp. 1-2)
      - Citação de citação: Transmita a ideia de um autor sem acesso ao texto original.

    - Se "ABNT" for escolhido, use o estilo ABNT para todas as citações e referências. Exemplo de citação no texto: (AUTOR, ANO, p. xx).
    - Se "Sem Normas" for escolhido, gere o texto naturalmente sem impor regras específicas de citação, mas mantenha o tom acadêmico.
6. É de extrema importância utilizar as imagens presentes nas referências bibliográficas. Sempre procure incluir essas imagens no texto gerado. Se a referência bibliográfica contiver imagens (com 'src' e 'legenda'), insira as imagens na seção mais relevante do texto usando a sintaxe de imagem do Markdown: ![Legenda](src). A imagem deve ser posicionada onde melhor ilustra ou complementa o conteúdo discutido. Sempre inclua a legenda fornecida como legenda da imagem. Se houver várias imagens, distribua-as ao longo do texto conforme o contexto de cada seção. O uso de imagens é essencial para enriquecer e esclarecer o conteúdo acadêmico.
    - Para todas as imagens, nunca inclua parâmetros de URL (como '?width=50&blur=10') na fonte da imagem. Sempre use apenas a URL base da imagem (ex: 'https://static.todamateria.com.br/upload/fo/to/fotossistemas.jpg') ao inserir imagens no Markdown. Isso se aplica a todas as imagens, inclusive as da ficha técnica e de qualquer outra fonte.
7. A saída final deve ser uma única string em Markdown. Garanta a formatação correta em Markdown para títulos, parágrafos, listas, imagens, citações, etc.
`,
});
// Define the flow
const generateAcademicTextFlow = genkit_1.ai.defineFlow({
    name: 'generateAcademicTextFlow',
    inputSchema: GenerateAcademicTextInputSchema,
    outputSchema: GenerateAcademicTextOutputSchema,
}, (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { output } = yield generateAcademicTextPrompt(input);
    return output;
}));
