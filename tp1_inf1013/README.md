# Projet 1 — Application d'annonces de logements à louer

## Projet choisi

Nous avons développé une **application web de publication et de consultation d'annonces de logements à louer**, permettant à des particuliers de publier leurs logements, de gérer leurs annonces et de recevoir des messages d'intérêt de la part des usagers connectés.

---

## Pourquoi ce choix

Ce projet répond directement à la consigne en couvrant l'ensemble des fonctionnalités demandées : gestion des utilisateurs, publication d'annonces avec photos et localisation, système de messagerie interne, et contrôle d'accès. Il constitue un bon exercice pratique pour mettre en œuvre une architecture front-end complète avec gestion d'état local, routage protégé et composants réutilisables.

---

## Technologies utilisées

| Technologie | Rôle |
|---|---|
| **Angular 21** | Framework principal (SPA + SSR) |
| **Angular Material** | Composants UI (cartes, formulaires, dialogues, toggles…) |
| **TypeScript** | Langage de développement |
| **RxJS** | Gestion des flux asynchrones |
| **localStorage** | Persistance des données côté navigateur |
| **JSON (assets/mock)** | Données initiales (logements et utilisateurs pré-enregistrés) |
| **HttpClient + fetch** | Chargement des fichiers JSON au démarrage |

---

## Ce qui a été implémenté

### Gestion des utilisateurs
- **Inscription** : nom, prénom, numéro de téléphone, courriel, adresse personnelle et mot de passe
- **Connexion / Déconnexion** avec session maintenue dans le localStorage
- **Mise à jour du profil** : l'utilisateur peut modifier ses informations personnelles
- **Utilisateurs pré-enregistrés** au démarrage via `assets/mock/users.json` (6 comptes disponibles dès la première visite)

### Gestion des annonces
- **Liste des annonces** : toutes les annonces actives sont visibles par tous (sans connexion), avec filtre par ville
- **Détail d'une annonce** : titre, description courte et longue, mensualités, date de disponibilité, galerie de photos, adresse avec lien vers Google Maps
- **Compteur de vues** : incrémenté à chaque consultation d'une annonce
- **Création / Modification d'une annonce** : réservé aux utilisateurs connectés
- **Activation / Désactivation** d'une annonce via un toggle (le propriétaire peut la réactiver à tout moment)
- **Suppression** d'une annonce avec confirmation
- **Annonces pré-enregistrées** au démarrage via `assets/mock/ads.json` (10 logements disponibles dès la première visite)
- Les nouvelles annonces créées sont **sauvegardées dans le localStorage**

### Système de messagerie interne
- Un utilisateur connecté peut envoyer un **message avec sujet et corps de texte** à l'annonceur depuis la page de détail de l'annonce
- Le propriétaire voit le **nombre de messages reçus** pour chaque annonce dans son tableau de bord
- Il peut consulter les messages reçus via une **boîte de dialogue dédiée**
- Les messages sont stockés dans le localStorage

### Tableau de bord propriétaire (Mes annonces)
- Vue de toutes ses annonces avec : mensualités, date de disponibilité, nombre de vues, nombre de messages
- Actions rapides : modifier, supprimer, activer/désactiver, consulter les messages

### Sécurité et navigation
- Les pages **Mes annonces**, **Nouvelle annonce**, **Modifier une annonce** et **Profil** sont protégées par un `AuthGuard`
- La consultation des annonces est **libre et ouverte à tous**
- L'envoi d'un message est **réservé aux utilisateurs connectés**

---

## Procédure d'installation

### Prérequis
- **Node.js** (v18 ou supérieur) — [nodejs.org](https://nodejs.org)
- **npm** (v9 ou supérieur, inclus avec Node.js)

### Étapes

```bash
# 1. Cloner ou télécharger le projet
cd tp1_inf1013_

# 2. Installer les dépendances
npm install

# 3. Lancer l'application en mode développement
npm start
```

L'application est ensuite accessible à l'adresse : **http://localhost:4200**

---

## Procédure d'utilisation

### Premier démarrage
Au premier lancement, l'application charge automatiquement :
- **10 logements** depuis `src/assets/mock/ads.json`
- **6 utilisateurs** depuis `src/assets/mock/users.json`

Ces données sont ensuite copiées dans le localStorage du navigateur pour être persistées.

### Comptes disponibles dès le départ

| Nom | Email | Mot de passe |
|---|---|---|
| Alice Tremblay | alice@email.com | alice123 |
| Bob Gagnon | bob@email.com | bob123 |
| Claire Roy | claire@email.com | claire123 |
| David Lavoie | david@email.com | david123 |
| Emma Bouchard | emma@email.com | emma123 |
| Felix Cote | felix@email.com | felix123 |

### Parcours utilisateur

1. **Consulter les annonces** → page d'accueil, aucune connexion requise
2. **Voir le détail** d'une annonce → cliquer sur une annonce
3. **Envoyer un message** → se connecter, puis utiliser le bouton « Contacter » sur la page de détail
4. **Publier une annonce** → se connecter → Mes annonces → Nouvelle annonce
5. **Gérer ses annonces** → Mes annonces (modifier, désactiver, consulter les messages)
6. **Modifier son profil** → Menu → Profil

> **Note** : Pour réinitialiser les données au départ (recharger les annonces et utilisateurs JSON), il suffit de vider le localStorage du navigateur via les outils de développement (F12 → Application → Local Storage → tout supprimer), puis de rafraîchir la page.
