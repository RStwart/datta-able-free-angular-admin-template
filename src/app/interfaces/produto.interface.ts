export interface Produto {
  id_produto: number;          // ID do produto
  nome: string;                // Nome do produto
  descricao: string;           // Descrição do produto
  preco: number;               // Preço do produto
  quantidade_estoque: number;  // Quantidade em estoque
  imagem: File | null;         // Adiciona a propriedade imagem
  imagemUrl?: string;          // Adicionando a propriedade imagemUrl
}
