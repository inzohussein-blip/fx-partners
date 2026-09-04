import { SiteHeader } from "@/components/site-header";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompareLoading() {
  return (
    <>
      <SiteHeader />
      <section className="hero-glow">
        <Container className="py-16 text-center">
          <Skeleton className="mx-auto h-10 w-2/3" />
          <Skeleton className="mx-auto mt-5 h-5 w-1/2" />
        </Container>
      </section>
      <section className="pb-24">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="card-surface hidden h-96 lg:block" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
