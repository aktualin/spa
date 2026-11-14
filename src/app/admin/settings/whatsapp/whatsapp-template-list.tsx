"use client";

import { WhatsAppTemplateForm } from "./whatsapp-template-form";
import {
  OtherTemplates,
  type OtherTemplateRow,
  type WhatsAppContextRow,
} from "./whatsapp-template-parts";

export type { WhatsAppContextRow, OtherTemplateRow } from "./whatsapp-template-parts";

export function WhatsAppTemplateList({
  templates,
  others,
  number,
}: {
  templates: WhatsAppContextRow[];
  others: OtherTemplateRow[];
  number: string;
}) {
  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <WhatsAppTemplateForm key={template.key} template={template} number={number} />
      ))}

      <OtherTemplates others={others} />
    </div>
  );
}