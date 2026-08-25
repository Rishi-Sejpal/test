import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ScorecardResponse } from '@/types';

export async function exportScorecardToPDF(scorecard: ScorecardResponse, elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for PDF export');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 10;

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  pdf.save(`CyberCISO_Scorecard_${scorecard.vertical}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateScorecardHTML(scorecard: ScorecardResponse): string {
  const verticalLabel = formatVertical(scorecard.vertical);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CyberCISO Security Scorecard</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; color: #1f2937; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; }
        .logo { color: #0ea5e9; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .subtitle { color: #6b7280; font-size: 14px; }
        .scorecard { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
        .overall-grade { flex: 1; min-width: 150px; text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; border: 2px solid #e2e8f0; }
        .grade-letter { font-size: 48px; font-weight: 800; line-height: 1; }
        .grade-label { font-size: 14px; color: #6b7280; margin-top: 4px; }
        .sub-categories { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 30px; }
        .sub-category { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
        .sub-category-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .sub-category-title { font-weight: 600; font-size: 14px; text-transform: capitalize; }
        .sub-category-score { font-weight: 700; font-size: 18px; }
        .findings { font-size: 12px; color: #4b5563; }
        .findings ul { margin: 8px 0 0 0; padding-left: 16px; }
        .findings li { margin-bottom: 4px; }
        .references { font-size: 11px; color: #6b7280; margin-top: 8px; }
        .remediation { margin-top: 30px; }
        .remediation h2 { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #1f2937; }
        .remediation-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .remediation-table th, .remediation-table td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        .remediation-table th { background: #f8fafc; font-weight: 600; color: #374151; }
        .priority-badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .priority-critical { background: #fef2f2; color: #dc2626; }
        .priority-high { background: #fff7ed; color: #ea580c; }
        .priority-medium { background: #fefce8; color: #ca8a04; }
        .priority-low { background: #eff6ff; color: #2563eb; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">CyberCISO</div>
        <div class="subtitle">Virtual CISO Security Assessment</div>
      </div>

      <div class="scorecard">
        <div class="overall-grade">
          <div class="grade-letter" style="color: ${getGradeColor(scorecard.overall_grade)}">${scorecard.overall_grade}</div>
          <div class="grade-label">Overall Grade (Score: ${scorecard.overall_score}/100)</div>
        </div>
        <div style="flex: 2; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">${verticalLabel}</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Assessment Date: ${date}</p>
          <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 13px;">Based on NIST CSF 2.0 & CIS Controls v8 IG1</p>
        </div>
      </div>

      <div class="sub-categories">
        ${scorecard.sub_categories.map(sc => `
          <div class="sub-category">
            <div class="sub-category-header">
              <span class="sub-category-title">${formatCategory(sc.category)}</span>
              <span class="sub-category-score" style="color: ${getGradeColor(sc.grade)}">${sc.score}/100 (${sc.grade})</span>
            </div>
            <div class="findings">
              <strong>Key Findings:</strong>
              <ul>
                ${sc.findings.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
            <div class="references">
              <strong>NIST CSF 2.0:</strong> ${sc.nist_references.join(', ')}<br>
              <strong>CIS Controls v8:</strong> ${sc.cis_references.join(', ')}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="remediation">
        <h2>30-Day Prioritized Remediation Plan</h2>
        <table class="remediation-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Action</th>
              <th>NIST Function</th>
              <th>NIST Category</th>
              <th>CIS Control</th>
              <th>Effort</th>
            </tr>
          </thead>
          <tbody>
            ${scorecard.remediation_plan.map(r => `
              <tr>
                <td>${r.day}</td>
                <td><span class="priority-badge priority-${r.priority.toLowerCase()}">${r.priority}</span></td>
                <td>${formatCategory(r.category)}</td>
                <td>${r.action}</td>
                <td>${r.nist_function}</td>
                <td>${r.nist_category}</td>
                <td>${r.cis_control}</td>
                <td>${r.effort_estimate}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>Generated by CyberCISO - Virtual CISO for Small Business</p>
        <p>This assessment is based on self-reported information and should not replace a professional security audit.</p>
        <p>References to NIST CSF 2.0 and CIS Controls v8 are thematic; specific control numbers should be verified against official publications.</p>
      </div>
    </body>
    </html>
  `;
}

function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    A: '#16a34a',
    B: '#16a34a',
    C: '#eab308',
    D: '#f97316',
    F: '#dc2626',
  };
  return colors[grade] || '#6b7280';
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatVertical(vertical: string): string {
  const map: Record<string, string> = {
    retail: 'Retail',
    healthcare_clinic: 'Healthcare Clinic',
    professional_services: 'Professional Services',
  };
  return map[vertical] || vertical;
}