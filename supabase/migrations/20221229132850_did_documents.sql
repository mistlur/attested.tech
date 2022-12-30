CREATE TABLE did_documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name text,
    document jsonb,
    account_id uuid references accounts not null,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- enable RLS for did_documents
ALTER TABLE did_documents ENABLE ROW LEVEL SECURITY;

create policy "Only accessible to account members" on did_documents for
    all
    using (account_id IN
           (SELECT basejump.get_accounts_for_current_user() AS get_accounts_for_current_user));

/**
 * We want to protect some fields on accounts from being updated
 * Specifically the primary owner user id and account id.
 * primary_owner_user_id should be updated using the dedicated function
 */
 CREATE OR REPLACE FUNCTION public.protect_did_documents_fields()
     RETURNS TRIGGER AS
 $$
 BEGIN


    IF current_user IN ('authenticated', 'anon') THEN
       -- these are protected fields that users are not allowed to update themselves
       -- platform admins should be VERY careful about updating them as well.
       if NEW.id <> OLD.id
        OR NEW.account_id <> OLD.account_id
        THEN
           RAISE EXCEPTION 'You do not have permission to update this field';
        end if;
    end if;

    RETURN NEW;
 END
 $$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_protect_did_documents_fields
    BEFORE UPDATE
    ON public.did_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_did_documents_fields();

-- protect the timestamps
CREATE TRIGGER trigger_set_did_documents_timestamps
    BEFORE INSERT OR UPDATE ON public.did_documents
    FOR EACH ROW
    EXECUTE PROCEDURE basejump.trigger_set_timestamps();