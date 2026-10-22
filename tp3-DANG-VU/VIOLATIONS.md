# Violations de principes dans `ReportService.js`

| # | Principe | Ligne(s) | Problème | Conséquence concrète |
|---|---|---:|---|---|
| 1 | S — responsabilité unique | 20-23, 25-87 | `ReportService` fait plusieurs choses : il lit les commandes, calcule les chiffres, crée le rapport, écrit dans l'historique et prépare les e-mails. | Si on veut changer une de ces parties, il faut modifier cette même classe. Une erreur dans une partie peut aussi gêner les autres. |
| 2 | O — ouvert/fermé | 46-70 | Le choix du format est fait avec des `if` dans `generate`. | Pour ajouter un format comme le PDF, il faut modifier cette méthode. On risque alors de casser un format qui fonctionnait déjà. |
| 3 | D — inversion des dépendances | 4, 7-17, 20-22, 81 | La classe choisit elle-même le fichier à lire et les paramètres SMTP pour les e-mails. | Pour tester la classe avec de fausses données ou un faux service d'e-mail, il faut contourner ces choix. Les tests dépendent donc du vrai fichier et sont plus difficiles à isoler. |
| 4 | L — substitution de Liskov | 92-97 | `FreeReportService` refuse le HTML, le JSON et l'envoi d'e-mail, alors que `ReportService` les accepte. | Si un programme remplace `ReportService` par `FreeReportService` et demande un rapport HTML, il obtient une erreur. La classe enfant ne peut donc pas toujours remplacer la classe parent. |
| 5 | I — ségrégation des interfaces | 20-25, 78-87 | La classe regroupe la lecture des commandes, la création des rapports et la préparation des e-mails. | Un programme qui veut seulement créer un rapport dépend quand même de fonctions liées aux e-mails et à la lecture du fichier. |

## Calcul des indicateurs et qualité des données

Le calcul est fait dans `generate`, lignes 30 à 44 de `ReportService.js`. Le CA HT et les montants par catégorie sont calculés en additionnant les lignes (`quantité × prix unitaire`). La TVA est de 20 % du CA HT et est arrondie à deux décimales. Le panier moyen est le CA HT divisé par le nombre de commandes non annulées, lui aussi arrondi à deux décimales.

Pour réutiliser ces calculs dans un tableau de bord sans lire le fichier ni envoyer d'e-mail, il faudrait les déplacer dans une fonction à part. Cette fonction pourrait recevoir les commandes et retourner les indicateurs.

Le code ne compte pas les commandes annulées. S'il n'y a aucune commande, le panier moyen vaut zéro. La TVA et le panier moyen sont arrondis à deux décimales. Par contre, les données ne sont pas vraiment vérifiées : par exemple, le code ne contrôle pas que les dates sont valides ou que les quantités et les prix sont des nombres positifs. Des données incorrectes peuvent donc fausser le résultat ou provoquer une erreur.