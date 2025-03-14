export interface Mesa {
  id_mesa: number;       // ID da mesa
  numero: number;        // Número da mesa
  capacidade: number;    // Capacidade de pessoas
  status: 'Solicitado' | 'Preparando' | 'Pronto'; // status do pedido
  pedidos?: any[];       // Lista de pedidos da mesa
  garcom?: string;       // Nome do garçom responsável
  horaAbertura?: string; // Horário de abertura da mesa
  totalConsumo: number;  // Total consumido na mesa
  totalMesa?: number;  // Adicionando a propriedade totalMesa
}
