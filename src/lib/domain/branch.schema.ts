/** Skema form admin cabang — lihat `branch.ts`. */
import { z } from "zod";

import { branchContactFields } from "./branch.fields-contact.ts";
import { branchIdentityFields } from "./branch.fields-identity.ts";

export const branchInputSchema = z.object({
  ...branchIdentityFields,
  ...branchContactFields,
});

export type BranchParsed = z.output<typeof branchInputSchema>;