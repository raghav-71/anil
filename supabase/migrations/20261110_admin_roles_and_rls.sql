-- ======================================================================================
-- MIGRATION: 20261110_admin_roles_and_rls.sql
-- PRODUCTION-GRADE OWNER-ONLY RBAC & ROW LEVEL SECURITY (RLS)
-- ANIL COMMUNICATION & ZEROX
-- ======================================================================================

-- 1. Standardize System Roles (Strict Two-Role Architecture: owner & customer)
INSERT INTO roles (name, description) VALUES
    ('owner', 'Sole Store Owner with full administrative, financial, and catalog authority'),
    ('customer', 'Verified Store Customer with shopping and self-account access only'),
    ('super_admin', 'Legacy Owner Alias - mapped to owner privileges'),
    ('admin', 'Legacy Admin Alias - mapped to owner privileges')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

-- 2. Enable Row Level Security (RLS) on Core Tables
ALTER TABLE IF EXISTS roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_movements ENABLE ROW LEVEL SECURITY;

-- 3. ROLES TABLE POLICIES
DROP POLICY IF EXISTS "Public read active roles" ON roles;
CREATE POLICY "Public read active roles" ON roles
    FOR SELECT USING (true);

-- 4. PROFILES TABLE POLICIES
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- Owner full access to all profiles
DROP POLICY IF EXISTS "Owner full access on profiles" ON profiles;
CREATE POLICY "Owner full access on profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN roles r ON p.role_id = r.id
            WHERE p.auth_user_id = auth.uid()
            AND r.name IN ('owner', 'super_admin', 'admin')
            AND p.is_active = true
        )
    );

-- Service role unrestricted access (Next.js server Route Handlers)
DROP POLICY IF EXISTS "Service role full access on profiles" ON profiles;
CREATE POLICY "Service role full access on profiles" ON profiles
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 5. PRODUCTS & CATALOG RLS POLICIES
-- Anyone can view active/published products
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true OR (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN roles r ON p.role_id = r.id
            WHERE p.auth_user_id = auth.uid()
            AND r.name IN ('owner', 'super_admin', 'admin')
            AND p.is_active = true
        )
    ));

-- Only owner can modify products
DROP POLICY IF EXISTS "Owner can modify products" ON products;
CREATE POLICY "Owner can modify products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN roles r ON p.role_id = r.id
            WHERE p.auth_user_id = auth.uid()
            AND r.name IN ('owner', 'super_admin', 'admin')
            AND p.is_active = true
        )
    );

-- 6. ORDERS RLS POLICIES
-- Customer can only see their own orders
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN roles r ON p.role_id = r.id
            WHERE p.auth_user_id = auth.uid()
            AND r.name IN ('owner', 'super_admin', 'admin')
            AND p.is_active = true
        )
    );

-- Owner has full management of all orders
DROP POLICY IF EXISTS "Owner can manage all orders" ON orders;
CREATE POLICY "Owner can manage all orders" ON orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            JOIN roles r ON p.role_id = r.id
            WHERE p.auth_user_id = auth.uid()
            AND r.name IN ('owner', 'super_admin', 'admin')
            AND p.is_active = true
        )
    );

-- 7. SECURE AUTH HOOK: NEVER TRUST CLIENT-SIDE USER METADATA FOR ADMIN ROLE
CREATE OR REPLACE FUNCTION public.handle_admin_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_owner_role_id UUID;
    v_customer_role_id UUID;
    v_is_owner BOOLEAN := false;
BEGIN
    SELECT id INTO v_owner_role_id FROM public.roles WHERE name = 'owner' LIMIT 1;
    IF v_owner_role_id IS NULL THEN
        SELECT id INTO v_owner_role_id FROM public.roles WHERE name = 'super_admin' LIMIT 1;
    END IF;

    SELECT id INTO v_customer_role_id FROM public.roles WHERE name = 'customer' LIMIT 1;

    -- ONLY elevate to owner if:
    -- 1) raw_app_meta_data has role = 'owner' (app_metadata CANNOT be set by public clients)
    -- OR 2) email strictly matches the pre-configured owner email
    IF (NEW.raw_app_meta_data->>'role' = 'owner' OR NEW.raw_app_meta_data->>'role' = 'super_admin')
       OR (LOWER(NEW.email) = 'admin@anilcommunications.com') THEN
        v_is_owner := true;
    END IF;

    IF v_is_owner THEN
        INSERT INTO public.profiles (auth_user_id, role_id, full_name, email, is_active)
        VALUES (
            NEW.id,
            v_owner_role_id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Shop Owner'),
            NEW.email,
            true
        )
        ON CONFLICT (auth_user_id) DO UPDATE
        SET role_id = v_owner_role_id, is_active = true, updated_at = NOW();
    ELSE
        -- ALL public registrations receive customer role only
        INSERT INTO public.profiles (auth_user_id, role_id, full_name, email, is_active)
        VALUES (
            NEW.id,
            v_customer_role_id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'),
            NEW.email,
            true
        )
        ON CONFLICT (auth_user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
