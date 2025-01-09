import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Venda {
  id_venda?: number; // Código único da venda, opcional ao criar
  valor: number; // Valor total da venda
  metodo_pagamento: string; // Método de pagamento
  horario: string; // Horário da venda (formato HH:mm:ss)
  dia: string; // Data da venda (formato yyyy-MM-dd)
  funcionario?: string; // Nome ou identificador do funcionário
  status?: 'pendente' | 'concluida' | 'cancelada'; // Status da venda
}

@Injectable({
  providedIn: 'root',
})
export class VendasService {
  private apiUrl = 'http://localhost:5000/api/vendas'; // URL base da API para vendas

  constructor(private http: HttpClient) {}

  /**
   * Registrar uma nova venda.
   * @param venda Objeto com os dados da venda.
   * @returns Observable com mensagem de sucesso e ID da venda criada.
   */
  registrarVenda(venda: Venda): Observable<{ message: string; id_venda: number }> {
    return this.http.post<{ message: string; id_venda: number }>(this.apiUrl, venda);
  }

  /**
   * Listar todas as vendas registradas.
   * @returns Observable com a lista de vendas.
   */
  listarVendas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(this.apiUrl);
  }

  /**
   * Obter detalhes de uma venda específica.
   * @param id_venda ID da venda a ser buscada.
   * @returns Observable com os detalhes da venda.
   */
  obterVenda(id_venda: number): Observable<Venda> {
    return this.http.get<Venda>(`${this.apiUrl}/${id_venda}`);
  }

  /**
   * Atualizar os dados de uma venda.
   * @param id_venda ID da venda a ser atualizada.
   * @param venda Objeto com os novos dados da venda.
   * @returns Observable com a mensagem de sucesso.
   */
  atualizarVenda(id_venda: number, venda: Venda): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id_venda}`, venda);
  }

  /**
   * Cancelar uma venda (atualizando o status para 'cancelada').
   * @param id_venda ID da venda a ser cancelada.
   * @returns Observable com a mensagem de sucesso.
   */
  cancelarVenda(id_venda: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id_venda}`, {
      status: 'cancelada',
    });
  }

  /**
   * Deletar uma venda do banco de dados.
   * @param id_venda ID da venda a ser deletada.
   * @returns Observable com a mensagem de sucesso.
   */
  deletarVenda(id_venda: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id_venda}`);
  }
}
