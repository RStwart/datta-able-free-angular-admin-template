import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private apiUrl = 'http://localhost:5000/api'; // Defina a URL base da sua API

  constructor(private http: HttpClient) {}

  // Método para obter todos os produtos
  getProdutos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/produtos`);
  }

  // Método para obter um produto específico
  getProdutoById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/produtos/${id}`);
  }

  // Método para adicionar um novo produto
  addProduto(produto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/produtos`, produto);
  }

  // Método para atualizar um produto existente
  updateProduto(id: string, produto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/produtos/${id}`, produto);
  }

  // Método para deletar um produto
  deleteProduto(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produtos/${id}`);
  }

  // Métodos similares podem ser criados para outros recursos, como usuários
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios`);
  }
  
  // E outros métodos conforme necessário...
}



