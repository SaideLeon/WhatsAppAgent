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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fichador = fichador;
const scraping_1 = require("../tools/scraping");
const fichaAgent_1 = require("../tools/ai/fichaAgent");
const node_fs_1 = require("node:fs");
const path_1 = __importDefault(require("path"));
function fichador(termoBusca_1, todasPaginas_1) {
    return __awaiter(this, arguments, void 0, function* (termoBusca, todasPaginas, salvar = true, message, promptCustomizado) {
        console.log(`🔍 Buscando artigos para: ${termoBusca} (${todasPaginas ? 'todas as páginas' : 'apenas a primeira página'})`);
        let resultados = [];
        try {
            resultados = yield (0, scraping_1.rasparTodasPaginasBusca)(termoBusca, todasPaginas);
        }
        catch (erro) {
            console.error('❌ Erro ao buscar links:', erro);
            return [];
        }
        console.log(`🔗 ${resultados.length} links encontrados. Raspando conteúdos...`);
        message.reply(`🔗 ${resultados.length} links encontrados. Raspando conteúdos...`);
        const fichas = [];
        for (const { url } of resultados) {
            try {
                const conteudo = yield (0, scraping_1.rasparConteudoPagina)(url);
                const ficha = yield (0, fichaAgent_1.criarFichaLeitura)(conteudo, promptCustomizado);
                fichas.push(ficha);
                message.reply(`✅ Encontrei na internet artigo entitulado *${ficha.titulo}*.`);
                message.reply(`📝Raspando o conteúdo do artigo...`);
                console.log(`✅ Ficha criada para: ${ficha.titulo}`);
            }
            catch (erro) {
                console.error(`❌ Erro ao processar ${url}:`, erro);
                message.reply(`❌ Erro ao processar o resumo`);
            }
        }
        if (salvar) {
            (0, node_fs_1.mkdirSync)('dados', { recursive: true });
            (0, node_fs_1.writeFileSync)(path_1.default.join('dados', `fichas-leitura-${termoBusca}.json`), JSON.stringify(fichas, null, 2), 'utf-8');
            console.log('💾 Fichas salvas em arquivo!');
        }
        console.log('✅ Todas as fichas geradas!');
        message.reply(`✅ resumo concluido com sucesso. ${fichas.length} fichas de leitura geradas com sucesso!`);
        return fichas;
    });
}
