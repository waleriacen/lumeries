#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""1-Seiten-A4-Lernzettel RDB (zum Auswendiglernen VOR der Klausur). 2 Spalten, kompakt."""
import os, re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                 FrameBreak, Table, TableStyle)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont("DV","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB","/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFontFamily("DV", normal="DV", bold="DVB", italic="DV", boldItalic="DVB")

OUT=os.path.dirname(os.path.abspath(__file__))+"/RDB-Lernzettel-1Seite.pdf"

INK=colors.HexColor("#0f172a"); MUT=colors.HexColor("#475569")
def hx(c): return colors.HexColor(c)

S_txt=ParagraphStyle("t",fontName="DV",fontSize=8.6,leading=10.6,textColor=INK,spaceAfter=2.4)
S_note=ParagraphStyle("n",fontName="DV",fontSize=7.6,leading=9.4,textColor=MUT)
S_title=ParagraphStyle("ti",fontName="DVB",fontSize=16,leading=17,textColor=hx("#1d4ed8"))
S_sub=ParagraphStyle("su",fontName="DV",fontSize=8.4,leading=10,textColor=MUT)

def hstyle(bg): return ParagraphStyle("h",fontName="DVB",fontSize=9.4,leading=10.6,textColor=colors.white,
                                      backColor=hx(bg),borderPadding=(3,4,3,4),spaceBefore=5,spaceAfter=3)
def esc(t): return t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
def md(t): return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", esc(t))

def blk(title, bg, lines):
    fl=[Paragraph(title, hstyle(bg))]
    for ln in lines:
        fl.append(Paragraph("• "+md(ln), S_txt))
    return fl

def build():
    story=[]
    # Kopf (über beide Spalten via erstem Frame? -> wir setzen Kopf in linke Spalte oben)
    story.append(Paragraph("RDB – Lernzettel auf einer Seite", S_title))
    story.append(Paragraph("Rahmenbedingungen der Berufsbildung · Klausur MP00-RDB-PK1 · "
                           "<b>zum Auswendiglernen vor der Prüfung</b> · Fett = Stichwort", S_sub))
    story.append(Paragraph("Klausur-Landkarte: A1 Einführung (16P) · A2 Rechtl. Grundlagen (24P) · "
                           "A3 Schulrecht I (18P) · A4 Schulrecht II (18P) · A5 Internat. Vergleich (24P)", S_note))
    story.append(Spacer(1,2))

    # SB1
    story+=blk("SB1 · EINFÜHRUNG / DUALES SYSTEM", "#1d4ed8", [
        "**Duales System:** Betrieb (Praxis, Ernstsituation) + Berufsschule (Theorie, Schonraum); BBiG 1969.",
        "**„dual\" = 2 Bedeutungen:** Lernorte Betrieb/Schule UND Zuständigkeit Bund (Betrieb)/Länder (Schule).",
        "**Subsidiarität:** Staat hält sich zurück, solange Gesellschaft es selbst regelt (Hilfe z. Selbsthilfe).",
        "**Konsensprinzip:** Entscheidung nur ohne Gegenstimme (nicht Mehrheit). **Tripartismo:** AG+AN+Staat.",
        "**8 Berufsfunktionen (Lipsmeier):** Erwerb, Sozialisation, Ganzheit, Kontinuität, Erbauung, Qualifikation, Allokation, Selektion.",
        "**Halbwertszeit d. Wissens:** 50 % veraltet – IT ~2 J., Hochschule ~11 J., Schule ~20 J. → lebenslanges Lernen.",
        "**Weiterbildung:** Fortbildung (Anpassung=aktuell bleiben / Aufstieg=Meister,Techniker), Umschulung, Lernen am Arbeitsplatz.",
        "**Leitbild 3K:** kontinuierliche + kohärente Kompetenzentwicklung (Sockelqualifizierung).",
        "**BIBB:** erforscht/erarbeitet Ausbildungsordnungen; Hauptausschuss je 16 AG/AN/Bund/Länder.",
    ])
    # SB2
    story+=blk("SB2 · RECHTLICHE GRUNDLAGEN", "#0e7490", [
        "**BGJ vs. BVJ:** BGJ = anrechenbar als 1. Ausb.jahr, hat Abschluss. BVJ = nicht anrechenbar, holt Hauptschulabschluss nach.",
        "**Handlungskompetenz (4):** **Fach** – **Methoden** – **Sozial** – **Persönlichkeit** (je 1 Beispiel können!).",
        "**Betriebsrat/Personalrat:** schützen AN-Rechte, überwachen Einhaltung der Gesetze. BR=privat (BetrVG), PR=öff. Dienst.",
        "**Ausbildungsordnung (§28 BBiG):** Ausschließlichkeitsgrundsatz – nur danach ausbilden. Enthält Berufsbild, Dauer, Rahmenplan, Prüfung.",
        "**Ausbildungsvertrag:** vor Beginn, schriftlich; Kammer trägt ins Verzeichnis ein.",
        "**DQR (2013):** macht Qualifikationen europaweit vergleichbar (8 Niveaus).",
    ])
    # SB3
    story+=blk("SB3 · SCHULRECHT I (PFLEGE/GESUNDHEIT)", "#047857", [
        "**3 Regelungsbereiche:** (1) duales System/BBiG · (2) Berufsfachschulen n. Landesrecht · (3) Berufszulassungsgesetze/Schulen d. Gesundheitswesens.",
        "**Finanzierung dual:** Betrieb (Praxis) + Staat (Schule). **Krankenhaus:** trägt ALLES selbst → über Krankenversicherungen (KHG, Ausgleichsfonds 2006).",
        "**Vorbehaltene Tätigkeiten (§4 PflBG):** nur Pflegefachkräfte: Pflegebedarf erheben · Pflegeprozess steuern · Pflegequalität sichern.",
        "**Gesundheitsfachberufe:** eigene Berufszulassungsgesetze; KMK koordiniert schul. Teil.",
    ])
    story.append(FrameBreak())  # -> rechte Spalte

    # SB4
    story+=blk("SB4 · SCHULRECHT II (BEAMTE/SCHULE)", "#b45309", [
        "**Treuepflicht (Kernpflicht):** stete Dienstbereitschaft · Bekenntnis zur fdGO · polit. Mäßigung · Wohlverhalten/Ansehen · Wahrheitspflicht (3 nennen).",
        "**Remonstration (§36 BeamtStG, 3 Stufen):** 1) Bedenken beim Vorgesetzten → höhere Ebene · 2) bestätigt → ausführen, aber haftungsfrei · 3) NIE bei Strafbarkeit/Menschenwürde.",
        "**Schulentwicklung (Rolff, 3 Säulen):** **Personal-** + **Organisations-** + **Unterrichtsentwicklung**; Prozess, dient Lernentwicklung d. SuS.",
        "**Vorgesetzter vs. Dienstvorgesetzter:** Dienstvorg. entscheidet über Einstellung/Beförderung/Entlassung.",
        "**Aufsichtspflicht:** kontinuierlich · präventiv · aktiv. Verletzung → straf-/disziplinar-/haftungsrechtlich.",
        "**Privatschulen:** Ersatzschule (ersetzt öff. Schule, Zuschüsse) vs. Ergänzungsschule.",
    ])
    # SB5
    story+=blk("SB5 · INTERNATIONALER VERGLEICH", "#7c3aed", [
        "**4 Modelle (Rolle des Staates):**",
    ])
    modelle=[["Modell","Kennzeichen / Nachteil","Region"],
             ["Informell","on-the-job; keine Fachtheorie","Afrika/Asien/LA"],
             ["Markt","betriebsspezifisch; Abhängigkeit","Japan/USA/GB"],
             ["Dual/koop.","Praxis+günstig; früh spezialisiert","DE/CH/AT"],
             ["Schule","breit; Politik reagiert träge","FR/IT"]]
    t=Table([[Paragraph("<b>"+esc(c)+"</b>" if i==0 else esc(c),
              ParagraphStyle("c",fontName="DVB" if i==0 else "DV",fontSize=7.6,leading=9.0,
                             textColor=colors.white if i==0 else INK)) for c in r]
             for i,r in enumerate(modelle)], colWidths=[17*mm,46*mm,24*mm])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),hx("#7c3aed")),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,hx("#f5f3ff")]),
        ("GRID",(0,0),(-1,-1),0.3,hx("#ddd6fe")),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("LEFTPADDING",(0,0),(-1,-1),3),("RIGHTPADDING",(0,0),(-1,-1),2),
        ("TOPPADDING",(0,0),(-1,-1),2.0),("BOTTOMPADDING",(0,0),(-1,-1),2.0)]))
    story.append(t)
    story+=[Paragraph("• "+md(x),S_txt) for x in [
        "**Diversitätskompetenz:** Fähigkeit, die (auch eigenen) Mechanismen der Wirklichkeits-Konstruktion zu decodieren – mehr als interkulturelle Kompetenz.",
        "**Wichtig für int. Zusammenarbeit:** macht unterschiedliche Deutungen sichtbar → beugt Missverständnissen vor.",
        "**Input → Outcome:** von Lernzielen zu Kompetenzen (was jemand am Ende KANN).",
    ]]
    # SB6
    story+=blk("SB6 · HETEROGENITÄT & LEISTUNGSBEWERTUNG", "#be123c", [
        "**Inklusion ≠ Integration:** Integration passt den Einzelnen an; Inklusion ändert die (allgemeine) Pädagogik → Vielfalt ist normal.",
        "**Gemeinsamer Gegenstand / Baummodell (Feuser):** alle lernen am selben Thema auf unterschiedlichem Niveau.",
        "**Entwicklungslogische Didaktik:** vom Aneignungsniveau des Kindes her denken (nicht vom Stoff).",
        "**Leistungsbeurteilung + positive Fehlerkultur:** Feedback zählt stark (Hattie); Fehler als Lernchance.",
    ])
    story.append(Spacer(1,2))
    story.append(Paragraph("Lernstrategie: 3× laut durchgehen, dann die fetten Stichwörter abdecken und die Kurzdefinition frei aufsagen. "
                           "In der Klausur nur aus dem Gedächtnis nutzen.", S_note))

    # Dokument: 2 Spalten auf 1 Seite
    m=9*mm; gap=6*mm
    fw=(A4[0]-2*m-gap)/2
    fh=A4[1]-2*m
    fL=Frame(m, m, fw, fh, leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    fR=Frame(m+fw+gap, m, fw, fh, leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
    doc=BaseDocTemplate(OUT, pagesize=A4, leftMargin=m,rightMargin=m,topMargin=m,bottomMargin=m,
                        title="RDB Lernzettel 1 Seite")
    doc.addPageTemplates([PageTemplate(id="two", frames=[fL,fR])])
    doc.build(story)
    print("OK ->", OUT, round(os.path.getsize(OUT)/1024),"KB")

if __name__=="__main__":
    build()
