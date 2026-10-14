INSERT INTO categories (name) VALUES
    ('Electronics'),
    ('Office'),
    ('Kitchen'),
    ('Tools')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (name, sku, price, stock, category_id)
SELECT v.name, v.sku, v.price, v.stock, c.id
FROM (VALUES
    ('Wireless Mouse',     'ELE-001',  45000.00, 34, 'Electronics'),
    ('USB-C Cable 1m',     'ELE-002',  18000.00,  6, 'Electronics'),
    ('Bluetooth Speaker',  'ELE-003', 129000.00, 12, 'Electronics'),
    ('Laptop Stand',       'ELE-004',  72000.00,  3, 'Electronics'),
    ('A4 Paper Ream',      'OFF-001',  16500.00, 80, 'Office'),
    ('Ballpoint Pens x12', 'OFF-002',   9500.00, 45, 'Office'),
    ('Stapler',            'OFF-003',  14000.00,  8, 'Office'),
    ('Desk Organizer',     'OFF-004',  38000.00, 17, 'Office'),
    ('Ceramic Mug',        'KIT-001',  12000.00, 52, 'Kitchen'),
    ('Chef Knife 20cm',    'KIT-002',  89000.00,  9, 'Kitchen'),
    ('Cutting Board',      'KIT-003',  34000.00, 21, 'Kitchen'),
    ('Claw Hammer',        'TOO-001',  32000.00, 14, 'Tools'),
    ('Screwdriver Set',    'TOO-002',  47000.00,  5, 'Tools'),
    ('Tape Measure 5m',    'TOO-003',  15500.00, 29, 'Tools')
) AS v (name, sku, price, stock, category)
JOIN categories c ON c.name = v.category
ON CONFLICT (sku) DO NOTHING;
