import { Component, OnInit } from '@angular/core';
import { PedidoService } from 'src/app/services/pedidos.service';
import { Pedido } from 'src/app/interfaces/pedidos.interface';
import { ToastrService } from 'ngx-toastr';

interface PedidoComProdutos extends Pedido {
  produtos: any[]; // Array de produtos parseados
}

@Component({
  selector: 'app-tbl-pedidos',
  templateUrl: './tbl-pedidos.component.html',
  styleUrls: ['./tbl-pedidos.component.scss'],
})
export class TblPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosComProdutos: PedidoComProdutos[] = [];  // Agora com o tipo correto
  erro: string | null = null;
  
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  pedidosPaginados: PedidoComProdutos[] = [];  // Alterado para o tipo correto
  pages: number[] = [];

  constructor(private pedidoService: PedidoService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.carregarPedidos();
  }

  carregarPedidos(): void {
    this.pedidoService.getPedidos().subscribe(
      (response: Pedido[]) => {
        this.pedidos = response;
  
        // Debugando o conteúdo de 'pedido.item'
        this.pedidosComProdutos = this.pedidos.map(pedido => {
          console.log('Pedido item:', pedido.item);  // Adicione esse log
          return {
            ...pedido,
            produtos: pedido.item ? JSON.parse(pedido.item) : []
          };
        });
  
        this.atualizarPaginacao();
        this.toastr.success('Pedidos carregados com sucesso!', 'Sucesso');
      },
      (error) => {
        this.erro = 'Erro ao carregar pedidos';
        console.error('Erro ao carregar pedidos:', error);
        this.toastr.error('Erro ao carregar pedidos', 'Erro');
      }
    );
  }
  

  atualizarPaginacao(): void {
    this.totalPages = Math.ceil(this.pedidosComProdutos.length / this.itemsPerPage); // Alterado para usar pedidosComProdutos
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.pedidosPaginados = this.pedidosComProdutos.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.atualizarPaginacao();
  }

  getStatusClass(status: string): string {
    if (status === 'Solicitado') return 'bg-warning';
    if (status === 'Em preparo') return 'bg-primary';
    if (status === 'Finalizado') return 'bg-success';
    return '';
  }

  alterarStatus(pedido: Pedido): void {
    const statusOrder: ('Solicitado' | 'Em preparo' | 'Finalizado')[] = [
      'Solicitado',
      'Em preparo',
      'Finalizado',
    ];

    const currentIndex = statusOrder.indexOf(pedido.status as any);

    // Confirmar antes de finalizar o pedido
    if (pedido.status === 'Em preparo') {
      const confirmar = confirm('Você tem certeza que deseja finalizar o pedido?');
      if (confirmar) {
        pedido.status = 'Finalizado';
        this.pedidoService.updatePedido(pedido.id_pedido.toString(), pedido).subscribe(
          () => this.toastr.success('Pedido finalizado com sucesso!', 'Sucesso'),
          (error) => {
            console.error('Erro ao finalizar pedido:', error);
            this.toastr.error('Erro ao finalizar pedido', 'Erro');
          }
        );
      } else {
        // Se o usuário clicar em "Não", mantemos o status anterior
        this.toastr.info('Status do pedido não alterado.', 'Info');
      }
    } else {
      // Caso contrário, alterna entre "Solicitado" e "Em preparo"
      pedido.status = statusOrder[(currentIndex + 1) % statusOrder.length];
      this.pedidoService.updatePedido(pedido.id_pedido.toString(), pedido).subscribe(
        () => this.toastr.success('Status atualizado!', 'Sucesso'),
        (error) => {
          console.error('Erro ao atualizar status:', error);
          this.toastr.error('Erro ao atualizar status', 'Erro');
        }
      );
    }
  }

  finalizarPedido(pedido: Pedido, event: Event): void {
    event.stopPropagation(); // Impede que o clique altere o status automaticamente

    const confirmar = confirm('Você tem certeza que deseja finalizar o pedido?');
    if (confirmar) {
      pedido.status = 'Finalizado';
      this.pedidoService.updatePedido(pedido.id_pedido.toString(), pedido).subscribe(
        () => this.toastr.success('Pedido finalizado com sucesso!', 'Sucesso'),
        (error) => {
          console.error('Erro ao finalizar pedido:', error);
          this.toastr.error('Erro ao finalizar pedido', 'Erro');
        }
      );
    } else {
      // Se o usuário clicar em "Não", mantemos o status anterior
      this.toastr.info('Status do pedido não alterado.', 'Info');
    }
  }

  cancelarPedido(pedido: Pedido, event: Event): void {
    event.stopPropagation(); // Impede a alteração do status pelo clique no card

    if (confirm('Tem certeza que deseja cancelar este pedido?')) {
      this.pedidoService.deletePedido(pedido.id_pedido.toString()).subscribe(
        () => {
          this.pedidos = this.pedidos.filter(p => p.id_pedido !== pedido.id_pedido);
          this.atualizarPaginacao();
          this.toastr.success('Pedido cancelado com sucesso!', 'Sucesso');
        },
        (error) => {
          console.error('Erro ao cancelar pedido:', error);
          this.toastr.error('Erro ao cancelar pedido', 'Erro');
        }
      );
    }
  }
}
