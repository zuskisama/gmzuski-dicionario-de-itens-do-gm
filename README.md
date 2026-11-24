# Dicionário de Itens do GM

Site estático pronto para publicar na Vercel. Criado para consultar IDs e nomes de itens de World of Warcraft: Wrath of the Lich King 3.3.5a.

## Publicar na Vercel
1. Extraia o ZIP.
2. Entre em https://vercel.com/ e escolha **Add New → Project**.
3. Importe o repositório Git com esta pasta, ou use a Vercel CLI dentro da pasta.
4. Framework Preset: **Other**. Build Command e Output Directory podem ficar vazios (ou Output Directory `.`).
5. Faça o Deploy.

Também é possível subir os arquivos para um repositório GitHub e importar esse repositório na Vercel.

## Banco de dados
O arquivo `items.json` contém apenas alguns registros de demonstração para mostrar o funcionamento. **Ele não é a base completa dos itens do WotLK.** Para incluir o banco completo:
- Substitua `items.json` por uma lista JSON de objetos com `id`, `name` e, opcionalmente, `category` e `type`; ou
- Abra o site e use **Importar banco** para carregar um `.json` ou `.csv` localmente.

Exemplo JSON:
```json
[
  {"id": 49623, "name": "Shadowmourne", "category": "Armas", "type": "Machado de duas mãos"},
  {"id": 50363, "name": "Deathbringer's Will", "category": "Acessórios", "type": "Berloque"}
]
```

Exemplo CSV (cabeçalho obrigatório):
```csv
id,name,category,type
49623,Shadowmourne,Armas,Machado de duas mãos
50363,Deathbringer's Will,Acessórios,Berloque
```

## Recursos
- Busca por nome, ID ou tipo (botão Buscar ou tecla Enter).
- Filtro por categoria.
- Paginação.
- Botão para copiar `.additem ID 1`.
- Importação local de JSON e CSV.
- Layout responsivo.

## Observação importante
Os IDs podem variar conforme a versão, core ou customizações do servidor. Confira os IDs no banco de dados correspondente ao seu servidor antes de executar comandos GM.
