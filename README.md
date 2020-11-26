# parse.pseasy

pdf => docx (outil en ligne)https://www.ilovepdf.com/fr/pdf_en_word
docx => md (pandoc)
https://pandoc.org/MANUAL.html#pandocs-markdown
pandoc -f docx -t gfm -s 03-PSE2019.docx -o 03-PSE2019.md --reference-links --atx-headers

pandoc -f docx -t markdown_mmd -s 03-PSE2019.docx -o ..\md\2019-raw-pandoc.md --reference-links --atx-headers --no-highlight --wrap=auto

pandoc -f docx -t gfm -s 03-PSE2019.docx -o ..\md\2019-raw-pandoc.md --reference-links --atx-headers --no-highlight --wrap=auto