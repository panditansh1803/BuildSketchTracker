'use client'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Define types locally since we might not have a shared type file with all relations perfect
type ProjectData = {
    projectId: string
    name: string
    houseType: string
    stage: string
    percentComplete: number
    status: string
    // Dates
    startDate: Date
    targetFinish: Date
    actualFinish: Date | null
    // Notes
    notes: string | null
    // Relations
    assignedTo: { name: string | null } | null
    history: {
        createdAt: Date
        changedBy: string
        fieldName: string
        oldValue: string | null
        newValue: string | null
    }[]
    documents: { name: string, url: string, type: string }[]
    photos: { url: string, stage: string, caption: string | null }[]
}

type TimeStats = {
    totalMinutes: number
    userStats: { name: string, minutes: number }[]
}

export function DownloadProjectPdf({ project, timeStats }: { project: ProjectData, timeStats: TimeStats }) {

    function generatePDF() {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()

        // --- SECTION A: HEADER ---
        doc.setFontSize(18)
        doc.text('Project Detail Report', 14, 20)

        doc.setFontSize(12)
        doc.setTextColor(100)
        doc.text(`${project.name} (${project.projectId})`, 14, 28)

        doc.setFontSize(10)
        doc.setTextColor(150)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34)

        // --- SECTION B: EXECUTIVE SUMMARY (Grid) ---
        doc.setTextColor(0)
        doc.setFontSize(14)
        doc.text('Executive Summary', 14, 45)

        const summaryData = [
            ['House Type', project.houseType, 'Assigned To', project.assignedTo?.name || '-'],
            ['Stage', project.stage, 'Start Date', new Date(project.startDate).toLocaleDateString()],
            ['% Complete', `${project.percentComplete}%`, 'Target Finish', new Date(project.targetFinish).toLocaleDateString()],
            ['Status', project.status, 'Actual Finish', project.actualFinish ? new Date(project.actualFinish).toLocaleDateString() : 'Pending'],
        ]

        autoTable(doc, {
            startY: 50,
            head: [],
            body: summaryData,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 40 },
                2: { fontStyle: 'bold', cellWidth: 40 }
            }
        })

        let currentY = (doc as any).lastAutoTable.finalY + 10

        // --- SECTION C: TIME TRACKING ---
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Time & Efficiency Analytics', 14, currentY)

        const totalHours = (timeStats.totalMinutes / 60).toFixed(1)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Total Recorded Time: ${totalHours} Hours`, 14, currentY + 6)

        const timeData = timeStats.userStats.map(s => [
            s.name,
            `${Math.floor(s.minutes / 60)}h ${s.minutes % 60}m`,
            `${((s.minutes / timeStats.totalMinutes) * 100).toFixed(1)}%`
        ])

        if (timeData.length > 0) {
            autoTable(doc, {
                startY: currentY + 10,
                head: [['Employee', 'Time Spent', 'Contribution']],
                body: timeData,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [41, 128, 185] }
            })
            currentY = (doc as any).lastAutoTable.finalY + 10
        } else {
            doc.text('No time logs recorded.', 14, currentY + 12)
            currentY += 20
        }

        // --- SECTION D: DIGITAL ASSETS ---
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Digital Assets & Files', 14, currentY)

        const docData = project.documents.map(d => [d.name, d.type, 'Link'])

        if (docData.length > 0) {
            autoTable(doc, {
                startY: currentY + 5,
                head: [['Document Name', 'Type', 'Access']],
                body: docData,
                styles: { fontSize: 9 },
                didDrawCell: (data) => {
                    if (data.section === 'body' && data.column.index === 2) {
                        const url = project.documents[data.row.index].url
                        // Add link (simplified for now, full URL might be relative)
                        // doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: window.location.origin + url })
                    }
                }
            })
            currentY = (doc as any).lastAutoTable.finalY + 10
        } else {
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(10)
            doc.text('No documents uploaded.', 14, currentY + 8)
            currentY += 15
        }

        // --- SECTION E: NOTES ---
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Project Notes', 14, currentY)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)

        const splitNotes = doc.splitTextToSize(project.notes || 'No notes available.', pageWidth - 28)
        doc.text(splitNotes, 14, currentY + 6)

        currentY += 15 + (splitNotes.length * 5)

        // --- SECTION F: AUDIT TRAIL ---
        // Check for page break
        if (currentY > 250) {
            doc.addPage()
            currentY = 20
        }

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Audit Trail (History)', 14, currentY)

        const historyBody = project.history.map(h => [
            new Date(h.createdAt).toLocaleString(),
            h.changedBy,
            h.fieldName,
            h.oldValue || '-',
            h.newValue || '-'
        ])

        autoTable(doc, {
            startY: currentY + 5,
            head: [['Date', 'Changed By', 'Field', 'Old Value', 'New Value']],
            body: historyBody,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 66, 66] },
            alternateRowStyles: { fillColor: [240, 240, 240] }
        })

        // Footer / Download
        doc.save(`Project_Report_${project.projectId}_${new Date().toISOString().split('T')[0]}.pdf`)
    }

    return (
        <Button onClick={generatePDF} variant="outline" className="gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white border-0 hover:from-gray-700 hover:to-gray-800">
            <FileText className="h-4 w-4" />
            Download PDF Report
        </Button>
    )
}

