// src/components/pages/Abastecimento.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { abastecimentoAPI, veiculoAPI } from '../../api';
import { Card, CardHeader, Table, Btn, Input, Select, FormGrid, PageLoading } from '../ui';
import { fmt } from '../../utils';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function pilConsumo(v) {
  if (!v) return { label: '—', color: '#484f58' };
  if (v >= 2.8) return { label: `${v} km/L`, color: '#3fb950' };
  if (v >= 2.3) return { label: `${v} km/L`, color: '#f0a500' };
  return { label: `${v} km/L`, color: '#f85149' };
}

export default function Abastecimento() {
  const { data: veiculos }                  = useFetch(() => veiculoAPI.listar());
  const { data, loading, refetch }          = useFetch(() => abastecimentoAPI.listar({ limit: 30 }));
  const { data: resumo }                    = useFetch(() => abastecimentoAPI.resumo({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() }));
  const { executar: criar, loading: saving} = useMutation(abastecimentoAPI.criar);

  const [form, setForm] = useState({
    veiculoId: '', data: new Date().toISOString().slice(0, 10),
    kmAtual: '', litros: '', valorTotal: '', posto: '',
    litrosArla: '', valorArla: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.veiculoId) { toast.error('Selecione um veículo'); return; }
    await criar({
      ...form,
      kmAtual: Number(form.kmAtual),
      litros: Number(form.litros),
      valorTotal: Number(form.valorTotal),
      litrosArla: form.litrosArla ? Number(form.litrosArla) : null,
      valorArla: form.valorArla ? Number(form.valorArla) : null,
    });
    toast.success('Abastecimento registrado!');
    setForm(p => ({ ...p, kmAtual: '', litros: '', valorTotal: '', posto: '', litrosArla: '', valorArla: '' }));
    refetch();
  }

  const columns = [
    { key: 'data',        label: 'Data',    render: r => fmt.data(r.data) },
    { key: 'veiculo',     label: 'Veículo', render: r => `${r.veiculo?.modelo} · ${r.veiculo?.placa}${r.veiculo?.motorista ? ` · ${r.veiculo.motorista}` : ''}`.toUpperCase() },
    { key: 'kmAtual',     label: 'KM',      mono: true, render: r => fmt.km(r.kmAtual) },
    { key: 'litros',      label: 'Litros',  mono: true, render: r => `${fmt.numero(r.litros)} L` },
    { key: 'valorTotal',  label: 'Valor',   mono: true, render: r => fmt.moeda(r.valorTotal) },
    { key: 'litrosArla',  label: 'Arla',    mono: true, render: r => r.litrosArla ? `${fmt.numero(r.litrosArla)} L` : '—' },
    { key: 'consumoKmL',  label: 'Consumo', render: r => {
        const p = pilConsumo(r.consumoKmL);
        return <span style={{ color: p.color, fontFamily: "'DM Mono'" }}>{p.label}</span>;
    }},
    { key: 'posto',       label: 'Posto',   render: r => (r.posto || '—').toUpperCase() },
  ];

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Abastecimento</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* FORMULÁRIO */}
        <Card>
          <CardHeader icon="⛽" title="Registrar abastecimento" />
          <form onSubmit={handleSubmit} style={{ padding: 16 }}>
            <FormGrid>
              <Select label="Veículo" value={form.veiculoId} onChange={e => set('veiculoId', e.target.value)} required>
                <option value="">Selecione...</option>
                {(veiculos || []).map(v => (
                  <option key={v.id} value={v.id}>
                    {v.modelo} · {v.placa}{v.motorista ? ` · ${v.motorista}` : ''}
                  </option>
                ))}
              </Select>
              <Input label="Data" type="date" value={form.data} onChange={e => set('data', e.target.value)} required />
              <Input label="KM atual" type="number" placeholder="142.800" value={form.kmAtual} onChange={e => set('kmAtual', e.target.value)} required />
              <Input label="Litros Diesel" type="number" step="0.01" placeholder="320" value={form.litros} onChange={e => set('litros', e.target.value)} required />
              <Input label="Valor total Diesel (R$)" type="number" step="0.01" placeholder="1920.00" value={form.valorTotal} onChange={e => set('valorTotal', e.target.value)} required />
              <Input label="Posto" placeholder="Nome do posto" value={form.posto} onChange={e => set('posto', e.target.value)} />
              <Input label="Litros Arla (opcional)" type="number" step="0.01" placeholder="0" value={form.litrosArla} onChange={e => set('litrosArla', e.target.value)} />
              <Input label="Valor Arla (R$) (opcional)" type="number" step="0.01" placeholder="0.00" value={form.valorArla} onChange={e => set('valorArla', e.target.value)} />
            </FormGrid>
            <Btn type="submit" loading={saving} style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
              Salvar abastecimento
            </Btn>
          </form>
        </Card>

        {/* GRÁFICO CONSUMO */}
        <Card>
          <CardHeader icon="📈" title="Consumo médio por veículo (km/L)" />
          <div style={{ padding: 16, height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(resumo || []).map(r => ({
                placa: r.veiculo?.placa,
                consumo: r.mediaConsumo,
              }))}>
                <XAxis dataKey="placa" tick={{ fill: '#484f58', fontSize: 10, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#484f58', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 4]} />
                <Tooltip formatter={v => [`${v} km/L`, 'Consumo']} contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="consumo" radius={[5,5,0,0]} fill="#f0a500"
                  label={{ position: 'top', fill: '#8b949e', fontSize: 10, formatter: v => v ? `${v}` : '' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* HISTÓRICO */}
      <Card>
        <CardHeader icon="🕐" title="Histórico de abastecimentos" />
        <Table columns={columns} rows={data?.registros || []} loading={loading} />
      </Card>
    </div>
  );
}
