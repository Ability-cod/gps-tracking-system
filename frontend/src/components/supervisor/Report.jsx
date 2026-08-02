// frontend/src/components/supervisor/Report.jsx
import { useState } from 'react';
import reportService from '../../services/reportService';
import Navbar from '../shared/Navbar';
import '../../App.css';

function Report() {
    const [loading, setLoading]   = useState(false);
    const [preview, setPreview]   = useState(null);
    const [error, setError]       = useState('');

    // Format date helper
    const formatDate = (d) => {
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    };

    // Load report data and show preview
    const handlePreview = async () => {
        setError('');
        try {
            setLoading(true);
            const res = await reportService.getStudentsReport();
            setPreview(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load report data.');
        } finally {
            setLoading(false);
        }
    };

    // Generate and download PDF
    const handleDownloadPDF = async () => {
        if (!preview) return;
        setLoading(true);

        try {
            // Dynamically import jsPDF
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const pageWidth  = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin     = 15;
            let y            = margin;

            // ── Helper functions ──────────────────────────────
            const checkNewPage = (neededHeight = 20) => {
                if (y + neededHeight > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
            };

            const drawLine = (color = [220, 220, 220]) => {
                doc.setDrawColor(...color);
                doc.line(margin, y, pageWidth - margin, y);
                y += 4;
            };

            // ── HEADER ────────────────────────────────────────
            // Blue header bar
            doc.setFillColor(26, 82, 118);
            doc.rect(0, 0, pageWidth, 35, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Mzumbe University', margin, 14);

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text('Field Attachment Supervision Report', margin, 22);

            doc.setFontSize(9);
            doc.text(`Generated: ${formatDate(preview.generated_at)}`, margin, 30);
            doc.text(`Supervisor: ${preview.supervisor.name}`, pageWidth - margin, 30, { align: 'right' });

            y = 44;

            // ── SUMMARY BOXES ─────────────────────────────────
            doc.setTextColor(0, 0, 0);
            const boxW = (pageWidth - margin * 2 - 10) / 3;

            const drawBox = (x, label, value, color) => {
                doc.setFillColor(...color);
                doc.roundedRect(x, y, boxW, 18, 2, 2, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text(String(value), x + boxW / 2, y + 10, { align: 'center' });
                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.text(label, x + boxW / 2, y + 16, { align: 'center' });
            };

            drawBox(margin,                  'Total Students', preview.total_students,    [26, 82, 118]);
            drawBox(margin + boxW + 5,       'Assessed',       preview.total_assessed,    [39, 174, 96]);
            drawBox(margin + (boxW + 5) * 2, 'Not Assessed',   preview.total_students - preview.total_assessed, [231, 76, 60]);

            y += 26;
            doc.setTextColor(0, 0, 0);

            // ── STUDENT RECORDS ───────────────────────────────
            preview.students.forEach((student, index) => {
                checkNewPage(50);

                // Student header
                doc.setFillColor(240, 244, 248);
                doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 1, 1, 'F');

                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(26, 82, 118);
                doc.text(`${index + 1}. ${student.name}`, margin + 3, y + 7);

                const statusColor = student.assessment.status === 'assessed' ? [39, 174, 96] : [231, 76, 60];
                const statusText  = student.assessment.status === 'assessed' ? 'ASSESSED' : 'NOT ASSESSED';
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...statusColor);
                doc.text(statusText, pageWidth - margin - 3, y + 7, { align: 'right' });

                y += 13;
                doc.setTextColor(0, 0, 0);

                // Student details
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(80, 80, 80);
                doc.text(`Email: ${student.email}`, margin + 3, y);
                doc.text(`Registered: ${formatDate(student.registered_at)}`, margin + 80, y);
                doc.text(`Total Visits: ${student.total_visits}`, pageWidth - margin - 3, y, { align: 'right' });

                y += 6;

                // Assessment note
                if (student.assessment.status === 'assessed') {
                    doc.setTextColor(39, 174, 96);
                    doc.setFont('helvetica', 'italic');
                    const noteText = student.assessment.note
                        ? `Assessment Note: ${student.assessment.note}`
                        : `Assessed on: ${formatDate(student.assessment.assessed_at)}`;
                    doc.text(noteText, margin + 3, y);
                    y += 6;
                }

                // Visit logs
                if (student.visits && student.visits.length > 0) {
                    doc.setTextColor(0, 0, 0);
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(8);
                    doc.text('Visit History:', margin + 3, y);
                    y += 5;

                    student.visits.slice(0, 5).forEach((visit) => {
                        checkNewPage(12);
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(60, 60, 60);
                        doc.setFontSize(8);

                        const visitDate = formatDate(visit.visited_at);
                        const location  = visit.location_name ? ` — ${visit.location_name}` : '';
                        const noteSnip  = visit.note
                            ? (visit.note.length > 60 ? visit.note.substring(0, 60) + '...' : visit.note)
                            : '';

                        doc.text(`• ${visitDate}${location}`, margin + 6, y);
                        y += 4;

                        if (noteSnip) {
                            doc.setTextColor(100, 100, 100);
                            doc.text(`  ${noteSnip}`, margin + 8, y);
                            y += 4;
                        }
                    });

                    if (student.visits.length > 5) {
                        doc.setTextColor(26, 82, 118);
                        doc.setFontSize(8);
                        doc.text(`  ...and ${student.visits.length - 5} more visits`, margin + 6, y);
                        y += 4;
                    }
                }

                y += 4;
                doc.setDrawColor(220, 220, 220);
                doc.line(margin, y, pageWidth - margin, y);
                y += 6;
            });

            // ── FOOTER on each page ───────────────────────────
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Mzumbe University — Field Attachment Report — Page ${i} of ${pageCount}`,
                    pageWidth / 2,
                    pageHeight - 8,
                    { align: 'center' }
                );
            }

            // ── SAVE ──────────────────────────────────────────
            const fileName = `field-attachment-report-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

        } catch (err) {
            console.error(err);
            setError('Failed to generate PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <Navbar />

            <div className="container">

                {/* Header */}
                <div className="welcome-card">
                    <div>
                        <h2 className="welcome-card__title">📄 Student Report</h2>
                        <p className="welcome-card__subtitle">
                            Generate a PDF report of all your students' field attachment progress
                        </p>
                    </div>
                    <div className="role-tag">🎓 Supervisor</div>
                </div>

                {/* Error */}
                {error && <div className="alert alert-error">⚠️ {error}</div>}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button
                        onClick={handlePreview}
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ flex: 1, marginTop: 0 }}
                    >
                        {loading && !preview ? '⏳ Loading...' : '👁️ Preview Report'}
                    </button>

                    {preview && (
                        <button
                            onClick={handleDownloadPDF}
                            disabled={loading}
                            className="btn btn-success"
                            style={{ flex: 1, marginTop: 0 }}
                        >
                            {loading ? '⏳ Generating PDF...' : '⬇️ Download PDF'}
                        </button>
                    )}
                </div>

                {/* Preview */}
                {preview && (
                    <div>
                        {/* Summary Cards */}
                        <div style={styles.summaryGrid}>
                            <div style={{ ...styles.summaryCard, borderTop: '3px solid #1a5276' }}>
                                <span style={styles.summaryIcon}>👥</span>
                                <span style={{ ...styles.summaryValue, color: '#1a5276' }}>{preview.total_students}</span>
                                <span style={styles.summaryLabel}>Total Students</span>
                            </div>
                            <div style={{ ...styles.summaryCard, borderTop: '3px solid #27ae60' }}>
                                <span style={styles.summaryIcon}>✅</span>
                                <span style={{ ...styles.summaryValue, color: '#27ae60' }}>{preview.total_assessed}</span>
                                <span style={styles.summaryLabel}>Assessed</span>
                            </div>
                            <div style={{ ...styles.summaryCard, borderTop: '3px solid #e74c3c' }}>
                                <span style={styles.summaryIcon}>⏳</span>
                                <span style={{ ...styles.summaryValue, color: '#e74c3c' }}>
                                    {preview.total_students - preview.total_assessed}
                                </span>
                                <span style={styles.summaryLabel}>Not Assessed</span>
                            </div>
                        </div>

                        {/* Student List Preview */}
                        <h3 style={{ margin: '20px 0 12px', fontSize: '16px', color: '#1a5276' }}>
                            Student Records Preview
                        </h3>

                        {preview.students.map((student, index) => {
                            const assessed = student.assessment.status === 'assessed';
                            return (
                                <div key={student.id} style={styles.studentCard}>
                                    <div style={styles.studentHeader}>
                                        <div style={styles.studentNumber}>{index + 1}</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={styles.studentName}>{student.name}</p>
                                            <p style={styles.studentEmail}>{student.email}</p>
                                        </div>
                                        <span className={`badge ${assessed ? 'badge--success' : 'badge--warning'}`}>
                                            {assessed ? '✅ Assessed' : '⏳ Not Assessed'}
                                        </span>
                                    </div>

                                    <div style={styles.studentMeta}>
                                        <span>📅 Registered: {formatDate(student.registered_at)}</span>
                                        <span>🏢 Visits: {student.total_visits}</span>
                                        {assessed && student.assessment.assessed_at && (
                                            <span>✅ Assessed: {formatDate(student.assessment.assessed_at)}</span>
                                        )}
                                    </div>

                                    {assessed && student.assessment.note && (
                                        <div style={styles.noteBox}>
                                            <strong>Assessment Note:</strong> {student.assessment.note}
                                        </div>
                                    )}

                                    {student.visits.length > 0 && (
                                        <div style={styles.visitList}>
                                            <p style={styles.visitTitle}>Visit History ({student.total_visits})</p>
                                            {student.visits.slice(0, 3).map((visit) => (
                                                <div key={visit.id} style={styles.visitItem}>
                                                    <span style={styles.visitDate}>{formatDate(visit.visited_at)}</span>
                                                    {visit.location_name && (
                                                        <span style={styles.visitLocation}>📍 {visit.location_name}</span>
                                                    )}
                                                    {visit.note && (
                                                        <p style={styles.visitNote}>{visit.note}</p>
                                                    )}
                                                </div>
                                            ))}
                                            {student.visits.length > 3 && (
                                                <p style={{ fontSize: '12px', color: '#7f8c8d', margin: '4px 0 0' }}>
                                                    ...and {student.visits.length - 3} more visits
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Download button at bottom */}
                        <button
                            onClick={handleDownloadPDF}
                            disabled={loading}
                            className="btn btn-success"
                            style={{ marginTop: '8px' }}
                        >
                            {loading ? '⏳ Generating PDF...' : '⬇️ Download PDF Report'}
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!preview && !loading && (
                    <div className="empty-box">
                        <p className="empty-box__icon">📄</p>
                        <p className="empty-box__text">
                            Click "Preview Report" to see your students' data before downloading
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}

const styles = {
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '8px',
    },
    summaryCard: {
        background: '#fff',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
    },
    summaryIcon:  { fontSize: '24px' },
    summaryValue: { fontSize: '28px', fontWeight: 800 },
    summaryLabel: { fontSize: '12px', color: '#7f8c8d', fontWeight: 600 },
    studentCard: {
        background: '#fff',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
        border: '1px solid #eaecee',
    },
    studentHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px',
    },
    studentNumber: {
        width: '30px', height: '30px',
        borderRadius: '50%',
        background: '#1a5276',
        color: '#fff',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700, fontSize: '13px',
        flexShrink: 0,
    },
    studentName:  { margin: 0, fontWeight: 700, fontSize: '15px', color: '#2c3e50' },
    studentEmail: { margin: '2px 0 0', fontSize: '13px', color: '#7f8c8d' },
    studentMeta: {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        fontSize: '12px',
        color: '#7f8c8d',
        marginBottom: '8px',
    },
    noteBox: {
        background: '#eafaf1',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '13px',
        color: '#1e8449',
        marginBottom: '10px',
    },
    visitList: {
        background: '#f8f9fa',
        borderRadius: '6px',
        padding: '10px 12px',
        marginTop: '8px',
    },
    visitTitle: {
        margin: '0 0 8px',
        fontSize: '12px',
        fontWeight: 700,
        color: '#2c3e50',
    },
    visitItem: {
        borderBottom: '1px solid #eee',
        paddingBottom: '6px',
        marginBottom: '6px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
    },
    visitDate:     { fontSize: '12px', fontWeight: 600, color: '#1a5276' },
    visitLocation: { fontSize: '12px', color: '#7f8c8d' },
    visitNote:     { margin: '4px 0 0', fontSize: '12px', color: '#555', width: '100%' },
};

export default Report;