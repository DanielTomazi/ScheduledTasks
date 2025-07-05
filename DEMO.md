# TaskSync - Demonstração

Este documento mostra exemplos de uso e funcionalidades do TaskSync.

## Exemplos de Tarefas

Aqui estão alguns exemplos de tarefas que você pode criar no TaskSync:

### Trabalho
- **Título**: Preparar apresentação trimestral
- **Descrição**: Criar slides com dados de vendas e projeções para o próximo trimestre
- **Prazo**: 2025-07-15 14:00
- **Prioridade**: Alta
- **Categoria**: Trabalho

### Pessoal
- **Título**: Consulta médica anual
- **Descrição**: Check-up geral com exames de rotina
- **Prazo**: 2025-07-20 09:30
- **Prioridade**: Alta
- **Categoria**: Saúde

### Estudos
- **Título**: Revisar capítulos 5-7 de JavaScript
- **Descrição**: Estudar conceitos de closures, promises e async/await
- **Prazo**: 2025-07-10 20:00
- **Prioridade**: Média
- **Categoria**: Estudos

## Funcionalidades Demonstradas

### 1. Filtros Inteligentes
- **Todas as Tarefas**: Mostra todas as tarefas criadas
- **Pendentes**: Apenas tarefas não concluídas
- **Concluídas**: Tarefas marcadas como finalizadas
- **Atrasadas**: Tarefas com prazo vencido

### 2. Ordenação
- **Por Prazo**: Tarefas mais urgentes primeiro
- **Por Prioridade**: Alta prioridade no topo
- **Por Criação**: Tarefas mais recentes primeiro
- **Por Título**: Ordem alfabética

### 3. Busca
Digite qualquer parte do título ou descrição para encontrar tarefas rapidamente.

### 4. Modo Escuro
Clique no ícone de lua/sol no cabeçalho para alternar entre temas claro e escuro.

## Atalhos de Produtividade

| Atalho | Ação |
|--------|------|
| `Ctrl+N` / `Cmd+N` | Nova tarefa |
| `Ctrl+F` / `Cmd+F` | Focar na busca |
| `Ctrl+D` / `Cmd+D` | Alternar modo escuro |
| `Ctrl+E` / `Cmd+E` | Exportar tarefas |
| `Esc` | Fechar modal |

## Dicas de Uso

### Organização por Prioridade
- **Alta**: Tarefas urgentes e importantes
- **Média**: Tarefas importantes mas não urgentes
- **Baixa**: Tarefas que podem ser feitas quando houver tempo

### Categorização Eficiente
- **Trabalho**: Tarefas profissionais
- **Pessoal**: Tarefas da vida pessoal
- **Estudos**: Aprendizado e desenvolvimento
- **Saúde**: Consultas, exercícios, bem-estar
- **Outros**: Tarefas que não se encaixam nas outras categorias

### Definição de Prazos
- Use prazos realistas
- Considere dependências entre tarefas
- Deixe margem para imprevistos

## Backup e Restauração

### Exportar Tarefas
1. Use `Ctrl+E` ou clique no botão de exportar
2. Um arquivo JSON será baixado automaticamente
3. Guarde este arquivo em local seguro

### Importar Tarefas
1. Tenha um arquivo JSON válido de backup
2. Use a funcionalidade de importar (a ser implementada no futuro)
3. As tarefas serão adicionadas às existentes

## Solução de Problemas

### Tarefas não aparecem
- Verifique os filtros aplicados
- Limpe a busca
- Recarregue a página

### Modo escuro não funciona
- Verifique se o JavaScript está habilitado
- Limpe o cache do navegador

### Dados perdidos
- Os dados são salvos automaticamente no navegador
- Use a funcionalidade de exportar regularmente
- Evite limpar dados do navegador

## Suporte

Para suporte ou dúvidas:
1. Verifique este documento
2. Consulte o código-fonte
3. Abra uma issue no repositório

## Roadmap Futuro

Funcionalidades planejadas:
- [ ] Notificações push
- [ ] Sincronização na nuvem
- [ ] Colaboração em tarefas
- [ ] Relatórios e estatísticas
- [ ] Integração com calendários
- [ ] API REST
- [ ] Aplicativo mobile
- [ ] Widgets de desktop

---
