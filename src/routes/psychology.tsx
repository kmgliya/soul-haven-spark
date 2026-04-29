import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { psychologists, articles } from "@/lib/mock-data";
import { BookOpen, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/psychology")({
  head: () => ({
    meta: [{ title: "Психология — LoveSpace" }],
  }),
  component: PsychologyPage,
});

function PsychologyPage() {
  return (
    <AppShell>
      <div className="container-web page-pad max-w-5xl">
        <header className="mb-10">
          <h1 className="font-display text-4xl font-black tracking-tight text-foreground">
            Психология
          </h1>
          <p className="mt-2 text-muted-foreground font-medium">
            Поддержка, знания и тёплые практики для отношений.
          </p>
        </header>

        <div className="grid gap-8">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Специалисты</h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Подборка профи, которые помогают парам.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {psychologists.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col md:flex-row items-center gap-6 rounded-[40px] border border-border bg-card p-8 shadow-sm"
                >
                  <div className="h-24 w-24 shrink-0 rounded-[32px] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-3xl shadow-xl">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-foreground">{p.name}</h3>
                    <p className="text-primary font-medium">{p.focus}</p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">
                          Опыт
                        </p>
                        <p className="text-foreground font-bold">{p.experience}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">
                          Цена
                        </p>
                        <p className="text-foreground font-bold">{p.price}</p>
                      </div>
                    </div>
                  </div>
                  <button className="w-full md:w-auto px-10 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.99] transition-all shadow-[0_12px_36px_rgba(var(--color-primary-rgb),0.18)]">
                    Записаться
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <BookOpen size={18} />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground">Заметки от специалистов</h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Небольшие статьи и идеи на тему отношений.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {articles.map((a) => (
                <article
                  key={a.id}
                  className="group relative overflow-hidden rounded-[32px] border border-border bg-card p-7 shadow-sm transition-colors hover:bg-accent"
                >
                  <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-[50px] opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[55px] opacity-60" />

                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                      статья
                    </p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">
                      {a.title}
                    </h3>
                    <p className="mt-3 text-sm font-semibold text-muted-foreground leading-relaxed">
                      {a.preview}
                    </p>
                    <div className="mt-5 rounded-[18px] border border-border bg-background/60 p-4 backdrop-blur-xl">
                      <p className="text-xs font-semibold text-foreground/80 line-clamp-4">
                        {a.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
