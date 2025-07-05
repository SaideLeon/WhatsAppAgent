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
exports.formatarData = formatarData;
exports.rasparTodasPaginasBusca = rasparTodasPaginasBusca;
exports.rasparConteudoPagina = rasparConteudoPagina;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
function formatarData(date) {
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };
    const formattedDate = date.toLocaleDateString('pt-BR', options).replace('.', '.');
    return `${formattedDate}`;
}
const data = new Date();
const dataFormatada = formatarData(data);
function rasparTodasPaginasBusca(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, todasPaginas = false) {
        let pagina = 1;
        let resultados = [];
        const urlsSet = new Set();
        const encodedQuery = encodeURIComponent(query);
        while (true) {
            const url = pagina === 1
                ? `https://www.todamateria.com.br/?s=${encodedQuery}`
                : `https://www.todamateria.com.br/page/${pagina}/?s=${encodedQuery}`;
            const { data: html } = yield axios_1.default.get(url);
            const $ = (0, cheerio_1.load)(typeof html === 'string' ? html : String(html));
            let encontrou = false;
            $('a.card-item').each((_, el) => {
                let href = $(el).attr('href');
                const titulo = $(el).find('.card-title').text().trim() || $(el).attr('title') || '';
                if (href && href.startsWith('/')) {
                    href = 'https://www.todamateria.com.br' + href;
                }
                if (href &&
                    titulo.length > 0 &&
                    !urlsSet.has(href)) {
                    resultados.push({ titulo, url: href });
                    urlsSet.add(href);
                    encontrou = true;
                }
            });
            if (!todasPaginas || !encontrou)
                break;
            pagina++;
        }
        return resultados;
    });
}
function rasparConteudoPagina(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data: html } = yield axios_1.default.get(url);
            const $ = (0, cheerio_1.load)(typeof html === 'string' ? html : String(html));
            // Tenta pegar o título principal e o conteúdo principal do artigo
            const titulo = $('h1').first().text().trim();
            // Pega todos os parágrafos do conteúdo principal, ignorando anúncios e rodapés
            const paragrafos = [];
            const linksSet = new Set();
            // Coleta todas as imagens e legendas do HTML (não só do conteúdo principal)
            const imagens = [];
            // Captura <figure> em todo o HTML
            $('figure').each((_, fig) => {
                const img = $(fig).find('img').first();
                let src = img.attr('src') || '';
                if (src && src.startsWith('/'))
                    src = 'https://www.todamateria.com.br' + src;
                const legenda = $(fig).find('figcaption').text().trim();
                if (src)
                    imagens.push({ src, legenda });
            });
            // Também pega imagens soltas (fora de <figure>) dentro do conteúdo principal
            $('.main-content article img, .main-content .content img, article .content img, article img').each((_, img) => {
                let src = $(img).attr('src') || '';
                if (src && src.startsWith('/'))
                    src = 'https://www.todamateria.com.br' + src;
                // Só adiciona se ainda não está no array
                if (src && !imagens.some(im => im.src === src)) {
                    imagens.push({ src, legenda: '' });
                }
            });
            // Seleciona apenas parágrafos dentro do conteúdo principal
            $('.main-content article p, .main-content .content p, article .content p, article p').each((_, el) => {
                const txt = $(el).text().trim();
                if (txt.length > 0)
                    paragrafos.push(txt);
                // Extrai links deste parágrafo
                $(el)
                    .find('a[href]')
                    .each((_, a) => {
                    let href = $(a).attr('href');
                    if (href) {
                        if (href.startsWith('/'))
                            href = 'https://www.todamateria.com.br' + href;
                        if (/^https?:\/\//.test(href))
                            linksSet.add(href);
                    }
                });
            });
            // Se não encontrou nada, tenta pegar todos os <p> exceto os que estão em .sidebar, .footer, .ad-unit
            if (paragrafos.length === 0) {
                $('p').each((_, el) => {
                    if ($(el).parents('.sidebar, .footer, .ad-unit').length === 0 &&
                        $(el).text().trim().length > 0) {
                        paragrafos.push($(el).text().trim());
                        // Extrai links deste parágrafo
                        $(el)
                            .find('a[href]')
                            .each((_, a) => {
                            let href = $(a).attr('href');
                            if (href) {
                                if (href.startsWith('/'))
                                    href = 'https://www.todamateria.com.br' + href;
                                if (/^https?:\/\//.test(href))
                                    linksSet.add(href);
                            }
                        });
                    }
                });
            }
            // Raspa a imagem principal do conteúdo (mantém campo antigo para compatibilidade)
            let imagem = '';
            if (imagens.length > 0) {
                imagem = imagens[0].src;
            }
            else {
                const imgEl = $('.main-content article img, .main-content .content img, article .content img, article img').first();
                if (imgEl && typeof imgEl.attr('src') === 'string') {
                    imagem = imgEl.attr('src') || '';
                    if (imagem && imagem.startsWith('/')) {
                        imagem = 'https://www.todamateria.com.br' + imagem;
                    }
                }
            }
            // Extrai o nome do autor (visível)
            let autor = $('.author-article--b__info__name').first().text().trim() ||
                $('.autor, .author, .author-name').first().text().trim() ||
                '';
            // Se não encontrou, tenta no JSON-LD
            if (!autor) {
                $('script[type="application/ld+json"]').each((_, el) => {
                    var _a;
                    try {
                        const json = JSON.parse($(el).html() || '{}');
                        if (json && typeof json === 'object') {
                            if (json.author && typeof json.author === 'object') {
                                if (typeof json.author.name === 'string')
                                    autor = json.author.name;
                                else if (Array.isArray(json.author) && ((_a = json.author[0]) === null || _a === void 0 ? void 0 : _a.name))
                                    autor = json.author[0].name;
                            }
                            else if (json.name && typeof json.name === 'string') {
                                autor = json.name;
                            }
                        }
                    }
                    catch (_b) { }
                });
            }
            // Extrai citação, se existir
            let citacao = '';
            const citeCopy = $('#cite-copy .citation');
            if (citeCopy.length > 0) {
                citacao = citeCopy.text().trim();
            }
            citacao = `${citacao} ${dataFormatada}`;
            return {
                url,
                titulo,
                conteudo: paragrafos.join('\n\n'),
                imagens,
                autor,
                citacao
            };
        }
        catch (e) {
            return { url, titulo: '', conteudo: '', imagens: [], autor: '', citacao: '', erro: true };
        }
    });
}
