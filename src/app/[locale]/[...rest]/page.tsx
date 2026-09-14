import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

// Any unmatched path under a locale renders the localized 404.
export default function CatchAllNotFound({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  notFound();
}
