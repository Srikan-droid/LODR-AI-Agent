export const initialDisclosures = [
  {
    id: 1,
    announcementTitle: 'Credit Rating Disclosure - Q3 FY2024',
    dateOfEvent: '2024-01-15',
    uploadedDate: '2024-01-15',
    regulations: ['Reg 30', 'Reg 46'],
    complianceScore: 85,
    complianceStatus: 'Compliant',
    fileStatus: 'Completed',
    fileName: 'credit_rating_q3_2024.pdf',
  },
  {
    id: 2,
    announcementTitle: 'Board Meeting Outcome - Annual Results',
    dateOfEvent: '2024-01-12',
    uploadedDate: '2024-01-12',
    regulations: ['Reg 46', 'Reg 55'],
    complianceScore: 35,
    complianceStatus: 'Non-Compliant',
    fileStatus: 'Completed',
    fileName: 'board_meeting_annual.pdf',
  },
  {
    id: 3,
    announcementTitle: 'Material Event - Change in Key Management',
    dateOfEvent: '2024-01-10',
    uploadedDate: '2024-01-10',
    regulations: ['Reg 33'],
    complianceScore: null,
    complianceStatus: 'Pending Review',
    fileStatus: 'Processing',
    fileName: 'material_event_management.docx',
  },
  {
    id: 4,
    announcementTitle: 'Related Party Transaction Disclosure',
    dateOfEvent: '2024-01-08',
    uploadedDate: '2024-01-08',
    regulations: ['Reg 45', 'Reg 55'],
    complianceScore: null,
    complianceStatus: 'Pending Review',
    fileStatus: 'Pending',
    fileName: 'related_party_transaction.docx',
  },
  {
    id: 5,
    announcementTitle: 'Annual Corporate Governance Report',
    dateOfEvent: '2023-12-31',
    uploadedDate: '2024-01-05',
    regulations: ['Reg 27'],
    complianceScore: 92,
    complianceStatus: 'Compliant',
    fileStatus: 'Completed',
    fileName: 'corporate_governance_report.pdf',
  },
  {
    id: 6,
    announcementTitle: 'Press Release - Acquisition Announcement',
    dateOfEvent: '2023-12-20',
    uploadedDate: '2024-01-02',
    regulations: ['Reg 30'],
    complianceScore: null,
    complianceStatus: 'Compliant',
    fileStatus: 'Error',
    fileName: 'acquisition_press_release.pdf',
  },
  {
    id: 7,
    announcementTitle: 'Investor Presentation Update',
    dateOfEvent: '2023-12-15',
    uploadedDate: '2023-12-28',
    regulations: ['Reg 30', 'Reg 46'],
    complianceScore: null,
    complianceStatus: 'Pending Review',
    fileStatus: 'Cancelled',
    fileName: 'investor_presentation_update.pdf',
  },
];

export const REGULATION_OPTIONS = [
  'Reg 23',
  'Reg 27',
  'Reg 30',
  'Reg 33',
  'Reg 34',
  'Reg 45',
  'Reg 46',
  'Reg 52',
  'Reg 55',
];

export const formatDisplayDate = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

