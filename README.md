# Nossa lista de casamento

Site estático para publicar no GitHub Pages.

## Antes de publicar

1. Abra `script.js`.
2. Troque `SUA-CHAVE-PIX-AQUI` pela chave Pix real.
3. Troque `NOME DO DESTINATÁRIO` pelo nome que aparecerá no aplicativo do banco.
4. Confira a chave e o nome do destinatário fazendo um teste com um valor baixo.

O site não processa pagamentos nem armazena dados: ele apenas mostra as instruções e facilita a cópia da chave Pix.

## Atualizar o ranking

No `script.js`, preencha a lista `ranking` com os pagamentos confirmados. Exemplo:

```js
ranking: [
  { name: "Ana", amount: 300 },
  { name: "Bruno", amount: 150 },
],
```

O site ordena automaticamente os nomes pelo maior valor. Como o ranking ficará público, use somente o nome que a pessoa autorizou divulgar.

## Publicação no GitHub Pages

Suba os arquivos deste diretório para um repositório do GitHub e ative **Settings → Pages → Deploy from a branch**, escolhendo a branch principal e a pasta `/ (root)`.
