"use strict";
// lib/actions.ts 
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
exports.getAIResponse = getAIResponse;
const analize_imagem_1 = require("../ai/flows/analize-imagem");
const zod_1 = require("zod");
const inputSchema = zod_1.z.object({
    photoDataUri: zod_1.z.string().refine((val) => val.startsWith('data:image/'), {
        message: "Deve ser um URI de dados de imagem válido."
    }),
    context: zod_1.z.array(zod_1.z.string()).optional(),
});
function getAIResponse(values) {
    return __awaiter(this, void 0, void 0, function* () {
        const validatedFields = inputSchema.safeParse(values);
        if (!validatedFields.success) {
            console.error("Validation Error:", validatedFields.error.flatten().fieldErrors);
            return { error: "Formato de imagem inválido fornecido." };
        }
        try {
            const input = {
                photoDataUri: validatedFields.data.photoDataUri,
                context: validatedFields.data.context,
            };
            const result = yield (0, analize_imagem_1.generateContextualResponse)(input);
            return { success: result.response };
        }
        catch (error) {
            console.error("AI Response Error:", error);
            return { error: "Falha ao obter uma resposta da IA. Por favor, tente novamente." };
        }
    });
}
