import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { copy, type PageCopy } from "@/lib/content/page-copy";
import type { MembershipProgram } from "@/lib/content/membership";

/** Hero membership: judul, intro, dan tombol join/menu. */
export function MembershipHero({
  membership,
  joinHref,
  pageCopy,
}: {
  membership: MembershipProgram;
  joinHref: string | null;
  pageCopy: PageCopy;
}) {
  return (
    <Reveal as="section" className="page-hero">
      <div className="padding-global">
        <div className="container-large">
          <div className="section-header">
            <div className="eyebrow-s text-style-allcaps">{membership.eyebrow}</div>
            <h1 className="header-xxl">{membership.title}</h1>
            <div className="spacer-medium" />
            <RichText value={membership.intro} className="body-l text-color-gray" />
            <div className="spacer-large" />
            <div className="button-group">
              {joinHref ? (
                <a
                  href={joinHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-wa-context="membership"
                  className="button is-tertiary sizing-grow w-inline-block"
                >
                  <div>{copy(pageCopy, "membership.join_label")}</div>
                </a>
              ) : null}
              <a
                href={copy(pageCopy, "membership.menu_href") || "/menu"}
                className="button is-secondary sizing-grow w-inline-block"
              >
                <div>{copy(pageCopy, "membership.menu_label")}</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}