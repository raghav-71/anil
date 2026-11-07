-- ======================================================================================
-- ANIL COMMUNICATIONS: ENTERPRISE MOBILE STORE & POS BILLING MANAGEMENT SYSTEM
-- PostgreSQL Database Migration: 34 Normalized Tables, RLS, Concurrency Triggers & Indexes
-- ======================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'super_admin', 'manager', 'cashier', 'customer'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'pos.checkout', 'inventory.adjust', 'reports.view'
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROLE_PERMISSIONS JUNCTION
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 3. PROFILES (Staff & Customers)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE, -- references Supabase auth.users(id) if enabled
    role_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BRANDS
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) UNIQUE NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    short_description TEXT,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL,
    mrp NUMERIC(12, 2) NOT NULL,
    hsn_code VARCHAR(20) DEFAULT '85171300', -- Default Indian HSN for smartphones
    gst_rate NUMERIC(5, 2) DEFAULT 18.00,   -- Default 18% GST
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    warranty_summary VARCHAR(255) DEFAULT '1 Year Manufacturer Warranty for Device and 6 Months for In-Box Accessories',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCT_VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(100),
    color_code VARCHAR(30), -- Hex color code e.g. #000000
    ram VARCHAR(50),        -- e.g. '8GB', '12GB'
    storage VARCHAR(50),    -- e.g. '128GB', '256GB'
    additional_price NUMERIC(12, 2) DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRODUCT_IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    gstin VARCHAR(50),
    loyalty_points INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street_address TEXT NOT NULL,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    gstin VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    payment_terms VARCHAR(100) DEFAULT 'Net 30',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PURCHASES (Stock Inward Bills)
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
    purchase_invoice_no VARCHAR(100) NOT NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_total NUMERIC(12, 2) NOT NULL,
    grand_total NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'paid', -- 'paid', 'partial', 'unpaid'
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PURCHASE_ITEMS
CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    tax_amount NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL
);

-- 14. INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID UNIQUE REFERENCES product_variants(id) ON DELETE CASCADE,
    available_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    damaged_quantity INT NOT NULL DEFAULT 0,
    shelf_location VARCHAR(100) DEFAULT 'Main Rack A1',
    last_counted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. INVENTORY_MOVEMENTS (Audit Ledger of all stock changes)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- 'pos_sale', 'online_order', 'purchase_inward', 'adjustment_add', 'adjustment_reduce', 'damage', 'return_restock'
    quantity_change INT NOT NULL,      -- Positive or negative integer
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    reference_id UUID,                -- pos_transaction_id or order_id or purchase_id
    reference_type VARCHAR(50),
    notes TEXT,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. CARTS
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CART_ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (cart_id, variant_id)
);

-- 18. ORDERS (E-Commerce Web Orders)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    shipping_fee NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL,
    grand_total NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'razorpay', 'cod'
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    variant_details VARCHAR(255),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    tax_amount NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

-- 20. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    pos_transaction_id UUID,
    provider VARCHAR(50) NOT NULL, -- 'razorpay', 'cash', 'upi', 'card', 'split'
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'completed', 'failed', 'pending', 'refunded'
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. PAYMENT_TRANSACTIONS (Gateway signatures & audit payloads)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    gateway_order_id VARCHAR(150),
    gateway_payment_id VARCHAR(150),
    gateway_signature VARCHAR(255),
    raw_payload JSONB,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. INVOICES (Official GST & POS Tax Invoices)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL, -- AC-2026-0001
    invoice_type VARCHAR(20) DEFAULT 'b2c',      -- 'b2c', 'b2b'
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    pos_transaction_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_gstin VARCHAR(50),
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    cgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    sgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    igst_amount NUMERIC(12, 2) DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL,
    amount_received NUMERIC(12, 2) NOT NULL,
    change_returned NUMERIC(12, 2) DEFAULT 0.00,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. INVOICE_ITEMS
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    hsn_code VARCHAR(20) DEFAULT '85171300',
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    taxable_value NUMERIC(12, 2) NOT NULL,
    cgst_rate NUMERIC(5, 2) DEFAULT 9.00,
    cgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    sgst_rate NUMERIC(5, 2) DEFAULT 9.00,
    sgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    igst_rate NUMERIC(5, 2) DEFAULT 0.00,
    igst_amount NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL
);

-- 24. POS_SESSIONS
CREATE TABLE IF NOT EXISTS pos_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cashier_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    opening_cash NUMERIC(12, 2) DEFAULT 0.00,
    closing_cash NUMERIC(12, 2),
    actual_cash NUMERIC(12, 2),
    total_sales NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed'
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- 25. POS_TRANSACTIONS
CREATE TABLE IF NOT EXISTS pos_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES pos_sessions(id) ON DELETE RESTRICT,
    cashier_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL,
    grand_total NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'cash', 'upi', 'card', 'split'
    cash_tendered NUMERIC(12, 2) DEFAULT 0.00,
    change_due NUMERIC(12, 2) DEFAULT 0.00,
    split_details JSONB,
    status VARCHAR(50) DEFAULT 'completed', -- 'completed', 'cancelled', 'refunded'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. POS_TRANSACTION_ITEMS
CREATE TABLE IF NOT EXISTS pos_transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pos_transaction_id UUID REFERENCES pos_transactions(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL
);

-- 27. RETURNS
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_number VARCHAR(50) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    pos_transaction_id UUID REFERENCES pos_transactions(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'refunded'
    refund_amount NUMERIC(12, 2) NOT NULL,
    handled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. RETURN_ITEMS
CREATE TABLE IF NOT EXISTS return_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    condition VARCHAR(50) DEFAULT 'restockable', -- 'restockable', 'damaged'
    refund_subtotal NUMERIC(12, 2) NOT NULL
);

-- 29. DISCOUNTS
CREATE TABLE IF NOT EXISTS discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    discount_type VARCHAR(50) NOT NULL, -- 'percentage', 'flat'
    value NUMERIC(10, 2) NOT NULL,
    applies_to VARCHAR(50) NOT NULL, -- 'category', 'brand', 'product'
    target_id UUID,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ
);

-- 30. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'flat'
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_value NUMERIC(12, 2) DEFAULT 0.00,
    max_discount NUMERIC(12, 2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_to TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 32. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'low_stock', 'new_order', 'payment_success'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 33. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 34. SHOP_SETTINGS (Key-Value configuration for Shop branding, GST & Thermal Printer)
CREATE TABLE IF NOT EXISTS shop_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================================================
-- INDEXES FOR ULTRA-FAST LOOKUPS & POS BARCODE SCANNING
-- ======================================================================================
CREATE INDEX IF NOT EXISTS idx_product_variants_barcode ON product_variants(barcode);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_variant ON inventory_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_session ON pos_transactions(session_id);

-- ======================================================================================
-- ATOMIC CONCURRENCY-SAFE STOCK UPDATE FUNCTION & TRIGGERS
-- ======================================================================================
CREATE OR REPLACE FUNCTION atomic_decrement_stock(
    p_variant_id UUID,
    p_quantity INT,
    p_movement_type VARCHAR(50),
    p_reference_id UUID,
    p_reference_type VARCHAR(50),
    p_actor_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_stock INT;
    v_new_stock INT;
BEGIN
    -- Acquire exclusive row-level lock on inventory to eliminate race conditions
    SELECT available_quantity INTO v_current_stock
    FROM inventory
    WHERE variant_id = p_variant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory record for variant % not found', p_variant_id;
    END IF;

    IF v_current_stock < p_quantity THEN
        RETURN FALSE; -- Insufficient stock!
    END IF;

    v_new_stock := v_current_stock - p_quantity;

    -- Update inventory
    UPDATE inventory
    SET available_quantity = v_new_stock,
        updated_at = NOW()
    WHERE variant_id = p_variant_id;

    -- Update product_variants mirror
    UPDATE product_variants
    SET stock_quantity = v_new_stock
    WHERE id = p_variant_id;

    -- Log movement
    INSERT INTO inventory_movements (
        variant_id,
        movement_type,
        quantity_change,
        previous_quantity,
        new_quantity,
        reference_id,
        reference_type,
        performed_by
    ) VALUES (
        p_variant_id,
        p_movement_type,
        -p_quantity,
        v_current_stock,
        v_new_stock,
        p_reference_id,
        p_reference_type,
        p_actor_id
    );

    RETURN TRUE;
END;
$$;

