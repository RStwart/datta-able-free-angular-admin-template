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
  pedidosComProdutos: PedidoComProdutos[] = [];
  pedidosPaginados: PedidoComProdutos[] = [];
  erro: string | null = null;
  
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  pages: number[] = [];

  constructor(private pedidoService: PedidoService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.carregarPedidos();
  }

  
  carregarPedidos() {
    this.pedidoService.getPedidos().subscribe(
      (pedidos) => {
        console.log('Pedidos recebidos:', pedidos);
    
        if (pedidos && pedidos.length > 0) {
          // Mapeando os pedidos para incluir a lista de produtos de forma organizada
          this.pedidosComProdutos = pedidos.map((pedido: Pedido) => {
            try {
              const produtosString = pedido.item;  // String com os produtos
              if (produtosString && typeof produtosString === 'string') {
                console.log('Entrou aqui');
  
                // Converte a string de produtos em um array de objetos de produtos
                const produtos = produtosString.split(';').map((produtoStr: string) => {
                  console.log('PRODUTOS:', produtoStr);
  
                  // Remove qualquer espaço extra usando trim()
                  const [id, nome, quantidade, preco] = produtoStr.split('|').map((campo) => campo.trim());
  
                  // Log para verificar se os valores estão sendo extraídos corretamente
                  console.log('ID:', id, 'Nome:', nome, 'Quantidade:', quantidade, 'Preço:', preco);
  
                  // Verifica se a quantidade e o preço são válidos
                  const quantidadeValida = !isNaN(parseInt(quantidade, 10)) ? parseInt(quantidade, 10) : 0;
                  const precoValido = !isNaN(parseFloat(preco)) ? parseFloat(preco) : 0;
  
                  return {
                    id: id || 'ID desconhecido',  // ID do produto (adicionado)
                    nome: nome || 'Produto desconhecido',  // Nome do produto
                    quantidade: quantidadeValida,
                    preco: precoValido,
                  };
                });
  
                // Atribui os produtos ao pedido
                (pedido as PedidoComProdutos).produtos = produtos;
              } else {
                (pedido as PedidoComProdutos).produtos = [];  // Se não houver produtos válidos
              }
            } catch (e) {
              console.error('Erro ao converter pedido.item:', e);
              (pedido as PedidoComProdutos).produtos = [];
            }
    
            return pedido as PedidoComProdutos;  // Retorna o pedido com a lista de produtos
          });
    
          // Atualiza a paginação após carregar os pedidos
          this.atualizarPaginacao();
          console.log('Pedidos com produtos:', this.pedidosComProdutos);
        } else {
          console.log('Nenhum pedido encontrado!');
        }
      },
      (error) => {
        console.error('Erro ao carregar pedidos:', error);
        this.erro = 'Erro ao carregar pedidos';
        this.toastr.error('Erro ao carregar pedidos', 'Erro');
      }
    );
  }
  
  



  atualizarPaginacao(): void {
    this.totalPages = Math.ceil(this.pedidosComProdutos.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.pedidosPaginados = this.pedidosComProdutos.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
    console.log('Pedidos paginados:', this.pedidosPaginados);
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
        this.toastr.info('Status do pedido não alterado.', 'Info');
      }
    } else {
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
