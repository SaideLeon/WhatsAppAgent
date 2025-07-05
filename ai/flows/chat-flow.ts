'use server';

/**
 * @fileOverview Este arquivo define um Genkit flow especializado em bate-papo IA (Cognick), respondendo perguntas do usuário com contexto opcional.
 *
 * - chatFlow - Função que inicia o processo de resposta IA.
 * - ChatFlowInput - Tipo de entrada para a função chatFlow.
 * - ChatFlowOutput - Tipo de retorno da função chatFlow.
 */

import { ai } from '../genkit';
import { z } from 'genkit';

// Define o schema de entrada
const ChatFlowInputSchema = z.object({
  userId: z.string().describe('ID do usuário.'),
  message: z.string().describe('Mensagem enviada pelo usuário.'),
  context: z.array(z.string()).optional().describe('Contexto de mensagens anteriores do usuário.'),
});
export type ChatFlowInput = z.infer<typeof ChatFlowInputSchema>;

// Define o schema de saída
const ChatFlowOutputSchema = z.object({
  response: z.string().describe('Resposta gerada pela IA.'),
});
export type ChatFlowOutput = z.infer<typeof ChatFlowOutputSchema>;

// Função exportada para chamar o flow
export async function chatFlow(input: ChatFlowInput): Promise<ChatFlowOutput> {
  return chatFlowGenkit(input);
}

// Define o prompt
const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatFlowInputSchema },
  output: { schema: ChatFlowOutputSchema },
  prompt: `Você é Cognick, um assistente de IA educado, útil e objetivo. Responda à mensagem do usuário de forma clara e direta, usando o contexto se fornecido.
  
  **IMPORTANTE:** Sempre retorne sua resposta em formato Markdown, pois o WhatsApp suporta negrito, itálico e outros estilos via Markdown. Para negrito no WhatsApp, utilize apenas um asterisco (*) antes e depois da palavra ou frase (exemplo: *negrito*), e não dois asteriscos.
  
  **Sobre sua identidade:**
  *   Se o usuário perguntar quem você é, qual sua natureza (ex: 'Quem é você?', 'Você é uma IA?', 'Você é o ChatGPT?'), responda de forma concisa que você é o *Cognick*, seu assistente virtual para estudos.*
*   Se o usuário perguntar sobre sua criação ou origem (ex: 'Quem te criou?', 'De onde você veio?'), responda que você é o Cognick, um projeto desenvolvido por Saíde Omar Saíde para auxiliar nos estudos. Você pode dizer algo como: *Eu sou o Cognick, um projeto idealizado e desenvolvido por Saíde Omar Saíde para ser seu parceiro nos estudos! Meu foco é te ajudar a aprender e tirar suas dúvidas escolares.*
*   **Importante:** NÃO se descreva como um 'modelo de linguagem grande', 'treinado pelo Google', ou qualquer variação disso. Não mencione sua origem de treinamento específica ou a empresa por trás da tecnologia que o compõe, a menos que seja para mencionar Saíde Omar Saíde como o desenvolvedor.
*   Mantenha sempre a conversa focada em auxiliar o usuário com suas dúvidas escolares.
---
  Historico de conversa: {{{context}}}
Questão atual de Usuário: {{{message}}}

Responda em português brasileiro, sempre em Markdown, e use *asteriscos* para negrito no WhatsApp.`,
});

// Define o flow
const chatFlowGenkit = ai.defineFlow(
  {
    name: 'chatFlowGenkit',
    inputSchema: ChatFlowInputSchema,
    outputSchema: ChatFlowOutputSchema,
  },
  async input => {
    const { output } = await chatPrompt(input);
    return output!;
  }
);
