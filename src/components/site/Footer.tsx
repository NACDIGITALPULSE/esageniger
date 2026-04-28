import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail } from "lucide-react";
import logo from "@/assets/esage-logo.jpg";
import { ESAGE } from "@/lib/contact";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container mx-auto grid gap-10 px-4 py-14 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo ESAGE" className="h-12 w-12 rounded-md object-cover" width={48} height={48} />
            <div>
              <div className="font-serif text-xl font-bold text-primary">ESAGE</div>
              <div className="text-xs text-muted-foreground">Travail – Rigueur – Succès</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {ESAGE.fullName}. Une école engagée pour la réussite professionnelle des étudiants au Niger.
          </p>
        </div>

        <div>
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">Navigation</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/a-propos" className="hover:text-primary">À propos</Link></li>
            <li><Link to="/formations" className="hover:text-primary">Formations</Link></li>
            <li><Link to="/admissions" className="hover:text-primary">Admissions</Link></li>
            <li><Link to="/frais" className="hover:text-primary">Frais de scolarité</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">Plus</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/equipe" className="hover:text-primary">Notre équipe</Link></li>
            <li><Link to="/galerie" className="hover:text-primary">Galerie</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{ESAGE.address}</span>
            </li>
            {ESAGE.phones.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-primary">{p}</a>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <a href={`mailto:${ESAGE.email}`} className="hover:text-primary">{ESAGE.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row lg:px-8">
          <div>© {new Date().getFullYear()} ESAGE. Tous droits réservés.</div>
          <div>{ESAGE.tagline}</div>
        </div>
      </div>
    </footer>
  );
}
