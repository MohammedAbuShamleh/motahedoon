import { Link } from "@inertiajs/react";
import { useSite, useU } from "@/lib/site";
import type { CSSProperties } from "react";
import { BRAND_COLORS, SocialIcon, socialName, themeAttrs } from "@/components/SocialIcon";

export function SiteFooter() {
  const { org, contact, mediaOffice, footerData, locale, social } = useSite();
  const U = useU();
  const PENDING = U("بانتظار اعتماد التجمع");
  const keep = (p: string) => (locale === "ar" ? p : `${p}?lang=${locale}`);

  /* الحقل الفارغ لا يُخفى: يظهر خانة محجوزة موسومة.
     هذا قرار تصميم قائم — لا يُخترع بديل ولا يُحذف السطر. */
  const pending = (value: string | null, label: string) =>
    value ? <li>{value}</li> : <li className="footer__pending">{label} — {PENDING}</li>;


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
              {/* روابط التواصل: كلّ ما يُضاف من اللوحة يظهر هنا تلقائياً بترتيبه
                  وبالنمط المختار. القسم المُطفأ من اللوحة لا يظهر أصلاً — ولا
                  خانته المحجوزة (قرار صريح بالإخفاء، لا حقل ناقص). */}
              {social.enabled && (social.links.length > 0 ? (
                <li className={`footer__social footer__social--${social.style} ${themeAttrs(social.theme).className}`}
                    style={themeAttrs(social.theme).style as CSSProperties}>
                  {social.links.map((l) => {
                    const name = socialName(l);
                    const [bg, fg] = BRAND_COLORS[l.platform] ?? BRAND_COLORS.other;
                    return (
                      <a key={l.url} className="footer__soc" href={l.url} target="_blank" rel="noopener noreferrer"
                         aria-label={name} title={name}
                         style={{ "--soc-bg": bg, "--soc-fg": fg } as CSSProperties}>
                        <SocialIcon platform={l.platform} />
                      </a>
                    );
                  })}
                </li>
              ) : (
                <li className="footer__pending">
                  {U("روابط التواصل الاجتماعي")} — {PENDING}
                </li>
              ))}
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
