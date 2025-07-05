import { rasparTodasPaginasBusca, rasparConteudoPagina } from '../tools/scraping';
import { criarFichaLeitura, FichaLeitura } from '../tools/ai/fichaAgent';
import { writeFileSync, mkdirSync } from 'node:fs';
import { Message } from 'whatsapp-web.js';
import path from 'path';
 
async function fichador(termoBusca: string, todasPaginas: boolean, salvar: boolean = true, message: Message, promptCustomizado?: string) {

    console.log(`🔍 Buscando artigos para: ${termoBusca} (${todasPaginas ? 'todas as páginas' : 'apenas a primeira página'})`);
     
    let resultados = [];
    try {
        resultados = await rasparTodasPaginasBusca(termoBusca, todasPaginas);
    } catch (erro) {
        console.error('❌ Erro ao buscar links:', erro);
        return [];
    }
    console.log(`🔗 ${resultados.length} links encontrados. Raspando conteúdos...`);
    message.reply(`🔗 ${resultados.length} links encontrados. Raspando conteúdos...`);
    const fichas: FichaLeitura[] = [];
    for (const { url } of resultados) {
        try {
            const conteudo = await rasparConteudoPagina(url);
            
            const ficha = await criarFichaLeitura(conteudo, promptCustomizado);
            fichas.push(ficha);
            message.reply(`✅ Encontrei na internet artigo entitulado *${ficha.titulo}*.`);
            message.reply(`📝Raspando o conteúdo do artigo...`);

            console.log(`✅ Ficha criada para: ${ficha.titulo}`);
        } catch (erro) {
            console.error(`❌ Erro ao processar ${url}:`, erro);
            message.reply(`❌ Erro ao processar o resumo`);
        }
    }
    if (salvar) {
        mkdirSync('dados', { recursive: true });
        writeFileSync(path.join('dados', `fichas-leitura-${termoBusca}.json`), JSON.stringify(fichas, null, 2), 'utf-8');
        console.log('💾 Fichas salvas em arquivo!');
    }
    console.log('✅ Todas as fichas geradas!');
    message.reply(`✅ resumo concluido com sucesso. ${fichas.length} fichas de leitura geradas com sucesso!`);
    return fichas;
}

export { fichador };
