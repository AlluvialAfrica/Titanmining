import React, { useState } from 'react';
import { openReportPdf } from '../utils/reportPdf';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

interface ReportExportMenuProps {
  report: any;
}

export default function ReportExportMenu({ report }: ReportExportMenuProps) {
  const { t } = useLanguage();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleExportPdf = () => {
    openReportPdf(report, report.reportType);
  };

  const handleSendEmail = async () => {
    if (!emailTo) {
      toast.error(t('export.emailRequired') || 'Recipient email is required.');
      return;
    }

    setSending(true);
    try {
      const emailReportUrl = (window as any).__EMAIL_REPORT_URL || '/api/email-report';
      const response = await fetch(emailReportUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          message: emailMessage,
          reportType: report.reportType,
          reportData: typeof report.data === 'string' ? report.data : JSON.stringify(report.data),
          orgId: report.orgId,
          siteId: report.siteId,
          userId: report.userId,
          submittedAt: report.submittedAt,
          status: report.status,
        }),
      });

      if (response.ok) {
        toast.success(t('export.emailSent') || 'Report emailed successfully.');
        setShowEmailModal(false);
        setEmailTo('');
        setEmailMessage('');
      } else {
        toast.error(t('export.emailFailed') || 'Failed to send email.');
      }
    } catch {
      toast.error(t('export.emailFailed') || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="inline-flex gap-2">
      <button
        onClick={handleExportPdf}
        className="text-xs font-mono underline hover:text-blue-600"
      >
        {t('export.pdf') || 'PDF'}
      </button>
      <button
        onClick={() => setShowEmailModal(true)}
        className="text-xs font-mono underline hover:text-blue-600"
      >
        {t('export.email') || 'Email'}
      </button>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border border-black p-8 max-w-md w-full mx-4">
            <h3 className="text-sm uppercase tracking-widest font-semibold mb-4">
              {t('export.emailReport') || 'Email Report'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="minimal-label">{t('export.recipientEmail') || 'Recipient Email'}</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  className="minimal-input"
                  placeholder="recipient@example.com"
                />
              </div>

              <div>
                <label className="minimal-label">{t('export.optionalMessage') || 'Message (Optional)'}</label>
                <textarea
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  className="minimal-input w-full"
                  rows={3}
                  placeholder="Add a note..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="minimal-btn text-xs"
                >
                  {sending ? (t('export.sending') || 'Sending...') : (t('export.send') || 'Send Email')}
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="minimal-btn-secondary text-xs"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
