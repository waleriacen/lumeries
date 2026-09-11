#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator für das RDB-Lerntool.
Liest die strukturierten Inhaltsdateien (content/SB*_content.md), bettet passende
Abbildungen als base64 ein und erzeugt EINE offline-/JS-freie HTML-Datei.
Tabs via CSS-Radio-Pattern, Ausklappboxen via <details> (kein JS nötig).
Der Vorlese-Button ist die einzige optionale JS-Funktion (degradiert sauber).
"""
import os, re, base64, glob, html

BASE = os.path.dirname(os.path.abspath(__file__))
CONTENT = os.path.join(BASE, "content")
FIG = os.path.join(BASE, "figures")
OUT = os.path.join(BASE, "RDB-Lerntool.html")

BRIEFE = [
    ("SB1", "1", "Einführung in das System der beruflichen Bildung", "01-1110-001-2"),
    ("SB2", "2", "Rechtliche Grundlagen der Berufsbildung", "01-1110-002-2"),
    ("SB3", "3", "Schulrecht I – Recht der Ausbildung in den Pflege- und Gesundheitsberufen", "01-1110-003-2"),
    ("SB4", "4", "Schulrecht II", "01-1110-004-1"),
    ("SB5", "5", "Berufliche Bildung im internationalen Vergleich", "01-1110-005-2"),
    ("SB6", "6", "Heterogenität und Leistungsbewertung", "01-1108-005-2"),
]

# ---------------- Mini-Markdown ----------------
def esc(t):
    return html.escape(t, quote=False)

def inline_md(t):
    t = esc(t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"<em>\1</em>", t)
    t = t.replace("§", "§")
    return t

def table_to_html(lines):
    """lines: list of markdown table rows (contain '|')."""
    rows = [l for l in lines if l.strip().startswith("|") or "|" in l]
    cells = []
    for l in rows:
        if re.match(r"^\s*\|?\s*:?-{2,}", l) and set(l.replace("|","").replace(":","").replace("-","").strip())==set():
            continue  # separator
        if re.match(r"^\s*\|?[\s:|-]+\|?\s*$", l) and "-" in l:
            continue
        parts = [c.strip() for c in l.strip().strip("|").split("|")]
        cells.append(parts)
    if not cells:
        return ""
    head = cells[0]
    body = cells[1:]
    out = ['<div class="tablewrap"><table>']
    out.append("<thead><tr>" + "".join(f"<th>{inline_md(c)}</th>" for c in head) + "</tr></thead>")
    out.append("<tbody>")
    for r in body:
        out.append("<tr>" + "".join(f"<td>{inline_md(c)}</td>" for c in r) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)

def block_to_html(text):
    """Convert a block of text (paragraphs + possible tables) to HTML."""
    lines = text.split("\n")
    out = []
    buf = []
    tbl = []
    def flush_par():
        if buf:
            par = " ".join(x.strip() for x in buf if x.strip())
            if par:
                out.append(f"<p>{inline_md(par)}</p>")
            buf.clear()
    def flush_tbl():
        if tbl:
            out.append(table_to_html(tbl))
            tbl.clear()
    for l in lines:
        if "|" in l and l.strip().startswith("|"):
            flush_par()
            tbl.append(l)
        elif l.strip()=="" :
            flush_par(); flush_tbl()
        else:
            flush_tbl()
            buf.append(l)
    flush_par(); flush_tbl()
    return "\n".join(out)

# ---------------- Parser ----------------
def split_sections(md):
    secs = {}
    cur = None
    for line in md.split("\n"):
        m = re.match(r"^##\s+([A-ZÄÖÜ_]+)\s*$", line)
        if m:
            cur = m.group(1).strip()
            secs[cur] = []
        elif cur is not None:
            secs[cur].append(line)
    return {k:"\n".join(v).strip() for k,v in secs.items()}

def parse_erklaerung(txt):
    items = []
    cur_title=None; cur=[]
    for line in txt.split("\n"):
        m = re.match(r"^###\s+(.*)$", line)
        if m:
            if cur_title is not None:
                items.append((cur_title, "\n".join(cur).strip()))
            cur_title = m.group(1).strip(); cur=[]
        else:
            cur.append(line)
    if cur_title is not None:
        items.append((cur_title, "\n".join(cur).strip()))
    return items

def parse_cards(txt):
    cards=[]
    blocks = re.split(r"(?m)^###\s+K:\s*", txt)
    for b in blocks:
        b=b.strip()
        if not b: continue
        # first line = question
        nl = b.find("\n")
        q = b[:nl].strip() if nl!=-1 else b.strip()
        rest = b[nl+1:] if nl!=-1 else ""
        # split answer vs EINFACH
        ein=""
        ans=rest
        me = re.search(r"(?m)^EINFACH:\s*", rest)
        if me:
            ans = rest[:me.start()].strip()
            ein = rest[me.end():].strip()
        ans = re.sub(r"(?m)^A:\s*", "", ans).strip()
        ein = re.sub(r"^💡\s*Einfach erklärt:\s*", "", ein).strip()
        ein = re.sub(r"^Einfach erklärt:\s*", "", ein).strip()
        cards.append({"q":q,"a":ans,"e":ein})
    return cards

def parse_spick(txt):
    items=[]
    for line in txt.split("\n"):
        line=line.strip()
        if line.startswith("- "):
            items.append(line[2:].strip())
    return items

def parse_aufgaben(txt):
    out=[]
    blocks = re.split(r"(?m)^###\s+", txt)
    for b in blocks:
        b=b.strip()
        if not b: continue
        nl=b.find("\n")
        title=b[:nl].strip() if nl!=-1 else b
        rest=b[nl+1:] if nl!=-1 else ""
        frage=""; loes=""
        mf=re.search(r"(?m)^FRAGE:\s*",rest)
        ml=re.search(r"(?m)^LOESUNG:\s*",rest)
        if mf and ml:
            frage=rest[mf.end():ml.start()].strip()
            loes=rest[ml.end():].strip()
        else:
            frage=rest.strip()
        out.append({"t":title,"f":frage,"l":loes})
    return out

def parse_klausur(txt):
    out=[]
    blocks=re.split(r"(?m)^###\s+", txt)
    for b in blocks:
        b=b.strip()
        if not b or b.startswith("#"): continue
        nl=b.find("\n"); title=b[:nl].strip() if nl!=-1 else b; rest=b[nl+1:] if nl!=-1 else ""
        parts=[p.strip() for p in title.split("|")]
        nr=parts[0]; quelle=parts[1] if len(parts)>1 else ""; punkte=parts[2] if len(parts)>2 else ""
        frage=""; loes=""
        mf=re.search(r"(?m)^FRAGE:\s*",rest); ml=re.search(r"(?m)^LOESUNG:\s*",rest)
        if mf and ml:
            frage=rest[mf.end():ml.start()].strip(); loes=rest[ml.end():].strip()
        out.append({"nr":nr,"quelle":quelle,"punkte":punkte,"f":frage,"l":loes})
    return out

# Themen, die in der Übungsklausur gefragt wurden -> Markierung in Karteikarten/Spickzettel
KLAUSUR_PATTERNS = [
    (r"Halbwertszeit|Halbwertzeit", "ÜK 1.1"),
    (r"Formen der beruflichen Weiterbildung|Anpassungs- und Aufstiegsfortbildung|Anpassungsfortbildung|Lernen am Arbeitsplatz", "ÜK 1.2"),
    (r"BGJ|BVJ|Berufsgrundbildungsjahr|Berufsvorbereitungsjahr", "ÜK 2.1"),
    (r"(?<!nterkulturelle )Handlungskompetenz|vier Kompetenzen|aus welchen Bereichen", "ÜK 2.2"),
    (r"Personalrat|Betriebsrat", "ÜK 2.3"),
    (r"Regelungsbereiche", "ÜK 3.1"),
    (r"Krankenh", "ÜK 3.2"),
    (r"vorbehalten\w* Tätigkeit|Vorbehaltsaufgaben|vorbehaltene Aufgaben", "ÜK 3.3"),
    (r"Treuepflicht", "ÜK 4.1"),
    (r"Remonstration", "ÜK 4.2"),
    (r"Schulentwicklung", "ÜK 4.3"),
    (r"Modelle beruflicher Bildung|Marktmodell|Schulmodell|Kooperationsmodell|Kooperatives|Informelles Modell", "ÜK 5.1"),
    (r"Diversit[aä]tskompetenz", "ÜK 5.2/5.3"),
]
def klausur_tags(text):
    hits=[]
    for pat,lab in KLAUSUR_PATTERNS:
        if re.search(pat, text, re.I):
            hits.append(lab)
    return hits

# Themen der SB-Übungsaufgaben -> Markierung in Erklärungen/Karteikarten/Spickzettel
SB_PATTERNS = [
    # SB1
    (r"Berufsfunktion", "SB1: Berufsfunktionen"),
    (r"Vor- und Nachteile.{0,8}Dualen|Kritik am Dualen|Kritikpunkte|Pro und Contra", "SB1: Kritik/Vor-Nachteile Duales System"),
    (r"Arbeitsorientierung", "SB1: Berufs-/Arbeitsorientierung"),
    (r"Kompetenzentwicklung|Kompetenzgesellschaft", "SB1: Kompetenzentwicklung"),
    (r"Gestaltungskräfte|gesellschaftliche[ns]? Kräfte", "SB1: Gestaltungskräfte"),
    (r"Erstausbildung und Weiterbildung|Leitbild .?3K|\b3K\b", "SB1: Erstausbildung/Weiterbildung (3K)"),
    (r"Formen der beruflichen Weiterbildung|Anpassungsfortbildung|Aufstiegsfortbildung|Umschulung|Lernen am Arbeitsplatz", "SB1: Formen der Weiterbildung"),
    # SB2
    (r"Lernort", "SB2: Lernorte Betrieb/Berufsschule"),
    (r"Betriebsrat|Personalrat", "SB2: Aufgaben Betriebs-/Personalrat"),
    (r"Handlungskompetenz", "SB2: Handlungskompetenz"),
    (r"Ausbildungsordnung", "SB2: Ausbildungsordnung"),
    (r"Ausbildungsvertrag|Berufsausbildungsvertrag", "SB2: Ausbildungsvertrag"),
    (r"Rahmenlehrplan", "SB2: Rahmenlehrplan"),
    (r"Reform der Pflegeberufe|Pflegeberufereform", "SB2: Pflegeberufereform"),
    (r"\bKammer", "SB2: Kammern"),
    (r"\bDQR\b|Deutsche[rn] Qualifikationsrahmen", "SB2: DQR"),
    (r"Handlungsfähigkeit", "SB2: Handlungsfähigkeit"),
    (r"Pflichten.*(Auszubildend|Ausbildend)|(Auszubildend|Ausbildend).*Pflicht", "SB2: Pflichten Azubi/Ausbilder"),
    (r"Ausbildungsverhältnis|Beendigung", "SB2: Beginn/Ende Ausbildungsverhältnis"),
    (r"Jugend- und Auszubildendenvertretung|\bJAV\b", "SB2: JAV"),
    (r"Diskriminierung|Benachteiligung|\bAGG\b", "SB2: Diskriminierung/AGG"),
    # SB3
    (r"konkurrierende Gesetzgebung", "SB3: konkurrierende Gesetzgebung"),
    (r"Schulen des Gesundheitswesens", "SB3: Schulen des Gesundheitswesens"),
    (r"Berufsfachschul", "SB3: Berufsfachschulen"),
    (r"Gesundheitsfachberuf", "SB3: Gesundheitsfachberufe"),
    (r"\bKMK\b|Kultusministerkonferenz", "SB3: KMK"),
    (r"Praxisanleitung", "SB3: Praxisanleitung"),
    (r"Lehrkräfte", "SB3: Lehrkräfteausbildung/-qualifikation"),
    (r"Probezeit|Kündigung", "SB3: Probezeit/Kündigung"),
    (r"akademisierung", "SB3: Voll-/Teilakademisierung"),
    (r"Delegation|Heilkunde|G-?BA", "SB3: Delegation/Heilkunde (G-BA)"),
    (r"PflStudStG|hochschulische Pflegeausbildung", "SB3: PflStudStG"),
    # SB4
    (r"Schulleitung", "SB4: Schulleitung"),
    (r"Hausrecht", "SB4: Hausrecht"),
    (r"Vorgesetzt|Dienstvorgesetzt", "SB4: Vorgesetzte/Dienstvorgesetzte"),
    (r"Aufsicht", "SB4: Aufsichtspflicht"),
    (r"\bEltern", "SB4: Elternmitwirkung"),
    (r"Schülervertretung|Rechte und Pflichten der Schüler", "SB4: Schülerrechte/-vertretung"),
    (r"Schulkosten|Schulbudget|Finanzmittel", "SB4: Schulfinanzierung"),
    (r"Schulmonopol|Privatschul|Ersatzschul|Ergänzungsschul", "SB4: Privatschulen"),
    (r"\bBeamt", "SB4: Beamtenverhältnis"),
    (r"Pflichtverletzung|Amtshaftung", "SB4: Pflichtverletzung/Amtshaftung"),
    (r"Datenschutz|informationelle Selbstbestimmung", "SB4: Datenschutz"),
    # SB5
    (r"Input.*Outcome|Outcomewelt|Inputwelt|outcomeorientiert", "SB5: Input-/Outcome-Orientierung"),
    (r"Berufsbildungszusammenarbeit|systemisch|ganzheitlich", "SB5: Berufsbildungszusammenarbeit"),
    # SB6
    (r"Heterogenität", "SB6: Heterogenität"),
    (r"Inklusion|Integration", "SB6: Inklusion/Integration"),
    (r"Diagnose|Förderplan", "SB6: Diagnosen/Förderpläne"),
    (r"gemeinsame[rn]? Gegenstand|Baummodell", "SB6: Gemeinsamer Gegenstand/Baummodell"),
    (r"entwicklungslogisch", "SB6: entwicklungslogische Didaktik"),
    (r"Fehlerkultur|Feedback", "SB6: Feedback/Fehlerkultur"),
    (r"Leistungsbeurteilung|Lernerfolgskontrolle", "SB6: Leistungsbeurteilung"),
    (r"Instinkt", "SB6: Instinktreduktion/Wahrnehmung"),
]
def sb_tags(text):
    hits=[]
    for pat,lab in SB_PATTERNS:
        if re.search(pat, text, re.I):
            hits.append(lab)
    return hits

def badges(sb_text, uk_text=None):
    """📘 SB-Übungsaufgabe (sb_text) und ⭐ Übungsklausur (uk_text)."""
    if uk_text is None: uk_text=sb_text
    out=""
    ukt=klausur_tags(uk_text)
    if ukt:
        out+=(f'<span class="src src-klausur" title="In der Übungsklausur gefragt: '
              f'{", ".join(ukt)}">⭐ Übungsklausur</span>')
    sbt=sb_tags(sb_text)
    if sbt:
        out+=(f'<span class="src src-sb" title="Thema einer Übungsaufgabe im Studienbrief: '
              f'{esc("; ".join(sbt[:6]))}">📘 SB-Übungsaufgabe</span>')
    return out

def klausur_badge(text):  # rückwärtskompatibel
    return badges(text, text)

def parse_modelle(txt):
    out=[]
    for line in txt.split("\n"):
        line=line.strip()
        if not line.startswith("- "): continue
        body=line[2:]
        parts=[p.strip() for p in body.split("|")]
        name=parts[0] if parts else body
        seite=""
        desc=""
        if len(parts)>=2:
            mm=re.search(r"(\d+)", parts[1])
            seite=mm.group(1) if mm else ""
        if len(parts)>=3:
            desc=parts[2]
        out.append({"name":name,"seite":seite,"desc":desc})
    return out

# ---------------- Bilder ----------------
def list_figs(sb):
    res=[]
    for f in glob.glob(os.path.join(FIG,f"{sb}_p*.png")):
        bn=os.path.basename(f)
        m=re.match(rf"{sb}_p(\d+)_i(\d+)_(\d+)x(\d+)\.png", bn)
        if not m: continue
        page=int(m.group(1)); idx=int(m.group(2)); w=int(m.group(3)); h=int(m.group(4))
        if w<300 or h<150:   # Icons / dünne Streifen überspringen
            continue
        res.append({"file":f,"page":page,"idx":idx,"w":w,"h":h,"bn":bn})
    res.sort(key=lambda x:(x["page"],x["idx"]))
    return res

def b64(path):
    with open(path,"rb") as fh:
        return base64.b64encode(fh.read()).decode("ascii")

def figures_html(sb, modelle):
    import hashlib
    figs=list_figs(sb)
    if not figs:
        return ""
    # map page -> best caption from modelle
    cap_by_page={}
    for mo in modelle:
        if mo["seite"]:
            cap_by_page.setdefault(int(mo["seite"]), mo)
    out=['<div class="figs">']
    seen=set()
    for fg in figs:
        with open(fg["file"],"rb") as _fh:
            hsh=hashlib.md5(_fh.read()).hexdigest()
        if hsh in seen:   # exakte Duplikate (z. B. doppelt eingebettete Grafik) überspringen
            continue
        seen.add(hsh)
        mo=cap_by_page.get(fg["page"])
        if mo:
            cap=f'<strong>{inline_md(mo["name"])}</strong> – {inline_md(mo["desc"])} <span class="pg">(S. {fg["page"]})</span>'
        else:
            cap=f'<span class="pg">Abbildung S. {fg["page"]}</span>'
        data=b64(fg["file"])
        out.append(
            f'<figure><img alt="Abbildung Seite {fg["page"]}" '
            f'src="data:image/png;base64,{data}"><figcaption>{cap}</figcaption></figure>'
        )
    out.append("</div>")
    return "".join(out)

# ---------------- HTML-Bau ----------------
def tts_btn(idprefix):
    return (f'<button type="button" class="tts" data-tts="{idprefix}" '
            f'onclick="rdbSpeak(this)">🔊 Vorlesen</button>')

def build():
    data={}
    for sb,_,_,_ in BRIEFE:
        p=os.path.join(CONTENT,f"{sb}_content.md")
        with open(p,encoding="utf-8") as fh:
            md=fh.read()
        secs=split_sections(md)
        data[sb]={
            "erkl":parse_erklaerung(secs.get("ERKLAERUNG","")),
            "cards":parse_cards(secs.get("KARTEIKARTEN","")),
            "spick":parse_spick(secs.get("SPICKZETTEL","")),
            "aufg":parse_aufgaben(secs.get("UEBUNGSAUFGABEN","")),
            "modelle":parse_modelle(secs.get("MODELLE_BILDER","")),
        }

    # Übungsklausur laden
    klausur=[]
    kp=os.path.join(CONTENT,"UEBUNGSKLAUSUR.md")
    if os.path.exists(kp):
        with open(kp,encoding="utf-8") as fh:
            klausur=parse_klausur(fh.read())

    tabs=[("start","ℹ️ Start")]
    for sb,nr,_,_ in BRIEFE:
        tabs.append((sb.lower(), f"📘 SB{nr}"))
    tabs.append(("spick","📋 Spickzettel"))
    tabs.append(("abfrage","❓ Abfrage"))
    tabs.append(("uebung","📝 Übungen"))

    parts=[]
    parts.append(HEAD)

    # radios
    for i,(tid,_) in enumerate(tabs):
        checked=" checked" if tid=="start" else ""
        parts.append(f'<input type="radio" name="tab" id="tab-{tid}" class="tabradio"{checked}>')

    # nav
    parts.append('<nav class="tabbar">')
    for tid,label in tabs:
        parts.append(f'<label for="tab-{tid}" class="tablabel tl-{tid}">{label}</label>')
    parts.append('</nav>')

    parts.append('<main>')

    # START panel
    total_cards=sum(len(data[sb]["cards"]) for sb,_,_,_ in BRIEFE)
    total_aufg=sum(len(data[sb]["aufg"]) for sb,_,_,_ in BRIEFE)
    start=[f'<section class="panel p-start"><div class="card">']
    start.append('<h1>RDB – Rahmenbedingungen der Berufsbildung</h1>')
    start.append('<p class="lead">Dein interaktives Lerntool für die Klausur <strong>MP00-RDB-PK1</strong>. '
                 'Funktioniert komplett offline und ohne JavaScript.</p>')
    start.append('<div class="exambox"><strong>📅 Klausur:</strong> 14.03.2026, 9:00 Uhr · '
                 '<strong>⏱ Dauer:</strong> 100 Minuten · <strong>🎯 Punkte:</strong> 100 · '
                 '<strong>📚 Stoff:</strong> 6 Studienbriefe · <strong>🛠 Hilfsmittel:</strong> keine</div>')
    start.append('<h2>Die 6 prüfungsrelevanten Briefe</h2><ol class="brieflist">')
    for sb,nr,titel,code in BRIEFE:
        start.append(f'<li><label for="tab-{sb.lower()}"><strong>SB{nr}:</strong> {esc(titel)} '
                     f'<span class="code">{code}</span></label></li>')
    start.append('</ol>')
    start.append('<h2>So nutzt du das Tool</h2><ul class="howto">')
    start.append('<li>📘 <strong>SB-Reiter:</strong> einfache Erklärungen mit Beispielen, Modell-Bilder und Karteikarten.</li>')
    start.append('<li>📇 <strong>Karteikarten:</strong> Antwort & „💡 Einfach erklärt" per Tipp aufklappen.</li>')
    start.append('<li>❓ <strong>Abfrage:</strong> nur Fragen sichtbar – Antwort erst aufklappen (deckungsgleich mit den Karteikarten).</li>')
    start.append('<li>📝 <strong>Übungen:</strong> die <strong>HFH-Übungsklausur</strong> (Originalaufgaben) '
                 '<em>und</em> alle Übungsaufgaben aus den Briefen – mit vollständigen Musterlösungen.</li>')
    start.append('<li>📋 <strong>Spickzettel:</strong> alle Definitionen & Modelle kompakt.</li>')
    start.append('<li>⭐ <strong>Markierungen (in Erklärungen, Karteikarten & Spickzettel):</strong> '
                 '<span class="src src-klausur">⭐ Übungsklausur</span> = Thema wurde in der HFH-Übungsklausur gefragt; '
                 '<span class="src src-sb">📘 SB-Übungsaufgabe</span> = Thema ist Gegenstand einer Übungsaufgabe im Studienbrief. '
                 'So erkennst du beim Lernen sofort die geprüften/geübten Themen. (Per Tippen/Hover zeigt das Badge die genaue Aufgabe.)</li>')
    start.append('<li>🔊 <strong>Vorlesen:</strong> liest Abschnitte vor (nur im echten Browser mit JS; Vorschau ignoriert ihn).</li>')
    start.append('</ul>')
    start.append(f'<p class="meta">Insgesamt {total_cards} Karteikarten · {total_aufg} Übungsaufgaben.</p>')
    start.append('</div></section>')
    parts.append("".join(start))

    # BRIEF panels
    for sb,nr,titel,code in BRIEFE:
        d=data[sb]
        sp=[f'<section class="panel p-{sb.lower()}">']
        sp.append(f'<div class="briefhead"><span class="badge">SB{nr}</span>'
                  f'<div><h1>{esc(titel)}</h1><span class="code">{code}</span></div></div>')

        # Erklärungen
        sp.append('<h2 class="sech">📖 Erklärungen</h2>')
        for j,(t,body) in enumerate(d["erkl"]):
            bid=f"{sb}-erk-{j}"
            eb=badges(t+" "+body)
            sp.append('<div class="card erk">')
            sp.append(f'<h3>{inline_md(t)} {eb} {tts_btn(bid)}</h3>')
            sp.append(f'<div class="ttsblock" id="{bid}">{block_to_html(body)}</div>')
            sp.append('</div>')

        # Modelle/Bilder
        figs_html=figures_html(sb, d["modelle"])
        if figs_html or d["modelle"]:
            sp.append('<h2 class="sech">🖼 Modelle & Abbildungen</h2>')
            if figs_html:
                sp.append('<div class="card">'+figs_html+'</div>')
            # textual model list (always, as overview)
            sp.append('<details class="moddetails"><summary>Alle Modelle/Abbildungen dieses Briefs (Übersicht)</summary><ul class="modlist">')
            for mo in d["modelle"]:
                pg=f' <span class="pg">(S. {mo["seite"]})</span>' if mo["seite"] else ""
                sp.append(f'<li><strong>{inline_md(mo["name"])}</strong>{pg}: {inline_md(mo["desc"])}</li>')
            sp.append('</ul></details>')

        # Karteikarten
        sp.append('<h2 class="sech">📇 Karteikarten</h2>')
        for k,c in enumerate(d["cards"]):
            badge=badges(c["q"])
            hl=' isklausur' if klausur_tags(c["q"]) else ''
            sp.append('<div class="flash'+hl+'">')
            sp.append(f'<div class="q">❓ {inline_md(c["q"])} {badge}</div>')
            sp.append(f'<div class="a">{block_to_html(c["a"])}</div>')
            if c["e"]:
                sp.append('<details class="einfach"><summary>💡 Einfach erklärt</summary>'
                          f'<div>{block_to_html(c["e"])}</div></details>')
            sp.append('</div>')
        sp.append('</section>')
        parts.append("".join(sp))

    # SPICKZETTEL panel
    spk=['<section class="panel p-spick"><div class="card">']
    spk.append('<h1>📋 Spickzettel – alle Definitionen & Modelle</h1>')
    spk.append('<p class="lead">Kompakte Zusammenfassung aller prüfungsrelevanten Begriffe pro Brief.</p>')
    spk.append('</div>')
    for sb,nr,titel,_ in BRIEFE:
        spk.append('<div class="card">')
        spk.append(f'<h2 class="sech">SB{nr} – {esc(titel)} {tts_btn("spick-"+sb)}</h2>')
        spk.append(f'<ul class="spick ttsblock" id="spick-{sb}">')
        for it in data[sb]["spick"]:
            spk.append(f'<li>{inline_md(it)} {klausur_badge(it)}</li>')
        spk.append('</ul></div>')
    spk.append('</section>')
    parts.append("".join(spk))

    # ABFRAGE panel (deckungsgleich mit Karteikarten)
    ab=['<section class="panel p-abfrage"><div class="card">']
    ab.append('<h1>❓ Abfragemodus</h1>')
    ab.append('<p class="lead">Beantworte jede Frage zuerst im Kopf, dann klappe die Antwort auf. '
              'Die Fragen sind deckungsgleich mit den Karteikarten.</p></div>')
    for sb,nr,titel,_ in BRIEFE:
        ab.append(f'<div class="card"><h2 class="sech">SB{nr} – {esc(titel)}</h2>')
        for c in data[sb]["cards"]:
            ab.append('<details class="quiz"><summary>'+inline_md(c["q"])+' '+klausur_badge(c["q"])+'</summary>')
            ab.append('<div class="qa">'+block_to_html(c["a"]))
            if c["e"]:
                ab.append('<div class="qe"><strong>💡 Einfach erklärt:</strong> '+block_to_html(c["e"])+'</div>')
            ab.append('</div></details>')
        ab.append('</div>')
    ab.append('</section>')
    parts.append("".join(ab))

    # UEBUNG panel
    ue=['<section class="panel p-uebung"><div class="card">']
    ue.append('<h1>📝 Übungsaufgaben mit Musterlösungen</h1>')
    ue.append('<p class="lead">Zwei Quellen, klar gekennzeichnet: die <strong>Übungsklausur der HFH</strong> '
              '(beste Klausur-Vorbereitung) und die <strong>Übungsaufgaben aus den Studienbriefen</strong>. '
              'Versuche es zuerst selbst, dann klappe die Musterlösung auf.</p>')
    ue.append('<p class="legend"><span class="src src-klausur">⭐ Übungsklausur</span> = Originalfrage aus der HFH-Übungsklausur &nbsp; '
              '<span class="src src-sb">📘 SB-Übungsaufgabe</span> = Aufgabe aus dem Studienbrief</p></div>')

    # Übungsklausur-Block (oben)
    if klausur:
        kpunkte=sum(int(re.search(r"\d+",x["punkte"]).group()) for x in klausur if re.search(r"\d+",x["punkte"]))
        ue.append('<div class="card klausurcard">')
        ue.append('<h2 class="sech">⭐ Übungsklausur (HFH) – Originalaufgaben</h2>')
        ue.append(f'<p class="lead">Offizielle HFH-Übungsklausur zur Prüfungsleistung MP00-RDB-PK1 · '
                  f'Bearbeitungszeit 100 Minuten · 5 Aufgaben · 100 Punkte. '
                  f'Jede Frage mit Quelle (Studienbrief/Seite) und Punkten.</p>')
        for a in klausur:
            ue.append('<div class="aufg isklausur">')
            meta=[]
            if a["quelle"]: meta.append(esc(a["quelle"]))
            if a["punkte"]: meta.append(esc(a["punkte"]))
            metahtml=f' <span class="pg">({" · ".join(meta)})</span>' if meta else ""
            ue.append(f'<div class="at"><span class="src src-klausur">⭐ Übungsklausur</span> '
                      f'Aufgabe {esc(a["nr"].replace("Aufgabe ",""))}{metahtml}</div>')
            ue.append(f'<div class="af">{block_to_html(a["f"])}</div>')
            if a["l"]:
                ue.append('<details class="loes"><summary>✅ Musterlösung anzeigen</summary>'
                          f'<div>{block_to_html(a["l"])}</div></details>')
            ue.append('</div>')
        ue.append('</div>')

    # Studienbrief-Übungsaufgaben
    for sb,nr,titel,_ in BRIEFE:
        if not data[sb]["aufg"]: continue
        ue.append(f'<div class="card"><h2 class="sech">📘 SB{nr} – {esc(titel)} (Übungsaufgaben)</h2>')
        for a in data[sb]["aufg"]:
            ue.append('<div class="aufg">')
            ue.append(f'<div class="at"><span class="src src-sb">📘 SB{nr}-Übungsaufgabe</span> {inline_md(a["t"])}</div>')
            ue.append(f'<div class="af">{block_to_html(a["f"])}</div>')
            if a["l"]:
                ue.append('<details class="loes"><summary>✅ Musterlösung anzeigen</summary>'
                          f'<div>{block_to_html(a["l"])}</div></details>')
            ue.append('</div>')
        ue.append('</div>')
    ue.append('</section>')
    parts.append("".join(ue))

    parts.append('</main>')
    parts.append(FOOT)
    parts.append(SCRIPT)
    parts.append('</body></html>')

    out="\n".join(parts)
    with open(OUT,"w",encoding="utf-8") as fh:
        fh.write(out)
    size=os.path.getsize(OUT)
    print(f"OK -> {OUT}  ({size/1024:.0f} KB)")
    print(f"Karteikarten gesamt: {total_cards} | Übungsaufgaben gesamt: {total_aufg}")

# ---------------- statische Bausteine ----------------
HEAD = """<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RDB Lerntool – Rahmenbedingungen der Berufsbildung</title>
<style>
:root{
  --bg:#0f172a; --bg2:#1e293b; --card:#ffffff; --ink:#0f172a; --muted:#64748b;
  --pri:#2563eb; --pri2:#1d4ed8; --acc:#0ea5e9; --good:#16a34a; --warn:#f59e0b;
  --line:#e2e8f0; --soft:#f1f5f9; --chip:#eff6ff;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  background:linear-gradient(180deg,#0f172a,#1e293b 240px,#f1f5f9 240px,#f1f5f9);color:var(--ink);
  line-height:1.55;font-size:17px;-webkit-font-smoothing:antialiased}
main{max-width:880px;margin:0 auto;padding:14px 14px 80px}
h1{font-size:1.45rem;margin:.2em 0 .4em;line-height:1.25}
h2{font-size:1.18rem;margin:1.1em 0 .5em}
h3{font-size:1.04rem;margin:.2em 0 .5em;color:var(--pri2)}
p{margin:.5em 0}
.lead{color:#334155}
.code{display:inline-block;font:600 .72rem/1.4 ui-monospace,Menlo,monospace;color:#475569;
  background:#e2e8f0;padding:1px 7px;border-radius:6px;white-space:nowrap}
/* Tabs via radio */
.tabradio{position:absolute;opacity:0;pointer-events:none;width:0;height:0}
.tabbar{position:sticky;top:0;z-index:20;display:flex;flex-wrap:wrap;gap:6px;
  background:rgba(15,23,42,.96);backdrop-filter:blur(6px);padding:10px;max-width:880px;margin:0 auto;
  border-bottom-left-radius:14px;border-bottom-right-radius:14px}
.tablabel{cursor:pointer;user-select:none;font-size:.86rem;font-weight:600;color:#cbd5e1;
  background:#334155;padding:7px 11px;border-radius:999px;white-space:nowrap;border:1px solid transparent}
.tablabel:hover{background:#475569;color:#fff}
/* Fallback: ohne :checked-Unterstützung sind ALLE Panels sichtbar (nie leere Seite). */
.panel{display:block;animation:fade .2s ease}
@keyframes fade{from{opacity:.3}to{opacity:1}}
/* Sobald irgendein Radio funktioniert: alle ausblenden, danach nur das gewählte zeigen. */
.tabradio:checked ~ main .panel{display:none}
/* Verknüpfung radio -> label aktiv + panel sichtbar */
#tab-start:checked      ~ .tabbar .tl-start,
#tab-sb1:checked        ~ .tabbar .tl-sb1,
#tab-sb2:checked        ~ .tabbar .tl-sb2,
#tab-sb3:checked        ~ .tabbar .tl-sb3,
#tab-sb4:checked        ~ .tabbar .tl-sb4,
#tab-sb5:checked        ~ .tabbar .tl-sb5,
#tab-sb6:checked        ~ .tabbar .tl-sb6,
#tab-spick:checked      ~ .tabbar .tl-spick,
#tab-abfrage:checked    ~ .tabbar .tl-abfrage,
#tab-uebung:checked     ~ .tabbar .tl-uebung{
  background:linear-gradient(180deg,var(--acc),var(--pri));color:#fff;border-color:#fff3}
#tab-start:checked      ~ main .p-start,
#tab-sb1:checked        ~ main .p-sb1,
#tab-sb2:checked        ~ main .p-sb2,
#tab-sb3:checked        ~ main .p-sb3,
#tab-sb4:checked        ~ main .p-sb4,
#tab-sb5:checked        ~ main .p-sb5,
#tab-sb6:checked        ~ main .p-sb6,
#tab-spick:checked      ~ main .p-spick,
#tab-abfrage:checked    ~ main .p-abfrage,
#tab-uebung:checked     ~ main .p-uebung{display:block}
/* Fallback ohne CSS-:checked-Unterstützung: per @supports nichts nötig,
   aber falls Selektoren ignoriert werden, zeige wenigstens Start nicht leer */
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 16px;
  margin:12px 0;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.exambox{background:var(--chip);border:1px solid #bfdbfe;border-radius:12px;padding:10px 12px;margin:10px 0;
  font-size:.92rem;color:#1e3a8a}
.brieflist{margin:.4em 0;padding-left:1.2em}
.brieflist li{margin:.45em 0}
.brieflist label{cursor:pointer;color:var(--pri2);text-decoration:underline}
.howto{padding-left:1.1em}.howto li{margin:.35em 0;font-size:.95rem}
.meta{color:var(--muted);font-size:.85rem}
.briefhead{display:flex;gap:12px;align-items:center;margin:14px 0 4px}
.badge{flex:none;display:grid;place-items:center;width:48px;height:48px;border-radius:12px;
  background:linear-gradient(180deg,var(--acc),var(--pri));color:#fff;font-weight:800;font-size:1.05rem}
.sech{border-left:5px solid var(--pri);padding-left:10px}
.erk h3{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
/* Flashcards */
.flash{background:#fff;border:1px solid var(--line);border-left:4px solid var(--acc);
  border-radius:12px;padding:12px 14px;margin:10px 0}
.flash .q{font-weight:700;color:#0f172a}
.flash .a{margin-top:6px;color:#1f2937}
details.einfach{margin-top:8px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:2px 10px}
details.einfach summary{cursor:pointer;font-weight:700;color:#92400e;padding:8px 0}
details.einfach[open]{padding-bottom:10px}
details.einfach > div{color:#78350f}
/* Quiz / Abfrage */
details.quiz,details.loes{border:1px solid var(--line);border-radius:10px;margin:8px 0;background:#fff}
details.quiz>summary{cursor:pointer;font-weight:600;padding:11px 12px;list-style:none}
details.quiz>summary::-webkit-details-marker{display:none}
details.quiz>summary::before{content:"❓ ";}
details.quiz[open]>summary{border-bottom:1px solid var(--line);color:var(--pri2)}
.qa{padding:11px 13px;color:#1f2937}
.qe{margin-top:8px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:8px 10px;color:#78350f}
/* Übungen */
.aufg{border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:10px 0;background:#fff}
.at{font-weight:800;color:var(--pri2)}
.af{margin:6px 0;color:#0f172a}
details.loes>summary{cursor:pointer;font-weight:700;color:#166534;background:#f0fdf4;
  padding:10px 12px;border-radius:8px;list-style:none}
details.loes>summary::-webkit-details-marker{display:none}
details.loes[open]>summary{border-bottom-left-radius:0;border-bottom-right-radius:0}
details.loes>div{padding:11px 13px;border:1px solid #bbf7d0;border-top:0;border-radius:0 0 8px 8px}
/* Spickzettel */
ul.spick{margin:.3em 0;padding-left:1.1em}
ul.spick li{margin:.35em 0;font-size:.93rem}
.modlist{padding-left:1.1em}.modlist li{margin:.3em 0;font-size:.9rem}
details.moddetails{margin:8px 0;background:#f8fafc;border:1px solid var(--line);border-radius:10px;padding:2px 12px}
details.moddetails summary{cursor:pointer;font-weight:600;padding:9px 0;color:#334155}
/* Tabellen */
.tablewrap{overflow-x:auto;margin:8px 0;-webkit-overflow-scrolling:touch}
table{border-collapse:collapse;width:100%;font-size:.86rem;min-width:280px}
th,td{border:1px solid var(--line);padding:7px 9px;text-align:left;vertical-align:top}
thead th{background:var(--soft);color:#0f172a}
tbody tr:nth-child(even){background:#fafcff}
/* Bilder */
.figs{display:grid;gap:14px}
figure{margin:0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}
figure img{display:block;width:100%;height:auto;background:#fff}
figcaption{font-size:.82rem;color:#475569;padding:8px 10px;border-top:1px solid var(--line);background:#f8fafc}
.pg{color:var(--muted);font-size:.8rem}
/* Quellen-Badges */
.src{display:inline-block;font:700 .68rem/1.3 inherit;padding:2px 8px;border-radius:999px;
  white-space:nowrap;vertical-align:middle}
.src-klausur{background:#fef3c7;color:#92400e;border:1px solid #fde68a}
.src-sb{background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe}
.flash.isklausur{border-left-color:#f59e0b;background:#fffdf5}
.aufg.isklausur{border-color:#fde68a;background:#fffdf5}
.klausurcard{border-color:#fde68a;box-shadow:0 0 0 2px #fef3c7 inset}
.legend{font-size:.84rem;color:#475569;margin:.4em 0 0}
details.quiz>summary .src{margin-left:4px}
.tts{font:600 .72rem/1 inherit;color:#0369a1;background:#e0f2fe;border:1px solid #bae6fd;
  border-radius:999px;padding:5px 9px;cursor:pointer}
.tts:hover{background:#bae6fd}
footer{max-width:880px;margin:0 auto;padding:18px 14px 40px;color:#94a3b8;font-size:.8rem;text-align:center}
@media(max-width:520px){
  body{font-size:16px}
  .tablabel{font-size:.8rem;padding:6px 9px}
  h1{font-size:1.28rem}
}
</style>
</head>
<body>
"""

FOOT = """<footer>
RDB-Lerntool · erstellt aus den 6 prüfungsrelevanten Studienbriefen (HFH) ·
funktioniert offline & ohne JavaScript · Vorlese-Funktion benötigt einen Browser mit JS.<br>
Viel Erfolg bei der Klausur am 14.03.2026! 🍀
</footer>
"""

SCRIPT = """<script>
/* Einzige JS-Funktion: Vorlesen via Web Speech API. Alles andere läuft ohne JS. */
(function(){
  if(!('speechSynthesis' in window)) return;
  var pickedURI=null;
  function pickVoice(){
    var vs=window.speechSynthesis.getVoices()||[];
    var de=vs.filter(function(v){return /de(-|_|$)/i.test(v.lang)});
    if(!de.length) de=vs;
    var pref=['Anna','Petra','Markus','Google Deutsch','Helena','Viktor','Microsoft'];
    for(var p=0;p<pref.length;p++){
      for(var i=0;i<de.length;i++){ if(de[i].name.indexOf(pref[p])>=0){pickedURI=de[i].voiceURI;return de[i];} }
    }
    var loc=de.filter(function(v){return v.localService});
    var chosen=(loc[0]||de[0]); if(chosen)pickedURI=chosen.voiceURI; return chosen;
  }
  if(typeof speechSynthesis!=='undefined'){ speechSynthesis.onvoiceschanged=pickVoice; }
  window.rdbSpeak=function(btn){
    try{
      var id=btn.getAttribute('data-tts');
      var el=document.getElementById(id);
      if(!el) el=btn.parentNode;
      var txt=el.innerText||el.textContent||'';
      if(window.speechSynthesis.speaking){ window.speechSynthesis.cancel();
        if(btn.dataset.on==='1'){btn.dataset.on='0';btn.textContent='🔊 Vorlesen';return;} }
      var u=new SpeechSynthesisUtterance(txt);
      u.lang='de-DE'; u.rate=1.0; u.pitch=1.0;
      var v=null,vs=window.speechSynthesis.getVoices()||[];
      for(var i=0;i<vs.length;i++){ if(vs[i].voiceURI===pickedURI){v=vs[i];break;} }
      if(!v) v=pickVoice();
      if(v) u.voice=v;
      btn.dataset.on='1'; btn.textContent='⏹ Stop';
      u.onend=function(){btn.dataset.on='0';btn.textContent='🔊 Vorlesen';};
      window.speechSynthesis.speak(u);
    }catch(e){}
  };
})();
</script>
"""

if __name__=="__main__":
    build()
