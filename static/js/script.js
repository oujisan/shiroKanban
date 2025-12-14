const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let socket;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDrawing = false;
let currentTool = 'brush';
let currentColor = '#000000';
let brushSize = 11;
let startX, startY;
let canvasSnapshot;
const floatingInput = document.getElementById('floatingInput');

function initSocket() {
    socket = io();
    
    socket.on('connect', () => console.log('Connected'));
    
    socket.on('load_history', (historyItem) => {
        historyItem.forEach(item => {
            if (item.type === 'draw') {
                drawFromData(item.data);
            } else if (item.type === 'shape') {
                drawShape(item.data);
            } else if (item.type === 'text') {
                const data = item.data;
                ctx.font = `${data.size * 2}px 'JetBrains Mono', monospace`;
                ctx.fillStyle = data.color;
                ctx.fillText(data.text, data.x, data.y);
            }
        });
    });

    socket.on('draw', (data) => drawFromData(data));
    
    socket.on('clear_canvas', () => {
        clearCanvas(); 
    });
    
    socket.on('add_text', (data) => {
        ctx.font = `${data.size * 2}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = data.color;
        ctx.fillText(data.text, data.x, data.y);
    });
    
    socket.on('add_shape', (data) => drawShape(data));
    
    socket.on('user_count', (data) => {
        document.getElementById('userCount').textContent = data.count;
    });
}

function startDrawing(e) {
    if (floatingInput.style.display === 'block' && e.target !== floatingInput) {
        finishText();
        return;
    }

    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    
    if (currentTool === 'text') {
        createFloatingInput(startX, startY);
        return;
    }
    
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    if (['rect', 'circle', 'arrow'].includes(currentTool)) {
        canvasSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'brush' || currentTool === 'eraser') {
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = brushSize * 2; 
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = currentColor;
        }
        
        ctx.lineTo(x, y);
        ctx.stroke();
        
        socket.emit('draw', {
            tool: currentTool,
            fromX: startX, fromY: startY, toX: x, toY: y,
            color: currentColor,
            size: brushSize
        });
        
        startX = x;
        startY = y;
    } 
    else if (['rect', 'circle', 'arrow'].includes(currentTool)) {
        ctx.putImageData(canvasSnapshot, 0, 0);
        drawShape({
            tool: currentTool,
            startX: startX, startY: startY, endX: x, endY: y,
            color: currentColor, size: brushSize
        });
    }
}

function stopDrawing(e) {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.globalCompositeOperation = 'source-over';
    
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    if (['rect', 'circle', 'arrow'].includes(currentTool)) {
        const shapeData = {
            tool: currentTool, startX, startY, endX, endY,
            color: currentColor, size: brushSize
        };
        drawShape(shapeData); 
        socket.emit('add_shape', shapeData);
    }
    ctx.beginPath();
}

function drawShape(data) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    const width = data.endX - data.startX;
    const height = data.endY - data.startY;
    ctx.beginPath();
    
    if (data.tool === 'rect') {
        ctx.strokeRect(data.startX, data.startY, width, height);
    } 
    else if (data.tool === 'circle') {
        const radius = Math.sqrt(width * width + height * height);
        ctx.arc(data.startX, data.startY, radius, 0, Math.PI * 2);
        ctx.stroke();
    } 
    else if (data.tool === 'arrow') {
        drawArrow(data.startX, data.startY, data.endX, data.endY);
    }
}

function drawArrow(fromX, fromY, toX, toY) {
    const headlen = 20 + (brushSize/2);
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function drawFromData(data) {
    if (data.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = data.size * 2;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.size;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(data.fromX, data.fromY);
    ctx.lineTo(data.toX, data.toY);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
}

function createFloatingInput(x, y) {
    floatingInput.style.display = 'block';
    floatingInput.style.left = x + 'px';
    floatingInput.style.top = y + 'px';
    floatingInput.style.fontSize = (brushSize * 2) + 'px'; 
    floatingInput.style.color = currentColor;
    floatingInput.value = '';
    floatingInput.focus();
    floatingInput.style.height = 'auto';
    floatingInput.style.width = 'auto';
}

function finishText() {
    if (floatingInput.style.display === 'none') return;
    const text = floatingInput.value;
    const x = parseInt(floatingInput.style.left);
    const y = parseInt(floatingInput.style.top) + parseInt(floatingInput.style.fontSize);

    if (text.trim() !== '') {
        ctx.font = floatingInput.style.fontSize + " 'JetBrains Mono', monospace";
        ctx.fillStyle = currentColor;
        ctx.fillText(text, x, y);
        socket.emit('add_text', {
            x: x, y: y, text: text, color: currentColor, size: brushSize
        });
    }
    floatingInput.style.display = 'none';
    floatingInput.value = '';
}

floatingInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        finishText();
    }
});

function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

function setTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = ''; 
        btn.classList.add('text-gray-600');
        btn.classList.remove('text-white');
    });
    
    const activeBtn = document.getElementById(`${tool}Btn`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.classList.remove('text-gray-600');
    }
}

function setColor(color, btn) {
    currentColor = color;
    document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
    if(btn) btn.classList.add('active');
    
    if (currentTool === 'eraser') setTool('brush');
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);

document.getElementById('brushBtn').addEventListener('click', () => setTool('brush'));
document.getElementById('eraserBtn').addEventListener('click', () => setTool('eraser'));
document.getElementById('textBtn').addEventListener('click', () => setTool('text'));
document.getElementById('rectBtn').addEventListener('click', () => setTool('rect'));
document.getElementById('circleBtn').addEventListener('click', () => setTool('circle'));
document.getElementById('arrowBtn').addEventListener('click', () => setTool('arrow'));

document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', (e) => setColor(e.target.dataset.color, e.target));
});

const brushSlider = document.getElementById('brushSize');
const sizeDisplay = document.getElementById('sizeDisplay');
brushSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    sizeDisplay.textContent = brushSize + 'px';
});

document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Hapus semua coretan?')) {
        clearCanvas();
        socket.emit('clear_canvas');
    }
});

window.addEventListener('resize', () => {
    const temp = ctx.getImageData(0,0,canvas.width, canvas.height);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.putImageData(temp, 0, 0);
});

canvas.style.backgroundColor = '#FFFFFF';
initSocket();