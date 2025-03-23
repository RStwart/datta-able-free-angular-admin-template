import { Component, OnInit } from '@angular/core';
import { VendasService } from '../../services/vendas.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Venda } from '../../interfaces/vendas.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule],
  providers: [VendasService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export default class DashboardComponent implements OnInit {

  vendas: Venda[] = []; // Array para armazenar as vendas
  totalGanhos: number = 0; // Total de ganhos
  mostrarModalVendas: boolean = false; // Controla a visibilidade do modal
  vendaSelecionada: Venda | null = null; // Variável para armazenar a venda selecionada no modal

  constructor(private vendasService: VendasService) {}

  ngOnInit(): void {
    this.getVendas();
  }

  // Método para obter as vendas
  getVendas(): void {
    this.vendasService.getVendas().subscribe((dados) => {
      this.vendas = dados; // Atribui as vendas obtidas ao array vendas
      console.log('VENDAS', this.vendas);
      this.calcularTotalGanhos(); // Calcula o total dos ganhos
    });
  }

  // Método para calcular o total de ganhos
  calcularTotalGanhos(): void {
    this.totalGanhos = this.vendas
      .map(venda => Number(venda.total) || 0) // Garante que os valores sejam numéricos
      .reduce((soma, total) => soma + total, 0);
  }

  
  // Método para selecionar uma venda para exibir no modal
  abrirModalDetalhes(venda: Venda): void {
    this.vendaSelecionada = { ...venda };  // Faz uma cópia da venda
    console.log('Detalhes da Venda Selecionada:', this.vendaSelecionada);  // Exibe no console para verificação

    this.mostrarModalVendas = true;  // Exibe o modal de detalhes
    
  }

  // Método para fechar o modal
  fecharModalVendas(): void {
    this.vendaSelecionada = null;  // Limpa a venda selecionada
    this.mostrarModalVendas = false; // Fecha o modal
    console.log('Modal fechado!');
  }
  

}
