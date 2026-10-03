# 🔥 $BURN - Site Oficial para Pump.fun (Solana Memecoin)

Landing page moderna, ultra-rápida e responsiva para a memecoin **$BURN** na **Pump.fun** (rede Solana).

---

## 🚀 Como Visualizar o Site Imediatamente

Você pode abrir o site de duas maneiras:

### Opção 1: Direto no Navegador (Mais Rápido)
Basta dar um duplo clique no arquivo `index.html` dentro desta pasta para abrir no seu navegador padrão (Chrome, Brave, Edge, etc.).

### Opção 2: Via Servidor Local (Recomendado para testes)
Caso queira rodar um servidor HTTP local:
```bash
# Com Python:
python -m http.server 3000

# Ou com Node.js (npx):
npx serve .
```
Depois acesse `http://localhost:3000` no seu navegador.

---

## 🎨 O Que Está Incluído no Site

1. **Mascote 3D Exclusivo de Fogo ($BURN)**: Render 3D de alta qualidade com óculos degen e estética Solana já incorporado em `assets/burn_mascot.jpg`.
2. **Efeito Visual de Brasas em Chamas**: Canvas animado em tempo real com partículas de fogo subindo dinamicamente.
3. **Barra de Cópia Rápida do Contrato (CA)**: Copia o endereço do contrato com 1 clique, feedback visual (toast) e efeito sonoro sintético.
4. **Rastreador Interativo da Bonding Curve**: Barra de progresso visual de migração para o Raydium com metas de Market Cap.
5. **Calculadora SOL ➔ $BURN**: Simulador dinâmico em tempo real de quantos tokens o comprador recebe por valor investido.
6. **Sintetizador Sonoro Nativo de Fogo (Web Audio API)**: Ativa som ambiente de fogueira e efeitos sonoros sem precisar carregar arquivos pesados de áudio externos.
7. **Tokenomics Transparente**: Gráfico circular estilizado, supply de 1.000.000.000, 0% de impostos e 100% Fair Launch.
8. **Guia Passo a Passo**: Tutorial de 4 etapas para compra via Phantom / Solflare na Pump.fun.
9. **Burnmap (Roadmap)**: 3 fases com metas claras e visuais.
10. **Gerador de Hype & Frases Degen**: Seção interativa com frases de impacto para a comunidade.
11. **FAQ Sanfonado (Accordion)**: Perguntas frequentes respondendo sobre segurança, rug pull e taxas.
12. **Aviso Legal (Disclaimer)**: Proteção jurídica para memecoins.

---

## ⚙️ Como Personalizar para o seu Lançamento

Quando você criar a moeda na [pump.fun](https://pump.fun), você receberá um **endereço de contrato (CA)** e o link da página do token.

Abra o arquivo `index.html` e edite os seguintes pontos:

1. **Contrato (CA)**:
   Procure por `BurnPumpFunXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` no `index.html` e substitua pelo seu endereço real de contrato na Solana.

2. **Links das Redes Sociais e Pump.fun**:
   Substitua os links dos botões:
   - `https://pump.fun` ➔ Link da sua moeda na pump.fun.
   - `https://x.com` ➔ Link do seu perfil no Twitter/X.
   - `https://dexscreener.com` ➔ Link do DexScreener da moeda após o deploy.

---

## 🌐 Como Publicar na Internet Gratuitamente

Você pode hospedar este site em segundos sem gastar nada:

1. **Vercel / Netlify**: Basta arrastar a pasta `burn-memecoin` ou conectar com seu repositório no GitHub.
2. **GitHub Pages**:
   - Crie um repositório no GitHub com esses arquivos.
   - Vá em `Settings > Pages` e selecione a branch `main` para publicar seu site com link `https://seu-usuario.github.io/burn-memecoin`.
