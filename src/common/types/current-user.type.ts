export interface CurrentUserType {
  id: string;
  companyId: number;
  role: {
    id: number;
    code: string;
  };
}
