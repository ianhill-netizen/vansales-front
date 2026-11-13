/** Lower-cases a category label for use mid-sentence but keeps the proper noun: "Luton vans" -> "Luton vans", "Panel vans" -> "panel vans". */
export const lc = (label: string): string => label.toLowerCase().replace(/\bluton\b/g, "Luton");

/** Capitalises a singular label only where it is a proper noun or starts the phrase: "Luton van" stays, "tipper van" stays lower, "Panel van" -> "panel van". */
export const properNoun = (singular: string): string => lc(singular);
