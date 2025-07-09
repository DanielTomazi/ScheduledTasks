# TaskSync - Agendador de Tarefas Elegante

Um agendador de tarefas moderno, responsivo e elegante construído com HTML5, CSS3 e JavaScript, seguindo os princípios de Clean Code e arquitetura bem estruturada.

## Características

### Funcionalidades Principais
- **Criação e Edição de Tarefas**: Interface intuitiva para criar, editar e gerenciar tarefas
- **Sistema de Prioridades**: Organize tarefas por prioridade (Alta, Média, Baixa)
- **Categorização**: Classifique tarefas por categorias (Trabalho, Pessoal, Estudos, Saúde, Outros)
- **Prazos e Lembretes**: Defina prazos com alertas automáticos para tarefas atrasadas
- **Filtros Inteligentes**: Filtre por status, prioridade e categoria
- **Busca Avançada**: Encontre tarefas rapidamente por título ou descrição
- **Ordenação Flexível**: Ordene por prazo, prioridade, data de criação ou título

### Interface e Experiência
- **Design Moderno**: Interface elegante com gradientes e animações suaves
- **Modo Escuro/Claro**: Alternância automática entre temas
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Animações Fluidas**: Transições suaves e feedback visual
- **Acessibilidade**: Suporte a navegação por teclado e leitores de tela

### Persistência e Dados
- **Armazenamento Local**: Todos os dados salvos no navegador
- **Exportação/Importação**: Backup e restauração em formato JSON
- **Sincronização**: Dados mantidos entre sessões

### Atalhos do Teclado
- `Ctrl/Cmd + N`: Nova tarefa
- `Ctrl/Cmd + F`: Focar na busca
- `Ctrl/Cmd + D`: Alternar modo escuro
- `Ctrl/Cmd + E`: Exportar tarefas
- `Esc`: Fechar modais

## Arquitetura e Tecnologias

### Estrutura do Projeto
```
ScheduledTasks/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos responsivos e elegantes
├── js/
│   ├── main.js         # Ponto de entrada da aplicação
│   ├── task-manager.js # Gerenciamento de tarefas
│   ├── ui-manager.js   # Gerenciamento da interface
│   └── utils.js        # Utilitários e helpers
├── README.md           # Documentação
└── LICENSE             # Licença
```

### Princípios de Clean Code Aplicados

#### 1. **Single Responsibility Principle (SRP)**
- `TaskManager`: Responsável apenas pelo gerenciamento de tarefas
- `UIManager`: Gerencia exclusivamente a interface do usuário
- `Utils`: Funções utilitárias reutilizáveis

#### 2. **Observer Pattern**
- `TaskManager` notifica `UIManager` sobre mudanças nos dados
- Baixo acoplamento entre componentes

#### 3. **Separation of Concerns**
- Lógica de negócio separada da apresentação
- Validação centralizada
- Persistência isolada

#### 4. **Naming Conventions**
- Nomes descritivos e autoexplicativos
- Métodos em verbos, classes em substantivos
- Constantes em UPPER_CASE

#### 5. **Error Handling**
- Tratamento robusto de erros
- Fallbacks gracefulls
- Logs detalhados para debugging

### Classes Principais

#### TaskManager
Gerencia todas as operações relacionadas às tarefas:
- CRUD completo (Create, Read, Update, Delete)
- Filtros e ordenação
- Persistência no localStorage
- Validação de dados
- Importação/Exportação

#### UIManager
Controla toda a interface do usuário:
- Renderização dinâmica
- Gerenciamento de eventos
- Modais e formulários
- Temas e animações
- Notificações

#### Utils
Coleção de utilitários organizados por categoria:
- `DateUtils`: Manipulação e formatação de datas
- `StringUtils`: Operações com strings
- `ArrayUtils`: Manipulação de arrays
- `LocalStorageManager`: Persistência local
- `DOMUtils`: Operações DOM seguras
- `ValidationUtils`: Validações
- `NotificationUtils`: Sistema de notificações

## Como Usar

### Instalação
1. Clone ou baixe o repositório
2. Abra `index.html` em um navegador moderno
3. Não são necessárias dependências ou instalação adicional

### Primeiros Passos
1. **Criar uma Tarefa**: Clique em "Nova Tarefa" ou use `Ctrl+N`
2. **Preencher Detalhes**: Adicione título, descrição, prazo, prioridade e categoria
3. **Gerenciar Tarefas**: Use os filtros na barra lateral para organizar
4. **Buscar Tarefas**: Use a barra de busca para encontrar tarefas específicas
5. **Alternar Modo**: Clique no ícone de lua/sol para mudar o tema

### Funcionalidades Avançadas
- **Exportar Dados**: Use `Ctrl+E` para fazer backup das tarefas
- **Importar Dados**: Arraste um arquivo JSON válido para restaurar tarefas
- **Atalhos**: Use atalhos de teclado para maior produtividade

## Desenvolvimento

### Estrutura de Código
O projeto segue uma arquitetura modular com responsabilidades bem definidas:

```javascript
// Exemplo de uso da API
const taskManager = new TaskManager();
const uiManager = new UIManager(taskManager);

// Criar nova tarefa
const result = taskManager.createTask({
    title: "Minha Tarefa",
    description: "Descrição detalhada",
    dueDate: new Date(),
    priority: "high",
    category: "work"
});
```

### Extensibilidade
O código foi projetado para ser facilmente extensível:
- Adicionar novos filtros
- Implementar novas categorias
- Integrar com APIs externas
- Adicionar notificações push

## Design System

### Cores
- **Primária**: Gradiente azul/roxo (#667eea → #764ba2)
- **Sucesso**: Verde (#10b981)
- **Aviso**: Amarelo (#f59e0b)
- **Erro**: Vermelho (#ef4444)
- **Info**: Azul (#3b82f6)

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Tamanhos**: Sistema escalável de 0.75rem a 1.875rem

### Espaçamento
- Sistema baseado em múltiplos de 0.25rem
- Consistência visual em toda a aplicação

## Compatibilidade

### Navegadores Suportados
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

### Dispositivos
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1400px+)

## 🔧 Configuração Avançada

### Personalização
O sistema pode ser facilmente personalizado através de variáveis CSS:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    /* Altere conforme necessário */
}
```

### Extensões
Para adicionar novas funcionalidades:
1. Estenda as classes existentes
2. Mantenha o padrão Observer
3. Siga as convenções de nomenclatura
4. Adicione testes apropriados

## Contribuição

Contribuições são bem-vindas! Por favor:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Faça commits descritivos
4. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

- **Inter Font**: Google Fonts
- **Font Awesome**: Ícones
- **CSS Grid/Flexbox**: Layout responsivo
- **Web APIs**: localStorage, Date, etc.
