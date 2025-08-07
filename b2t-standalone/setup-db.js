const sqlite3 = require('sqlite3').verbose();

console.log('🔧 Configurando banco SQLite para B2T Exchange...');

const db = new sqlite3.Database('./b2t-data.db', (err) => {
    if (err) {
        console.error('❌ Erro ao criar database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Database criado: b2t-data.db');
        setupTables();
    }
});

function setupTables() {
    // Criar tabela de conteúdo do site
    db.run(`CREATE TABLE IF NOT EXISTS site_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section TEXT NOT NULL,
        field TEXT NOT NULL,
        content TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(section, field)
    )`, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela site_content:', err.message);
        } else {
            console.log('✅ Tabela site_content criada');
            insertDefaultContent();
        }
    });
}

function insertDefaultContent() {
    const defaultContent = [
        // Hero Section
        { section: 'hero', field: 'title', content: 'Institutional Digital Asset Trading' },
        { section: 'hero', field: 'subtitle', content: 'Advanced trading technology and deep liquidity for institutional clients across digital assets.' },
        
        // Stats
        { section: 'stats', field: 'daily_volume', content: '$2.5B+' },
        { section: 'stats', field: 'clients', content: '600+' },
        { section: 'stats', field: 'uptime', content: '99.9%' },
        { section: 'stats', field: 'assets', content: '50+' },
        
        // Solutions
        { section: 'solutions', field: 'title', content: 'Institutional Solutions' },
        { section: 'solutions', field: 'subtitle', content: 'Comprehensive digital asset trading solutions built for institutional needs' },
        
        // News
        { section: 'news', field: 'title', content: 'Latest News' },
        { section: 'news', field: 'subtitle', content: 'Stay updated with our latest developments and market insights' },
        
        // Insights
        { section: 'insights', field: 'title', content: 'Institutional Insights' },
        { section: 'insights', field: 'subtitle', content: 'Expert analysis and market intelligence for institutional investors' },
        
        // Subscribe
        { section: 'subscribe', field: 'title', content: 'Subscribe' },
        { section: 'subscribe', field: 'subtitle', content: 'Sign up to our news alerts to receive our regular newsletter and institutional insights.' }
    ];

    const stmt = db.prepare("INSERT OR IGNORE INTO site_content (section, field, content) VALUES (?, ?, ?)");
    
    let insertCount = 0;
    defaultContent.forEach(item => {
        stmt.run(item.section, item.field, item.content, function(err) {
            if (!err && this.changes > 0) {
                insertCount++;
            }
        });
    });
    
    stmt.finalize((err) => {
        if (err) {
            console.error('❌ Erro ao inserir dados:', err.message);
        } else {
            console.log(`✅ ${insertCount} itens de conteúdo inseridos`);
            console.log('🚀 Setup concluído! Execute "npm start" para iniciar o servidor.');
        }
        
        db.close((err) => {
            if (err) {
                console.error('❌ Erro ao fechar database:', err.message);
            } else {
                console.log('✅ Database configurado com sucesso!');
            }
        });
    });
}