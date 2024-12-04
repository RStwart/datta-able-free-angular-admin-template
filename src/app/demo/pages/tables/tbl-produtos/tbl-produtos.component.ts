import { Component, OnInit } from '@angular/core';
import { ProdutoService } from 'src/app/services/produto.service';
import { Produto } from 'src/app/interfaces/produto.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tbl-produtos',
  templateUrl: './tbl-produtos.component.html',
  styleUrls: ['./tbl-produtos.component.scss'],
})

export class TblProdutosComponent implements OnInit {
  produtos: Produto[] = [];
  erro: string | null = null;

  // Propriedades para controle do formulário de adicionar produto
  novoProduto: Produto = {
    id_produto: 0,
    nome: '',
    descricao: '',
    preco: 0,
    quantidade_estoque: 0,
  };

  mostrarFormulario = false;

  currentPage: number = 1; // Página atual
  itemsPerPage: number = 5; // Itens por página
  totalPages: number = 0; // Total de páginas
  produtosPaginados: Produto[] = []; // Lista de itens da página atual
  pages: number[] = []; // Array com os números de páginas

  // Produto em edição
  produtoEmEdicao: Produto | null = null;

  constructor(private ProdutoService: ProdutoService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.carregarProdutos(); // Carregar produtos ao iniciar o componente
  }

  // Alternar exibição do formulário de adicionar
  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.resetarNovoProduto();
    }
  }

  // Resetar valores do novo produto
  resetarNovoProduto(): void {
    this.novoProduto = {
      id_produto: 0,
      nome: '',
      descricao: '',
      preco: 0,
      quantidade_estoque: 0,
    };
  }

  // Carregar lista de produtos (sem paginação no backend)
  carregarProdutos(): void {
    this.ProdutoService.getProdutos().subscribe(
      (response: Produto[]) => {
        this.produtos = response; // Atribui todos os produtos
        this.atualizarPaginacao(); // Atualiza a paginação
        this.toastr.success('Produtos carregados com sucesso!', 'Sucesso');
      },
      (error) => {
        this.erro = 'Erro ao carregar produtos';
        console.error('Erro ao carregar produtos:', error);
        this.toastr.error('Erro ao carregar produtos', 'Erro');
      }
    );
  }

  // Atualizar os dados de paginação
  atualizarPaginacao(): void {
    // Calcular o número total de páginas
    this.totalPages = Math.ceil(this.produtos.length / this.itemsPerPage);
    // Criar um array com os números das páginas
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    // Pegar os produtos da página atual
    this.produtosPaginados = this.produtos.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  // Alterar a página
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return; // Garantir que a página esteja no intervalo válido
    this.currentPage = page;
    this.atualizarPaginacao(); // Atualizar os produtos para a página escolhida
  }

  // Adicionar novo produto
  adicionarProduto(): void {
    this.ProdutoService.addProduto(this.novoProduto).subscribe(
      () => {
        this.carregarProdutos(); // Recarregar produtos após adição
        this.toastr.success('Produto adicionado com sucesso!', 'Sucesso');
        this.toggleFormulario(); // Fechar o formulário
      },
      (error) => {
        this.erro = 'Erro ao adicionar produto';
        console.error('Erro ao adicionar produto:', error);
        this.toastr.error('Erro ao adicionar produto', 'Erro');
      }
    );
  }

  // Deletar produto
  deletarProduto(id: number): void {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.ProdutoService.deleteProduto(id.toString()).subscribe(
        () => {
          this.produtos = this.produtos.filter((produto) => produto.id_produto !== id);
          this.atualizarPaginacao(); // Recalcular a paginação após exclusão
          this.toastr.success('Produto deletado com sucesso!', 'Sucesso');
        },
        (error) => {
          console.error('Erro ao deletar produto:', error);
          this.toastr.error('Erro ao deletar produto', 'Erro');
        }
      );
    }
  }

  // Iniciar edição do produto
  editarProduto(produto: Produto): void {
    this.produtoEmEdicao = { ...produto }; // Cria uma cópia do produto a ser editado
  }

  // Salvar alterações no produto
  salvarEdicao(): void {
    if (this.produtoEmEdicao) {
      this.ProdutoService.updateProduto(this.produtoEmEdicao.id_produto.toString(), this.produtoEmEdicao).subscribe(
        () => {
          this.carregarProdutos(); // Recarregar produtos após edição
          this.produtoEmEdicao = null; // Finaliza o modo de edição
          this.toastr.success('Alteração realizada com sucesso!', 'Sucesso');
        },
        (error) => {
          this.toastr.error('Erro na atualização do produto', 'Erro');
          console.error('Erro ao atualizar produto:', error);
        }
      );
    }
  }

  // Cancelar edição
  cancelarEdicao(): void {
    this.produtoEmEdicao = null; // Reseta o modo de edição
  }
}
