# Pagina web tematica - Dia dos Namorados

https://leons7.github.io/Pagina-web-tematica-Dia-dos-namorados/

Uma pagina interativa em 3D feita para o Dia dos Namorados, com uma galaxia de particulas, coracao pulsante, fotos orbitando, musica de fundo e uma carta especial.

## Recursos

- Galaxia em Three.js com particulas em movimento.
- Efeito inicial de explosao tipo Big Bang.
- Buraco negro central e coracao vermelho pulsando.
- Fotos orbitando a galaxia como estrelas.
- Clique nas fotos orbitais para abrir uma visualizacao ampliada.
- Carta com painel de memorias.
- Musica de fundo em loop.

## Estrutura

```text
.
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── script.js
│   └── vendor/
│       ├── OrbitControls.js
│       └── three.module.js
├── musica/
│   └── camilla cabello - easy.mpeg
└── fotos/
    └── suas fotos locais
```

## Como usar

Abra o arquivo `index.html` em um navegador moderno.

Alguns navegadores bloqueiam audio automatico. Se a musica nao tocar ao carregar, clique no botao de musica no canto superior direito.

## Fotos

A pasta `fotos/` nao e enviada para o repositorio para preservar a privacidade das imagens. Para usar a pagina localmente, mantenha as fotos dentro da pasta `fotos/` com os mesmos nomes esperados no arquivo `js/script.js`, ou ajuste a lista `photos` nesse arquivo.

## Tecnologias

- HTML
- CSS
- JavaScript
- Three.js

