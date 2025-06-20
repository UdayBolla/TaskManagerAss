const express=require("express");
const cors =require("cors");
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());


const DB_PATH = path.join(__dirname, 'storage.db');
const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(`Error connecting to database: ${err.message}`);
    
        process.exit(1);
    } else {
        console.log(`Connected to the SQLite database at ${DB_PATH}`);
        initializeDatabase();
    }
});

function initializeDatabase() {
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')),
            dueDate TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
        );
    `;

    db.run(createTableSql, (err) => {
        if (err) {
            console.error(`Error creating tasks table: ${err.message}`);
            process.exit(1); 
        } else {
            console.log('Tasks table checked/created.');
            
            db.get("SELECT COUNT(*) AS count FROM tasks", (err, row) => {
                if (err) {
                    console.error(`Error checking task count: ${err.message}`);
                } else if (row.count === 0) {
                    console.log('No tasks found. Inserting initial data...');
                    insertInitialTasks();
                } else {
                    console.log(`${row.count} tasks already exist.`);
                }
            });
        }
    });
}

function getCurrentTimestamp() {
    return new Date().toISOString();
}

function insertInitialTasks() {
    const initialTasks = [
        {
            id: 'a0eebc99-9c0b-4d43-8b6a-935a6b0c2a0c',
            title: 'Finish API documentation',
            description: 'Write clear and concise docs for all endpoints and data models.',
            status: 'in_progress',
            dueDate: '2025-07-01',
            createdAt: new Date('2025-06-15T10:00:00Z').toISOString(),
            updatedAt: new Date('2025-06-18T14:30:00Z').toISOString()
        },
        {
            id: 'b1c2d3e4-f5g6-7890-1234-567890abcdef',
            title: 'Prepare presentation for Q3',
            description: 'Create slides for the upcoming team meeting on Q3 goals.',
            status: 'todo',
            dueDate: '2025-06-30',
            createdAt: new Date('2025-06-17T09:00:00Z').toISOString(),
            updatedAt: new Date('2025-06-17T09:00:00Z').toISOString()
        },
        {
            id: 'c2d3e4f5-g6h7-8901-2345-67890abcdef0',
            title: 'Review new user authentication module',
            description: 'Perform a thorough code review for the latest user authentication features.',
            status: 'done',
            dueDate: null, 
            createdAt: new Date('2025-06-10T11:00:00Z').toISOString(),
            updatedAt: new Date('2025-06-12T16:00:00Z').toISOString()
        }
    ];

    const stmt = db.prepare(`
        INSERT INTO tasks (id, title, description, status, dueDate, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    db.serialize(() => { // Use serialize to ensure insertions happen in order
        initialTasks.forEach(task => {
            stmt.run(
                task.id,
                task.title,
                task.description,
                task.status,
                task.dueDate,
                task.createdAt,
                task.updatedAt,
                function(err) {
                    if (err) {
                        // Check for unique constraint violation on ID, ignore if it's just re-running
                        if (err.message.includes('UNIQUE constraint failed: tasks.id')) {
                            console.warn(`Initial task "${task.title}" with ID ${task.id} already exists.`);
                        } else {
                            console.error(`Error inserting initial task ${task.title}: ${err.message}`);
                        }
                    } else {
                        console.log(`Inserted initial task: ${task.title}`);
                    }
                }
            );
        });
        stmt.finalize();
        console.log('Initial task insertion process complete.');
    });
}


// --- API Routes ---

app.get('/', (req, res) => {
    res.send("Task API is Working!");
});

// GET all tasks
app.get('/tasks', (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) {
            console.error('Error fetching tasks:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.status(200).json(rows);
    });
});

// POST a new task
app.post('/tasks', (req, res) => {
    const { title, description, status, dueDate } = req.body;

    // Validation
    if (!title || !status) {
        return res.status(400).json({ message: 'Title and status are required.' });
    }

    const validStatuses = ['todo', 'in_progress', 'done'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const newTask = {
        id: uuidv4(),
        title,
        description: description || null, 
        status,
        dueDate: dueDate || null,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp()
    };

    db.run(`
        INSERT INTO tasks (id, title, description, status, dueDate, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        newTask.id,
        newTask.title,
        newTask.description,
        newTask.status,
        newTask.dueDate,
        newTask.createdAt,
        newTask.updatedAt
    ], function(err) {
        if (err) {
            console.error('Error creating task:', err.message);
            return res.status(500).json({ message: 'Error creating task.' });
        }

        res.status(201).json(newTask);
    });
});

// PUT (Update) a task by ID
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, status, dueDate } = req.body;
    const updatedAt = getCurrentTimestamp();

    
    if (!title || !status) {
        return res.status(400).json({ message: 'Title and status are required.' });
    }

    const validStatuses = ['todo', 'in_progress', 'done'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')} `});
    }

    const updateQuery = `
        UPDATE tasks
        SET title = ?, description = ?, status = ?, dueDate = ?, updatedAt = ?
        WHERE id = ?
    `;

    db.run(updateQuery, [title, description, status, dueDate, updatedAt, id], function(err) {
        if (err) {
            console.error('Error updating task:', err.message);
            return res.status(500).json({ message: 'Error updating task.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        return res.status(200).json({ message: 'Task updated successfully.' });
    });
});



app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;

    db.run("DELETE FROM tasks WHERE id = ?", [id], function(err) {
        if (err) {
            console.error('Error deleting task:', err.message);
            return res.status(500).json({ message: 'Error deleting task.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        res.status(204).send(); 
    });
});

const port = process.env.PORT || 9000;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`API endpoints:`);
    console.log(`  GET /`);
    console.log(`  GET /tasks`);
    console.log(`  POST /tasks`);
    console.log(`  PUT /tasks/:id`);
    console.log(`  DELETE /tasks/:id`);
});


process.on('SIGINT', () => {
    console.log('\nClosing database connection...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
