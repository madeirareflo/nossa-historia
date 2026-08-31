# Nossa lista de casamento

Site estático para publicar no GitHub Pages.

## Antes de publicar

1. Abra `script.js`.
2. Confira a chave Pix e o nome do destinatário.
3. Confira a chave e o nome do destinatário fazendo um teste com um valor baixo.

O site não processa pagamentos nem armazena dados: ele apenas mostra as instruções e facilita a cópia da chave Pix.

## Atualizar o ranking

No `script.js`, preencha a lista `ranking` já na ordem do maior para o menor valor. Exemplo:

```js
ranking: [
  "Ana",
  "Bruno",
],
```

O ranking público exibe somente os nomes, sem os valores. Como ele ficará público, use somente o nome que a pessoa autorizou divulgar.

## Publicação no GitHub Pages

Suba os arquivos deste diretório para um repositório do GitHub e ative **Settings → Pages → Deploy from a branch**, escolhendo a branch principal e a pasta `/ (root)`.
