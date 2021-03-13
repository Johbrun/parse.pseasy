# parse.pseasy

pdf => docx (outil en ligne)https://www.ilovepdf.com/fr/pdf_en_word
docx => md (pandoc)
https://pandoc.org/MANUAL.html#pandocs-markdown
pandoc -f docx -t gfm -s 03-PSE2019.docx -o 03-PSE2019.md --reference-links --atx-headers

pandoc -f docx -t markdown_mmd -s 03-PSE2019.docx -o ..\md\2019-raw-pandoc.md --reference-links --atx-headers --no-highlight --wrap=auto

pandoc -f docx -t gfm -s ./docx/2014.docx -o ./md/2014/\_global.md --reference-links --atx-headers --no-highlight --wrap=auto

\*\* supprimer à la main les parties inutiles

Traitement à la main

- Supprimer les '> '
- ! Nombre de dièses des titres
- Modifier à la main les dates dans cartouche pour MoisEnTouteLettres AnnéeEnNombre
- Ajouter blockquote dans cartouche (pour Reférence : et Version : )

```
<td>Référence :</td>

# devient
<td><blockquote>
<p>Référence :</p>
</blockquote></td>

```

- Supprimer les break-line "-­‐ "

A checker

- quand une pharse commence par une minuscule, précédé par une ligne vide
