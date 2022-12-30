import DidBuilder from "@/components/dids/Builder";
import useDid from "@/utils/api/use-did"

const DidHandler = ({ accountId }: { accountId: string}) => {
    const { data: did } = useDid(accountId);

    if (!did) return null

    return <DidBuilder id={did.id} name={did.name} document={did.document as Record<string, any>}/>
};

export default DidHandler;
