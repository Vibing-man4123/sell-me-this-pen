import { PersonaPortrait } from "@/components/art/PersonaPortrait";
import type { Persona } from "@/lib/game/personas";
import type { Turn } from "@/lib/game/transcript";

/**
 * The call as it reads on the page: the client on the left behind their
 * portrait, the broker on the right on desk paper.
 */

function Bubble({ speaker, children }: { speaker: Turn["role"]; children: React.ReactNode }) {
  const isBroker = speaker === "broker";
  return (
    <div
      className={
        isBroker
          ? "texture-paper max-w-[85%] rounded-card rounded-br-none border border-brass/60 px-4 py-2.5 text-ink sm:max-w-[75%]"
          : "max-w-[85%] rounded-card rounded-bl-none border border-brass/40 bg-sky-pale px-4 py-2.5 text-ink sm:max-w-[75%]"
      }
    >
      <p className="text-[0.95rem] leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  );
}

export function ClientLine({
  persona,
  children,
}: {
  persona: Persona;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-end gap-3">
      <PersonaPortrait
        personaId={persona.id}
        size={44}
        title={persona.name}
        className="shrink-0 rounded-full border-2 border-brass/50"
      />
      <Bubble speaker="client">{children}</Bubble>
    </div>
  );
}

export function BrokerLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <Bubble speaker="broker">{children}</Bubble>
    </div>
  );
}

/** Three dots while the client is drawing breath. */
export function Listening({ persona }: { persona: Persona }) {
  return (
    <div className="flex items-end gap-3">
      <PersonaPortrait
        personaId={persona.id}
        size={44}
        title={persona.name}
        className="shrink-0 rounded-full border-2 border-brass/50"
      />
      <div className="rounded-card rounded-bl-none border border-brass/40 bg-sky-pale px-4 py-3">
        <span className="flex gap-1.5" aria-label={`${persona.name} is speaking`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-bounce rounded-full bg-dialtone"
              style={{ animationDelay: `${i * 140}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
