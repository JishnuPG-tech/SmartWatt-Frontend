export const generatePDF = async (
    household: any,
    billDetails: any,
    results: any,
    avgCost: number,
    smartInsights: any[]
) => {
    try {
        const jsPDF = (await import('jspdf')).default;
        const autoTable = (await import('jspdf-autotable')).default;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185); // Blue
        doc.text("SmartWatt Energy Report", 14, 20);

        // Subtitle / Date
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} `, 14, 28);

        // Household Summary
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Household Summary", 14, 40);

        doc.setFontSize(10);
        doc.setTextColor(80);
        const summaryData = [
            [`Household Size: ${household.num_people} People`, `Season: ${household.season.toUpperCase()} `],
            [`House Type: ${household.house_type.toUpperCase()} `, `Bi - Monthly Units: ${household.kwh} kWh`],
            [`Estimated Bill: Rs.${Math.floor(billDetails.total)} `, `Avg Cost / Unit: Rs.${avgCost.toFixed(2)} `]
        ];

        autoTable(doc, {
            startY: 45,
            head: [],
            body: summaryData,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 90 } }
        });

        // Breakdown Table
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Appliance Breakdown", 14, (doc as any).lastAutoTable.finalY + 15);

        const tableData = results.breakdown.map((item: any) => [
            item.name,
            `${item.kwh.toFixed(2)} kWh`,
            `${item.percentage.toFixed(1)}% `,
            `Rs.${item.cost} `
        ]);

        // Add Total Row
        tableData.push([
            'TOTAL',
            `${household.kwh.toFixed(1)} kWh`,
            '100%',
            `Rs.${Math.floor(billDetails.total)} `
        ]);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Appliance', 'Usage', 'Percentage', 'Cost']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10, cellPadding: 4 },
            columnStyles: {
                0: { fontStyle: 'bold' },
                3: { fontStyle: 'bold', halign: 'right' },
                1: { halign: 'right' },
                2: { halign: 'right' }
            },
            didParseCell: (data) => {
                if (data.row.index === tableData.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [240, 240, 240];
                }
            }
        });

        // Energy Tips
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Energy Saving Tips", 14, finalY);

        doc.setFontSize(10);
        doc.setTextColor(80);

        // Use the actual AI insights from the component logic
        // Fallback to generic tips only if insights are empty (rare)
        const tips = smartInsights.length > 0
            ? smartInsights.slice(0, 6).map(ins => `- ${ins.msg} `)
            : [
                "- Use overhead tank water (sun-heated) instead of geyser.",
                "- Utilize monsoon season for natural cooling to reduce AC usage.",
                "- Run washing machine during off-peak hours.",
                "- Install solar panels (Kerala has ~250 sunny days/year)."
            ];

        let tipY = finalY + 10;
        tips.forEach(tip => {
            // Simple text wrapping simulation
            const splitTip = doc.splitTextToSize(tip, 180);
            doc.text(splitTip, 14, tipY);
            tipY += (splitTip.length * 6) + 2;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("SmartWatt AI - Kerala Energy Estimator", 14, 285);

        doc.save('SmartWatt-Report.pdf');

    } catch (err) {
        console.error('PDF Generation Failed:', err);
        alert('Failed to generate PDF. Please try again.');
    }
};
