export const LETTER_CATEGORIES = {
    HIRING: "Hiring / Recruitment",
    VISA: "Visa / Legal",
    NOC: "No Objection Certificates (NOC)",
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
            content: `Dear {name},

We were all very excited to meet and get to know you over the past few days. We have been impressed with your professional background and would like to offer you the {role} position formally. This is a full-time position, working 48 hours per week as per Saudi Labor Law. You will be reporting to the Management of the {department} department.

We will be offering you a monthly salary of SAR {total_salary} (Basic: {basic_salary}, Housing: {housing_allowance}, Transport: {transport_allowance}). You will also have benefits as per company policy, including health insurance and corporate travel expenses where applicable, and 30 days of paid vacation per year.

Your expected starting date is {joining_date}. You will be asked to sign a contract and mention agreements, like confidentiality, nondisclosure, and non-compete at the beginning of your employment.

We would like to have your response by {expiry_date}. In the meantime, please feel free to contact the HR Department via email or phone if you have any questions.

We are all looking forward to having you on our team!

Sincerely,

HR Department
MAAJ GROUP`
        },
        {
            id: 'appt_letter',
            title: 'Appointment Letter',
            content: `Date: {date}
Ref: EMP/{id}/{year}

Dear {name},

Sub: Appointment for the position of {role}

With reference to your application and subsequent interview, we are pleased to appoint you as {role} in the {department} department, effective from {joining_date}.

You will be under probation for a period of 90 days from the date of joining. Your employment will be governed by the terms and conditions set forth in the Company's HR Policy and the Saudi Labor Law.

Welcome to the team!

Best Regards,

General Manager`
        },
        {
            id: 'interview_invite',
            title: 'Interview Invitation',
            content: `Dear {name},

Thank you for your application for the {role} position at MAAJ GROUP.

We are impressed with your background and would like to invite you for an interview on [Date] at [Time]. The interview will take place [In-person at our office/via Microsoft Teams].

Please confirm your availability for this slot. We look forward to speaking with you!

Sincerely,

HR Recruitment Team`
        },
        {
            id: 'interview_regret',
            title: 'Post-Interview Regret Letter',
            content: `Dear {name},

Thank you for taking the time to interview with us for the {role} position.

While your qualifications are impressive, we have decided to move forward with another candidate whose experience more closely matches our current requirements.

We will keep your resume on file for future opportunities that may be a better fit. We wish you the best in your career search.

Best regards,

HR Recruitment Team`
        }
    ],
    [LETTER_CATEGORIES.NOC]: [
        {
            id: 'noc_driving_license',
            title: 'NOC for Driving License',
            content: `Date: {date}

TO WHOM IT MAY CONCERN

Subject: NO OBJECTION CERTIFICATE - DRIVING LICENSE

This is to certify that {name}, a {nationality} national, holding Iqama No. {iqama}, is currently employed with MAAJ GROUP as {role}.

We have no objection for him/her to apply for a Saudi Arabian Driving License. This certificate is issued upon his/her request for this specific purpose only.

This NOC does not carry any financial or legal liability on our company.

For and on behalf of MAAJ GROUP,
Authorized Signatory`
        },
        {
            id: 'noc_family_visa',
            title: 'NOC for Family Visa',
            content: `Date: {date}

TO THE MINISTRY OF FOREIGN AFFAIRS
Kingdom of Saudi Arabia

Subject: NO OBJECTION CERTIFICATE - FAMILY VISA

We, MAAJ GROUP, confirm that {name}, holding Iqama No. {iqama}, is currently employed with us as {role}.

We have no objection for him/her to sponsor his/her family for a [Visit/Residence] visa. We also confirm that he/she is capable of supporting his/her family during their stay in the Kingdom.

This certificate is issued at the request of the employee without any liability on the part of the company.

Yours faithfully,

HR Operations Manager
MAAJ GROUP`
        },
        {
            id: 'noc_international_travel',
            title: 'NOC for International Travel',
            content: `Date: {date}

TO WHOM IT MAY CONCERN

Subject: NO OBJECTION CERTIFICATE - TRAVEL

This is to certify that {name}, holding Iqama No. {iqama}, is an employee of MAAJ GROUP, working as {role}.

We have no objection for him/her to travel outside the Kingdom of Saudi Arabia during his/her approved leave period from [Start Date] to [End Date]. He/She is expected to report back to duty on [Resume Date].

We confirm that he/she will return to his/her position upon completion of the travel.

Sincerely,

HR Department
MAAJ GROUP`
        }
    ],
    [LETTER_CATEGORIES.VISA]: [
        {
            id: 'salary_cert_bank',
            title: 'Salary Certificate (Bank)',
            content: `Date: {date}

TO WHOM IT MAY CONCERN

This is to certify that {name}, a {nationality} national, holding Iqama No. {iqama}, is currently employed with us as {role}.

His/Her monthly salary details are as follows:
- Basic Salary: SAR {basic_salary}
- Allowances: SAR {allowances}
- Total Gross Salary: SAR {total_salary}

This certificate is issued upon the employee's request for the purpose of opening a bank account/applying for a loan, without any financial liability on our company.

For and on behalf of [Company Name],
Authorized Signatory`
        }
    ],
    [LETTER_CATEGORIES.STATUS]: [
        {
            id: 'employment_verification',
            title: 'Employment Certificate',
            content: `Date: {date}

TO WHOM IT MAY CONCERN

This is to certify that {name} (Iqama No: {iqama}) is currently working with us as {role}. He/She joined the company on {joining_date} and is still in active service.

This certificate is provided to confirm his/her employment status as of the date of issuance.

Yours faithfully,

HR Operations`
        }
    ],
    [LETTER_CATEGORIES.PROBATION]: [
        {
            id: 'probation_confirmation',
            title: 'Probation Confirmation',
            content: `Dear {name},

Your probation period with MAAJ GROUP in the {department} department as {role} is due to end on {probation_end_date}.

We are pleased to confirm your ongoing employment effective immediately starting {confirmation_date}.

The terms and conditions of your employment are set out in your original contract dated {joining_date} and will continue to apply to your ongoing position.

Thank you for your contribution to MAAJ GROUP.

Sincerely,

HR Department
Human Resources Operations
MAAJ GROUP`
        },
        {
            id: 'probation_termination',
            title: 'End of Probation Notice',
            content: `Dear {name},

Your probation period with MAAJ GROUP in the Department of {department} as {role} is due to end on {probation_end_date}.

We regret to inform you that have decided not to continue your employment beyond your probationary period. As a result, your employment will end on {termination_date}.

Thank you for your contribution to MAAJ GROUP.

Yours sincerely,

HR Department
Human Resources Operations
MAAJ GROUP`
        },
        {
            id: 'probation_extension',
            title: 'Probation Extension',
            content: `Dear {name},

Following a review of your performance during your initial probation period as {role} in the {department} department, we have decided to extend your probation period.

This extension will be for an additional period of 90 days, now ending on {probation_end_date}. This time will allow you the opportunity to further demonstrate your suitability for the role and to meet the required performance standards.

We will continue to monitor your performance and provide feedback during this extended period.

Yours sincerely,

HR Department
Human Resources Operations
MAAJ GROUP`
        },
        {
            id: 'probation_cancellation',
            title: 'Probation Cancellation (Termination)',
            content: `Dear {name},

This letter serves as formal notice that MAAJ GROUP has decided to cancel your probation period and terminate your employment contract effective {termination_date}.

This decision has been made in accordance with the terms of your employment contract regarding termination during the probationary period.

Please return all company assets, including your ID card and any equipment, to the HR department by your final day.

We thank you for the time you have spent with us and wish you the best in your future endeavors.

Sincerely,

HR Department
Human Resources Operations
MAAJ GROUP`
        }
    ],
    [LETTER_CATEGORIES.TERMINATION]: [
        {
            id: 'termination',
            title: 'Termination Letter',
            content: `Date: {date}
Ref: TERM/{emp_id}

Dear {name},

Subject: Notice of Termination of Employment

We regret to inform you that your employment with the company is being terminated effective {termination_date}, in accordance with Article [X] of the Saudi Labor Law.

Your final settlement, including any outstanding leaves and end-of-service benefits, will be processed upon completion of the exit formalities and handover of company assets.

We thank you for your contributions during your tenure and wish you success in your future endeavors.

Regards,

Management`
        },
        {
            id: 'probation_cancellation_alt',
            title: 'Probation Cancellation (Exit)',
            content: `Dear {name},

This letter serves as formal notice that MAAJ GROUP has decided to cancel your probation period and terminate your employment contract effective {termination_date}.

This decision has been made in accordance with the terms of your employment contract regarding termination during the probationary period.

Please return all company assets, including your ID card and any equipment, to the HR department by your final day.

We thank you for the time you have spent with us and wish you the best in your future endeavors.

Sincerely,

HR Department
Human Resources Operations
MAAJ GROUP`
        },
        {
            id: 'experience_cert',
            title: 'Experience Certificate',
            content: `Date: {date}

EXPERIENCE CERTIFICATE

This is to certify that {name} was employed with us from {joining_date} to {termination_date}. During this period, he/she held the position of {role} in the {department} department.

During his/her tenure, we found him/her to be hardworking, disciplined, and professional in his/her conduct.

We wish him/her all the best for his/her future.

HR Manager`
        },
        {
            id: 'termination_detailed',
            title: 'Employment Termination Notice',
            content: `Dear {name},

We are sorry to inform you that as of {termination_date}, you’ll be no longer employed with {sponsor}. As discussed, we believe this is the best decision because of [Reason for Termination, e.g. this is the final step in our disciplinary process].

From {termination_date} on, you won’t be eligible for any compensation or benefits associated with your position. Please return [Company Assets, e.g. ID card, Laptop] by {date} to the Human Resources office.

You are entitled to [Financial Payments, e.g. Final Salary, Unused Leave Pay].

Please remember that you [have signed / have to sign] [Mention agreements, e.g. Nondisclosure Agreement].

If you have questions or clarifications regarding your compensation, benefits, company assets, or anything else, please feel free to contact me.

We wish you the best of luck.

Sincerely,

{hr_name}
HR Department`
        },
        {
            id: 'resignation_acceptance',
            title: 'Resignation Acceptance',
            content: `Dear {name},

We acknowledge receipt of your resignation letter dated [Date of Letter]. We have accepted your resignation from the position of {role}.

Your final day of employment with MAAJ GROUP will be {termination_date}.

We would like to thank you for your service and contributions during your tenure. We wish you success in your future endeavors.

Please coordinate with HR for your exit interview and final settlement clearance.

Sincerely,

HR Department
MAAJ GROUP`
        },
        {
            id: 'relieving_letter',
            title: 'Relieving Letter',
            content: `Date: {date}

RELIEVING LETTER

Dear {name},

This is to formally confirm that you have been relieved from your duties as {role} at MAAJ GROUP, effective from the close of business hours on {termination_date}.

We acknowledge the receipt of all company properties and assets previously in your possession. Your final settlement has been processed and cleared.

We thank you for your contributions during your tenure from {joining_date} to {termination_date} and wish you the best in your future professional endeavors.

Best Regards,

HR Department
MAAJ GROUP`
        }
    ],
    [LETTER_CATEGORIES.PERFORMANCE]: [
        {
            id: 'promotion_letter',
            title: 'Promotion Letter',
            content: `Dear {name},

Congratulations on your promotion to the {role} position in the {department} at {sponsor}. This promotion will be effective starting from {date} and you will be reporting to {manager_name}, {manager_role}. Your basic monthly salary will be raised from {old_salary} to {total_salary}.

On behalf of the company, we would like to thank you for your efforts and hard work. Congratulations on receiving this well-deserved promotion.

If you have any additional questions, please contact the Human Resources department.

Sincerely,

{hr_name}
HR Department`
        }
    ],
    [LETTER_CATEGORIES.DISCIPLINARY]: [
        {
            id: 'verbal_warning',
            title: 'Verbal Warning Record',
            content: `Date: {date}
Name: {name}
Position: {role}

This is a formal record of a verbal warning issued to you on {date} regarding [Nature of Issue, e.g. punctuality/performance].

During our meeting, we discussed [Details of the incident or behavior]. You are expected to improve in the following areas:
1. [Improvement Area 1]
2. [Improvement Area 2]

Failure to demonstrate immediate and sustained improvement may lead to further disciplinary action, up to and including termination of employment.

Regards,

{hr_name}
HR Department`
        },
        {
            id: 'written_warning_1',
            title: 'First Written Warning',
            content: `Dear {name},

This is a first written warning regarding your [Performance/Conduct].

Despite previous discussions, we have noted that [Briefly describe the ongoing issue]. Specifically:
- [Incident/Behavior 1]
- [Incident/Behavior 2]

Effective immediately, you are required to [Action Required]. This situation will be monitored closely for the next 30 days.

Please be advised that further incidents or a lack of improvement will result in additional disciplinary measures as per company policy and the Saudi Labor Law.

Sincerely,

{hr_name}
HR Department`
        },
        {
            id: 'final_warning',
            title: 'Final Written Warning',
            content: `Dear {name},

This is a FINAL written warning. Your employment is now at serious risk.

Following our previous warnings dated [Previous Date], we have not seen the required improvement in [Issue area]. On [Recent Date], it was noted that [Latest Incident].

We are giving you one last opportunity to correct your conduct. The following performance standards must be met immediately:
- [Clear Expectation 1]
- [Clear Expectation 2]

Any further violation of company policies or failure to meet performance standards will result in immediate termination of your employment.

Sincerely,

{hr_name}
HR Department`
        },
        {
            id: 'harassment_warning',
            title: 'Harassment Policy Violation Warning',
            content: `Dear {name},

This letter serves as a formal warning regarding a reported violation of the Company’s Anti-Harassment and Professional Conduct Policy.

On [Date], a formal complaint was received and investigated. The finding suggests that your behavior [Describe Behavior concisely] constitutes harassment as defined in our employee handbook and Article 61/bis of the Saudi Labor Law.

MAAJ GROUP maintains a zero-tolerance policy towards harassment in the workplace. You are directed to:
1. Cease this behavior immediately.
2. Refrain from any form of retaliation against the complainant.
3. Review the company's conduct policies.

Be advised that any further report of similar behavior or any retaliatory acts will result in immediate dismissal.

Sincerely,

{hr_name}
HR Department`
        },
        {
            id: 'show_cause',
            title: 'Show Cause Notice',
            content: `Dear {name},

It has been brought to our attention that [Describe Allegation/Incident, e.g. unauthorized absence / breach of safety protocol] occurred on [Date].

In accordance with company policy, you are hereby required to "Show Cause" in writing as to why disciplinary action should not be taken against you for this matter.

Your written explanation must be submitted to the HR Department by [Deadline Date/Time]. Failure to provide a satisfactory explanation within this period may result in disciplinary action as per the Saudi Labor Law.

Regards,

{hr_name}
HR Department`
        },
        {
            id: 'suspension_letter',
            title: 'Suspension Pending Investigation',
            content: `Dear {name},

This letter is to inform you that you are being placed on administrative suspension, [With/Without] pay, effective immediately, pending an investigation into [Nature of Investigation, e.g. allegations of gross misconduct].

While on suspension:
- You are not to report to work or perform any company duties.
- You must remain available via phone during working hours for interviews.
- You are to return all company property, including keys and access cards, to HR today.

We will contact you once the investigation is concluded to discuss the next steps.

Sincerely,

{hr_name}
HR Department`
        },
        {
            id: 'disciplinary_fine',
            title: 'Notice of Financial Penalty',
            content: `Dear {name},

Subject: NOTICE OF FINANCIAL PENALTY

This letter is to inform you that a financial penalty of SAR [Amount] has been imposed on you due to [Reason, e.g., damage to company property / violation of safety protocols] occurring on [Date].

This action is taken in accordance with the Company Disciplinary Policy and Article [X] of the Saudi Labor Law. The amount will be deducted from your salary for the month of [Month, Year].

We expect you to adhere strictly to all company rules and regulations to avoid further disciplinary actions.

Sincerely,

{hr_name}
HR Department`
        },
        {
            id: 'inquiry_notice',
            title: 'Notice of Internal Inquiry',
            content: `Dear {name},

Subject: NOTICE OF INTERNAL INQUIRY

You are hereby required to attend an internal inquiry meeting scheduled for:

Date: [Date]
Time: [Time]
Location: [Location/Online]

The purpose of this inquiry is to investigate [Description of Incident/Matter]. You will be given a full opportunity to present your explanation and provide any supporting evidence.

Please be advised that failure to attend this inquiry without a valid reason may result in the investigation proceeding in your absence and subsequent disciplinary action.

Regards,

{hr_name}
HR Department`
        }
    ],
    [LETTER_CATEGORIES.LEAVE]: [
        {
            id: 'leave_approval',
            title: 'Leave Approval Letter',
            content: `Dear {name},

We are pleased to inform you that your request for [Type of Leave, e.g. Annual Leave] from [Start Date] to [End Date] has been approved.

You are expected to return to work on [Return Date]. During your absence, your responsibilities will be handled by [Handover Person Name].

Please ensure all current tasks are updated and handed over properly before your leave begins.

Wishing you a restful break.

Regards,

HR Department`
        },
        {
            id: 'leave_rejection',
            title: 'Leave Rejection Letter',
            content: `Dear {name},

Thank you for your leave request for the period of [Start Date] to [End Date].

Unfortunately, we are unable to approve your request at this time due to [Reason, e.g. high project volume / limited staff availability].

We understand the importance of time off and suggest that you resubmit your request for a later date, such as [Suggested Timing].

Thank you for your understanding.

Regards,

HR Department`
        },
        {
            id: 'maternity_leave',
            title: 'Maternity Leave Confirmation',
            content: `Dear {name},

This letter confirms your maternity leave starting on [Start Date] and ending on [End Date], for a total of 10 weeks as per Saudi Labor Law.

During this period:
- You will receive [Full/Half] pay as per your eligibility under the GOSI regulations.
- All medical insurance benefits will continue to apply.

We wish you and your family all the best. Please keep us updated on your return status.

Sincerely,

HR Department`
        }
    ],
    [LETTER_CATEGORIES.PAYROLL]: [
        {
            id: 'salary_increment',
            title: 'Salary Increment Notice',
            content: `Dear {name},

In recognition of your exceptional performance and contribution to MAAJ GROUP over the past year, we are pleased to inform you that your salary has been increased.

Effective from [Effective Date], your new monthly salary details are:
- Basic Salary: SAR [New Basic]
- Total Monthly Package: SAR {total_salary}

All other terms and conditions of your employment contract remain unchanged.

Thank you for your hard work and commitment to our success!

Sincerely,

{hr_name}
Management`
        },
        {
            id: 'bonus_award',
            title: 'Bonus Award Letter',
            content: `Dear {name},

We are pleased to inform you that the Management has approved a one-time performance bonus for your outstanding work on [Project/Period].

An amount of SAR [Amount] will be credited to your account along with your next salary payment.

This bonus is a token of our appreciation for your dedication. We look forward to your continued excellence.

Best regards,

{hr_name}
Management`
        }
    ],
    [LETTER_CATEGORIES.ONBOARDING]: [
        {
            id: 'onboarding_welcome',
            title: 'Welcome & Induction Schedule',
            content: `Dear {name},

Welcome to MAAJ GROUP! We are thrilled to have you join our {department} team as {role}.

Your induction will begin on your first day, {joining_date}, at 9:00 AM. Please report to the HR office. Your schedule for the first week will include:
- Day 1: IT Setup and Office Tour
- Day 2: Department Orientation
- Day 3: Policy & Safety Training

Welcome aboard!

Sincerely,

HR Department`
        }
    ]
};
