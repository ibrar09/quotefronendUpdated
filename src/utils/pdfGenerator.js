import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePayslip = (data) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // -- Header --
    doc.setFillColor(41, 128, 185); // Blue
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("PAYSLIP", pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`${new Date(0, data.month - 1).toLocaleString('default', { month: 'long' })} ${data.year}`, pageWidth / 2, 30, { align: 'center' });

    // -- Employee Details --
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Employee Details:", 14, 50);

    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${data.Employee?.name || data.Employee?.first_name + ' ' + data.Employee?.last_name}`, 14, 56);
    doc.text(`ID: ${data.Employee?.emp_id || data.employee_id}`, 14, 62);
    doc.text(`Role: ${data.Employee?.role || data.Employee?.position || '-'}`, 14, 68);

    doc.setFont("helvetica", "bold");
    doc.text("Payment Date:", 140, 50);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), 140, 56);
    doc.text(`Status: ${data.status}`, 140, 62);

    // -- Table Data --
    const basic = Number(data.basic_salary) || 0;
    const housing = Number(data.housing_allowance) || 0;
    const transport = Number(data.transport_allowance) || 0;
    const other = Number(data.other_allowance) || 0;
    const overtime = Number(data.overtime_pay) || 0;
    const totalEarnings = basic + housing + transport + other + overtime;

    const deductions = Number(data.deductions) || 0;
    const netSalary = Number(data.net_salary) || 0;

    const tableData = [
        ["Basic Salary", basic.toFixed(2)],
        ["Housing Allowance", housing.toFixed(2)],
        ["Transport Allowance", transport.toFixed(2)],
        ["Other Allowance", other.toFixed(2)],
        [`Overtime (${data.overtime_hours} hrs)`, overtime.toFixed(2)],
        [{ content: "Gross Earnings", styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: totalEarnings.toFixed(2), styles: { fontStyle: 'bold' } }],
        ["Deductions", `(${deductions.toFixed(2)})`],
        [{ content: "NET SALARY", styles: { fontStyle: 'bold', fillColor: [220, 255, 220], textColor: [0, 100, 0], fontSize: 12 } }, { content: netSalary.toFixed(2), styles: { fontStyle: 'bold', textColor: [0, 100, 0], fontSize: 12 } }]
    ];

    autoTable(doc, {
        startY: 80,
        head: [['Description', 'Amount (SAR)']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 73, 94], textColor: 255 },
        columnStyles: {
            0: { cellWidth: 120 },
            1: { cellWidth: 'auto', halign: 'right' }
        }
    });

    // -- Footer --
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This is a system generated payslip and does not require a signature.", pageWidth / 2, finalY + 20, { align: 'center' });

    // Save
    doc.save(`Payslip_${data.Employee?.name}_${data.month}_${data.year}.pdf`);
};
