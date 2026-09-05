import { GovSubmission, Company, DigitalCertificate } from '../types';

export interface TransmissionResult {
  submission: GovSubmission;
  success: boolean;
  message: string;
}

export function createGovSubmission(
  company: Company,
  sistema: 'ESOCIAL' | 'REINF' | 'SEFAZ',
  evento: string,
  competencia: string
): GovSubmission {
  const cleanCnpj = company.cnpj.replace(/\D/g, '');
  const idKey = `${sistema.toLowerCase()}-${evento.replace(/\s+/g, '')}-${cleanCnpj}-${competencia.replace('/', '')}-${Date.now()}`;

  return {
    id: `sub-${Date.now()}`,
    companyId: company.id,
    sistema,
    evento,
    competencia,
    estado: 'CRIADO',
    tentativas: 0,
    idempotencyKey: idKey,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
}

export async function processGovSubmissionMock(
  submission: GovSubmission,
  certificate?: DigitalCertificate,
  forceFail: boolean = false
): Promise<TransmissionResult> {
  // Step 1: Sign with A1 Certificate
  if (!certificate || certificate.status === 'EXPIRADO') {
    return {
      submission: {
        ...submission,
        estado: 'REJEITADO',
        tentativas: submission.tentativas + 1,
        codigoResposta: 'MS1029',
        mensagemResposta: 'Falha na assinatura digital: Certificado A1 não encontrado ou expirado.',
        atualizadoEm: new Date().toISOString(),
      },
      success: false,
      message: 'Certificado A1 inválido ou inexistente.',
    };
  }

  // Simulate network backoff/transmission delay
  submission.estado = 'ASSINADO';
  submission.tentativas += 1;

  if (forceFail) {
    return {
      submission: {
        ...submission,
        estado: 'REJEITADO',
        codigoResposta: 'ERR-403',
        mensagemResposta: 'Rejeição SEFAZ: Falha de schema XML ou divergência cadastral do contribuinte.',
        atualizadoEm: new Date().toISOString(),
      },
      success: false,
      message: 'Lote rejeitado pelo webservice do órgão.',
    };
  }

  // Simulate authorization
  const randomProt = Math.floor(10000000 + Math.random() * 90000000);
  const randomRec = Math.floor(1000000000 + Math.random() * 9000000000);
  const protocolo = `1.2.${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}.${randomProt}-0`;
  const recibo = `REC-${submission.sistema}-${certificate.subjectCnpj ? certificate.subjectCnpj.slice(0, 4) : 'BR'}-${randomRec}`;

  const updated: GovSubmission = {
    ...submission,
    estado: 'AUTORIZADO',
    protocolo,
    recibo,
    codigoResposta: '201',
    mensagemResposta: `Lote de eventos ${submission.evento} recepcionado e validado com êxito pelo ambiente oficial de transmissão.`,
    atualizadoEm: new Date().toISOString(),
  };

  return {
    submission: updated,
    success: true,
    message: `Transmissão autorizada com sucesso! Recibo: ${recibo}`,
  };
}
