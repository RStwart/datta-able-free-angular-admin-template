import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://service-api.hareinteract.com.br/logar-leads';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<any> {
    const url = `${this.apiUrl}?usuario=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`;

    return this.http.post(url, {}).pipe(
      tap(response => {
        localStorage.setItem('authToken', JSON.stringify(response)); // Armazena o token
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken'); // Verifica se há token armazenado
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }
}
