import { useMemo } from "react";
import { Nums } from "@/lib/nums";
import { isHtml, numify } from "@/lib/rich";

/**
 * يرسم حقلاً قد يكون نصّاً عادياً أو منسَّقاً من محرّر اللوحة.
 *
 * النصّ العادي يُرسَم كما كان حرفياً (<p> بصنفه) فلا تتغيّر بصمة
 * verify-strings لما لم يُحرَّر. المنسَّق في وعاء .rich، وقد نُقّي في
 * الخادم قبل الحفظ وعند بناء الشجرة.
 * nums: الأرقام بالأخضر، كما تفعل <Nums> في النصّ العادي.
 */
export function RichText({ value, className, nums = false, style }: {
  value: string;
  className?: string;
  nums?: boolean;
  style?: React.CSSProperties;
}) {
  const html = useMemo(
    () => (isHtml(value) ? (nums ? numify(value) : value) : null),
    [value, nums],
  );

  if (html === null) {
    return <p className={className} style={style}>{nums ? <Nums text={value} /> : value}</p>;
  }
  return (
    <div
      className={className ? `rich ${className}` : "rich"}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
