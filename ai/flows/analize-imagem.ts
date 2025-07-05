// src/ai/flows/analize-imagem.ts
'use server';

/**
 * @fileOverview Gera uma resposta contextual com base em uma imagem enviada, como se fosse parte de uma conversa.
 *
 * - generateContextualResponse - Uma função que gera uma resposta contextual para uma imagem.
 * - GenerateContextualResponseInput - O tipo de entrada para a função generateContextualResponse.
 * - GenerateContextualResponseOutput - O tipo de retorno para a função generateContextualResponse.
 */

import { ai } from '../genkit';
import {z} from 'genkit';

const GenerateContextualResponseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "Uma foto para analisar, como um URI de dados que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    context: z.array(z.string()).optional().describe('Contexto de mensagens anteriores do usuário.'),
});
export type GenerateContextualResponseInput = z.infer<typeof GenerateContextualResponseInputSchema>;

const GenerateContextualResponseOutputSchema = z.object({
  response: z.string().describe('Uma resposta contextual para a imagem.'),
});
export type GenerateContextualResponseOutput = z.infer<typeof GenerateContextualResponseOutputSchema>;

export async function generateContextualResponse(input: GenerateContextualResponseInput): Promise<GenerateContextualResponseOutput> {
  return generateContextualResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContextualResponsePrompt',
  input: {schema: GenerateContextualResponseInputSchema},
  output: {schema: GenerateContextualResponseOutputSchema},
  prompt: `Você está participando de uma conversa. Um usuário enviou a seguinte imagem. Responda à imagem de uma forma que seja relevante para a imagem, como se estivesse respondendo a um amigo em uma mensagem de texto. Responda em português.

  Historico de conversa: {{{context}}}
Imagem: {{media url=photoDataUri}}`,
});

const generateContextualResponseFlow = ai.defineFlow(
  {
    name: 'generateContextualResponseFlow',
    inputSchema: GenerateContextualResponseInputSchema,
    outputSchema: GenerateContextualResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
