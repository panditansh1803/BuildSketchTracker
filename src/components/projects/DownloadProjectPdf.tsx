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
}

export function DownloadProjectPdf({ project }: { project: ProjectData }) {

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

        // Notes Section
        const finalY = (doc as any).lastAutoTable.finalY + 10
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Notes:', 14, finalY)
        doc.setFont('helvetica', 'normal')

        const splitNotes = doc.splitTextToSize(project.notes || 'No notes available.', pageWidth - 28)
        doc.text(splitNotes, 14, finalY + 5)

        // --- SECTION C: AUDIT TRAIL ---
        const historyY = finalY + 15 + (splitNotes.length * 5)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Audit Trail (Full History)', 14, historyY)

        const historyBody = project.history.map(h => [
            new Date(h.createdAt).toLocaleString(),
            h.changedBy, // Assuming changedBy is a string name/email
            h.fieldName,
            h.oldValue || '-',
            h.newValue || '-'
        ])

        autoTable(doc, {
            startY: historyY + 5,
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
        <Button onClick={generatePDF} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Export Full Project Report
        </Button>
    )
}
