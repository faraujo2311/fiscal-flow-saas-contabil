/**
 * Serviço de Sincronização Automática em Segundo Plano (Background Auto-Sync)
 * Garante que qualquer alteração no estado da aplicação seja persistida
 * automaticamente no banco de dados Supabase sem necessidade de ação manual.
 */

import { 
  syncAllEntitiesToSupabase, 
  SyncProgressItem 
} from './supabaseClient';
import { 
  Company, 
  FiscalDocument, 
  AccountingEntry, 
  AccountingAccount, 
  Employee, 
  PayrollPayslip, 
  Partner, 
  ProfitDistributionRecord, 
  TaxObligation, 
  AccountingParameters, 
  SystemCustomization, 
  SystemUser, 
  UserActivityBacklog 
} from '../types';

export type AutoSyncStatus = 'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR';

export interface AutoSyncState {
  status: AutoSyncStatus;
  lastSyncedAt: Date | null;
  errorMessage?: string;
  tablesCount: number;
}

let syncTimeout: any = null;
let isCurrentlySyncing = false;

/**
 * Dispara uma sincronização em background com debounce (padrão 3 segundos).
 * Permite que múltiplas alterações seguidas sejam agregadas em uma única requisição.
 */
export function scheduleAutoSync(
  payload: {
    companies: Company[];
    documents: FiscalDocument[];
    entries: AccountingEntry[];
    accounts: AccountingAccount[];
    employees: Employee[];
    payslips: PayrollPayslip[];
    partners: Partner[];
    distributions: ProfitDistributionRecord[];
    obligations: TaxObligation[];
    accountingParameters: AccountingParameters;
    customization: SystemCustomization;
    users: SystemUser[];
    userBacklog: UserActivityBacklog[];
  },
  onStatusChange: (state: AutoSyncState) => void,
  debounceMs = 3000
) {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    if (isCurrentlySyncing) return;

    try {
      isCurrentlySyncing = true;
      onStatusChange({
        status: 'SYNCING',
        lastSyncedAt: null,
        tablesCount: 13,
      });

      const result = await syncAllEntitiesToSupabase(
        payload.companies,
        payload.documents,
        payload.entries,
        payload.accounts,
        payload.employees,
        payload.payslips,
        payload.partners,
        payload.distributions,
        payload.obligations,
        payload.accountingParameters,
        payload.customization,
        payload.users,
        payload.userBacklog
      );

      if (result.success) {
        onStatusChange({
          status: 'SYNCED',
          lastSyncedAt: new Date(),
          tablesCount: 13,
        });
      } else {
        onStatusChange({
          status: 'ERROR',
          lastSyncedAt: null,
          errorMessage: result.errors[0] || 'Algumas tabelas não puderam ser sincronizadas',
          tablesCount: 13,
        });
      }
    } catch (err: any) {
      onStatusChange({
        status: 'ERROR',
        lastSyncedAt: null,
        errorMessage: err?.message || 'Falha de conexão com o banco',
        tablesCount: 13,
      });
    } finally {
      isCurrentlySyncing = false;
    }
  }, debounceMs);
}
