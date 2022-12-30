import { v4 as uuidv4 } from 'uuid';
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import handleSupabaseErrors from "../handle-supabase-errors";
import { Database } from "@/types/supabase-types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function useDid(
  accountId: string,
  options?: UseQueryOptions<Database["public"]["Tables"]["did_documents"]["Row"]>
) {
  const supabaseClient = useSupabaseClient<Database>();
  return useQuery<Database["public"]["Tables"]["did_documents"]["Row"], Error>(
    ["accountDids", accountId],
    async () => {
      const { data, error } = await supabaseClient
        .from("did_documents")
        .select()
        .eq("account_id", accountId);
      handleSupabaseErrors(data, error);

      if (data[0]) return data[0];

      // TODO: fix this
      // insert an initial did document if none exist
      const id = uuidv4()
      const { data: insert, error: insertError } = await supabaseClient
        .from("did_documents")
        .insert({
          id,
          account_id: accountId,
          name: "Initial did",
          document: {
            "@context": [
              "https://www.w3.org/ns/did/v1",
              "https://w3id.org/security/suites/jws-2020/v1",
              "https://w3id.org/security/suites/multikey-2021/v1",
            ],
            id: `did:web:attested.tech:api:${id}`,
          },
        })
        .select();

      handleSupabaseErrors(insert, insertError);
      if (!insert[0]) throw new Error('No initial did created')

      return insert[0]
    },
      {
          ...options,
          enabled: !!accountId && !!supabaseClient,
      }
  );
}
