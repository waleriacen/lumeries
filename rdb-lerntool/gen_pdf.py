#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Erzeugt eine kompakte PDF-Lernzusammenfassung für RDB aus den content/-Dateien."""
import os, re, html as _html
import generate as g
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                 ListFlowable, ListItem, HRFlowable, KeepTogether, PageBreak)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONTB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
pdfmetrics.registerFont(TTFont("DV",FONT))
pdfmetrics.registerFont(TTFont("DVB",FONTB))
pdfmetrics.registerFontFamily("DV", normal="DV", bold="DVB", italic="DV", boldItalic="DVB")

OUT=os.path.join(g.BASE,"RDB-Lernzusammenfassung.pdf")

PRI=colors.HexColor("#1d4ed8"); ACC=colors.HexColor("#0ea5e9")
AMBER=colors.HexColor("#b45309"); AMBERBG=colors.HexColor("#fef3c7")
BLUE=colors.HexColor("#1e40af"); BLUEBG=colors.HexColor("#dbeafe")
INK=colors.HexColor("#0f172a"); MUT=colors.HexColor("#475569"); LINE=colors.HexColor("#cbd5e1")

def esc(t):
    return t.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
def md(t):
    t=esc(t)
    t=re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    return t

ss=getSampleStyleSheet()
S_body=ParagraphStyle("body",fontName="DV",fontSize=8.7,leading=11.6,textColor=INK,spaceAfter=2)
S_bul =ParagraphStyle("bul",parent=S_body,leftIndent=8,bulletIndent=0)
S_h1  =ParagraphStyle("h1",fontName="DVB",fontSize=20,leading=23,textColor=PRI,spaceAfter=4)
S_sub =ParagraphStyle("sub",fontName="DV",fontSize=10.5,leading=13,textColor=MUT,spaceAfter=6)
S_brief=ParagraphStyle("brief",fontName="DVB",fontSize=13,leading=16,textColor=colors.white,
                        backColor=PRI,borderPadding=(5,7,5,7),spaceBefore=8,spaceAfter=6)
S_sec =ParagraphStyle("sec",fontName="DVB",fontSize=11.5,leading=14,textColor=PRI,spaceBefore=8,spaceAfter=3)
S_small=ParagraphStyle("sm",fontName="DV",fontSize=7.8,leading=9.8,textColor=MUT)
S_cell=ParagraphStyle("cell",fontName="DV",fontSize=8.2,leading=10,textColor=INK)
S_cellb=ParagraphStyle("cellb",parent=S_cell,fontName="DVB")
S_cellh=ParagraphStyle("cellh",parent=S_cell,fontName="DVB",textColor=colors.white)

def tag(uk,sb):
    out=""
    if uk: out+=f'<font backColor="#fef3c7" color="#b45309"><b> ★ÜK </b></font> '
    if sb: out+=f'<font backColor="#dbeafe" color="#1e40af"><b> ■SB </b></font> '
    return out

def spick_para(item):
    uk=bool(g.klausur_tags(item)); sb=bool(g.sb_tags(item))
    return Paragraph(tag(uk,sb)+md(item), S_body)

def mk_table(header, rows, widths):
    data=[[Paragraph(esc(h),S_cellh) for h in header]]
    for r in rows:
        data.append([Paragraph(md(c),S_cell) for c in r])
    t=Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),PRI),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white, colors.HexColor("#f1f5f9")]),
        ("GRID",(0,0),(-1,-1),0.5,LINE),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),
        ("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3),
    ]))
    return t

def build():
    # Daten laden
    data={}
    for sb,nr,titel,code in g.BRIEFE:
        secs=g.split_sections(open(os.path.join(g.CONTENT,f"{sb}_content.md"),encoding="utf-8").read())
        data[sb]={"spick":g.parse_spick(secs.get("SPICKZETTEL","")),"titel":titel,"nr":nr,"code":code}
    klausur=g.parse_klausur(open(os.path.join(g.CONTENT,"UEBUNGSKLAUSUR.md"),encoding="utf-8").read())

    E=[]
    # Kopf
    E.append(Paragraph("RDB – Lernzusammenfassung", S_h1))
    E.append(Paragraph("Rahmenbedingungen der Berufsbildung · Klausur MP00-RDB-PK1 · alle 6 prüfungsrelevanten Studienbriefe", S_sub))
    E.append(HRFlowable(width="100%",thickness=1.2,color=PRI,spaceAfter=6))

    steck=[["Klausur","14.03.2026, 9:00 Uhr","Dauer","100 Minuten"],
           ["Punkte","100","Aufgaben","5 (je 1 Studienbrief-Bereich)"],
           ["Hilfsmittel","keine","Stoff","SB 1–5 + Heterogenität (01-1108-005-2)"]]
    st=Table([[Paragraph(("<b>"+esc(c)+"</b>") if i%2==0 else esc(c), S_cell) for i,c in enumerate(r)] for r in steck],
             colWidths=[24*mm,52*mm,24*mm,60*mm])
    st.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#eff6ff")),
        ("BOX",(0,0),(-1,-1),0.5,colors.HexColor("#bfdbfe")),("INNERGRID",(0,0),(-1,-1),0.4,colors.HexColor("#dbeafe")),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
        ("LEFTPADDING",(0,0),(-1,-1),6)]))
    E.append(st)
    E.append(Spacer(1,5))
    E.append(Paragraph('<b>Legende:</b> '+tag(True,False)+'= in der HFH-Übungsklausur gefragt &nbsp;&nbsp; '
                       +tag(False,True)+'= Thema einer Studienbrief-Übungsaufgabe', S_body))
    E.append(Spacer(1,4))

    # Prüfungs-Hotspots
    E.append(Paragraph("★ Prüfungs-Hotspots – die Themen der Übungsklausur", S_sec))
    hot=[]
    for a in klausur:
        f=a["f"]; short=re.sub(r"\s+"," ",f).strip()
        short=short[:98]+("…" if len(f)>98 else "")
        hot.append([a["nr"].replace("Aufgabe ","").strip(), short, a["quelle"], a["punkte"]])
    E.append(mk_table(["Nr.","Thema / Frage (gekürzt)","Quelle","P."],
                      hot,[11*mm,112*mm,24*mm,10*mm]))
    E.append(PageBreak())

    # Pro Brief: Spickzettel
    for sb,nr,titel,code in g.BRIEFE:
        d=data[sb]
        head=f'SB{nr} · {esc(titel)}  <font size="8" color="#c7d2fe">({code})</font>'
        E.append(Paragraph(head, S_brief))
        items=[spick_para(it) for it in d["spick"]]
        E.append(ListFlowable(items, bulletType="bullet", start="•", leftIndent=10,
                              bulletFontName="DV", spaceBefore=0))
        E.append(Spacer(1,6))

    # Schlüssel-Tabellen
    E.append(PageBreak())
    E.append(Paragraph("Schlüssel-Tabellen (häufig geprüft)", S_sec))

    E.append(Paragraph("Die vier Modelle beruflicher Bildung "+tag(True,True), S_body))
    E.append(mk_table(["Modell","Vorteil","Nachteil","Region"],[
        ["Informelles Modell","hohe Aufnahmefähigkeit in ärmeren Ländern","enge funktionsbezogene Qualifizierung, keine Fachtheorie","Afrika, Asien, Lateinamerika"],
        ["Marktmodell","Praxisbezug, spezialisiert, kostensparend f. Staat","sehr betriebsspezifisch → Wechsel schwer, Abhängigkeit","Japan, USA, Großbritannien"],
        ["Kooperatives/Duales Modell","Praxisbezug, kostensparender f. Staat","frühe/enge Spezialisierung, Bedarf rasch erschöpft","Deutschland, Schweiz, Österreich"],
        ["Schulmodell","breite Grundausbildung, weniger AG-Abhängigkeit","Politik reagiert langsam auf Wirtschaftsbedarf","Frankreich, Italien"],
    ],[37*mm,38*mm,42*mm,30*mm]))
    E.append(Spacer(1,6))

    E.append(Paragraph("BGJ vs. BVJ "+tag(True,False), S_body))
    E.append(mk_table(["Merkmal","Berufsgrundbildungsjahr (BGJ)","Berufsvorbereitungsjahr (BVJ)"],[
        ["Anrechnung","zählt als 1. Ausbildungsjahr (anrechenbar)","nicht anrechenbar; Hauptschulabschluss nachholbar"],
        ["Zielgruppe","hat Schulabschluss, aber keine Lehrstelle","Schulabbrecher / noch nicht ausbildungsreif"],
    ],[26*mm,60*mm,61*mm]))
    E.append(Spacer(1,6))

    E.append(Paragraph("Handlungskompetenz – vier Teilkompetenzen "+tag(True,True), S_body))
    E.append(mk_table(["Kompetenz","Bedeutung / Beispiel"],[
        ["Fachkompetenz","fachlich fundiertes Aufbereiten der Inhalte"],
        ["Methodenkompetenz","passende Methoden/Medien wählen (z. B. Lehrvideo, Software)"],
        ["Sozialkompetenz","angemessen mit SuS, Eltern, Kollegium interagieren"],
        ["Persönlichkeitskompetenz","Verantwortung übernehmen, sich abgrenzen können"],
    ],[42*mm,105*mm]))
    E.append(Spacer(1,6))

    E.append(Paragraph("Drei rechtliche Regelungsbereiche (Berufsabschlüsse) "+tag(True,False), S_body))
    E.append(mk_table(["Regelungsbereich","Kennzeichen"],[
        ["Duales System (BBiG)","Ausbildungsberufe auf Grundlage des Berufsbildungsgesetzes"],
        ["Berufsfachschulen (Landesrecht)","nach Landesrecht geregelte Berufe"],
        ["Berufszulassungsgesetze","Schulen des Gesundheitswesens (Heilberufe)"],
    ],[52*mm,95*mm]))
    E.append(Spacer(1,6))

    E.append(Paragraph("Finanzierung: duales System vs. Krankenhaus "+tag(True,False), S_body))
    E.append(mk_table(["","Duales System","Krankenhaus"],[
        ["Praxis","Betrieb trägt Kosten","Krankenhaus trägt Ausbildung & Ausbildungsstätte vollständig"],
        ["Schule","Staat finanziert Berufsschule","über Einnahmen → v. a. Krankenversicherungen (+ ggf. Landeszuschüsse)"],
    ],[20*mm,54*mm,73*mm]))
    E.append(Spacer(1,6))

    E.append(Paragraph("Remonstration – drei Stufen (§ 36 BeamtStG) "+tag(True,True), S_body))
    E.append(mk_table(["Stufe","Vorgehen"],[
        ["1","Bedenken beim unmittelbaren Vorgesetzten erheben; bleibt er dabei → nächsthöhere Ebene"],
        ["2","Bestätigt auch diese die Weisung → ausführen, aber von der Haftung befreit"],
        ["3","Ausnahme: strafbares/menschenwürdeverletzendes Handeln → nicht ausführen"],
    ],[14*mm,133*mm]))
    E.append(Spacer(1,6))

    E.append(Paragraph("Schulentwicklung – drei Säulen (Rolff) "+tag(True,True), S_body))
    E.append(mk_table(["Säule","Inhalt"],[
        ["Personalentwicklung","Qualifizierung/Führung des Personals"],
        ["Organisationsentwicklung","Strukturen & Abläufe der Schule"],
        ["Unterrichtsentwicklung","Qualität des Unterrichts – dient der Lernentwicklung der SuS"],
    ],[46*mm,101*mm]))
    E.append(Spacer(1,6))

    E.append(Paragraph("Vorbehaltene Tätigkeiten (PflBG) "+tag(True,True), S_body))
    E.append(Paragraph("Definition: pflegerische Aufgaben, die nur nach Pflegeberufegesetz qualifizierte Pflegefachkräfte ausführen dürfen. "
                       "Beispiele: <b>Erhebung des Pflegebedarfs</b>; <b>Organisation/Gestaltung/Steuerung des Pflegeprozesses</b>; "
                       "<b>Analyse, Evaluation, Sicherung und Entwicklung der Pflegequalität</b>.", S_body))

    # Footer/Header
    def deco(canvas, doc):
        canvas.saveState()
        canvas.setFont("DV",7.5); canvas.setFillColor(MUT)
        canvas.drawString(15*mm, 8*mm, "RDB – Lernzusammenfassung · HFH · zur Klausurvorbereitung")
        canvas.drawRightString(A4[0]-15*mm, 8*mm, f"Seite {doc.page}")
        canvas.setStrokeColor(LINE); canvas.setLineWidth(0.4)
        canvas.line(15*mm, 11*mm, A4[0]-15*mm, 11*mm)
        canvas.restoreState()

    doc=SimpleDocTemplate(OUT, pagesize=A4, leftMargin=15*mm, rightMargin=15*mm,
                          topMargin=14*mm, bottomMargin=15*mm, title="RDB Lernzusammenfassung",
                          author="RDB Lerntool")
    doc.build(E, onFirstPage=deco, onLaterPages=deco)
    print("OK ->", OUT, round(os.path.getsize(OUT)/1024),"KB")

if __name__=="__main__":
    build()
