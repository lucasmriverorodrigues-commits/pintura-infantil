// app.js - versão com lata de tinta e melhorias

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

// Modo lata de tinta (fill)
function fillArea(x, y) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const targetColor = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3]})`;

  if (targetColor === currentColor) return; // Não pinta se for a mesma cor

  // Pintar área (simplificado)
  ctx.fillStyle = currentColor;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
}

// Pintura
function paint(e) {
  if (!painting) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);

  if (isFilling) {
    fillArea(x, y);
  } else {
    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

canvas.addEventListener('mousedown', (e) => {
  painting = true;
  const rect = canvas.getBoundingClientRect();
  lastX = (e.clientX - rect.left) * (canvas.width / rect.width);
  lastY = (e.clientY - rect.top) * (canvas.height / rect.height);
  paint(e);
});

canvas.addEventListener('mousemove', paint);
canvas.addEventListener('mouseup', () => painting = false);
canvas.addEventListener('mouseout', () => painting = false);

// Toque
canvas.addEventListener('touchstart', (e) => {
  painting = true;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  lastX = (touch.clientX - rect.left) * (canvas.width / rect.width);
  lastY = (touch.clientY - rect.top) * (canvas.height / rect.height);
  paint(e);
  e.preventDefault();
});
canvas.addEventListener('touchmove', (e) => {
  paint(e);
  e.preventDefault();
});
canvas.addEventListener('touchend', () => painting = false);

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
