import { config } from 'dotenv';
config();

import { Client, Message, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { getAIResponse } from "./lib/actions";
import prisma from './utils/prisma';  
import { fichador } from './tools/fichador';
import { markdownToDocx } from './utils/markdownToDocx';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import * as fs from 'fs';
import path from 'path';
import Groq from "groq-sdk";  
import puppeteer from 'puppeteer';

 

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'wwebjs_auth'
    }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        executablePath: puppeteer.executablePath()
    }
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); 

// Função utilitária para checar se a mensagem foi enviada pelo próprio bot
function isFromBot(message: Message): boolean {
    // O WhatsApp-web.js marca mensagens enviadas pelo próprio cliente com fromMe = true
    return message.fromMe === true;
}

// Função para obter histórico de contexto do usuário (PostgreSQL)
async function getUserContext(userId: string): Promise<string[]> {
    const context = await prisma.userContext.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 20
    });
    interface UserContext {
        id: number;
        userId: string;
        message: string;
        createdAt: Date;
    }

    return context.map((c: UserContext) => c.message);
}

// Função para adicionar mensagem ao contexto do usuário (PostgreSQL)
async function addUserMessageToContext(userId: string, message: string) {
    await prisma.userContext.create({
        data: { userId, message }
    });
    // Limita o contexto a 20 mensagens (remove as mais antigas)
    const all = await prisma.userContext.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' }
    });
    if (all.length > 20) {
        interface UserContextRecord {
            id: number;
            userId: string;
            message: string;
            createdAt: Date;
        }
        const toDelete: number[] = (all as UserContextRecord[]).slice(0, all.length - 20).map((c: UserContextRecord) => c.id);
        await prisma.userContext.deleteMany({ where: { id: { in: toDelete } } });
    }
}

// Novo fluxo de bate-papo com IA usando o flow Genkit
import { chatFlow } from './ai/flows/chat-flow'; 

// Novo fluxo de bate-papo com IA
async function chatWithAI(userId: string, message: string, imageDataUri?: string): Promise<string> {
    let context = await getUserContext(userId);
    context = context.slice(-10);
    // Se receber imagem (dataUri), prioriza resposta multimodal
    if (imageDataUri) {
        const result = await getAIResponse({ photoDataUri: imageDataUri, context });
        if (result.success) return result.success;
        if (result.error) return result.error;
    }
    // Caso padrão: texto
    const result = await chatFlow({ userId, message, context });
    return result.response;
} 
// Listening to all incoming messages
client.on('message_create', async (message: Message) => {
    if (isFromBot(message)) return;
    // Ignora mensagens do tipo 'sticker' e 'video'
    if (message.type === 'sticker' || message.type === 'video') {
        console.log(`Mensagem do tipo ${message.type} ignorada.`);
        return;
    }
    console.log(message.body);
    const userId = message.from;
    if (message.body === '!ping') {
        message.reply('pong');
    } else if (message.body.toLowerCase().startsWith('tema:')) {
        try {
            await addUserMessageToContext(userId, message.body);
            await message.reply('🔍 Buscando artigos e contexto para o tema, isso vai levar alguns minutos...');
            const topic = message.body.substring(5).trim();
            // Raspa e resume conteúdos do tema para contexto
            const promptCustomizado = 'Resuma o texto abaixo em linguagem simples, focando apenas nos conceitos científicos principais.';
            const fichas = await fichador(topic, false, false, message,promptCustomizado);
            let contextoFichas = '';
            if (fichas && fichas.length > 0) {
                contextoFichas = fichas?.map(ficha => JSON.stringify(ficha)).join(''),
                await message.reply(`✅ ${fichas.length} resumos de artigos coletados para contexto.`);
            } else {
                await message.reply('⚠️ Nenhum artigo encontrado para contexto. Prosseguindo mesmo assim.');
            }
            await message.reply('📝 Gerando índice acadêmico...');
            // Chama o fluxo de índice
            const { generateIndexFromTitles } = await import('./ai/flows/generate-index-flow');
            const { generateIntroduction } = await import('./ai/flows/generate_introduction_flow');
            const { generateAcademicText } = await import('./ai/flows/generate-academic-text');
            const targetLanguage = 'pt'; // ou detecte conforme necessário
            const citationStyle = 'APA'; 
            const indexResult = await generateIndexFromTitles({ titles: topic, targetLanguage });
            await message.reply('📑 Índice gerado. Desenvolvendo cada seção...');
            let respostaFinal = '';
            const seçõesGeradas = new Set();
            for (const item of indexResult.generatedIndex) {
                const secao = item.trim().toLowerCase();
                if (seçõesGeradas.has(secao)) continue; // Evita duplicidade
                seçõesGeradas.add(secao);
                await message.reply(`✏️ Desenvolvendo seção: ${item}`);
                if (secao.includes('introdução')) {
                    const intro = await generateIntroduction({ instructions: `${topic}`, targetLanguage });
                    respostaFinal += `\n${intro.introduction}`;
                } else {
                    const dev = await generateAcademicText({ reference: contextoFichas, instructions: topic, targetLanguage, citationStyle, completedSections: respostaFinal });
                    respostaFinal += `\n${dev.academicText}`;
                }
            }
            await addUserMessageToContext(userId, respostaFinal);
            await message.reply('✅ Trabalho acadêmico finalizado! Gerando documento .docx...');
            // Salva no banco
            await prisma.academicWork.create({ data: { userId, topic, content: respostaFinal } }); 
            const docBuffer = await markdownToDocx(respostaFinal);
            const fileName = `trabalho_${topic}_${userId}_${Date.now()}.docx`;
            const filePath = path.join('dados', fileName);
            if (!existsSync('dados')) {
                mkdirSync('dados');
            }
            writeFileSync(filePath, docBuffer);
            await message.reply('📄 Documento gerado! Enviando arquivo...');
            const { MessageMedia } = await import('whatsapp-web.js');
            const docMedia = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(message.from, docMedia, { sendMediaAsDocument: true });
        } catch (error) {
            message.reply('Erro ao gerar texto acadêmico.');
            console.error(error);
        }
    } else if (message.hasMedia && (message.type === 'audio' || message.type === 'ptt' || message.type === 'image')) {
        const media = await message.downloadMedia();
        if (message.type === 'audio' || message.type === 'ptt') {
            console.log('tipo: ',message.type);
            console.log('Recebido áudio, iniciando processamento...');
            const audioBuffer = Buffer.from(media.data, 'base64');
            const audioPath = `temp_audio_${Date.now()}.ogg`;
            writeFileSync(audioPath, audioBuffer);
            console.log('Arquivo de áudio salvo em:', audioPath);

            // Transcreve o áudio
            let textoTranscrito = '';
            try {
                textoTranscrito = await transcreverAudio(audioPath);
                console.log('Transcrição obtida:', textoTranscrito);
 
                 const aiResponse = await chatWithAI(userId, textoTranscrito);
                 const lembrar = `Transcrição de audio: ${textoTranscrito} \n\nResposta da IA: ${aiResponse}`;
                 await addUserMessageToContext(userId, lembrar);
                 await message.reply(aiResponse);
            } catch (err) {
                console.error('Erro ao transcrever áudio:', err);
                await message.reply('Erro ao transcrever o áudio.');
                fs.unlinkSync(audioPath);
                return;
            } 

            // Remove o arquivo temporário
            fs.unlinkSync(audioPath);
            console.log('Arquivo de áudio removido:', audioPath);
            return;
        } else if (message.type === 'image') {
            // Salva a imagem recebida
            const imageBuffer = Buffer.from(media.data, 'base64');
            const imagePath = `temp_img_${Date.now()}.jpg`;
            writeFileSync(imagePath, imageBuffer);
            // Converte imagem para data URI
            const imageBase64 = imageBuffer.toString('base64');
            const dataUri = `data:image/jpeg;base64,${imageBase64}`;
            // IA responde tudo (multimodal)
            const aiResponse = await chatWithAI(userId, message.body, dataUri);
            await message.reply(aiResponse); 
            const promptXModule = await import('./utils/prompt');
            const prompt2 = await promptXModule.promptX(); const aiResponseMemory = await chatWithAI(userId, prompt2, dataUri); 
            const lembrar = `Analise da Imagem: ${aiResponseMemory} \n\nResposta da IA: ${aiResponse}`;
            await addUserMessageToContext(userId, lembrar);
            
            // Após o processamento, remova o arquivo temporário
            fs.unlinkSync(imagePath);
            return;
        } 
    } else {
        // IA responde tudo
        console.log('Tipo de mensagem: ' +message.type);
        const aiResponse = await chatWithAI(userId, message.body);
        await addUserMessageToContext(userId, aiResponse);
        await message.reply(aiResponse);
    }
});

// Função para transcrever áudio usando Groq Whisper
async function transcreverAudio(filePath: string): Promise<string> {
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3-turbo",
    response_format: "verbose_json",
    language: "pt",
    temperature: 0.0,
  });
  return transcription.text;
}


client.initialize();
