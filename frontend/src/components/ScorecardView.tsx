'use client';

import { useState } from 'react';
import { RotateCcw, Download, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { ScorecardResponse } from '@/types';
import { cn, formatVertical, getGradeColor, getPriorityColor, formatCategory } from '@/lib/utils';

interface ScorecardViewProps {
  scorecard: ScorecardResponse;
  onRestart: () => void;
  onDownloadPDF: () => Promise<void>;
}

export default function ScorecardView({ scorecard, onRestart, onDownloadPDF }: ScorecardViewProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownloadPDF();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo.svg" alt="CyberCISO" className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-gray-900">CyberCISO</h1>
              <p className="text-xs text-gray-500">Security Scorecard & Remediation Plan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('px-3 py-1 text-sm font-medium rounded-full', getGradeColor(scorecard.overall_grade))}>
              Grade: {scorecard.overall_grade}
            </span>
            <span className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full">
              {formatVertical(scorecard.vertical)}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Security Scorecard</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={onRestart}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                New Assessment
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={cn('md:col-span-1 p-6 rounded-2xl border-2 text-center', getGradeColor(scorecard.overall_grade).replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', 'border-'))}>
              <div className="text-7xl font-bold mb-2">{scorecard.overall_grade}</div>
              <div className="text-lg font-medium">Overall Grade</div>
              <div className="text-2xl font-bold mt-2">{scorecard.overall_score}/100</div>
            </div>
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Assessment Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Vertical</p>
                  <p className="font-medium text-gray-900">{formatVertical(scorecard.vertical)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Framework</p>
                  <p className="font-medium text-gray-900">NIST CSF 2.0 & CIS Controls v8 IG1</p>
                </div>
                <div>
                  <p className="text-gray-500">Sub-categories Assessed</p>
                  <p className="font-medium text-gray-900">5 (Equally Weighted)</p>
                </div>
                <div>
                  <p className="text-gray-500">Remediation Actions</p>
                  <p className="font-medium text-gray-900">{scorecard.remediation_plan.length} over 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary-600" />
            Sub-Category Scores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scorecard.sub_categories.map((sc, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 capitalize">{formatCategory(sc.category)}</h3>
                  <span className={cn('px-3 py-1 rounded-full text-sm font-bold', getGradeColor(sc.grade))}>
                    {sc.grade} ({sc.score})
                  </span>
                </div>
                <div className="mb-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sc.score}%`,
                        backgroundColor: getGradeColor(sc.grade).includes('green') ? '#16a34a'
                          : getGradeColor(sc.grade).includes('yellow') ? '#eab308'
                          : getGradeColor(sc.grade).includes('orange') ? '#f97316'
                          : '#dc2626'
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="font-medium">Key Findings:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {sc.findings.map((f, fi) => (
                      <li key={fi}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <p><strong>NIST CSF 2.0:</strong> {sc.nist_references.join(', ')}</p>
                  <p><strong>CIS Controls v8:</strong> {sc.cis_references.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            30-Day Prioritized Remediation Plan
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Day</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NIST Function</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NIST Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CIS Control</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Effort</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {scorecard.remediation_plan.map((action, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Day {action.day}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-semibold', getPriorityColor(action.priority))}>
                        {action.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{formatCategory(action.category)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={action.action}>{action.action}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{action.nist_function}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={action.nist_category}>{action.nist_category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={action.cis_control}>{action.cis_control}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{action.effort_estimate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important Disclaimer</p>
              <p className="mt-1">This assessment is based on self-reported information from a brief interview and should not replace a professional security audit. References to NIST CSF 2.0 and CIS Controls v8 are thematic; specific control numbers should be verified against official publications.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/images/logo.svg" alt="CyberCISO" className="w-6 h-6 opacity-70" />
            <span className="font-medium text-gray-700">CyberCISO</span>
          </div>
          <p>Generated by CyberCISO — Virtual CISO for Small Business</p>
        </div>
      </footer>
    </div>
  );
}