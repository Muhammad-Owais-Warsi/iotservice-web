-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES & LOCATIONS
-- We start here because everything belongs to a company or location.
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    name TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS & PROFILES
-- We separate Auth (Supabase handles login) from Profiles (our app data).
-- Roles: 'admin', 'master', 'employee'
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID, -- Links to Supabase Auth User (optional if using external auth)
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT CHECK (role IN ('admin', 'master', 'employee')) NOT NULL,
    
    -- Hierarchy:
    company_id UUID REFERENCES companies(id), -- Admin/Master belongs to a company
    location_id UUID REFERENCES locations(id), -- Employee might belong to a specific location
    
    suspended BOOLEAN DEFAULT FALSE, -- Instead of deleting, we flip this switch
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DEVICES (IOT)
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id),
    name TEXT NOT NULL,
    type TEXT,
    
    -- Thresholds for anomalies
    temp_threshold DECIMAL,
    humidity_threshold DECIMAL,
    
    min_range DECIMAL, -- Generic min
    max_range DECIMAL, -- Generic max
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SENSOR DATA (Readings)
-- High volume table for incoming IoT data
CREATE TABLE sensor_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id),
    
    temperature DECIMAL,
    humidity DECIMAL,
    electricity DECIMAL,
    door_status TEXT, -- 'open', 'closed'
    
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ALERTS (Anomalies)
-- Tracks issues like "Door open too long" or "High Temp"
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id),
    location_id UUID REFERENCES locations(id),
    
    alert_type TEXT,
    message TEXT,
    severity TEXT CHECK (severity IN ('warning', 'critical')),
    
    status TEXT DEFAULT 'active', -- 'active', 'resolved'
    
    condition_started_at TIMESTAMP WITH TIME ZONE,
    escalation_level INTEGER DEFAULT 0, -- 0=None, 1=Master Notified, 2=Admin Notified
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TICKETS (Service Requests)
-- Detailed schema as requested
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Requestor Info
    created_by UUID REFERENCES user_profiles(id),
    
    -- Operational Details
    company_name TEXT,
    company_phone TEXT,
    company_email TEXT,
    brand_name TEXT,
    years_of_operation INTEGER,
    
    gst_number TEXT,
    billing_address TEXT,
    
    -- Equipment Details
    equipment_type TEXT,
    equipment_serial_no TEXT,
    capacity INTEGER,
    
    -- Location & Time
    location_name TEXT, -- Can also link to locations table if needed
    location_id UUID REFERENCES locations(id),
    visit_date TIMESTAMP WITH TIME ZONE,
    
    -- The Issue
    problem_statement TEXT,
    photos TEXT[], -- Array of strings (URLs)
    photo_spec_plate TEXT,
    
    -- POC (Point of Contact)
    poc_name TEXT,
    poc_phone TEXT,
    poc_email TEXT,
    
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'closed'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Initial Admin User (Example)
-- You can run this line to create your first admin profile manually.
-- width actual auth_user_id from Supabase Auth if needed.
-- INSERT INTO user_profiles (email, name, role, company_id) 
-- VALUES ('admin@cueron.com', 'Super Admin', 'admin', [COMPANY_ID]);
