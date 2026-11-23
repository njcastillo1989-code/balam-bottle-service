let language = 'en';
const root = document.getElementById('menu');

const fmt = n => new Intl.NumberFormat(language === 'es' ? 'es-MX' : 'en-US', {
  maximumFractionDigits: 2
}).format(Number(n));

function safe(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function categoryType(name) {
  const n = String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (n.includes('champ')) return 'champagne';
  if (n.includes('tequila')) return 'tequila';
  if (n.includes('cognac') || n.includes('brandy')) return 'cognac';
  if (n.includes('whisk')) return 'whisky';
  if (n.includes('vodka')) return 'vodka';
  if (n.includes('gin') || n.includes('ginebra')) return 'gin';
  return 'other';
}

async function load() {
  try {
    const res = await fetch('menu-data.json?fresh=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    // Preserve all six editable categories and their product records.
    window.balam = data;
    draw();
  } catch (e) {
    root.innerHTML = '<p class="loading">Unable to load menu / No se pudo cargar el menú. ' +
      safe(e.message) + '</p>';
  }
}

function draw() {
  const data = window.balam;
  if (!data || !Array.isArray(data.categories)) return;

  const note = document.getElementById('note');
  if (note) {
    note.textContent = data[language === 'en' ? 'notice_en' : 'notice_es'] ||
      (language === 'en'
        ? 'All prices are in Mexican pesos (MXN).'
        : 'Todos los precios están en pesos mexicanos (MXN).');
  }

  root.innerHTML = data.categories.map(cat => {
    const type = categoryType(cat.name);
    const products = Array.isArray(cat.products) ? cat.products : [];
    const items = products.length
      ? products.map(p => {
          const price = p.price_mxn !== '' && p.price_mxn != null
            ? 'MXN $' + fmt(p.price_mxn)
            : '—';

          return '<div class="product">' +
            '<span class="name">' + safe(p.name) + '</span>' +
            '<span class="price">' + price + '</span>' +
            '</div>';
        }).join('')
      : '<p class="empty">—</p>';

    return '<section class="category category-' + type +
      '" data-category="' + safe(cat.name) + '">' +
      '<h2>' + safe(cat.name) + '</h2>' + items + '</section>';
  }).join('');
}

document.querySelectorAll('[data-lang]').forEach(button => {
  button.addEventListener('click', () => {
    language = button.dataset.lang;
    document.documentElement.lang = language;
    document.querySelectorAll('[data-lang]').forEach(b => {
      b.classList.toggle('active', b === button);
    });
    if (window.balam) draw();
  });
});

load();
