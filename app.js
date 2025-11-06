// app.js - versão final e funcional

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
let isDrawing = false;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gallery = document.getElementById('gallery');
const clearBtn = document.getElementById('clear');
const saveBtn = document.getElementById('save');
const canvasContainer = document.getElementById('canvas-container');

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
  img.title = formatName(src);
  img.addEventListener('click', () => loadDrawing(src));
  gallery.appendChild(img);
});

function loadDrawing(src) {
  const img = new Image();
  img.onload = () => {
    // Ajusta canvas ao tamanho da imagem
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
  btn.addEventListener('click', () => currentColor = btn.dataset.color);
});

// Espessura
document.querySelectorAll('.thickness').forEach(btn => {
  btn.addEventListener('click', () => {
    brushSize = parseInt(btn.dataset.size);
    document.querySelectorAll('.thickness').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Pintura
function startPaint(e) {
  painting = true;
  paint(e);
}

function stopPaint() {
  painting = false;
  ctx.beginPath();
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  return { x, y };
}

function paint(e) {
  if (!painting) return;
  const pos = 'touches' in e ? getPos(e.touches[0]) : getPos(e);
  ctx.fillStyle = currentColor;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, brushSize, 0, Math.PI * 2);
  ctx.fill();
}

canvas.addEventListener('mousedown', startPaint);
canvas.addEventListener('mousemove', paint);
canvas.addEventListener('mouseup', stopPaint);
canvas.addEventListener('mouseout', stopPaint);

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startPaint(e.touches[0]);
});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  paint(e.touches[0]);
});
canvas.addEventListener('touchend', stopPaint);

// Botões
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Recarrega a imagem original se houver
  if (backgroundImage) {
    loadDrawing(backgroundImage.src);
  }
});

saveBtn.addEventListener