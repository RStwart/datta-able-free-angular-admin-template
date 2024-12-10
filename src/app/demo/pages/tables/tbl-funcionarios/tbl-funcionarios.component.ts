import { Component, OnInit } from '@angular/core';
import { FuncionarioService } from 'src/app/services/funcionario.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tbl-funcionarios',
  templateUrl: './tbl-funcionarios.component.html',
  styleUrls: ['./tbl-funcionarios.component.scss']
})

export class TblFuncionariosComponent implements OnInit {

  funcionarios: any[] = []; // Lista completa de funcionários
  erro: string | null = null;

  funcionariosPaginados: any[] = []; // Funcionários exibidos na página atual
  novoFuncionario: any = {}; // Dados do novo funcionário
  funcionarioEmEdicao: any = null; // Funcionário sendo editado

  mostrarFormulario: boolean = false; // Controle para exibir o formulário de adição

  currentPage: number = 1; // Página atual
  itemsPerPage: number = 5; // Quantidade de itens por página
  totalPages: number = 0; // Total de páginas
  pages: number[] = []; // Array de páginas para a paginação

  constructor(private funcionarioService: FuncionarioService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.carregarFuncionarios();
  }

  // Carregar todos os funcionários
  carregarFuncionarios(): void {
    this.funcionarioService.getFuncionarios().subscribe((data) => {
      this.funcionarios = data;
      this.calcularPaginas();
      this.toastr.success('Funcionários carregados com sucesso!', 'Sucesso');
    });
  }

  // Adicionar um novo funcionário
  adicionarFuncionario(): void {
    this.funcionarioService.addFuncionario(this.novoFuncionario).subscribe(() => {
      this.carregarFuncionarios();
      this.novoFuncionario = {};
      this.mostrarFormulario = false;
    });
  }

  // Atualizar um funcionário existente
  salvarEdicao(): void {
    if (this.funcionarioEmEdicao) {
      this.funcionarioService.updateFuncionario(this.funcionarioEmEdicao.id, this.funcionarioEmEdicao).subscribe(() => {
        this.carregarFuncionarios();
        this.funcionarioEmEdicao = null;
      });
    }
  }

  // Deletar um funcionário
  deletarFuncionario(id: number): void {
    this.funcionarioService.deleteFuncionario(id.toString()).subscribe(() => {
      this.carregarFuncionarios();
    });
  }

  // Editar um funcionário
  editarFuncionario(funcionario: any): void {
    this.funcionarioEmEdicao = { ...funcionario };
  }

  // Cancelar edição
  cancelarEdicao(): void {
    this.funcionarioEmEdicao = null;
  }

  // Alternar exibição do formulário de adição
  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  // Calcular as páginas para a paginação
  calcularPaginas(): void {
    this.totalPages = Math.ceil(this.funcionarios.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.changePage(1);
  }

  // Alterar a página atual
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.funcionariosPaginados = this.funcionarios.slice(startIndex, endIndex);
  }
}
