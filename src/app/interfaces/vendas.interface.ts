export interface Venda {
  id_venda: number;
  id_mesa: string;
  numero_mesa: string;
  total: number;
  data_venda: string;
  nota: string;
  status_venda: string;
  tipo_pagamento: "CARTAO" | "DINHEIRO" | "PIX";
  movimento: any;
}
