// Tipos globais para uso em flows e utils

export interface ImagemConteudo {
  src: string;
  legenda?: string;
}

export interface FichaLeitura {
  url: string;
  titulo: string;
  autor?: string;
  anoPublicacao?: string;
  palavrasChave?: string[];
  resumo: string;
  citacoesRelevantes?: string[];
  comentariosAdicionais?: string;
}
