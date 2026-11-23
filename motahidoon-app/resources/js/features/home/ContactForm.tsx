import { useForm } from "@inertiajs/react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useSite, useU } from "@/lib/site";

/* ---------- نموذج «تواصل معنا» (بطلب صاحب المشروع 2026-11-23) ----------
   الاسم، والبريد أو الهاتف (أحدهما يكفي)، والرسالة. يُحفظ في القاعدة
   ويُقرأ في اللوحة («رسائل التواصل»). عند النجاح يُفرَّغ ويظهر شكرٌ مكانه.
   حقل website فخّ للبرامج الآلية: خارج الشاشة ومحجوب عن قارئ الشاشة. */
export function ContactForm() {
  const U = useU();
  const { locale } = useSite();
  const [sent, setSent] = useState(false);
  const form = useForm({ name: "", email: "", phone: "", message: "", website: "" });
  const { data, setData, errors } = form;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.post(locale === "ar" ? "/contact" : `/contact?lang=${locale}`, {
      preserveScroll: true,
      onSuccess: () => { form.reset(); setSent(true); },
    });
  };

  const field = (key: "name" | "email" | "phone", label: string, type = "text", dir?: "ltr") => (
    <label className="cform__field">
      <span className="cform__label">{label}</span>
      <input
        className="cform__input"
        type={type}
        dir={dir}
        value={data[key]}
        onChange={(e) => { setData(key, e.target.value); setSent(false); }}
        aria-invalid={errors[key] ? true : undefined}
        autoComplete={key === "name" ? "name" : key === "email" ? "email" : "tel"}
      />
      {errors[key] && <span className="cform__err" role="alert">{errors[key]}</span>}
    </label>
  );

  return (
    <section className="cform" aria-labelledby="cform-h">
      <header className="cform__head">
        <h3 className="cform__title" id="cform-h">{U("تواصل معنا")}</h3>
        <p className="cform__hint">{U("اكتب رسالتك وسنعود إليك عبر البريد أو الهاتف.")}</p>
      </header>

      <form className="cform__grid" onSubmit={submit} noValidate>
        {field("name", U("الاسم"))}
        {field("email", U("البريد الإلكتروني"), "email", "ltr")}
        {field("phone", U("رقم الهاتف"), "tel", "ltr")}
        <label className="cform__field cform__field--wide">
          <span className="cform__label">{U("الرسالة")}</span>
          <textarea
            className="cform__input cform__input--area"
            rows={5}
            value={data.message}
            onChange={(e) => { setData("message", e.target.value); setSent(false); }}
            aria-invalid={errors.message ? true : undefined}
          />
          {errors.message && <span className="cform__err" role="alert">{errors.message}</span>}
        </label>

        {/* فخّ البرامج الآلية — لا يراه الزائر */}
        <label className="cform__trap" aria-hidden="true">
          <input tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => setData("website", e.target.value)} />
        </label>

        <div className="cform__foot">
          <button className="btn pa-btn cform__send" type="submit" disabled={form.processing}>
            {form.processing ? U("جارٍ الإرسال…") : U("إرسال")}
          </button>
          {sent && <p className="cform__ok" role="status">{U("وصلت رسالتك، شكراً لك. سنعود إليك قريباً.")}</p>}
          {form.hasErrors && !Object.keys(errors).some((k) => ["name", "email", "phone", "message"].includes(k)) && (
            <p className="cform__err" role="alert">{U("تعذّر الإرسال الآن، حاول بعد قليل.")}</p>
          )}
        </div>
      </form>
    </section>
  );
}
