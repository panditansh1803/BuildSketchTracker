'use client'

import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type Project = {
    projectId: string
    name: string
    houseType: string
    stage: string
    assignedTo?: { name: string } | null
    startDate: Date
    targetFinish: Date
    actualFinish?: Date | null
    status: string
    percentComplete: number
    notes?: string | null
}

export function DownloadReportButton({ projects }: { projects: Project[] }) {
    function generatePDF() {
        const doc = new jsPDF()

        // Title
        doc.setFontSize(18)
        doc.text(`Daily Project Report - ${new Date().toLocaleDateString()}`, 14, 20)

        // Metadata
        doc.setFontSize(10)
        doc.text(`Total Active Projects: ${projects.filter(p => p.status === 'ACTIVE' || p.status === 'On Track').length}`, 14, 30)

        // Table
        const tableBody = projects.map(p => [
            p.projectId,
            p.name,
            p.houseType,
            p.stage,
            p.assignedTo?.name || '-',
            new Date(p.startDate).toLocaleDateString(),
            new Date(p.targetFinish).toLocaleDateString(),
            p.actualFinish ? new Date(p.actualFinish).toLocaleDateString() : '-',
            p.status,
            `${p.percentComplete}%`,
            p.notes || '-'
        ])

        autoTable(doc, {
            startY: 40,
            head: [['ProjID', 'Name', 'Type', 'Stage', 'Assigned', 'Start', 'Target', 'Actual', 'Status', '%', 'Notes']],
            body: tableBody,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 66, 66] }
        })

        doc.save(`daily-report-${new Date().toISOString().split('T')[0]}.pdf`)
    }

    return (
        <Button onClick={generatePDF} variant="outline" size="sm" className="gap-2">
            <FileDown className="h-4 w-4" />
            Download Daily Report
        </Button>
    )
}
