# Auditoria Cte Backend

Backend para a solução transitória de auditoria de ctes

## Environments

| Environment | URL                                                                                |
| ----------- | ---------------------------------------------------------------------------------- |
| hml         | <https://auditoria-cte-backend.hml.plataforma-logistica.app.grupoboticario.com.br> |
| prd         | <https://auditoria-cte-backend.prd.plataforma-logistica.app.grupoboticario.com.br> |

## Guia de referência de API RESTful

Este é o guia de API RESTful do Grupo Boticário que define os padrões a serem adotados durante a implementação de novas APIs públicas ou privadas no GB, tornando os serviços acessíveis através de interfaces que são facilmente compreendidas e documentadas para desenvolvedores e consumidores.

[Clique aqui para acessar o guia](https://alquimia.gb.tech/docs/default/component/api-restful)

## Começando

Executando o aplicativo:

Copie o arquivo env para desenvolvimento local

```bash
cp .env{.example,}
```

```bash
npm ci
npm run start:dev
```

Testando

```bash
curl http://localhost:3000/healthcheck
curl http://localhost:3000/healthcheck/complete
curl http://localhost:3000
```
