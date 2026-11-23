const root = document.getElementById('menu');

const fmt = value => new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 2
}).format(Number(value));

function safe(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function categoryType(name) {
  const normalized = String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('champ')) return 'champagne';
  if (normalized.includes('tequila')) return 'tequila';
  if (normalized.includes('cognac') || normalized.includes('brandy')) return 'cognac';
  if (normalized.includes('whisk')) return 'whisky';
  if (normalized.includes('vodka')) return 'vodka';
  if (normalized.includes('gin') || normalized.includes('ginebra')) return 'gin';
  return 'other';
}

async function load() {
  try {
    const response = await fetch('menu-data.json?fresh=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error('HTTP ' + response.status);

    const data = await response.json();
    window.balam = data;
    draw();
  } catch (error) {
    root.innerHTML = '<p class="loading">No se pudo cargar el menú. ' +
      safe(error.message) + '</p>';
  }
}

function draw() {
  const data = window.balam;
  if (!data || !Array.isArray(data.categories)) return;

  const columns = [[], [], []];

  data.categories.forEach(category => {
    const type = categoryType(category.name);
    const products = Array.isArray(category.products) ? category.products : [];
    const items = products.length
      ? products.map(product => {
          const price = product.price_mxn !== '' && product.price_mxn != null
            ? 'MXN $' + fmt(product.price_mxn)
            : '—';

          return '<div class="product">' +
            '<span class="name">' + safe(product.name) + '</span>' +
            '<span class="price">' + price + '</span>' +
            '</div>';
        }).join('')
      : '<p class="empty">—</p>';

    const markup = '<section class="category category-' + type +
      '" data-category="' + safe(category.name) + '">' +
      '<span class="roaming-jaguar" aria-hidden="true"><svg viewBox="0 0 64 36" focusable="false">
        <path class="jaguar-tail" d="M14 17C7 14 4 12 5 8c1-3 5-3 7 0" />
        <path class="jaguar-body" d="M9 19c2-7 10-11 20-10 7 0 12 3 17 5 4-2 8-1 10 2l6 2 1 4-7 2-5-2c-2 5-6 7-11 6l-5 1-2 6h-4l-1-7-8-1-3 7h-4l1-9-5-1-2 5H4l2-7-4-3 1-3 4 1z" />
        <path class="jaguar-spots" d="M17 14l2-2 2 2-2 2zm7-3 2-2 2 2-2 2zm7 1 2-2 2 2-2 2zm7 2 2-2 2 2-2 2z" />
        <circle class="jaguar-ear" cx="51" cy="12" r="2.3" />
        <circle class="jaguar-eye" cx="57" cy="17" r="1" />
      </svg></span>' +
      '<h2>' + safe(category.name) + '</h2>' + items + '</section>';

    const column = type === 'champagne' || type === 'vodka' ? 0
      : type === 'tequila' ? 1
      : 2;
    columns[column].push(markup);
  });

  root.innerHTML = columns.map(categories =>
    '<div class="menu-column">' + categories.join('') + '</div>'
  ).join('');
}

load();
