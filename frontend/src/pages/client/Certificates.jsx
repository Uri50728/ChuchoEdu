import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

function generateCertificatePDF(cert, userName) {
  return import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const W = 297, H = 210

    // Background gradient simulation
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, W, H, 'F')

    // Decorative border
    doc.setDrawColor(14, 165, 233)
    doc.setLineWidth(1.5)
    doc.rect(10, 10, W - 20, H - 20)
    doc.setLineWidth(0.5)
    doc.setDrawColor(56, 189, 248)
    doc.rect(13, 13, W - 26, H - 26)

    // Corner decorations
    const corners = [[15, 15], [W - 15, 15], [15, H - 15], [W - 15, H - 15]]
    corners.forEach(([x, y]) => {
      doc.setFillColor(14, 165, 233)
      doc.circle(x, y, 2, 'F')
    })

    // Header
    doc.setTextColor(14, 165, 233)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('EDUPLATFORM', W / 2, 30, { align: 'center' })

    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('CERTIFICADO DE FINALIZACIÓN', W / 2, 38, { align: 'center' })

    // Divider
    doc.setDrawColor(14, 165, 233)
    doc.setLineWidth(0.3)
    doc.line(60, 43, W - 60, 43)

    // Main text
    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.text('Este certificado se otorga a', W / 2, 62, { align: 'center' })

    doc.setTextColor(248, 250, 252)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(32)
    doc.text(userName, W / 2, 82, { align: 'center' })

    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.text('por haber completado satisfactoriamente el curso', W / 2, 96, { align: 'center' })

    doc.setTextColor(56, 189, 248)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text(cert.course.title, W / 2, 114, { align: 'center' })

    doc.setTextColor(148, 163, 184)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`Impartido por: ${cert.course.teacher?.name} · ${cert.course.teacher?.specialty}`, W / 2, 126, { align: 'center' })

    // Footer
    doc.setDrawColor(56, 189, 248)
    doc.setLineWidth(0.3)
    doc.line(60, 155, W - 60, 155)

    const issued = new Date(cert.issuedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(9)
    doc.text(`Fecha de emisión: ${issued}`, W / 2, 165, { align: 'center' })
    doc.text(`ID: CERT-${cert.id.toString().padStart(6, '0')}`, W / 2, 172, { align: 'center' })

    doc.save(`Certificado-${cert.course.title.replace(/\s+/g, '-')}.pdf`)
  })
}

export default function Certificates() {
  const { user } = useAuth()
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    api.get('/users/certificates').then(r => setCerts(r.data)).finally(() => setLoading(false))
  }, [])

  const download = async (cert) => {
    setDownloading(cert.id)
    try {
      await generateCertificatePDF(cert, user.name)
    } catch (err) {
      console.error(err)
      alert('Error al generar el certificado')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  return (
    <div className="animate-fade-in">
      <h1 className="font-display font-bold text-3xl mb-2">Mis certificados</h1>
      <p className="text-slate-500 mb-8">Tus logros académicos</p>

      {certs.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏆</div>
          <p className="font-semibold text-slate-600 dark:text-slate-400">Aún no tienes certificados</p>
          <p className="text-slate-400 text-sm mt-1">Completa un curso y califica tu experiencia</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certs.map(cert => (
            <div key={cert.id} className="card p-6 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 shrink-0">
                🏆
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold truncate">{cert.course.title}</h3>
                <p className="text-sm text-slate-500">{cert.course.teacher?.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(cert.issuedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => download(cert)}
                disabled={downloading === cert.id}
                className="btn-secondary text-sm shrink-0">
                {downloading === cert.id ? '⏳' : '⬇ PDF'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
