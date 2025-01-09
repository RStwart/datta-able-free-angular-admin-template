import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProdutoService } from 'src/app/services/produto.service';
import { Produto } from 'src/app/interfaces/produto.interface';
import { VendasService, Venda } from 'src/app/services/vendas.service';
import { ToastrService } from 'ngx-toastr';

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

@Component({
  selector: 'app-pdv-vendas',
  templateUrl: './pdv-vendas.component.html',
  styleUrls: ['./pdv-vendas.component.scss'],
})

export class PdvVendasComponent implements OnInit {
  
  produtos: Produto[] = []; // Todos os produtos
  produtosFiltrados: Produto[] = []; // Produtos após o filtro
  filtro: string = ''; // Termo de busca
  carrinho: ItemCarrinho[] = []; // Carrinho de compras
  metodoPagamento: string = ''; // Método de pagamento escolhido
  valorPago: number = 0; // Valor pago pelo cliente
  valorTotal: number = 0; // Valor total da compra
  

  constructor(
    private produtoService: ProdutoService,
    private vendasService: VendasService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef  // Injetando ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  // Carregar produtos do serviço
  carregarProdutos(): void {
    this.produtoService.getProdutos().subscribe(
      (response: Produto[]) => {
        this.produtos = response; // Armazena todos os produtos
        this.produtosFiltrados = [...this.produtos]; // Exibe todos inicialmente
        this.toastr.success('Produtos carregados com sucesso!', 'Sucesso');
      },
      (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.toastr.error('Erro ao carregar produtos', 'Erro');
      }
    );
  }

  // Atualizar lista de produtos com base no filtro
  atualizarFiltro(): void {
    const termo = this.filtro.trim().toLowerCase();

    this.produtosFiltrados = this.produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(termo) || produto.id_produto.toString().includes(termo)
    );
  }

  // Adicionar produto ao carrinho
  adicionarAoCarrinho(produto: Produto): void {
    const item = this.carrinho.find((item) => item.produto.id_produto === produto.id_produto);
    if (item) {
      // Se o produto já estiver no carrinho, incrementa a quantidade
      item.quantidade++;
    } else {
      // Caso contrário, adiciona o produto com quantidade inicial 1
      this.carrinho.push({ produto, quantidade: 1 });
    }
    this.toastr.success(`${produto.nome} adicionado ao carrinho!`, 'Sucesso');

    // Atualizar o total após adicionar ao carrinho
    this.atualizarTotal();
  }

  // Remover item do carrinho
  removerDoCarrinho(produtoId: number): void {
    this.carrinho = this.carrinho.filter((item) => item.produto.id_produto !== produtoId);
    this.toastr.info('Produto removido do carrinho.', 'Informação');

    // Atualizar o total após remover do carrinho
    this.atualizarTotal();
  }

  // Calcular o total do carrinho
  calcularTotal(): number {
    return this.carrinho.reduce((total, item) => total + item.produto.preco * item.quantidade, 0);
  }

  // Atualizar o valor total formatado para o placeholder
  atualizarTotal(): void {

    this.valorTotal = this.calcularTotal();
    this.valorPago = this.valorTotal
    console.log(this.valorTotal)


  }

  // Incrementar quantidade de um item no carrinho
  incrementarQuantidade(produtoId: number): void {
    const item = this.carrinho.find((item) => item.produto.id_produto === produtoId);
    if (item) {
      item.quantidade++;
      this.atualizarTotal(); // Atualiza o total após incrementar
    }
  }

  // Decrementar quantidade de um item no carrinho
  decrementarQuantidade(produtoId: number): void {
    const item = this.carrinho.find((item) => item.produto.id_produto === produtoId);
    if (item && item.quantidade > 1) {
      item.quantidade--;
    } else if (item) {
      this.removerDoCarrinho(produtoId); // Remove o item do carrinho se a quantidade chegar a 0
    }
    this.atualizarTotal(); // Atualiza o total após decrementar
  }

  // Limpar carrinho
  limparCarrinho(): void {
    this.carrinho = [];
    this.toastr.warning('Carrinho esvaziado.', 'Aviso');

    // Atualizar o total após limpar o carrinho
    this.atualizarTotal();
  }

  // Finalizar compra e registrar a venda
  finalizarCompra(): void {
    if (!this.metodoPagamento) {
      this.toastr.error('Escolha um método de pagamento antes de finalizar a compra.', 'Erro');
      return;
    }

    if (this.carrinho.length === 0) {
      this.toastr.error('Adicione itens ao carrinho antes de finalizar a compra.', 'Erro');
      return;
    }

    const totalCompra = this.calcularTotal();
    if (this.valorPago < totalCompra) {
      this.toastr.error('Valor pago é insuficiente para finalizar a compra.', 'Erro');
      return;
    }

    const venda: Venda = {
      valor: totalCompra,
      metodo_pagamento: this.metodoPagamento,
      horario: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
      dia: new Date().toISOString().split('T')[0],
      funcionario: 'Funcionario Exemplo', // Substituir pelo funcionário real
      status: 'pendente',
    };

    this.vendasService.registrarVenda(venda).subscribe(
      (response) => {
        this.toastr.success('Venda registrada com sucesso!', 'Sucesso');
        this.limparCarrinho();
        this.metodoPagamento = '';
        this.valorPago = 0; // Limpar valor pago após finalizar a compra
      },
      (error) => {
        console.error('Erro ao registrar venda:', error);
        this.toastr.error('Erro ao registrar venda.', 'Erro');
      }
    );
  }
}
