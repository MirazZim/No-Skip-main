import { useMemo } from "react";
import { Sword } from "lucide-react";

const QUOTES = [
  { text: "A wise man doth not hoard his gold, but spendeth it with purpose and honour.", author: "The Code of the Ledger" },
  { text: "He who keepeth account of every coin shall never be a servant to debt.", author: "The Merchant's Creed" },
  { text: "Discipline in thy purse is the truest armour against the siege of ruin.", author: "Sir Edmund the Frugal" },
  { text: "Spend not thy silver on fleeting pleasures, but invest in the fortress of thy future.", author: "The Order of the Golden Quill" },
  { text: "A knight who knoweth his expenses fighteth not in the dark.", author: "The Treasury Scrolls" },
  { text: "Even the mightiest castle was built one stone — and one coin — at a time.", author: "The Builder's Proverb" },
  { text: "To master thy wealth is to master thyself; there is no greater conquest.", author: "The Sage of Ironhall" },
  { text: "Let every coin tell a tale of wisdom, not of folly.", author: "The Chronicler's Oath" },
  { text: "Guard thy gold as thou wouldst guard thy honour — with vigilance and resolve.", author: "The Shield-Bearer's Maxim" },
  { text: "The road to ruin is paved with untracked spending. Map thy journey, brave soul.", author: "The Pilgrim's Ledger" },
  { text: "Fear not the tally of thy debts — face them, and they shall crumble like old ramparts.", author: "Lord Aldric the Steadfast" },
  { text: "A full treasury without a plan is but a dragon's hoard — useless and cursed.", author: "The Alchemist's Warning" },
];

export function MedievalQuote() {
  const quote = useMemo(() => {
    // Change quote daily based on day-of-year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  return (
    <div className="relative rounded-xl border border-border bg-card p-4 overflow-hidden">
      <div className="absolute top-2 right-2 opacity-[0.07]">
        <Sword className="h-16 w-16 text-foreground" />
      </div>
      <blockquote className="relative z-10">
        <p className="text-sm italic text-foreground/90 leading-relaxed">
          "{quote.text}"
        </p>
        <footer className="mt-2 text-xs font-medium text-muted-foreground">
          — {quote.author}
        </footer>
      </blockquote>
    </div>
  );
}
