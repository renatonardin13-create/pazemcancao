-- 1. Drop old constraints
ALTER TABLE tracks DROP CONSTRAINT IF EXISTS tracks_area_id_fkey;
ALTER TABLE contents DROP CONSTRAINT IF EXISTS contents_area_id_fkey;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_area_id_fkey;

-- 2. Migrate data
DO $$
DECLARE
    target_area_id UUID;
BEGIN
    SELECT id INTO target_area_id FROM areas_membros WHERE principal = true LIMIT 1;
    IF target_area_id IS NULL THEN
        SELECT id INTO target_area_id FROM areas_membros WHERE ativa = true LIMIT 1;
    END IF;

    IF target_area_id IS NOT NULL THEN
        UPDATE tracks SET area_id = target_area_id;
        UPDATE contents SET area_id = target_area_id;
        UPDATE categories SET area_id = target_area_id;
    END IF;
END $$;

-- 3. Add new constraints pointing to areas_membros
ALTER TABLE tracks ADD CONSTRAINT tracks_area_id_fkey FOREIGN KEY (area_id) REFERENCES areas_membros(id) ON DELETE SET NULL;
ALTER TABLE contents ADD CONSTRAINT contents_area_id_fkey FOREIGN KEY (area_id) REFERENCES areas_membros(id) ON DELETE SET NULL;
ALTER TABLE categories ADD CONSTRAINT categories_area_id_fkey FOREIGN KEY (area_id) REFERENCES areas_membros(id) ON DELETE SET NULL;