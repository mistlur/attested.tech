import supabase from "../utils/supabase";
import { documentSchema } from "./didParser";

export async function fetchDidDocument(
  did: string
) {
  const { data, error } = await supabase
    .from("did_documents")
    .select('document')
    .eq("id", did)
    .single();
  if (error) throw new Error(error.message)
  if (!data) return undefined;
  return data.document
}

export async function updateDidDocument(
  id: string,
  didDocument: Record<string, any>
) {

  try {
    documentSchema.parse(didDocument);
  } catch (e) {
    throw new Error('Invalid Document provided, will not store') // TODO: Specify
  }

  const result = await supabase
    .from("did_documents")
    .update({ document: didDocument })
    .match({ id })
    .select();

  if (result.error) throw new Error(result.error.message)
  return result.data![0];
}