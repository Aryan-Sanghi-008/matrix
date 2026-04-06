import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { generateQrToken } from '../api/patientApi.js';

export default function PatientQrModal({ patient, onClose }) {
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [qrUrl, setQrUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const canvasRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        async function generate() {
            setLoading(true);
            setError('');
            try {
                const { token } = await generateQrToken(patient.id);
                const base = window.location.origin + window.location.pathname;
                const url = `${base}#/qr/${token}`;
                if (cancelled) return;
                setQrUrl(url);

                const dataUrl = await QRCode.toDataURL(url, {
                    width: 400,
                    margin: 2,
                    color: { dark: '#0f172a', light: '#ffffff' },
                    errorCorrectionLevel: 'H',
                });
                if (cancelled) return;
                setQrDataUrl(dataUrl);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Failed to generate QR code');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        generate();
        return () => { cancelled = true; };
    }, [patient.id]);

    const handleDownload = () => {
        if (!qrDataUrl) return;
        const link = document.createElement('a');
        link.download = `patient-qr-${patient.name || patient.id}.png`;
        link.href = qrDataUrl;
        link.click();
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Patient QR — ${patient.name || 'Unknown'}</title>
                <style>
                    body { display: flex; flex-direction: column; align-items: center; justify-content: center;
                           min-height: 100vh; margin: 0; font-family: 'Inter', sans-serif; background: #fff; }
                    .qr-print-name { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #0f172a; }
                    .qr-print-id { font-size: 14px; color: #64748b; margin-bottom: 24px; }
                    img { width: 300px; height: 300px; }
                    .qr-print-footer { margin-top: 20px; font-size: 12px; color: #94a3b8; }
                </style>
            </head>
            <body>
                <div class="qr-print-name">${patient.name || 'Unknown Patient'}</div>
                <div class="qr-print-id">ID: ${patient.id} • Age: ${patient.age || 'N/A'}</div>
                <img src="${qrDataUrl}" alt="Patient QR Code" />
                <div class="qr-print-footer">Scan to view full patient history • ER Triage System</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
    };

    const handleCopy = async () => {
        if (!qrUrl) return;
        try {
            await navigator.clipboard.writeText(qrUrl);
        } catch { /* fallback ignored */ }
    };

    const priorityColors = {
        RED: '#ef4444',
        YELLOW: '#f59e0b',
        GREEN: '#22c55e',
    };

    return (
        <div className="qr-modal-overlay" onClick={onClose}>
            <div className="qr-modal" onClick={e => e.stopPropagation()}>
                <button className="qr-modal-close" onClick={onClose}>✕</button>

                <div className="qr-modal-header">
                    <div className="qr-modal-icon">📱</div>
                    <h2 className="qr-modal-title">Patient QR Code</h2>
                    <p className="qr-modal-subtitle">Scan to access full medical history</p>
                </div>

                <div className="qr-modal-patient-info">
                    <div className="qr-patient-name">{patient.name || 'Unknown Patient'}</div>
                    <div className="qr-patient-meta">
                        <span>ID: {patient.id}</span>
                        {patient.age && <span>Age: {patient.age}</span>}
                        <span
                            className="qr-priority-badge"
                            style={{ background: priorityColors[patient.priority] || '#64748b' }}
                        >
                            {patient.priority}
                        </span>
                    </div>
                </div>

                <div className="qr-code-container">
                    {loading ? (
                        <div className="qr-loading">
                            <div className="qr-spinner"></div>
                            <span>Generating QR Code...</span>
                        </div>
                    ) : error ? (
                        <div className="qr-error">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    ) : (
                        <>
                            <img
                                src={qrDataUrl}
                                alt={`QR Code for ${patient.name}`}
                                className="qr-code-image"
                            />
                            <div className="qr-expiry-note">⏱ Valid for 24 hours</div>
                        </>
                    )}
                </div>

                {!loading && !error && (
                    <div className="qr-modal-actions">
                        <button className="qr-action-btn qr-download" onClick={handleDownload}>
                            <span>⬇️</span> Download
                        </button>
                        <button className="qr-action-btn qr-print" onClick={handlePrint}>
                            <span>🖨️</span> Print
                        </button>
                        <button className="qr-action-btn qr-copy" onClick={handleCopy}>
                            <span>📋</span> Copy Link
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
