import React, { useState, useEffect } from 'react';
import { recursosApi, solicitudesApi } from '../api';
import AlertaBanner from '../components/AlertaBanner';
import StatusBadge from '../components/StatusBadge';
import { ShieldCheck, Send } from 'lucide-react';

const DNI_OPERARIO = localStorage.getItem('mecapro_dni') || '77777777';

export default function EPPPage() {
  const [epps, setEpps] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [alerta, setAlerta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidades, setCantidades] = useState({});
  const [enviando, setEnviando] = useState(null);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [eppsRes, histRes] = await Promise.all([
        recursosApi.listarEpps(),
        solicitudesApi.historialOperario(DNI_OPERARIO)
      ]);
      setEpps(eppsRes.data);
      setHistorial(histRes.data.filter(s => s.tipoRecurso === 'EPP').slice(0, 10));
    } catch {
      setAlerta({ tipo: 'error', mensaje: 'Error al cargar catálogo de EPPs.' });
    } finally {
      setLoading(false);
    }
  };

  const solicitar = async (epp) => {
    const cantidad = cantidades[epp.idRecurso] || 1;
    setEnviando(epp.idRecurso);
    setAlerta(null);
    try {
      await solicitudesApi.crear({
        dniOperario: DNI_OPERARIO,
        idRecurso: epp.idRecurso,
        cantidad: Number(cantidad)
      });
      setAlerta({ tipo: 'success', mensaje: `✅ Solicitud enviada: ${cantidad}x ${epp.nombreEspecifico}. El área de SIG la recibirá en breve.` });
      cargar();
    } catch (err) {
      setAlerta({ tipo: 'error', mensaje: err.response?.data?.mensaje || 'Error al enviar solicitud.' });
    } finally {
      setEnviando(null);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  const categorias = [...new Set(epps.map(e => e.categoria))];

  return (
    <div>
      <h1 className="text-2xl font-black" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <ShieldCheck size={28} style={{ color: 'var(--green)' }} />
        Solicitud de EPPs — Área SIG
      </h1>

      {alerta && <AlertaBanner tipo={alerta.tipo} mensaje={alerta.mensaje} onClose={() => setAlerta(null)} />}

      {/* Catálogo por categoría */}
      {categorias.map(cat => (
        <div key={cat} className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">🛡️ {cat}</span>
          </div>
          <div className="grid-3">
            {epps.filter(e => e.categoria === cat).map(epp => (
              <div key={epp.idRecurso} style={{
                background: 'var(--bg-secondary)',
                border: `1px solid ${epp.stockActual <= epp.stockMinimo ? 'var(--red)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}>
                <div>
                  <div className="font-bold">{epp.nombreEspecifico}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: 4 }}>
                    Stock:{' '}
                    <span style={{ color: epp.stockActual <= epp.stockMinimo ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
                      {epp.stockActual} {epp.unidadMedida}
                    </span>
                    {epp.stockActual <= epp.stockMinimo && <span style={{ color: 'var(--red)' }}> ⚠️ BAJO</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="number"
                    min="1"
                    max={epp.stockActual}
                    value={cantidades[epp.idRecurso] || 1}
                    onChange={e => setCantidades(c => ({ ...c, [epp.idRecurso]: e.target.value }))}
                    className="form-control"
                    style={{ width: 70, minHeight: 42, textAlign: 'center' }}
                  />
                  <button
                    id={`btn-solicitar-epp-${epp.idRecurso}`}
                    onClick={() => solicitar(epp)}
                    disabled={enviando === epp.idRecurso || epp.stockActual === 0}
                    className="btn btn-success"
                    style={{ flex: 1, minHeight: 42 }}
                  >
                    <Send size={14} />
                    {enviando === epp.idRecurso ? '...' : 'Solicitar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Historial reciente */}
      {historial.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">📋 Mis Últimas Solicitudes EPP</span></div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>EPP</th>
                  <th>Cantidad</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historial.map(s => (
                  <tr key={s.idSolicitud}>
                    <td className="font-bold">{s.nombreRecurso}</td>
                    <td className="text-mono">{s.cantidad}</td>
                    <td><StatusBadge estado={s.estadoSolicitud} /></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(s.fechaSolicitud).toLocaleString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
