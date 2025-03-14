import { Component, OnInit } from '@angular/core';
import { MesaService } from 'src/app/services/mesa.service';
import { ProdutoService } from 'src/app/services/produto.service';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { Produto } from 'src/app/interfaces/produto.interface';
import { ToastrService } from 'ngx-toastr';
import { Pedido } from 'src/app/interfaces/pedidos.interface';  // Importe a interface Pedido
import { PedidoService } from 'src/app/services/pedidos.service';  // Adicione a importação

@Component({
  selector: 'app-tbl-mesas',
  templateUrl: './tbl-mesa.component.html',
  styleUrls: ['./tbl-mesa.component.scss'],
})
export class TblMesasComponent implements OnInit {
  mesas: Mesa[] = [];
  produtos: Produto[] = [];
  
  mostrarModal: boolean = false;
  mostrarModalDetalhes: boolean = false;
  
  mesaSelecionada: Mesa | null = null;
  erro: string | null = null;
  filtroProduto: string = '';
  observacao: string = ''; // Variável para armazenar a observação

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

  // Histórico de pedidos
  historicoPedidos: Pedido[] = [];

  constructor(
    private mesaService: MesaService,
    private produtoService: ProdutoService,
    private pedidoService: PedidoService, // Injetando o PedidoService
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
        // console.log('Produtos carregados:', this.produtos);
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
    this.mostrarModalDetalhes = false; // Certifique-se de que o modal de detalhes esteja fechado
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
      // Calcular o total do pedido
      const totalPedido = this.calcularTotalPedido();
      console.log('ITEM ENVIADOS', this.mesaSelecionada.pedidos);
  
      // Criar a string personalizada para os itens do pedido
      const itensFormatados = this.mesaSelecionada.pedidos.map((pedido: any) => {
        console.log('NOME DOS PEDIDOS', pedido);
        return `${pedido.id_produto}|${pedido.nome}|${pedido.quantidade}|${pedido.preco}`;
      }).join('; ');
  
      // Criar o objeto do pedido
      const pedido: Pedido = {
        id_pedido: 0,  // Este ID será gerado pelo backend
        id_mesa: this.mesaSelecionada.id_mesa,
        data: new Date().toISOString().slice(0, 19).replace('T', ' '),  // Formato correto para o MySQL
        status: 'Solicitado',  // Status do pedido
        total: totalPedido,  // O total calculado do pedido
        item: itensFormatados, // Enviando a string formatada
        observacao: this.observacao || '',  // Adicionando a observação
      };
  
      console.log('Pedido enviado:', pedido);  // Verifique se o pedido está correto

      // Adicionar o pedido usando o PedidoService
      this.pedidoService.addPedido(pedido).subscribe(
        (response) => {
          this.toastr.success('Pedido finalizado e adicionado com sucesso!', 'Sucesso');
          
          // Atualizar o totalConsumido da mesa
          const novoTotalConsumo = parseFloat(String(this.mesaSelecionada.totalConsumo || '0')) + totalPedido;
  
          // Atualizar a mesa com o novo total consumido
          this.mesaSelecionada.totalConsumo = parseFloat(novoTotalConsumo.toFixed(2));
  
          // Agora, faça a chamada para atualizar o total no backend
          this.mesaService.atualizarTotalConsumo(this.mesaSelecionada.id_mesa.toString(), novoTotalConsumo).subscribe(
            (updateResponse) => {
              console.log('Total de consumo atualizado com sucesso:', updateResponse);
            },
            (error) => {
              console.error('Erro ao atualizar o total de consumo:', error);
              this.toastr.error('Erro ao atualizar o total de consumo', 'Erro');
            }
          );
  
          this.fecharModal();
        },
        (error) => {
          console.error('Erro ao adicionar o pedido:', error);
          this.toastr.error('Erro ao adicionar o pedido', 'Erro');
        }
      );
    }
  }
  
  

  carregarMesas(): void {
    this.mesaService.getMesas().subscribe(
      (response: Mesa[]) => {
        this.mesas = response;

        this.mesas.forEach(mesa => {
          // Garantindo que o valor de total_consumido seja um número, caso precise.
          if (!mesa.totalConsumo) {
            mesa.totalConsumo = 0; // Definindo um valor padrão caso seja null ou undefined
          }
        });

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

  carregarHistoricoPedidos(id_mesa: number): void {
    this.pedidoService.getHistoricoPedidosPorMesa(id_mesa).subscribe(
      (pedidos: any) => {
        console.log('Pedidos carregados:', pedidos);
  
        let totalMesa = 0;  // Inicializa o total da mesa como 0
  
        if (pedidos && pedidos.length > 0) {
          pedidos.forEach(pedido => {
            let totalPedido = 0;  // Inicializa o total do pedido como 0
  
            try {
              // Verifica se o item existe e faz a conversão corretamente
              const produtosString = pedido.item;  // String com os produtos
  
              if (produtosString && typeof produtosString === 'string') {
                // Converte a string de produtos em um array de objetos de produtos
                pedido.itens = produtosString.split(';').map((produtoStr: string) => {
                  // Remove qualquer espaço extra usando trim()
                  const [id, nome, quantidade, preco] = produtoStr.split('|').map((campo) => campo.trim());
    
                  // Verifica se a quantidade e o preço são válidos
                  const quantidadeValida = !isNaN(parseInt(quantidade, 10)) ? parseInt(quantidade, 10) : 0;
                  const precoValido = !isNaN(parseFloat(preco)) ? parseFloat(preco) : 0;
    
                  // Calcular o total do item (preço * quantidade)
                  totalPedido += precoValido * quantidadeValida;
  
                  return {
                    id: id || 'ID desconhecido',  // ID do produto (adicionado)
                    nome: nome || 'Produto desconhecido',  // Nome do produto
                    quantidade: quantidadeValida,
                    preco: precoValido,
                  };
                });
                console.log('Itens do pedido após conversão:', pedido.itens);
              } else {
                pedido.itens = [];  // Se não houver itens válidos, cria um array vazio
              }
            } catch (e) {
              pedido.itens = [];
              console.error('Erro ao converter pedido.item:', e);
            }
  
            // Atribui o total calculado para cada pedido
            pedido.totalPedido = totalPedido;
  
            // Adiciona o total do pedido ao total da mesa
            totalMesa += totalPedido;
  
            // Log para verificar a estrutura do pedido
            console.log('Pedido após conversão:', pedido);
          });
  
          // Atualiza a mesaSelecionada com os pedidos carregados
          this.mesaSelecionada.pedidos = pedidos;
          this.mesaSelecionada.totalMesa = totalMesa;  // Atualiza o total da mesa
          console.log('Pedidos selecionados:', this.mesaSelecionada.pedidos);
          console.log('Total da Mesa:', totalMesa);
        } else {
          console.log('Nenhum pedido encontrado para essa mesa');
          this.mesaSelecionada.pedidos = [];
          this.mesaSelecionada.totalMesa = 0;  // Caso não haja pedidos, o total da mesa é 0
        }
      },
      (error) => {
        console.error('Erro ao carregar histórico de pedidos:', error);
        this.toastr.error('Erro ao carregar histórico de pedidos', 'Erro');
      }
    );
  }
  
  
  
  

  abrirModalDetalhes(mesa: Mesa): void {
    this.mesaSelecionada = { ...mesa }; // Faz uma cópia da mesa
    console.log('Detalhes da Mesa Selecionada:', this.mesaSelecionada); // Verifique a mesa selecionada
    
    // Garantir que pedidos seja sempre um array
    if (!Array.isArray(this.mesaSelecionada.pedidos)) {
      this.mesaSelecionada.pedidos = [];
    }
  
    this.mostrarModalDetalhes = true;  // Mostra o modal de detalhes
    this.mostrarModal = false; // Fecha o modal de adicionar pedido
    
    this.carregarHistoricoPedidos(this.mesaSelecionada.id_mesa);
  }
  

  fecharModals() {
    this.mostrarModalDetalhes = false;  // Garantir que o modal de detalhes seja fechado
    this.mostrarModal = false;  // Se você também está controlando outros modais, defina como necessário
  }




}
