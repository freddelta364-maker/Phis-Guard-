import { SampleItem } from '../types';

export const SAMPLE_CASES: SampleItem[] = [
  {
    id: 'ameli-phishing',
    label: 'Assurance Maladie (Ameli) - Faux renouvellement',
    category: 'Usurpation Administrative',
    type: 'email',
    expectedRisk: 'critical',
    description: 'Arnaque courante prétendant que votre Carte Vitale doit être mise à jour sous peine de suspension.',
    content: `De : info@ameli-service-notifications.xyz
Objet : URGENT : Votre Carte Vitale V3 expire dans 48 heures !

Cher assuré,

Après vérification de votre dossier de sécurité sociale n° 1 85 04 75 ..., nous constatons que vous n'avez toujours pas validé la nouvelle version de votre Carte Vitale V3.

ATTENTION : Conformément à la réglementation en vigueur, sans action immédiate sous un délai de 24h à 48h, vos droits aux remboursements de soins et médicaments seront temporairement suspendus.

Pour recevoir gratuitement votre nouvelle carte et mettre à jour vos coordonnées :
➡️ Rendez-vous immédiatement sur notre portail sécurisé : https://ameli-portail-renouvellement-carte.xyz/login/ameli.fr

Veuillez vous munir de votre identifiant fiscal et confirmer vos informations personnelles ainsi que votre numéro de carte pour l'expédition.

Cordialement,
La Direction de l'Assurance Maladie
Ne pas répondre à ce message automatique.`
  },
  {
    id: 'paypal-phishing',
    label: 'PayPal - Alerte blocage de compte sous 24h',
    category: 'Usurpation Financière',
    type: 'email',
    expectedRisk: 'critical',
    description: 'Menace de restriction permanente avec fausse connexion sur domaine typosquatté.',
    content: `Expéditeur : service-client@paypa1-alert-verification.com
Objet : ALERTE SÉCURITÉ : Votre compte PayPal a été restreint !

Cher client,

Nous avons détecté une activité de connexion suspecte sur votre compte depuis une adresse IP inconnue située à l'étranger.

Par mesure de précaution, votre compte PayPal est temporairement restreint. Si vous ne confirmez pas votre identité dans un délai de 24 heures, votre compte sera bloqué définitivement et vos fonds seront gelés.

👉 Cliquez sur le lien suivant pour restaurer vos accès sans délai :
http://paypa1-security-verification.com/login/restore-access

Une fois connecté, saisissez votre mot de passe actuel ainsi que le code reçu par SMS pour lever la restriction.

L'équipe de Sécurité PayPal.`
  },
  {
    id: 'colissimo-smishing',
    label: 'SMS Colissimo - Frais de douane en attente',
    category: 'Smishing / SMS',
    type: 'email',
    expectedRisk: 'high',
    description: 'Message SMS classique simulant un paquet bloqué avec lien raccourci.',
    content: `INFO COLISSIMO : Votre colis n° 6A029482910 n'a pas pu être livré en raison d'un affranchissement insuffisant (frais de douane de 1,99 €). Action requise immédiatement avant retour définitif à l'expéditeur : https://bit.ly/colis-douane-reglement-38`
  },
  {
    id: 'url-banking-spoof',
    label: 'URL Phishing - Banque avec sous-domaines trompeurs',
    category: 'URL Malveillante',
    type: 'url',
    expectedRisk: 'critical',
    description: 'Lien imitant une banque avec tirets, mot-clés trompeurs et extension douteuse.',
    content: `https://mabanque-espace-client-securite.credit-agricole.fr.connexion-verification.top/auth/login.php`
  },
  {
    id: 'legit-meeting',
    label: 'Email professionnel légitime (Contrôle sain)',
    category: 'Légitime / Cas témoin',
    type: 'email',
    expectedRisk: 'low',
    description: 'Email d\'entreprise classique sans aucune pression, ni demande d\'identifiant ou lien suspect.',
    content: `De : sophie.dupont@groupe-acme.com
Objet : Point d'avancement projet Q3 - Mardi 14h

Bonjour Thomas,

J'espère que tu vas bien. Comme convenu lors de notre point vendredi, je te propose de nous réunir mardi prochain à 14h pour faire une revue rapide de l'avancement du projet Q3 et ajuster le planning de déploiement.

Tu trouveras l'ordre du jour partagé dans l'espace projet habituel sur notre intranet d'entreprise.

N'hésite pas à me dire si ce créneau te convient ou si tu préfères décaler à mercredi matin.

Très bonne fin de semaine,
Cordialement,
Sophie Dupont
Chef de Projet Digital - Groupe ACME`
  }
];
