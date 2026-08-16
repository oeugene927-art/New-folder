const itemList = document.getElementById('item-list');
const categoryFilter = document.getElementById('categoryFilter');
const listingForm = document.getElementById('listing-form');
const formMessage = document.getElementById('form-message');
const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function renderItems(items) {
  const category = categoryFilter ? categoryFilter.value : 'all';
  const filteredItems = category === 'all'
    ? items
    : items.filter((item) => item.category === category);

  if (!itemList) return;

  if (!filteredItems.length) {
    itemList.innerHTML = '<div class="item-card"><div class="item-body"><h3>No items yet</h3><p>Be the first seller to list something in this category.</p></div></div>';
    return;
  }

  itemList.innerHTML = filteredItems
    .map(
      (item) => `
        <article class="item-card">
          <div class="item-image" aria-label="${item.title}"></div>
          <div class="item-body">
            <div class="item-meta">
              <span class="item-category">${item.category}</span>
              <span>${item.condition}</span>
            </div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="meta-line">
              <span>By ${item.seller}</span>
              <span>${item.phone}</span>
            </div>
            <div class="item-bottom">
              <span class="price">${formatPrice(item.price)}</span>
              <span class="badge">Available</span>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

async function loadItems() {
  try {
    const response = await fetch('/api/items');
    const items = await response.json();
    renderItems(items);
  } catch (error) {
    if (itemList) {
      itemList.innerHTML = '<div class="item-card"><div class="item-body"><h3>Unable to load items</h3><p>Please try again later.</p></div></div>';
    }
  }
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', async () => {
    const response = await fetch('/api/items');
    const items = await response.json();
    renderItems(items);
  });
}

if (listingForm) {
  listingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(listingForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to list item');
      }

      formMessage.textContent = 'Item listed successfully!';
      formMessage.className = 'form-message success';
      listingForm.reset();
      await loadItems();
    } catch (error) {
      formMessage.textContent = error.message;
      formMessage.className = 'form-message error';
    }
  });
}

loadItems();
