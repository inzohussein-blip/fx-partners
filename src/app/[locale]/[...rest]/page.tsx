import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

// Any unmatched path under a locale renders the localized 404.
export default async function CatchAllNotFound(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  setRequestLocale(locale);
  notFound();
}
