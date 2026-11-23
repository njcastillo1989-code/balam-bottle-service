
let language = 'en';

const root = document.getElementById('menu');

const fmt = n =>
  new Intl.NumberFormat('en-US', {
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

// Identifica cada categoría sin modificar sus datos.
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

// Carga los productos desde GitHub.
async function load() {
  try {
    const res = await fetch(
      'menu-data.json?fresh=' + Date.now(),
      { cache: 'no-store' }
    );

    if (!res.ok) {
      throw new Error('HTTP ' + res.status);
    }

    const data = await res.json();

    window.balam = data;
    draw();

  } catch (e) {
    root.innerHTML =
      '<p class="loading">' +
      'Unable to load menu / No se pudo cargar el menú. ' +
      safe(e.message) +
      '</p>';
  }
}

// Genera el menú conservando productos y precios.
function draw() {
  const data = window.balam;

  if (!data || !Array.isArray(data.categories)) return;

  const note = document.getElementById('note');

  if (note) {
    note.textContent =
      data[language === 'en' ? 'notice_en' : 'notice_es'] || '';
  }

  root.innerHTML = data.categories.map(cat => {

    const type = categoryType(cat.name);

    const products = Array.isArray(cat.products)
      ? cat.products
      : [];

    const items = products.length
      ? products.map(p => {

          const mxn =
            p.price_mxn !== '' &&
            p.price_mxn != null
              ? '$' + fmt(p.price_mxn)
              : '—';

          const usd =
            p.price_usd !== '' &&
            p.price_usd != null
              ? '<span class="usd">USD $' +
                fmt(p.price_usd) +
                '</span>'
              : '';

          return `
            <div class="product">
              <span class="name">${safe(p.name)}</span>
              <span class="price">
                ${mxn}
                ${usd}
              </span>
            </div>
          `;

        }).join('')
      : '<p class="empty">—</p>';

    return `
      <section
        class="category category-${type}"
        data-category="${safe(cat.name)}"
      >
        <h2>${safe(cat.name)}</h2>
        ${items}
      </section>
    `;

  }).join('');
}

// Cambiar entre inglés y español.
document.querySelectorAll('[data-lang]').forEach(button => {

  button.addEventListener('click', () => {

    language = button.dataset.lang;

    document.querySelectorAll('[data-lang]').forEach(b => {
      b.classList.toggle('active', b === button);
    });

    if (window.balam) {
      draw();
    }

  });

});

// Iniciar el menú.
load();
