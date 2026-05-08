class GameOfLife {
    constructor(gridSize = 30) {
        this.gridSize = gridSize;
        this.grid = [];
        this.nextGrid = [];
        this.generation = 0;
        this.isRunning = false;
        this.speed = 50; // Doubled speed (halved delay)
        this.animationId = null;
        this.isMouseDown = false; // Verfolgung des Maus-Status
        this.shiftPressed = false; // Verfolgung der Shift-Taste
        this.soundEnabled = true; // Sound-Status
        
        // Conway's Game of Life patterns
        this.patterns = {
            blinker: [[0,0], [0,1], [0,2]],
            beacon: [[0,0], [0,1], [1,0], [1,1], [2,2], [2,3], [3,2], [3,3]],
            glider: [[0,1], [1,2], [2,0], [2,1], [2,2]]
        };
        
        // Audio Context für Sound-Effekte
        this.audioContext = null;
        this.oscillator = null;
        this.gainNode = null;
        
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.initializeAudio();
        this.initializeGrid();
        this.setupCanvas();
        this.setupEventListeners();
        this.draw();
    }
    
    initializeAudio() {
        // Initialisiert den Audio Context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            this.audioContext = new AudioContext();
        }
    }
    
    playSound(liveCells) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        // Berechne Frequenz basierend auf Anzahl lebender Zellen
        // Bereich: 200Hz (0 Zellen) bis 1000Hz (maximale Zellen)
        const maxCells = this.gridSize * this.gridSize;
        const frequency = 200 + (liveCells / maxCells) * 800;
        
        // Stoppe bestehenden Ton
        if (this.oscillator) {
            this.oscillator.stop();
        }
        
        // Erstelle neuen Oszillator
        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();
        
        this.oscillator.type = 'sine'; // Wellenform
        this.oscillator.frequency.value = frequency;
        
        // Lautstärke-Envelope
        this.gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        
        this.oscillator.start(this.audioContext.currentTime);
        this.oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    initializeGrid() {
        this.grid = [];
        for (let i = 0; i < this.gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                this.grid[i][j] = 0; // 0 = tot, 1 = lebendig
            }
        }
        this.nextGrid = JSON.parse(JSON.stringify(this.grid));
        this.generation = 0;
    }
    
    setupCanvas() {
        this.cellSize = Math.floor(Math.min(
            (window.innerWidth - 80) / this.gridSize,
            (window.innerHeight - 300) / this.gridSize,
            15
        ));
        
        this.canvas.width = this.gridSize * this.cellSize;
        this.canvas.height = this.gridSize * this.cellSize;
    }
    
    setupEventListeners() {
        // Canvas Click to toggle cells
        this.canvas.addEventListener('click', (e) => {
            if (this.isRunning) return; // Nicht während Simulation ändern
            
            const { row, col } = this.getRowColFromEvent(e);
            this.toggleCell(row, col);
        });
        
        // Canvas Mouse Down - Start der Maus-Aktivierung
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
        });
        
        // Canvas Mouse Up - Ende der Maus-Aktivierung
        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
        
        // Canvas Mouse Leave - Maus verlässt das Canvas
        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
        });
        
        // Canvas Mouse Move - Zellen beim Über-Fahren mit gedrückter Maustaste aktivieren
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isMouseDown || this.isRunning) return; // Nur wenn Maus gedrückt ist und Simulation nicht läuft
            
            const { row, col } = this.getRowColFromEvent(e);
            this.activateCell(row, col);
        });
        
        // Drag and Drop für Patterns
        this.setupPatternDragAndDrop();
    }
    
    setupPatternDragAndDrop() {
        // Pattern Button Drag Start
        Object.keys(this.patterns).forEach(patternName => {
            const btn = document.getElementById(patternName + 'Btn');
            if (btn) {
                btn.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', patternName);
                    e.dataTransfer.effectAllowed = 'copy';
                    btn.setAttribute('dragging', 'true');
                });
                
                btn.addEventListener('dragend', () => {
                    btn.removeAttribute('dragging');
                });
            }
        });
        
        // Canvas Drag Over
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        // Canvas Drop
        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const patternName = e.dataTransfer.getData('text/plain');
            if (patternName && this.patterns[patternName]) {
                const { row, col } = this.getRowColFromEvent(e);
                this.placePattern(patternName, row, col);
            }
        });
    }
    
    draw() {
        // Gitter zeichnen
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Gitternetz
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
        
        // Zellen zeichnen - Pink und Orange Gradient
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 1) {
                    // Alterniere zwischen Pink (#ff1493) und Orange (#ff8c00)
                    this.ctx.fillStyle = ((i + j) % 2 === 0) ? '#ff1493' : '#ff8c00';
                    this.ctx.fillRect(
                        j * this.cellSize + 1,
                        i * this.cellSize + 1,
                        this.cellSize - 2,
                        this.cellSize - 2
                    );
                }
            }
        }
        
        this.updateStats();
    }
    
    update() {
        this.nextGrid = JSON.parse(JSON.stringify(this.grid));
        
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const neighbors = this.countNeighbors(i, j);
                const isAlive = this.grid[i][j] === 1;
                
                // Conway's Game of Life Regeln
                if (isAlive && (neighbors === 2 || neighbors === 3)) {
                    this.nextGrid[i][j] = 1; // Zelle bleibt lebendig
                } else if (!isAlive && neighbors === 3) {
                    this.nextGrid[i][j] = 1; // Zelle wird lebendig
                } else {
                    this.nextGrid[i][j] = 0; // Zelle stirbt oder bleibt tot
                }
            }
        }
        
        this.grid = this.nextGrid;
        this.generation++;
        
        // Sound basierend auf lebenden Zellen abspielen
        const liveCells = this.getLiveCount();
        this.playSound(liveCells);
    }
    
    countNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const newRow = (row + i + this.gridSize) % this.gridSize;
                const newCol = (col + j + this.gridSize) % this.gridSize;
                
                count += this.grid[newRow][newCol];
            }
        }
        return count;
    }
    
    toggleCell(row, col) {
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            this.grid[row][col] = this.grid[row][col] === 0 ? 1 : 0;
            this.draw();
        }
    }
    
    activateCell(row, col) {
        // Aktiviert eine Zelle (setzt sie auf 1)
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            if (this.grid[row][col] === 0) {
                this.grid[row][col] = 1;
                this.draw();
            }
        }
    }
    
    placePattern(patternName, startRow, startCol) {
        if (!this.patterns[patternName] || this.isRunning) return;
        
        const pattern = this.patterns[patternName];
        let placed = false;
        
        pattern.forEach(([offsetRow, offsetCol]) => {
            const row = startRow + offsetRow;
            const col = startCol + offsetCol;
            
            if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
                this.grid[row][col] = 1;
                placed = true;
            }
        });
        
        if (placed) {
            this.draw();
        }
    }
    
    getRowColFromEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        return { row, col };
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop();
        }
    }
    
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.pause();
        this.initializeGrid();
        this.draw();
    }
    
    gameLoop = () => {
        if (this.isRunning) {
            this.update();
            this.draw();
            
            this.animationId = setTimeout(() => {
                requestAnimationFrame(this.gameLoop);
            }, this.speed);
        }
    }
    
    setSpeed(speed) {
        this.speed = 275 - speed; // Invertiert: höherer Slider-Wert = schneller (doubled speed)
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
    
    getLiveCount() {
        let count = 0;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 1) count++;
            }
        }
        return count;
    }
    
    updateStats() {
        document.getElementById('generation').textContent = this.generation;
        document.getElementById('liveCells').textContent = this.getLiveCount();
    }
}

// UI Setup
let game = null;

document.addEventListener('DOMContentLoaded', () => {
    game = new GameOfLife(30);
    
    // Button Events
    document.getElementById('startBtn').addEventListener('click', () => {
        game.start();
    });
    
    document.getElementById('pauseBtn').addEventListener('click', () => {
        game.pause();
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        game.reset();
    });
    
    document.getElementById('soundBtn').addEventListener('click', () => {
        const isEnabled = game.toggleSound();
        const btn = document.getElementById('soundBtn');
        btn.textContent = isEnabled ? '🔊 Sound An' : '🔇 Sound Aus';
        btn.classList.toggle('sound-off', !isEnabled);
    });
    
    // Speed Control
    document.getElementById('speed').addEventListener('input', (e) => {
        const speed = e.target.value;
        game.setSpeed(speed);
        document.getElementById('speedValue').textContent = speed + 'ms';
    });
    
    // Grid Size Change
    document.getElementById('gridSize').addEventListener('change', (e) => {
        const newSize = parseInt(e.target.value);
        game.pause();
        game = new GameOfLife(newSize);
    });
    
    // Verfolgung der Shift-Taste (optional für zukünftige Erweiterungen)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') {
            game.shiftPressed = true;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') {
            game.shiftPressed = false;
        }
    });
    
    // Responsive Canvas
    window.addEventListener('resize', () => {
        if (game) {
            const oldGrid = JSON.parse(JSON.stringify(game.grid));
            const oldGen = game.generation;
            game.setupCanvas();
            game.grid = oldGrid;
            game.generation = oldGen;
            game.draw();
        }
    });
});
