export interface Venda {
    id_venda: number;        // ID da venda (auto-incremento)
    id_mesa: number;         // ID da mesa relacionada à venda
    numero_mesa: number;     // Número da mesa
    total: number;           // Total da venda
    data_venda: string;      // Data e hora da venda (formato datetime)
    nota: string;            // Número da nota
    status_venda: string;    // Status da venda ('Pendente' por padrão)
    tipo_pagamento: 'CARTAO' | 'DINHEIRO' | 'PIX'; // Tipo de pagamento
    movimento: 'entrada' | 'saida' | null; // Movimento financeiro, pode ser null
  }
  