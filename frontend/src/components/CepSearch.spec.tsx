import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CepSearch } from './CepSearch';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);
afterEach(() => vi.clearAllMocks());

describe('Feature: busca de endereço por CEP', () => {
  it('Given um CEP válido, When busca, Then exibe o endereço retornado', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        complemento: 'lado ímpar',
        unidade: '',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
        estado: 'São Paulo',
        regiao: 'Sudeste',
        ddd: '11',
      },
    });
    const user = userEvent.setup();
    render(<CepSearch />);
    await user.type(screen.getByLabelText('CEP'), '01001000');
    await user.click(screen.getByRole('button', { name: 'Buscar endereço' }));
    expect(await screen.findByText('Praça da Sé')).toBeInTheDocument();
    expect(screen.getByText(/São Paulo · SP/)).toBeInTheDocument();
  });
  it('Given um CEP incompleto, When busca, Then informa o erro sem chamar a API', async () => {
    const user = userEvent.setup();
    render(<CepSearch />);
    await user.type(screen.getByLabelText('CEP'), '123');
    await user.click(screen.getByRole('button', { name: 'Buscar endereço' }));
    expect(screen.getByRole('alert')).toHaveTextContent('8 números');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});
