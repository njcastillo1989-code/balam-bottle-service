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
