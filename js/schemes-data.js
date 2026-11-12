/**
 * VEER SETU 🇮🇳 - Scheme Dataset
 * Comprehensive compilation of Indian Army & Ministry of Defence Welfare Schemes
 * Covering Serving Personnel, Veterans (ESM), Veer Naris, and Dependents.
 */

const VEER_SETU_SCHEMES = [
  {
    id: "ksb-pmss",
    title: "Prime Minister's Scholarship Scheme (PMSS)",
    category: "education",
    targetAudience: ["veteran", "veernari", "dependent"],
    agency: "Kendriya Sainik Board (KSB), MoD",
    benefitAmount: "₹3,000/month (Girls) | ₹2,500/month (Boys)",
    badge: "Most Popular",
    shortDesc: "Financial assistance for higher technical and professional degree education for wards and widows of Ex-Servicemen and Ex-Coast Guard personnel.",
    overview: "Under the Raksha Mantri's Discretionary Fund (RMDF) administered by KSB, PMSS encourages higher professional and technical education (Engineering, Medicine, Dental, Veterinary, MBA, MCA, Pharmacy) for dependent children and widows of deceased or disabled defense personnel.",
    eligibility: [
      "Wards/widows of deceased/disabled Ex-Servicemen/Coast Guard personnel.",
      "Minimum 60% marks in Minimum Educational Qualification (MEQ) (Class 12th / Diploma / Graduation).",
      "Applicable for first professional degree courses recognized by regulatory bodies (AICTE, MCI, UGC).",
      "Not applicable for master degree courses except MBA and MCA."
    ],
    documentsRequired: [
      "Ex-Serviceman Discharge Book / PPO copy",
      "Serving / Dependent Certificate signed by Zila Sainik Board (ZSB)",
      "Class 10th & 12th Marksheets",
      "Bonafide Student Certificate from College / University",
      "Aadhaar Card and Active Bank Passbook copy"
    ],
    applicationProcess: "Apply online at the official KSB portal (ksb.gov.in) with uploaded scanned documents endorsed by Secretary, ZSB.",
    link: "https://ksb.gov.in"
  },
  {
    id: "echs-healthcare",
    title: "Ex-Servicemen Contributory Health Scheme (ECHS)",
    category: "healthcare",
    targetAudience: ["veteran", "veernari", "dependent"],
    agency: "Central Organisation ECHS, MoD",
    benefitAmount: "100% Cashless Comprehensive Medical Treatment",
    badge: "Lifeline Scheme",
    shortDesc: "Comprehensive, cashless healthcare network providing OPD, specialist consultations, surgeries, and medicines to military veterans and dependents.",
    overview: "ECHS provides comprehensive medical care to Ex-Servicemen pensioners and their authorized dependents through a nationwide network of ECHS Polyclinics, Service Hospitals, and empanelled private multi-specialty hospitals.",
    eligibility: [
      "Ex-Servicemen receiving defense pension or disability pension from MoD.",
      "Legally recognized spouses, dependent unmarried children below 26 years, and dependent parents (income criteria applicable).",
      "Veer Naris and War Widows are eligible with 100% contribution exemption."
    ],
    documentsRequired: [
      "Service Discharge Certificate and PPO Copy",
      "64-KB ECHS Smart Card",
      "Aadhaar cards of pensioner and dependents",
      "Recent passport-sized photographs in service attire/plain clothes",
      "Special disability certificate for permanently disabled children"
    ],
    applicationProcess: "Apply via echs.gov.in for the 64-KB Smart Card, verify through the parent Record Office, and collect the card from the Regional Station HQ.",
    link: "https://echs.gov.in"
  },
  {
    id: "agif-disability-grant",
    title: "Army Group Insurance Fund (AGIF) Benefits",
    category: "financial",
    targetAudience: ["serving", "veteran", "veernari"],
    agency: "Army Group Insurance Directorate (AGIF)",
    benefitAmount: "Up to ₹1 Crore Life Cover | ₹50 Lakh Disability Cover",
    badge: "Official Defense Fund",
    shortDesc: "Compulsory insurance and survival package providing life cover, disability compensation, and post-retirement medical benefit schemes.",
    overview: "Established by the Indian Army in 1976, AGIF provides group insurance coverage to all serving Army officers and Junior Commissioned Officers/Other Ranks (JCOs/ORs), along with disability benefits on invalided discharge and terminal survivor benefits.",
    eligibility: [
      "All active serving commissioned officers, JCOs, and Jawans of the Indian Army.",
      "Ex-Servicemen boarded out with disability attributable to or aggravated by military service.",
      "Next of Kin (NOK) in case of battle or physical casualties."
    ],
    documentsRequired: [
      "AGIF Membership Certificate / Service Book entry",
      "Medical Board proceedings (AFMSF-16) for disability cases",
      "Casualty Report (Part II Order)",
      "Cancelled Cheque of SBI Defense Salary Package (DSP) account"
    ],
    applicationProcess: "Routed automatically through parent Unit/Regimental Center to AGIF Directorate, Rao Tula Ram Marg, New Delhi.",
    link: "https://indianarmy.nic.in"
  },
  {
    id: "ksb-daughter-marriage",
    title: "Financial Assistance for Daughter's Marriage / Remarriage",
    category: "financial",
    targetAudience: ["veteran", "veernari"],
    agency: "Kendriya Sainik Board (RMDF)",
    benefitAmount: "₹50,000 per daughter (up to 2 daughters)",
    badge: "Welfare Grant",
    shortDesc: "One-time financial grant for the solemnization of marriage of eligible daughters of non-pensioner Ex-Servicemen and widows.",
    overview: "Provided under the Raksha Mantri Discretionary Fund, this scheme assists destitute widows and non-pensioner Ex-Servicemen up to the rank of Subedar/equivalent who are facing financial constraints in organizing their daughters' marriages.",
    eligibility: [
      "Non-pensioner ESM or widow up to the rank of Havildar/Subedar.",
      "Should be recommended by Zila Sainik Welfare Officer.",
      "Maximum two daughters per family.",
      "Daughter should have attained the legal marriage age of 18 years."
    ],
    documentsRequired: [
      "Discharge Book with family details endorsed",
      "Marriage Registration Certificate / Invitation Card & Sarpanch Certificate",
      "Income certificate verifying economic status",
      "Self-declaration certificate on non-receipt of similar grant"
    ],
    applicationProcess: "Submit application to Zila Sainik Board within 180 days of marriage solemnization.",
    link: "https://ksb.gov.in"
  },
  {
    id: "csd-afd-canteen",
    title: "CSD Smart Card & AFD Online Purchase Portal",
    category: "canteen",
    targetAudience: ["serving", "veteran", "veernari"],
    agency: "Canteen Stores Department (CSD), MoD",
    benefitAmount: "Subsidized GST (50% concession) on Vehicles, Electronics & Groceries",
    badge: "Subsidized Facility",
    shortDesc: "Subsidized procurement of groceries, electronics, two-wheelers, and four-wheelers through CSD and the dedicated AFD-I online portal.",
    overview: "CSD is among the largest retail chains globally, enabling Army personnel and veterans to purchase household items and Against Firm Demand (AFD-I) white goods like cars, motorcycles, and air conditioners at concessionary prices.",
    eligibility: [
      "Serving personnel across all ranks holding valid CSD Smart Card.",
      "Veterans with minimum qualifying service and pensioners.",
      "Veer Naris and registered dependents holding dependent CSD cards.",
      "Car purchasing limits based on rank brackets (e.g. up to 1400cc for JCOs/ORs, 2500cc for Officers)."
    ],
    documentsRequired: [
      "Active CSD Smart Card (Grocery & Liquor)",
      "PAN Card & Aadhaar Card",
      "Latest Pay Slip / PPO Copy",
      "Dealer Proforma Invoice & Bank Loan Sanction (for vehicles)"
    ],
    applicationProcess: "Register at afd.csdindia.gov.in, book token online, upload payment UTR details, and collect vehicle/item from authorized dealer.",
    link: "https://afd.csdindia.gov.in"
  },
  {
    id: "sparsh-pension",
    title: "SPARSH Defense Pension Management System",
    category: "pension",
    targetAudience: ["veteran", "veernari"],
    agency: "Principal Controller of Defence Accounts (PCDA) Pensions",
    benefitAmount: "Direct Monthly Pension, One Rank One Pension (OROP) & Gratuity",
    badge: "PCDA Portal",
    shortDesc: "Centralized web-based system for direct pension sanctions, digital life certificate submission (Jeevan Pramaan), and arrears settlement.",
    overview: "System for Pension Administration (Raksha) – SPARSH is an initiative of the Ministry of Defence to transform the administration of defense pensions into a seamless, direct-benefit-transfer web portal without bank intermediaries.",
    eligibility: [
      "All retiring and retired Indian Armed Forces personnel.",
      "Family pensioners, war injury pensioners, and gallantry award annuity recipients."
    ],
    documentsRequired: [
      "SPARSH 14-digit Account Number",
      "Digital Life Certificate (DLC) via biometric or Iris scanner",
      "Corrigendum PPO or Initial Pension Payment Order",
      "Registered Aadhaar-linked mobile number"
    ],
    applicationProcess: "Access sparsh.defencepension.gov.in using PRAN/username to monitor pension slips, track grievances, and submit annual life certificates.",
    link: "https://sparsh.defencepension.gov.in"
  },
  {
    id: "awho-housing",
    title: "Army Welfare Housing Organisation (AWHO)",
    category: "housing",
    targetAudience: ["serving", "veteran", "veernari"],
    agency: "Army Welfare Housing Organisation (AWHO)",
    benefitAmount: "No-Profit-No-Loss Modern Residential Flats & Plots Nationwide",
    badge: "Housing Scheme",
    shortDesc: "Providing custom-designed, high-quality, subsidized residential houses to Army personnel on a pure 'No Profit No Loss' basis across Indian cities.",
    overview: "Established under the Societies Registration Act, AWHO has delivered over 32,000 residential units across Delhi NCR, Pune, Bengaluru, Lucknow, Mohali, Jaipur, and Kochi specifically catering to the housing needs of soldiers.",
    eligibility: [
      "Priority 1: Widows of Army personnel who died in harness and battle casualties.",
      "Priority 2: Serving Army personnel and retired Ex-Servicemen who do not own an AWHO dwelling unit.",
      "Priority 3: Dependents and parents of deceased unmarried soldiers."
    ],
    documentsRequired: [
      "Army Service Number proof / Discharge Certificate",
      "Proof of no prior allotment under AWHO",
      "PAN Card & Aadhaar Card",
      "Bank payment authorization for application token amount"
    ],
    applicationProcess: "Apply online at awhosena.in when scheme bookings open for specified city sectors.",
    link: "https://awhosena.in"
  },
  {
    id: "veer-nari-welfare",
    title: "Directorate of Indian Army Veterans (DIAV) Veer Nari Cell",
    category: "family-support",
    targetAudience: ["veernari", "dependent"],
    agency: "Directorate of Indian Army Veterans (DIAV), Army HQ",
    benefitAmount: "Comprehensive Rehabilitation, Legal Aid, Employment & Pension Support",
    badge: "Dedicated Family Care",
    shortDesc: "Dedicated single-window support cell for War Widows (Veer Naris), battle casualties, and next-of-kin for holistic rehabilitation.",
    overview: "The Veer Nari Cell at DIAV acts as an empathetic bridge connecting bereaved military families with their legitimate entitlements, vocational training, higher education scholarships, emotional counseling, and grievance resolution.",
    eligibility: [
      "Widows of martyrs, battle casualties, and physical casualties in peace stations.",
      "Minor children and dependent parents of soldiers died in operational duties."
    ],
    documentsRequired: [
      "Battle / Physical Casualty Certificate",
      "Family Pension Payment Order (PPO)",
      "Dependent Identity Card issued by Records / Station HQ",
      "Aadhaar & Bank Details"
    ],
    applicationProcess: "Register directly with DIAV Veterans Portal (indianarmyveterans.gov.in) or call the dedicated toll-free helpline 1800-11-6644.",
    link: "https://indianarmyveterans.gov.in"
  },
  {
    id: "rmdf-medical-grant",
    title: "RMDF Serious Disease Financial Assistance",
    category: "healthcare",
    targetAudience: ["veteran", "veernari"],
    agency: "Kendriya Sainik Board (RMDF)",
    benefitAmount: "Up to ₹1,25,000 for Non-Pensioner ESM",
    badge: "Medical Relief",
    shortDesc: "Critical illness medical grant for expensive treatment of cancer, cardiac surgery, renal failure, and joint replacement for non-pensioner veterans.",
    overview: "Administered to provide urgent financial succor to non-pensioner ESM and their dependents not adequately covered under commercial policies or residing beyond regular access to military hospitals.",
    eligibility: [
      "Non-pensioner ESM of all ranks up to Havildar.",
      "Treatment underwent in approved Government / Military / Empanelled hospital.",
      "Application endorsed by Medical Superintendent."
    ],
    documentsRequired: [
      "Discharge book / Service records",
      "Original hospital bills and discharge summary",
      "Income Certificate from District Collector / Tehsildar",
      "Recommendation of Zila Sainik Board"
    ],
    applicationProcess: "Apply through ZSB to KSB within 180 days of hospital discharge.",
    link: "https://ksb.gov.in"
  },
  {
    id: "awes-education-quota",
    title: "Army Welfare Education Society (AWES) Quota & Grants",
    category: "education",
    targetAudience: ["serving", "veteran", "veernari", "dependent"],
    agency: "Army Welfare Education Society (AWES)",
    benefitAmount: "Priority Admission in Army Public Schools & 13 Professional Colleges",
    badge: "Premier Education",
    shortDesc: "Preferential admission and fee concessions in Army Public Schools (APS), Army Institute of Technology (AIT Pune), ACMS, and ACDS.",
    overview: "AWES manages 137 Army Public Schools and 12 premier higher education institutions (including Engineering, Medicine, Dental, Law, Hotel Management, Fashion Design) providing world-class education at subsidized fees to wards of Army personnel.",
    eligibility: [
      "Children of serving Army personnel.",
      "Children of Ex-Servicemen and deceased Army personnel.",
      "Children of Defence Civilians paid from Defence Estimates."
    ],
    documentsRequired: [
      "Serving Certificate / Discharge Certificate",
      "Birth certificate of ward with Part II Order endorsement",
      "Transfer Certificate from previous school/college",
      "National entrance examination scores (JEE, NEET, CLAT where applicable)"
    ],
    applicationProcess: "Apply through awesindia.com or specific college entrance portals (e.g., aitpune.com).",
    link: "https://awesindia.com"
  },
  {
    id: "children-education-allowance",
    title: "Children Education Allowance (CEA) & Hostel Subsidy",
    category: "education",
    targetAudience: ["serving"],
    agency: "Ministry of Defence / Department of Military Affairs",
    benefitAmount: "₹2,250/month (CEA) + ₹6,750/month (Hostel Subsidy)",
    badge: "Monthly Allowance",
    shortDesc: "Monthly allowance reimbursed to serving soldiers for tuition fees, uniforms, textbooks, and hostel lodging for up to two children.",
    overview: "Under the 7th Central Pay Commission recommendations, serving military personnel can claim CEA and hostel subsidy up to Class 12th to ensure their frequent postings and field tenures do not disrupt their children's quality schooling.",
    eligibility: [
      "All active serving military personnel with school-going children.",
      "Covers nursery/KG up to Class 12th standard.",
      "Applicable for first two surviving children (exceptions for multiple births)."
    ],
    documentsRequired: [
      "Head of Institution Bonafide Certificate / School Fee Receipt",
      "Part II Order verifying child's date of birth and lineage",
      "Contingent bill form submitted to Unit Orderly Room"
    ],
    applicationProcess: "Claim submitted annually through Unit Pay Account Office (PAO/CDA).",
    link: "https://indianarmy.nic.in"
  },
  {
    id: "gallantry-award-grants",
    title: "Gallantry & Distinguished Service Cash Awards",
    category: "financial",
    targetAudience: ["serving", "veteran", "veernari"],
    agency: "Ministry of Defence & State Governments",
    benefitAmount: "Cash grant up to ₹2 Crore (Param Vir Chakra) + Lifetime Annuity",
    badge: "Honor & Valor",
    shortDesc: "Monetary allowances, land allotment grants, and monthly tax-free pensions for recipients of wartime and peacetime gallantry decorations.",
    overview: "Recipients of Param Vir Chakra, Maha Vir Chakra, Vir Chakra, Ashok Chakra, Kirti Chakra, Shaurya Chakra, and Sena Medal receive lifetime central annuities, air/train travel passes, and substantial state-level cash rewards and agricultural plot allotments.",
    eligibility: [
      "Gallantry awardees or their Next of Kin (in posthumous decorations).",
      "Personnel holding gallantry citations from President of India."
    ],
    documentsRequired: [
      "Gazette of India Notification",
      "President's Medal Citation & Award Certificate",
      "Bank Passbook & Part II Order"
    ],
    applicationProcess: "Administered automatically by PCDA(P) Prayagraj and Department of Sainik Kalyan of the awardee's home state.",
    link: "https://gallantryawards.gov.in"
  }
];

// Quick statistics for the counter
const VEER_SETU_STATS = {
  totalSchemes: 48,
  personnelServed: "1.4M+",
  financialDisbursed: "₹180+ Cr",
  helplineSupport: "24/7 Active"
};

// Emergency Helplines
const EMERGENCY_HELPLINES = [
  { name: "Ex-Servicemen Welfare (KSB)", number: "011-26715250", toll: "Toll Free: 1904" },
  { name: "ECHS Central Toll Free", number: "1800-114-115", toll: "24x7 Medical Helpline" },
  { name: "DIAV Veer Nari Cell", number: "1800-11-6644", toll: "Toll Free Helpline" },
  { name: "SPARSH Pension Support", number: "1800-180-5325", toll: "Toll Free Support" },
  { name: "Army Welfare Education Society", number: "011-26151564", toll: "Delhi Cantt HQ" }
];

