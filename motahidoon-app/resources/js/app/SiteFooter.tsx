import { Link } from "@inertiajs/react";
import { useSite, useU } from "@/lib/site";

export function SiteFooter() {
  const { org, contact, mediaOffice, footerData, locale } = useSite();
  const U = useU();
  const PENDING = U("بانتظار اعتماد التجمع");
  const keep = (p: string) => (locale === "ar" ? p : `${p}?lang=${locale}`);

  /* الحقل الفارغ لا يُخفى: يظهر خانة محجوزة موسومة.
     هذا قرار تصميم قائم — لا يُخترع بديل ولا يُحذف السطر. */
  const pending = (value: string | null, label: string) =>
    value ? <li>{value}</li> : <li className="footer__pending">{label} — {PENDING}</li>;

  const social = Object.entries(contact.social).filter(
    (entry): entry is [string, string] => entry[1] !== null,
  );

  return (
    <footer className="site-footer">
      <div className="site-footer__in">
        <div className="footer__top">
          <div>
            <span className="footer__logo">
              <img src={`/${org.logoFull}`} alt={org.name} loading="lazy" decoding="async" />
            </span>
            <p className="footer__h">{mediaOffice}</p>
          </div>

          <div>
            <h2 className="footer__h">{U("مجالات العمل")}</h2>
            <ul className="footer__list">
              {footerData.pillars.map((p) => (
                <li key={p.id}>
                  <Link href={keep(`/p/${p.id}`)}>{p.short}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="footer__h">{U("المؤسسات الشريكة")}</h2>
            <ul className="footer__list">
              {footerData.partners.map((p) => (
                <li key={p.name}>{p.name}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="footer__h">{U("التواصل")}</h2>
            <ul className="footer__list">
              {pending(contact.email, U("البريد"))}
              {pending(contact.phone, U("الهاتف"))}
              {pending(contact.address, U("العنوان"))}
              {social.length > 0 ? (
                social.map(([k, v]) => (
                  <li key={k}>
                    <a href={v} target="_blank" rel="noopener">{k}</a>
                  </li>
                ))
              ) : (
                <li className="footer__pending">
                  {U("روابط التواصل الاجتماعي")} — {PENDING}
                </li>
              )}
            </ul>
          </div>
        </div>

        {footerData.current && (
          <dl className="colophon">
            <div><dt>{U("أحدث تقرير")}</dt><dd>{footerData.current.label}</dd></div>
            <div><dt>{U("المدى")}</dt><dd>{footerData.current.range}</dd></div>
            <div><dt>{U("المصدر")}</dt><dd>{footerData.current.reportTitle}</dd></div>
            <div><dt>{U("الإعداد")}</dt><dd>{mediaOffice}</dd></div>
          </dl>
        )}

        <p className="footer__bar">{org.name}</p>
      </div>
    </footer>
  );
}
