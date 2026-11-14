import { copy, type PageCopy } from "@/lib/content/page-copy";

/** Label formulir inquiry corporate dari CB grup "corporate_form". */
export function corporateFormLabels(pageCopy: PageCopy) {
  return {
    name: copy(pageCopy, "corporate_form.name"),
    company: copy(pageCopy, "corporate_form.company"),
    email: copy(pageCopy, "corporate_form.email"),
    phone: copy(pageCopy, "corporate_form.phone"),
    message: copy(pageCopy, "corporate_form.message"),
    messagePlaceholder: copy(pageCopy, "corporate_form.message_placeholder"),
    consentPrefix: copy(pageCopy, "corporate_form.consent_prefix"),
    privacyLabel: copy(pageCopy, "corporate_form.privacy_label"),
    consentSuffix: copy(pageCopy, "corporate_form.consent_suffix"),
    submit: copy(pageCopy, "corporate_form.submit"),
    submitting: copy(pageCopy, "corporate_form.submitting"),
    unavailable: copy(pageCopy, "corporate_form.unavailable"),
    whatsapp: copy(pageCopy, "corporate_form.whatsapp"),
    successTitle: copy(pageCopy, "corporate_form.success_title"),
    successBody: copy(pageCopy, "corporate_form.success_body"),
    errorName: copy(pageCopy, "corporate_form.error_name"),
    errorEmailRequired: copy(pageCopy, "corporate_form.error_email_required"),
    errorEmailFormat: copy(pageCopy, "corporate_form.error_email_format"),
    errorMessage: copy(pageCopy, "corporate_form.error_message"),
    errorConsent: copy(pageCopy, "corporate_form.error_consent"),
    errorCaptcha: copy(pageCopy, "corporate_form.error_captcha"),
    errorCaptchaLoad: copy(pageCopy, "corporate_form.error_captcha_load"),
    errorIncomplete: copy(pageCopy, "corporate_form.error_incomplete"),
    errorSend: copy(pageCopy, "corporate_form.error_send"),
    errorNetwork: copy(pageCopy, "corporate_form.error_network"),
  };
}