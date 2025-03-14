export interface Produto {
  id_produto: number;      // ID único do produto
  nome: string;            // Nome do produto
  descricao: string;       // Descrição do produto
  preco: number;           // Preço do produto
  quantidade: number;      // Quantidade do produto no pedido
}

export interface Pedido {
  id_pedido: number;           // ID único do pedido
  id_mesa: number;             // ID da mesa a qual o pedido pertence
  data: string;                // Data e hora do pedido
  status: 'Solicitado' | 'Em preparo' | 'Finalizado';  // Status do pedido (pode ser 'Solicitado', 'Em preparo' ou 'Finalizado')
  total: number;               // Total do pedido (soma dos itens)
  item: string;                // Propriedade que armazena a string JSON com os produtos
  observacao: string;                // Propriedade que armazena a string JSON com os produtos
}
