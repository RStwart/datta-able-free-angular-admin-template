import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'produtos',
        loadComponent: () => import('./tbl-produtos/tbl-produtos.component').then(m => m.TblProdutosComponent)
      },
      {
        path: 'funcionarios',
        loadComponent: () => import('./tbl-funcionarios/tbl-funcionarios.component').then(m => m.TblFuncionariosComponent)
      }
    ],
    
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TablesRoutingModule {}


