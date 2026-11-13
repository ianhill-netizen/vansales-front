#!/usr/bin/env python3
"""Builds lib/geo/places.json: every UK populated place of 10,000+ people (GeoNames GB extract, CC BY 4.0 -- https://www.geonames.org).
Usage: python3 scripts/build-places.py <GB.txt> <admin2Codes.txt>
Each place gets its nation, one of the 12 UK regions (by county code), a slug and coordinates; the cities in CITIES are flagged so the town route skips them."""
import csv, json, re, sys, unicodedata

GB, A2 = sys.argv[1], sys.argv[2]
MIN_POP = 10000
REGIONS = {
 "north-east": "D1 D8 E5 F5 I5 I7 J5 J6 K9 M7 N3 N6",
 "north-west": "A8 A9 B1 C1 C9 E9 G9 H2 H8 I2 K1 L2 L5 L8 N1 N2 O1 O6 P2 P7 Q1 Z7 Z8",
 "yorkshire-and-the-humber": "A3 B4 C2 D5 E1 G6 G8 H3 J2 J3 J7 L3 L9 O7 Q5",
 "east-midlands": "D2 D3 H4 H5 H7 L4 J8 J9 NNH WNH",
 "west-midlands": "A7 C7 D7 F7 L6 L7 M2 M9 N4 O2 O8 P3 Q3 Q4",
 "east-of-england": "C3 E4 F8 I1 I9 K3 M5 N5 O3 Z5 Z6",
 "london": "GLA",
 "south-east": "B3 B6 B9 E2 F2 G2 G5 I3 I6 K2 K6 K7 M1 M4 N7 P4 P6 P9 Q2",
 "south-west": "A4 AA B7 C6 D4 D6 E6 J4 K4 M3 M6 N9 O4 P8",
}
CODE_REGION = {c: r for r, cs in REGIONS.items() for c in cs.split()}
NATION = {"ENG": "england", "SCT": "scotland", "WLS": "wales", "NIR": "northern-ireland"}
# (key, label, GeoNames name, nation): official cities of 100,000+ people, plus Inverness, Derry and Bridgend (named in the brief).
CITIES = [
 ("birmingham","Birmingham","Birmingham"),("bradford","Bradford","Bradford"),("brighton","Brighton","Brighton"),("bristol","Bristol","Bristol"),("cambridge","Cambridge","Cambridge"),
 ("coventry","Coventry","Coventry"),("derby","Derby","Derby"),("exeter","Exeter","Exeter"),("gloucester","Gloucester","Gloucester"),("hull","Hull","Kingston upon Hull"),
 ("leeds","Leeds","Leeds"),("leicester","Leicester","Leicester"),("liverpool","Liverpool","Liverpool"),("london","London","London"),("manchester","Manchester","Manchester"),
 ("newcastle","Newcastle","Newcastle upon Tyne"),("norwich","Norwich","Norwich"),("nottingham","Nottingham","Nottingham"),("oxford","Oxford","Oxford"),("peterborough","Peterborough","Peterborough"),
 ("plymouth","Plymouth","Plymouth"),("portsmouth","Portsmouth","Portsmouth"),("preston","Preston","Preston"),("salford","Salford","Salford"),("sheffield","Sheffield","Sheffield"),
 ("southampton","Southampton","Southampton"),("stoke-on-trent","Stoke-on-Trent","Stoke-on-Trent"),("sunderland","Sunderland","Sunderland"),("wakefield","Wakefield","Wakefield"),
 ("wolverhampton","Wolverhampton","Wolverhampton"),("york","York","York"),("worcester","Worcester","Worcester"),("bath","Bath","Bath"),("lincoln","Lincoln","Lincoln"),
 ("glasgow","Glasgow","Glasgow"),("edinburgh","Edinburgh","Edinburgh"),("aberdeen","Aberdeen","Aberdeen"),("dundee","Dundee","Dundee"),("inverness","Inverness","Inverness"),
 ("cardiff","Cardiff","Cardiff"),("swansea","Swansea","Swansea"),("newport","Newport","Newport"),("bridgend","Bridgend","Bridgend"),
 ("belfast","Belfast","Belfast"),("derry","Derry","Derry"),
]
EXCLUDE = {"Mendip"}   # a council district, not a town
def slugify(s):
    s = unicodedata.normalize("NFD", s); s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
def clean_county(n):
    n = re.sub(r"^(City and Borough of|Metropolitan Borough of|Royal Borough of|Borough of|City of|District of)\s+", "", n)
    return re.sub(r"\s+Council$", "", n)
a2 = {}
for row in csv.reader(open(A2, encoding="utf-8"), delimiter="\t"):
    a2[row[0]] = clean_county(row[1])
rows = []
for row in csv.reader(open(GB, encoding="utf-8"), delimiter="\t", quoting=csv.QUOTE_NONE):
    if row[6] != "P" or int(row[14] or 0) < MIN_POP or row[10] not in NATION: continue
    rows.append(dict(name=row[1], lat=float(row[4]), lng=float(row[5]), nat=row[10], a2=row[11], pop=int(row[14])))
cityname = {c[2]: c for c in CITIES}
out, used, missing = [], set(), []
for r in sorted(rows, key=lambda x: -x["pop"]):
    if r["name"] in EXCLUDE: continue
    nation = NATION[r["nat"]]
    if nation == "england":
        region = CODE_REGION.get(r["a2"])
        if region is None: raise SystemExit(f"unmapped English county code {r['a2']} for {r['name']}")
    else: region = nation
    county = a2.get(f"GB.{r['nat']}.{r['a2']}") or ("Greater London" if r["a2"] == "GLA" else "")
    if r["a2"] == "GLA": county = "Greater London"
    city = cityname.get(r["name"])
    if city and city[0] in used: city = None
    slug = city[0] if city else slugify(r["name"])
    if not city:
        if slug in {c[0] for c in CITIES} or slug in used: slug = slugify(f"{r['name']} {county}")
        if slug in used: continue
    used.add(slug)
    e = {"s": slug, "n": city[1] if city else r["name"], "c": county, "r": region, "t": nation, "la": round(r["lat"], 4), "ln": round(r["lng"], 4), "p": r["pop"]}
    if city: e["city"] = True
    out.append(e)
for k, lab, g in CITIES:
    if not any(o.get("city") and o["s"] == k for o in out): missing.append(k)
if missing: raise SystemExit(f"cities not found in the gazetteer: {missing}")
json.dump(out, open("lib/geo/places.json", "w"), separators=(",", ":"), ensure_ascii=False)
print(len(out), "places;", sum(1 for o in out if o.get("city")), "cities")
