import DidBuilder from "../components/dids/Builder";
import supabase from "../utils/supabase";

export default async function Page() {
  const { data: documents } = await supabase
    .from("did_documents")
    .select("id, name, document");

  if (!documents) return <div>No DID Documents</div>;
  return (
    <div>
      <DidBuilder
        name={documents[0].name || "no name"}
        id={documents[0].id}
        document={(documents[0].document as Record<string, any>) || {}} // TODO: Types
      />
    </div>
  );
}
