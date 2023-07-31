import { useRouter } from "next/router";
import useTeamAccount from "@/utils/api/use-team-account";
import useTranslation from "next-translate/useTranslation";
import DashboardMeta from "@/components/dashboard/dashboard-meta";
import DidHandler from "@/components/dids/DidHandler";

const TeamDids = () => {
  const router = useRouter();
  const { accountId } = router.query;
  const { data: account } = useTeamAccount(accountId as string);

  const { t } = useTranslation("dashboard");
  return (
    <>
      <DashboardMeta
        title={t("dashboardMeta.teamDidDocuments", {
          teamName: account?.team_name,
        })}
      />
      <DidHandler accountId={accountId as string} />
    </>
  );
};

export default TeamDids;
