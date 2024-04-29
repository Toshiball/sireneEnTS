# Documentation du processus d'indexation

1. L'application démarre avec `main.ts`. Il se connecte à **PM2** et lance le **bus PM2** pour écouter les messages des travailleurs.

2. Il vérifie si le fichier **CSV** spécifié existe. Si c'est le cas, il démarre le cluster de travailleurs et commence à diviser le fichier **CSV**.

3. Chaque **travailleur** exécute `worker.js`. Il envoie un message au **processus parent** pour indiquer qu'il est prêt.

4. Le **processus parent** envoie un message à chaque **travailleur** avec le nom du **fichier** qu'il doit traiter.

5. Le **travailleur** **lit** le fichier, **traite** les données et les **insère** dans la base de données. Une fois terminé, il **envoie** un message au **processus parent** pour indiquer qu'il a terminé.

6. Le **processus parent** met à jour le statut du **travailleur** et lui assigne un nouveau **travail** si disponible.

7. L'application **continue** à fonctionner jusqu'à ce que tout le travail soit **terminé**.