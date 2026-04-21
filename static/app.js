// ── Helpers ──────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

function getBase() {
  return $('api-base').value.replace(/\/$/, '');
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  $('page-' + name).classList.add('active');
  const pages = ['login', 'products', 'manage', 'cart'];
  document.querySelectorAll('.nav-btn')[pages.indexOf(name)].classList.add('active');
}

function showRes(id, data, ok) {
  const el = $(id);
  el.className = 'res ' + (ok ? 'ok' : 'err');
  el.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}

function clearRes(id) {
  const el = $(id);
  el.className = 'res';
  el.textContent = '';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function api(method, path, body) {
  const opts = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(getBase() + path, opts);
  const json = await r.json();
  return { ok: r.ok, data: json };
}

// ── Auth ─────────────────────────────────────────────────────────────────────

async function doLogin() {
  const username = $('login-user').value.trim();
  const password = $('login-pass').value;

  if (!username) {
    showRes('login-res', 'Preencha o campo de usuário.', false);
    return;
  }

  try {
    const { ok, data } = await api('POST', '/login', { username, password });
    showRes('login-res', data, ok);
    if (ok) {
      $('dot').classList.add('on');
      $('user-label').textContent = username;
    }
  } catch (e) {
    showRes('login-res', 'Erro de conexão: ' + e.message, false);
  }
}

async function doLogout() {
  try {
    const { ok, data } = await api('POST', '/logout');
    showRes('logout-res', data, ok);
    if (ok) {
      $('dot').classList.remove('on');
      $('user-label').textContent = 'desconectado';
    }
  } catch (e) {
    showRes('logout-res', 'Erro de conexão: ' + e.message, false);
  }
}

// ── Products ─────────────────────────────────────────────────────────────────

async function loadProducts() {
  try {
    const { ok, data } = await api('GET', '/api/products');

    if (!ok || !Array.isArray(data)) {
      showRes('products-res', data, false);
      return;
    }

    clearRes('products-res');
    const grid = $('products-grid');

    if (!data.length) {
      grid.innerHTML = '<div class="empty"><span>📦</span>Nenhum produto cadastrado</div>';
      return;
    }

    grid.innerHTML = data.map(p => `
      <div class="product-card" id="pcard-${p.id}">
        <div class="product-card-id">#${p.id}</div>
        <div class="product-card-name">${escHtml(p.name)}</div>
        <div class="product-card-price">R$ ${Number(p.price).toFixed(2)}</div>
        <div class="product-card-desc" id="pdesc-${p.id}">—</div>
        <div class="product-card-actions">
          <button class="btn btn-sm" onclick="loadDetail(${p.id})">Detalhes</button>
          <button class="btn btn-primary btn-sm" onclick="quickAddCart(${p.id})">+ Carrinho</button>
        </div>
      </div>
    `).join('');

  } catch (e) {
    showRes('products-res', 'Erro de conexão: ' + e.message, false);
  }
}

async function loadDetail(id) {
  try {
    const { ok, data } = await api('GET', '/api/products/' + id);
    if (ok) {
      const el = $('pdesc-' + id);
      if (el) el.textContent = data.description || 'Sem descrição.';
    }
  } catch (e) {
    // silencia erro de detalhe
  }
}

async function quickAddCart(id) {
  try {
    const { ok, data } = await api('POST', '/api/cart/add/' + id);
    showRes('products-res', data, ok);
  } catch (e) {
    showRes('products-res', 'Erro — verifique se está logado.', false);
  }
}

async function addProduct() {
  const name        = $('add-name').value.trim();
  const price       = parseFloat($('add-price').value);
  const description = $('add-desc').value.trim();

  if (!name || isNaN(price)) {
    showRes('add-res', 'Nome e preço são obrigatórios.', false);
    return;
  }

  try {
    const { ok, data } = await api('POST', '/api/products/add', { name, price, description });
    showRes('add-res', data, ok);
    if (ok) {
      $('add-name').value  = '';
      $('add-price').value = '';
      $('add-desc').value  = '';
    }
  } catch (e) {
    showRes('add-res', 'Erro de conexão: ' + e.message, false);
  }
}

async function updateProduct() {
  const id = $('upd-id').value;
  if (!id) {
    showRes('upd-res', 'Informe o ID do produto.', false);
    return;
  }

  const body = {};
  const n = $('upd-name').value.trim();
  const p = $('upd-price').value;
  const d = $('upd-desc').value.trim();
  if (n) body.name        = n;
  if (p) body.price       = parseFloat(p);
  if (d) body.description = d;

  if (!Object.keys(body).length) {
    showRes('upd-res', 'Preencha ao menos um campo para atualizar.', false);
    return;
  }

  try {
    const { ok, data } = await api('PUT', '/api/products/update/' + id, body);
    showRes('upd-res', data, ok);
  } catch (e) {
    showRes('upd-res', 'Erro de conexão: ' + e.message, false);
  }
}

async function deleteProduct() {
  const id = $('del-id').value;
  if (!id) {
    showRes('del-res', 'Informe o ID do produto.', false);
    return;
  }

  if (!confirm(`Deletar produto #${id}? Esta ação não pode ser desfeita.`)) return;

  try {
    const { ok, data } = await api('DELETE', '/api/products/delete/' + id);
    showRes('del-res', data, ok);
  } catch (e) {
    showRes('del-res', 'Erro de conexão: ' + e.message, false);
  }
}

// ── Cart ─────────────────────────────────────────────────────────────────────

async function loadCart() {
  try {
    const { ok, data } = await api('GET', '/api/cart');
    clearRes('cart-res');

    if (!ok) {
      showRes('cart-res', data, false);
      return;
    }

    const el       = $('cart-items');
    const totalRow = $('cart-total-row');

    if (!data.length) {
      el.innerHTML = '<div class="empty"><span>🛒</span>Seu carrinho está vazio</div>';
      totalRow.style.display = 'none';
      return;
    }

    let total = 0;
    el.innerHTML = data.map(item => {
      total += item.product_price;
      return `
        <div class="cart-item">
          <div>
            <div class="cart-name">${escHtml(item.product_name)}</div>
            <div class="cart-pid">produto #${item.product_id}</div>
          </div>
          <div class="cart-actions">
            <span class="cart-price">R$ ${Number(item.product_price).toFixed(2)}</span>
            <button class="btn btn-danger btn-sm" onclick="quickRemove(${item.product_id})">×</button>
          </div>
        </div>`;
    }).join('');

    totalRow.style.display = 'block';
    $('cart-total-val').textContent = 'R$ ' + total.toFixed(2);

  } catch (e) {
    showRes('cart-res', 'Erro de conexão: ' + e.message, false);
  }
}

async function addToCart() {
  const id = $('cart-add-id').value;
  if (!id) {
    showRes('cart-add-res', 'Informe o ID do produto.', false);
    return;
  }
  try {
    const { ok, data } = await api('POST', '/api/cart/add/' + id);
    showRes('cart-add-res', data, ok);
    if (ok) loadCart();
  } catch (e) {
    showRes('cart-add-res', 'Erro de conexão: ' + e.message, false);
  }
}

async function removeFromCart() {
  const id = $('cart-rem-id').value;
  if (!id) {
    showRes('cart-rem-res', 'Informe o ID do produto.', false);
    return;
  }
  try {
    const { ok, data } = await api('DELETE', '/api/cart/remove/' + id);
    showRes('cart-rem-res', data, ok);
    if (ok) loadCart();
  } catch (e) {
    showRes('cart-rem-res', 'Erro de conexão: ' + e.message, false);
  }
}

async function quickRemove(id) {
  try {
    const { ok, data } = await api('DELETE', '/api/cart/remove/' + id);
    if (ok) loadCart();
    else showRes('cart-res', data, false);
  } catch (e) {
    // silencia
  }
}

async function doCheckout() {
  if (!confirm('Confirmar compra e limpar o carrinho?')) return;
  try {
    const { ok, data } = await api('POST', '/api/cart/checkout');
    showRes('checkout-res', data, ok);
    if (ok) loadCart();
  } catch (e) {
    showRes('checkout-res', 'Erro de conexão: ' + e.message, false);
  }
}