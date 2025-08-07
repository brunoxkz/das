const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/images-b2t', express.static(path.join(__dirname, 'public/images-b2t')));
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar banco SQLite
const db = new sqlite3.Database('./b2t-data.db', (err) => {
    if (err) {
        console.error('❌ Erro ao conectar SQLite:', err.message);
    } else {
        console.log('✅ SQLite conectado: b2t-data.db');
        initializeDatabase();
    }
});

// Criar tabelas se não existirem
function initializeDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS site_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL,
        field TEXT NOT NULL,
        content TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela:', err.message);
        } else {
            console.log('✅ Tabela site_content criada/verificada');
        }
    });

    // Inserir dados padrão se não existirem
    db.get("SELECT COUNT(*) as count FROM site_content", (err, row) => {
        if (err) {
            console.error('❌ Erro ao verificar dados:', err.message);
        } else if (row.count === 0) {
            insertDefaultContent();
        }
    });
}

// Inserir conteúdo padrão
function insertDefaultContent() {
    const defaultContent = [
        { section: 'hero', field: 'title', content: 'Institutional Digital Asset Trading' },
        { section: 'hero', field: 'subtitle', content: 'Advanced trading technology and deep liquidity for institutional clients' },
        { section: 'news', field: 'title', content: 'Latest News' },
        { section: 'insights', field: 'title', content: 'Institutional Insights' }
    ];

    const stmt = db.prepare("INSERT INTO site_content (section, field, content) VALUES (?, ?, ?)");
    
    defaultContent.forEach(item => {
        stmt.run(item.section, item.field, item.content);
    });
    
    stmt.finalize();
    console.log('✅ Conteúdo padrão inserido');
}

// API Routes
app.get('/api/content/:section', (req, res) => {
    const section = req.params.section;
    
    db.all("SELECT * FROM site_content WHERE section = ?", [section], (err, rows) => {
        if (err) {
            console.error('❌ Erro ao buscar conteúdo:', err.message);
            res.status(500).json({ error: 'Erro interno do servidor' });
        } else {
            const content = {};
            rows.forEach(row => {
                content[row.field] = row.content;
            });
            res.json(content);
        }
    });
});

app.post('/api/content/:section/:field', (req, res) => {
    const { section, field } = req.params;
    const { content } = req.body;
    
    db.run(`INSERT OR REPLACE INTO site_content (section, field, content, updated_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)`, 
            [section, field, content], function(err) {
        if (err) {
            console.error('❌ Erro ao salvar conteúdo:', err.message);
            res.status(500).json({ error: 'Erro ao salvar conteúdo' });
        } else {
            console.log('✅ Conteúdo salvo:', section, field);
            res.json({ success: true, id: this.lastID });
        }
    });
});

// Rota principal - servir o site B2T
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'SQLite Connected'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('🚀 B2T Exchange Server iniciado!');
    console.log(`📡 Servidor rodando em: http://localhost:${PORT}`);
    console.log(`🎯 Site: http://localhost:${PORT}/`);
    console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
    console.log(`💾 Database: SQLite (b2t-data.db)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('❌ Erro ao fechar database:', err.message);
        } else {
            console.log('✅ Database fechado');
        }
        process.exit(0);
    });
});