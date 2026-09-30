# Nossa História — Lara & Davi

Site estático do casamento, preparado para GitHub Pages.

## O que a V2 já faz

- lista de 60 presentes com filtros por categoria;
- carregamento progressivo de 12 presentes para deixar a navegação mais leve;
- layout de presentes em uma coluna no celular;
- seleção de presente com valor de referência e identificação exibida junto ao Pix;
- cópia da chave Pix e da identificação do presente;
- contagem regressiva que muda automaticamente no dia e após o casamento;
- imagens otimizadas em WebP;
- metadados Open Graph/Twitter para melhorar a prévia ao compartilhar o link;
- ranking manual sem exibir valores.

## Importante sobre o Pix

O site **não processa pagamentos, não gera cobrança e não registra transferências**. Ele apenas exibe a chave Pix e ajuda o convidado a identificar o presente escolhido. A confirmação final ocorre no aplicativo do banco.

Os dados públicos ficam em `script.js`:

```js
pixKey: "...",
recipient: "...",
```

Antes de publicar, confira a chave e o nome do destinatário e faça um teste com um valor baixo.

## Atualizar o ranking

No `script.js`, preencha `ranking` na ordem desejada. Exemplo:

```js
ranking: [
  "Ana",
  "Bruno",
],
```

O ranking público exibe somente os nomes. Use apenas nomes cuja divulgação esteja autorizada.

## Publicação no GitHub Pages

Suba os arquivos deste diretório para o repositório e, no GitHub, use **Settings → Pages → Deploy from a branch**, escolhendo a branch principal e a pasta `/ (root)`.

## Próxima expansão opcional

Para transformar a página em um portal completo do casamento sem inventar informações, ainda faltam os dados reais de: local/horário, RSVP, traje, programação, mapa e o texto da história do casal. A identidade visual atual pode ser mantida para essas novas seções.
