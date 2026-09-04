import { SiteHeader } from "@/components/site-header";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrokerLoading() {
  return (
    <>
      <SiteHeader />
      <section className="hero-glow">
        <Container className="py-14">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-48 rounded-xl" />
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        </Container>
      </section>
      <section className="py-10">
        <Container>
          <Skeleton className="h-40 w-full rounded-2xl" />
        </Container>
      </section>
    </>
  );
}
