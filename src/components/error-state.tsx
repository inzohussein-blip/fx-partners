import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function ErrorState({
  code,
  title,
  message,
  action,
}: {
  code: string;
  title: string;
  message: string;
  /** Optional custom action(s); defaults to a "back home" button. */
  action?: React.ReactNode;
}) {
  return (
    <div className="hero-glow flex min-h-screen items-center justify-center py-16">
      <Container className="max-w-lg text-center">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo markClassName="h-9 w-9" />
        </Link>
        <div dir="ltr" className="text-gradient text-7xl font-extrabold sm:text-8xl">
          {code}
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white">{title}</h1>
        <p className="mt-3 text-slate-400">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {action ?? <Button href="/">العودة للرئيسية</Button>}
        </div>
      </Container>
    </div>
  );
}
