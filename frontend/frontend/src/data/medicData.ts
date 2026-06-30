// Single source of truth for Medic_RDV data

export const IMAGES = {
  heroRoom: 'https://d64gsuwffb70l.cloudfront.net/6a3fca94fc844166732572a7_1782565635292_02c653f9.png',
  robotSurgery: 'https://d64gsuwffb70l.cloudfront.net/6a3fca94fc844166732572a7_1782565707704_edb3b734.png',
  robot404: 'https://d64gsuwffb70l.cloudfront.net/6a3fca94fc844166732572a7_1782565728846_6de4223a.jpg',
  doctorMale1: 'https://d64gsuwffb70l.cloudfront.net/6a3fca94fc844166732572a7_1782565652808_5f370bb1.jpg',
  doctorMale2: 'https://d64gsuwffb70l.cloudfront.net/6a3fca94fc844166732572a7_1782565652900_caf4bdf3.jpg',
  doctorMale3: 'https://d64gsuwffb70l.cloudfront.net/6a3fca94fc844166732572a7_1782565657998_80b3fd15.png',
  doctorFemale1: 'https://d64gsuwffb70l.cloudfront.net/6a3fca94fc844166732572a7_1782565683075_9b7ebcb0.jpg',
  doctorFemale2: 'https://d64gsuwffb70l.cloudfront.net/6a3fca94fc844166732572a7_1782565684328_e144cd43.jpg',
  doctorFemale3: 'https://d64gsuwffb70l.cloudfront.net/6a3fca94fc844166732572a7_1782565688661_75134975.png',
};

export interface Service {
  title: string;
  description: string;
  color: string;
  bg: string;
}

export const SERVICES: Service[] = [
  {
    title: 'Dossier Digital',
    description: "Accédez à votre historique médical complet, vos ordonnances et résultats d'examens en un seul endroit sécurisé.",
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    title: 'Spécialistes',
    description: 'Consultez des experts reconnus dans plus de 30 spécialités médicales, du cardiologue au pédiatre.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    title: 'Rappels Intelligents',
    description: "Ne manquez plus jamais un rendez-vous ou une prise de médicament grâce à notre système d'alertes personnalisées.",
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    title: 'Urgences 24/7',
    description: "Un service d'assistance disponible à tout moment pour vous orienter vers les structures d'urgence les plus proches.",
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
];

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  address: string;
  price: string;
  sector: string;
  badge: string;
  badgeColor: string;
  img: string;
}

export const DOCTORS: Doctor[] = [
  { id: 1, name: 'Dr. Jean Dupont', specialty: 'Dermatologue', rating: 4.9, reviews: 128, address: '12 Rue de la Paix, Paris 75002', price: '65€', sector: 'Secteur 2', badge: 'Disponible demain', badgeColor: 'bg-green-100 text-green-700', img: IMAGES.doctorMale1 },
  { id: 2, name: 'Dr. Lucie Martin', specialty: 'Pédiatre', rating: 5.0, reviews: 42, address: '45 Avenue Victor Hugo, Lyon 69002', price: '30€', sector: 'Secteur 1', badge: 'Nouveau', badgeColor: 'bg-orange-100 text-orange-700', img: IMAGES.doctorFemale1 },
  { id: 3, name: 'Dr. Marc Leroy', specialty: 'Cardiologue', rating: 4.8, reviews: 215, address: '8 Place Bellecour, Lyon 69002', price: '80€', sector: 'Secteur 2', badge: 'Vidéo disponible', badgeColor: 'bg-blue-100 text-blue-700', img: IMAGES.doctorMale2 },
  { id: 4, name: 'Dr. Sophie Bernard', specialty: 'Généraliste', rating: 4.7, reviews: 98, address: '3 Rue Nationale, Marseille 13001', price: '25€', sector: 'Secteur 1', badge: 'Disponible aujourd\'hui', badgeColor: 'bg-green-100 text-green-700', img: IMAGES.doctorFemale2 },
  { id: 5, name: 'Dr. Ahmed Ben', specialty: 'Radiologue', rating: 4.6, reviews: 56, address: '17 Cours Mirabeau, Aix 13100', price: '70€', sector: 'Secteur 2', badge: 'Vidéo disponible', badgeColor: 'bg-blue-100 text-blue-700', img: IMAGES.doctorMale3 },
  { id: 6, name: 'Dr. Claire Dubois', specialty: 'Gynécologue', rating: 4.9, reviews: 174, address: '22 Rue de Rivoli, Paris 75004', price: '55€', sector: 'Secteur 1', badge: 'Disponible demain', badgeColor: 'bg-green-100 text-green-700', img: IMAGES.doctorFemale3 },
];

export interface Appointment {
  id: number;
  date: string;
  month: string;
  day: string;
  title: string;
  doctor: string;
  time: string;
  status: 'Confirmé' | 'En attente';
}

export const PATIENT_APPOINTMENTS: Appointment[] = [
  { id: 1, date: '24', month: 'OCT', day: '24', title: 'Consultation Cardiologie', doctor: 'Dr. Jean Dupont', time: '09:30 - 10:15', status: 'Confirmé' },
  { id: 2, date: '02', month: 'NOV', day: '02', title: 'Examen Dentaire Routine', doctor: 'Dr. Sophie Martin', time: '14:00 - 14:45', status: 'En attente' },
];

export interface AgendaItem {
  time: string;
  duration: string;
  patient: string;
  reason: string;
  active?: boolean;
}

export const DOCTOR_AGENDA: AgendaItem[] = [
  { time: '09:00', duration: '30M', patient: 'Jean Dupont', reason: 'Consultation Générale' },
  { time: '10:30', duration: '45M', patient: 'Sophie Germain', reason: 'Suivi Post-Op' },
  { time: '14:30', duration: '1H', patient: 'Marie Curie', reason: 'Examen Annuel', active: true },
  { time: '16:00', duration: '30M', patient: 'Marc Bloch', reason: 'Renouvellement' },
];

export interface SystemAlert {
  title: string;
  desc: string;
  time: string;
  level: 'critical' | 'warning' | 'info';
}

export const SYSTEM_ALERTS: SystemAlert[] = [
  { title: 'Latency Spike', desc: "L'API de facturation répond avec un délai de 2.4s.", time: '2 mins ago', level: 'critical' },
  { title: 'Storage Warning', desc: "Le serveur de stockage d'images est rempli à 85%.", time: '1 hour ago', level: 'warning' },
  { title: 'Maintenance Check', desc: 'Sauvegarde automatique effectuée avec succès.', time: '4 hours ago', level: 'info' },
];

export interface RecentUser {
  name: string;
  email: string;
  type: 'MÉDECIN' | 'PATIENT';
  status: 'Vérifié' | 'En attente';
  date: string;
  img: string;
}

export const RECENT_USERS: RecentUser[] = [
  { name: 'Dr. Jean Dupont', email: 'jean.dupont@medicrdv.com', type: 'MÉDECIN', status: 'Vérifié', date: '24 Oct, 2023', img: IMAGES.doctorMale1 },
  { name: 'Sophie Martin', email: 's.martin@email.fr', type: 'PATIENT', status: 'Vérifié', date: '23 Oct, 2023', img: IMAGES.doctorFemale1 },
  { name: 'Dr. Luc Bernard', email: 'l.bernard@clinic.pro', type: 'MÉDECIN', status: 'En attente', date: '22 Oct, 2023', img: IMAGES.doctorMale2 },
];

export interface Consultation {
  title: string;
  who: string;
  date: string;
}

export const CONSULTATIONS: Consultation[] = [
  { title: 'Examen de routine', who: 'Dr. Jean Morel • Clinique du Parc', date: '12 Oct 2023' },
  { title: 'Analyse de sang', who: 'Laboratoire Bio-Center', date: '05 Sep 2023' },
  { title: 'Radiographie Thoracique', who: 'Dr. Ahmed Ben • Centre Imagerie', date: '14 Aoû 2023' },
];

export const MEDICAL_DOCS = [
  { name: 'Ordonnance_Oct_2023.pdf', type: 'PDF', size: '1.2 MB' },
  { name: 'Radio_Thorax.jpg', type: 'JPG', size: '4.5 MB' },
  { name: 'Synthese_Labo.docx', type: 'DOCX', size: '500 KB' },
  { name: 'Certificat_Medical.pdf', type: 'PDF', size: '800 KB' },
];

export const TIME_SLOTS = {
  morning: ['08:00', '08:30', '09:00', '09:30', '10:00', '11:00'],
  afternoon: ['14:30', '15:00', '16:30', '17:00'],
};
