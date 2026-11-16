# Vaga Certa — Recrutador Digital Inteligente & Validação Oficial de Oportunidades

Aplicação web completa e funcional desenvolvida sob medida para **Pedro Paulo dos Santos Dantas** para pesquisar, auditar, validar diretamente nas fontes oficiais, classificar e acompanhar vagas reais de emprego no ecossistema de TI.

---

## 🌟 Diferenciais da Solução

1. **Validação Direta nas Fontes Oficiais:**
   - Não reproduz cegamente agregadores (LinkedIn/Indeed/Google).
   - Conectores oficiais de primeiro nível para **Gupy**, **Greenhouse**, **Lever**, **Ashby** e **Crawler Direto de Portais Corporativos** com extração de Schema.org `JobPosting` e metadados.
   - Confirmação de status aberto, ausência de avisos de encerramento e presença de botão de candidatura funcional.

2. **Pisos Salariais Rígidos Obrigatórios:**
   - **Remoto:** CLT R$ 2.800,00 / PJ R$ 5.600,00
   - **Híbrido:** CLT R$ 2.800,00 / PJ R$ 5.600,00 (analisando viabilidade para Aracaju/SE)
   - **Presencial:** CLT R$ 3.500,00 / PJ R$ 7.000,00 (preferencialmente Aracaju/SE)
   - **Regra Crítica:** Vagas presenciais sem remuneração divulgada são **descartadas obrigatoriamente**.
   - Vagas remotas/híbridas sem remuneração são separadas em **"Remuneração a confirmar"**.

3. **Deduplicação & Memória de Histórico:**
   - Deduplicação inteligente por URL canônica (removendo UTMs/rastreamento), ATS ID único e similaridade de cargo + empresa.
   - As 7 vagas pré-conhecidas pelo candidato já estão registradas no histórico (`historico_conhecida`) e nunca são reportadas como novas.

4. **Compatibilidade Ética sem Alucinação:**
   - Avalia requisitos obrigatórios, desejáveis e diferenciais.
   - **NUNCA inventa competências, certificações, idiomas ou ferramentas** que não estejam no perfil de Pedro Paulo (ex: aponta explicitamente a ausência de Python avançado, AWS ou Inglês Fluente em vez de alegar falsamente experiência).

5. **Preparação Inteligente de Candidatura em 1ª Pessoa:**
   - Pitch curto (até 500 caracteres).
   - Carta de apresentação completa.
   - Respostas especializadas em n8n, APIs REST, Suporte Técnico avançado e Migração de Dados (SQL/PostgreSQL) baseadas na vivência na **1Doc**.
   - Botão de um clique para copiar.

6. **Acompanhamento no Funil Kanban (10 Etapas):**
   - Interessante $\rightarrow$ A revisar $\rightarrow$ Aprovada $\rightarrow$ Candidatura realizada $\rightarrow$ Entrevista agendada $\rightarrow$ Em processo $\rightarrow$ Contratado (com histórico de rejeições/desistências).

7. **Agendamento Diário em Backend:**
   - Execução automática via `node-cron` no fuso `America/Sao_Paulo` (default: 08:00 AM), sem depender de aba aberta no navegador.

---

## 🏗️ Arquitetura Técnica

```
buacarVagas/
├── backend/
│   ├── src/
│   │   ├── db/                 # Banco SQLite WAL com schema relacional e seed de Pedro Paulo
│   │   ├── services/
│   │   │   ├── connectors/     # Gupy, Greenhouse, Lever, Ashby, DirectCrawler
│   │   │   ├── search/         # Motor de descoberta e varredura oficial
│   │   │   ├── validator/      # Validação de pisos salariais e viabilidade de Aracaju/SE
│   │   │   ├── matcher/        # Motor de compatibilidade (Alta/Média/Baixa)
│   │   │   ├── deduplication/  # Normalização de URLs canônicas e ATS IDs
│   │   │   ├── application/    # Gerador de respostas em 1ª pessoa
│   │   │   └── scheduler/      # Cron em America/Sao_Paulo
│   │   ├── routes/             # Rotas REST (/api/dashboard, /api/jobs, etc.)
│   │   └── server.ts           # Servidor Express
│   └── tests/                  # Suíte de 16 testes de aceitação com Vitest
└── frontend/
    ├── src/
    │   ├── components/         # Header, Sidebar, JobCard, JobDetailsModal, EvidenceSheet
    │   ├── pages/              # Dashboard, Buscar, Novas, Catálogo, Kanban, Currículos, etc.
    │   └── App.tsx
```

---

## 🚀 Como Executar

### 1. Iniciar o Backend
```bash
cd backend
npm run dev
# Ou em produção: npm start
```
Servidor ativo em: `http://localhost:3001` (inclui a API REST e serve a interface compilada).

### 2. Iniciar o Frontend em Desenvolvimento (Vite com Hot-Reload)
```bash
cd frontend
npm run dev
```
Interface disponível em: `http://localhost:5173`.

### 3. Executar os Testes Automatizados de Aceitação
```bash
cd backend
npm test
```
Resultados: 16 testes cobrindo pisos salariais, descartes obrigatórios, deduplicação, localidade e geração de respostas.

