const URL = "http://localhost:3400/produtos";

let listaProdutos = [];
let tabelaProdutos = document.querySelector("table>tbody");
let modalProduto = new bootstrap.Modal(
  document.getElementById("modal-produto")
);

let formModal = {
  id: document.querySelector("#id"),
  nome: document.querySelector("#nome"),
  valor: document.querySelector("#valor"),
  quantidadeEstoque: document.querySelector("#quantidadeEstoque"),
  observacao: document.querySelector("#observacao"),
  dataCadastro: document.querySelector("#dataCadastro"),
  btnSalvar: document.querySelector("#btn-salvar"),
  btnCancelar: document.querySelector("#btn-cancelar"),
};

modalProduto._element.addEventListener("shown.bs.modal", function (e) {
  const botao = e.relatedTarget;
  const acao = botao.getAttribute("data-acao");

  if (acao === "adicionar") {
    limparModalProduto();
    modalProduto.show();
  } else if (acao === "editar") {
    const produtoId = botao.getAttribute("data-id");
    obterProduto(produtoId);
  }
});

function obterProduto(id) {
  fetch(`${URL}/${id}`, {
    method: "GET",
    headers: {
      Authorization: obterToken(),
    },
  })
    .then((response) => response.json())
    .then((produto) => {
      popularModal(produto);
    })
    .catch((erro) => {});
}

// Obter os produtos da API
function obterProdutos() {
  fetch(URL, {
    method: "GET",
    headers: {
      Authorization: obterToken(),
    },
  })
    .then((response) => response.json())
    .then((produtos) => {
      listaProdutos = produtos;
      popularTabela(produtos);
    })
    .catch((erro) => {});
}

obterProdutos();

function popularTabela(produtos) {
  // Limpando a tabela para popular
  tabelaProdutos.textContent = "";

  produtos.forEach((produto) => {
    criarLinhaNaTabela(produto);
  });
}

function popularModal(produto) {
  formModal.id.value = produto.id;
  formModal.nome.value = produto.nome;
  formModal.valor.value = produto.valor;
  formModal.quantidadeEstoque.value = produto.quantidadeEstoque;
  formModal.observacao.value = produto.observacao;
  formModal.dataCadastro.value = trataDataModal(produto.dataCadastro);
}

function trataDataModal(data) {
  const dataCadastro = new Date(data);
  const year = dataCadastro.getFullYear();
  const month = String(dataCadastro.getMonth() + 1).padStart(2, "0");
  const day = String(dataCadastro.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function criarLinhaNaTabela(produto) {
  //1° Criando um tr, é uma linha na tabela.
  let tr = document.createElement("tr");

  //2° Criar as tds dos conteudos da tabela
  let tdId = document.createElement("td");
  let tdNome = document.createElement("td");
  let tdValor = document.createElement("td");
  let tdQuantidadeEstoque = document.createElement("td");
  let tdObservacao = document.createElement("td");
  let tdDataCadastro = document.createElement("td");
  let tdAcoes = document.createElement("td");

  // 3° Atualizar as tds com base no produto
  tdId.textContent = produto.id;
  tdNome.textContent = produto.nome;
  tdValor.textContent = produto.valor;
  tdQuantidadeEstoque.textContent = produto.quantidadeEstoque;
  tdObservacao.textContent = produto.observacao;
  tdDataCadastro.textContent = new Date(
    produto.dataCadastro
  ).toLocaleDateString();
  tdAcoes.innerHTML = `<button id="btn-editar" data-bs-toggle="modal" data-bs-target="#modal-produto" class="btn btn-outline-primary btn-sm mr-3" data-acao="editar" data-id="${produto.id}">
                                Editar
                            </button>
                            <button id="btn-excluir" onclick="excluirProduto(${produto.id})" class="btn btn-outline-primary btn-sm mr-3">
                                Excluir
                        </button>`;

  // 4° Adicionando as TDs à Tr
  tr.appendChild(tdId);
  tr.appendChild(tdNome);
  tr.appendChild(tdValor);
  tr.appendChild(tdQuantidadeEstoque);
  tr.appendChild(tdObservacao);
  tr.appendChild(tdDataCadastro);
  tr.appendChild(tdAcoes);

  // 5° Adicionar a tr na tabela.
  tabelaProdutos.appendChild(tr);
}

formModal.btnSalvar.addEventListener("click", () => {
  // 1° Capturar os dados da tela do modal e transformar em um produto
  let produto = obterProdutoDoModal();

  // 2° Verificar se os campos obrigatorios foram preenchidos

  if (!produto.validar()) {
    alert("Nome, quantidade em estoque e valor são obrigatórios.");
    return;
  }

  // 3° Verificar se é uma edição ou adição
  if (produto.id) {
    editarProdutoNoBackend(produto);
  } else {
    adicionarProdutoNoBackend(produto);
  }
});

function obterProdutoDoModal() {
  return new Produto({
    id: formModal.id.value,
    nome: formModal.nome.value,
    valor: formModal.valor.value,
    quantidadeEstoque: formModal.quantidadeEstoque.value,
    observacao: formModal.observacao.value,
    dataCadastro: formModal.dataCadastro.value
      ? new Date(formModal.dataCadastro.value).toISOString()
      : new Date().toISOString(),
  });
}

function adicionarProdutoNoBackend(produto) {
  fetch(URL, {
    method: "POST",
    headers: {
      Authorization: obterToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(produto),
  })
    .then((response) => response.json())
    .then((response) => {
      let novoProduto = new Produto(response);
      listaProdutos.push(novoProduto);

      popularTabela(listaProdutos);

      // Fechar modal

      modalProduto.hide();

      // Mandar mensagem de cliente cadastrado com sucesso!
      alert(`Produto ${produto.nome}, foi cadastrado com sucesso!`);
    });
}

function editarProdutoNoBackend(produto) {
  fetch(`${URL}/${produto.id}`, {
    method: "PUT",
    headers: {
      Authorization: obterToken(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(produto),
  })
    .then((response) => response.json())
    .then((response) => {
      const produtoIndice = listaProdutos.findIndex((p) => p.id == produto.id);
      listaProdutos[produtoIndice] = new Produto(response);

      popularTabela(listaProdutos);


      // Fechar modal
      modalProduto.hide();

      // Mandar mensagem de cliente editado com sucesso!
      alert(`Produto ${produto.nome}, foi editado com sucesso!`);
    });
}

function limparModalProduto() {
  formModal.id.value = "";
  formModal.nome.value = "";
  formModal.valor.value = "";
  formModal.quantidadeEstoque.value = "";
  formModal.observacao.value = "";
  formModal.dataCadastro.value = "";
}

function excluirProduto(id) {
  let produto = listaProdutos.find((produto) => produto.id == id);

  if (confirm("Deseja realmente excluir o produto " + produto.nome)) {
    excluirProdutoNoBackEnd(id);
  }
}

function excluirProdutoNoBackEnd(id) {
  fetch(`${URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: obterToken(),
    },
  }).then(() => {
    removerProdutoDaLista(id);
    popularTabela(listaProdutos);
  });
}

function removerProdutoDaLista(id) {
  let indice = listaProdutos.findIndex((produto) => produto.id == id);

  listaProdutos.splice(indice, 1);
}
