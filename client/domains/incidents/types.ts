export interface Incident {
  id: string;
  employeeId: string;
  employeeName: string;
  description: string;
  date: string;
  signedBy: string[]; // nomes dos interessados
  documentRef: string; // referência da ata gerada
}
