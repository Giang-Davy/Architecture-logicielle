# Comparaison MVC, MVP et MVVM

| Critère | MVC | MVP | MVVM |
| :--- | :--- | :--- | :--- |
| Couplage entre la vue et la logique | La vue affiche les données et transmet les actions au contrôleur ; elle ne porte pas les règles métier. Le contrôleur relie la vue au modèle. | La vue est passive et communique avec le Presenter via un contrat ; le Presenter porte la logique de présentation. | La vue est liée aux propriétés observables et aux commandes du ViewModel, qui ne dépend pas du DOM. |
| Ce qu'on peut tester sans navigateur | Le modèle et ses règles métier se testent sans navigateur ; la vue, qui manipule le DOM, nécessite un environnement adapté. | Le Presenter se teste sans navigateur avec une fausse vue et un faux service. | Le ViewModel et ses observables se testent sans navigateur, car ils ne dépendent pas du DOM. |
| Où valider une saisie | Dans le modèle pour protéger les règles métier, avec une validation dans la vue éventuellement utile pour guider l'utilisateur. | Dans le Presenter pour vérifier la saisie avant d'appeler le service. | Dans le ViewModel pour centraliser les règles de présentation/métier ; la vue peut aussi afficher les erreurs. |
| Cas d'usage typique | Applications organisées autour d'un modèle et d'actions utilisateur, comme une liste de tâches ou une interface CRUD. | Interfaces à vue passive et logique de présentation testable, notamment formulaires et applications avec plusieurs vues. | Interfaces réactives où l'état de l'écran se synchronise avec les données, comme les applications web ou mobiles. |

## Question de spécialité

### DATA

Les tâches vivent dans le tableau privé `#todos` du `TodoModel`, en mémoire : seul le modèle les modifie avec `add`, `toggle` et `remove`. `all()` renvoie des copies défensives, donc les appelants ne peuvent pas modifier directement les tâches internes. Au rechargement, le modèle est recréé et la liste est perdue ; il faudrait persister les tâches dans `localStorage` ou une base de données, par exemple via un dépôt appelé par le modèle.