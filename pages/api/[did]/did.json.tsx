// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { fetchDidDocument } from "../../../lib/dao";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const did = req.query.did as string; // TODO: Tyyyyypes
  const didDocument = await fetchDidDocument(did);
  res.setHeader("content-type", "application/did+json");
  res.status(200).json(didDocument);
}
