-- SQL script to initialize site configuration
-- Run this in your Neon database SQL editor

-- Create initial site configuration (if not exists)
INSERT INTO site_config (id, "showLandingPage", "createdAt", "updatedAt")
VALUES (
  'default-config',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Verify the configuration
SELECT * FROM site_config;
