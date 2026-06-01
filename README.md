# 🚛 FrotaPRO — Backend

API REST completa para gestão de frota de caminhões.

## Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Banco de dados**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT
- **Jobs**: node-cron (alertas automáticos)
- **E-mail**: Nodemailer (alertas de vencimento)

---

## ⚡ Como rodar

### 1. Pré-requisitos
```bash
node >= 18
postgresql >= 14
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 4. Criar banco e rodar migrations
```bash
npm run db:migrate
```

### 5. Popular banco com dados iniciais
```bash
npm run db:seed
```

### 6. Iniciar servidor
```bash
npm run dev       # desenvolvimento (nodemon)
npm start         # produção
```

---

## 📡 Endpoints da API

### Autenticação
| Método | Rota             | Descrição          |
|--------|------------------|--------------------|
| POST   | /api/auth/login  | Login e retorna JWT |
| POST   | /api/auth/cadastrar | Criar usuário    |
| GET    | /api/auth/perfil | Dados do usuário logado |

### Veículos
| Método | Rota                | Descrição        |
|--------|---------------------|------------------|
| GET    | /api/veiculos       | Listar todos     |
| GET    | /api/veiculos/:id   | Detalhes + docs + pneus |
| POST   | /api/veiculos       | Cadastrar        |
| PUT    | /api/veiculos/:id   | Atualizar        |
| DELETE | /api/veiculos/:id   | Desativar        |

### Abastecimento
| Método | Rota                        | Descrição           |
|--------|-----------------------------|---------------------|
| GET    | /api/abastecimentos         | Listar com filtros  |
| GET    | /api/abastecimentos/resumo  | Resumo por veículo/mês |
| POST   | /api/abastecimentos         | Registrar (calcula km/L automaticamente) |

### Pneus
| Método | Rota                           | Descrição          |
|--------|--------------------------------|--------------------|
| GET    | /api/pneus/alertas             | Pneus críticos     |
| GET    | /api/pneus/veiculo/:id         | Pneus do veículo   |
| POST   | /api/pneus/rodizio             | Registrar rodízio  |

### Multas
| Método | Rota                          | Descrição              |
|--------|-------------------------------|------------------------|
| GET    | /api/multas                   | Listar                 |
| GET    | /api/multas/consultar/:placa  | Consultar DETRAN       |
| POST   | /api/multas                   | Registrar manualmente  |
| PATCH  | /api/multas/:id/pagamento     | Marcar como paga       |

### Dashboard
| Método | Rota                        | Descrição              |
|--------|-----------------------------|------------------------|
| GET    | /api/dashboard/resumo       | KPIs do mês atual      |
| GET    | /api/dashboard/custos-mensais| Custos por mês/tipo   |
| GET    | /api/dashboard/custo-veiculo | Custo detalhado        |

### Frete
| Método | Rota                     | Descrição           |
|--------|--------------------------|---------------------|
| POST   | /api/fretes/calcular     | Calcular (sem salvar) |
| GET    | /api/fretes              | Listar fretes       |
| POST   | /api/fretes              | Salvar frete        |
| PATCH  | /api/fretes/:id/status   | Atualizar status    |

### Rastreamento
| Método | Rota                              | Descrição              |
|--------|-----------------------------------|------------------------|
| GET    | /api/rastreamento/atual           | Posição de toda frota  |
| GET    | /api/rastreamento/veiculo/:id     | Histórico de rota      |
| POST   | /api/rastreamento/ping            | GPS envia posição      |
| POST   | /api/rastreamento/sincronizar     | Sincroniza com provedor|

---

## 🔒 Autenticação

Todas as rotas (exceto `/api/auth/login`) exigem o header:
```
Authorization: Bearer <token>
```

### Perfis de acesso
| Perfil     | Permissões                          |
|------------|-------------------------------------|
| ADMIN      | Tudo                                |
| GESTOR     | Criar/editar, ver relatórios        |
| MOTORISTA  | Registrar abastecimento, ver fretes |

---

## ⏰ Jobs automáticos

| Job                   | Horário       | Descrição                          |
|-----------------------|---------------|------------------------------------|
| Alertas de vencimento | Todo dia 08h  | Envia e-mail 30, 15 e 7 dias antes |
| Sincronização GPS     | A cada 30s    | Atualiza posição dos veículos      |
| Status dos pneus      | Todo dia 00h  | Recalcula BOM/ATENÇÃO/TROCAR       |

---

## 🗄️ Estrutura do projeto

```
frota-backend/
├── prisma/
│   ├── schema.prisma      ← Modelos do banco
│   └── seed.js            ← Dados iniciais
├── src/
│   ├── app.js             ← Express + rotas
│   ├── server.js          ← Entrada da aplicação
│   ├── config/
│   │   └── database.js    ← Prisma client
│   ├── controllers/       ← Lógica de negócio
│   ├── routes/            ← Definição das rotas
│   ├── middlewares/
│   │   ├── auth.js        ← JWT + autorização por perfil
│   │   └── errorHandler.js
│   └── services/
│       ├── cronService.js ← Jobs agendados
│       ├── emailService.js← Alertas por e-mail
│       └── gpsService.js  ← Integração GPS (Sascar/Omnilink/Positron)
└── .env.example
```

---

## 🔌 Integração GPS

Configure `GPS_PROVIDER` no `.env`:
- `sascar` — Sascar
- `omnilink` — Omnilink
- `positron` — Positron
- `mock` — Dados simulados (desenvolvimento)

---

## 📦 Próximos passos sugeridos

- [ ] Testes automatizados (Jest + Supertest)
- [ ] Upload de documentos (AWS S3 / MinIO)
- [ ] Relatórios em PDF (Puppeteer)
- [ ] WebSocket para rastreamento em tempo real
- [ ] App mobile (React Native) para motoristas
- [ ] Notificações WhatsApp (Twilio / Z-API)
- [ ] Deploy: Railway / Render / EC2 + Docker
