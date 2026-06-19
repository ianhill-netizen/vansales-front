export type PersonaId = "logged-out" | "buyer" | "dealer" | "swiss-vans" | "admin";

export interface Persona {
  id: PersonaId;
  label: string;
  displayName: string;
  email: string;
  initials: string;
  /** Where the "Account" link in nav goes */
  accountHref: string;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  "logged-out": {
    id: "logged-out",
    label: "Logged-out",
    displayName: "Guest",
    email: "",
    initials: "?",
    accountHref: "/sign-in",
  },
  buyer: {
    id: "buyer",
    label: "Buyer",
    displayName: "Ian Hill",
    email: "ian@example.com",
    initials: "IH",
    accountHref: "/account",
  },
  dealer: {
    id: "dealer",
    label: "Trade dealer",
    displayName: "John Smith",
    email: "john@midlandscommercial.co.uk",
    initials: "JS",
    accountHref: "/dealer-portal",
  },
  "swiss-vans": {
    id: "swiss-vans",
    label: "Swiss Vans (owner)",
    displayName: "Swiss Vans",
    email: "ian@swissvans26.com",
    initials: "SV",
    accountHref: "/dealer-portal",
  },
  admin: {
    id: "admin",
    label: "Admin",
    displayName: "Admin",
    email: "admin@vansales.com",
    initials: "AD",
    accountHref: "/admin",
  },
};
