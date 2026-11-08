import type { Metadata } from "next";
import { withPageSeo } from "@/lib/content/seo";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { privacyPolicy } from "@/data/pages";
import { Reveal } from "@/components/reveal";

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo("/privacy-policy", {
    title: "Privacy Policy",
    description:
      "Kebijakan privasi KAMA Spa — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.",
  });
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navigation />
      <main className="main-wrapper">
        <Reveal as="section" className="page-hero">
          <div className="padding-global">
            <div className="container-large">
              <div className="section-header">
                <h1 className="header-xxl">Privacy Policy</h1>
                <div className="spacer-medium" />
                <p className="body-l text-color-gray">{privacyPolicy.intro}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="padding-section-global is-top-off">
          <div className="padding-global">
            <div className="container-large">
              <div className="w-layout-grid grid_content is-text-pages">
                <div className="body-m text-color-gray">
                  <div className="eyebrow-s text-style-allcaps">Last updated</div>
                  <div>1 Januari 2026</div>
                  <div className="spacer-medium" />
                  <div>
                    Kami menjaga privasi Anda. Kebijakan ini menjelaskan data apa yang kami
                    kumpulkan, mengapa kami mengumpulkannya, dan pilihan yang Anda miliki.
                  </div>
                </div>

                <div className="dropdowns_group">
                  {privacyPolicy.sections.map((section) => (
                    <details
                      key={section.title}
                      open
                      className="dropdown_component border-black w-dropdown"
                    >
                      <summary className="dropdown_trigger w-dropdown-toggle">
                        <div className="sizing-grow">
                          <h5 className="header-s">{section.title}</h5>
                        </div>
                      </summary>
                      <div className="dropdown_content w-dropdown-list">
                        <div className="dropdown_content-inner-2">
                          <div className="text-wrapper">
                            <div className="terms-n-policy w-richtext">
                              {section.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                              ))}
                              {section.bullets && (
                                <ul className="benefit-list">
                                  {section.bullets.map((bullet) => (
                                    <li key={bullet} className="benefit-list_item">
                                      {bullet}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
