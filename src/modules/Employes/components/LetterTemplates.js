export const LETTER_CATEGORIES = {
    HIRING: "Hiring / Recruitment",
    VISA: "Visa / Legal",
    ONBOARDING: "Onboarding",
    STATUS: "Employment Status",
    PROBATION: "Probation & Confirmation",
    PAYROLL: "Payroll & Compensation",
    LEAVE: "Leave-Related",
    PERFORMANCE: "Performance & Promotion",
    DISCIPLINARY: "Disciplinary & Warning",
    TERMINATION: "Termination & Exit"
};

export const LETTER_TEMPLATES = {
    [LETTER_CATEGORIES.HIRING]: [
        {
            id: 'job_offer',
            title: 'Job Offer Letter',
            content: `Date: {date}\n\nDear {name},\n\nWe are pleased to offer you the position of {role} at our company. Your starting salary will be {salary} per month.\n\nWe look forward to having you on our team.\n\nSincerely,\nHR Manager`
        },
        {
            id: 'appt_letter',
            title: 'Appointment Letter',
            content: `Date: {date}\n\nRef: {id}\n\nDear {name},\n\nFurther to your acceptance of our offer, we officially appoint you as {role} effective from {joining_date}.\n\nWelcome aboard!`
        }
    ],
    [LETTER_CATEGORIES.VISA]: [
        {
            id: 'iqama_request',
            title: 'Iqama Request Letter',
            content: `To: The Ministry of Labor\n\nSubject: Issuance of Iqama for {name}\n\nWe request the issuance of a residency permit (Iqama) for our employee {name}, holding passport number {passport}.\n\nThank you for your cooperation.`
        },
        {
            id: 'salary_cert_bank',
            title: 'Salary Certificate (Bank)',
            content: `Date: {date}\n\nTo: The Bank Manager\n\nThis is to certify that {name}, holding ID {iqama}, is employed with us as {role}. His/her total monthly salary is {salary}.\n\nThis certificate is issued at the employee's request without any liability on the company.`
        }
    ],
    [LETTER_CATEGORIES.STATUS]: [
        {
            id: 'employment_verification',
            title: 'Employment Verification',
            content: `To Whom It May Concern,\n\nThis asserts that {name} is currently employed with us as {role} since {joining_date}.`
        },
        {
            id: 'noc',
            title: 'No Objection Certificate (NOC)',
            content: `Date: {date}\n\nTo Whom It May Concern,\n\nWe have no objection to {name} (ID: {iqama}) traveling/applying for a vehicle/etc. as per local regulations.\n\nHe/she is an active employee in good standing.`
        }
    ],
    [LETTER_CATEGORIES.PROBATION]: [
        {
            id: 'probation_conf',
            title: 'Probation Confirmation',
            content: `Dear {name},\n\nWe are pleased to confirm that you have successfully completed your probation period as of {date}. Your employment is now confirmed.`
        }
    ],
    [LETTER_CATEGORIES.PAYROLL]: [
        {
            id: 'salary_increment',
            title: 'Salary Increment Letter',
            content: `Dear {name},\n\nIn recognition of your performance, we are pleased to increase your salary to {salary} effective immediately.`
        }
    ],
    [LETTER_CATEGORIES.LEAVE]: [
        {
            id: 'leave_approval',
            title: 'Leave Approval Letter',
            content: `Dear {name},\n\nYour leave request has been approved.`
        }
    ],
    [LETTER_CATEGORIES.PERFORMANCE]: [
        {
            id: 'promotion',
            title: 'Promotion Letter',
            content: `Dear {name},\n\nCongratulations! You have been promoted to Senior {role}.`
        }
    ],
    [LETTER_CATEGORIES.DISCIPLINARY]: [
        {
            id: 'warning_1',
            title: 'First Warning Letter',
            content: `Strictly Confidential\n\nDear {name},\n\nThis is a formal warning regarding your recent conduct/performance.`
        }
    ],
    [LETTER_CATEGORIES.TERMINATION]: [
        {
            id: 'termination',
            title: 'Termination Letter',
            content: `Dear {name},\n\nWe regret to inform you that your employment with us is terminated effective {date}.`
        },
        {
            id: 'experience_cert',
            title: 'Experience Certificate (Exit)',
            content: `To Whom It May Concern,\n\n{name} worked with us as {role} from {joining_date} to {date}. We wish him/her the best.`
        }
    ]
};
