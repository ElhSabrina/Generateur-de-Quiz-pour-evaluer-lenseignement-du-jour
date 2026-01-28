# CheckYourTeaching

Application web full stack permettant aux enseignants d’évaluer rapidement la compréhension des étudiants en fin de cours via des quiz (QCM), avec résultats et statistiques.  
Le projet inclut une génération de questions via une API IA (optionnelle) et un parcours simple côté enseignant et étudiant.

## Résumé
En fin de séance, il est souvent difficile d’identifier immédiatement ce qui est compris et ce qui doit être revu. CheckYourTeaching propose :
- création de quiz par l’enseignant
- participation des étudiants via un code ou un accès dédié
- correction et synthèse des résultats
- statistiques pour ajuster le prochain cours

## Fonctionnalités
### Côté enseignant
- Création de quiz (matières, sessions, questions)
- Ajout de questions manuellement
- Génération de QCM via API IA gemini (token limités)
- Lancement et clôture d’une session
- Consultation des résultats : score, tendances, questions les plus difficiles

### Côté étudiant
- Accès à un quiz (par code ou interface dédiée)
- Réponse aux QCM
- Score et correction selon la configuration (immédiat ou après clôture)

### Sécurité et gestion d’accès
- Authentification (mots de passe hashés)
- Gestion des rôles (enseignant / étudiant)
- Protection des routes via middlewares

## Stack technique
- Node.js / Express
- PugJS (templates)
- MySQL (phpMyAdmin / XAMPP possible)
- JWT + bcrypt
- API IA (optionnelle)

## Base de données
Le schéma est fourni dans le fichier :
- `checkyourteaching.sql`

## Lancer le projet (local)
### Prérequis
- Node.js (LTS)
- MySQL ou MariaDB (XAMPP possible)
- Un outil pour importer le SQL (phpMyAdmin recommandé)

### Installation
```bash
npm install
