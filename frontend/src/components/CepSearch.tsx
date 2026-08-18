import axios from 'axios';
import { FormEvent, useRef, useState } from 'react';
import { buscarCep } from '../services/api';
import type { Endereco } from '../types';

export function CepSearch() {
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const formatted = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/^(\d{5})(\d)/, '$1-$2');
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) {
      setError('Digite um CEP válido com 8 números.');
      setEndereco(null);
      return;
    }
    controller.current?.abort();
    controller.current = new AbortController();
    setLoading(true);
    setError('');
    setEndereco(null);
    try {
      setEndereco(await buscarCep(digits, controller.current.signal));
    } catch (err) {
      if (!axios.isCancel(err))
        setError(
          err instanceof Error ? err.message : 'Não foi possível consultar o CEP. Tente novamente.',
        );
    } finally {
      setLoading(false);
    }
  }
  return (
    <section className="card cep-card" aria-labelledby="cep-title">
      <div className="eyebrow">Consulta rápida</div>
      <h2 id="cep-title">Encontre um endereço</h2>
      <p className="muted">Informe os oito números do CEP para consultar a base ViaCEP.</p>
      <form onSubmit={submit} noValidate>
        <label htmlFor="cep">CEP</label>
        <div className="input-row">
          <input
            id="cep"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => {
              setCep(formatted(e.target.value));
              setError('');
            }}
            aria-describedby={error ? 'cep-error' : 'cep-help'}
            aria-invalid={!!error}
          />
          <button disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Buscando…
              </>
            ) : (
              'Buscar endereço'
            )}
          </button>
        </div>
        <small id="cep-help">Exemplo: 01001-000</small>
      </form>
      <div aria-live="polite">
        {error && (
          <div className="alert" id="cep-error" role="alert">
            {error}
          </div>
        )}
        {endereco && (
          <article className="result">
            <span className="result-pin">⌖</span>
            <div>
              <strong>{endereco.logradouro || 'Logradouro não informado'}</strong>
              <p>
                {[endereco.bairro, endereco.localidade, endereco.uf].filter(Boolean).join(' · ')}
              </p>
              <small>
                CEP {endereco.cep}
                {endereco.complemento ? ` · ${endereco.complemento}` : ''}
              </small>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
