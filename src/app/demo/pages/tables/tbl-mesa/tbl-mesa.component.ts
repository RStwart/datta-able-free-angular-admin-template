import { Component, OnInit } from '@angular/core';
import { MesaService } from 'src/app/services/mesa.service';
import { ProdutoService } from 'src/app/services/produto.service';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { Produto } from 'src/app/interfaces/produto.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tbl-mesas',
  templateUrl: './tbl-mesa.component.html',
  styleUrls: ['./tbl-mesa.component.scss'],
})
export class TblMesasComponent implements OnInit {
  mesas: Mesa[] = [];
  produtos: Produto[] = [];
  mostrarModal: boolean = false;
  mesaSelecionada: Mesa | null = null;
  erro: string | null = null;
  filtroProduto: string = '';

  novaMesa: Mesa = {
    id_mesa: 0,
    numero: 0,
    status: 'Solicitado',
    capacidade: 0,
    pedidos: [],
    totalConsumo: 0
  };

  mostrarFormulario = false; // Controle de exibição do formulário de adicionar mesa
  
  mesaEmEdicao: Mesa | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  mesasPaginadas: Mesa[] = [];
  pages: number[] = [];

  constructor(
    private mesaService: MesaService,
    private produtoService: ProdutoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.carregarMesas();
    this.carregarProdutos();
  }

  calcularTotalPedido(): number {
    if (!this.mesaSelecionada?.pedidos || !Array.isArray(this.mesaSelecionada.pedidos)) {
      return 0; // Se não houver pedidos ou se não for um array, retorna 0
    }
  
    let total = 0;
    this.mesaSelecionada.pedidos.forEach(pedido => {
      total += pedido.preco * pedido.quantidade;
    });
  
    return total;
  }

  // Toggle para exibir/ocultar o formulário de adicionar mesa
  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.limparFormulario(); // Limpa o formulário quando for fechado
    }
  }

  // Limpa os campos do formulário quando fechado
  limparFormulario(): void {
    this.novaMesa = {
      id_mesa: 0,
      numero: 0,
      status: 'Solicitado',
      capacidade: 0,
      pedidos: [],
      totalConsumo: 0
    };
  }

  carregarProdutos(): void {
    this.produtoService.getProdutos().subscribe(
      (produtos: Produto[]) => {
        this.produtos = produtos;
        console.log('Produtos carregados:', this.produtos);
      },
      (error) => {
        console.error('Erro ao carregar produtos', error);
        this.toastr.error('Erro ao carregar produtos', 'Erro');
      }
    );
  }

  abrirModalAdicionarPedido(mesa: Mesa): void {
    this.mesaSelecionada = { ...mesa }; // Faz uma cópia da mesa
    
    // Garantir que pedidos seja sempre um array
    if (!this.mesaSelecionada.pedidos) {
      this.mesaSelecionada.pedidos = [];
    }
    
    console.log('Mesa Selecionada:', this.mesaSelecionada); // Verifique a mesa selecionada
    this.mostrarModal = true;
  }
  

  fecharModal(): void {
    this.mostrarModal = false;
    this.mesaSelecionada = null;
    this.filtroProduto = ''; // Reseta a pesquisa ao fechar o modal
  }

  // Método para filtrar os produtos com base no texto do filtro
  get produtosFiltrados(): Produto[] {
    if (!this.filtroProduto.trim()) {
      return this.produtos;
    }
    return this.produtos.filter(produto =>
      produto.nome.toLowerCase().includes(this.filtroProduto.toLowerCase())
    );
  }

  adicionarProdutoAPedido(produto: Produto): void {
    if (this.mesaSelecionada) {
      if (!Array.isArray(this.mesaSelecionada.pedidos)) {
        this.mesaSelecionada.pedidos = [];
      }
  
      const produtoExistente = this.mesaSelecionada.pedidos.find(pedido => pedido.id_produto === produto.id_produto);
      
      if (!produtoExistente) {
        const novoPedido = {
          id_produto: produto.id_produto,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: 1 // Inicializa a quantidade como 1
        };
        this.mesaSelecionada.pedidos.push(novoPedido);
        this.toastr.success('Produto adicionado ao pedido!', 'Sucesso');
      } else {
        this.toastr.warning('Produto já foi adicionado ao pedido!', 'Aviso');
      }
    }
  }

  // Funções para manipulação da quantidade
  incrementarQuantidade(idProduto: number): void {
    if (this.mesaSelecionada) {
      const item = this.mesaSelecionada.pedidos.find(pedido => pedido.id_produto === idProduto);
      if (item) {
        item.quantidade += 1;  // Incrementa a quantidade
      }
    }
  }

  decrementarQuantidade(idProduto: number): void {
    if (this.mesaSelecionada) {
      const item = this.mesaSelecionada.pedidos.find(pedido => pedido.id_produto === idProduto);
      if (item && item.quantidade > 1) {
        item.quantidade -= 1;  // Decrementa a quantidade, mas não permite ser menor que 1
      }
    }
  }

  removerProdutoDoPedido(index: number): void {
    if (this.mesaSelecionada) {
      this.mesaSelecionada.pedidos.splice(index, 1);
      this.toastr.info('Produto removido do pedido.', 'Removido');
    }
  }

  finalizarPedido(): void {
    if (this.mesaSelecionada) {
      this.toastr.success('Pedido finalizado com sucesso!', 'Sucesso');
      this.fecharModal();
    }
  }

  carregarMesas(): void {
    this.mesaService.getMesas().subscribe(
      (response: Mesa[]) => {
        this.mesas = response;
        this.atualizarPaginacao();
        this.toastr.success('Mesas carregadas com sucesso!', 'Sucesso');
      },
      (error) => {
        this.erro = 'Erro ao carregar mesas';
        console.error('Erro ao carregar mesas:', error);
        this.toastr.error('Erro ao carregar mesas', 'Erro');
      }
    );
  }

  atualizarPaginacao(): void {
    this.totalPages = Math.ceil(this.mesas.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.mesasPaginadas = this.mesas.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.atualizarPaginacao();
  }

  excluirMesa(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta mesa?')) {
      this.mesaService.deleteMesa(id.toString()).subscribe(
        () => {
          this.mesas = this.mesas.filter((mesa) => mesa.id_mesa !== id);
          this.atualizarPaginacao();
          this.toastr.success('Mesa deletada com sucesso!', 'Sucesso');
        },
        (error) => {
          console.error('Erro ao deletar mesa:', error);
          this.toastr.error('Erro ao deletar mesa', 'Erro');
        }
      );
    }
  }

  editarMesa(mesa: Mesa): void {
    this.mesaEmEdicao = { ...mesa };
    this.mostrarFormulario = true;
  }

  adicionarMesa(): void {
    if (this.novaMesa.numero && this.novaMesa.capacidade) {
      this.mesaService.addMesa(this.novaMesa).subscribe(
        (response) => {
          this.mesas.push(response); // Adiciona a nova mesa à lista
          this.atualizarPaginacao();
          this.toastr.success('Mesa adicionada com sucesso!', 'Sucesso');
          this.toggleFormulario(); // Fecha o formulário após adicionar
        },
        (error) => {
          this.toastr.error('Erro ao adicionar mesa', 'Erro');
          console.error('Erro ao adicionar mesa:', error);
        }
      );
    } else {
      this.toastr.warning('Por favor, preencha todos os campos.', 'Aviso');
    }
  }
}
