# Partie A — Reconnaître les patterns

| Extrait | Pattern | Problème résolu dans QueenBee | Indice dans le code |
|---|---|---|---|
| 1 | Factory Method | Créer le type de capteur demandé par la configuration sans disperser sa création dans le code client. | `creerCapteur` choisit la classe dans `types` et l'instancie avec `new C(hiveId)`. |
| 2 | Builder | Construire un rapport avec plusieurs options, en vérifiant qu'il est complet avant de le créer. | Les méthodes `periode`, `sites`, `indicateur` et `format` s'enchaînent avant `construire()`. |
| 3 | Adapter | Rendre les données météo compatibles avec le format attendu par le modèle de prédiction. | La classe appelle l'API puis transforme sa réponse en `celsius` et `mesureLe`. |
| 4 | Composite | Calculer le poids d'une ruche ou d'un groupe de ruches avec la même opération. | `Ruche` et `Groupe` proposent tous les deux `poidsTotal()` ; le groupe additionne ses enfants. |
| 5 | Decorator | Ajouter le chiffrement GPS au dépôt sans modifier celui-ci. | `DepotMesuresChiffre` enveloppe un dépôt et chiffre à l'écriture, puis déchiffre à la lecture. |
| 6 | Proxy | Éviter de charger le modèle de prédiction tant qu'il n'est pas utilisé. | `ModelePredictionDiffere` charge le modèle au premier appel à `predire()` et le conserve ensuite. |

Les extraits 3 et 5 enveloppent un autre objet, mais leur but diffère : l'Adapter transforme les données pour les rendre compatibles ; le Decorator ajoute un comportement au service existant.

## B2 — Ordre des décorateurs

1. En A, `Cache` est à l'extérieur de `Log`. Au second appel, le cache renvoie directement sa réponse et le logger n'est donc pas appelé. En B, `Log` est à l'extérieur du cache : il voit l'appel avant que le cache réponde et le journalise.
2. En B, le log `[log] GET` mesure l'appel complet à travers le cache et le retry. Il ne montre donc pas chaque tentative séparément. Le message `[retry]` indique tout de même que la première tentative a échoué, car `RetryClient` le journalise lui-même.
3. Pour la passerelle QueenBee, je choisirais `Cache(Retry(Log(base)))` : le cache évite les émissions répétées, les nouvelles tentatives aident quand la liaison est instable et le logger voit chaque tentative. Je limiterais le nombre de retries pour ne pas trop solliciter la radio.

## C-Data — Adapter pour les sources de mesures

- **Problème :** les trames LoRa et les relevés manuels ont des noms de champs, des formats de date et des unités différents, alors que le contexte « Santé des colonies » attend un seul format `Mesure`.
- **Pattern retenu :** Adapter.
- **Pourquoi :** chaque adaptateur convertit sa source vers le contrat `Mesure`. Le reste de l'application peut ainsi traiter toutes les mesures de la même façon, sans connaître leur format d'origine.
- **Alternative écartée :** modifier les sources ou faire les conversions directement dans le client. Les sources sont indiquées comme non modifiables, et mettre toutes les conversions dans le client lui ferait connaître les détails de chaque format.

### Questions

1. **Qui est propriétaire du contrat `Mesure` ?** Le contexte « Santé des colonies », car c'est lui qui définit les données dont ses traitements ont besoin. Les sources sont adaptées à ce contrat.
2. **Que faire d'une ligne incomplète en production ?** La mettre en quarantaine avec la raison du rejet. Elle ne doit pas entrer dans les calculs, mais pourra être vérifiée et corrigée sans perdre sa trace.
3. **Comment ajouter l'humidité ?** Faire évoluer le contrat avec un champ, par exemple `humiditePct`, puis le renseigner dans les adaptateurs qui ont cette donnée. Le rendre facultatif au début permet de ne pas casser les sources qui ne mesurent pas encore l'humidité.
