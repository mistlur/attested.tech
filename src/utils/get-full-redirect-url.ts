export default function getFullRedirectUrl(redirectPath: string) {
  if (redirectPath.startsWith("http")) return redirectPath;
  console.log(process.env.URL)
  const baseUrl = process.env.URL || window.location.origin;
  return [baseUrl, redirectPath?.replace(/^\//, "")].filter(Boolean).join("/");
}
