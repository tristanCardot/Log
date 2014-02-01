Log
===

Un complément au système de log déjà présent.
Il permet de gérer simplement l'affichage de données souvent mises à jour.

Utilisation
===========

Log fonctionne sur un système de `section`.
Une `section` est un chemin jusqu'a un objet ou variable.
Elle permet de savoir à partir de quel point part la propagation de mise à jour.
`Console`

**Log.add( section, value, process, overwrite)**: permet d'ajouter un ensemble de sections.
- **section**: (string) Définie le point de départ de la section. `"maSection"`.
- **value**: (Object) La valeur à passer a partir de la section. `{keyA: valueA, keyB: valueB}` => `"maSection.keyA"`+`"maSection.keyB"`.
- **process**: (Function) Une fonction qui prend deux paramétres la nouvelle valeur et l'ancienne valeur.
- **overwrite**: (boolean) permet de savoir si il faut surdéfinir les sections déja présentes.
- **return**: (HTMLElement) la node correspondant à la section passé en paramétre.


**Log.update(section, value)**: Permet de mettre à jour les valeurs.
- **section**: Définie le point de départ de la section. `'maSection'`.
- **value**: la valeur a passer `monObj`.


**Log.setFontSize( fontSize )**: permet d'adapter la console au nouveau font-size.
- **fontSize**: (number) le nouveau font-size (en px).


**Log.sheet**: (CSSStyleSheet) La feuille de style qui contient les régles CSS de la console [ div#Log, div#Log div.LogObject, div#Log div.LogValue].
**Log.style**: (CSSStyleDeclaration) Le style de la console.
**Log.disableError**: (boolean) une fois mis à `true` Log ne renvéras plus d'erreur (propre à Log).
**Log.section**: (Object) contient l'ensemble des sections `Log.section['section']`.
- **return**: (Object) \/
  - **value**: (Object) la valeur de la section et de l'ensemble de ces sous sections.
  - **node**: (HTMLElement) la node à la quelle est lié l'affichage de la section.
  - **name**: (string) contient le nom de la variable de la section (`'section.obj.a'` => `'a'`).
  - **disable**: (boolean) permet de savoir si la node est réduite.

INTERACTION
===========

- un simple clic permet de réduire/agrandire une section, un CTRL+clic permet de réduire/agrandire la section et l'ensemble des sous sections.
- celon l'emplacement un clic&glisse permet de bouger/redimmensionner la console, si la console touche un bord elle si 'accroche'.







