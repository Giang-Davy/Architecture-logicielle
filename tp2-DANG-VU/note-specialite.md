# DATA — Contrat des données de commande

1. Une commande contient `id`, `customerId`, `createdAt`, ses lignes (`sku`, `qty`, `unitPrice`) et `total`. `id`, `customerId`, `createdAt` et les lignes sont stockés ; `total` est calculé par `Order.total` (somme de `qty × unitPrice`). **Vérification :** `Get-Content seance2-architecture\hexagonal\domain\Order.js` ; la réponse de `GET /orders/CMD-0001` expose les lignes et le total.
2. Chaque ligne conserve le prix appliqué à l'achat : même si le catalogue change ensuite, l'historique et les statistiques restent basés sur le prix réellement facturé, pas sur le prix courant. **Vérification :** `POST /orders` avec CLAVIER (2) et SOURIS (1) renvoie les `unitPrice` (49 et 19) et le total (117).
3. `findById(id)` renvoie `undefined` si la commande manque (`Map.get`). Ce résultat n'est pas documenté explicitement dans un contrat : le serveur HTTP le transforme en `404` et `{"error":"Commande introuvable"}`. **Vérification :** `GET /orders/CMD-INCONNU` ; lire aussi `InMemoryOrderRepository.js` et `httpServer.js`.
4. Les commandes disparaissent au redémarrage car `InMemoryOrderRepository` est recréé vide. `container.js` fabrique les identifiants `CMD-0001`, `CMD-0002`… avec un compteur local réinitialisé à chaque démarrage. **Vérification effectuée sur le port 3300 :** après `POST /orders`, `GET /orders/CMD-0001` renvoie 200 ; après arrêt et relance (`$env:PORT='3300'; npm run hexa:server`), le même GET renvoie 404.
5. Schéma proposé :

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE order_lines (
  order_id TEXT NOT NULL REFERENCES orders(id),
  line_number INTEGER NOT NULL,
  sku TEXT NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  PRIMARY KEY (order_id, line_number)
);
```

La traduction entre `Order` et ces lignes serait dans un nouvel adaptateur `adapters/secondary/PostgresOrderRepository.js` ; `total` serait recalculé à la lecture, comme dans le domaine.