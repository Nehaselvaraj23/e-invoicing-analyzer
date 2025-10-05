import jsPDF from 'jspdf';

export const generatePDFReport = (analysisResult: any): void => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('E-Invoicing Readiness Report', margin, yPosition);
  yPosition += 10;

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
  doc.text(`Report ID: ${analysisResult.reportId}`, pageWidth - margin - 60, yPosition);
  yPosition += 15;

  // Scores Section
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Readiness Scores', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  const scores = analysisResult.scores;
  const scoreEntries = [
    { label: 'Overall Readiness', value: scores.overall, color: getScoreColor(scores.overall) },
    { label: 'Data Quality', value: scores.data, color: getScoreColor(scores.data) },
    { label: 'Field Coverage', value: scores.coverage, color: getScoreColor(scores.coverage) },
    { label: 'Rule Compliance', value: scores.rules, color: getScoreColor(scores.rules) },
    { label: 'Technical Posture', value: scores.posture, color: getScoreColor(scores.posture) }
  ];

  scoreEntries.forEach((entry, index) => {
    const x = margin + (index % 2) * 90;
    const y = yPosition + Math.floor(index / 2) * 25;
    
    doc.setFillColor(entry.color.r, entry.color.g, entry.color.b);
    doc.roundedRect(x, y, 80, 20, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(entry.label, x + 5, y + 8);
    doc.setFontSize(14);
    doc.text(`${entry.value}`, x + 5, y + 16);
  });

  yPosition += 60;

  // Field Coverage
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Field Coverage Analysis', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  const coverage = analysisResult.coverage;
  doc.text(`Matched Fields: ${coverage.matched.length}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Close Matches: ${coverage.close.length}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Missing Fields: ${coverage.missing.length}`, margin, yPosition);
  yPosition += 15;

  // Rule Findings
  doc.setFontSize(16);
  doc.text('Rule Validation Results', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  analysisResult.ruleFindings.forEach((rule: any, index: number) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const status = rule.ok ? 'PASS' : 'FAIL';
    const color = rule.ok ? { r: 34, g: 197, b: 94 } : { r: 239, g: 68, b: 68 };
    
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(margin, yPosition, 15, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(status, margin + 3, yPosition + 5.5);
    
    doc.setTextColor(40, 40, 40);
    doc.text(rule.rule, margin + 20, yPosition + 5.5);
    
    if (!rule.ok && rule.explanation) {
      yPosition += 8;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const lines = doc.splitTextToSize(rule.explanation, pageWidth - margin * 2 - 20);
      doc.text(lines, margin + 20, yPosition);
      yPosition += lines.length * 4;
    }
    
    yPosition += 12;
    doc.setFontSize(10);
  });

  // Save PDF
  doc.save(`e-invoicing-report-${analysisResult.reportId}.pdf`);
};

const getScoreColor = (score: number): { r: number; g: number; b: number } => {
  if (score >= 80) return { r: 34, g: 197, b: 94 };   // Green
  if (score >= 60) return { r: 59, g: 130, b: 246 };  // Blue
  if (score >= 40) return { r: 234, g: 179, b: 8 };   // Yellow
  return { r: 239, g: 68, b: 68 };                    // Red
};