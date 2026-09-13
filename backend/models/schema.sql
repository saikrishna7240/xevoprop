CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    phone VARCHAR(20),

    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (
            role IN (
                'Buyer',
                'Seller',
                'Developer'
            )
        ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);