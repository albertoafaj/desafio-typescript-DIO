// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?

// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction

const apiKey: string = 'f11a904215b903a6bff7944ae2ae2859';
//let apiKey;
var requestToken: string ;
var  username: string ;
var  password: string ;
let sessionId: string;
let listId: string ;
let listaDeFilmes: unknown;
let temporaryList: HTMLDListElement;

let loginButton = document.getElementById('login-button')as HTMLButtonElement;
let searchButton = document.getElementById('search-button') as HTMLButtonElement;
let searchContainer = document.getElementById('search-container') as HTMLDivElement;
let saveListBtn = document.getElementById('new-btn-list') as HTMLButtonElement;
let myList = document.getElementById('my-list') as HTMLDivElement;


loginButton.addEventListener('click', async () => {
  await criarRequestToken();
  await logar();
  await criarSessao();
})

searchButton.addEventListener('click', async () => {
  let lista = document.getElementById("lista");
  let search = document.getElementById('search') as HTMLInputElement;
  let query: string = search.value;
  let ul = document.createElement('ul');
  if (lista) {
    lista.outerHTML = "";
  }
  listaDeFilmes = await procurarFilme(query);
  ul.id = "lista"
  for (const item of listaDeFilmes.results) {
      let li = document.createElement('li');
      li.appendChild(document.createTextNode(item.original_title))
      ul.appendChild(li)
  }
  searchContainer.insertBefore(ul,searchContainer.children[2]);
  temporaryList = ul;
  
})

// Adicionar o evento de click no botão de salvar a lista

saveListBtn.addEventListener('click', () => {
  let newList = document.getElementById('new-list') as HTMLInputElement;
  let newListDesc = document.getElementById('new-list-desc') as HTMLInputElement;
  let listTitle = document.getElementById('list-title') as HTMLTitleElement;
  let listDesc = document.getElementById('list-desc') as HTMLTitleElement;
  let cloneNode = temporaryList.cloneNode(true);
  let title = listTitle.innerHTML = newList.value;
  let description = listDesc.innerHTML = newListDesc.value;
  myList.appendChild(cloneNode);
  criarLista(title, description);
});

function preencherSenha(): void{
  let inputPassword = document.getElementById('senha') as HTMLInputElement;
  password = inputPassword.value;
  validateLoginButton();
}

function preencherLogin(): void {
  let inputUsername =  document.getElementById('login') as HTMLInputElement
  username = inputUsername.value;
  validateLoginButton();
}

function preencherApi() {
    let apiKeyBtn = document.getElementById('api-key') as HTMLInputElement;
    apiKeyBtn.value = apiKey;
    validateLoginButton();
}

function validateLoginButton(): void {
  if (password && username && apiKey) {
    loginButton.disabled = false;
  } else {
    loginButton.disabled = true;
  }
}

interface IRequest { url: string, method: string; body?: string | object};

class HttpClient {
  static async get({url, method, body}: IRequest) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open(method, url, true);
      request.onload = () => {
        if (request.status >= 200 && request.status < 300) {
          resolve(JSON.parse(request.responseText));
        } else {
          reject({
            status: request.status,
            statusText: request.statusText
          })
        }
      }
      request.onerror = () => {
        reject({
          status: request.status,
          statusText: request.statusText
        })
      }
      if (body) {
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        body = JSON.stringify(body);
      }
      request.send(body);
    })
  }
}

async function procurarFilme(query: string){
  query = encodeURI(query)
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
    method: "GET",
  })
  return result
}

async function adicionarFilme(filmeId) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
}

async function criarRequestToken () {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
    method: "GET"
  });
    requestToken = result.request_token;
}

async function logar() {
    
    let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
    method: "POST",
    body: {
      username: `${username}`,
      password: `${password}`,
      request_token: `${requestToken}`
    }
});
}

async function criarSessao() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
    method: "GET"
  })
  sessionId = result.session_id;
}

async function criarLista(nomeDaLista: string, descricao: string){
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
    method: "POST",
    body: {
      name: nomeDaLista,
      description: descricao,
      language: "pt-br"
    }
  })
  listId = result.id
}

async function adicionarFilmeNaLista(filmeId, listaId) {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
        method: "POST",
        body: {
      media_id: filmeId
    }
  })
}

async function pegarLista() {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
    method: "GET"
  })
}



{/* <div style="display: flex;">
<div style="display: flex; width: 300px; height: 100px; justify-content: space-between; flex-direction: column;">
      <input id="login" placeholder="Login" onchange="preencherLogin(event)">
      <input id="senha" placeholder="Senha" type="password" onchange="preencherSenha(event)">
      <input id="api-key" placeholder="Api Key" onchange="preencherApi()">
      <button id="login-button" disabled>Login</button>
      </div>
      <div id="search-container" style="margin-left: 20px">
      <input id="search" placeholder="Escreva...">
      <button id="search-button">Pesquisar Filme</button>
      </div>
    </div>*/}