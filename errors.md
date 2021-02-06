# Erreur 1 : La 1ere ligne de la deuxième colone se glisse où il ne faut pas (trop tôt)
Exemple : Bilan circonstanciel

Cause : la deuxième colone à du texte plus haute que la 1ere (dû au titre sur la 1er colonne)

Erreur : La ligne "réalisée en arrivant sur l’intervention. Parfois" apparait tout au début.

Détection : Un titre # doit être obligatoirement suivi d'un titre ##. 

Correction : rechercher dans le texte une phrase avec retour à la ligne SANS ".". Puis placer ce prédicat à la suite.

# Erreur 2 : des `<span class="underline"` se glissent dans le texte

Cause : titre sur colone suivante 

Détection : Identifier les `<span class="underline"` en plein milieu de texte

# Erreur 3 : des titres mal mis

Exemple : Transmission du bilan
##   
Titre 

Détection : des ## avec rien d'autre sur la même ligne

Correction : remonter d'une ligne

# Erreur 4 : les notes de bas de page sur 2 colonnes

Exemple : Transmission du bilan, Perte de connaissance

Détection : Des chiffres seuls en début de ligne qui ne sont pas tout à la fin du contenu

Correction : Prendre la ligne et la mettre à la fin. et si ne fini pas par un point, concaténer l'avant dernière


On peut détecter fusion de titre avec maj en plein mileu !
Pour savoir qund le placer, utiliser les > > qui représentent des blocs de texte



ERROR 10000
</table>

> Bilan complémentaire suite à un malaise ou à




1ER LIGNE OU TITRE COUPE