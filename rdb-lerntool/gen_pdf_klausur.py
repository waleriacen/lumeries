#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ausführliches PDF zu den Übungsklausur-Fragen (Frage · Musterlösung · Ausführlich · Merke)."""
import os, re
import generate as g
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                 HRFlowable, KeepTogether, PageBreak)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont("DV","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB","/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFontFamily("DV", normal="DV", bold="DVB", italic="DV", boldItalic="DVB")

OUT=os.path.join(g.BASE,"RDB-Uebungsklausur-ausfuehrlich.pdf")
CW=180*mm  # Inhaltsbreite (A4 210 - 2x15)

PRI=colors.HexColor("#1d4ed8"); INK=colors.HexColor("#0f172a"); MUT=colors.HexColor("#475569")
LINE=colors.HexColor("#cbd5e1")
GREEN=colors.HexColor("#166534"); GREENBG=colors.HexColor("#f0fdf4"); GREENBD=colors.HexColor("#bbf7d0")
BLUEBG=colors.HexColor("#eff6ff"); BLUEBD=colors.HexColor("#bfdbfe")
AMBER=colors.HexColor("#92400e"); AMBERBG=colors.HexColor("#fffbeb"); AMBERBD=colors.HexColor("#fde68a")
GRAYBG=colors.HexColor("#f1f5f9"); GRAYBD=colors.HexColor("#e2e8f0")

S_body=ParagraphStyle("body",fontName="DV",fontSize=9.2,leading=12.4,textColor=INK,spaceAfter=0)
S_h1=ParagraphStyle("h1",fontName="DVB",fontSize=19,leading=22,textColor=PRI,spaceAfter=4)
S_sub=ParagraphStyle("sub",fontName="DV",fontSize=10,leading=13,textColor=MUT,spaceAfter=4)
S_grp=ParagraphStyle("grp",fontName="DVB",fontSize=12.5,leading=15,textColor=colors.white,
                     backColor=PRI,borderPadding=(5,7,5,7),spaceBefore=10,spaceAfter=7)
S_ah=ParagraphStyle("ah",fontName="DVB",fontSize=10.5,leading=13,textColor=PRI,spaceBefore=2,spaceAfter=3)
def S_lbl(c): return ParagraphStyle("lbl",fontName="DVB",fontSize=7.3,leading=9,textColor=c,spaceAfter=2)

def esc(t): return t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
def md(t):
    t=esc(t); t=re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t); return t
def bullets(t):
    """Wandelt inline •-Aufzählungen in Zeilenumbrüche."""
    t=md(t)
    t=re.sub(r"\s*•\s*", "<br/>&nbsp;&nbsp;•&nbsp;", t)
    t=re.sub(r"^(<br/>)+","",t)
    return t

def box(label, body_html, bg, bd, lc):
    cell=[Paragraph(label, S_lbl(lc)), Paragraph(body_html, S_body)]
    t=Table([[cell]], colWidths=[CW])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),bg),("BOX",(0,0),(-1,-1),0.6,bd),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),6)]))
    return t

S_cell=ParagraphStyle("cell",fontName="DV",fontSize=8.3,leading=10,textColor=INK)
S_cellh=ParagraphStyle("cellh",fontName="DVB",fontSize=8.3,leading=10,textColor=colors.white)
S_small=ParagraphStyle("small",fontName="DV",fontSize=7.8,leading=9.6,textColor=MUT,spaceBefore=3)

def box_flow(label, flows, bg, bd, lc):
    cell=[Paragraph(label, S_lbl(lc))]+flows
    t=Table([[cell]], colWidths=[CW])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),bg),("BOX",(0,0),(-1,-1),0.6,bd),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),6)]))
    return t

def models_table():
    rows=[["Modell","Vorteil","Nachteil","Region"],
          ["Informelles Modell","hohe Aufnahmefähigkeit gerade in ärmeren Ländern",
           "enge, nur funktionsbezogene Qualifizierung; keine Fachtheorie/Allgemeinbildung",
           "Afrika, Asien, Lateinamerika"],
          ["Marktmodell","praxisnah, spezialisiert, kostensparend für den Staat",
           "sehr betriebsspezifisch → Wechsel schwer, Abhängigkeit vom Arbeitgeber",
           "Japan, USA, Großbritannien"],
          ["Kooperatives / Duales Modell","Praxisbezug, kostensparend für den Staat",
           "frühe, enge Spezialisierung; Betriebsbedarf rasch erschöpft",
           "Deutschland, Schweiz, Österreich"],
          ["Schulmodell","breite Grundausbildung, weniger Abhängigkeit vom Arbeitgeber",
           "Politik reagiert zu langsam auf den Bedarf der Wirtschaft",
           "Frankreich, Italien"]]
    data=[[Paragraph(esc(c), S_cellh if i==0 else S_cell) for c in r] for i,r in enumerate(rows)]
    t=Table(data, colWidths=[30*mm,52*mm,60*mm,30*mm], repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),hx("#166534")),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white, hx("#f0fdf4")]),
        ("GRID",(0,0),(-1,-1),0.5,hx("#bbf7d0")),("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),4),("RIGHTPADDING",(0,0),(-1,-1),4),
        ("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3)]))
    return t
def hx(c): return colors.HexColor(c)

def parse_extra(txt):
    d={}
    for b in re.split(r"(?m)^###\s+", txt):
        b=b.strip()
        if not b or b.startswith("#"): continue
        nl=b.find("\n"); nr=b[:nl].strip(); rest=b[nl+1:]
        au=re.search(r"(?m)^AUSFUEHRLICH:\s*",rest); me=re.search(r"(?m)^MERKE:\s*",rest)
        auf=""; mer=""
        if au and me:
            auf=rest[au.end():me.start()].strip(); mer=rest[me.end():].strip()
        elif au:
            auf=rest[au.end():].strip()
        d[nr]={"auf":auf,"mer":mer}
    return d

GROUPS={"1":"Aufgabe 1 · SB1 Einführung in das System der beruflichen Bildung · 16 Punkte",
        "2":"Aufgabe 2 · SB2 Rechtliche Grundlagen der Berufsbildung · 24 Punkte",
        "3":"Aufgabe 3 · SB3 Schulrecht I (Pflege- und Gesundheitsberufe) · 18 Punkte",
        "4":"Aufgabe 4 · SB4 Schulrecht II · 18 Punkte",
        "5":"Aufgabe 5 · SB5 Berufliche Bildung im internationalen Vergleich · 24 Punkte"}
BEREICH={"1":"SB1 Einführung","2":"SB2 Rechtliche Grundlagen","3":"SB3 Schulrecht I",
         "4":"SB4 Schulrecht II","5":"SB5 Internationaler Vergleich"}

def build():
    klausur=g.parse_klausur(open(os.path.join(g.CONTENT,"UEBUNGSKLAUSUR.md"),encoding="utf-8").read())
    extra=parse_extra(open(os.path.join(g.CONTENT,"KLAUSUR_EXTRA.md"),encoding="utf-8").read())

    E=[]
    E.append(Paragraph("RDB – Übungsklausur ausführlich erklärt", S_h1))
    E.append(Paragraph("Alle Fragen der HFH-Übungsklausur mit Musterlösung und Merksatz · "
                       "Modul Rahmenbedingungen der Berufsbildung (MP00-RDB-PK1)", S_sub))
    E.append(HRFlowable(width="100%",thickness=1.2,color=PRI,spaceAfter=5))
    E.append(Paragraph("<b>Aufbau je Frage:</b> "
                       '<font color="#475569">FRAGE</font> (Originalaufgabe) → '
                       '<font color="#166534">MUSTERLÖSUNG</font> (klausurtauglich) → '
                       '<font color="#92400e">MERKE</font> (Prüfungstipp). '
                       "Gesamt 5 Aufgaben · 14 Teilaufgaben · 100 Punkte · 100 Minuten.", S_body))
    E.append(Spacer(1,4))

    cur=None
    for a in klausur:
        nr=a["nr"].replace("Aufgabe ","").strip()   # z. B. "1.1"
        grp=nr.split(".")[0]
        if grp!=cur:
            cur=grp
            E.append(Paragraph(GROUPS.get(grp,f"Aufgabe {grp}"), S_grp))
        ex=extra.get(nr,{"auf":"","mer":""})
        # Kopfzeile der Teilaufgabe
        meta=[]
        if a["quelle"]: meta.append(esc(a["quelle"]))
        if a["punkte"]: meta.append(esc(a["punkte"]))
        head=f'Aufgabe {esc(nr)}'
        if meta: head+='  <font size="8" color="#64748b">('+"  ·  ".join(meta)+")</font>"
        if nr=="5.1":
            note=("In der Klausur genügen 3 Modelle. Punkte: je Modell 1 P (max. 3), "
                  "je Vor-/Nachteil 2 P (max. 6), je Region 1 P (max. 3) = 12 P.")
            ml=box_flow("MUSTERLÖSUNG", [models_table(), Paragraph(note, S_small)], GREENBG, GREENBD, GREEN)
        else:
            ml=box("MUSTERLÖSUNG", bullets(a["l"]), GREENBG, GREENBD, GREEN)
        block=[Paragraph(head, S_ah),
               box("FRAGE", bullets(a["f"]), GRAYBG, GRAYBD, MUT)]
        # Kopf + Frage zusammenhalten
        E.append(KeepTogether(block[:2]))
        E.append(Spacer(1,3))
        E.append(ml)
        if ex["mer"]:
            E.append(Spacer(1,3))
            E.append(box("MERKE · PRÜFUNGSTIPP", bullets(ex["mer"]), AMBERBG, AMBERBD, AMBER))
        E.append(Spacer(1,9))

    def deco(canvas, doc):
        canvas.saveState()
        canvas.setFont("DV",7.5); canvas.setFillColor(MUT)
        canvas.drawString(15*mm, 8*mm, "RDB – Übungsklausur ausführlich · HFH · Klausurvorbereitung")
        canvas.drawRightString(A4[0]-15*mm, 8*mm, f"Seite {doc.page}")
        canvas.setStrokeColor(LINE); canvas.setLineWidth(0.4)
        canvas.line(15*mm, 11*mm, A4[0]-15*mm, 11*mm)
        canvas.restoreState()

    doc=SimpleDocTemplate(OUT, pagesize=A4, leftMargin=15*mm, rightMargin=15*mm,
                          topMargin=14*mm, bottomMargin=15*mm,
                          title="RDB Übungsklausur ausführlich", author="RDB Lerntool")
    doc.build(E, onFirstPage=deco, onLaterPages=deco)
    print("OK ->", OUT, round(os.path.getsize(OUT)/1024),"KB")

if __name__=="__main__":
    build()
