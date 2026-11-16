import { Link } from "@inertiajs/react";
import { Layout } from "@/app/Layout";
import { Band } from "@/components/primitives";
import { useSite, useU } from "@/lib/site";

export default function NotFound({ pillars }: { pillars: { id: string; short: string }[] }) {
  const U = useU();
  const { locale } = useSite();
  const path = (x: string) => (locale === "ar" ? x : `${x}?lang=${locale}`);

  return (
    <Layout>
      <Band
        cls="ph"
        noReveal
        main={
          <>
            <h1 className="h-page">{U("هذه الصفحة غير موجودة")}</h1>
            <p className="lead" style={{ marginTop: "clamp(1.5rem,3vw,2.25rem)" }}>
              {U("الرابط لا يطابق أي مجال عمل ولا أي تقرير في الموقع.")}
            </p>
            <p style={{ marginTop: "clamp(2rem,4vw,3rem)" }}>
              <Link className="btn btn--green" href={path("/")}>
                {U("العودة إلى الرئيسية")}
              </Link>
            </p>
          </>
        }
        aside={
          <ul className="footer__list aside-list">
            {pillars.map((p) => (
              <li key={p.id}><Link href={path(`/p/${p.id}`)}>{p.short}</Link></li>
            ))}
          </ul>
        }
      />
    </Layout>
  );
}
