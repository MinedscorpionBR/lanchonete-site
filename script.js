'use strict';

const precos = {
  'hamburguer': 18,
  'xbacon': 24,
  'natural': 15,
  'x-ratão': 32,
  'coca-cola': 12,
  'coca-cola zero': 12,
  'sprite': 9,
  'sprite zero': 9,
  'fanta uva': 8,
  'fanta uva zero': 8,
  'fanta laranja': 12,
  'fanta laranja zero': 12,
  'suco de sangue de rato': 6,
  'suco de uva': 6,
  'sobremesa': 8,
  'adicional': 10
};

const formulario = document.getElementById('pedido-form');
const mensagemErro = document.getElementById('mensagem-erro');
const resumoVazio = document.getElementById('resumo-vazio');
const resultado = document.getElementById('resultado');
const campoBebida = document.getElementById('bebida');
const campoQuantidadeBebida = document.getElementById('quantidade-bebida');

function obterQuantidade(id) {
  const campo = document.getElementById(id);
  const valor = Number(campo.value);
  return Number.isFinite(valor) ? valor : NaN;
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarNomeBebida(valor) {
  const nomes = {
    'coca-cola': 'Refrigerante Coca-Cola',
    'coca-cola zero': 'Refrigerante Coca-Cola Zero',
    sprite: 'Refrigerante Sprite',
    'sprite zero': 'Refrigerante Sprite Zero',
    'fanta uva': 'Refrigerante Fanta Uva',
    'fanta uva zero': 'Refrigerante Fanta Uva Zero',
    'fanta laranja': 'Refrigerante Fanta Laranja',
    'fanta laranja zero': 'Refrigerante Fanta Laranja Zero',
    'suco de sangue de rato': 'Suco de sangue de rato',
    'suco de uva': 'Suco de uva'
  };

  return nomes[valor] ?? valor;
}

function mostrarErro(mensagem) {
  mensagemErro.textContent = mensagem;
  mensagemErro.hidden = false;
  resultado.hidden = true;
  resumoVazio.hidden = false;
}

function limparErro() {
  mensagemErro.hidden = true;
  mensagemErro.textContent = '';
}

function validarPedido() {
  const nome = document.getElementById('nome').value.trim();
  const quantidades = {
    hamburguer: obterQuantidade('hamburguer'),
    xbacon: obterQuantidade('xbacon'),
    natural: obterQuantidade('natural'),
    'x-ratão': obterQuantidade('x-ratão'),
    bebida: obterQuantidade('quantidade-bebida')
  };

  if (!nome) {
    return { valido: false, mensagem: 'Informe o nome do cliente para continuar.' };
  }

  for (const quantidade of Object.values(quantidades)) {
    if (!Number.isFinite(quantidade) || quantidade < 0 || !Number.isInteger(quantidade)) {
      return { valido: false, mensagem: 'As quantidades devem ser números inteiros iguais ou maiores que zero.' };
    }
  }

  const totalLanches = quantidades.hamburguer + quantidades.xbacon + quantidades.natural + quantidades['x-ratão'];
  if (campoBebida.value === 'nenhuma' && quantidades.bebida > 0) {
    return { valido: false, mensagem: 'Escolha uma bebida ou deixe a quantidade de bebidas igual a zero.' };
  }

  if (campoBebida.value !== 'nenhuma' && quantidades.bebida < 1) {
    return { valido: false, mensagem: 'Informe uma quantidade maior que zero para a bebida escolhida, ou selecione “Nenhuma bebida”.' };
  }

  const temSobremesa = document.getElementById('sobremesa').checked;
  const temBebida = campoBebida.value !== 'nenhuma' && quantidades.bebida > 0;
  if (totalLanches < 1 && !temBebida && !temSobremesa) {
    return { valido: false, mensagem: 'Escolha um lanche ou uma bebida ou uma sobremesa para realizar o pedido.' };
  }

  const pagamento = document.querySelector('input[name="pagamento"]:checked');
  if (!pagamento) {
    return { valido: false, mensagem: 'Selecione a forma de pagamento.' };
  }

  return { valido: true, nome, quantidades, totalLanches, pagamento: pagamento.value };
}

function adicionarItemResumo(container, descricao, quantidade, precoUnitario) {
  if (quantidade <= 0) return;

  const linha = document.createElement('div');
  linha.className = 'item-resumo';

  const nome = document.createElement('span');
  nome.textContent = `${quantidade}x ${descricao}`;

  const valor = document.createElement('strong');
  valor.textContent = formatarMoeda(quantidade * precoUnitario);

  linha.append(nome, valor);
  container.appendChild(linha);
}

function calcularPedido(dados) {
  const { quantidades } = dados;
  const bebida = campoBebida.value;
  const temSobremesa = document.getElementById('sobremesa').checked;
  const temAdicional = document.getElementById('adicional').checked;

  const totalHamburguer = quantidades.hamburguer * precos.hamburguer;
  const totalXBacon = quantidades.xbacon * precos.xbacon;
  const totalNatural = quantidades.natural * precos.natural;
  const totalXRatão = quantidades['x-ratão'] * precos['x-ratão'];
  const totalLanches = totalHamburguer + totalXBacon + totalNatural + totalXRatão;

  const totalBebidas = bebida === 'nenhuma' ? 0 : quantidades.bebida * (precos[bebida] ?? 0);
  const totalSobremesa = temSobremesa ? precos.sobremesa : 0;
  const totalAdicional = temAdicional ? precos.adicional : 0;
  const subtotal = totalLanches + totalBebidas + totalSobremesa + totalAdicional;

  const descontoLanches = dados.totalLanches >= 3 ? totalLanches * 0.10 : 0;
  const valorAposDescontoLanches = subtotal - descontoLanches;
  const descontoPix = dados.pagamento === 'pix' ? valorAposDescontoLanches * 0.05 : 0;
  const descontoAlma = dados.pagamento === 'alma' ? valorAposDescontoLanches : 0;
  const valorFinal = valorAposDescontoLanches - descontoPix - descontoAlma;

  return {
    totalLanches,
    totalBebidas,
    totalSobremesa,
    totalAdicional,
    subtotal,
    descontoLanches,
    descontoPix,
    descontoAlma,
    valorFinal
  };
}

function exibirResultado(dados, valores) {
  document.getElementById('resumo-nome').textContent = dados.nome;

  const itens = document.getElementById('itens-resumo');
  itens.replaceChildren();
  adicionarItemResumo(itens, 'Hambúrguer', dados.quantidades.hamburguer, precos.hamburguer);
  adicionarItemResumo(itens, 'X-Bacon', dados.quantidades.xbacon, precos.xbacon);
  adicionarItemResumo(itens, 'Sanduíche natural', dados.quantidades.natural, precos.natural);
  adicionarItemResumo(itens, 'X-Ratão', dados.quantidades['x-ratão'], precos['x-ratão']);

  if (campoBebida.value !== 'nenhuma') {
    const nomeBebida = formatarNomeBebida(campoBebida.value);
    adicionarItemResumo(itens, nomeBebida, dados.quantidades.bebida, precos[campoBebida.value] ?? 0);
  }

  if (document.getElementById('sobremesa').checked) {
    adicionarItemResumo(itens, 'Sobremesa', 1, precos.sobremesa);
  }

  if (document.getElementById('adicional').checked) {
    adicionarItemResumo(itens, 'Barata em tudo', 1, precos.adicional);
  }

  document.getElementById('total-lanches').textContent = formatarMoeda(valores.totalLanches);
  document.getElementById('total-bebidas').textContent = formatarMoeda(valores.totalBebidas);
  document.getElementById('total-sobremesa').textContent = formatarMoeda(valores.totalSobremesa);
  document.getElementById('total-adicional').textContent = formatarMoeda(valores.totalAdicional);
  document.getElementById('subtotal').textContent = formatarMoeda(valores.subtotal);
  document.getElementById('desconto-lanches').textContent = `− ${formatarMoeda(valores.descontoLanches)}`;

  const descontoPagamento = dados.pagamento === 'alma' ? valores.descontoAlma : valores.descontoPix;
  document.getElementById('desconto-pix').textContent = `− ${formatarMoeda(descontoPagamento)}`;

  const formasPagamento = { dinheiro: 'Dinheiro', cartao: 'Cartão', pix: 'Pix', alma: 'Sua alma' };
  document.getElementById('resumo-pagamento').textContent = formasPagamento[dados.pagamento] ?? dados.pagamento;
  document.getElementById('valor-final').textContent = formatarMoeda(valores.valorFinal);

  let classificacao;
  if (valores.valorFinal <= 30) {
    classificacao = 'Pedido econômico!';
  } else if (valores.valorFinal <= 70) {
    classificacao = 'Pedido intermediário!';
  } else if (valores.valorFinal < 200) {
    classificacao = 'Pedido completo!';
  } else if (valores.valorFinal <= 500) {
    classificacao = 'Rico!';
  } else {
    classificacao = 'Coitado de quem vai fazer!';
  }

  document.getElementById('classificacao').textContent = classificacao;
  resumoVazio.hidden = true;
  resultado.hidden = false;
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  limparErro();

  const dados = validarPedido();
  if (!dados.valido) {
    mostrarErro(dados.mensagem);
    return;
  }

  const valores = calcularPedido(dados);
  exibirResultado(dados, valores);
});

campoBebida.addEventListener('change', () => {
  if (campoBebida.value === 'nenhuma') {
    campoQuantidadeBebida.value = '0';
  } else if (Number(campoQuantidadeBebida.value) === 0) {
    campoQuantidadeBebida.value = '1';
  }
});
