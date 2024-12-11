import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from 'src/app/theme/shared/components/card/card.component';  // Importar o CardComponent diretamente

import { VendasRoutingModule } from './vendas-routing.module';
import { PdvVendasComponent } from './pdv-vendas/pdv-vendas.component';

@NgModule({
  declarations: [
    PdvVendasComponent,     // Declare o componente PdvVendasComponent
  ],
  imports: [
    CommonModule,           // Necessário para usar pipes como currency
    VendasRoutingModule,    // Roteamento, se necessário
    FormsModule,            // Para formularios
    CardComponent           // Importe o CardComponent diretamente aqui (não declare)
  ]
})
export class VendasModule {}
