CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- This function handles both column names used for tracking updates
    BEGIN
        NEW.updated_at = now();
    EXCEPTION WHEN undefined_column THEN
        BEGIN
            NEW.atualizado_em = now();
        EXCEPTION WHEN undefined_column THEN
            -- Table has neither column, ignore
        END;
    END;
    RETURN NEW;
END;
$function$;