import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Venda } from 'src/app/interfaces/vendas.interface';  // Importe a interface de Venda

@Injectable({
  providedIn: 'root',
})

export class VendasService {

  private apiUrl = 'http://192.168.99.100:5000/api/vendas'; // URL base da API de vendas

  constructor(private http: HttpClient) {}

  /**
   * Registrar uma nova venda.
   * @param venda Objeto com os dados da venda.
   * @returns Observable com mensagem de sucesso e ID da venda criada.
   */
  registrarVenda(venda: Venda): Observable<{ message: string; id_venda: number }> {
    return this.http.post<{ message: string; id_venda: number }>(this.apiUrl, venda)
      .pipe(catchError(this.handleError));
  }

  /**
   * Listar todas as vendas registradas.
   * @returns Observable com a lista de vendas.
   */
  listarVendas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obter detalhes de uma venda específica.
   * @param id_venda ID da venda a ser buscada.
   * @returns Observable com os detalhes da venda.
   */
  obterVenda(id_venda: number): Observable<Venda> {
    return this.http.get<Venda>(`${this.apiUrl}/${id_venda}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Atualizar os dados de uma venda.
   * @param id_venda ID da venda a ser atualizada.
   * @param venda Objeto com os novos dados da venda.
   * @returns Observable com a mensagem de sucesso.
   */
  atualizarVenda(id_venda: number, venda: Venda): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id_venda}`, venda)
      .pipe(catchError(this.handleError));
  }

  /**
   * Cancelar uma venda (atualizando o status para 'cancelada').
   * @param id_venda ID da venda a ser cancelada.
   * @returns Observable com a mensagem de sucesso.
   */
  cancelarVenda(id_venda: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id_venda}`, {
      status_venda: 'cancelada',  // Atualizando o status para "cancelada"
    })
    .pipe(catchError(this.handleError));
  }

  /**
   * Deletar uma venda do banco de dados.
   * @param id_venda ID da venda a ser deletada.
   * @returns Observable com a mensagem de sucesso.
   */
  deletarVenda(id_venda: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id_venda}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Método para tratar erros de requisição HTTP.
   * @param error Erro ocorrido durante a requisição.
   * @returns Observable com uma mensagem de erro.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Erro desconhecido!';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      errorMessage = `Código de erro: ${error.status}, Mensagem: ${error.message}`;
    }

    // Logando o erro no console
    console.error(errorMessage);

    // Retornando o erro como Observable
    return throwError(() => new Error(errorMessage));
  }
}
