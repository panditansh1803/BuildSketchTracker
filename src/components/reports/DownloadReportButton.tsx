'use client'

import { Button } from '@/components/ui/button'
import { FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'

type Project = {
    projectId: string
    name: string
    stage: string
    status: string
    percentComplete: number
    targetFinish: Date
}

export function DownloadReportButton({ projects }: { projects: Project[] }) {
    const [isLoading, setIsLoading] = useState(false)

    async function generatePDF() {
        setIsLoading(true)
        try {
            // Dynamic import - loads jsPDF only when user clicks download
            const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
                import('jspdf'),
                import('jspdf-autotable')
            ])

            const doc = new jsPDF()

            // Header
            doc.setFontSize(20)
            doc.text('BuildSketch Project Report', 14, 22)
            doc.setFontSize(11)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

            // Summary
            const active = projects.filter(p => p.status === 'ACTIVE').length
            const completed = projects.filter(p => p.status === 'COMPLETED').length

            doc.text(`Active Projects: ${active}`, 14, 40)
            doc.text(`Completed Projects: ${completed}`, 14, 46)

            // Table
            const tableData = projects.map(p => [
                p.projectId,
                p.name,
                p.stage,
                `${p.percentComplete}%`,
                p.status,
                new Date(p.targetFinish).toLocaleDateString()
            ])

            autoTable(doc, {
                startY: 55,
                head: [['ID', 'Name', 'Stage', 'Progress', 'Status', 'Target Finish']],
                body: tableData,
            })

            doc.save('buildsketch-report.pdf')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button variant="outline" size="sm" className="gap-1" onClick={generatePDF} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {isLoading ? 'Generating...' : 'Download Report'}
        </Button>
    )
}
