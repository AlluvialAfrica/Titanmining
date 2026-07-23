import { Role } from '../types/roles';

export type HelpCategory = 'getting_started' | 'role_guide' | 'kpi_definition' | 'reports' | 'troubleshooting';

export interface HelpArticle {
  id: string;
  category: HelpCategory;
  titleEN: string;
  titleFR: string;
  bodyEN: string;
  bodyFR: string;
  relatedRoles: string[];
  relatedPages: string[];
  sortOrder: number;
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "gs-001",
    category: "getting_started",
    titleEN: `How to Log In`,
    titleFR: `Comment se connecter`,
    bodyEN: `To access the Alluvial Site Manager, navigate to the login page and enter your assigned email address and password. Your credentials are provided by your Site Controller or HR Manager when you are onboarded.

If you are logging in for the first time, you will be prompted to change your temporary password. Choose a strong password that includes uppercase letters, lowercase letters, numbers, and special characters.

After entering your credentials, click the Log In button. If your account has multi-factor authentication enabled, you will need to confirm via your registered device.

Once logged in, you will be directed to your role-specific dashboard. The forms and features visible to you depend on your assigned role and permissions within the organization.`,
    bodyFR: `Pour acceder au gestionnaire de site Alluvial, rendez-vous sur la page de connexion et entrez votre adresse e-mail et votre mot de passe assignes. Vos identifiants sont fournis par votre controleur de site ou responsable RH lors de votre integration.

Si vous vous connectez pour la premiere fois, vous serez invite a changer votre mot de passe temporaire. Choisissez un mot de passe fort comprenant des lettres majuscules, minuscules, des chiffres et des caracteres speciaux.

Apres avoir entre vos identifiants, cliquez sur le bouton Connexion.

Une fois connecte, vous serez dirige vers votre tableau de bord specifique a votre role.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["form", "profile"],
    sortOrder: 1,
  },
  {
    id: "gs-002",
    category: "getting_started",
    titleEN: `Changing Your Password`,
    titleFR: `Changer votre mot de passe`,
    bodyEN: `You can change your password at any time from your account settings. Navigate to the user menu in the top-right corner of the dashboard and select Account Settings.

Enter your current password for verification, then type your new password twice to confirm. The system enforces minimum security requirements including at least 8 characters, one uppercase letter, one number, and one special character.

If you forget your password, use the Forgot Password link on the login page. A reset email will be sent to your registered address. The reset link expires after 24 hours.

Contact your Site Controller or system administrator if you are unable to reset your password through the self-service flow.`,
    bodyFR: `Vous pouvez changer votre mot de passe a tout moment depuis les parametres de votre compte. Rendez-vous dans le menu utilisateur en haut a droite du tableau de bord.

Entrez votre mot de passe actuel pour verification, puis tapez votre nouveau mot de passe deux fois pour confirmer.

Si vous oubliez votre mot de passe, utilisez le lien Mot de passe oublie sur la page de connexion.

Contactez votre controleur de site ou administrateur systeme si vous ne parvenez pas a reinitialiser votre mot de passe.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["form", "settings", "profile"],
    sortOrder: 2,
  },
  {
    id: "gs-003",
    category: "getting_started",
    titleEN: `Navigating the Dashboard`,
    titleFR: `Naviguer dans le tableau de bord`,
    bodyEN: `The dashboard is your central workspace. On the left side, you will find the navigation sidebar with links to your available modules: Daily Reporting Forms, Report History, User Management (if permitted), and Site Settings.

The top header displays your name, role, and organization context. Use the language toggle to switch between English and French at any time.

The main content area on the right displays the currently selected module. Click any sidebar link to switch between modules. Your active selection is highlighted with a bold border.

At the bottom of the sidebar, you can see your organization ID and site ID. These values determine which data you can access.`,
    bodyFR: `Le tableau de bord est votre espace de travail central. Sur le cote gauche, vous trouverez la barre de navigation laterale avec des liens vers vos modules disponibles.

L'en-tete superieur affiche votre nom, votre role et le contexte de votre organisation.

La zone de contenu principale a droite affiche le module actuellement selectionne. Cliquez sur un lien de la barre laterale pour changer de module.

En bas de la barre laterale, vous pouvez voir votre identifiant d'organisation et identifiant de site.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["form", "history", "profile"],
    sortOrder: 3,
  },
  {
    id: "gs-004",
    category: "getting_started",
    titleEN: `Understanding Your Role`,
    titleFR: `Comprendre votre role`,
    bodyEN: `Each user in the Alluvial Site Manager is assigned a specific role that determines what forms they can fill out, what data they can view, and what administrative actions they can perform.

Roles follow a hierarchical structure. The Site Controller has the broadest access and can view and verify all 14 report templates. Department managers have access to their department-specific forms.

Operational roles like Excavator Operator, Drum Pump Supervisor, and Gate Security have focused access to the specific templates relevant to their daily tasks.

If you believe your role assignment is incorrect or you need access to additional forms, contact your Site Controller or HR Manager to request a role change.`,
    bodyFR: `Chaque utilisateur du gestionnaire de site Alluvial se voit attribuer un role specifique qui determine les formulaires a remplir, les donnees consultables et les actions administratives realisables.

Les roles suivent une structure hierarchique. Le controleur de site a l'acces le plus large et peut visualiser et verifier les 14 modeles de rapports.

Les roles operationnels ont un acces cible aux modeles specifiques pertinents pour leurs taches quotidiennes.

Contactez votre controleur de site ou responsable RH pour demander un changement de role.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["form", "settings", "profile"],
    sortOrder: 4,
  },
  {
    id: "gs-005",
    category: "getting_started",
    titleEN: `Submitting Your First Report`,
    titleFR: `Soumettre votre premier rapport`,
    bodyEN: `To submit a report, navigate to the Daily Reporting Forms section from the sidebar. Your assigned form will be displayed automatically based on your role.

Fill in all required fields marked with an asterisk. Numeric fields will validate your input to ensure values are within acceptable ranges. If a variance is detected, a warning alert will appear.

Before submitting, review all entered data carefully. Once you click Submit, the report is saved and timestamped. You may be required to provide a digital signature.

After submission, the report appears in your Report History. The Site Controller can then review and verify your submission.`,
    bodyFR: `Pour soumettre un rapport, rendez-vous dans la section Formulaires de rapports quotidiens depuis la barre laterale.

Remplissez tous les champs obligatoires marques avec un asterisque. Les champs numeriques valideront votre saisie.

Avant de soumettre, verifiez attentivement toutes les donnees saisies. Une fois que vous cliquez sur Soumettre, le rapport est enregistre et horodate.

Apres la soumission, le rapport apparait dans votre historique des rapports.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 5,
  },
  {
    id: "gs-006",
    category: "getting_started",
    titleEN: `Auto-Save and Draft Recovery`,
    titleFR: `Sauvegarde automatique et recuperation des brouillons`,
    bodyEN: `The Alluvial Site Manager automatically saves your form data as you type. This means that if your browser closes unexpectedly or you lose internet connectivity, your work is not lost.

Drafts are stored locally on your device using browser storage. When you return to the form, any unsaved draft will be automatically restored.

Auto-save occurs every 30 seconds while you are actively editing a form. You can also manually trigger a save by clicking the Save Draft button.

Note that drafts are device-specific. If you start a report on one computer, you will not see the draft on a different device.`,
    bodyFR: `Le gestionnaire de site Alluvial sauvegarde automatiquement vos donnees de formulaire pendant la saisie. Si votre navigateur se ferme, votre travail n'est pas perdu.

Les brouillons sont stockes localement sur votre appareil. Lorsque vous revenez au formulaire, tout brouillon sera automatiquement restaure.

La sauvegarde automatique se produit toutes les 30 secondes. Vous pouvez egalement declencher manuellement une sauvegarde.

Notez que les brouillons sont specifiques a l'appareil. Completez et soumettez vos rapports depuis le meme appareil.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 6,
  },
  {
    id: "gs-007",
    category: "getting_started",
    titleEN: `Working Offline`,
    titleFR: `Travailler hors ligne`,
    bodyEN: `The Alluvial Site Manager supports offline operation for field environments with limited internet connectivity. When you lose connection, an offline banner appears at the top of the screen.

While offline, you can continue filling out and submitting reports. Submitted reports are queued locally and will be automatically synchronized when connectivity is restored.

The offline queue is visible in your Report History with a status of QUEUED. Once the system reconnects, queued reports are uploaded in chronological order.

Some features require an active connection, including user management, password changes, and viewing reports submitted by other users.`,
    bodyFR: `Le gestionnaire de site Alluvial prend en charge le fonctionnement hors ligne pour les environnements de terrain avec une connectivite limitee.

En mode hors ligne, vous pouvez continuer a remplir et soumettre des rapports. Les rapports soumis sont mis en file d'attente localement.

La file d'attente hors ligne est visible dans votre historique des rapports avec un statut EN ATTENTE.

Certaines fonctionnalites necessitent une connexion active, notamment la gestion des utilisateurs et les changements de mot de passe.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history", "profile"],
    sortOrder: 7,
  },
  {
    id: "gs-008",
    category: "getting_started",
    titleEN: `Digital Signatures`,
    titleFR: `Signatures numeriques`,
    bodyEN: `Certain reports require a digital signature before submission. This provides an auditable record of who submitted the report and confirms the accuracy of the data entered.

When a signature is required, a signature pad will appear at the bottom of the form. Use your mouse or touchscreen to draw your signature in the designated area.

The digital signature is cryptographically linked to your user account and the specific report data. This means the signature cannot be transferred to a different report.

Signed reports display a verified badge in the Report History. The Site Controller can view the signature alongside the report data during verification.`,
    bodyFR: `Certains rapports necessitent une signature numerique avant la soumission. Cela fournit un enregistrement verifiable de qui a soumis le rapport.

Lorsqu'une signature est requise, un pavillon de signature apparaitra en bas du formulaire. Utilisez votre souris ou ecran tactile pour dessiner votre signature.

La signature numerique est cryptographiquement liee a votre compte utilisateur et aux donnees specifiques du rapport.

Les rapports signes affichent un badge verifie dans l'historique des rapports.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 8,
  },
  {
    id: "gs-009",
    category: "getting_started",
    titleEN: `Language Toggle`,
    titleFR: `Changement de langue`,
    bodyEN: `The Alluvial Site Manager supports both English and French. You can switch between languages at any time using the language toggle in the top header bar.

When you switch languages, all interface elements update immediately including form labels, button text, navigation items, validation messages, and help content.

Report data that you enter is stored as-is regardless of the active language. Numeric values, names, and other input data remain unchanged when switching languages.

If you notice any missing translations or incorrect text, please report the issue to your Site Controller.`,
    bodyFR: `Le gestionnaire de site Alluvial prend en charge l'anglais et le francais. Vous pouvez changer de langue a tout moment en utilisant le bouton de changement de langue.

Lorsque vous changez de langue, tous les elements d'interface se mettent a jour immediatement.

Les donnees de rapport que vous saisissez sont stockees telles quelles quelle que soit la langue active.

Si vous remarquez des traductions manquantes ou du texte incorrect, veuillez signaler le probleme a votre controleur de site.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["form", "history", "profile"],
    sortOrder: 9,
  },
  {
    id: "gs-010",
    category: "getting_started",
    titleEN: `Getting Help and Support`,
    titleFR: `Obtenir de l'aide et du support`,
    bodyEN: `The help system you are currently reading provides comprehensive guidance for all features of the Alluvial Site Manager. Use the search bar to find articles by keyword or browse by category.

Help articles are filtered based on your role, so you will primarily see content relevant to your daily tasks. You can also access context-sensitive help by clicking the help button on any page.

For issues not covered in the help documentation, contact your Site Controller as your first point of support.

For urgent technical problems, system outages, or security concerns, contact the system administrator directly.`,
    bodyFR: `Le systeme d'aide que vous lisez actuellement fournit des conseils complets pour toutes les fonctionnalites du gestionnaire de site Alluvial.

Les articles d'aide sont filtres en fonction de votre role, vous verrez donc principalement du contenu pertinent pour vos taches quotidiennes.

Pour les problemes non couverts dans la documentation, contactez votre controleur de site comme premier point de support.

Pour les problemes techniques urgents, contactez directement l'administrateur systeme.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["form", "help"],
    sortOrder: 10,
  },
  {
    id: "rg-001",
    category: "role_guide",
    titleEN: `Site Controller Role Guide`,
    titleFR: `Guide du role Controleur de site`,
    bodyEN: `The Site Controller is the highest-authority role on site with complete visibility into all 14 report templates. As Site Controller, you can view, verify, and audit every report submitted by any user on your site.

Your primary responsibility is quality assurance. Each day, you review submitted reports for accuracy, completeness, and consistency. You can flag reports that contain suspicious data or request corrections.

You have access to the full form selector dropdown, allowing you to switch between all templates from T01 through T14. This enables you to cross-reference data across departments.

Additionally, you can manage users, adjust site settings, and configure institutional profile information. You serve as the primary point of contact for all reporting-related questions.`,
    bodyFR: `Le controleur de site est le role avec l'autorite la plus elevee sur le site, avec une visibilite complete sur les 14 modeles de rapports.

Votre responsabilite principale est l'assurance qualite. Chaque jour, vous examinez les rapports soumis pour l'exactitude, l'exhaustivite et la coherence.

Vous avez acces au menu deroulant complet de selection de formulaires, vous permettant de basculer entre tous les modeles de T01 a T14.

De plus, vous pouvez gerer les utilisateurs, ajuster les parametres du site et configurer les informations du profil institutionnel.`,
    relatedRoles: ["SITE_CONTROLLER"],
    relatedPages: ["form", "history", "users"],
    sortOrder: 1,
  },
  {
    id: "rg-002",
    category: "role_guide",
    titleEN: `Mine Manager Role Guide`,
    titleFR: `Guide du role Directeur de mine`,
    bodyEN: `The Mine Manager oversees all mining operations and has access to production-related reports. Your dashboard focuses on daily production output, equipment utilization, and geological findings.

You can submit and review Template 01 (Site Daily Summary) and Template 05 (Mining and Geology Daily Sheet). These reports provide the critical data needed to track extraction progress against targets.

As Mine Manager, you also have visibility into KPI dashboards showing production metrics, safety incidents, and operational efficiency.

You can manage users within your department and have access to site settings for configuring production targets and operational parameters.`,
    bodyFR: `Le directeur de mine supervise toutes les operations minieres et a acces aux rapports lies a la production. Votre tableau de bord se concentre sur la production quotidienne.

Vous pouvez soumettre et examiner le modele 01 (Resume quotidien du site) et le modele 05 (Feuille quotidienne de geologie miniere).

En tant que directeur de mine, vous avez egalement une visibilite sur les tableaux de bord KPI montrant les metriques de production.

Vous pouvez gerer les utilisateurs au sein de votre departement et avez acces aux parametres du site.`,
    relatedRoles: ["SITE_CONTROLLER"],
    relatedPages: ["form", "history"],
    sortOrder: 2,
  },
  {
    id: "rg-003",
    category: "role_guide",
    titleEN: `Operations Manager Role Guide`,
    titleFR: `Guide du role Responsable des operations`,
    bodyEN: `The Operations Manager coordinates day-to-day site activities across all departments. You have broad access to operational reports and can view submissions from multiple teams.

Your primary forms include Template 01 (Site Daily Summary) and you can review cross-departmental data to ensure operational alignment.

The Operations Manager dashboard highlights key operational metrics including equipment uptime, staffing levels, and production throughput. Variance alerts will notify you when metrics fall outside expected ranges.

You work closely with the Site Controller and Mine Manager to ensure smooth operations.`,
    bodyFR: `Le responsable des operations coordonne les activites quotidiennes du site dans tous les departements. Vous avez un large acces aux rapports operationnels.

Vos formulaires principaux incluent le modele 01 (Resume quotidien du site) et vous pouvez examiner les donnees inter-departementales.

Le tableau de bord du responsable des operations met en evidence les metriques operationnelles cles. Les alertes de variance vous notifieront lorsque les metriques sortent des plages attendues.

Vous travaillez en etroite collaboration avec le controleur de site et le directeur de mine.`,
    relatedRoles: ["SITE_CONTROLLER"],
    relatedPages: ["form", "history"],
    sortOrder: 3,
  },
  {
    id: "rg-004",
    category: "role_guide",
    titleEN: `Plant Manager Role Guide`,
    titleFR: `Guide du role Responsable usine`,
    bodyEN: `The Plant Manager oversees all processing and recovery operations. Your focus is on the templates related to material processing including centrifuge operations, shaking table logs, and gold recovery tracking.

You have access to Templates 06 through 09 which cover the full processing pipeline from drum and sand pump operations through to final gold recovery and handover.

Your KPI dashboard shows processing efficiency metrics, recovery percentages, and equipment performance data. Use variance alerts to identify when processing parameters deviate from optimal ranges.

As Plant Manager, you can manage processing staff assignments and review their daily submissions.`,
    bodyFR: `Le responsable usine supervise toutes les operations de traitement et de recuperation. Votre attention se porte sur les modeles lies au traitement des materiaux.

Vous avez acces aux modeles 06 a 09 qui couvrent l'ensemble du pipeline de traitement, des operations de pompe a tambour jusqu'a la recuperation finale.

Votre tableau de bord KPI montre les metriques d'efficacite du traitement, les pourcentages de recuperation et les donnees de performance des equipements.

En tant que responsable usine, vous pouvez gerer les affectations du personnel de traitement et examiner leurs soumissions quotidiennes.`,
    relatedRoles: ["PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 4,
  },
  {
    id: "rg-005",
    category: "role_guide",
    titleEN: `Workshop Manager Role Guide`,
    titleFR: `Guide du role Responsable atelier`,
    bodyEN: `The Workshop Manager is responsible for all equipment maintenance and repair activities. Your primary form is Template 10 (Maintenance, Greasing and Washing Log) where you record daily maintenance activities.

You track equipment condition, scheduled maintenance tasks, and breakdown repairs. The system helps you maintain a maintenance schedule and alerts you when equipment is overdue for service.

Your dashboard shows equipment health metrics, maintenance completion rates, and parts inventory status.

Coordinate with the Operations Manager and Plant Manager to schedule maintenance windows that minimize disruption to production.`,
    bodyFR: `Le responsable atelier est responsable de toutes les activites d'entretien et de reparation des equipements. Votre formulaire principal est le modele 10 (Journal d'entretien, graissage et lavage).

Vous suivez l'etat des equipements, les taches d'entretien programmees et les reparations de pannes. Le systeme vous aide a maintenir un calendrier d'entretien.

Votre tableau de bord montre les metriques de sante des equipements, les taux d'achevement de l'entretien et l'etat d'inventaire des pieces.

Coordonnez avec le responsable des operations et le responsable usine pour planifier des fenetres d'entretien.`,
    relatedRoles: ["ENGINE_MECHANIC"],
    relatedPages: ["form", "history"],
    sortOrder: 5,
  },
  {
    id: "rg-006",
    category: "role_guide",
    titleEN: `Finance Manager Role Guide`,
    titleFR: `Guide du role Responsable financier`,
    bodyEN: `The Finance Manager oversees all financial reporting and expense tracking on site. Your primary forms include Template 12 (Stores, Purchases and Expense Sheet) and Template 14 (Petty Cash Daily Report).

You are responsible for tracking daily expenditures, purchase orders, and cash reconciliation. The system enforces Separation of Duties controls to ensure financial transactions are properly authorized.

Your dashboard displays financial KPIs including daily spend, budget utilization, and expense categorization.

As Finance Manager, you review and approve financial submissions from procurement staff.`,
    bodyFR: `Le responsable financier supervise tous les rapports financiers et le suivi des depenses sur le site. Vos formulaires principaux incluent le modele 12 et le modele 14.

Vous etes responsable du suivi des depenses quotidiennes, des bons de commande et de la reconciliation de tresorerie.

Votre tableau de bord affiche les KPI financiers, y compris les depenses quotidiennes, l'utilisation du budget et la categorisation des depenses.

En tant que responsable financier, vous examinez et approuvez les soumissions financieres du personnel d'achats.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "history"],
    sortOrder: 6,
  },
  {
    id: "rg-007",
    category: "role_guide",
    titleEN: `HR Manager Role Guide`,
    titleFR: `Guide du role Responsable RH`,
    bodyEN: `The HR Manager handles staff attendance, shift scheduling, and personnel management. Your primary form is Template 02 (Staff Attendance and Shift Roster) where you record daily attendance and shift assignments.

You manage user accounts for site personnel, including onboarding new staff with appropriate role assignments and deactivating accounts for departing employees.

Your dashboard shows staffing metrics including attendance rates, shift coverage, and overtime tracking.

Work with department managers to ensure adequate staffing levels. Your attendance records are critical for payroll processing.`,
    bodyFR: `Le responsable RH gere la presence du personnel, la planification des quarts et la gestion du personnel. Votre formulaire principal est le modele 02.

Vous gerez les comptes utilisateurs du personnel du site, y compris l'integration des nouveaux employes avec les attributions de roles appropriees.

Votre tableau de bord montre les metriques de dotation en personnel, y compris les taux de presence et la couverture des quarts.

Travaillez avec les responsables de departement pour assurer des niveaux de dotation adequats.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "users", "history"],
    sortOrder: 7,
  },
  {
    id: "rg-008",
    category: "role_guide",
    titleEN: `Security Manager Role Guide`,
    titleFR: `Guide du role Responsable securite`,
    bodyEN: `The Security Manager oversees all security operations on site. Your primary form is Template 11 (Gate, Search and Items Movement Register) where you record all entries, exits, searches, and item movements.

You manage the gate security team and ensure all personnel and vehicles are properly logged. The system tracks movement patterns and can flag unusual activity.

Your dashboard shows security metrics including gate traffic, search completion rates, and incident reports.

Coordinate with the Site Controller on security protocols and ensure all sensitive areas are properly monitored.`,
    bodyFR: `Le responsable securite supervise toutes les operations de securite sur le site. Votre formulaire principal est le modele 11 (Registre de portail, fouille et mouvement d'articles).

Vous gerez l'equipe de securite du portail et vous assurez que tout le personnel et les vehicules sont correctement enregistres.

Votre tableau de bord montre les metriques de securite, y compris le trafic au portail, les taux de fouille et les rapports d'incidents.

Coordonnez avec le controleur de site sur les protocoles de securite.`,
    relatedRoles: ["GATE_SECURITY"],
    relatedPages: ["form", "history"],
    sortOrder: 8,
  },
  {
    id: "rg-009",
    category: "role_guide",
    titleEN: `Excavator Operator Role Guide`,
    titleFR: `Guide du role Operateur d'excavatrice`,
    bodyEN: `The Excavator Operator is responsible for logging daily machine operations. Your primary form is Template 03 (Excavator / Machine Daily Log) where you record hours of operation, fuel consumption, and material moved.

At the start of each shift, complete the pre-operation checklist to confirm the machine is in safe working condition. Report any mechanical issues immediately.

Your form captures critical data including engine hours, idle time, productive hours, and material volumes. This data feeds into production and maintenance KPIs.

Submit your daily log at the end of each shift. The Operations Manager and Workshop Manager will review your submissions.`,
    bodyFR: `L'operateur d'excavatrice est responsable de l'enregistrement des operations quotidiennes de la machine. Votre formulaire principal est le modele 03 (Journal quotidien d'excavatrice / machine).

Au debut de chaque quart, completez la liste de controle de pre-operation pour confirmer que la machine est en bon etat de fonctionnement.

Votre formulaire capture les donnees critiques, y compris les heures moteur, le temps d'arret, les heures productives et les volumes de materiaux.

Soumettez votre journal quotidien a la fin de chaque quart.`,
    relatedRoles: ["MINING_GEOLOGY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 9,
  },
  {
    id: "rg-010",
    category: "role_guide",
    titleEN: `General Worker Role Guide`,
    titleFR: `Guide du role Travailleur general`,
    bodyEN: `The General Worker role provides access to basic site reporting functions. Depending on your assignment, you may be directed to fill out specific sections of various templates.

Your primary task is to accurately record the data assigned to you by your supervisor. Follow the instructions provided in each form section carefully.

If you encounter fields you do not understand, use the help button to access context-sensitive guidance. You can also ask your supervisor or Site Controller for clarification.

Always submit your forms before the end of your shift to ensure timely data collection and reporting.`,
    bodyFR: `Le role de travailleur general fournit un acces aux fonctions de base de rapport du site. Selon votre affectation, vous pouvez etre dirige a remplir des sections specifiques de divers modeles.

Votre tache principale est d'enregistrer avec precision les donnees qui vous sont assignees par votre superviseur.

Si vous rencontrez des champs que vous ne comprenez pas, utilisez le bouton d'aide pour acceder a une aide contextuelle.

Soumettez toujours vos formulaires avant la fin de votre quart pour assurer la collecte et le rapport des donnees en temps opportun.`,
    relatedRoles: ["GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 10,
  },
  {
    id: "rg-011",
    category: "role_guide",
    titleEN: `Mining Geology Lead Role Guide`,
    titleFR: `Guide du role Responsable geologie miniere`,
    bodyEN: `The Mining Geology Lead is responsible for geological surveying, ore body mapping, and mine planning on site. This role reports to the Mine Manager and provides critical data on ore grades and geological conditions that guide extraction decisions.

Your primary form is Template 05 (Mining and Geology Daily Sheet) where you record daily geological observations, sample results, and pit advance measurements. You can also read Template 03 (Excavator / Machine Daily Log) to correlate machine activity with geological targets.

Your KPI dashboard tracks geology metrics including samples collected, average ore grade in grams per tonne, pit advance in metres, and geological maps produced. These indicators help assess exploration progress and ore body delineation accuracy.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. For broader site data access, coordinate with the Mine Manager or Site Controller.`,
    bodyFR: `Le responsable geologie miniere est charge des releves geologiques, de la cartographie des gisements et de la planification miniere sur le site. Ce role releve du directeur de mine et fournit des donnees essentielles sur les teneurs en minerai et les conditions geologiques.

Votre formulaire principal est le modele 05 (Feuille quotidienne de geologie miniere) ou vous enregistrez les observations geologiques quotidiennes, les resultats d'echantillons et les mesures d'avancement des fosses. Vous pouvez egalement consulter le modele 03 (Journal quotidien d'excavatrice / machine).

Votre tableau de bord KPI suit les metriques geologiques, y compris les echantillons collectes, la teneur moyenne en minerai en grammes par tonne, l'avancement des fosses en metres et les cartes geologiques produites.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["MINING_GEOLOGY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 11,
  },
  {
    id: "rg-012",
    category: "role_guide",
    titleEN: `Processing Recovery Lead Role Guide`,
    titleFR: `Guide du role Responsable traitement et recuperation`,
    bodyEN: `The Processing Recovery Lead oversees mineral processing and gold recovery operations at the plant. This role reports to the Plant Manager and coordinates the work of centrifuge operators, shaking table operators, and other processing staff.

You work with Templates 06 through 09 covering the full processing pipeline. You create entries for Template 07 (Centrifuge Operations Log), Template 08 (Shaking Table Operations Log), and Template 09 (Gold Recovery and Assay Report). You also read Template 06 (Drum and Sand Pump Daily Log) to monitor feed supply and verify submissions for Templates 07 and 08.

Your KPI dashboard tracks processing metrics including concentrate recovered in grams, recovery rate percentage, feed rate in cubic metres per hour, and number of cleanups conducted. These metrics are critical for evaluating plant efficiency and gold yield.

You can view and input your own KPIs and verify reports for Templates 07 and 08. You do not have user management or data export privileges. Work closely with the Plant Manager to optimize recovery rates and processing throughput.`,
    bodyFR: `Le responsable traitement et recuperation supervise les operations de traitement des mineraux et de recuperation de l'or a l'usine. Ce role releve du responsable usine et coordonne le travail des operateurs de centrifugeuse, des operateurs de table a secousses et du personnel de traitement.

Vous travaillez avec les modeles 06 a 09 couvrant l'ensemble du pipeline de traitement. Vous creez des entrees pour le modele 07 (Journal des operations de centrifugeuse), le modele 08 (Journal des operations de table a secousses) et le modele 09 (Rapport de recuperation d'or et d'essai). Vous lisez egalement le modele 06 et verifiez les soumissions des modeles 07 et 08.

Votre tableau de bord KPI suit les metriques de traitement, y compris le concentre recupere en grammes, le taux de recuperation en pourcentage, le debit d'alimentation en metres cubes par heure et le nombre de nettoyages effectues.

Vous pouvez consulter et saisir vos propres KPI et verifier les rapports des modeles 07 et 08. Vous ne disposez pas de privileges de gestion des utilisateurs ou d'exportation de donnees.`,
    relatedRoles: ["PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 12,
  },
  {
    id: "rg-013",
    category: "role_guide",
    titleEN: `Fuel Admin Logistics Role Guide`,
    titleFR: `Guide du role Administrateur carburant et logistique`,
    bodyEN: `The Fuel Admin Logistics role manages fuel distribution, consumption tracking, and related logistics records on site. This role ensures accurate accounting of all fuel issued to equipment and vehicles, and supports supply chain documentation.

You work with three templates daily. Template 02 (Staff Attendance and Shift Roster) records personnel movements related to fuel operations. Template 04 (Fuel Consumption and Distribution Report) is your primary operational form for logging fuel issued, received, and consumed. Template 12 (Stores, Purchases and Expense Sheet) tracks fuel-related purchases and stock levels.

Your KPI dashboard tracks fuel metrics including total fuel issued in litres, fuel variance in litres, stock reconciliations completed, and shift reports filed. Keeping fuel variance at zero is a critical target that ensures no unaccounted losses.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Finance Manager for purchase approvals and with the Operations Manager for fuel allocation priorities.`,
    bodyFR: `Le role d'administrateur carburant et logistique gere la distribution de carburant, le suivi de la consommation et les documents logistiques associes sur le site. Ce role assure une comptabilisation precise de tout le carburant distribue aux equipements et vehicules.

Vous travaillez avec trois modeles quotidiennement. Le modele 02 (Presence du personnel et tableau des quarts) enregistre les mouvements de personnel lies aux operations de carburant. Le modele 04 (Rapport de consommation et distribution de carburant) est votre formulaire operationnel principal. Le modele 12 (Feuille de magasin, achats et depenses) suit les achats et niveaux de stock de carburant.

Votre tableau de bord KPI suit les metriques de carburant, y compris le carburant total distribue en litres, l'ecart de carburant en litres, les reconciliations de stock effectuees et les rapports de quart deposes.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "history"],
    sortOrder: 13,
  },
  {
    id: "rg-014",
    category: "role_guide",
    titleEN: `Engine Mechanic Role Guide`,
    titleFR: `Guide du role Mecanicien moteur`,
    bodyEN: `The Engine Mechanic performs engine repairs, preventive maintenance, and breakdown response for mining equipment on site. This role reports to the Workshop Manager and is essential for maintaining equipment uptime across all operational departments.

Your primary form is Template 10 (Maintenance, Greasing and Washing Log) where you record all repair activities, parts used, and maintenance tasks completed. You can also read Template 03 (Excavator / Machine Daily Log) to review equipment operating conditions and identify recurring issues.

Your KPI dashboard tracks maintenance metrics including repairs completed, parts used, machine uptime percentage, preventive maintenance tasks done, and breakdown response time in minutes. A target uptime of 90 percent and response time under 30 minutes are key performance benchmarks.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Report all major breakdowns to the Workshop Manager and coordinate parts requests with the Procurement Officer.`,
    bodyFR: `Le mecanicien moteur effectue les reparations de moteur, l'entretien preventif et les interventions en cas de panne pour les equipements miniers sur le site. Ce role releve du responsable atelier et est essentiel pour maintenir la disponibilite des equipements.

Votre formulaire principal est le modele 10 (Journal d'entretien, graissage et lavage) ou vous enregistrez toutes les activites de reparation, les pieces utilisees et les taches d'entretien terminees. Vous pouvez egalement lire le modele 03 (Journal quotidien d'excavatrice / machine) pour examiner les conditions de fonctionnement des equipements.

Votre tableau de bord KPI suit les metriques d'entretien, y compris les reparations effectuees, les pieces utilisees, le pourcentage de disponibilite des machines, les taches d'entretien preventif realisees et le temps de reponse aux pannes en minutes.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["ENGINE_MECHANIC"],
    relatedPages: ["form", "history"],
    sortOrder: 14,
  },
  {
    id: "rg-015",
    category: "role_guide",
    titleEN: `Electrical Mechanic Role Guide`,
    titleFR: `Guide du role Mecanicien electricien`,
    bodyEN: `The Electrical Mechanic handles all electrical systems maintenance, motor servicing, and cable repairs for site equipment. This role reports to the Workshop Manager and ensures that electrical components across the mine and processing plant remain operational.

Your primary form is Template 10 (Maintenance, Greasing and Washing Log) where you log electrical repair activities, motor servicing tasks, and cable replacement work. You can also read Template 03 (Excavator / Machine Daily Log) to review equipment electrical performance and fault histories.

Your KPI dashboard tracks maintenance metrics including electrical repairs completed, motors serviced, cable repairs performed, and overall machine uptime percentage. Maintaining a 90 percent uptime target ensures minimal disruption to production.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Engine Mechanic and Workshop Manager on equipment requiring combined mechanical and electrical attention.`,
    bodyFR: `Le mecanicien electricien gere l'entretien de tous les systemes electriques, la revision des moteurs et les reparations de cables des equipements du site. Ce role releve du responsable atelier et veille a ce que les composants electriques de la mine et de l'usine de traitement restent operationnels.

Votre formulaire principal est le modele 10 (Journal d'entretien, graissage et lavage) ou vous enregistrez les activites de reparation electrique, les taches de revision des moteurs et les travaux de remplacement de cables. Vous pouvez egalement lire le modele 03 (Journal quotidien d'excavatrice / machine).

Votre tableau de bord KPI suit les metriques d'entretien, y compris les reparations electriques effectuees, les moteurs revises, les reparations de cables realisees et le pourcentage global de disponibilite des machines.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["ELECTRICAL_MECHANIC"],
    relatedPages: ["form", "history"],
    sortOrder: 15,
  },
  {
    id: "rg-016",
    category: "role_guide",
    titleEN: `Greasing Washing Helper Role Guide`,
    titleFR: `Guide du role Aide graissage et lavage`,
    bodyEN: `The Greasing Washing Helper provides essential support to the maintenance team by performing routine greasing, washing, and cleaning tasks on site equipment. This role reports to the Workshop Manager and ensures machines are properly lubricated and clean for safe, efficient operation.

Your primary form is Template 10 (Maintenance, Greasing and Washing Log) where you record the number of machines greased, wash tasks completed, and other helper assignments carried out during your shift.

Your KPI dashboard tracks maintenance support metrics including machines greased, washes completed, and total helper tasks performed. Consistent completion of greasing schedules is critical for preventing premature equipment wear and breakdowns.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Follow the greasing schedule set by the Workshop Manager and report any unusual equipment conditions immediately.`,
    bodyFR: `L'aide graissage et lavage fournit un soutien essentiel a l'equipe d'entretien en effectuant les taches routinieres de graissage, lavage et nettoyage des equipements du site. Ce role releve du responsable atelier et assure que les machines sont correctement lubrifiees et propres.

Votre formulaire principal est le modele 10 (Journal d'entretien, graissage et lavage) ou vous enregistrez le nombre de machines graissees, les taches de lavage terminees et les autres affectations d'aide effectuees pendant votre quart.

Votre tableau de bord KPI suit les metriques de soutien a l'entretien, y compris les machines graissees, les lavages termines et le total des taches d'aide effectuees.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 16,
  },
  {
    id: "rg-017",
    category: "role_guide",
    titleEN: `Gate Security Role Guide`,
    titleFR: `Guide du role Securite au portail`,
    bodyEN: `The Gate Security role is responsible for controlling access at site entry and exit points. This role reports to the Security Manager and ensures that all personnel, vehicles, and items entering or leaving the site are properly logged and searched.

Your primary form is Template 11 (Gate, Search and Items Movement Register) where you record gate logs, search activities, and item movements throughout your shift. Accurate and timely entries are essential for maintaining site security and audit compliance.

Your KPI dashboard tracks security metrics including gate logs recorded, searches conducted, incidents reported, patrol rounds completed, and unauthorized access attempts. The target for incidents and unauthorized attempts is zero, reflecting the goal of a fully secured site.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Report all security incidents immediately to the Security Manager and maintain vigilance at all times during your shift.`,
    bodyFR: `Le role de securite au portail est responsable du controle d'acces aux points d'entree et de sortie du site. Ce role releve du responsable securite et veille a ce que tout le personnel, les vehicules et les articles entrant ou sortant du site soient correctement enregistres et fouilles.

Votre formulaire principal est le modele 11 (Registre de portail, fouille et mouvement d'articles) ou vous enregistrez les journaux de portail, les activites de fouille et les mouvements d'articles pendant votre quart.

Votre tableau de bord KPI suit les metriques de securite, y compris les journaux de portail enregistres, les fouilles effectuees, les incidents signales, les rondes de patrouille effectuees et les tentatives d'acces non autorisees.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["GATE_SECURITY"],
    relatedPages: ["form", "history"],
    sortOrder: 17,
  },
  {
    id: "rg-018",
    category: "role_guide",
    titleEN: `Drum Pump Supervisor Role Guide`,
    titleFR: `Guide du role Superviseur pompe a tambour`,
    bodyEN: `The Drum Pump Supervisor oversees the operation of drum and sand pumps that feed material into the processing plant. This role reports to the Plant Manager and ensures consistent and efficient slurry delivery to downstream processing stages.

Your primary form is Template 06 (Drum and Sand Pump Daily Log) where you record pump operating hours, slurry volumes processed, and pressure check results. Accurate logging is essential for correlating feed supply with plant throughput.

Your KPI dashboard tracks production metrics including pump operating hours, slurry processed in cubic metres, and pressure checks completed. Maintaining target operating hours and completing all scheduled pressure checks helps prevent equipment failure and production interruptions.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Drum Pump Assistant and Plant Manager to ensure continuous feed supply during production hours.`,
    bodyFR: `Le superviseur pompe a tambour supervise le fonctionnement des pompes a tambour et a sable qui alimentent l'usine de traitement en materiau. Ce role releve du responsable usine et assure une livraison constante et efficace de la boue aux etapes de traitement en aval.

Votre formulaire principal est le modele 06 (Journal quotidien des pompes a tambour et a sable) ou vous enregistrez les heures de fonctionnement des pompes, les volumes de boue traites et les resultats des controles de pression.

Votre tableau de bord KPI suit les metriques de production, y compris les heures de fonctionnement des pompes, la boue traitee en metres cubes et les controles de pression effectues.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 18,
  },
  {
    id: "rg-019",
    category: "role_guide",
    titleEN: `Drum Pump Assistant Role Guide`,
    titleFR: `Guide du role Assistant pompe a tambour`,
    bodyEN: `The Drum Pump Assistant supports the Drum Pump Supervisor in operating and maintaining drum and sand pump equipment. This role reports to the Plant Manager through the Drum Pump Supervisor and assists with daily pump operations and monitoring.

Your primary form is Template 06 (Drum and Sand Pump Daily Log) where you record your pump operating hours and helper tasks completed during each shift. Your entries complement those of the Drum Pump Supervisor to provide a complete operational picture.

Your KPI dashboard tracks production metrics including pump operating hours and helper tasks completed. Meeting your target operating hours and task count ensures the pump station runs smoothly throughout each shift.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Follow the instructions of the Drum Pump Supervisor and report any equipment anomalies immediately.`,
    bodyFR: `L'assistant pompe a tambour soutient le superviseur pompe a tambour dans l'exploitation et l'entretien des equipements de pompe a tambour et a sable. Ce role releve du responsable usine par l'intermediaire du superviseur pompe a tambour.

Votre formulaire principal est le modele 06 (Journal quotidien des pompes a tambour et a sable) ou vous enregistrez vos heures de fonctionnement des pompes et les taches d'aide effectuees pendant chaque quart.

Votre tableau de bord KPI suit les metriques de production, y compris les heures de fonctionnement des pompes et les taches d'aide effectuees.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 19,
  },
  {
    id: "rg-020",
    category: "role_guide",
    titleEN: `Centrifuge Operator Role Guide`,
    titleFR: `Guide du role Operateur de centrifugeuse`,
    bodyEN: `The Centrifuge Operator runs the centrifuge equipment used in the gravity separation stage of gold recovery. This role reports to the Plant Manager and works closely with the Processing Recovery Lead to maximise concentrate recovery from ore feed.

Your primary form is Template 07 (Centrifuge Operations Log) where you record centrifuge runs completed, concentrate recovered in grams, and plant uptime hours. Accurate data entry is essential for tracking recovery efficiency and plant performance.

Your KPI dashboard tracks processing metrics including centrifuge runs completed, concentrate recovered in grams, and plant uptime hours. Meeting the target of 3 runs per shift with 100 grams of concentrate recovery ensures consistent gold output.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Follow the operating procedures set by the Processing Recovery Lead and report any equipment malfunctions to the Plant Manager.`,
    bodyFR: `L'operateur de centrifugeuse fait fonctionner l'equipement de centrifugeuse utilise dans l'etape de separation par gravite de la recuperation de l'or. Ce role releve du responsable usine et travaille en etroite collaboration avec le responsable traitement et recuperation.

Votre formulaire principal est le modele 07 (Journal des operations de centrifugeuse) ou vous enregistrez les cycles de centrifugeuse termines, le concentre recupere en grammes et les heures de disponibilite de l'usine.

Votre tableau de bord KPI suit les metriques de traitement, y compris les cycles de centrifugeuse termines, le concentre recupere en grammes et les heures de disponibilite de l'usine.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 20,
  },
  {
    id: "rg-021",
    category: "role_guide",
    titleEN: `Shaking Table Operator Role Guide`,
    titleFR: `Guide du role Operateur de table a secousses`,
    bodyEN: `The Shaking Table Operator manages the shaking table equipment used for gravity-based mineral separation. This role reports to the Plant Manager and works alongside the Processing Recovery Lead to refine concentrate quality through precise table adjustments.

Your primary form is Template 08 (Shaking Table Operations Log) where you record table runs completed, concentrate recovered in grams, and plant uptime hours. Careful adjustment of table angle, water flow, and feed rate directly impacts recovery quality.

Your KPI dashboard tracks processing metrics including table runs completed, concentrate recovered in grams, and plant uptime hours. A target of 4 runs per shift with 80 grams of concentrate ensures steady contribution to overall gold recovery.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Centrifuge Operator to ensure smooth material flow between processing stages.`,
    bodyFR: `L'operateur de table a secousses gere l'equipement de table a secousses utilise pour la separation minerale par gravite. Ce role releve du responsable usine et travaille aux cotes du responsable traitement et recuperation pour affiner la qualite du concentre.

Votre formulaire principal est le modele 08 (Journal des operations de table a secousses) ou vous enregistrez les cycles de table termines, le concentre recupere en grammes et les heures de disponibilite de l'usine.

Votre tableau de bord KPI suit les metriques de traitement, y compris les cycles de table termines, le concentre recupere en grammes et les heures de disponibilite de l'usine.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 21,
  },
  {
    id: "rg-022",
    category: "role_guide",
    titleEN: `Site Petty Cash Manager Role Guide`,
    titleFR: `Guide du role Responsable de la petite caisse du site`,
    bodyEN: `The Site Petty Cash Manager handles day-to-day cash disbursements and receipt tracking for minor site expenditures. This role reports to the Finance Manager and ensures that all petty cash transactions are properly documented and reconciled.

Your primary form is Template 14 (Petty Cash Daily Report) where you record cash disbursements made and receipts collected. You can also read Template 12 (Stores, Purchases and Expense Sheet) to cross-reference purchase records with petty cash outlays.

Your KPI dashboard tracks finance metrics including cash disbursements processed, receipts recorded, and cash variance in dollars. Maintaining zero cash variance is the primary target, ensuring full accountability for all funds handled.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Reconcile your cash balance daily and submit any discrepancies to the Finance Manager immediately.`,
    bodyFR: `Le responsable de la petite caisse du site gere les decaissements quotidiens et le suivi des recus pour les depenses mineures du site. Ce role releve du responsable financier et veille a ce que toutes les transactions de petite caisse soient correctement documentees et rapprochees.

Votre formulaire principal est le modele 14 (Rapport quotidien de petite caisse) ou vous enregistrez les decaissements effectues et les recus collectes. Vous pouvez egalement consulter le modele 12 (Feuille de magasin, achats et depenses) pour croiser les registres d'achats.

Votre tableau de bord KPI suit les metriques financieres, y compris les decaissements traites, les recus enregistres et l'ecart de tresorerie en dollars. Maintenir un ecart de tresorerie nul est l'objectif principal.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "history"],
    sortOrder: 22,
  },
  {
    id: "rg-023",
    category: "role_guide",
    titleEN: `System Admin Role Guide`,
    titleFR: `Guide du role Administrateur systeme`,
    bodyEN: `The System Admin manages the technical configuration and user administration of the Alluvial Site Manager platform. This role has read access to all 14 report templates for monitoring and audit purposes, but does not create operational reports.

Your primary responsibilities include managing user accounts, assigning roles, configuring site settings, and ensuring system availability. You can create, modify, and deactivate user accounts across all roles and departments.

As System Admin, you have access to all KPI dashboards for monitoring purposes, including team-level KPI views across all departments. However, you do not input KPI data directly since your role is administrative rather than operational.

You have full user management privileges, profile editing capabilities, and data export access. Use these permissions responsibly and maintain audit logs of all administrative actions. Coordinate with the Site Controller on organizational policy changes.`,
    bodyFR: `L'administrateur systeme gere la configuration technique et l'administration des utilisateurs de la plateforme Alluvial Site Manager. Ce role a un acces en lecture a tous les 14 modeles de rapports a des fins de surveillance et d'audit, mais ne cree pas de rapports operationnels.

Vos responsabilites principales incluent la gestion des comptes utilisateurs, l'attribution des roles, la configuration des parametres du site et la garantie de la disponibilite du systeme.

En tant qu'administrateur systeme, vous avez acces a tous les tableaux de bord KPI a des fins de surveillance, y compris les vues KPI au niveau de l'equipe dans tous les departements. Cependant, vous ne saisissez pas de donnees KPI directement.

Vous disposez de privileges complets de gestion des utilisateurs, de modification de profil et d'exportation de donnees. Utilisez ces autorisations de maniere responsable et maintenez les journaux d'audit de toutes les actions administratives.`,
    relatedRoles: ["SYSTEM_ADMIN"],
    relatedPages: ["form", "history", "users", "settings"],
    sortOrder: 23,
  },
  {
    id: "rg-024",
    category: "role_guide",
    titleEN: `Safety Compliance Manager Role Guide`,
    titleFR: `Guide du role Responsable securite et conformite`,
    bodyEN: `The Safety Compliance Manager ensures that all site operations comply with health, safety, and environmental regulations. This role has read access to all 14 report templates, providing full visibility into operational data to identify safety risks and compliance gaps.

You create entries for Template 02 (Staff Attendance and Shift Roster) to track safety-related personnel records and Template 13 (Safety and Compliance Report) to document inspections, drills, and incident investigations. You also verify submissions for Template 13 to ensure compliance standards are met.

Your KPI dashboard tracks safety metrics including safety drills conducted, HSE inspections completed, near miss reports filed, safety meetings held, audit findings documented, and regulatory submissions made. Zero near misses and full audit compliance are your primary targets.

You have data export privileges and can view team-level KPIs across all departments. You do not have user management capabilities. Coordinate with department managers to implement corrective actions and ensure all staff are trained on safety procedures.`,
    bodyFR: `Le responsable securite et conformite veille a ce que toutes les operations du site soient conformes aux reglementations en matiere de sante, de securite et d'environnement. Ce role a un acces en lecture a tous les 14 modeles de rapports pour identifier les risques et les lacunes de conformite.

Vous creez des entrees pour le modele 02 (Presence du personnel et tableau des quarts) pour suivre les registres du personnel lies a la securite et le modele 13 (Rapport de securite et conformite) pour documenter les inspections, les exercices et les enquetes sur les incidents. Vous verifiez egalement les soumissions du modele 13.

Votre tableau de bord KPI suit les metriques de securite, y compris les exercices de securite effectues, les inspections HSE terminees, les rapports de quasi-accidents deposes, les reunions de securite tenues, les conclusions d'audit documentees et les soumissions reglementaires.

Vous disposez de privileges d'exportation de donnees et pouvez consulter les KPI au niveau de l'equipe dans tous les departements. Vous ne disposez pas de capacites de gestion des utilisateurs.`,
    relatedRoles: ["SITE_CONTROLLER"],
    relatedPages: ["form", "history"],
    sortOrder: 24,
  },
  {
    id: "rg-025",
    category: "role_guide",
    titleEN: `Mine Foreman Role Guide`,
    titleFR: `Guide du role Contremaitre de mine`,
    bodyEN: `The Mine Foreman supervises the mining crew and coordinates daily extraction activities on site. This role reports to the Mine Manager and serves as the front-line supervisor for excavator operators, dredge operators, and general workers in the mining area.

You work with three templates daily. Template 03 (Excavator / Machine Daily Log) records equipment operations under your supervision. Template 05 (Mining and Geology Daily Sheet) tracks geological observations and pit progress. Template 13 (Safety and Compliance Report) documents safety conditions in the mining area. You also verify submissions for Template 03 to ensure accuracy of operator reports.

Your KPI dashboard tracks production metrics including shift reports filed, task assignments distributed, safety incidents recorded, and production meetings held. Zero safety incidents is a non-negotiable target for your team.

You can view team-level KPIs for the mining crew, input your own KPIs, and verify Template 03 submissions. You do not have user management or data export privileges. Maintain close communication with the Mine Manager on daily production targets and safety conditions.`,
    bodyFR: `Le contremaitre de mine supervise l'equipe miniere et coordonne les activites d'extraction quotidiennes sur le site. Ce role releve du directeur de mine et sert de superviseur de premiere ligne pour les operateurs d'excavatrice, les operateurs de drague et les travailleurs generaux.

Vous travaillez avec trois modeles quotidiennement. Le modele 03 (Journal quotidien d'excavatrice / machine) enregistre les operations d'equipement sous votre supervision. Le modele 05 (Feuille quotidienne de geologie miniere) suit les observations geologiques. Le modele 13 (Rapport de securite et conformite) documente les conditions de securite. Vous verifiez egalement les soumissions du modele 03.

Votre tableau de bord KPI suit les metriques de production, y compris les rapports de quart deposes, les affectations de taches distribuees, les incidents de securite enregistres et les reunions de production tenues.

Vous pouvez consulter les KPI au niveau de l'equipe pour l'equipe miniere, saisir vos propres KPI et verifier les soumissions du modele 03. Vous ne disposez pas de privileges de gestion des utilisateurs ou d'exportation de donnees.`,
    relatedRoles: ["MINING_GEOLOGY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 25,
  },
  {
    id: "rg-026",
    category: "role_guide",
    titleEN: `Dredge Operator Role Guide`,
    titleFR: `Guide du role Operateur de drague`,
    bodyEN: `The Dredge Operator runs dredging equipment used to extract alluvial material from riverbeds and water-bearing deposits. This role reports to the Mine Foreman and is responsible for maximising material extraction while maintaining equipment in good condition.

Your primary form is Template 03 (Excavator / Machine Daily Log) where you record dredge operating hours, area covered in square metres, and sediment processed in cubic metres. Complete your log at the end of each shift with accurate measurements.

Your KPI dashboard tracks production metrics including dredge operating hours, dredge area covered in square metres, and sediment processed in cubic metres. A target of 8 operating hours and 300 cubic metres of sediment per shift reflects optimal dredge utilisation.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Report any mechanical issues to the Workshop Manager and coordinate dredging locations with the Mining Geology Lead.`,
    bodyFR: `L'operateur de drague fait fonctionner l'equipement de dragage utilise pour extraire le materiau alluvionnaire des lits de riviere et des gisements aquiferes. Ce role releve du contremaitre de mine et est responsable de maximiser l'extraction de materiau tout en maintenant l'equipement en bon etat.

Votre formulaire principal est le modele 03 (Journal quotidien d'excavatrice / machine) ou vous enregistrez les heures de fonctionnement de la drague, la superficie couverte en metres carres et le sediment traite en metres cubes.

Votre tableau de bord KPI suit les metriques de production, y compris les heures de fonctionnement de la drague, la superficie couverte en metres carres et le sediment traite en metres cubes.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 26,
  },
  {
    id: "rg-027",
    category: "role_guide",
    titleEN: `Process Plant Operator Role Guide`,
    titleFR: `Guide du role Operateur d'usine de traitement`,
    bodyEN: `The Process Plant Operator runs centrifuge and shaking table equipment in the processing plant. This role reports to the Plant Manager and works alongside the Processing Recovery Lead to maintain consistent processing throughput and recovery rates.

You work with two templates. Template 07 (Centrifuge Operations Log) records centrifuge processing data, and Template 08 (Shaking Table Operations Log) tracks shaking table operations. Both forms capture the essential data for evaluating plant efficiency.

Your KPI dashboard tracks processing metrics including plant uptime hours, feed rate in cubic metres per hour, and cleanups conducted. A target of 8 uptime hours per shift with a 15 cubic metres per hour feed rate ensures optimal plant performance.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Follow the processing parameters set by the Plant Manager and report any deviations immediately.`,
    bodyFR: `L'operateur d'usine de traitement fait fonctionner les equipements de centrifugeuse et de table a secousses dans l'usine de traitement. Ce role releve du responsable usine et travaille aux cotes du responsable traitement et recuperation.

Vous travaillez avec deux modeles. Le modele 07 (Journal des operations de centrifugeuse) enregistre les donnees de traitement de la centrifugeuse, et le modele 08 (Journal des operations de table a secousses) suit les operations de table a secousses.

Votre tableau de bord KPI suit les metriques de traitement, y compris les heures de disponibilite de l'usine, le debit d'alimentation en metres cubes par heure et les nettoyages effectues.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 27,
  },
  {
    id: "rg-028",
    category: "role_guide",
    titleEN: `Pump Operator Role Guide`,
    titleFR: `Guide du role Operateur de pompe`,
    bodyEN: `The Pump Operator manages pump equipment that moves slurry and water through the processing circuit. This role reports to the Plant Manager and ensures continuous flow of material to the processing plant during production hours.

Your primary form is Template 06 (Drum and Sand Pump Daily Log) where you record pump operating hours, pressure check results, and slurry volumes processed in cubic metres. Regular pressure monitoring is critical for detecting blockages and preventing pump failures.

Your KPI dashboard tracks production metrics including pump operating hours, pressure checks completed, and slurry processed in cubic metres. A target of 8 operating hours with 6 pressure checks and 150 cubic metres of slurry per shift reflects efficient pump utilisation.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Drum Pump Supervisor on pump scheduling and report any pressure anomalies immediately.`,
    bodyFR: `L'operateur de pompe gere les equipements de pompe qui deplacent la boue et l'eau a travers le circuit de traitement. Ce role releve du responsable usine et assure un flux continu de materiau vers l'usine de traitement pendant les heures de production.

Votre formulaire principal est le modele 06 (Journal quotidien des pompes a tambour et a sable) ou vous enregistrez les heures de fonctionnement des pompes, les resultats des controles de pression et les volumes de boue traites en metres cubes.

Votre tableau de bord KPI suit les metriques de production, y compris les heures de fonctionnement des pompes, les controles de pression effectues et la boue traitee en metres cubes.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 28,
  },
  {
    id: "rg-029",
    category: "role_guide",
    titleEN: `Driller Sampling Crew Role Guide`,
    titleFR: `Guide du role Equipe de forage et echantillonnage`,
    bodyEN: `The Driller Sampling Crew collects geological samples through drilling operations to evaluate ore body characteristics. This role reports to the Mining Geology Lead and provides the raw sample data that informs mine planning and extraction strategies.

Your primary form is Template 05 (Mining and Geology Daily Sheet) where you record the number of samples collected and hours of drilling operations completed during each shift. Accurate sample documentation is essential for reliable geological analysis.

Your KPI dashboard tracks geology metrics including samples collected and hours operated. A target of 15 samples per shift with 8 hours of drilling ensures adequate coverage of the exploration area for ore grade assessment.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Follow drilling plans set by the Mining Geology Lead and handle all samples according to established chain-of-custody procedures.`,
    bodyFR: `L'equipe de forage et echantillonnage collecte des echantillons geologiques par des operations de forage pour evaluer les caracteristiques du gisement. Ce role releve du responsable geologie miniere et fournit les donnees brutes d'echantillons qui guident la planification miniere.

Votre formulaire principal est le modele 05 (Feuille quotidienne de geologie miniere) ou vous enregistrez le nombre d'echantillons collectes et les heures d'operations de forage effectuees pendant chaque quart.

Votre tableau de bord KPI suit les metriques geologiques, y compris les echantillons collectes et les heures de fonctionnement. Un objectif de 15 echantillons par quart avec 8 heures de forage assure une couverture adequate.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["MINING_GEOLOGY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 29,
  },
  {
    id: "rg-030",
    category: "role_guide",
    titleEN: `Accountant Role Guide`,
    titleFR: `Guide du role Comptable`,
    bodyEN: `The Accountant manages financial record-keeping, invoice verification, and budget tracking for the site. This role reports to the Finance Manager and ensures that all financial transactions are accurately recorded and reconciled against approved budgets.

You work with three templates. Template 12 (Stores, Purchases and Expense Sheet) records purchase transactions and stock movements. Template 14 (Petty Cash Daily Report) tracks daily cash transactions. You can also read Template 04 (Fuel Consumption and Distribution Report) to verify fuel-related expenditures against financial records.

Your KPI dashboard tracks finance metrics including invoices verified, purchase orders processed, and budget variance percentage. Keeping budget variance within 5 percent of approved allocations is a key performance target.

You have data export privileges for generating financial reports and analyses. You can view and input your own KPIs through the dashboard. You do not have user management or report verification capabilities. Work with the Finance Manager on monthly reconciliations and the Procurement Officer on purchase order documentation.`,
    bodyFR: `Le comptable gere la tenue des registres financiers, la verification des factures et le suivi budgetaire du site. Ce role releve du responsable financier et veille a ce que toutes les transactions financieres soient enregistrees avec precision.

Vous travaillez avec trois modeles. Le modele 12 (Feuille de magasin, achats et depenses) enregistre les transactions d'achat et les mouvements de stock. Le modele 14 (Rapport quotidien de petite caisse) suit les transactions de tresorerie quotidiennes. Vous pouvez egalement lire le modele 04 (Rapport de consommation et distribution de carburant).

Votre tableau de bord KPI suit les metriques financieres, y compris les factures verifiees, les bons de commande traites et le pourcentage d'ecart budgetaire.

Vous disposez de privileges d'exportation de donnees pour generer des rapports financiers. Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs ou de verification des rapports.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "history"],
    sortOrder: 30,
  },
  {
    id: "rg-031",
    category: "role_guide",
    titleEN: `Procurement Officer Role Guide`,
    titleFR: `Guide du role Responsable des achats`,
    bodyEN: `The Procurement Officer manages purchasing activities, supplier relationships, and cost optimisation for site operations. This role reports to the Finance Manager and ensures that materials and supplies are procured efficiently and at competitive prices.

Your primary form is Template 12 (Stores, Purchases and Expense Sheet) where you record purchase orders, supplier details, and delivery receipts. Accurate documentation of procurement activities is essential for financial audit compliance and inventory management.

Your KPI dashboard tracks finance metrics including procurement requests processed, suppliers managed, and cost savings achieved in dollars. Identifying cost savings while maintaining supply quality is a key performance objective.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Finance Manager for purchase approvals and with department managers to prioritise procurement requests based on operational needs.`,
    bodyFR: `Le responsable des achats gere les activites d'achat, les relations avec les fournisseurs et l'optimisation des couts pour les operations du site. Ce role releve du responsable financier et veille a ce que les materiaux et les fournitures soient acquis de maniere efficace et a des prix competitifs.

Votre formulaire principal est le modele 12 (Feuille de magasin, achats et depenses) ou vous enregistrez les bons de commande, les coordonnees des fournisseurs et les receptions de livraison.

Votre tableau de bord KPI suit les metriques financieres, y compris les demandes d'achat traitees, les fournisseurs geres et les economies realisees en dollars.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "history"],
    sortOrder: 31,
  },
  {
    id: "rg-032",
    category: "role_guide",
    titleEN: `Assay Lab Technician Role Guide`,
    titleFR: `Guide du role Technicien de laboratoire d'essai`,
    bodyEN: `The Assay Lab Technician performs laboratory analyses on geological samples and gold concentrates to determine mineral grades and purity. This role reports to the Plant Manager and provides the analytical data that validates recovery efficiency and ore quality.

Your primary form is Template 09 (Gold Recovery and Assay Report) where you record assays completed, samples tested, and analytical reports prepared. Precision and accuracy in laboratory work are paramount for reliable grade determinations.

Your KPI dashboard tracks quality metrics including assays completed, samples tested, and reports prepared. A target of 8 assays and 12 samples per shift ensures timely analytical turnaround for production decisions.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Maintain strict laboratory protocols and ensure all samples follow the chain-of-custody procedure from collection to analysis.`,
    bodyFR: `Le technicien de laboratoire d'essai effectue des analyses de laboratoire sur les echantillons geologiques et les concentres d'or pour determiner les teneurs en mineraux et la purete. Ce role releve du responsable usine et fournit les donnees analytiques qui valident l'efficacite de la recuperation.

Votre formulaire principal est le modele 09 (Rapport de recuperation d'or et d'essai) ou vous enregistrez les essais termines, les echantillons testes et les rapports analytiques prepares.

Votre tableau de bord KPI suit les metriques de qualite, y compris les essais termines, les echantillons testes et les rapports prepares.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 32,
  },
  {
    id: "rg-033",
    category: "role_guide",
    titleEN: `Community Relations Officer Role Guide`,
    titleFR: `Guide du role Responsable des relations communautaires`,
    bodyEN: `The Community Relations Officer manages relationships with local communities surrounding the mining site. This role reports to the HR Manager and ensures that community concerns are addressed, engagement activities are conducted, and the company maintains its social licence to operate.

Your primary form is Template 02 (Staff Attendance and Shift Roster) where you record community engagement activities and stakeholder interactions as part of the site personnel records. This documentation supports compliance with community engagement commitments.

Your KPI dashboard tracks administration metrics including community meetings held, grievances resolved, and engagement activities conducted. Prompt resolution of grievances and regular community meetings are essential for maintaining positive relations.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Site Controller and HR Manager to ensure community feedback is incorporated into site operational planning.`,
    bodyFR: `Le responsable des relations communautaires gere les relations avec les communautes locales entourant le site minier. Ce role releve du responsable RH et veille a ce que les preoccupations communautaires soient traitees et que les activites d'engagement soient menees.

Votre formulaire principal est le modele 02 (Presence du personnel et tableau des quarts) ou vous enregistrez les activites d'engagement communautaire et les interactions avec les parties prenantes dans le cadre des registres du personnel du site.

Votre tableau de bord KPI suit les metriques d'administration, y compris les reunions communautaires tenues, les reclamations resolues et les activites d'engagement menees.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "history"],
    sortOrder: 33,
  },
  {
    id: "rg-034",
    category: "role_guide",
    titleEN: `Admin Clerk Role Guide`,
    titleFR: `Guide du role Commis administratif`,
    bodyEN: `The Admin Clerk provides administrative support for site operations by managing documentation, records, and correspondence. This role reports to the HR Manager and ensures that all administrative processes run smoothly and records are kept up to date.

You work with two templates. Template 02 (Staff Attendance and Shift Roster) records personnel attendance and shift information. Template 12 (Stores, Purchases and Expense Sheet) tracks stores transactions and expense documentation that you help process.

Your KPI dashboard tracks administration metrics including documents processed, records updated, and correspondence handled. Timely processing of administrative documents ensures operational continuity across all departments.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Maintain organised filing systems and ensure all documents are accessible to authorised personnel when needed.`,
    bodyFR: `Le commis administratif fournit un soutien administratif pour les operations du site en gerant la documentation, les registres et la correspondance. Ce role releve du responsable RH et veille a ce que tous les processus administratifs fonctionnent bien.

Vous travaillez avec deux modeles. Le modele 02 (Presence du personnel et tableau des quarts) enregistre la presence du personnel et les informations sur les quarts. Le modele 12 (Feuille de magasin, achats et depenses) suit les transactions de magasin et la documentation des depenses.

Votre tableau de bord KPI suit les metriques d'administration, y compris les documents traites, les registres mis a jour et la correspondance traitee.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "history"],
    sortOrder: 34,
  },
  {
    id: "rg-035",
    category: "role_guide",
    titleEN: `Security Guard Role Guide`,
    titleFR: `Guide du role Agent de securite`,
    bodyEN: `The Security Guard patrols the site and monitors designated areas to prevent unauthorized access and ensure the safety of personnel and assets. This role reports to the Security Manager and works alongside Gate Security to maintain comprehensive site security coverage.

Your primary form is Template 11 (Gate, Search and Items Movement Register) where you record areas patrolled, access control checks performed, incidents reported, and patrol rounds completed during your shift.

Your KPI dashboard tracks security metrics including areas patrolled, access control checks conducted, incidents reported, and patrol rounds completed. A target of 6 patrol rounds and 15 access control checks per shift ensures thorough site coverage.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Report all suspicious activity and security incidents to the Security Manager immediately and maintain a visible security presence at all times.`,
    bodyFR: `L'agent de securite patrouille sur le site et surveille les zones designees pour empecher les acces non autorises et assurer la securite du personnel et des actifs. Ce role releve du responsable securite et travaille aux cotes de la securite au portail.

Votre formulaire principal est le modele 11 (Registre de portail, fouille et mouvement d'articles) ou vous enregistrez les zones patrouillees, les controles d'acces effectues, les incidents signales et les rondes de patrouille accomplies pendant votre quart.

Votre tableau de bord KPI suit les metriques de securite, y compris les zones patrouillees, les controles d'acces effectues, les incidents signales et les rondes de patrouille accomplies.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["GATE_SECURITY"],
    relatedPages: ["form", "history"],
    sortOrder: 35,
  },
  {
    id: "rg-036",
    category: "role_guide",
    titleEN: `Medical Officer Role Guide`,
    titleFR: `Guide du role Officier medical`,
    bodyEN: `The Medical Officer provides on-site medical care, first aid, and health screening services for all site personnel. This role reports to the HR Manager and ensures that health standards are maintained and medical incidents are properly documented and treated.

Your primary form is Template 02 (Staff Attendance and Shift Roster) where you record medical consultations, first aid cases treated, and health screening results as part of the site personnel health records.

Your KPI dashboard tracks administration metrics including medical consultations conducted, first aid cases treated, and health screenings completed. Consistent health screening coverage and prompt response to medical incidents are your primary performance targets.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Safety Compliance Manager on occupational health matters and ensure the site medical facility is always stocked and operational.`,
    bodyFR: `L'officier medical fournit des soins medicaux sur le site, les premiers soins et des services de depistage sanitaire pour tout le personnel du site. Ce role releve du responsable RH et veille au maintien des normes de sante.

Votre formulaire principal est le modele 02 (Presence du personnel et tableau des quarts) ou vous enregistrez les consultations medicales, les cas de premiers soins traites et les resultats du depistage sanitaire.

Votre tableau de bord KPI suit les metriques d'administration, y compris les consultations medicales effectuees, les cas de premiers soins traites et les depistages sanitaires termines.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "history"],
    sortOrder: 36,
  },
  {
    id: "rg-037",
    category: "role_guide",
    titleEN: `Camp Manager Role Guide`,
    titleFR: `Guide du role Responsable de camp`,
    bodyEN: `The Camp Manager oversees the site camp facilities including accommodation, catering, and general welfare services for site personnel. This role reports to the HR Manager and ensures that living conditions on site meet the required standards for health and comfort.

You work with two templates. Template 02 (Staff Attendance and Shift Roster) records personnel occupancy and welfare-related attendance data. Template 12 (Stores, Purchases and Expense Sheet) tracks camp supplies, food purchases, and maintenance expenses for camp facilities.

Your KPI dashboard tracks administration metrics including meals served, accommodation checks completed, and facility inspections conducted. Consistent catering output and regular facility inspections ensure a safe and comfortable camp environment for all residents.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Procurement Officer for camp supply orders and with the HR Manager on personnel accommodation assignments.`,
    bodyFR: `Le responsable de camp supervise les installations du camp du site, y compris l'hebergement, la restauration et les services generaux de bien-etre pour le personnel du site. Ce role releve du responsable RH et veille a ce que les conditions de vie sur le site respectent les normes requises.

Vous travaillez avec deux modeles. Le modele 02 (Presence du personnel et tableau des quarts) enregistre l'occupation du personnel et les donnees de presence liees au bien-etre. Le modele 12 (Feuille de magasin, achats et depenses) suit les fournitures du camp, les achats alimentaires et les depenses d'entretien.

Votre tableau de bord KPI suit les metriques d'administration, y compris les repas servis, les controles d'hebergement termines et les inspections d'installations effectuees.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "history"],
    sortOrder: 37,
  },
  {
    id: "rg-038",
    category: "role_guide",
    titleEN: `Logistics Transport Coordinator Role Guide`,
    titleFR: `Guide du role Coordinateur logistique et transport`,
    bodyEN: `The Logistics Transport Coordinator manages the movement of materials, equipment, and personnel between the site and external locations. This role ensures that deliveries are scheduled efficiently, fleet vehicles are maintained, and transport documentation is complete.

You work with two templates. Template 04 (Fuel Consumption and Distribution Report) tracks fuel usage for transport vehicles and fleet operations. Template 12 (Stores, Purchases and Expense Sheet) records delivery receipts, transport expenses, and material movements for supply chain documentation.

Your KPI dashboard tracks logistics metrics including trips completed, deliveries coordinated, and fleet checks conducted. Meeting delivery schedules and completing all fleet checks ensures reliable supply chain operations for the site.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Fuel Admin Logistics on vehicle fuel allocations and with department managers on delivery priorities.`,
    bodyFR: `Le coordinateur logistique et transport gere le mouvement des materiaux, des equipements et du personnel entre le site et les emplacements externes. Ce role veille a ce que les livraisons soient planifiees efficacement et que la documentation de transport soit complete.

Vous travaillez avec deux modeles. Le modele 04 (Rapport de consommation et distribution de carburant) suit la consommation de carburant pour les vehicules de transport. Le modele 12 (Feuille de magasin, achats et depenses) enregistre les receptions de livraison, les depenses de transport et les mouvements de materiaux.

Votre tableau de bord KPI suit les metriques logistiques, y compris les trajets effectues, les livraisons coordonnees et les controles de flotte effectues.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "history"],
    sortOrder: 38,
  },
  {
    id: "rg-039",
    category: "role_guide",
    titleEN: `Heavy Equipment Mechanic Role Guide`,
    titleFR: `Guide du role Mecanicien d'equipement lourd`,
    bodyEN: `The Heavy Equipment Mechanic specialises in maintaining and repairing large mining equipment such as excavators, loaders, and haul trucks. This role reports to the Workshop Manager and is critical for keeping high-value production equipment operational.

Your primary form is Template 10 (Maintenance, Greasing and Washing Log) where you record repairs completed, parts used, and machine uptime achieved. You can also read Template 03 (Excavator / Machine Daily Log) to review equipment performance and identify maintenance needs from operator reports.

Your KPI dashboard tracks maintenance metrics including repairs completed, parts used, and machine uptime percentage. A target uptime of 88 percent reflects the demanding conditions of heavy equipment operation in alluvial mining environments.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Workshop Manager on repair prioritisation and with the Procurement Officer on spare parts orders.`,
    bodyFR: `Le mecanicien d'equipement lourd est specialise dans l'entretien et la reparation des grands equipements miniers tels que les excavatrices, les chargeuses et les camions de transport. Ce role releve du responsable atelier et est essentiel pour maintenir les equipements de production operationnels.

Votre formulaire principal est le modele 10 (Journal d'entretien, graissage et lavage) ou vous enregistrez les reparations effectuees, les pieces utilisees et la disponibilite des machines atteinte. Vous pouvez egalement lire le modele 03 (Journal quotidien d'excavatrice / machine).

Votre tableau de bord KPI suit les metriques d'entretien, y compris les reparations effectuees, les pieces utilisees et le pourcentage de disponibilite des machines.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["ENGINE_MECHANIC"],
    relatedPages: ["form", "history"],
    sortOrder: 39,
  },
  {
    id: "rg-040",
    category: "role_guide",
    titleEN: `Auto Electrician Role Guide`,
    titleFR: `Guide du role Auto-electricien`,
    bodyEN: `The Auto Electrician maintains and repairs electrical systems on vehicles and mobile equipment across the site. This role reports to the Workshop Manager and ensures that all vehicle electrical components, wiring, and control systems are functioning correctly.

Your primary form is Template 10 (Maintenance, Greasing and Washing Log) where you record electrical repairs performed, motors serviced, and cable repairs completed. You can also read Template 03 (Excavator / Machine Daily Log) to review equipment electrical fault reports from operators.

Your KPI dashboard tracks maintenance metrics including electrical repairs completed, motors serviced, and cable repairs performed. Consistent completion of electrical maintenance tasks prevents vehicle breakdowns and supports overall fleet availability.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with other mechanics in the workshop team and report any recurring electrical faults to the Workshop Manager for investigation.`,
    bodyFR: `L'auto-electricien entretient et repare les systemes electriques des vehicules et des equipements mobiles sur le site. Ce role releve du responsable atelier et veille a ce que tous les composants electriques des vehicules fonctionnent correctement.

Votre formulaire principal est le modele 10 (Journal d'entretien, graissage et lavage) ou vous enregistrez les reparations electriques effectuees, les moteurs revises et les reparations de cables terminees. Vous pouvez egalement lire le modele 03 (Journal quotidien d'excavatrice / machine).

Votre tableau de bord KPI suit les metriques d'entretien, y compris les reparations electriques effectuees, les moteurs revises et les reparations de cables realisees.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["ELECTRICAL_MECHANIC"],
    relatedPages: ["form", "history"],
    sortOrder: 40,
  },
  {
    id: "rg-041",
    category: "role_guide",
    titleEN: `Welder Fabricator Role Guide`,
    titleFR: `Guide du role Soudeur-fabricant`,
    bodyEN: `The Welder Fabricator performs welding, cutting, and metal fabrication work to repair and construct equipment components on site. This role reports to the Workshop Manager and provides essential fabrication support for maintenance and repair operations across all departments.

Your primary form is Template 10 (Maintenance, Greasing and Washing Log) where you record welding jobs completed, repairs performed, and parts fabricated or consumed during your shift.

Your KPI dashboard tracks maintenance metrics including welding jobs completed, repairs completed, and parts used. Meeting daily welding targets ensures that equipment repairs and fabrication requests are fulfilled without delays to production.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Follow all welding safety protocols and coordinate with the Workshop Manager on job prioritisation and material requirements.`,
    bodyFR: `Le soudeur-fabricant effectue des travaux de soudage, de decoupe et de fabrication metallique pour reparer et construire des composants d'equipement sur le site. Ce role releve du responsable atelier et fournit un soutien essentiel en fabrication pour les operations d'entretien et de reparation.

Votre formulaire principal est le modele 10 (Journal d'entretien, graissage et lavage) ou vous enregistrez les travaux de soudage termines, les reparations effectuees et les pieces fabriquees ou consommees pendant votre quart.

Votre tableau de bord KPI suit les metriques d'entretien, y compris les travaux de soudage termines, les reparations effectuees et les pieces utilisees.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["ENGINE_MECHANIC"],
    relatedPages: ["form", "history"],
    sortOrder: 41,
  },
  {
    id: "rg-042",
    category: "role_guide",
    titleEN: `Light Vehicle Mechanic Role Guide`,
    titleFR: `Guide du role Mecanicien de vehicules legers`,
    bodyEN: `The Light Vehicle Mechanic maintains and repairs light vehicles including pickup trucks, utility vehicles, and passenger cars used for site transport and logistics. This role reports to the Workshop Manager and ensures that the light vehicle fleet remains safe and available for daily operations.

Your primary form is Template 10 (Maintenance, Greasing and Washing Log) where you record vehicles serviced, repairs completed, and parts used. You can also read Template 03 (Excavator / Machine Daily Log) to review vehicle usage patterns and identify vehicles requiring attention.

Your KPI dashboard tracks maintenance metrics including vehicles serviced, repairs completed, and parts used. A target of 3 vehicles serviced per shift with minimal parts consumption reflects efficient and proactive vehicle maintenance.

You can view and input your own KPIs through the dashboard. You do not have user management, data export, or report verification privileges. Coordinate with the Logistics Transport Coordinator on vehicle availability and with the Procurement Officer on spare parts requirements.`,
    bodyFR: `Le mecanicien de vehicules legers entretient et repare les vehicules legers, y compris les camionnettes, les vehicules utilitaires et les voitures de tourisme utilises pour le transport et la logistique du site. Ce role releve du responsable atelier et veille a ce que la flotte de vehicules legers reste sure et disponible.

Votre formulaire principal est le modele 10 (Journal d'entretien, graissage et lavage) ou vous enregistrez les vehicules revises, les reparations effectuees et les pieces utilisees. Vous pouvez egalement lire le modele 03 (Journal quotidien d'excavatrice / machine).

Votre tableau de bord KPI suit les metriques d'entretien, y compris les vehicules revises, les reparations effectuees et les pieces utilisees.

Vous pouvez consulter et saisir vos propres KPI via le tableau de bord. Vous ne disposez pas de privileges de gestion des utilisateurs, d'exportation de donnees ou de verification des rapports.`,
    relatedRoles: ["ENGINE_MECHANIC"],
    relatedPages: ["form", "history"],
    sortOrder: 42,
  },
  {
    id: "kpi-001",
    category: "kpi_definition",
    titleEN: `What Are KPIs`,
    titleFR: `Que sont les KPI`,
    bodyEN: `Key Performance Indicators (KPIs) are measurable values that demonstrate how effectively the site is achieving its operational objectives. In the Alluvial Site Manager, KPIs are automatically calculated from the daily report data you submit.

KPIs are organized by department and role. Production KPIs track extraction volumes and recovery rates. Safety KPIs monitor incident frequency and compliance. Financial KPIs track spending against budgets.

Each KPI has a target value set by management. The system compares actual performance against these targets and highlights variances that require attention.

Understanding your KPIs helps you focus on the metrics that matter most for your role and contribute to overall site performance.`,
    bodyFR: `Les indicateurs cles de performance (KPI) sont des valeurs mesurables qui demontrent l'efficacite avec laquelle le site atteint ses objectifs operationnels. Dans le gestionnaire de site Alluvial, les KPI sont automatiquement calcules a partir des donnees de rapport quotidiennes.

Les KPI sont organises par departement et role. Les KPI de production suivent les volumes d'extraction et les taux de recuperation.

Chaque KPI a une valeur cible definie par la direction. Le systeme compare la performance reelle par rapport a ces objectifs.

Comprendre vos KPI vous aide a vous concentrer sur les metriques les plus importantes pour votre role.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["kpiInput", "kpiDashboard", "teamDashboard"],
    sortOrder: 1,
  },
  {
    id: "kpi-002",
    category: "kpi_definition",
    titleEN: `Entering Daily KPIs`,
    titleFR: `Saisie des KPI quotidiens`,
    bodyEN: `Daily KPI values are captured through the standard report templates. When you fill out your daily form, the relevant KPI fields are automatically identified and tracked.

Ensure you enter accurate values in all KPI-related fields. The system will validate your inputs against expected ranges and alert you if values appear unusual.

Some KPIs are calculated automatically from other fields. For example, recovery rate is calculated from input material and output material quantities.

Your KPI data is immediately reflected in the dashboard after you submit your report. This enables real-time monitoring of site performance.`,
    bodyFR: `Les valeurs KPI quotidiennes sont capturees via les modeles de rapport standard. Lorsque vous remplissez votre formulaire quotidien, les champs KPI pertinents sont automatiquement identifies et suivis.

Assurez-vous d'entrer des valeurs precises dans tous les champs lies aux KPI. Le systeme validera vos saisies par rapport aux plages attendues.

Certains KPI sont calcules automatiquement a partir d'autres champs. Par exemple, le taux de recuperation est calcule a partir des quantites de materiaux d'entree et de sortie.

Vos donnees KPI sont immediatement refletees dans le tableau de bord apres la soumission de votre rapport.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history", "kpiInput", "kpiDashboard"],
    sortOrder: 2,
  },
  {
    id: "kpi-003",
    category: "kpi_definition",
    titleEN: `KPI Targets and Thresholds`,
    titleFR: `Objectifs et seuils des KPI`,
    bodyEN: `Each KPI has configurable target values and warning thresholds. When actual performance deviates from targets, the system generates variance alerts to notify relevant managers.

Targets are set by the Site Controller or Mine Manager and can be adjusted based on seasonal conditions, equipment availability, or management directives.

Three threshold levels exist: green (on target), amber (minor variance), and red (significant variance). The dashboard color-codes KPIs based on these thresholds.

Review your KPI targets regularly and discuss any concerns with your manager. Targets should be challenging but achievable based on current operating conditions.`,
    bodyFR: `Chaque KPI a des valeurs cibles configurables et des seuils d'alerte. Lorsque la performance reelle s'ecarte des objectifs, le systeme genere des alertes de variance.

Les objectifs sont definis par le controleur de site ou le directeur de mine et peuvent etre ajustes en fonction des conditions saisonnieres.

Trois niveaux de seuil existent: vert (dans la cible), orange (variance mineure) et rouge (variance significative). Le tableau de bord code les KPI par couleur.

Examinez regulierement vos objectifs KPI et discutez de toute preoccupation avec votre responsable.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY"],
    relatedPages: ["kpiInput", "kpiDashboard", "teamDashboard", "settings"],
    sortOrder: 3,
  },
  {
    id: "kpi-004",
    category: "kpi_definition",
    titleEN: `Dashboard KPI Overview`,
    titleFR: `Vue d'ensemble des KPI du tableau de bord`,
    bodyEN: `The KPI dashboard provides a consolidated view of all key metrics for your role. Access it from the main dashboard by selecting the KPI Overview section.

The overview displays KPIs as cards with current values, trend indicators, and target comparisons. Click any KPI card to see detailed historical data and trend charts.

Filters allow you to view KPIs by time period (daily, weekly, monthly), department, or specific metric category. Export options let you download KPI data for external analysis.

The dashboard refreshes automatically as new reports are submitted throughout the day.`,
    bodyFR: `Le tableau de bord KPI fournit une vue consolidee de toutes les metriques cles pour votre role. Accedez-y depuis le tableau de bord principal en selectionnant la section Vue d'ensemble des KPI.

La vue d'ensemble affiche les KPI sous forme de cartes avec les valeurs actuelles, les indicateurs de tendance et les comparaisons d'objectifs.

Les filtres vous permettent de visualiser les KPI par periode de temps, departement ou categorie de metrique specifique.

Le tableau de bord se rafraichit automatiquement a mesure que de nouveaux rapports sont soumis.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY"],
    relatedPages: ["kpiInput", "kpiDashboard", "teamDashboard"],
    sortOrder: 4,
  },
  {
    id: "kpi-005",
    category: "kpi_definition",
    titleEN: `Team KPI Dashboards`,
    titleFR: `Tableaux de bord KPI d'equipe`,
    bodyEN: `Managers can view aggregated KPI data for their entire team. The team dashboard shows individual performance alongside team averages and targets.

Use the team view to identify top performers and team members who may need additional support or training. Individual KPI trends help you have productive performance conversations.

Team dashboards respect role-based access controls. You can only view KPIs for users within your management scope.

Export team KPI reports for inclusion in weekly management meetings or performance reviews.`,
    bodyFR: `Les responsables peuvent visualiser les donnees KPI agregees pour l'ensemble de leur equipe. Le tableau de bord d'equipe montre la performance individuelle avec les moyennes et objectifs d'equipe.

Utilisez la vue d'equipe pour identifier les meilleurs performeurs et les membres de l'equipe qui pourraient avoir besoin de support supplementaire.

Les tableaux de bord d'equipe respectent les controles d'acces bases sur les roles. Vous ne pouvez voir que les KPI des utilisateurs dans votre perimetre de gestion.

Exportez les rapports KPI d'equipe pour inclusion dans les reunions de direction hebdomadaires.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY"],
    relatedPages: ["kpiInput", "kpiDashboard", "teamDashboard"],
    sortOrder: 5,
  },
  {
    id: "kpi-006",
    category: "kpi_definition",
    titleEN: `Production KPIs`,
    titleFR: `KPI de production`,
    bodyEN: `Production KPIs measure the core output metrics of mining operations. Key indicators include daily material extracted (cubic meters), material processed (tonnes), and gold recovered (grams).

Production efficiency is calculated as the ratio of productive hours to total available hours. Equipment utilization tracks the percentage of time each machine is actively working.

Variance alerts trigger when daily production falls below the minimum threshold or when there is a significant deviation from the rolling average.

Production KPI data feeds into the Site Daily Summary (Template 01) and Mining and Geology Daily Sheet (Template 05).`,
    bodyFR: `Les KPI de production mesurent les metriques de production principales des operations minieres. Les indicateurs cles incluent les materiaux extraits quotidiennement, les materiaux traites et l'or recupere.

L'efficacite de production est calculee comme le ratio des heures productives par rapport aux heures totales disponibles.

Les alertes de variance se declenchent lorsque la production quotidienne tombe en dessous du seuil minimum.

Les donnees KPI de production alimentent le Resume quotidien du site (modele 01) et la Feuille quotidienne de geologie miniere (modele 05).`,
    relatedRoles: ["SITE_CONTROLLER", "MINING_GEOLOGY_LEAD"],
    relatedPages: ["form", "kpiInput", "kpiDashboard", "teamDashboard"],
    sortOrder: 6,
  },
  {
    id: "kpi-007",
    category: "kpi_definition",
    titleEN: `Safety KPIs`,
    titleFR: `KPI de securite`,
    bodyEN: `Safety KPIs track incident frequency, near-miss reports, and compliance with safety protocols. The Lost Time Injury Frequency Rate (LTIFR) is the primary safety metric.

All incidents and near-misses should be recorded promptly in the relevant report templates. The system tracks trends over time to identify areas where safety improvements are needed.

Safety compliance KPIs monitor completion of pre-shift safety checks, equipment inspections, and mandatory training sessions.

A zero-incident target is maintained. Any safety incident triggers an automatic review workflow and notification to the Site Controller and HR Manager.`,
    bodyFR: `Les KPI de securite suivent la frequence des incidents, les rapports de quasi-accidents et la conformite aux protocoles de securite. Le taux de frequence des blessures avec perte de temps (LTIFR) est la metrique de securite principale.

Tous les incidents et quasi-accidents doivent etre enregistres rapidement dans les modeles de rapport pertinents.

Les KPI de conformite securitaire surveillent l'achevement des controles de securite avant le quart, les inspections d'equipements et les sessions de formation obligatoires.

Un objectif zero incident est maintenu. Tout incident de securite declenche un flux de travail de revue automatique.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["kpiInput", "kpiDashboard", "teamDashboard"],
    sortOrder: 7,
  },
  {
    id: "kpi-008",
    category: "kpi_definition",
    titleEN: `Maintenance KPIs`,
    titleFR: `KPI de maintenance`,
    bodyEN: `Maintenance KPIs track equipment reliability, maintenance schedule adherence, and repair turnaround times. The Mean Time Between Failures (MTBF) is a key indicator of equipment health.

Planned maintenance completion rate measures the percentage of scheduled maintenance tasks completed on time. A target of 95% or higher is recommended.

Unplanned downtime is tracked as a percentage of total available hours. High unplanned downtime indicates equipment reliability issues that need to be addressed.

Maintenance KPI data comes from Template 10 (Maintenance, Greasing and Washing Log) and equipment-specific daily logs.`,
    bodyFR: `Les KPI de maintenance suivent la fiabilite des equipements, le respect du calendrier d'entretien et les delais de reparation. Le temps moyen entre les pannes (MTBF) est un indicateur cle de la sante des equipements.

Le taux d'achevement de l'entretien planifie mesure le pourcentage de taches d'entretien programmees completees a temps. Un objectif de 95% ou plus est recommande.

Le temps d'arret non planifie est suivi en pourcentage des heures totales disponibles.

Les donnees KPI de maintenance proviennent du modele 10 (Journal d'entretien, graissage et lavage).`,
    relatedRoles: ["SITE_CONTROLLER", "ENGINE_MECHANIC"],
    relatedPages: ["form", "kpiInput", "kpiDashboard", "teamDashboard"],
    sortOrder: 8,
  },
  {
    id: "kpi-009",
    category: "kpi_definition",
    titleEN: `Finance KPIs`,
    titleFR: `KPI financiers`,
    bodyEN: `Finance KPIs monitor cost efficiency, budget adherence, and expenditure patterns. The cost per gram of gold recovered is the primary financial efficiency metric.

Daily expenditure tracking compares actual spending against budgeted amounts. The system categorizes expenses into operational, maintenance, personnel, and administrative categories.

Variance alerts trigger when daily spending exceeds budgeted thresholds or when unusual transaction patterns are detected.

Finance KPI data is sourced from Template 12 (Stores, Purchases and Expense Sheet) and Template 14 (Petty Cash Daily Report).`,
    bodyFR: `Les KPI financiers surveillent l'efficacite des couts, le respect du budget et les tendances de depenses. Le cout par gramme d'or recupere est la metrique d'efficacite financiere principale.

Le suivi des depenses quotidiennes compare les depenses reelles aux montants budgetes. Le systeme categorise les depenses en operationnelles, maintenance, personnel et administratives.

Les alertes de variance se declenchent lorsque les depenses quotidiennes depassent les seuils budgetes.

Les donnees KPI financieres proviennent du modele 12 et du modele 14.`,
    relatedRoles: ["SITE_CONTROLLER", "FUEL_ADMIN_LOGISTICS"],
    relatedPages: ["form", "kpiInput", "kpiDashboard", "teamDashboard"],
    sortOrder: 9,
  },
  {
    id: "kpi-010",
    category: "kpi_definition",
    titleEN: `Role-Specific KPI Profiles`,
    titleFR: `Profils KPI specifiques aux roles`,
    bodyEN: `Each role in the system has a customized KPI profile that shows only the metrics relevant to that position. This ensures you focus on the indicators that matter most for your responsibilities.

The Site Controller sees all KPIs across the site. Department managers see their department KPIs plus cross-functional metrics that affect their operations.

Operational roles see the specific KPIs they directly influence through their daily work. This targeted view helps maintain focus and accountability.

KPI profiles can be customized by the Site Controller through the Site Settings page. Additional metrics can be added or removed based on operational needs.`,
    bodyFR: `Chaque role dans le systeme a un profil KPI personnalise qui affiche uniquement les metriques pertinentes pour ce poste. Cela vous assure de vous concentrer sur les indicateurs les plus importants pour vos responsabilites.

Le controleur de site voit tous les KPI sur le site. Les responsables de departement voient leurs KPI departementaux plus les metriques transversales.

Les roles operationnels voient les KPI specifiques qu'ils influencent directement par leur travail quotidien.

Les profils KPI peuvent etre personnalises par le controleur de site via la page Parametres du site.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["kpiInput", "kpiDashboard", "teamDashboard", "settings"],
    sortOrder: 10,
  },
  {
    id: "rpt-001",
    category: "reports",
    titleEN: `T01: Site Daily Summary`,
    titleFR: `T01: Resume quotidien du site`,
    bodyEN: `Template 01 is the master daily report that consolidates key data from all departments. It captures overall production figures, staffing levels, safety incidents, and operational highlights.

The Site Controller and Mine Manager are the primary users of this template. It provides a single-page overview of the entire day's operations.

Key sections include production volumes, equipment status, weather conditions, visitor log, and management notes. All numeric fields support variance detection against historical averages.

This template should be completed at the end of each operational day. It serves as the official record of daily site performance.`,
    bodyFR: `Le modele 01 est le rapport quotidien principal qui consolide les donnees cles de tous les departements. Il capture les chiffres de production globaux, les niveaux de personnel, les incidents de securite et les faits saillants operationnels.

Le controleur de site et le directeur de mine sont les principaux utilisateurs de ce modele. Il fournit une vue d'ensemble d'une page des operations de toute la journee.

Les sections cles incluent les volumes de production, l'etat des equipements, les conditions meteorologiques, le journal des visiteurs et les notes de gestion.

Ce modele doit etre complete a la fin de chaque journee operationnelle.`,
    relatedRoles: ["SITE_CONTROLLER"],
    relatedPages: ["form", "history"],
    sortOrder: 1,
  },
  {
    id: "rpt-002",
    category: "reports",
    titleEN: `T02: Staff Attendance and Shift Roster`,
    titleFR: `T02: Presence du personnel et liste des quarts`,
    bodyEN: `Template 02 records daily staff attendance, shift assignments, and leave tracking. It provides a comprehensive view of workforce deployment across the site.

The HR Manager is the primary user of this template. Record each staff member's attendance status: present, absent, on leave, or on training.

Shift assignments are recorded with start and end times. The system validates that minimum staffing levels are maintained for each shift and department.

Overtime hours must be recorded and justified. The template feeds into payroll calculations and labor compliance reporting.`,
    bodyFR: `Le modele 02 enregistre la presence quotidienne du personnel, les affectations de quarts et le suivi des conges. Il fournit une vue complete du deploiement de la main-d'oeuvre sur le site.

Le responsable RH est le principal utilisateur de ce modele. Enregistrez le statut de presence de chaque membre du personnel: present, absent, en conge ou en formation.

Les affectations de quarts sont enregistrees avec les heures de debut et de fin. Le systeme valide que les niveaux minimaux de dotation sont maintenus.

Les heures supplementaires doivent etre enregistrees et justifiees.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS", "SITE_CONTROLLER"],
    relatedPages: ["form", "history"],
    sortOrder: 2,
  },
  {
    id: "rpt-003",
    category: "reports",
    titleEN: `T03: Excavator / Machine Daily Log`,
    titleFR: `T03: Journal quotidien d'excavatrice / machine`,
    bodyEN: `Template 03 captures detailed daily operational data for each excavator and heavy machine on site. One log should be completed per machine per shift.

Key fields include engine start/stop times, fuel consumed, material moved (cubic meters), and any mechanical issues encountered during operation.

The pre-operation checklist must be completed before starting work. This checklist covers safety items, fluid levels, and visual inspections.

Machine performance data from this template feeds into production KPIs and maintenance scheduling. The Workshop Manager reviews these logs for maintenance planning.`,
    bodyFR: `Le modele 03 capture les donnees operationnelles quotidiennes detaillees pour chaque excavatrice et engin lourd sur le site. Un journal doit etre complete par machine par quart.

Les champs cles incluent les heures de demarrage/arret du moteur, le carburant consomme, les materiaux deplaces et tout probleme mecanique rencontre.

La liste de controle de pre-operation doit etre completee avant de commencer le travail. Cette liste couvre les elements de securite, les niveaux de fluides et les inspections visuelles.

Les donnees de performance de la machine alimentent les KPI de production et la planification de l'entretien.`,
    relatedRoles: ["MINING_GEOLOGY_LEAD", "SITE_CONTROLLER", "ENGINE_MECHANIC"],
    relatedPages: ["form", "history"],
    sortOrder: 3,
  },
  {
    id: "rpt-004",
    category: "reports",
    titleEN: `T04: Fuel Issue and Reconciliation`,
    titleFR: `T04: Distribution et reconciliation de carburant`,
    bodyEN: `Template 04 tracks all fuel issuance, consumption, and inventory reconciliation. It ensures accurate accounting of fuel usage across all equipment and vehicles.

Record each fuel issue with the recipient equipment or vehicle, quantity issued, meter reading, and authorizing supervisor. The system validates fuel consumption against expected rates.

Daily reconciliation compares opening stock, fuel received, fuel issued, and closing stock. Any variance triggers an alert for investigation.

This template implements Separation of Duties controls requiring different users to record fuel issues and perform reconciliation.`,
    bodyFR: `Le modele 04 suit toute la distribution, la consommation et la reconciliation d'inventaire de carburant. Il assure une comptabilite precise de l'utilisation du carburant.

Enregistrez chaque distribution de carburant avec l'equipement ou vehicule destinataire, la quantite distribuee, la lecture du compteur et le superviseur autorisant.

La reconciliation quotidienne compare le stock d'ouverture, le carburant recu, le carburant distribue et le stock de fermeture. Tout ecart declenche une alerte pour enquete.

Ce modele implemente des controles de separation des taches necessitant differents utilisateurs pour enregistrer les distributions et effectuer la reconciliation.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS", "SITE_CONTROLLER"],
    relatedPages: ["form", "history"],
    sortOrder: 4,
  },
  {
    id: "rpt-005",
    category: "reports",
    titleEN: `T05: Mining and Geology Daily Sheet`,
    titleFR: `T05: Feuille quotidienne de geologie miniere`,
    bodyEN: `Template 05 captures geological survey data, pit progression, and material classification. It provides critical data for mine planning and resource estimation.

Record the working face location, geological formation observed, material classification (overburden, gravel, bedrock), and sample results.

Pit depth measurements, water table observations, and ground conditions are tracked to support mining method decisions.

This template is used by the Mining Geology Lead and reviewed by the Mine Manager. Data feeds into long-term mine planning models.`,
    bodyFR: `Le modele 05 capture les donnees d'arpentage geologique, la progression des fosses et la classification des materiaux. Il fournit des donnees critiques pour la planification miniere et l'estimation des ressources.

Enregistrez l'emplacement du front de travail, la formation geologique observee, la classification des materiaux et les resultats des echantillons.

Les mesures de profondeur de fosse, les observations de la nappe phreatique et les conditions du sol sont suivies pour soutenir les decisions de methode d'exploitation.

Ce modele est utilise par le responsable geologie miniere et examine par le directeur de mine.`,
    relatedRoles: ["MINING_GEOLOGY_LEAD", "SITE_CONTROLLER"],
    relatedPages: ["form", "history"],
    sortOrder: 5,
  },
  {
    id: "rpt-006",
    category: "reports",
    titleEN: `T06-T08: Processing Templates`,
    titleFR: `T06-T08: Modeles de traitement`,
    bodyEN: `Templates 06 through 08 cover the processing pipeline: T06 (Drum and Sand Pump Shift Log), T07 (Centrifuge Operation and Cleanup Log), and T08 (Shaking Table Operation Log).

T06 records pump operating hours, material throughput, and water usage. T07 captures centrifuge cycle times, concentrate weights, and cleanup procedures. T08 logs shaking table feed rates and concentrate recovery.

Each template includes quality control checkpoints and equipment condition assessments. Data flows sequentially from upstream to downstream processes.

The Plant Manager oversees all three templates. Processing operators submit their respective forms, and data is cross-referenced to ensure material balance consistency.`,
    bodyFR: `Les modeles 06 a 08 couvrent le pipeline de traitement: T06 (Journal de quart de pompe a tambour et a sable), T07 (Journal d'operation et de nettoyage de centrifugeuse) et T08 (Journal d'operation de table vibrante).

T06 enregistre les heures de fonctionnement des pompes, le debit de materiaux et l'utilisation d'eau. T07 capture les temps de cycle de centrifugeuse et les poids de concentre. T08 enregistre les taux d'alimentation de la table vibrante.

Chaque modele inclut des points de controle de qualite et des evaluations de l'etat des equipements.

Le responsable usine supervise les trois modeles. Les operateurs de traitement soumettent leurs formulaires respectifs.`,
    relatedRoles: ["PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 6,
  },
  {
    id: "rpt-007",
    category: "reports",
    titleEN: `T09: Gold Recovery and Handover Register`,
    titleFR: `T09: Registre de recuperation et de remise d'or`,
    bodyEN: `Template 09 is the most security-sensitive template. It records all gold recovery activities, weighing, and chain-of-custody handover procedures.

Every gold recovery event must be witnessed and co-signed. The template enforces dual-signature requirements with Separation of Duties controls.

Record the source process, recovery weight (gross and net), purity estimate, and handover recipient. Photo documentation may be required depending on site policy.

This template has enhanced audit logging. Every access, edit, and submission is recorded with timestamps and user identification.`,
    bodyFR: `Le modele 09 est le modele le plus sensible en termes de securite. Il enregistre toutes les activites de recuperation d'or, de pesage et de procedures de remise de la chaine de garde.

Chaque evenement de recuperation d'or doit etre temoin et co-signe. Le modele impose des exigences de double signature avec des controles de separation des taches.

Enregistrez le processus source, le poids de recuperation (brut et net), l'estimation de purete et le destinataire de la remise.

Ce modele a une journalisation d'audit amelioree. Chaque acces, modification et soumission est enregistre avec des horodatages.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD"],
    relatedPages: ["form", "history"],
    sortOrder: 7,
  },
  {
    id: "rpt-008",
    category: "reports",
    titleEN: `T10: Maintenance, Greasing and Washing Log`,
    titleFR: `T10: Journal d'entretien, graissage et lavage`,
    bodyEN: `Template 10 records all daily maintenance activities including scheduled maintenance, greasing routines, and equipment washing. It provides the data foundation for maintenance KPIs.

For each maintenance task, record the equipment ID, task performed, parts used, time taken, and condition assessment. The system tracks maintenance history per equipment.

Greasing schedules are automatically generated based on equipment operating hours. The template highlights overdue greasing tasks.

Washing logs capture water usage and equipment cleaning procedures. This data supports environmental compliance reporting.`,
    bodyFR: `Le modele 10 enregistre toutes les activites d'entretien quotidiennes, y compris l'entretien programme, les routines de graissage et le lavage d'equipements.

Pour chaque tache d'entretien, enregistrez l'identifiant d'equipement, la tache effectuee, les pieces utilisees, le temps pris et l'evaluation de l'etat.

Les calendriers de graissage sont automatiquement generes en fonction des heures de fonctionnement des equipements. Le modele met en evidence les taches de graissage en retard.

Les journaux de lavage capturent l'utilisation d'eau et les procedures de nettoyage des equipements.`,
    relatedRoles: ["ENGINE_MECHANIC", "ELECTRICAL_MECHANIC"],
    relatedPages: ["form", "history"],
    sortOrder: 8,
  },
  {
    id: "rpt-009",
    category: "reports",
    titleEN: `T11: Gate, Search and Items Movement Register`,
    titleFR: `T11: Registre de portail, fouille et mouvement d'articles`,
    bodyEN: `Template 11 records all gate activities including personnel entry/exit, vehicle movements, searches conducted, and items brought in or removed from site.

Gate security personnel must log every entry and exit with timestamp, person/vehicle identification, purpose of visit, and search results.

Items movement tracking ensures accountability for materials, equipment, and personal belongings entering or leaving the site. High-value items require supervisor authorization.

The Security Manager reviews daily gate logs for anomalies. The system can flag unusual patterns such as after-hours access or frequent unscheduled entries.`,
    bodyFR: `Le modele 11 enregistre toutes les activites du portail, y compris les entrees/sorties du personnel, les mouvements de vehicules, les fouilles effectuees et les articles apportes ou retires du site.

Le personnel de securite du portail doit enregistrer chaque entree et sortie avec horodatage, identification de la personne/vehicule, but de la visite et resultats de fouille.

Le suivi des mouvements d'articles assure la responsabilite des materiaux, equipements et effets personnels entrant ou sortant du site.

Le responsable securite examine les journaux quotidiens du portail pour les anomalies.`,
    relatedRoles: ["GATE_SECURITY", "SITE_CONTROLLER"],
    relatedPages: ["form", "history"],
    sortOrder: 9,
  },
  {
    id: "rpt-010",
    category: "reports",
    titleEN: `T12-T14: Stores, Purchases and Cash Reports`,
    titleFR: `T12-T14: Rapports de magasins, achats et tresorerie`,
    bodyEN: `Templates 12 through 14 cover financial operations: T12 (Stores, Purchases and Expense Sheet), T13 (Shift Handover Certificate), and T14 (Petty Cash Daily Report).

T12 records all procurement activities, store issues, and expense claims. Each transaction requires supporting documentation references. T13 documents the formal handover between shifts.

T14 tracks petty cash transactions with opening balance, disbursements, receipts, and closing balance. Daily reconciliation is mandatory.

These templates implement strict Separation of Duties controls. The person recording transactions must be different from the person approving them.`,
    bodyFR: `Les modeles 12 a 14 couvrent les operations financieres: T12 (Feuille de magasins, achats et depenses), T13 (Certificat de remise de quart) et T14 (Rapport quotidien de caisse).

T12 enregistre toutes les activites d'approvisionnement, les sorties de magasin et les demandes de depenses. Chaque transaction necessite des references de documentation.

T14 suit les transactions de petite caisse avec le solde d'ouverture, les decaissements, les recus et le solde de fermeture. La reconciliation quotidienne est obligatoire.

Ces modeles implementent des controles stricts de separation des taches.`,
    relatedRoles: ["FUEL_ADMIN_LOGISTICS", "SITE_CONTROLLER"],
    relatedPages: ["form", "history"],
    sortOrder: 10,
  },
  {
    id: "ts-001",
    category: "troubleshooting",
    titleEN: `Report Won't Submit`,
    titleFR: `Le rapport ne se soumet pas`,
    bodyEN: `If your report fails to submit, first check that all required fields are completed. Required fields are marked with an asterisk and will show validation errors in red.

Ensure that all numeric values are within acceptable ranges. The system prevents submission of data that falls outside configured thresholds without explicit override.

Check your internet connection. If you are offline, the report will be queued for later submission. You will see a confirmation that the report has been queued.

If the problem persists, try refreshing the page and re-entering the data. Contact your Site Controller if you continue to experience issues.`,
    bodyFR: `Si votre rapport ne parvient pas a se soumettre, verifiez d'abord que tous les champs obligatoires sont remplis. Les champs obligatoires sont marques d'un asterisque et afficheront des erreurs de validation en rouge.

Assurez-vous que toutes les valeurs numeriques sont dans des plages acceptables. Le systeme empeche la soumission de donnees hors des seuils configures.

Verifiez votre connexion Internet. Si vous etes hors ligne, le rapport sera mis en file d'attente pour soumission ulterieure.

Si le probleme persiste, essayez de rafraichir la page et de re-saisir les donnees. Contactez votre controleur de site.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 1,
  },
  {
    id: "ts-002",
    category: "troubleshooting",
    titleEN: `Offline Queue Issues`,
    titleFR: `Problemes de file d'attente hors ligne`,
    bodyEN: `If queued reports are not synchronizing when connectivity is restored, try the following steps.

First, verify that your internet connection is stable. The system requires a consistent connection to upload queued reports.

Check the offline queue in Report History. If reports show a FAILED status, they may need to be resubmitted. Open the failed report, verify the data, and submit again.

If the queue appears stuck, try closing and reopening your browser. This will trigger a fresh synchronization attempt. Contact your Site Controller if issues persist.`,
    bodyFR: `Si les rapports en file d'attente ne se synchronisent pas lorsque la connectivite est retablie, essayez les etapes suivantes.

Premierement, verifiez que votre connexion Internet est stable. Le systeme necessite une connexion constante pour telecharger les rapports en file d'attente.

Verifiez la file d'attente hors ligne dans l'historique des rapports. Si les rapports affichent un statut ECHOUE, ils devront peut-etre etre re-soumis.

Si la file d'attente semble bloquee, essayez de fermer et rouvrir votre navigateur. Contactez votre controleur de site si les problemes persistent.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 2,
  },
  {
    id: "ts-003",
    category: "troubleshooting",
    titleEN: `Digital Signature Problems`,
    titleFR: `Problemes de signature numerique`,
    bodyEN: `If the signature pad is not responding, ensure you are using a compatible browser. The signature feature works best with Chrome, Firefox, or Edge on desktop, and Safari on iOS.

On touchscreen devices, ensure the touch calibration is accurate. Try cleaning the screen and drawing the signature with deliberate, slow movements.

If the signature appears distorted or does not save, try clearing your browser cache and reloading the page.

For persistent signature issues, you can request a temporary waiver from your Site Controller to submit without a signature while the issue is being resolved.`,
    bodyFR: `Si le pavillon de signature ne repond pas, assurez-vous d'utiliser un navigateur compatible. La fonctionnalite de signature fonctionne mieux avec Chrome, Firefox ou Edge sur ordinateur, et Safari sur iOS.

Sur les appareils a ecran tactile, assurez-vous que le calibrage tactile est precis. Essayez de nettoyer l'ecran et de dessiner la signature avec des mouvements deliberes.

Si la signature apparait deformee ou ne s'enregistre pas, essayez de vider le cache de votre navigateur et de recharger la page.

Pour les problemes de signature persistants, vous pouvez demander une derogation temporaire a votre controleur de site.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 3,
  },
  {
    id: "ts-004",
    category: "troubleshooting",
    titleEN: `Separation of Duties Violation`,
    titleFR: `Violation de separation des taches`,
    bodyEN: `A Separation of Duties (SoD) violation occurs when the same user attempts to perform actions that require different people for audit and control purposes.

Common SoD violations include: recording and approving the same financial transaction, issuing and reconciling fuel in the same session, or recovering and certifying gold handover as the same person.

If you receive an SoD violation alert, you must have a different authorized user complete the conflicting action. The system will not allow you to override SoD controls.

Contact your Site Controller if you believe the SoD configuration is incorrect or if staffing constraints make compliance difficult.`,
    bodyFR: `Une violation de separation des taches (SoD) se produit lorsque le meme utilisateur tente d'effectuer des actions qui necessitent des personnes differentes a des fins d'audit et de controle.

Les violations SoD courantes incluent: enregistrer et approuver la meme transaction financiere, distribuer et reconcilier le carburant dans la meme session.

Si vous recevez une alerte de violation SoD, vous devez faire completer l'action conflictuelle par un autre utilisateur autorise. Le systeme ne vous permettra pas de contourner les controles SoD.

Contactez votre controleur de site si vous pensez que la configuration SoD est incorrecte.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 4,
  },
  {
    id: "ts-005",
    category: "troubleshooting",
    titleEN: `Understanding Variance Alerts`,
    titleFR: `Comprendre les alertes de variance`,
    bodyEN: `Variance alerts appear when entered values differ significantly from expected ranges or historical averages. They are designed to catch data entry errors and highlight genuine operational anomalies.

Warning alerts (amber) indicate minor variances that may be acceptable but should be reviewed. Error alerts (red) indicate significant variances that require explanation before submission.

To resolve a variance alert, verify the entered value is correct. If the value is accurate despite the variance, add a note explaining the reason for the deviation.

Variance thresholds are configured by the Site Controller. If alerts are triggering too frequently on normal values, request a threshold adjustment through Site Settings.`,
    bodyFR: `Les alertes de variance apparaissent lorsque les valeurs saisies different significativement des plages attendues ou des moyennes historiques. Elles sont concues pour detecter les erreurs de saisie et mettre en evidence les anomalies operationnelles.

Les alertes d'avertissement (orange) indiquent des variances mineures qui peuvent etre acceptables mais doivent etre examinees. Les alertes d'erreur (rouge) indiquent des variances significatives.

Pour resoudre une alerte de variance, verifiez que la valeur saisie est correcte. Si la valeur est precise malgre la variance, ajoutez une note expliquant la raison de la deviation.

Les seuils de variance sont configures par le controleur de site.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 5,
  },
  {
    id: "ts-006",
    category: "troubleshooting",
    titleEN: `Fields Not Loading or Displaying`,
    titleFR: `Les champs ne se chargent pas ou ne s'affichent pas`,
    bodyEN: `If form fields are not loading or displaying correctly, first try refreshing the page using Ctrl+R (or Cmd+R on Mac).

Clear your browser cache and cookies for the site. Cached data from a previous version may conflict with the current form structure.

Ensure your browser is up to date. The application requires a modern browser with JavaScript enabled.

If specific fields are missing, your role may not have permission to view those fields. Contact your Site Controller to verify your role assignment and field-level access.`,
    bodyFR: `Si les champs du formulaire ne se chargent pas ou ne s'affichent pas correctement, essayez d'abord de rafraichir la page en utilisant Ctrl+R.

Effacez le cache et les cookies de votre navigateur pour le site. Les donnees en cache d'une version precedente peuvent entrer en conflit avec la structure actuelle du formulaire.

Assurez-vous que votre navigateur est a jour. L'application necessite un navigateur moderne avec JavaScript active.

Si des champs specifiques manquent, votre role peut ne pas avoir la permission de voir ces champs. Contactez votre controleur de site.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 6,
  },
  {
    id: "ts-007",
    category: "troubleshooting",
    titleEN: `Login Problems`,
    titleFR: `Problemes de connexion`,
    bodyEN: `If you cannot log in, first verify that you are entering the correct email address and password. Passwords are case-sensitive.

After five failed login attempts, your account will be temporarily locked for 30 minutes. Wait for the lockout period to expire before trying again.

If you have forgotten your password, use the Forgot Password link on the login page. Check your email inbox and spam folder for the reset link.

If you are a new user and have not received your credentials, contact your HR Manager or Site Controller who can provision your account.`,
    bodyFR: `Si vous ne pouvez pas vous connecter, verifiez d'abord que vous entrez la bonne adresse e-mail et le bon mot de passe. Les mots de passe sont sensibles a la casse.

Apres cinq tentatives de connexion echouees, votre compte sera temporairement verrouille pendant 30 minutes. Attendez que la periode de verrouillage expire.

Si vous avez oublie votre mot de passe, utilisez le lien Mot de passe oublie sur la page de connexion. Verifiez votre boite de reception et le dossier spam.

Si vous etes un nouvel utilisateur et n'avez pas recu vos identifiants, contactez votre responsable RH ou controleur de site.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["form", "profile"],
    sortOrder: 7,
  },
  {
    id: "ts-008",
    category: "troubleshooting",
    titleEN: `Password Reset Not Working`,
    titleFR: `La reinitialisation du mot de passe ne fonctionne pas`,
    bodyEN: `If the password reset email does not arrive, check your spam or junk folder. The email is sent from a system address that may be flagged by email filters.

Ensure you are using the same email address that was registered for your account. Try the reset process again with the correct email.

Reset links expire after 24 hours. If your link has expired, request a new one from the login page.

If you continue to have problems, your Site Controller or system administrator can manually reset your password from the User Management panel.`,
    bodyFR: `Si l'e-mail de reinitialisation du mot de passe n'arrive pas, verifiez votre dossier spam ou courrier indesirable. L'e-mail est envoye depuis une adresse systeme qui peut etre signallee par les filtres de messagerie.

Assurez-vous d'utiliser la meme adresse e-mail enregistree pour votre compte. Reessayez le processus de reinitialisation avec la bonne adresse.

Les liens de reinitialisation expirent apres 24 heures. Si votre lien a expire, demandez-en un nouveau depuis la page de connexion.

Si les problemes persistent, votre controleur de site ou administrateur systeme peut reinitialiser manuellement votre mot de passe.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["form", "settings", "profile"],
    sortOrder: 8,
  },
  {
    id: "ts-009",
    category: "troubleshooting",
    titleEN: `Data Not Syncing Between Devices`,
    titleFR: `Les donnees ne se synchronisent pas entre les appareils`,
    bodyEN: `The Alluvial Site Manager stores data centrally, but some data is cached locally for offline access. If you see different data on different devices, this may be a synchronization delay.

Ensure both devices have an active internet connection. Refresh the page on each device to trigger a fresh data load from the server.

Draft reports are stored locally and do not sync between devices. Only submitted reports are available across all devices.

If submitted reports are not appearing on another device, verify that you are logged in with the same account and that both devices are connected to the same organization.`,
    bodyFR: `Le gestionnaire de site Alluvial stocke les donnees de maniere centralisee, mais certaines donnees sont mises en cache localement pour l'acces hors ligne. Si vous voyez des donnees differentes sur differents appareils, cela peut etre un delai de synchronisation.

Assurez-vous que les deux appareils ont une connexion Internet active. Rafraichissez la page sur chaque appareil pour declencher un chargement frais des donnees.

Les rapports brouillons sont stockes localement et ne se synchronisent pas entre les appareils. Seuls les rapports soumis sont disponibles sur tous les appareils.

Si les rapports soumis n'apparaissent pas sur un autre appareil, verifiez que vous etes connecte avec le meme compte.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER"],
    relatedPages: ["form", "history"],
    sortOrder: 9,
  },
  {
    id: "ts-010",
    category: "troubleshooting",
    titleEN: `Contacting Support`,
    titleFR: `Contacter le support`,
    bodyEN: `For issues that cannot be resolved using this help system, follow the escalation path below.

Level 1: Contact your direct supervisor or department manager. They can help with operational questions and basic troubleshooting.

Level 2: Contact your Site Controller. They have access to administrative tools, user management, and can resolve most configuration issues.

Level 3: For system-level issues, data corruption, or security incidents, the Site Controller will escalate to the system administrator. Include screenshots, error messages, and steps to reproduce the issue when reporting problems.`,
    bodyFR: `Pour les problemes qui ne peuvent pas etre resolus en utilisant ce systeme d'aide, suivez le chemin d'escalade ci-dessous.

Niveau 1: Contactez votre superviseur direct ou responsable de departement. Ils peuvent aider avec les questions operationnelles et le depannage de base.

Niveau 2: Contactez votre controleur de site. Il a acces aux outils administratifs, a la gestion des utilisateurs et peut resoudre la plupart des problemes de configuration.

Niveau 3: Pour les problemes au niveau du systeme, la corruption de donnees ou les incidents de securite, le controleur de site escalade a l'administrateur systeme.`,
    relatedRoles: ["SITE_CONTROLLER", "PROCESSING_RECOVERY_LEAD", "ENGINE_MECHANIC", "FUEL_ADMIN_LOGISTICS", "GATE_SECURITY", "MINING_GEOLOGY_LEAD", "GREASING_WASHING_HELPER", "SYSTEM_ADMIN"],
    relatedPages: ["form", "help"],
    sortOrder: 10,
  },
];
