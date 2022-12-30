import useTranslation from "next-translate/useTranslation";
import DashboardMeta from "@/components/dashboard/dashboard-meta";
import usePersonalAccount from "@/utils/api/use-personal-account";
import DidHandler from "@/components/dids/DidHandler";

const PersonalDids = () => {
    const { data: account } = usePersonalAccount();

    const { t } = useTranslation("dashboard");
    return (
        <>
            <DashboardMeta
                title={t("dashboardMeta.teamDidDocuments", { teamName: account?.team_name })}
            />
            {
                account && <DidHandler accountId={account.id}/>
            }
        </>
    );
};

export default PersonalDids;
