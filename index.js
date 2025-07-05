"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const actions_1 = require("./lib/actions");
const prisma_1 = __importDefault(require("./utils/prisma"));
const fichador_1 = require("./tools/fichador");
const markdownToDocx_1 = require("./utils/markdownToDocx");
const fs_1 = require("fs");
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const client = new whatsapp_web_js_1.Client({
    authStrategy: new whatsapp_web_js_1.LocalAuth({
        dataPath: 'wwebjs_auth'
    }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        executablePath: puppeteer_1.default.executablePath()
    }
});
client.on('ready', () => {
    console.log('Client is ready!');
});
client.on('qr', (qr) => {
    qrcode_terminal_1.default.generate(qr, { small: true });
});
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
// Função utilitária para checar se a mensagem foi enviada pelo próprio bot
function isFromBot(message) {
    // O WhatsApp-web.js marca mensagens enviadas pelo próprio cliente com fromMe = true
    return message.fromMe === true;
}
// Função para obter histórico de contexto do usuário (PostgreSQL)
function getUserContext(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = yield prisma_1.default.userContext.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            take: 20
        });
        return context.map((c) => c.message);
    });
}
// Função para adicionar mensagem ao contexto do usuário (PostgreSQL)
function addUserMessageToContext(userId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma_1.default.userContext.create({
            data: { userId, message }
        });
        // Limita o contexto a 20 mensagens (remove as mais antigas)
        const all = yield prisma_1.default.userContext.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });
        if (all.length > 20) {
            const toDelete = all.slice(0, all.length - 20).map((c) => c.id);
            yield prisma_1.default.userContext.deleteMany({ where: { id: { in: toDelete } } });
        }
    });
}
// Novo fluxo de bate-papo com IA usando o flow Genkit
const chat_flow_1 = require("./ai/flows/chat-flow");
// Novo fluxo de bate-papo com IA
function chatWithAI(userId, message, imageDataUri) {
    return __awaiter(this, void 0, void 0, function* () {
        let context = yield getUserContext(userId);
        context = context.slice(-10);
        // Se receber imagem (dataUri), prioriza resposta multimodal
        if (imageDataUri) {
            const result = yield (0, actions_1.getAIResponse)({ photoDataUri: imageDataUri, context });
            if (result.success)
                return result.success;
            if (result.error)
                return result.error;
        }
        // Caso padrão: texto
        const result = yield (0, chat_flow_1.chatFlow)({ userId, message, context });
        return result.response;
    });
}
// Listening to all incoming messages
client.on('message_create', (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (isFromBot(message))
        return;
    // Ignora mensagens do tipo 'sticker' e 'video'
    if (message.type === 'sticker' || message.type === 'video') {
        console.log(`Mensagem do tipo ${message.type} ignorada.`);
        return;
    }
    console.log(message.body);
    const userId = message.from;
    if (message.body === '!ping') {
        message.reply('pong');
    }
    else if (message.body.toLowerCase().startsWith('tema:')) {
        try {
            yield addUserMessageToContext(userId, message.body);
            yield message.reply('🔍 Buscando artigos e contexto para o tema, isso vai levar alguns minutos...');
            const topic = message.body.substring(5).trim();
            // Raspa e resume conteúdos do tema para contexto
            const promptCustomizado = 'Resuma o texto abaixo em linguagem simples, focando apenas nos conceitos científicos principais.';
            const fichas = yield (0, fichador_1.fichador)(topic, false, false, message, promptCustomizado);
            let contextoFichas = '';
            if (fichas && fichas.length > 0) {
                contextoFichas = fichas === null || fichas === void 0 ? void 0 : fichas.map(ficha => JSON.stringify(ficha)).join(''),
                    yield message.reply(`✅ ${fichas.length} resumos de artigos coletados para contexto.`);
            }
            else {
                yield message.reply('⚠️ Nenhum artigo encontrado para contexto. Prosseguindo mesmo assim.');
            }
            yield message.reply('📝 Gerando índice acadêmico...');
            // Chama o fluxo de índice
            const { generateIndexFromTitles } = yield Promise.resolve().then(() => __importStar(require('./ai/flows/generate-index-flow')));
            const { generateIntroduction } = yield Promise.resolve().then(() => __importStar(require('./ai/flows/generate_introduction_flow')));
            const { generateAcademicText } = yield Promise.resolve().then(() => __importStar(require('./ai/flows/generate-academic-text')));
            const targetLanguage = 'pt'; // ou detecte conforme necessário
            const citationStyle = 'APA';
            const indexResult = yield generateIndexFromTitles({ titles: topic, targetLanguage });
            yield message.reply('📑 Índice gerado. Desenvolvendo cada seção...');
            let respostaFinal = '';
            const seçõesGeradas = new Set();
            for (const item of indexResult.generatedIndex) {
                const secao = item.trim().toLowerCase();
                if (seçõesGeradas.has(secao))
                    continue; // Evita duplicidade
                seçõesGeradas.add(secao);
                yield message.reply(`✏️ Desenvolvendo seção: ${item}`);
                if (secao.includes('introdução')) {
                    const intro = yield generateIntroduction({ instructions: `${topic}`, targetLanguage });
                    respostaFinal += `\n${intro.introduction}`;
                }
                else {
                    const dev = yield generateAcademicText({ reference: contextoFichas, instructions: topic, targetLanguage, citationStyle, completedSections: respostaFinal });
                    respostaFinal += `\n${dev.academicText}`;
                }
            }
            yield addUserMessageToContext(userId, respostaFinal);
            yield message.reply('✅ Trabalho acadêmico finalizado! Gerando documento .docx...');
            // Salva no banco
            yield prisma_1.default.academicWork.create({ data: { userId, topic, content: respostaFinal } });
            const docBuffer = yield (0, markdownToDocx_1.markdownToDocx)(respostaFinal);
            const fileName = `trabalho_${topic}_${userId}_${Date.now()}.docx`;
            const filePath = path_1.default.join('dados', fileName);
            if (!(0, fs_1.existsSync)('dados')) {
                (0, fs_1.mkdirSync)('dados');
            }
            (0, fs_1.writeFileSync)(filePath, docBuffer);
            yield message.reply('📄 Documento gerado! Enviando arquivo...');
            const { MessageMedia } = yield Promise.resolve().then(() => __importStar(require('whatsapp-web.js')));
            const docMedia = MessageMedia.fromFilePath(filePath);
            yield client.sendMessage(message.from, docMedia, { sendMediaAsDocument: true });
        }
        catch (error) {
            message.reply('Erro ao gerar texto acadêmico.');
            console.error(error);
        }
    }
    else if (message.hasMedia && (message.type === 'audio' || message.type === 'ptt' || message.type === 'image')) {
        const media = yield message.downloadMedia();
        if (message.type === 'audio' || message.type === 'ptt') {
            console.log('tipo: ', message.type);
            console.log('Recebido áudio, iniciando processamento...');
            const audioBuffer = Buffer.from(media.data, 'base64');
            const audioPath = `temp_audio_${Date.now()}.ogg`;
            (0, fs_1.writeFileSync)(audioPath, audioBuffer);
            console.log('Arquivo de áudio salvo em:', audioPath);
            // Transcreve o áudio
            let textoTranscrito = '';
            try {
                textoTranscrito = yield transcreverAudio(audioPath);
                console.log('Transcrição obtida:', textoTranscrito);
                const aiResponse = yield chatWithAI(userId, textoTranscrito);
                const lembrar = `Transcrição de audio: ${textoTranscrito} \n\nResposta da IA: ${aiResponse}`;
                yield addUserMessageToContext(userId, lembrar);
                yield message.reply(aiResponse);
            }
            catch (err) {
                console.error('Erro ao transcrever áudio:', err);
                yield message.reply('Erro ao transcrever o áudio.');
                fs.unlinkSync(audioPath);
                return;
            }
            // Remove o arquivo temporário
            fs.unlinkSync(audioPath);
            console.log('Arquivo de áudio removido:', audioPath);
            return;
        }
        else if (message.type === 'image') {
            // Salva a imagem recebida
            const imageBuffer = Buffer.from(media.data, 'base64');
            const imagePath = `temp_img_${Date.now()}.jpg`;
            (0, fs_1.writeFileSync)(imagePath, imageBuffer);
            // Converte imagem para data URI
            const imageBase64 = imageBuffer.toString('base64');
            const dataUri = `data:image/jpeg;base64,${imageBase64}`;
            // IA responde tudo (multimodal)
            const aiResponse = yield chatWithAI(userId, message.body, dataUri);
            yield message.reply(aiResponse);
            const promptXModule = yield Promise.resolve().then(() => __importStar(require('./utils/prompt')));
            const prompt2 = yield promptXModule.promptX();
            const aiResponseMemory = yield chatWithAI(userId, prompt2, dataUri);
            const lembrar = `Analise da Imagem: ${aiResponseMemory} \n\nResposta da IA: ${aiResponse}`;
            yield addUserMessageToContext(userId, lembrar);
            // Após o processamento, remova o arquivo temporário
            fs.unlinkSync(imagePath);
            return;
        }
    }
    else {
        // IA responde tudo
        console.log('Tipo de mensagem: ' + message.type);
        const aiResponse = yield chatWithAI(userId, message.body);
        yield addUserMessageToContext(userId, aiResponse);
        yield message.reply(aiResponse);
    }
}));
// Função para transcrever áudio usando Groq Whisper
function transcreverAudio(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const transcription = yield groq.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-large-v3-turbo",
            response_format: "verbose_json",
            language: "pt",
            temperature: 0.0,
        });
        return transcription.text;
    });
}
client.initialize();
