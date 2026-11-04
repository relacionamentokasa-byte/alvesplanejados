import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlvesLayout } from './components/AlvesLayout';
import { VisaoGeralPage } from './pages/VisaoGeral';
import { ClientesPage } from './pages/Clientes';
import { PropostasListPage } from './pages/PropostasList';
import { CriadorPropostaPage } from './pages/CriadorProposta';
import { PreviaPropostaPage } from './pages/PreviaProposta';
import { PropostaPublicaPage } from './pages/PropostaPublica';
import { ContratosPage } from './pages/Contratos';
import { FinanceiroPage } from './pages/Financeiro';
import { ConfiguracoesPage } from './pages/Configuracoes';
import { AlvesAuthProvider } from './context/AlvesAuthContext';

export function App() {
  return (
    <AlvesAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/p/:token" element={<PropostaPublicaPage />} />
          <Route path="/" element={<AlvesLayout><VisaoGeralPage /></AlvesLayout>} />
          <Route path="/clientes" element={<AlvesLayout><ClientesPage /></AlvesLayout>} />
          <Route path="/propostas" element={<AlvesLayout><PropostasListPage /></AlvesLayout>} />
          <Route path="/propostas/nova" element={<AlvesLayout><CriadorPropostaPage /></AlvesLayout>} />
          <Route path="/propostas/:id/editar" element={<AlvesLayout><CriadorPropostaPage /></AlvesLayout>} />
          <Route path="/propostas/:id/previa" element={<AlvesLayout><PreviaPropostaPage /></AlvesLayout>} />
          <Route path="/contratos" element={<AlvesLayout><ContratosPage /></AlvesLayout>} />
          <Route path="/financeiro" element={<AlvesLayout><FinanceiroPage /></AlvesLayout>} />
          <Route path="/configuracoes" element={<AlvesLayout><ConfiguracoesPage /></AlvesLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AlvesAuthProvider>
  );
}

export default App;
