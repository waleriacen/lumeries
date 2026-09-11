#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Kompakte Fragen + Musterlösungen (aus dem ausführlichen Übungsklausur-PDF, ohne Merke-Boxen).
Frage klein/grau, darunter nur die Musterlösung (Tabellen wo vorhanden)."""
import os
import gen_pdf_klausur as k  # Wiederverwendung von TABLES, green_table, bullets, parse_simple ...
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether)

OUT=os.path.join(k.g.BASE,"RDB-Fragen-Loesungen-kompakt.pdf")
PRI=k.PRI; INK=k.INK; MUT=k.MUT; GREEN=k.GREEN; LINE=colors.HexColor("#cbd5e1")

S_h1=ParagraphStyle("h1",fontName="DVB",fontSize=15,leading=17,textColor=PRI,spaceAfter=3)
S_sub=ParagraphStyle("sub",fontName="DV",fontSize=8,leading=10,textColor=MUT,spaceAfter=2)
S_grp=ParagraphStyle("grp",fontName="DVB",fontSize=9.5,leading=11,textColor=colors.white,
                     backColor=PRI,borderPadding=(3,5,3,5),spaceBefore=7,spaceAfter=4)
S_q=ParagraphStyle("q",fontName="DV",fontSize=8,leading=9.6,textColor=MUT,spaceAfter=1)   # Frage klein/grau
S_a=ParagraphStyle("a",fontName="DV",fontSize=8.7,leading=10.9,textColor=INK,spaceAfter=1)
S_lead=ParagraphStyle("lead",fontName="DV",fontSize=8.7,leading=10.9,textColor=INK,spaceAfter=2)
S_ml=ParagraphStyle("ml",fontName="DVB",fontSize=7,leading=8,textColor=GREEN,spaceBefore=1,spaceAfter=1)

GROUPS=k.GROUPS

def build():
    klausur=k.g.parse_klausur(open(os.path.join(k.g.CONTENT,"UEBUNGSKLAUSUR.md"),encoding="utf-8").read())
    einfach=k.parse_simple(open(os.path.join(k.g.CONTENT,"KLAUSUR_EINFACH.md"),encoding="utf-8").read())

    E=[Paragraph("RDB – Fragen &amp; Musterlösungen (kompakt)", S_h1),
       Paragraph("HFH-Übungsklausur · Frage klein, darunter die Musterlösung · "
                 "5 Aufgaben · 14 Teilaufgaben · 100 Punkte", S_sub),
       HRFlowable(width="100%",thickness=1,color=PRI,spaceAfter=3)]

    cur=None
    for a in klausur:
        nr=a["nr"].replace("Aufgabe ","").strip()
        grp=nr.split(".")[0]
        if grp!=cur:
            cur=grp
            E.append(Paragraph(GROUPS.get(grp,f"Aufgabe {grp}"), S_grp))
        meta=[]
        if a["quelle"]: meta.append(k.esc(a["quelle"]))
        if a["punkte"]: meta.append(k.esc(a["punkte"]))
        metatxt=(" ("+" · ".join(meta)+")") if meta else ""
        qpara=Paragraph(f'<b><font color="#1d4ed8" size="9">{nr}</font></b> '
                        f'{k.esc(a["f"])}<font color="#94a3b8">{metatxt}</font>', S_q)
        flows=[Paragraph("MUSTERLÖSUNG", S_ml)]
        if nr in k.TABLES:
            sp=k.TABLES[nr]
            if sp.get("lead"): flows.append(Paragraph(k.esc(sp["lead"]), S_lead))
            flows.append(k.green_table(sp["header"], sp["rows"], sp["widths"]))
            if sp.get("note"): flows.append(Paragraph(k.esc(sp["note"]), k.S_small))
        else:
            flows.append(Paragraph(k.bullets(einfach.get(nr, a["l"])), S_a))
        # Frage + Lösung möglichst zusammenhalten
        E.append(KeepTogether([qpara]+flows))
        E.append(Spacer(1,4))
        E.append(HRFlowable(width="100%",thickness=0.4,color=LINE,spaceAfter=3))

    def deco(canvas, doc):
        canvas.saveState()
        canvas.setFont("DV",7); canvas.setFillColor(MUT)
        canvas.drawString(12*mm, 7*mm, "RDB – Fragen & Musterlösungen (kompakt) · HFH")
        canvas.drawRightString(A4[0]-12*mm, 7*mm, f"Seite {doc.page}")
        canvas.restoreState()

    doc=SimpleDocTemplate(OUT, pagesize=A4, leftMargin=12*mm, rightMargin=12*mm,
                          topMargin=12*mm, bottomMargin=12*mm, title="RDB Fragen & Musterlösungen kompakt")
    doc.build(E, onFirstPage=deco, onLaterPages=deco)
    print("OK ->", OUT, round(os.path.getsize(OUT)/1024),"KB")

if __name__=="__main__":
    build()
