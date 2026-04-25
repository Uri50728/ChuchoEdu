import { useEffect, useState } from 'react'
import api from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

async function generatePDF(cert, userName) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = 297, H = 210

  doc.setFillColor(15, 23, 42); doc.rect(0, 0, W, H, 'F')
  doc.setDrawColor(14, 165, 233); doc.setLineWidth(1); doc.rect(10, 10, W-20, H-20)

  doc.setTextColor(14, 165, 233); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
  doc.text('EDUPLATFORM', W/2, 28, { align: 'center' })
  doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
  doc.text('CERTIFICADO DE FINALIZACION', W/2, 36, { align: 'center' })

  doc.setDrawColor(30, 41, 59); doc.setLineWidth(0.2); doc.line(60, 40, W-60, 40)

  doc.setTextColor(100, 116, 139); doc.setFontSize(11)
  doc.text('Este certificado se otorga a', W/2, 58, { align: 'center' })
  doc.setTextColor(248, 250, 252); doc.setFont('helvetica', 'bold'); doc.setFontSize(30)
  doc.text(userName, W/2, 78, { align: 'center' })

  doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
  doc.text('por haber completado el curso', W/2, 92, { align: 'center' })
  doc.setTextColor(56, 189, 248); doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
  doc.text(cert.course.title, W/2, 108, { align: 'center' })

  doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
  doc.text(`Impartido por ${cert.course.teacher?.name}`, W/2, 120, { align: 'center' })

  doc.setDrawColor(30, 41, 59); doc.setLineWidth(0.2); doc.line(60, 148, W-60, 148)
  const date = new Date(cert.issuedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.setTextColor(71, 85, 105); doc.setFontSize(8)
  doc.text(`Fecha: ${date}  |  ID: CERT-${String(cert.id).padStart(6,'0')}`, W/2, 158, { align: 'center' })

  doc.save(`Certificado-${cert.course.title.replace(/\s+/g,'-')}.pdf`)
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
    try { await generatePDF(cert, user.name) }
    catch { alert('Error al generar el certificado') }
    finally { setDownloading(null) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="page-title">Certificados</h1>
      <p className="page-subtitle">Tus logros academicos</p>

      {certs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">Aun no tienes certificados</p>
          <p className="text-slate-400 text-xs mt-1">Completa un curso y califica tu experiencia</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certs.map(cert => (
            <div key={cert.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <span className="text-amber-600 dark:text-amber-400 font-bold text-lg">C</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{cert.course.title}</p>
                <p className="text-xs text-slate-500">{cert.course.teacher?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(cert.issuedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button onClick={() => download(cert)} disabled={downloading === cert.id} className="btn-secondary text-xs shrink-0">
                {downloading === cert.id ? 'Generando...' : 'Descargar PDF'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
