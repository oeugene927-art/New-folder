const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'items.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '1mb' }));

function readItems() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeItems(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GradHive Market is running' });
});

app.get('/api/items', (req, res) => {
  res.json(readItems());
});

app.post('/api/items', (req, res) => {
  const { title, description, price, category, seller, phone, condition } = req.body;

  if (!title || !description || !price || !category || !seller) {
    return res.status(400).json({ message: 'Please complete all required fields.' });
  }

  const items = readItems();
  const newItem = {
    id: Date.now().toString(),
    title: title.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.trim(),
    seller: seller.trim(),
    phone: phone ? phone.trim() : 'Not shared',
    condition: condition ? condition.trim() : 'Good',
    createdAt: new Date().toISOString(),
  };

  items.unshift(newItem);
  writeItems(items);

  res.status(201).json(newItem);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GradHive Market running at http://localhost:${PORT}`);
});
