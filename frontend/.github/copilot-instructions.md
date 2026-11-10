<!-- BEGIN SECURITY TEMPLATE -->

# 🛡️ Instruções globais de segurança para GitHub Copilot

## 1) Fonte única de políticas

- A política de segurança oficial deste repositório está em `SECURITY.md`.
- Antes de qualquer implementação, o agente **DEVE** ler `SECURITY.md` e aplicar suas regras integralmente.
- Este arquivo não replica políticas, ele só define comportamento operacional do agente.

## 2) Instalação de dependências exige validação do dev

- Antes de executar qualquer comando de instalação/atualização/remoção de dependências, o agente **DEVE pedir confirmação explícita do desenvolvedor**.
- Isso vale para qualquer linguagem/ecossistema (Node, Python, Java, .NET, Go, Rust etc.).
- Sem confirmação explícita, o agente **NÃO** pode rodar comandos como `npm/pnpm/yarn`, `pip/poetry/pipenv`, `mvn/gradle`, `dotnet add package`, `go get`, `cargo add` e equivalentes.

## 3) Proibição de "simular instalação"

- O agente **NÃO** deve editar manualmente arquivos de dependência/lockfile para simular instalação.
- Mudanças nesses arquivos devem vir de comando do gerenciador de pacotes, após validação do dev.

## 4) Conflito com pedido do usuário

- Se o usuário solicitar algo que viole `SECURITY.md`, o agente deve:
  1. Recusar a ação insegura.
  2. Citar que conflita com `SECURITY.md`.
  3. Oferecer alternativa segura.

<!-- END SECURITY TEMPLATE -->
