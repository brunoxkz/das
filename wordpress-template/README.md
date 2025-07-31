# B2C2 Corporate WordPress Template

## Descrição
Template WordPress corporativo inspirado no design do B2C2.com, 100% compatível com Elementor Pro e gratuito. Design moderno para empresas de fintech, blockchain e tecnologia financeira.

## Características Principais

### ✅ Compatibilidade Total com Elementor
- 100% compatível com Elementor Free e Pro
- Todos os campos são editáveis via Elementor
- Suporte completo para Elementor Theme Builder
- Templates pré-construídos para Header, Footer e páginas

### 🎨 Design Moderno e Responsivo
- Design inspirado no B2C2.com
- Layout limpo e profissional
- Totalmente responsivo para todos os dispositivos
- Animações suaves e micro-interações

### 📱 Recursos Incluídos
- **Custom Post Types**: Press Releases, Services, Team Members
- **Custom Taxonomies**: News Categories, Service Categories
- **Widget Areas**: Sidebar, 4 Footer Areas
- **Menus Personalizados**: Primary, Footer, Mobile
- **Customizer Settings**: Cores, Footer, Social Media
- **SEO Ready**: Estrutura otimizada para SEO

### 🔧 Funcionalidades Técnicas
- Suporte a WooCommerce
- Compatibilidade com plugins populares
- Otimizado para performance
- Código limpo e bem documentado
- Segurança aprimorada

## Instalação

### 1. Upload do Template
1. Baixe o arquivo ZIP do template
2. Vá para **Aparência > Temas** no WordPress
3. Clique em **Adicionar Novo > Fazer Upload do Tema**
4. Selecione o arquivo ZIP e clique em **Instalar Agora**
5. Ative o tema

### 2. Plugins Recomendados
```
- Elementor (Free ou Pro)
- Contact Form 7
- Yoast SEO
- WooCommerce (opcional)
- WPML (para multilíngue)
```

### 3. Importação de Dados Demo
1. Vá para **Ferramentas > Importar**
2. Instale o "WordPress Importer"
3. Importe o arquivo `demo-content.xml` incluído
4. Configure os menus em **Aparência > Menus**

## Configuração

### Personalizando com Elementor
1. **Header/Footer**: Use o Elementor Theme Builder
2. **Páginas**: Edite diretamente com Elementor
3. **Cores**: Personalize via Customizer ou Elementor
4. **Conteúdo**: Todos os textos são editáveis

### Custom Post Types Incluídos

#### Press Releases
- URL: `/news/`
- Campos: Título, Conteúdo, Imagem, Categoria
- Taxonomia: News Categories

#### Services
- URL: `/services/`
- Campos: Título, Conteúdo, Imagem, Ícone
- Taxonomia: Service Categories

#### Team Members
- URL: `/team/`
- Campos: Título, Conteúdo, Imagem, Cargo

### Configurações do Customizer

#### Cores do Tema
- **Primary Color**: Cor principal (padrão: #0066FF)
- **Secondary Color**: Cor secundária (padrão: #764ba2)

#### Configurações do Footer
- **Footer Text**: Texto de copyright
- **Social Links**: Facebook, Twitter, LinkedIn, Instagram, YouTube

## Estrutura de Arquivos

```
wordpress-template/
├── style.css                 # Estilos principais
├── functions.php            # Funcionalidades do tema
├── index.php               # Template principal
├── front-page.php          # Página inicial
├── header.php              # Cabeçalho
├── footer.php              # Rodapé
├── sidebar.php             # Barra lateral
├── single.php              # Posts individuais
├── page.php                # Páginas
├── archive.php             # Páginas de arquivo
├── screenshot.png          # Preview do tema
└── README.md              # Este arquivo
```

## Conteúdo Demo Incluído

### Páginas de Exemplo
- **Home**: Página inicial com hero section e seções de notícias
- **About**: Página sobre a empresa
- **Services**: Lista de serviços
- **News**: Arquivo de notícias
- **Contact**: Página de contato

### Posts Demo
- 6 posts de exemplo em "Press Releases"
- 4 serviços de exemplo
- 3 posts de "Insights"
- Categorias pré-configuradas

### Widgets Demo
- Newsletter signup
- Links rápidos
- Informações da empresa
- Links sociais

## Customização Avançada

### Alterando Cores
```css
:root {
    --primary-color: #0066FF;
    --secondary-color: #764ba2;
}
```

### Adicionando Novos Custom Post Types
Edite o arquivo `functions.php` na seção "Custom Post Types"

### Modificando Layouts
Use o Elementor Theme Builder para customizar:
- Header
- Footer
- Single Post Templates
- Archive Templates

## Suporte e Compatibilidade

### WordPress
- **Versão Mínima**: 5.0
- **Versão Testada**: 6.4
- **PHP Mínimo**: 7.4

### Plugins Testados
- Elementor Free/Pro ✅
- WooCommerce ✅
- Contact Form 7 ✅
- Yoast SEO ✅
- WPML ✅

## Licença
GPL v2 ou superior - Livre para uso pessoal e comercial

## Créditos
- Design inspirado em B2C2.com
- Desenvolvido pela Vendzz Development
- Fontes: Google Fonts (Inter)
- Ícones: Font Awesome

## Changelog

### v1.0 (2025-01-31)
- ✅ Lançamento inicial
- ✅ 100% compatibilidade com Elementor
- ✅ Design responsivo completo
- ✅ Custom Post Types incluídos
- ✅ Conteúdo demo para importação
- ✅ Customizer settings
- ✅ Performance otimizada

---

**Para suporte**: Entre em contato através do WordPress.org ou GitHub
**Documentação completa**: Disponível no diretório `/docs/`