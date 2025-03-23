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

  totalDinheiro: number = 0;
  totalCartao: number = 0;
  totalCartaoCredito: number = 0;
  totalCartaoDebito: number = 0;
  totalPix: number = 0;


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


  salvarVenda() {
    // Verifica e ajusta o formato da data (YYYY-MM-DD) antes de enviar
    if (this.vendaSelecionada && this.vendaSelecionada.data_venda) {
      // Ajusta a data para o formato correto
      this.vendaSelecionada.data_venda = new Date(this.vendaSelecionada.data_venda).toISOString().split('T')[0];
    }

    this.vendaSelecionada.status_venda = 'FINALIZADA';
  
    // Atualiza a venda via serviço
    this.vendasService.updateVenda(this.vendaSelecionada).subscribe(
      (response) => {
        console.log('Venda atualizada com sucesso:', response);
        // Fechar modal ou realizar outras ações necessárias após sucesso
        this.fecharModalVendas();
      },
      (error) => {
        console.error('Erro ao atualizar a venda:', error);
        // Aqui você pode adicionar um tratamento mais específico se necessário
      }
    );
  }
  


  calcularTotalGanhos(): void {
    this.totalGanhos = this.vendas
      .map(venda => Number(venda.total) || 0)
      .reduce((soma, total) => soma + total, 0);
  
    // Totalização por tipo de pagamento
    this.totalDinheiro = this.vendas
      .filter(venda => venda.tipo_pagamento === 'DINHEIRO')
      .reduce((soma, venda) => soma + (Number(venda.total) || 0), 0);
  
    this.totalPix = this.vendas
      .filter(venda => venda.tipo_pagamento === 'PIX')
      .reduce((soma, venda) => soma + (Number(venda.total) || 0), 0);
  
    // Separação de cartão em crédito e débito
    this.totalCartaoCredito = this.vendas
      .filter(venda => venda.tipo_pagamento === 'CARTAO' && venda.card_type === 'Credito')
      .reduce((soma, venda) => soma + (Number(venda.total) || 0), 0);
  
    this.totalCartaoDebito = this.vendas
      .filter(venda => venda.tipo_pagamento === 'CARTAO' && venda.card_type === 'Debito')
      .reduce((soma, venda) => soma + (Number(venda.total) || 0), 0);
  
    // Soma total dos cartões (crédito + débito)
    this.totalCartao = this.totalCartaoCredito + this.totalCartaoDebito;
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
