// app.js - versão final com flood fill e zoom com dois dedos

const imageFiles = [
  'images/beija_flor.jpg',
  'images/casinha_de_madeira.jpg',
  'images/escalada.jpg',
  'images/irrigando_flores.jpg',
  'images/jardim_flores.jpg',
  'images/lagoa_dos_sapos.jpg',
  'images/montanha.jpg',
  'images/mundo_dos_duendes.jpg'
];

let currentColor = '#FF5733';
let painting = false;
let brushSize = 8;
let isFilling = false; // Modo lata de tinta
let lastX = 0;
let lastY = 0;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gallery = document.getElementById('gallery');
const clearBtn = document.getElementById('clear');
const saveBtn = document.getElementById('save');
const canvasContainer = document.getElementById('canvas-container');

// Zoom
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isPinching = false;

function formatName(filename) {
  return filename
    .replace('images/', '')
    .replace('.jpg', '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Carregar galeria
imageFiles.forEach(src => {
  const img = document.createElement('img');
  img.src = src;
  img.alt = formatName(src);
  img.addEventListener('click', () => loadDrawing(src));
  gallery.appendChild(img);
});

function loadDrawing(src) {
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.onerror = () => {
    alert(`Erro ao carregar: ${formatName(src)}\nVerifique se o arquivo existe.`);
    console.error('❌ Erro ao carregar:', src);
  };
  img.src = src;
}

// Cores
document.querySelectorAll('.color').forEach(btn => {
  btn.addEventListener('click', () => {
    currentColor = btn.dataset.color;
    isFilling = false; // Sai do modo lata de tinta
  });
});

// Espessura
document.querySelectorAll('.thickness').forEach(btn => {
  btn.addEventListener('click', () => {
    brushSize = parseInt(btn.dataset.size);
    isFilling = false; // Sai do modo lata de tinta
  });
});

// Flood Fill (lata de tinta)
function floodFill(x, y, targetColor, fillColor) {
  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixelIndex = (y * canvas.width + x) * 4;

  const r = imageData.data[pixelIndex];
  const g = imageData.data[pixelIndex + 1];
  const b = imageData.data[pixelIndex + 2];
  const a = imageData.data[pixelIndex + 3];

  const currentColor = `rgba(${r}, ${g}, ${b}, ${a})`;

  if (currentColor === targetColor) return;

  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, 1, 1);

  floodFill(x + 1, y, targetColor, fillColor);
  floodFill(x - 1, y, targetColor, fillColor);
  floodFill(x, y + 1, targetColor, fillColor);
  floodFill(x, y - 1, targetColor, fillColor);
}

// Pintura
function paint(e) {
  if (!painting) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
  const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

  if (isFilling) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelIndex = (y * canvas.width + x) * 4;
    const r = imageData.data[pixelIndex];
    const g = imageData.data[pixelIndex + 1];
    const b = imageData.data[pixelIndex + 2];
    const a = imageData.data[pixelIndex + 3];
    const targetColor = `rgba(${r}, ${g}, ${b}, ${a})`;

    if (targetColor !== currentColor) {
      floodFill(x, y, targetColor, currentColor);
    }
  } else {
    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Mouse
canvas.addEventListener('mousedown', (e) => {
  painting = true;
  lastX = e.clientX;
  lastY = e.clientY;
  paint(e);
});

canvas.addEventListener('mousemove', paint);
canvas.addEventListener('mouseup', () => painting = false);
canvas.addEventListener('mouseout', () => painting = false);

// Toque
canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    painting = true;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastX = touch.clientX;
    lastY = touch.clientY;
    paint(e);
    e.preventDefault();
  } else if (e.touches.length === 2) {
    isPinching = true;
    e.preventDefault();
  }
});

canvas.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1 && !isPinching) {
    paint(e);
    e.preventDefault();
  } else if (e.touches.length === 2) {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (lastDistance) {
      const delta = distance / lastDistance;
      scale = Math.max(0.5, Math.min(3, scale * delta));
      applyTransform();
    }

    lastDistance = distance;
    e.preventDefault();
  }
});

canvas.addEventListener('touchend', (e) => {
  if (e.touches.length === 0) {
    painting = false;
    isPinching = false;
    lastDistance = null;
  }
});

// Zoom com mouse wheel
canvasContainer.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  scale = Math.max(0.5, Math.min(3, scale * delta));

  const rect = canvasContainer.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const newOffsetX = mouseX - (mouseX - offsetX) * delta;
  const newOffsetY = mouseY - (mouseY - offsetY) * delta;

  offsetX = newOffsetX;
  offsetY = newOffsetY;

  applyTransform();
});

function applyTransform() {
  canvas.style.transform = `scale(${scale}) translate(${offsetX}px, ${offsetY}px)`;
  canvas.style.transformOrigin = '0 0';
}

// Botões
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Recarrega a imagem original se houver
  if (backgroundImage) {
    loadDrawing(backgroundImage.src);
  }
});

saveBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'minha_pintura.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Botão de lata de tinta (opcional)
const fillBtn = document.createElement('button');
fillBtn.id = 'fill';
fillBtn.textContent = 'Lata de Tinta';
fillBtn.style.margin = '0 8px';
fillBtn.style.padding = '10px 18px';
fillBtn.style.border = 'none';
fillBtn.style.borderRadius = '10px';
fillBtn.style.background = '#ffb703';
fillBtn.style.color = 'white';
fillBtn.style.cursor = 'pointer';
fillBtn.style.boxShadow = '0 3px 5px rgba(0,0,0,0.2)';
fillBtn.addEventListener('click', () => {
  isFilling = true;
  alert('Modo lata de tinta ativado. Clique em uma área para pintar.');
});

// Adiciona o botão ao final da seção de ações
document.querySelector('#actions').appendChild(fillBtn);

// Variáveis auxiliares para zoom
let lastDistance = null;
