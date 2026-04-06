import React, { useState, useEffect } from 'react';
import { fetchPatientByQrToken } from '../api/patientApi.js';

function formatTime(timestamp) {
    if (!timestamp) return '--:--';
    const d = new Date(timestamp);
    return d.toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    });
}

const EVENT_ICONS = {
    INTAKE: '🏥',
    REASSESSMENT: '🔄',
    PRIORITY_CHANGE: '⚡',
    RESOURCE_ALLOCATION: '🧩',
    HANDOFF: '🔀',
    DISCHARGE: '🏠',
};

const PRIORITY_CONFIG = {
    RED: { label: 'CRITICAL', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '🔴' },
    YELLOW: { label: 'URGENT', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '🟡' },
    GREEN: { label: 'STANDARD', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: '🟢' },
};

export default function PatientQrHistory() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const hash = window.location.hash;
        const match = hash.match(/^#\/qr\/(.+)$/);
        if (!match) {
            setError('Invalid QR link.');
            setLoading(false);
            return;
        }

        const token = match[1];

        async function load() {
            try {
                const data = await fetchPatientByQrToken(token);
                setPatient(data);
            } catch (err) {
                setError(err.message || 'Failed to load patient data.');
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    if (loading) {
        return (
            <div className="qr-history-page">
                <div className="qr-history-loading">
                    <div className="qr-history-spinner"></div>
                    <h2>Loading Patient Record...</h2>
                    <p>Verifying QR access token</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="qr-history-page">
                <div className="qr-history-error-card">
                    <div className="qr-error-icon">⚠️</div>
                    <h2>Access Denied</h2>
                    <p>{error}</p>
                    <div className="qr-error-hint">
                        If this QR code has expired, please ask staff at the ER desk
                        to generate a new one.
                    </div>
                </div>
            </div>
        );
    }

    const priority = PRIORITY_CONFIG[patient.priority] || PRIORITY_CONFIG.GREEN;

    return (
        <div className="qr-history-page">
            <div className="qr-history-container">
                {/* Header Banner */}
                <div className="qr-history-header" style={{ borderColor: priority.color }}>
                    <div className="qr-history-hospital">
                        <span className="qr-history-logo">🏥</span>
                        <span>ER Triage System — Patient Record</span>
                    </div>
                    <div className="qr-history-priority-banner" style={{ background: priority.bg, color: priority.color }}>
                        <span>{priority.icon}</span>
                        <span className="qr-priority-text">{priority.label} PRIORITY</span>
                    </div>
                </div>

                {/* Patient Identity */}
                <section className="qr-history-section qr-identity-section">
                    <h1 className="qr-patient-fullname">{patient.name || 'Unknown Patient'}</h1>
                    <div className="qr-identity-grid">
                        <div className="qr-identity-item">
                            <span className="qr-identity-label">Patient ID</span>
                            <span className="qr-identity-value">{patient.id}</span>
                        </div>
                        <div className="qr-identity-item">
                            <span className="qr-identity-label">Age</span>
                            <span className="qr-identity-value">{patient.age || 'N/A'}</span>
                        </div>
                        <div className="qr-identity-item">
                            <span className="qr-identity-label">Admitted</span>
                            <span className="qr-identity-value">{formatTime(patient.timestamp)}</span>
                        </div>
                        <div className="qr-identity-item">
                            <span className="qr-identity-label">Triage Level</span>
                            <span className="qr-identity-value" style={{ color: priority.color, fontWeight: 700 }}>
                                {priority.icon} {patient.priority}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Clinical Info */}
                {patient.symptoms && (
                    <section className="qr-history-section">
                        <h3 className="qr-section-title">
                            <span>🩺</span> Chief Complaint / Symptoms
                        </h3>
                        <div className="qr-section-body">{patient.symptoms}</div>
                    </section>
                )}

                {patient.vitals && patient.vitals !== 'Not recorded' && (
                    <section className="qr-history-section">
                        <h3 className="qr-section-title">
                            <span>💓</span> Vitals
                        </h3>
                        <div className="qr-section-body">{patient.vitals}</div>
                    </section>
                )}

                {/* Resource Allocation */}
                {(patient.assignedCareZone || patient.assignedRoom || patient.assignedDoctorName) && (
                    <section className="qr-history-section">
                        <h3 className="qr-section-title">
                            <span>🧩</span> Resource Allocation
                        </h3>
                        <div className="qr-resource-grid">
                            <div className="qr-resource-item">
                                <span className="qr-resource-label">Care Zone</span>
                                <span className="qr-resource-value">{patient.assignedCareZone || 'Pending'}</span>
                            </div>
                            <div className="qr-resource-item">
                                <span className="qr-resource-label">Room</span>
                                <span className="qr-resource-value">{patient.assignedRoom || 'Pending'}</span>
                            </div>
                            <div className="qr-resource-item">
                                <span className="qr-resource-label">Doctor</span>
                                <span className="qr-resource-value">
                                    {patient.assignedDoctorName || 'Unassigned'}
                                    {patient.assignedDoctorSpecialization &&
                                        <span className="qr-resource-spec"> ({patient.assignedDoctorSpecialization})</span>}
                                </span>
                            </div>
                            <div className="qr-resource-item">
                                <span className="qr-resource-label">Nurse</span>
                                <span className="qr-resource-value">{patient.assignedNurseName || 'Pending'}</span>
                            </div>
                            <div className="qr-resource-item">
                                <span className="qr-resource-label">Support Staff</span>
                                <span className="qr-resource-value">{patient.assignedSupportStaff || 'General'}</span>
                            </div>
                            {Array.isArray(patient.assignedEquipment) && patient.assignedEquipment.length > 0 && (
                                <div className="qr-resource-item qr-resource-full">
                                    <span className="qr-resource-label">Equipment</span>
                                    <span className="qr-resource-value">{patient.assignedEquipment.join(', ')}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Timeline */}
                {patient.timeline && patient.timeline.length > 0 && (
                    <section className="qr-history-section">
                        <h3 className="qr-section-title">
                            <span>📋</span> Patient Timeline
                        </h3>
                        <div className="qr-timeline">
                            {patient.timeline.map((event, idx) => (
                                <div key={event.id || idx} className="qr-timeline-item">
                                    <div className="qr-timeline-connector">
                                        <div className="qr-timeline-dot" style={{
                                            background: event.eventType === 'PRIORITY_CHANGE' ? '#f59e0b'
                                                : event.eventType === 'DISCHARGE' ? '#22c55e'
                                                : event.eventType === 'INTAKE' ? '#3b82f6'
                                                : '#64748b'
                                        }}></div>
                                        {idx < patient.timeline.length - 1 && <div className="qr-timeline-line"></div>}
                                    </div>
                                    <div className="qr-timeline-content">
                                        <div className="qr-timeline-header">
                                            <span className="qr-timeline-event-icon">
                                                {EVENT_ICONS[event.eventType] || '📌'}
                                            </span>
                                            <span className="qr-timeline-event-type">
                                                {event.eventType.replace(/_/g, ' ')}
                                            </span>
                                            <span className="qr-timeline-time">{formatTime(event.timestamp)}</span>
                                        </div>
                                        <div className="qr-timeline-description">{event.description}</div>
                                        {event.performedBy && (
                                            <div className="qr-timeline-actor">By: {event.performedBy}</div>
                                        )}
                                        {event.oldPriority && event.newPriority && event.oldPriority !== event.newPriority && (
                                            <div className="qr-timeline-priority-change">
                                                <span style={{ color: PRIORITY_CONFIG[event.oldPriority]?.color || '#64748b' }}>
                                                    {event.oldPriority}
                                                </span>
                                                <span> → </span>
                                                <span style={{ color: PRIORITY_CONFIG[event.newPriority]?.color || '#64748b' }}>
                                                    {event.newPriority}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <div className="qr-history-footer">
                    <p>This record was accessed via a secure QR code link.</p>
                    <p>ER Triage System • Confidential Medical Information</p>
                </div>
            </div>
        </div>
    );
}
