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

  vendas: Venda[] = []; // Adicionando a variável corretamente
  totalGanhos: number = 0; // Variável para armazenar o total dos ganhos

  constructor(private vendasService: VendasService) {}

  ngOnInit(): void {
    this.getVendas();
  }

  getVendas(): void {
    this.vendasService.getVendas().subscribe((dados) => {
      this.vendas = dados; // Agora está correto
      this.calcularTotalGanhos();
    });
  }

  calcularTotalGanhos(): void {
    this.totalGanhos = this.vendas.reduce((soma, venda) => soma + venda.total, 0);
  }

}
