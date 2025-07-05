// lib/actions.ts 

import {
  generateContextualResponse,
  type GenerateContextualResponseInput,
} from "../ai/flows/analize-imagem";
import { z } from "zod";

const inputSchema = z.object({
  photoDataUri: z.string().refine((val) => val.startsWith('data:image/'), {
    message: "Deve ser um URI de dados de imagem válido."
  }),
  context: z.array(z.string()).optional(),
});

export async function getAIResponse(values: z.infer<typeof inputSchema>): Promise<{ success?: string; error?: string }> {
  const validatedFields = inputSchema.safeParse(values);
  if (!validatedFields.success) {
    console.error("Validation Error:", validatedFields.error.flatten().fieldErrors);
    return { error: "Formato de imagem inválido fornecido." };
  }

  try {
    const input: GenerateContextualResponseInput = {
      photoDataUri: validatedFields.data.photoDataUri,
      context: validatedFields.data.context,
    };
    const result = await generateContextualResponse(input);
    return { success: result.response };
  } catch (error) {
    console.error("AI Response Error:", error);
    return { error: "Falha ao obter uma resposta da IA. Por favor, tente novamente." };
  }
}
