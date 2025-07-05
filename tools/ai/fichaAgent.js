"use strict";
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
exports.criarFichaLeitura = criarFichaLeitura;
exports.gerarResumoIA = gerarResumoIA;
const groq_sdk_1 = require("groq-sdk");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
//  conteudo: string;
const groq = new groq_sdk_1.Groq({ apiKey: process.env.GROQ_API_KEY });
function gerarResumoIA(texto, titulo, promptCustomizado) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const promptBase = promptCustomizado ||
            `Resuma o texto abaixo em até 5 frases, destacando os pontos mais relevantes para uso em trabalhos acadêmicos, como conceitos centrais, argumentos do autor, contribuições teóricas ou críticas principais.`;
        try {
            const chatCompletion = yield groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Você é um assistente especializado em criar resumos didáticos e objetivos para fichas de leitura acadêmica. Seu papel é extrair e sintetizar as ideias centrais de textos de forma clara, coerente e útil para a elaboração de trabalhos acadêmicos. O resumo deve servir como base para análise, discussão e referência teórica."
                    },
                    {
                        role: "user",
                        content: `${promptBase}\nTítulo: ${titulo}\nTexto: ${texto}`
                    }
                ],
                model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
                temperature: 0.7,
                max_completion_tokens: 400,
                top_p: 1,
                stream: false
            });
            return ((_c = (_b = (_a = chatCompletion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim()) || '';
        }
        catch (e) {
            console.warn('⚠️ Erro ao gerar resumo com IA, usando resumo simples:', e.message);
            return texto.slice(0, 500) + (texto.length > 500 ? '...' : '');
        }
    });
}
function criarFichaLeitura(conteudo, promptCustomizado) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            url: conteudo.url,
            titulo: conteudo.titulo,
            autor: conteudo.autor,
            imagens: conteudo.imagens,
            resumo: yield gerarResumoIA(conteudo.conteudo, conteudo.titulo, promptCustomizado),
            citacao: conteudo.citacao,
        };
    });
}
