# V2 — alterações aplicadas

Esta versão mantém a identidade visual original e corrige os pontos principais encontrados na auditoria.

## Corrigido

- removida a mensagem pública de "chave Pix de exemplo";
- substituído o símbolo de Bitcoin por uma identificação neutra `PIX`;
- o modal de presente não mostra mais um campo de valor que não era usado;
- a escolha agora aparece junto dos dados do Pix, com nome e valor de referência;
- adicionada cópia da identificação do presente;
- filtros passaram a usar semântica de botões, evitando o uso incompleto de `tab`;
- adicionados estados de foco visíveis para teclado;
- contagem regressiva passa a ter estado especial no dia e depois do casamento;
- adicionados metadados Open Graph/Twitter para compartilhamento.

## Melhorias de desempenho e celular

- todas as 70 imagens foram convertidas para WebP;
- pasta `assets` caiu de aproximadamente 55 MB para aproximadamente 3,3 MB;
- imagens de produtos são redimensionadas para o tamanho necessário ao site;
- no celular, presentes aparecem em uma coluna;
- a lista mostra inicialmente 12 presentes e possui botão “Ver mais”, evitando uma página enorme;
- áreas de toque e foco foram melhoradas.

## Fluxo do Pix

O site continua deliberadamente simples e seguro: ele não processa pagamentos, não registra transferências e não simula uma cobrança. O convidado escolhe um presente, vê a referência e então copia a chave Pix para concluir no próprio banco.

## Para a próxima etapa

Para adicionar seções completas de cerimônia/festa sem inventar informações, serão necessários os dados reais de local, horário, dress code, RSVP, programação, mapa e a história do casal.
