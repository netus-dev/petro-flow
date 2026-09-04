-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  email text,
  job_position text,
  phone text,
  is_active boolean,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT fk_user_company FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  name text NOT NULL UNIQUE,
  is_custom boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT permissions_pkey PRIMARY KEY (id),
  CONSTRAINT permissions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_custom boolean DEFAULT true,
  company_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id),
  CONSTRAINT roles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id uuid DEFAULT gen_random_uuid(),
  permission_id uuid DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT role_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  role_id uuid DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
CREATE TABLE public.functional_principles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  property_1 character varying,
  property_2 character varying,
  property_3 character varying,
  property_4 character varying,
  property_5 character varying,
  property_6 character varying,
  property_7 character varying,
  property_8 character varying,
  property_9 character varying,
  property_10 character varying,
  property_11 character varying,
  property_12 character varying,
  property_13 character varying,
  property_14 character varying,
  property_15 character varying,
  property_16 character varying,
  property_17 character varying,
  property_18 character varying,
  property_19 character varying,
  property_20 character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  scope_id uuid NOT NULL,
  CONSTRAINT functional_principles_pkey PRIMARY KEY (id),
  CONSTRAINT fk_functional_principle_company FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT functional_principles_scope_id_fkey FOREIGN KEY (scope_id) REFERENCES public.functional_principle_scopes(id)
);
CREATE TABLE public.wells (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NOT NULL,
  CONSTRAINT wells_pkey PRIMARY KEY (id),
  CONSTRAINT fk_well_company FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NOT NULL,
  CONSTRAINT suppliers_pkey PRIMARY KEY (id),
  CONSTRAINT fk_supplier_company FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.ubications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  allow_multi_assets boolean NOT NULL DEFAULT false,
  CONSTRAINT ubications_pkey PRIMARY KEY (id),
  CONSTRAINT fk_ubication_company FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  type USER-DEFINED NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NOT NULL,
  CONSTRAINT locations_pkey PRIMARY KEY (id),
  CONSTRAINT fk_location_company FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.rigs (
  id uuid NOT NULL,
  current_well_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rigs_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rigs_location_id FOREIGN KEY (id) REFERENCES public.locations(id),
  CONSTRAINT fk_rigs_well_id FOREIGN KEY (current_well_id) REFERENCES public.wells(id)
);
CREATE TABLE public.operating_bases (
  id uuid NOT NULL,
  supplier_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT operating_bases_pkey PRIMARY KEY (id),
  CONSTRAINT fk_operating_bases_location_id FOREIGN KEY (id) REFERENCES public.locations(id),
  CONSTRAINT fk_operating_bases_supplier_id FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id)
);
CREATE TABLE public.assets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  brand_id uuid,
  model_id uuid,
  capacity character varying,
  serial_number character varying NOT NULL,
  last_inspection_code character varying NOT NULL,
  status USER-DEFINED NOT NULL,
  function_principle_id uuid NOT NULL,
  current_location_id uuid NOT NULL,
  current_ubication_id uuid NOT NULL,
  property_1 character varying,
  property_2 character varying,
  property_3 character varying,
  property_4 character varying,
  property_5 character varying,
  property_6 character varying,
  property_7 character varying,
  property_8 character varying,
  property_9 character varying,
  property_10 character varying,
  property_11 integer,
  property_12 integer,
  property_13 integer,
  property_14 integer,
  property_15 integer,
  property_16 double precision,
  property_17 double precision,
  property_18 double precision,
  property_19 double precision,
  property_20 double precision,
  company_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT assets_pkey PRIMARY KEY (id),
  CONSTRAINT asset_functional_principle_id FOREIGN KEY (function_principle_id) REFERENCES public.functional_principles(id),
  CONSTRAINT asset_location_id FOREIGN KEY (current_location_id) REFERENCES public.locations(id),
  CONSTRAINT asset_ubication_id FOREIGN KEY (current_ubication_id) REFERENCES public.ubications(id),
  CONSTRAINT fk_asset_brand FOREIGN KEY (brand_id) REFERENCES public.brands(id),
  CONSTRAINT fk_asset_model FOREIGN KEY (model_id) REFERENCES public.models(id),
  CONSTRAINT assets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  origin_location_id uuid NOT NULL,
  destination_location_id uuid NOT NULL,
  date timestamp with time zone NOT NULL,
  justification text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  type USER-DEFINED NOT NULL DEFAULT 'transfer'::transaction_type,
  origin_ubication_id uuid NOT NULL,
  destination_ubication_id uuid NOT NULL,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT fk_origin_location FOREIGN KEY (origin_location_id) REFERENCES public.locations(id),
  CONSTRAINT fk_destination_location FOREIGN KEY (destination_location_id) REFERENCES public.locations(id),
  CONSTRAINT fk_transaction_creator FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT transactions_origin_ubication_id_fkey FOREIGN KEY (origin_ubication_id) REFERENCES public.ubications(id),
  CONSTRAINT transactions_destination_ubication_id_fkey FOREIGN KEY (destination_ubication_id) REFERENCES public.ubications(id)
);
CREATE TABLE public.transaction_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  comments text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT transaction_details_pkey PRIMARY KEY (id),
  CONSTRAINT fk_transaction_details_transaction FOREIGN KEY (transaction_id) REFERENCES public.transactions(id),
  CONSTRAINT fk_transaction_details_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id)
);
CREATE TABLE public.assets_certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL,
  certificate_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT assets_certificates_pkey PRIMARY KEY (id),
  CONSTRAINT fk_certificates_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id),
  CONSTRAINT fk_asset_certificate FOREIGN KEY (certificate_id) REFERENCES public.certificates(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  description text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  comments text,
  previous_task_id uuid,
  next_task_id uuid,
  created_by uuid NOT NULL,
  rig_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::task_status,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT fk_tasks_previous_task FOREIGN KEY (previous_task_id) REFERENCES public.tasks(id),
  CONSTRAINT fk_tasks_next_task FOREIGN KEY (next_task_id) REFERENCES public.tasks(id),
  CONSTRAINT fk_tasks_rig FOREIGN KEY (rig_id) REFERENCES public.rigs(id),
  CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.brands (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  company_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT brands_pkey PRIMARY KEY (id),
  CONSTRAINT fk_brand_company FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.models (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  company_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT models_pkey PRIMARY KEY (id),
  CONSTRAINT fk_model_brand FOREIGN KEY (brand_id) REFERENCES public.brands(id),
  CONSTRAINT fk_model_company FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT certificates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.functional_principle_scopes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NOT NULL,
  CONSTRAINT functional_principle_scopes_pkey PRIMARY KEY (id),
  CONSTRAINT functional_principle_scopes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);