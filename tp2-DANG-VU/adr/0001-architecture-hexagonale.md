# ADR-0001 : Isoler le stockage derrière le port OrderRepository

- Date : 2026-10-21
- Statut : Accepté
- Décideurs : équipe ShopLite

## Contexte

Le dépôt actuel `InMemoryOrderRepository` conserve les commandes uniquement en mémoire : elles sont perdues au redémarrage du serveur. Nous voulons pouvoir remplacer ce stockage par PostgreSQL sans coupler le domaine `Order` à une base de données ou à un pilote particulier. Il faut aussi pouvoir tester le cas d'utilisation sans démarrer de serveur ni dépendre d'une base réelle.

## Décision

Le cas d'utilisation dépend du port `OrderRepository` (`save` et `findById`), et non d'un moteur de stockage. Les adaptateurs secondaires implémentent ce contrat : `InMemoryOrderRepository` pour les tests et démonstrations, puis `PostgresOrderRepository` pour la persistance durable. Cet adaptateur traduit l'entité `Order` en lignes `orders` et `order_lines`, et reconstruit l'entité à la lecture ; le domaine reste indépendant de l'infrastructure.

## Conséquences

- (+) Le stockage peut être remplacé sans modifier le domaine ni le cas d'utilisation.
- (+) Les tests utilisent un dépôt en mémoire et s'exécutent sans serveur PostgreSQL.
- (+) PostgreSQL permettra de conserver les commandes après le redémarrage du serveur.
- (-) Il faut maintenir et tester un mapping entre `Order` et les tables relationnelles.
- (-) Le port et les adaptateurs ajoutent des fichiers et une indirection à comprendre.
- (-) Le dépôt en mémoire ne reflète pas les garanties de durabilité et de concurrence de PostgreSQL.

## Alternatives considérées

- Accéder directement à PostgreSQL depuis `Order` ou `PlaceOrder` : rejeté, car cela couple le cœur au pilote et rend les tests dépendants de l'infrastructure.
- Conserver uniquement `InMemoryOrderRepository` : rejeté comme solution durable, car les données disparaissent à chaque redémarrage.
- Ajouter un ORM directement au domaine : rejeté, car les annotations et types de persistance pollueraient le modèle métier.
