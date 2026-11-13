/**
 * /van-accessories/van-alloy-wheels/{model}: six per-model alloy-wheel pages under the alloy-wheels topic. Pure data. Copy is a vansales-backend content_pages row each ("accessory-van-alloy-wheels-{slug}", `content:seo-silo alloys`).
 * PHOTOS are Swiss Vans' own genuine wheel close-ups (SmugMug library, picked from Dealski's smugmug_image_tags, copied by `content:import-wheel-photos` into our images bucket). Nothing is generated or AI-edited.
 * HOOK FOR CURATOR: a model with an empty list simply shows no photos. To backfill, import more wheel photos into listings/content/wheels/{slug}/ and add their URLs here. Transit and Sprinter have none yet.
 */
export interface AlloyPhoto { url: string; alt: string }
export interface AlloyModel { slug: string; backendSlug: string; path: string; h1: string; title: string; description: string; make: string; model: string; photos: readonly AlloyPhoto[] }

const B = "https://vansales-images-781856667851-eu-west-2.s3.eu-west-2.amazonaws.com/listings/content/wheels";
const photo = (slug: string, file: string, alt: string): AlloyPhoto => ({ url: `${B}/${slug}/${file}`, alt });

const m = (slug: string, make: string, model: string, title: string, photos: readonly AlloyPhoto[]): AlloyModel => ({
  slug, make, model, title, photos,
  backendSlug: `accessory-van-alloy-wheels-${slug}`,
  path: `/van-accessories/van-alloy-wheels/${slug}`,
  h1: `${make} ${model} alloy wheels`,
  description: `${make} ${model} alloy wheels: what to check on load rating, fitment, tyres, legal and insurance points, and a used van that already has alloys.`,
});

export const ALLOY_MODELS: readonly AlloyModel[] = [
  m("transit-custom", "Ford", "Transit Custom", "Ford Transit Custom Alloy Wheels: What to Check Before You Fit", [
    photo("transit-custom", "3943.jpg", "Black multi-spoke alloy wheel on a Ford Transit Custom"),
    photo("transit-custom", "2902.jpg", "Black alloy wheel with a split-spoke design on a Ford Transit Custom"),
    photo("transit-custom", "2945.jpg", "Gloss black alloy wheel on a white Ford Transit Custom"),
    photo("transit-custom", "2726.jpg", "Black mesh-style alloy wheel on a grey Ford Transit Custom"),
  ]),
  m("transit", "Ford", "Transit", "Ford Transit Alloy Wheels: Load Ratings and Fitment", []),
  m("transporter", "Volkswagen", "Transporter", "VW Transporter Alloy Wheels: What to Check Before You Fit", [
    photo("transporter", "9395.jpg", "Black multi-spoke alloy wheel on a white Volkswagen Transporter"),
    photo("transporter", "9326.jpg", "Black alloy wheel on a white Volkswagen Transporter"),
    photo("transporter", "9294.jpg", "Black alloy wheel on a blue Volkswagen Transporter"),
    photo("transporter", "8911.jpg", "Black multi-spoke alloy wheel on a dark Volkswagen Transporter"),
  ]),
  m("caddy", "Volkswagen", "Caddy", "VW Caddy Alloy Wheels: Load Ratings and Fitment", [
    photo("caddy", "7846.webp", "Two-tone alloy wheel on a green Volkswagen Caddy"),
    photo("caddy", "7939.jpg", "Black alloy wheel on a grey Volkswagen Caddy"),
  ]),
  m("vivaro", "Vauxhall", "Vivaro", "Vauxhall Vivaro Alloy Wheels: What to Check Before You Fit", [
    photo("vivaro", "12002.jpg", "Black alloy wheel on a silver Vauxhall Vivaro"),
  ]),
  m("sprinter", "Mercedes-Benz", "Sprinter", "Mercedes Sprinter Alloy Wheels: Load Ratings and Fitment", []),
];

export const findAlloyModel = (slug: string) => ALLOY_MODELS.find((a) => a.slug === slug);
export const ALLOY_BACKEND_SLUGS: readonly string[] = ALLOY_MODELS.map((a) => a.backendSlug);
export const ALLOY_PARENT = { path: "/van-accessories/van-alloy-wheels", h1: "Van alloy wheels" } as const;
