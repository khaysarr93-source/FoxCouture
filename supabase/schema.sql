-- ==============================================================================
-- FOXE'COUTURE — SCHÉMA DE BASE DE DONNÉES SUPABASE (PostgreSQL + RLS)
-- Conforme au Cahier des Charges Foxe'Couture (SenServices Technology / Tech Fox)
-- Application PWA de gestion d'atelier de couture / tailleur — Afrique
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'tailor', 'cutter', 'seller', 'viewer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE clothing_type AS ENUM (
        'grand_boubou_homme', 
        'boubou_femme', 
        'taille_basse', 
        'kaftan_homme', 
        'kaftan_femme', 
        'mariniere', 
        'ndokette', 
        'robe_senegalaise', 
        'costume_homme', 
        'robe_femme', 
        'tailleur_femme', 
        'chemise_homme', 
        'autre'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'devis', 
        'confirmee', 
        'en_coupe', 
        'en_assemblage', 
        'essayage', 
        'livree', 
        'annulee'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM (
        'especes', 
        'wave', 
        'orange_money', 
        'virement', 
        'cheque', 
        'carte'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE stock_unit AS ENUM (
        'metre', 
        'bobine', 
        'piece', 
        'paquet', 
        'kg'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE stock_movement_type AS ENUM (
        'entree', 
        'sortie', 
        'ajustement', 
        'retour'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABLES PRINCIPALES

-- 3.1 ORGANISATIONS (ATELIERS)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    phone TEXT,
    email TEXT,
    address TEXT,
    currency TEXT DEFAULT 'FCFA',
    logo_url TEXT,
    plan TEXT DEFAULT 'decouverte' CHECK (plan IN ('decouverte', 'essentiel', 'pro', 'entreprise')),
    trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.2 PROFILS UTILISATEURS (Liés à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'tailor',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.3 CLIENTS DE L'ATELIER
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    telephone TEXT NOT NULL,
    email TEXT,
    adresse TEXT,
    notes TEXT,
    avatar_color TEXT DEFAULT '#FF7A1A',
    photo_url TEXT,
    preferences JSONB DEFAULT '{"stylesFavoris": [], "tissusPreferes": [], "remarquesParticulieres": ""}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_org_tel ON public.clients (organization_id, telephone);
CREATE INDEX IF NOT EXISTS idx_clients_org_nom ON public.clients (organization_id, nom, prenom);

-- 3.4 MODÈLES DE MESURES STANDARDS (Gabarits africains)
CREATE TABLE IF NOT EXISTS public.measurement_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE, -- NULL = template global système
    clothing_type clothing_type NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    fields JSONB NOT NULL, -- Ex: [{"id": "epaule", "label": "Épaule", "unit": "cm", "required": true}]
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.5 FICHES DE MESURES CLIENTS
CREATE TABLE IF NOT EXISTS public.measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    clothing_type clothing_type NOT NULL,
    date_prise TIMESTAMPTZ DEFAULT now(),
    mensurations JSONB NOT NULL DEFAULT '{}'::jsonb, -- Ex: {"epaule": 48, "poitrine": 102, "longueur": 145}
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_measurements_client ON public.measurements(client_id);
CREATE INDEX IF NOT EXISTS idx_measurements_org ON public.measurements(organization_id);

-- 3.6 COMMANDES
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    reference TEXT NOT NULL, -- Ex: CMD-2026-0042
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
    measurement_id UUID REFERENCES public.measurements(id) ON DELETE SET NULL,
    clothing_type clothing_type NOT NULL,
    model_name TEXT NOT NULL,
    model_category TEXT DEFAULT 'homme' CHECK (model_category IN ('homme', 'femme', 'enfant')),
    model_image_url TEXT,
    fabric_name TEXT,
    fabric_provided_by_client BOOLEAN DEFAULT false,
    fabric_metrage NUMERIC(8,2) DEFAULT 0,
    status order_status DEFAULT 'devis',
    delivery_date TIMESTAMPTZ,
    fitting_date TIMESTAMPTZ,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    advance_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
    remaining_balance NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - advance_paid) STORED,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_org_status ON public.orders (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_org_client ON public.orders (organization_id, client_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON public.orders (delivery_date);

-- 3.7 LIGNES D'ARTICLES DE COMMANDE (Optionnel pour détail fin)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    designation TEXT NOT NULL,
    quantity NUMERIC(8,2) DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.8 HISTORIQUE DES CHANGEMENTS DE STATUT DE COMMANDE
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status order_status,
    new_status order_status NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.9 PAIEMENTS & RÈGLEMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    payment_type TEXT DEFAULT 'acompte' CHECK (payment_type IN ('acompte', 'solde', 'totalite', 'vente_directe')),
    amount NUMERIC(12,2) NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'especes',
    transaction_reference TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_org ON public.payments (organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments (order_id);

-- 3.10 SESSIONS DE CAISSE JOURNALIÈRE (POS)
CREATE TABLE IF NOT EXISTS public.cash_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    opening_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    closing_amount NUMERIC(12,2),
    actual_closing_amount NUMERIC(12,2),
    difference NUMERIC(12,2),
    opened_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    closed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    opened_at TIMESTAMPTZ DEFAULT now(),
    closed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    notes TEXT
);

-- 3.11 MOUVEMENTS DE CAISSE (Dépenses d'atelier & Entrées diverses)
CREATE TABLE IF NOT EXISTS public.cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.cash_sessions(id) ON DELETE SET NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('entree', 'sortie')),
    category TEXT NOT NULL, -- Ex: 'fournitures', 'loyer', 'electricite', 'salaire_journalier', 'the_cafe', 'autre'
    amount NUMERIC(12,2) NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'especes',
    reason TEXT NOT NULL,
    beneficiary TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    receipt_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.12 ARTICLES EN STOCK (Tissus & Fournitures mercerie)
CREATE TABLE IF NOT EXISTS public.stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- Ex: 'tissu', 'fil', 'bouton', 'fermeture', 'doublure'
    unit stock_unit DEFAULT 'metre',
    quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
    alert_threshold NUMERIC(10,2) NOT NULL DEFAULT 5,
    unit_purchase_price NUMERIC(12,2) DEFAULT 0,
    supplier_name TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.13 MOUVEMENTS DE STOCK
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    stock_item_id UUID NOT NULL REFERENCES public.stock_items(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    movement_type stock_movement_type NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(12,2),
    reason TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.14 NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'reminder'
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.15 ABONNEMENTS FOXE'COUTURE (SAAS)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'decouverte',
    status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled')),
    monthly_price NUMERIC(12,2) DEFAULT 0,
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ DEFAULT now(),
    current_period_end TIMESTAMPTZ,
    payment_provider TEXT, -- 'wave', 'orange_money', 'manual'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 4. FONCTIONS HELPER ET TRIGGERS
-- ==============================================================================

-- 4.1 Trigger mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_measurements_updated_at BEFORE UPDATE ON public.measurements FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER tr_stock_items_updated_at BEFORE UPDATE ON public.stock_items FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 4.2 Création automatique du profil lors de l'inscription Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    user_full_name TEXT;
    user_atelier_name TEXT;
BEGIN
    user_full_name := coalesce(NEW.raw_user_meta_data->>'full_name', 'Artisan Couturier');
    user_atelier_name := coalesce(NEW.raw_user_meta_data->>'atelier_name', 'Atelier ' || user_full_name);

    -- Création d'une nouvelle organisation (atelier) si premier utilisateur
    INSERT INTO public.organizations (name, phone, plan)
    VALUES (user_atelier_name, NEW.phone, 'decouverte')
    RETURNING id INTO new_org_id;

    -- Création du profil utilisateur lié
    INSERT INTO public.profiles (id, organization_id, full_name, phone, role)
    VALUES (NEW.id, new_org_id, user_full_name, NEW.phone, 'owner');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur sur auth.users (à activer si non existant)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4.3 Fonction helper pour récupérer l'organization_id de l'utilisateur courant (Sécurité RLS)
CREATE OR REPLACE FUNCTION public.get_current_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) — ISOLATION STRICTE PAR ATELIER
-- ==============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 5.1 Organisations
CREATE POLICY "Les membres peuvent voir leur organisation"
    ON public.organizations FOR SELECT
    USING (id = public.get_current_org_id());

CREATE POLICY "Les propriétaires peuvent modifier leur organisation"
    ON public.organizations FOR UPDATE
    USING (id = public.get_current_org_id() AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
    ));

-- 5.2 Profils
CREATE POLICY "Les membres de l'atelier voient les profils de leur atelier"
    ON public.profiles FOR SELECT
    USING (organization_id = public.get_current_org_id());

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- 5.3 Clients
CREATE POLICY "Accès clients par atelier"
    ON public.clients FOR ALL
    USING (organization_id = public.get_current_org_id())
    WITH CHECK (organization_id = public.get_current_org_id());

-- 5.4 Mesures
CREATE POLICY "Accès mesures par atelier"
    ON public.measurements FOR ALL
    USING (organization_id = public.get_current_org_id())
    WITH CHECK (organization_id = public.get_current_org_id());

-- 5.5 Templates de mesures
CREATE POLICY "Lecture templates globaux et atelier"
    ON public.measurement_templates FOR SELECT
    USING (organization_id IS NULL OR organization_id = public.get_current_org_id());

CREATE POLICY "Écriture templates par atelier"
    ON public.measurement_templates FOR ALL
    USING (organization_id = public.get_current_org_id())
    WITH CHECK (organization_id = public.get_current_org_id());

-- 5.6 Commandes & Lignes
CREATE POLICY "Accès commandes par atelier"
    ON public.orders FOR ALL
    USING (organization_id = public.get_current_org_id())
    WITH CHECK (organization_id = public.get_current_org_id());

CREATE POLICY "Accès lignes commandes par atelier"
    ON public.order_items FOR ALL
    USING (organization_id = public.get_current_org_id())
    WITH CHECK (organization_id = public.get_current_org_id());

CREATE POLICY "Accès historique statut par atelier"
    ON public.order_status_history FOR ALL
    USING (organization_id = public.get_current_org_id())
    WITH CHECK (organization_id = public.get_current_org_id());

-- 5.7 Paiements & Caisse
CREATE POLICY "Accès paiements par atelier"
    ON public.payments FOR ALL
    USING (organization_id = public.get_current_org_id())
    WITH CHECK (organization_id = public.get_current_org_id());

CREATE POLICY "Accès sessions caisse par atelier"
    ON public.cash_sessions FOR ALL
    USING (organization_id = public.get_current_org_id())
    WITH CHECK (organization_id = public.get_current_org_id());

CREATE POLICY "Accès mouvements caisse par atelier"
    ON public.cash_movements FOR ALL
    USING (organization_id = public.get_current_org_id())
    WITH CHECK (organization_id = public.get_current_org_id());

-- 5.8 Stocks
CREATE POLICY "Accès stock par atelier"
    ON public.stock_items FOR ALL
    USING (organization_id = public.get_current_org_id())
    WITH CHECK (organization_id = public.get_current_org_id());

CREATE POLICY "Accès mouvements stock par atelier"
    ON public.stock_movements FOR ALL
    USING (organization_id = public.get_current_org_id())
    WITH CHECK (organization_id = public.get_current_org_id());

-- 5.9 Notifications
CREATE POLICY "Accès notifications utilisateur"
    ON public.notifications FOR ALL
    USING (organization_id = public.get_current_org_id());

-- ==============================================================================
-- 6. GABARITS DE MESURES AFRICAINS INITIAUX (SEED)
-- ==============================================================================

INSERT INTO public.measurement_templates (organization_id, clothing_type, label, description, fields)
VALUES
(
    NULL,
    'grand_boubou_homme',
    'Grand Boubou Homme 3 Pièces',
    'Grand boubou traditionnel avec kaftan intérieur et pantalon (thiaya/pantalon droit)',
    '[
        {"id": "longueur_boubou", "label": "Longueur Boubou", "unit": "cm", "required": true},
        {"id": "envergure_manches", "label": "Envergure / Manches complètes", "unit": "cm", "required": true},
        {"id": "tour_col", "label": "Tour de cou / Col", "unit": "cm", "required": true},
        {"id": "epaule", "label": "Largeur Épaules", "unit": "cm", "required": true},
        {"id": "tour_poitrine", "label": "Tour de Poitrine", "unit": "cm", "required": true},
        {"id": "longueur_chemise", "label": "Longueur Kaftan intérieur", "unit": "cm", "required": true},
        {"id": "longueur_pantalon", "label": "Longueur Pantalon", "unit": "cm", "required": true},
        {"id": "tour_taille_pantalon", "label": "Ceinture / Tour de taille", "unit": "cm", "required": true},
        {"id": "tour_cuisse", "label": "Tour de Cuisse", "unit": "cm", "required": false},
        {"id": "bas_pantalon", "label": "Tour de cheville / Bas", "unit": "cm", "required": false}
    ]'::jsonb
),
(
    NULL,
    'taille_basse',
    'Taille Basse Sénégalaise (Femme)',
    'Ensemble féminin jupe/pagne avec haut ajusté et broderie',
    '[
        {"id": "epaule", "label": "Largeur Épaules", "unit": "cm", "required": true},
        {"id": "tour_poitrine", "label": "Tour de Poitrine", "unit": "cm", "required": true},
        {"id": "hauteur_poitrine", "label": "Hauteur Poitrine", "unit": "cm", "required": false},
        {"id": "tour_taille", "label": "Tour de Taille (Haut)", "unit": "cm", "required": true},
        {"id": "longueur_haut", "label": "Longueur du Haut", "unit": "cm", "required": true},
        {"id": "longueur_manche", "label": "Longueur Manche", "unit": "cm", "required": true},
        {"id": "tour_bras", "label": "Tour de Bras / Biceps", "unit": "cm", "required": true},
        {"id": "tour_bassin", "label": "Tour de Bassin / Hanches", "unit": "cm", "required": true},
        {"id": "longueur_jupe", "label": "Longueur Jupe / Pagne", "unit": "cm", "required": true}
    ]'::jsonb
),
(
    NULL,
    'kaftan_homme',
    'Kaftan Moderne / Demi-Saison',
    'Tenue homme 2 pièces stylée pour cérémonies ou vendredis',
    '[
        {"id": "epaule", "label": "Largeur Épaules", "unit": "cm", "required": true},
        {"id": "longueur_kaftan", "label": "Longueur Kaftan", "unit": "cm", "required": true},
        {"id": "tour_poitrine", "label": "Tour de Poitrine", "unit": "cm", "required": true},
        {"id": "longueur_manche", "label": "Longueur Manches", "unit": "cm", "required": true},
        {"id": "tour_poignet", "label": "Tour de Poignet", "unit": "cm", "required": false},
        {"id": "tour_col", "label": "Tour de Cou", "unit": "cm", "required": true},
        {"id": "longueur_pantalon", "label": "Longueur Pantalon", "unit": "cm", "required": true},
        {"id": "tour_taille", "label": "Tour de Taille", "unit": "cm", "required": true}
    ]'::jsonb
),
(
    NULL,
    'mariniere',
    'Robe Marinière / Ndokette',
    'Robe ample élégante en brodé, bazin ou soie',
    '[
        {"id": "epaule", "label": "Épaules", "unit": "cm", "required": true},
        {"id": "longueur_totale", "label": "Longueur Robe", "unit": "cm", "required": true},
        {"id": "tour_poitrine", "label": "Tour de Poitrine", "unit": "cm", "required": true},
        {"id": "longueur_manche", "label": "Longueur Manches", "unit": "cm", "required": true},
        {"id": "profondeur_col", "label": "Décolleté / Profondeur Col", "unit": "cm", "required": false}
    ]'::jsonb
),
(
    NULL,
    'costume_homme',
    'Costume Homme / Veste & Pantalon',
    'Coupe européenne classique ou ajustée',
    '[
        {"id": "epaule", "label": "Carrure Épaules", "unit": "cm", "required": true},
        {"id": "longueur_veste", "label": "Longueur Veste", "unit": "cm", "required": true},
        {"id": "tour_poitrine", "label": "Tour de Poitrine", "unit": "cm", "required": true},
        {"id": "tour_ventre", "label": "Tour de Ventre", "unit": "cm", "required": false},
        {"id": "longueur_manche", "label": "Longueur Manches", "unit": "cm", "required": true},
        {"id": "longueur_pantalon", "label": "Longueur Pantalon", "unit": "cm", "required": true},
        {"id": "tour_ceinture", "label": "Tour de Ceinture", "unit": "cm", "required": true},
        {"id": "bas_pantalon", "label": "Bas de Pantalon", "unit": "cm", "required": true}
    ]'::jsonb
)
ON CONFLICT DO NOTHING;
