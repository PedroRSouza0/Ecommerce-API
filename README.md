# FlaskShop — Ecommerce API

API REST de e-commerce desenvolvida com Flask, com autenticação de usuários, gerenciamento de produtos e carrinho de compras. Inclui uma interface web para consumo da API.

---

## Tecnologias

- **Python 3** + **Flask**
- **Flask-SQLAlchemy** — ORM e banco de dados SQLite
- **Flask-Login** — gerenciamento de sessão e autenticação
- **Flask-CORS** — suporte a requisições cross-origin
- **HTML, CSS e JavaScript** — interface web integrada

---

## Funcionalidades

- Autenticação com login e logout de usuários
- CRUD completo de produtos (criar, listar, editar, deletar)
- Carrinho de compras por usuário autenticado
- Checkout com limpeza automática do carrinho
- Interface web para consumo visual da API

---

## Estrutura do projeto

```
Ecommerce-API/
├── static/
│   ├── style.css
│   └── app.js
├── templates/
│   └── index.html
├── application.py
├── requirements.txt
└── README.md
```

---

## Como rodar localmente

**1. Clone o repositório**
```bash
git clone https://github.com/PedroRSouza0/Ecommerce-API.git
cd Ecommerce-API
```

**2. Crie e ative um ambiente virtual**
```bash
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows
```

**3. Instale as dependências**
```bash
pip install -r requirements.txt
```

**4. Crie o banco de dados**
```bash
flask shell
>>> from application import db
>>> db.create_all()
>>> exit()
```

**5. Crie um usuário inicial**
```bash
flask shell
>>> from application import db, User
>>> u = User(username="admin", password="sua_senha")
>>> db.session.add(u)
>>> db.session.commit()
>>> exit()
```

**6. Inicie a aplicação**
```bash
python application.py
```

Acesse a interface em: `http://localhost:5000/app`

---

## Endpoints da API

### Autenticação
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/login` | Realiza login | — |
| POST | `/logout` | Encerra sessão | ✓ |

### Produtos
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/products` | Lista todos os produtos | — |
| GET | `/api/products/<id>` | Detalhes de um produto | — |
| POST | `/api/products/add` | Adiciona produto | ✓ |
| PUT | `/api/products/update/<id>` | Atualiza produto | ✓ |
| DELETE | `/api/products/delete/<id>` | Remove produto | ✓ |

### Carrinho
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/cart` | Visualiza o carrinho | ✓ |
| POST | `/api/cart/add/<id>` | Adiciona item ao carrinho | ✓ |
| DELETE | `/api/cart/remove/<id>` | Remove item do carrinho | ✓ |
| POST | `/api/cart/checkout` | Finaliza a compra | ✓ |

---

## Interface web

A interface está disponível em `/app` após iniciar o servidor. Permite interagir com todos os endpoints de forma visual, com suporte a configuração dinâmica da URL base da API.

---

## Melhorias futuras

- [ ] Migrar banco de dados para PostgreSQL (RDS)
- [ ] Deploy completo no AWS Elastic Beanstalk
- [ ] Rota de cadastro de novos usuários
- [ ] Hash de senhas com Werkzeug
- [ ] Paginação na listagem de produtos
